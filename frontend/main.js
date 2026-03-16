const API_BASE_URL = "/api/users";

// ====== STATE ======
let users = [];
let editId = null;
let filters = { search: "", role: "" };

// ====== DOM ======
let form, submitBtn, resetBtn;
let fullNameInput, emailInput, roleOptions, notesInput;
let fullNameError, emailError, roleError, notesError;
let tableBody, emptyState;
let confirmPopover;
let pendingDeleteId = null;
let searchInput, roleFilter, clearFiltersBtn;

// ====== ENTRY POINT ======
init();

async function init() {
  form = document.getElementById("userForm");
  submitBtn = document.getElementById("submitBtn");
  resetBtn = document.getElementById("resetBtn");

  fullNameInput = document.getElementById("fullNameInput");
  emailInput = document.getElementById("emailInput");
  roleOptions = document.getElementById("roleOptions");
  notesInput = document.getElementById("notesInput");

  fullNameError = document.getElementById("fullNameError");
  emailError = document.getElementById("emailError");
  roleError = document.getElementById("roleError");
  notesError = document.getElementById("notesError");

  tableBody = document.getElementById("usersTableBody");
  emptyState = document.getElementById("emptyState");

  confirmPopover = document.getElementById("confirmPopover");

  searchInput = document.getElementById("searchInput");
  roleFilter = document.getElementById("roleFilter");
  clearFiltersBtn = document.getElementById("clearFiltersBtn");

  form.addEventListener("submit", onSubmit);
  resetBtn.addEventListener("click", onReset);
  tableBody.addEventListener("click", onTableClick);

  confirmPopover.addEventListener("click", onConfirmClick);
  confirmPopover.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("click", onDocumentClick);
  window.addEventListener("scroll", hideConfirmPopover, true);
  window.addEventListener("resize", hideConfirmPopover);

  searchInput.addEventListener("input", onSearchInput);
  roleFilter.addEventListener("change", onRoleChange);
  clearFiltersBtn.addEventListener("click", onClearFilters);

  try {
    await loadUsers();
  } catch (error) {
    console.error(error);
    alert("Не вдалося завантажити користувачів із сервера.");
  }

  render();
}

function onSearchInput() {
  filters.search = searchInput.value;
  render();
}

function onRoleChange() {
  filters.role = roleFilter.value;
  render();
}

function onClearFilters() {
  filters.search = "";
  filters.role = "";
  searchInput.value = "";
  roleFilter.value = "";
  render();
}

function onReset() {
  form.reset();
  clearErrors();
  editId = null;
  setSubmitLabel("Додати");
  hideConfirmPopover();
}

async function onSubmit(event) {
  event.preventDefault();

  const dto = readForm();
  // const isValid = validate(dto);
  // if (!isValid) return;

  try {
    if (editId !== null) {
      await updateUserRequest(editId, dto);
      editId = null;
      setSubmitLabel("Додати");
    } else {
      await createUserRequest(dto);
    }

    await loadUsers();
    render();

    form.reset();
    clearErrors();
  } catch (error) {
    console.error(error);
    alert(error.message || "Не вдалося зберегти користувача.");
  }
}

function onTableClick(event) {
  const btn = event.target.closest("button[data-action]");
  if (!btn) return;

  const tr = btn.closest("tr");
  if (!tr) return;

  const id = Number(tr.dataset.id);
  if (!Number.isFinite(id)) return;

  const action = btn.dataset.action;

  if (action === "delete") {
    event.stopPropagation();
    showDeleteConfirm(id, btn);
    return;
  }

  if (action === "edit") {
    onEdit(id);
  }
}

async function onDelete(id) {
  try {
    await deleteUserRequest(id);

    if (editId === id) {
      editId = null;
      form.reset();
      clearErrors();
      setSubmitLabel("Додати");
    }

    await loadUsers();
    render();
  } catch (error) {
    console.error(error);
    alert(error.message || "Не вдалося видалити користувача.");
  }
}

function onEdit(id) {
  const user = users.find((u) => u.id === id);
  if (!user) return;

  editId = id;

  fullNameInput.value = user.fullName;
  emailInput.value = user.email;

  document.querySelectorAll('input[name="role"]').forEach((r) => {
    r.checked = r.value === user.role;
  });

  notesInput.value = user.notes || "";

  clearErrors();
  setSubmitLabel("Зберегти");
  hideConfirmPopover();
  fullNameInput.focus();
}

function showDeleteConfirm(id, buttonEl) {
  pendingDeleteId = id;

  const rect = buttonEl.getBoundingClientRect();
  const top = rect.bottom + window.scrollY + 6;
  const left = rect.left + window.scrollX;

  confirmPopover.style.top = `${top}px`;
  confirmPopover.style.left = `${left}px`;
  confirmPopover.hidden = false;
}

function hideConfirmPopover() {
  confirmPopover.hidden = true;
  pendingDeleteId = null;
}

