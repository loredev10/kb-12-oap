import { createUser, deleteUser, getUsers } from "./apiClient";
import type {
  ApiClientError,
  CreateUserRequestDto,
  UserResponseDto,
  UserRole,
} from "./dtos";

const formEl = document.querySelector<HTMLFormElement>("#userForm");
const usersTableBodyEl = document.querySelector<HTMLTableSectionElement>("#usersTableBody");
const emptyStateEl = document.querySelector<HTMLElement>("#emptyState");

const fullNameInputEl = document.querySelector<HTMLInputElement>("#fullNameInput");
const emailInputEl = document.querySelector<HTMLInputElement>("#emailInput");
const notesInputEl = document.querySelector<HTMLTextAreaElement>("#notesInput");

const fullNameErrorEl = document.querySelector<HTMLElement>("#fullNameError");
const emailErrorEl = document.querySelector<HTMLElement>("#emailError");
const roleErrorEl = document.querySelector<HTMLElement>("#roleError");
const notesErrorEl = document.querySelector<HTMLElement>("#notesError");

const submitBtnEl = document.querySelector<HTMLButtonElement>("#submitBtn");
const resetBtnEl = document.querySelector<HTMLButtonElement>("#resetBtn");

const searchInputEl = document.querySelector<HTMLInputElement>("#searchInput");
const roleFilterEl = document.querySelector<HTMLSelectElement>("#roleFilter");
const statusFilterGroupEl = document.querySelector<HTMLElement>("#statusFilterGroup");
const clearFiltersBtnEl = document.querySelector<HTMLButtonElement>("#clearFiltersBtn");

let usersState: UserResponseDto[] = [];

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

function showMessage(text: string): void {
  if (!emptyStateEl) return;

  emptyStateEl.hidden = false;
  emptyStateEl.textContent = text;
}

function getSelectedRole(): CreateUserRequestDto["role"] | "" {
  const checked = document.querySelector<HTMLInputElement>('input[name="role"]:checked');
  return checked?.value as CreateUserRequestDto["role"] | "";
}

function getSelectedStatusFilter(): string {
  const checked = document.querySelector<HTMLInputElement>('input[name="statusFilter"]:checked');
  return checked?.value ?? "active";
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

  if (dto.notes.length > 300) {
    setText(notesErrorEl, "Коментар не може бути довшим за 300 символів.");
    isValid = false;
  }

  return isValid;
}

function formatUserRole(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    student: "Студент",
    teacher: "Викладач",
    lab_assistant: "Лаборант",
    admin: "Адміністратор",
  };

  return labels[role];
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
    renderUsers();
  } catch (error) {
    usersState = [];
    renderUsers();

    const apiError = error as ApiErrorDto;
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
    await createUser(dto);
    formEl.reset();
    clearErrors();
    await loadUsers();
  } catch (error) {
    const apiError = error as ApiErrorDto;
    showMessage(`Не вдалося створити користувача: ${apiError.message}`);
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
  const button = target.closest<HTMLButtonElement>("[data-delete-user-id]");

  if (!button) return;

  const id = Number(button.dataset.deleteUserId);

  if (!Number.isFinite(id)) return;

  const confirmed = window.confirm("Видалити користувача?");

  if (!confirmed) return;

  button.disabled = true;

  try {
    await deleteUser(id);
    await loadUsers();
  } catch (error) {
    const apiError = error as ApiErrorDto;
    showMessage(`Не вдалося видалити користувача: ${apiError.message}`);
  } finally {
    button.disabled = false;
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