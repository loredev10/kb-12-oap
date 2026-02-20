// ====== CONFIG ======
const STORAGE_KEY = "lab1_users_v1";

// ====== STATE ======
let users = [];
let nextId = 1;
let editId = null;
let filters = { search: "", role: "" };

// ====== DOM ======
let form, submitBtn, resetBtn;
let fullNameInput, emailInput, roleSelect, notesInput;
let fullNameError, emailError, roleError, notesError;
let tableBody, emptyState;
let confirmPopover;
let pendingDeleteId = null;
let searchInput, roleFilter, clearFiltersBtn;

// ====== ENTRY POINT ======
init();

function init() {
  form = document.getElementById("userForm");
  submitBtn = document.getElementById("submitBtn");
  resetBtn = document.getElementById("resetBtn");

  fullNameInput = document.getElementById("fullNameInput");
  emailInput = document.getElementById("emailInput");
  roleSelect = document.getElementById("roleSelect");
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
  confirmPopover.addEventListener("click", e => e.stopPropagation());
  document.addEventListener("click", onDocumentClick);
  window.addEventListener("scroll", hideConfirmPopover, true);
  window.addEventListener("resize", hideConfirmPopover);

  searchInput.addEventListener("input", onSearchInput);
  roleFilter.addEventListener("change", onRoleChange);
  clearFiltersBtn.addEventListener("click", onClearFilters);

  loadFromStorage();
  nextId = computeNextId(users);
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

function onSubmit(event) {
  event.preventDefault();

  const dto = readForm();
  const isValid = validate(dto);
  if (!isValid) return;

  if (editId !== null) {
    updateUser(editId, dto);
    editId = null;
    setSubmitLabel("Додати");
  } else {
    addUser(dto);
  }

  saveToStorage();
  render();

  form.reset();
  clearErrors();
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

function onDelete(id) {
  if (editId === id) {
    editId = null;
    form.reset();
    clearErrors();
    setSubmitLabel("Додати");
  }

  users = users.filter(u => u.id !== id);
  saveToStorage();
  nextId = computeNextId(users);
  render();
}

function onEdit(id) {
  const user = users.find(u => u.id === id);
  if (!user) return;

  editId = id;

  fullNameInput.value = user.fullName;
  emailInput.value = user.email;
  roleSelect.value = user.role;
  notesInput.value = user.notes || "";

  clearErrors();
  setSubmitLabel("Зберегти");
  hideConfirmPopover();
  fullNameInput.focus();
}

function updateUser(id, dto) {
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return false;

  users[idx] = {
    ...users[idx],
    fullName: dto.fullName.trim(),
    email: dto.email.trim(),
    role: dto.role,
    notes: dto.notes.trim()
  };

  return true;
}

function showDeleteConfirm(id, buttonEl) {
  pendingDeleteId = id;

  // позиціонуємо біля кнопки
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
  // якщо попап схований — нічого
  if (confirmPopover.hidden) return;

  // клік всередині попапа — ок, не ховаємо тут (обробить onConfirmClick)
  if (event.target.closest("#confirmPopover")) return;

  // клік по кнопці "Видалити" — теж не ховаємо (бо ми його щойно відкрили)
  if (event.target.closest('button[data-action="delete"]')) return;

  // будь-який інший клік — сховати
  hideConfirmPopover();
}

function applyFilters(items, filters) {
  let result = items;

  const q = filters.search.trim().toLowerCase();
  if (q) {
    result = result.filter(u => {
      const hay = `${u.fullName} ${u.email}`.toLowerCase();
      return hay.includes(q);
    });
  }

  if (filters.role) {
    result = result.filter(u => u.role === filters.role);
  }

  return result;
}

function readForm() {
  return {
    fullName: fullNameInput.value,
    email: emailInput.value,
    role: roleSelect.value,
    notes: notesInput.value
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
    showError(fullNameInput, fullNameError, "Довжина має бути від 3 до 60 символів.");
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
    showError(roleSelect, roleError, "Оберіть значення зі списку.");
    isValid = false;
  }

  const notes = dto.notes.trim();
  if (notes !== "" && notes.length < 5) {
    showError(notesInput, notesError, "Коментар має містити щонайменше 5 символів (або залиште порожнім).");
    isValid = false;
  }

  return isValid;
}

function addUser(dto) {
  const user = {
    id: nextId++,
    fullName: dto.fullName.trim(),
    email: dto.email.trim(),
    role: dto.role,
    notes: dto.notes.trim()
  };
  users.push(user);
}

function render() {
  const filteredUsers = applyFilters(users, filters);

  emptyState.hidden = filteredUsers.length !== 0;

  // render rows
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

// ====== STORAGE ======
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    users = [];
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    users = Array.isArray(parsed) ? parsed : [];
  } catch {
    users = [];
  }
}

// не зберігати nextId, а обчислити
function computeNextId(items) {
  if (!Array.isArray(items) || items.length === 0) return 1;
  const maxId = Math.max(...items.map(x => Number(x.id) || 0));
  return maxId + 1;
}

// ====== ERRORS / UX ======
function clearErrors() {
  clearFieldError(fullNameInput, fullNameError);
  clearFieldError(emailInput, emailError);
  clearFieldError(roleSelect, roleError);
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
