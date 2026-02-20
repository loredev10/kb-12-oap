<script>
  import ConfirmPopover from "./components/ConfirmPopover.svelte";
  import UserForm from "./components/UserForm.svelte";
  import FiltersBar from "./components/FiltersBar.svelte";
  import UsersTable from "./components/UsersTable.svelte";

  const STORAGE_KEY = "lab1_users_v1";

  let users = $state([]);
  let nextId = $state(1);
  let editId = $state(null);

  let form = $state({ fullName: "", email: "", role: "", notes: "" });
  let errors = $state({ fullName: "", email: "", role: "", notes: "" });

  let filters = $state({ search: "", role: "" });
  let sort = $state({ key: "", dir: "asc" });

  let submitting = $state(false);

  let confirmOpen = $state(false);
  let pendingDeleteId = $state(null);
  let popover = $state({ top: 0, left: 0 });

  let focusTick = $state(0);

  function computeNextId(items) {
    if (!Array.isArray(items) || items.length === 0) return 1;
    const maxId = Math.max(...items.map(x => Number(x.id) || 0));
    return maxId + 1;
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  users = typeof localStorage !== "undefined" ? loadFromStorage() : [];
  nextId = computeNextId(users);

  $effect(() => {
    if (typeof localStorage === "undefined") return;
    saveToStorage();
  });

  function isValidEmail(value) {
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

  function clearErrors() {
    errors = { fullName: "", email: "", role: "", notes: "" };
  }

  function validate(dto) {
    clearErrors();
    let ok = true;

    const name = dto.fullName.trim();
    if (name === "") {
      errors.fullName = "Поле є обов’язковим.";
      ok = false;
    } else if (name.length < 3 || name.length > 60) {
      errors.fullName = "Довжина має бути від 3 до 60 символів.";
      ok = false;
    }

    const email = dto.email.trim();
    if (email === "") {
      errors.email = "Email є обов’язковим.";
      ok = false;
    } else if (!isValidEmail(email)) {
      errors.email = "Введіть коректний Email.";
      ok = false;
    }

    if (dto.role === "") {
      errors.role = "Оберіть роль.";
      ok = false;
    }

    const notes = dto.notes.trim();
    if (notes !== "" && notes.length < 5) {
      errors.notes = "Коментар має містити щонайменше 5 символів (або залиште порожнім).";
      ok = false;
    }

    return ok;
  }

  function applyFilters(items, f) {
    let result = items;

    const q = f.search.trim().toLowerCase();
    if (q) {
      result = result.filter(u => (`${u.fullName} ${u.email}`).toLowerCase().includes(q));
    }

    if (f.role) {
      result = result.filter(u => u.role === f.role);
    }

    return result;
  }

  function applySort(items, s) {
    if (!s.key) return items;
    const mul = s.dir === "asc" ? 1 : -1;

    return [...items].sort((a, b) => {
      const av = String(a[s.key] ?? "").toLowerCase();
      const bv = String(b[s.key] ?? "").toLowerCase();
      return av.localeCompare(bv, "uk") * mul;
    });
  }

  const viewUsers = $derived(() => applySort(applyFilters(users, filters), sort));

  function setSort(key) {
    if (sort.key === key) sort = { ...sort, dir: sort.dir === "asc" ? "desc" : "asc" };
    else sort = { key, dir: "asc" };
  }

  function resetToAdd() {
    editId = null;
    form = { fullName: "", email: "", role: "", notes: "" };
    clearErrors();
    hideConfirm();
    focusTick++;
  }

  function onSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    submitting = true;

    const dto = { ...form };
    if (!validate(dto)) {
      submitting = false;
      return;
    }

    if (editId !== null) {
      const idx = users.findIndex(u => u.id === editId);
      if (idx !== -1) {
        users[idx] = {
          ...users[idx],
          fullName: dto.fullName.trim(),
          email: dto.email.trim(),
          role: dto.role,
          notes: dto.notes.trim()
        };
      }
      editId = null;
    } else {
      users = [...users, { id: nextId++, fullName: dto.fullName.trim(), email: dto.email.trim(), role: dto.role, notes: dto.notes.trim() }];
    }

    form = { fullName: "", email: "", role: "", notes: "" };
    clearErrors();
    hideConfirm();
    focusTick++;

    submitting = false;
  }

  function onEdit(id) {
    const u = users.find(x => x.id === id);
    if (!u) return;

    editId = id;
    form = { fullName: u.fullName ?? "", email: u.email ?? "", role: u.role ?? "", notes: u.notes ?? "" };

    clearErrors();
    hideConfirm();
    focusTick++;
  }

  function requestDelete(id, event) {
    event.stopPropagation();
    pendingDeleteId = id;

    const rect = event.currentTarget.getBoundingClientRect();
    popover = { top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX };

    confirmOpen = true;
  }

  function hideConfirm() {
    confirmOpen = false;
    pendingDeleteId = null;
  }

  function confirmYes() {
    if (pendingDeleteId === null) return;

    const id = pendingDeleteId;

    if (editId === id) {
      editId = null;
      form = { fullName: "", email: "", role: "", notes: "" };
      clearErrors();
    }

    users = users.filter(u => u.id !== id);
    nextId = computeNextId(users);

    hideConfirm();
  }

  function confirmNo() {
    hideConfirm();
  }

  function onWindowClick() {
    if (!confirmOpen) return;
    hideConfirm();
  }

  function onWindowScrollOrResize() {
    if (!confirmOpen) return;
    hideConfirm();
  }

  function clearFilters() {
    filters = { search: "", role: "" };
  }
</script>

<svelte:window onclick={onWindowClick} onscroll={onWindowScrollOrResize} onresize={onWindowScrollOrResize} />

<ConfirmPopover open={confirmOpen} top={popover.top} left={popover.left} onYes={confirmYes} onNo={confirmNo} />

<header class="container">
  <h1>Менеджер заявок на доступ до лабораторії</h1>
  <p class="muted">ЛР1: CRUD-мінімум для сутності <strong>Users</strong>.</p>
</header>

<main class="container">
  <UserForm
  editMode={editId !== null}
  submitting={submitting}
  form={form}
  errors={errors}
  onSubmit={onSubmit}
  onReset={resetToAdd}
  focusTick={focusTick}
  />

  <section class="card" id="list-section" aria-live="polite">
  <FiltersBar filters={filters} onClear={clearFilters} />
  
    <UsersTable
      users={viewUsers}
      sort={sort}
      onSort={setSort}
      onEdit={onEdit}
      onDelete={requestDelete}
      escapeHtml={escapeHtml}
    />

    <p class="muted" id="emptyState" hidden={viewUsers.length !== 0}>
      Поки що немає записів. Додайте першого користувача.
    </p>
  </section>
</main>
