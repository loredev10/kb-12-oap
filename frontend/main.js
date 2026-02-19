// ====== CONFIG ======
const STORAGE_KEY = "lab1_users_v1";

// ====== STATE ======
let users = [];
let nextId = 1;

// ====== DOM ======
let form, submitBtn, resetBtn;
let fullNameInput, emailInput, roleSelect, notesInput;
let fullNameError, emailError, roleError, notesError;
let tableBody, emptyState;

// ====== ENTRY POINT ======
init();

function init() {
  // 1) знайти елементи
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

  form.addEventListener("submit", onSubmit);
  resetBtn.addEventListener("click", onReset);

  loadFromStorage();

  nextId = computeNextId(users);

  render();
}

function onReset() {
  form.reset();
  clearErrors();
  setSubmitLabel("Додати");
}

function onSubmit(event) {
  event.preventDefault();

  const dto = readForm();
  const isValid = validate(dto);

  if (!isValid) {
    // сабміт не проходить
    return;
  }


  addUser(dto);

  saveToStorage();
  render();

  form.reset();
  clearErrors();
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
  // empty state
  if (users.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
  }

  // render rows
  tableBody.innerHTML = users
    .map((u, idx) => {
      const notes = escapeHtml(u.notes || "");
      return `
        <tr data-id="${u.id}">
          <td>${idx + 1}</td>
          <td>${escapeHtml(u.fullName)}</td>
          <td>${escapeHtml(u.email)}</td>
          <td>${escapeHtml(u.role)}</td>
          <td>${notes}</td>
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
