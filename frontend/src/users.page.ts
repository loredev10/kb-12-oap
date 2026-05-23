import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  testServerError,
} from "./apiClient";
import type {
  ApiClientError,
  CreateUserRequestDto,
  EntityStatusFilter,
  UserResponseDto,
  UserRole,
} from "./dtos";

const formEl = document.querySelector<HTMLFormElement>("#userForm");
const usersTableBodyEl =
  document.querySelector<HTMLTableSectionElement>("#usersTableBody");
const emptyStateEl = document.querySelector<HTMLElement>("#emptyState");

const fullNameInputEl =
  document.querySelector<HTMLInputElement>("#fullNameInput");
const emailInputEl = document.querySelector<HTMLInputElement>("#emailInput");
const notesInputEl =
  document.querySelector<HTMLTextAreaElement>("#notesInput");

const fullNameErrorEl = document.querySelector<HTMLElement>("#fullNameError");
const emailErrorEl = document.querySelector<HTMLElement>("#emailError");
const roleErrorEl = document.querySelector<HTMLElement>("#roleError");
const notesErrorEl = document.querySelector<HTMLElement>("#notesError");

const submitBtnEl = document.querySelector<HTMLButtonElement>("#submitBtn");
const resetBtnEl = document.querySelector<HTMLButtonElement>("#resetBtn");

const disableFrontendValidationInputEl =
  document.querySelector<HTMLInputElement>("#disableFrontendValidationInput");

const searchInputEl = document.querySelector<HTMLInputElement>("#searchInput");
const roleFilterEl = document.querySelector<HTMLSelectElement>("#roleFilter");
const statusFilterGroupEl =
  document.querySelector<HTMLElement>("#statusFilterGroup");
const clearFiltersBtnEl =
  document.querySelector<HTMLButtonElement>("#clearFiltersBtn");

const testServerErrorBtnEl =
  document.querySelector<HTMLButtonElement>("#testServerErrorBtn");

const userDetailsEl = document.querySelector<HTMLElement>("#userDetails");
const detailsUserIdEl = document.querySelector<HTMLElement>("#detailsUserId");
const detailsFullNameEl =
  document.querySelector<HTMLElement>("#detailsFullName");
const detailsEmailEl = document.querySelector<HTMLElement>("#detailsEmail");
const detailsRoleEl = document.querySelector<HTMLElement>("#detailsRole");
const detailsNotesEl = document.querySelector<HTMLElement>("#detailsNotes");

let usersState: UserResponseDto[] = [];

function formatUserRole(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    student: "Студент",
    teacher: "Викладач",
    lab_assistant: "Лаборант",
    admin: "Адміністратор",
  };

  return labels[role];
}

function setText(el: HTMLElement | null, text: string): void {
  if (el) {
    el.textContent = text;
  }
}

function clearErrors(): void {
  setText(fullNameErrorEl, "");
  setText(emailErrorEl, "");
  setText(roleErrorEl, "");
  setText(notesErrorEl, "");
}

function formatUnknownDetail(detail: unknown): string {
  if (typeof detail === "string") {
    return detail;
  }

  if (typeof detail === "number" || typeof detail === "boolean") {
    return String(detail);
  }

  if (typeof detail === "object" && detail !== null) {
    if ("field" in detail && "message" in detail) {
      const field = String((detail as { field: unknown }).field);
      const message = String((detail as { message: unknown }).message);

      return `${field}: ${message}`;
    }

    if ("message" in detail) {
      return String((detail as { message: unknown }).message);
    }

    return JSON.stringify(detail);
  }

  return "";
}

function formatApiError(error: ApiClientError): string {
  if (Array.isArray(error.details)) {
    const details = error.details
      .map((detail) => formatUnknownDetail(detail))
      .filter(Boolean)
      .join("; ");

    return details || error.message;
  }

  const detailText = formatUnknownDetail(error.details);

  if (detailText && detailText !== error.message) {
    return `${error.message}: ${detailText}`;
  }

  return error.message;
}