function onConfirmClick(event) {
  event.stopPropagation();

  const btn = event.target.closest("button[data-confirm]");
  if (!btn) return;

  const decision = btn.dataset.confirm;

  if (decision === "yes" && pendingDeleteId !== null) {
    onDelete(pendingDeleteId);
  }

  hideConfirmPopover();
}

function onDocumentClick(event) {
  if (confirmPopover.hidden) return;
  if (event.target.closest("#confirmPopover")) return;
  if (event.target.closest('button[data-action="delete"]')) return;

  hideConfirmPopover();
}

function applyFilters(items, currentFilters) {
  let result = items;

  const q = currentFilters.search.trim().toLowerCase();
  if (q) {
    result = result.filter((u) => {
      const hay = `${u.fullName} ${u.email}`.toLowerCase();
      return hay.includes(q);
    });
  }

  if (currentFilters.role) {
    result = result.filter((u) => u.role === currentFilters.role);
  }

  return result;
}

function readForm() {
  const selectedRole = document.querySelector('input[name="role"]:checked');

  return {
    fullName: fullNameInput.value,
    email: emailInput.value,
    role: selectedRole ? selectedRole.value : "",
    notes: notesInput.value,
  };
}

function validate(dto) {
  clearErrors();
  let isValid = true;

  const name = dto.fullName.trim();
  if (name === "") {
    showError(fullNameInput, fullNameError, "Поле є обов’язковим.");
    isValid = false;
  } else if (name.length < 3 || name.length > 60) {
    showError(
      fullNameInput,
      fullNameError,
      "Довжина має бути від 3 до 60 символів.",
    );
    isValid = false;
  }

  const email = dto.email.trim();
  if (email === "") {
    showError(emailInput, emailError, "Email є обов’язковим.");
    isValid = false;
  } else if (!isValidEmail(email)) {
    showError(emailInput, emailError, "Введіть коректний Email.");
    isValid = false;
  }

  if (dto.role === "") {
    showError(roleOptions, roleError, "Оберіть роль.");
    isValid = false;
  }

  const notes = dto.notes.trim();
  if (notes !== "" && notes.length < 5) {
    showError(
      notesInput,
      notesError,
      "Коментар має містити щонайменше 5 символів (або залиште порожнім).",
    );
    isValid = false;
  }

  return isValid;
}

function render() {
  const filteredUsers = applyFilters(users, filters);

  emptyState.hidden = filteredUsers.length !== 0;

  tableBody.innerHTML = filteredUsers
    .map((u, idx) => {
      const notes = escapeHtml(u.notes || "");
      return `
        <tr data-id="${u.id}">
          <td>${idx + 1}</td>
          <td>${escapeHtml(u.fullName)}</td>
          <td>${escapeHtml(u.email)}</td>
          <td>${escapeHtml(u.role)}</td>
          <td>${notes}</td>
          <td>
            <button type="button" class="row-btn" data-action="edit">Редагувати</button>
            <button type="button" class="row-btn" data-action="delete">Видалити</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

// ====== API ======
async function loadUsers() {
  const response = await fetch(API_BASE_URL);
  const data = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(data, "Не вдалося завантажити список користувачів."),
    );
  }

  users = Array.isArray(data.items) ? data.items : [];
}

async function createUserRequest(dto) {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    applyServerValidationErrors(data);
    throw new Error(
      extractErrorMessage(data, "Не вдалося створити користувача."),
    );
  }

  return data;
}

async function updateUserRequest(id, dto) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    applyServerValidationErrors(data);
    throw new Error(
      extractErrorMessage(data, "Не вдалося оновити користувача."),
    );
  }

  return data;
}

async function deleteUserRequest(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await parseJsonSafe(response);
    throw new Error(
      extractErrorMessage(data, "Не вдалося видалити користувача."),
    );
  }
}

async function parseJsonSafe(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function extractErrorMessage(data, fallback) {
  return data?.error?.message || fallback;
}

// ====== ERRORS / UX ======
function clearErrors() {
  clearFieldError(fullNameInput, fullNameError);
  clearFieldError(emailInput, emailError);
  clearFieldError(roleOptions, roleError);
  clearFieldError(notesInput, notesError);
}

function showError(inputEl, errorEl, message) {
  inputEl.classList.add("is-invalid");
  errorEl.textContent = message;
}

function clearFieldError(inputEl, errorEl) {
  inputEl.classList.remove("is-invalid");
  errorEl.textContent = "";
}

function setSubmitLabel(text) {
  submitBtn.textContent = text;
}

function applyServerValidationErrors(data) {
  clearErrors();

  const details = data?.error?.details;
  if (!Array.isArray(details)) return;

  details.forEach((item) => {
    if (!item?.field || !item?.message) return;

    if (item.field === "fullName") {
      showError(fullNameInput, fullNameError, item.message);
    }

    if (item.field === "email") {
      showError(emailInput, emailError, item.message);
    }

    if (item.field === "role") {
      showError(roleOptions, roleError, item.message);
    }

    if (item.field === "notes") {
      showError(notesInput, notesError, item.message);
    }
  });
}

// ====== HELPERS ======
function isValidEmail(value) {
  // базова перевірка формату
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
