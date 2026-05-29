import {
  createAccessRequest,
  deleteAccessRequest,
  getAccessRequests,
  getUsers,
} from "./apiClient";
import type {
  AccessRequestResponseDto,
  ApiClientError,
  CreateAccessRequestRequestDto,
  EntityStatusFilter,
  UserResponseDto,
} from "./dtos";

const formEl = document.querySelector<HTMLFormElement>("#accessRequestForm");
const tableBodyEl = document.querySelector<HTMLTableSectionElement>("#accessRequestsTableBody");
const emptyStateEl = document.querySelector<HTMLElement>("#emptyState");

const userIdInputEl = document.querySelector<HTMLSelectElement>("#userIdInput");
const startDateTimeInputEl = document.querySelector<HTMLInputElement>("#startDateTimeInput");
const endDateTimeInputEl = document.querySelector<HTMLInputElement>("#endDateTimeInput");
const statusInputEl = document.querySelector<HTMLSelectElement>("#statusInput");
const commentsInputEl = document.querySelector<HTMLTextAreaElement>("#commentsInput");

const userIdErrorEl = document.querySelector<HTMLElement>("#userIdError");
const startDateTimeErrorEl = document.querySelector<HTMLElement>("#startDateTimeError");
const endDateTimeErrorEl = document.querySelector<HTMLElement>("#endDateTimeError");
const statusErrorEl = document.querySelector<HTMLElement>("#statusError");
const commentsErrorEl = document.querySelector<HTMLElement>("#commentsError");

const submitBtnEl = document.querySelector<HTMLButtonElement>("#submitBtn");
const resetBtnEl = document.querySelector<HTMLButtonElement>("#resetBtn");

const searchInputEl = document.querySelector<HTMLInputElement>("#searchInput");
const userFilterEl = document.querySelector<HTMLSelectElement>("#userFilter");
const statusFilterGroupEl = document.querySelector<HTMLElement>("#statusFilterGroup");
const clearFiltersBtnEl = document.querySelector<HTMLButtonElement>("#clearFiltersBtn");

let usersState: UserResponseDto[] = [];
let requestsState: AccessRequestResponseDto[] = [];

function setText(el: HTMLElement | null, text: string): void {
  if (el) {
    el.textContent = text;
  }
}

function showMessage(text: string): void {
  if (!emptyStateEl) return;

  emptyStateEl.hidden = false;
  emptyStateEl.textContent = text;
}

function clearErrors(): void {
  setText(userIdErrorEl, "");
  setText(startDateTimeErrorEl, "");
  setText(endDateTimeErrorEl, "");
  setText(statusErrorEl, "");
  setText(commentsErrorEl, "");
}

function getSelectedStatusFilter(): EntityStatusFilter {
  const checked = document.querySelector<HTMLInputElement>(
    'input[name="statusFilter"]:checked',
  );
  const value = checked?.value;

  if (value === "deleted" || value === "all") {
    return value;
  }

  return "active";
}

function getUserNameById(userId: number): string {
  const user = usersState.find((item) => item.id === userId);
  return user?.fullName ?? String(userId);
}

function appendOption(
  select: HTMLSelectElement,
  value: string,
  label: string,
): void {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  select.appendChild(option);
}

function fillUsersSelects(): void {
  if (userIdInputEl) {
    userIdInputEl.replaceChildren();
    appendOption(userIdInputEl, "", "Оберіть користувача");
  }

  if (userFilterEl) {
    userFilterEl.replaceChildren();
    appendOption(userFilterEl, "", "Усі користувачі");
  }

  for (const user of usersState) {
    const label = `${user.fullName} (${user.email})`;

    if (userIdInputEl) {
      appendOption(userIdInputEl, String(user.id), label);
    }

    if (userFilterEl) {
      appendOption(userFilterEl, String(user.id), label);
    }
  }
}

function readForm(): CreateAccessRequestRequestDto {
  return {
    userId: Number(userIdInputEl?.value ?? 0),
    startDateTime: startDateTimeInputEl?.value.trim() ?? "",
    endDateTime: endDateTimeInputEl?.value.trim() ?? "",
    status: (statusInputEl?.value ??
      "pending") as CreateAccessRequestRequestDto["status"],
    comments: commentsInputEl?.value.trim() ?? "",
  };
}

function validate(dto: CreateAccessRequestRequestDto): boolean {
  clearErrors();

  let isValid = true;

  if (!Number.isFinite(dto.userId) || dto.userId <= 0) {
    setText(userIdErrorEl, "Оберіть користувача.");
    isValid = false;
  }

  if (!dto.startDateTime) {
    setText(startDateTimeErrorEl, "Вкажіть початок доступу.");
    isValid = false;
  }

  if (!dto.endDateTime) {
    setText(endDateTimeErrorEl, "Вкажіть завершення доступу.");
    isValid = false;
  }

  if (dto.startDateTime && dto.endDateTime) {
    const start = new Date(dto.startDateTime).getTime();
    const end = new Date(dto.endDateTime).getTime();

    if (end <= start) {
      setText(endDateTimeErrorEl, "Завершення має бути пізніше за початок.");
      isValid = false;
    }

    const maxDurationMs = 5 * 60 * 60 * 1000;

    if (end - start > maxDurationMs) {
      setText(endDateTimeErrorEl, "Доступ не може тривати більше 5 годин.");
      isValid = false;
    }
  }

  if (!dto.status) {
    setText(statusErrorEl, "Оберіть статус.");
    isValid = false;
  }

  if (dto.comments.length < 3) {
    setText(commentsErrorEl, "Коментар має містити мінімум 3 символи.");
    isValid = false;
  }

  if (dto.comments.length > 300) {
    setText(commentsErrorEl, "Коментар не може бути довшим за 300 символів.");
    isValid = false;
  }

  return isValid;
}