function getRecoveryHint(error: ApiClientError): string {
  if (error.code === "REQUEST_TIMEOUT") {
    return "Спробуйте повторити дію пізніше або перевірте, чи бекенд не завис.";
  }

  if (error.code === "NETWORK_OR_CORS_ERROR") {
    return "Перевірте, чи запущений бекенд на http://localhost:3000 і чи налаштований CORS.";
  }

  if (error.status === 500) {
    return "На сервері сталася внутрішня помилка. Перевірте консоль бекенду.";
  }

  if (error.status === 400) {
    return "Перевірте правильність введених даних.";
  }

  if (error.status === 404) {
    return "Запис не знайдено. Можливо, його вже видалено.";
  }

  if (error.status === 409) {
    return "Перевірте, чи не дублюються унікальні дані, наприклад email.";
  }

  return "Спробуйте повторити дію або перевірте DevTools → Network.";
}

function formatUserFriendlyApiError(error: ApiClientError): string {
  return `${formatApiError(error)} ${getRecoveryHint(error)}`;
}

function showMessage(text: string): void {
  if (!emptyStateEl) return;

  emptyStateEl.hidden = false;
  emptyStateEl.textContent = text;
}

function hideUserDetails(): void {
  if (userDetailsEl) {
    userDetailsEl.hidden = true;
  }
}

function renderUserDetails(user: UserResponseDto): void {
  if (!userDetailsEl) return;

  userDetailsEl.hidden = false;

  setText(detailsUserIdEl, String(user.id));
  setText(detailsFullNameEl, user.fullName);
  setText(detailsEmailEl, user.email);
  setText(detailsRoleEl, formatUserRole(user.role));
  setText(detailsNotesEl, user.notes || "—");
}

function getSelectedRole(): CreateUserRequestDto["role"] | "" {
  const checked = document.querySelector<HTMLInputElement>(
    'input[name="role"]:checked',
  );

  return checked?.value as CreateUserRequestDto["role"] | "";
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

function readForm(): CreateUserRequestDto {
  return {
    fullName: fullNameInputEl?.value.trim() ?? "",
    email: emailInputEl?.value.trim() ?? "",
    role: getSelectedRole() as CreateUserRequestDto["role"],
    notes: notesInputEl?.value.trim() ?? "",
  };
}

function validate(dto: CreateUserRequestDto): boolean {
  clearErrors();

  let isValid = true;

  if (dto.fullName.length < 3) {
    setText(fullNameErrorEl, "Ім’я / ПІБ має містити мінімум 3 символи.");
    isValid = false;
  }

  if (!dto.email) {
    setText(emailErrorEl, "Email обов’язковий.");
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) {
    setText(emailErrorEl, "Введіть коректний email.");
    isValid = false;
  }

  if (!dto.role) {
    setText(roleErrorEl, "Оберіть роль.");
    isValid = false;
  }

  if (dto.notes !== "" && dto.notes.length < 5) {
    setText(
      notesErrorEl,
      "Коментар має містити мінімум 5 символів або бути порожнім.",
    );
    isValid = false;
  }

  if (dto.notes.length > 300) {
    setText(notesErrorEl, "Коментар не може бути довшим за 300 символів.");
    isValid = false;
  }

  return isValid;
}

function isFrontendValidationDisabled(): boolean {
  return disableFrontendValidationInputEl?.checked ?? false;
}

function getVisibleUsers(): UserResponseDto[] {
  const search = searchInputEl?.value.trim().toLowerCase() ?? "";
  const role = roleFilterEl?.value ?? "";

  return usersState.filter((user) => {
    const matchesSearch =
      !search ||
      user.fullName.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search);

    const matchesRole = !role || user.role === role;

    return matchesSearch && matchesRole;
  });
}

