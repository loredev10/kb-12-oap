const API_BASE_URL = "/api/access-requests";
const USERS_API_BASE_URL = "/api/users";

let accessRequests = [];
let users = [];
let editId = null;
let filters = { search: "", userId: "" };

let form, submitBtn, resetBtn;
let userIdInput, startDateTimeInput, endDateTimeInput, commentsInput;
let userIdError, startDateTimeError, endDateTimeError, commentsError;
let tableBody, emptyState;
let confirmPopover;
let pendingDeleteId = null;
let searchInput, userFilter, clearFiltersBtn;

init();

async function init() {
  form = document.getElementById("accessRequestForm");
  submitBtn = document.getElementById("submitBtn");
  resetBtn = document.getElementById("resetBtn");

  userIdInput = document.getElementById("userIdInput");
  startDateTimeInput = document.getElementById("startDateTimeInput");
  endDateTimeInput = document.getElementById("endDateTimeInput");
  commentsInput = document.getElementById("commentsInput");

  userIdError = document.getElementById("userIdError");
  startDateTimeError = document.getElementById("startDateTimeError");
  endDateTimeError = document.getElementById("endDateTimeError");
  commentsError = document.getElementById("commentsError");

  tableBody = document.getElementById("accessRequestsTableBody");
  emptyState = document.getElementById("emptyState");

  confirmPopover = document.getElementById("confirmPopover");

  searchInput = document.getElementById("searchInput");
  userFilter = document.getElementById("userFilter");
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
  userFilter.addEventListener("change", onUserFilterChange);
  clearFiltersBtn.addEventListener("click", onClearFilters);

  try {
    await loadUsers();
    fillUsersSelect();
    fillUsersFilter();
    await loadAccessRequests();
  } catch (error) {
    console.error(error);
    alert("Не вдалося завантажити дані із сервера.");
  }

  render();
}

function onSearchInput() {
  filters.search = searchInput.value;
  render();
}

function onUserFilterChange() {
  filters.userId = userFilter.value;
  render();
}

function onClearFilters() {
  filters.search = "";
  filters.userId = "";
  searchInput.value = "";
  userFilter.value = "";
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
  const isValid = validate(dto);
  if (!isValid) return;

  try {
    if (editId !== null) {
      await updateAccessRequestRequest(editId, dto);
      editId = null;
      setSubmitLabel("Додати");
    } else {
      await createAccessRequestRequest(dto);
    }

    await loadAccessRequests();
    render();

    form.reset();
    clearErrors();
  } catch (error) {
    console.error(error);
    alert(error.message || "Не вдалося зберегти заявку.");
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
    await deleteAccessRequestRequest(id);

    if (editId === id) {
      editId = null;
      form.reset();
      clearErrors();
      setSubmitLabel("Додати");
    }

    await loadAccessRequests();
    render();
  } catch (error) {
    console.error(error);
    alert(error.message || "Не вдалося видалити заявку.");
  }
}

function onEdit(id) {
  const request = accessRequests.find((item) => item.id === id);
  if (!request) return;

  editId = id;

  userIdInput.value = String(request.userId);
  startDateTimeInput.value = toDateTimeLocalValue(request.startDateTime);
  endDateTimeInput.value = toDateTimeLocalValue(request.endDateTime);
  commentsInput.value = request.comments || "";

  clearErrors();
  setSubmitLabel("Зберегти");
  hideConfirmPopover();
  userIdInput.focus();
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
    result = result.filter((item) =>
      String(item.comments || "").toLowerCase().includes(q),
    );
  }

  const userIdFilter = currentFilters.userId.trim();
  if (userIdFilter !== "") {
    result = result.filter((item) => String(item.userId) === userIdFilter);
  }

  return result;
}

function readForm() {
  return {
    userId: Number(userIdInput.value),
    startDateTime: startDateTimeInput.value,
    endDateTime: endDateTimeInput.value,
    comments: commentsInput.value,
  };
}