function getVisibleRequests(): AccessRequestResponseDto[] {
  const search = searchInputEl?.value.trim().toLowerCase() ?? "";
  const userIdFilter = userFilterEl?.value ?? "";

  return requestsState.filter((request) => {
    const matchesSearch =
      !search || request.comments.toLowerCase().includes(search);

    const matchesUser =
      !userIdFilter || request.userId === Number(userIdFilter);

    return matchesSearch && matchesUser;
  });
}

function createTextCell(value: string | number): HTMLTableCellElement {
  const cell = document.createElement("td");
  cell.textContent = String(value);
  return cell;
}

function createRequestActionsCell(requestId: number): HTMLTableCellElement {
  const cell = document.createElement("td");
  const deleteButton = document.createElement("button");

  deleteButton.type = "button";
  deleteButton.dataset.deleteRequestId = String(requestId);
  deleteButton.textContent = "Видалити";

  cell.appendChild(deleteButton);

  return cell;
}

function renderRequests(): void {
  if (!tableBodyEl) return;

  const visibleRequests = getVisibleRequests();

  tableBodyEl.replaceChildren();

  if (visibleRequests.length === 0) {
    showMessage("Поки що немає заявок або нічого не знайдено.");
    return;
  }

  if (emptyStateEl) {
    emptyStateEl.hidden = true;
  }

  for (const request of visibleRequests) {
    const tr = document.createElement("tr");

    tr.append(
      createTextCell(request.id),
      createTextCell(getUserNameById(request.userId)),
      createTextCell(request.startDateTime),
      createTextCell(request.endDateTime),
      createTextCell(request.status),
      createTextCell(request.comments || "—"),
      createRequestActionsCell(request.id),
    );

    tableBodyEl.appendChild(tr);
  }
}

async function loadUsersForSelects(): Promise<void> {
  usersState = await getUsers("active");
  fillUsersSelects();
}

async function loadRequests(): Promise<void> {
  showMessage("Завантаження...");

  try {
    const status = getSelectedStatusFilter();
    requestsState = await getAccessRequests(status);
    renderRequests();
  } catch (error) {
    requestsState = [];
    renderRequests();

    const apiError = error as ApiClientError;
    showMessage(`Помилка (${apiError.status}): ${apiError.message}`);
  }
}

function setFormEnabled(isEnabled: boolean): void {
  if (submitBtnEl) {
    submitBtnEl.disabled = !isEnabled;
  }

  if (resetBtnEl) {
    resetBtnEl.disabled = !isEnabled;
  }
}

formEl?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const dto = readForm();

  if (!validate(dto)) {
    return;
  }

  setFormEnabled(false);

  try {
    await createAccessRequest(dto);
    formEl.reset();

    if (statusInputEl) {
      statusInputEl.value = "pending";
    }

    clearErrors();
    await loadRequests();
  } catch (error) {
    const apiError = error as ApiClientError;
    showMessage(`Не вдалося створити заявку: ${apiError.message}`);
  } finally {
    setFormEnabled(true);
  }
});

resetBtnEl?.addEventListener("click", () => {
  formEl?.reset();

  if (statusInputEl) {
    statusInputEl.value = "pending";
  }

  clearErrors();
});

tableBodyEl?.addEventListener("click", async (event) => {
  const target = event.target as HTMLElement;
  const button = target.closest<HTMLButtonElement>("[data-delete-request-id]");

  if (!button) return;

  const id = Number(button.dataset.deleteRequestId);

  if (!Number.isFinite(id)) return;

  const confirmed = window.confirm("Видалити заявку?");

  if (!confirmed) return;

  button.disabled = true;

  try {
    await deleteAccessRequest(id);
    await loadRequests();
  } catch (error) {
    const apiError = error as ApiClientError;
    showMessage(`Не вдалося видалити заявку: ${apiError.message}`);
  } finally {
    button.disabled = false;
  }
});

searchInputEl?.addEventListener("input", renderRequests);
userFilterEl?.addEventListener("change", renderRequests);
statusFilterGroupEl?.addEventListener("change", () => {
  void loadRequests();
});

clearFiltersBtnEl?.addEventListener("click", () => {
  if (searchInputEl) searchInputEl.value = "";
  if (userFilterEl) userFilterEl.value = "";

  const activeRadio = document.querySelector<HTMLInputElement>(
    'input[name="statusFilter"][value="active"]',
  );

  if (activeRadio) {
    activeRadio.checked = true;
  }

  void loadRequests();
});

async function initPage(): Promise<void> {
  try {
    await loadUsersForSelects();
    await loadRequests();
  } catch (error) {
    const apiError = error as ApiClientError;
    showMessage(`Не вдалося завантажити сторінку: ${apiError.message}`);
  }
}

void initPage();