function renderUsers(): void {
  if (!usersTableBodyEl) return;

  const visibleUsers = getVisibleUsers();

  usersTableBodyEl.innerHTML = "";

  if (visibleUsers.length === 0) {
    showMessage("Поки що немає записів або нічого не знайдено.");
    return;
  }

  if (emptyStateEl) {
    emptyStateEl.hidden = true;
  }

  for (const user of visibleUsers) {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${user.id}</td>
      <td>${user.fullName}</td>
      <td>${user.email}</td>
      <td>${formatUserRole(user.role)}</td>
      <td>${user.notes || "—"}</td>
      <td>
        <button type="button" data-view-user-id="${user.id}">Деталі</button>
        <button type="button" data-delete-user-id="${user.id}">Видалити</button>
      </td>
    `;

    usersTableBodyEl.appendChild(tr);
  }
}

async function loadUsers(): Promise<void> {
  showMessage("Завантаження...");

  try {
    const status = getSelectedStatusFilter();
    usersState = await getUsers(status);

    hideUserDetails();
    renderUsers();
  } catch (error) {
    usersState = [];
    renderUsers();
    hideUserDetails();

    const apiError = error as ApiClientError;
    showMessage(
      `Помилка (${apiError.status}): ${formatUserFriendlyApiError(apiError)}`,
    );
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
  const shouldSkipFrontendValidation = isFrontendValidationDisabled();

  if (!shouldSkipFrontendValidation && !validate(dto)) {
    return;
  }

  if (shouldSkipFrontendValidation) {
    clearErrors();
    showMessage(
      "Фронтенд-валідацію вимкнено. Дані відправлено на бекенд для перевірки.",
    );
  }

  setFormEnabled(false);

  try {
    await createUser(dto);
    formEl.reset();
    clearErrors();
    await loadUsers();
  } catch (error) {
    const apiError = error as ApiClientError;
    showMessage(
      `Не вдалося створити користувача: ${formatUserFriendlyApiError(apiError)}`,
    );
  } finally {
    setFormEnabled(true);
  }
});

resetBtnEl?.addEventListener("click", () => {
  formEl?.reset();
  clearErrors();
});

usersTableBodyEl?.addEventListener("click", async (event) => {
  const target = event.target as HTMLElement;

  const viewButton = target.closest<HTMLButtonElement>("[data-view-user-id]");

  if (viewButton) {
    const id = Number(viewButton.dataset.viewUserId);

    if (!Number.isFinite(id)) return;

    viewButton.disabled = true;

    try {
      const user = await getUserById(id);
      renderUserDetails(user);
    } catch (error) {
      const apiError = error as ApiClientError;
      showMessage(
        `Не вдалося завантажити деталі користувача: ${formatUserFriendlyApiError(apiError)}`,
      );
    } finally {
      viewButton.disabled = false;
    }

    return;
  }

  const deleteButton = target.closest<HTMLButtonElement>(
    "[data-delete-user-id]",
  );

  if (!deleteButton) return;

  const id = Number(deleteButton.dataset.deleteUserId);

  if (!Number.isFinite(id)) return;

  const confirmed = window.confirm("Видалити користувача?");

  if (!confirmed) return;

  deleteButton.disabled = true;

  try {
    await deleteUser(id);
    await loadUsers();
    hideUserDetails();
  } catch (error) {
    const apiError = error as ApiClientError;
    showMessage(
      `Не вдалося видалити користувача: ${formatUserFriendlyApiError(apiError)}`,
    );
  } finally {
    deleteButton.disabled = false;
  }
});

testServerErrorBtnEl?.addEventListener("click", async () => {
  testServerErrorBtnEl.disabled = true;

  try {
    await testServerError();
  } catch (error) {
    const apiError = error as ApiClientError;

    showMessage(
      `Тест поганого сценарію: ${formatUserFriendlyApiError(apiError)}`,
    );
  } finally {
    testServerErrorBtnEl.disabled = false;
  }
});

searchInputEl?.addEventListener("input", renderUsers);
roleFilterEl?.addEventListener("change", renderUsers);

statusFilterGroupEl?.addEventListener("change", () => {
  void loadUsers();
});

clearFiltersBtnEl?.addEventListener("click", () => {
  if (searchInputEl) searchInputEl.value = "";
  if (roleFilterEl) roleFilterEl.value = "";

  const activeRadio = document.querySelector<HTMLInputElement>(
    'input[name="statusFilter"][value="active"]',
  );

  if (activeRadio) {
    activeRadio.checked = true;
  }

  void loadUsers();
});

void loadUsers();