function validate(dto) {
  clearErrors();
  let isValid = true;

  if (!Number.isInteger(dto.userId) || dto.userId <= 0) {
    showError(userIdInput, userIdError, "Оберіть користувача.");
    isValid = false;
  }

  if (String(dto.startDateTime).trim() === "") {
    showError(
      startDateTimeInput,
      startDateTimeError,
      "Дата і час початку є обов’язковими.",
    );
    isValid = false;
  } else if (!isValidDateTimeString(dto.startDateTime)) {
    showError(
      startDateTimeInput,
      startDateTimeError,
      "Введіть коректну дату і час початку.",
    );
    isValid = false;
  }

  if (String(dto.endDateTime).trim() === "") {
    showError(
      endDateTimeInput,
      endDateTimeError,
      "Дата і час завершення є обов’язковими.",
    );
    isValid = false;
  } else if (!isValidDateTimeString(dto.endDateTime)) {
    showError(
      endDateTimeInput,
      endDateTimeError,
      "Введіть коректну дату і час завершення.",
    );
    isValid = false;
  }

  if (
    isValidDateTimeString(dto.startDateTime) &&
    isValidDateTimeString(dto.endDateTime)
  ) {
    const start = Date.parse(dto.startDateTime);
    const end = Date.parse(dto.endDateTime);

    if (end <= start) {
      showError(
        endDateTimeInput,
        endDateTimeError,
        "Час завершення має бути пізніше за час початку.",
      );
      isValid = false;
    }
  }

  const comments = dto.comments.trim();
  if (comments === "") {
    showError(commentsInput, commentsError, "Коментар є обов’язковим.");
    isValid = false;
  } else if (comments.length < 3 || comments.length > 300) {
    showError(
      commentsInput,
      commentsError,
      "Коментар має бути від 3 до 300 символів.",
    );
    isValid = false;
  }

  return isValid;
}

function render() {
  const filteredItems = applyFilters(accessRequests, filters);

  emptyState.hidden = filteredItems.length !== 0;

  tableBody.innerHTML = filteredItems
    .map((item) => {
      const userName = getUserNameById(item.userId);

      return `
        <tr data-id="${item.id}">
          <td>${item.id}</td>
          <td>${escapeHtml(userName)}</td>
          <td>${escapeHtml(formatDateTime(item.startDateTime))}</td>
          <td>${escapeHtml(formatDateTime(item.endDateTime))}</td>
          <td>${escapeHtml(item.comments || "")}</td>
          <td>
            <button type="button" class="row-btn" data-action="edit">Редагувати</button>
            <button type="button" class="row-btn" data-action="delete">Видалити</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function loadUsers() {
  const response = await fetch(USERS_API_BASE_URL);
  const data = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(data, "Не вдалося завантажити список користувачів."),
    );
  }

  users = Array.isArray(data.items) ? data.items : [];
}

function fillUsersSelect() {
  userIdInput.innerHTML = `
    <option value="">Оберіть користувача</option>
    ${users
      .map(
        (user) => `
          <option value="${user.id}">
            ${escapeHtml(user.fullName)}
          </option>
        `,
      )
      .join("")}
  `;
}

function fillUsersFilter() {
  userFilter.innerHTML = `
    <option value="">Усі користувачі</option>
    ${users
      .map(
        (user) => `
          <option value="${user.id}">
            ${escapeHtml(user.fullName)}
          </option>
        `,
      )
      .join("")}
  `;
}

function getUserNameById(userId) {
  const user = users.find((item) => item.id === userId);
  return user ? user.fullName : `Користувач #${userId}`;
}

async function loadAccessRequests() {
  const response = await fetch(API_BASE_URL);
  const data = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(data, "Не вдалося завантажити список заявок."),
    );
  }

  accessRequests = Array.isArray(data.items) ? data.items : [];
}

async function createAccessRequestRequest(dto) {
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
    throw new Error(extractErrorMessage(data, "Не вдалося створити заявку."));
  }

  return data;
}

async function updateAccessRequestRequest(id, dto) {
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
    throw new Error(extractErrorMessage(data, "Не вдалося оновити заявку."));
  }

  return data;
}

async function deleteAccessRequestRequest(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await parseJsonSafe(response);
    throw new Error(extractErrorMessage(data, "Не вдалося видалити заявку."));
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

function clearErrors() {
  clearFieldError(userIdInput, userIdError);
  clearFieldError(startDateTimeInput, startDateTimeError);
  clearFieldError(endDateTimeInput, endDateTimeError);
  clearFieldError(commentsInput, commentsError);
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

    if (item.field === "userId") {
      showError(userIdInput, userIdError, item.message);
    }

    if (item.field === "startDateTime") {
      showError(startDateTimeInput, startDateTimeError, item.message);
    }

    if (item.field === "endDateTime") {
      showError(endDateTimeInput, endDateTimeError, item.message);
    }

    if (item.field === "comments") {
      showError(commentsInput, commentsError, item.message);
    }
  });
}

function isValidDateTimeString(value) {
  if (String(value).trim() === "") return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
}

function toDateTimeLocalValue(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDateTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("uk-UA");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}