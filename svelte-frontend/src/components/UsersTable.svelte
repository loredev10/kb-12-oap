<script>
  let {
    users = [],
    sort,
    onSort = () => {},
    onEdit = () => {},
    onDelete = () => {},
    escapeHtml = (v) => String(v)
  } = $props();
</script>

<h2>Список користувачів</h2>

<table id="usersTable">
  <thead>
    <tr>
      <th>#</th>
      <th class="sortable" onclick={() => onSort("fullName")}>
        Ім’я{sort?.key === "fullName" ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}
      </th>
      <th class="sortable" onclick={() => onSort("email")}>
        Email{sort?.key === "email" ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}
      </th>
      <th class="sortable" onclick={() => onSort("role")}>
        Роль{sort?.key === "role" ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}
      </th>
      <th>Коментар</th>
      <th>Дії</th>
    </tr>
  </thead>

  <tbody id="usersTableBody">
    {#each users as u, idx (u.id)}
      <tr data-id={u.id}>
        <td>{idx + 1}</td>
        <td>{@html escapeHtml(u.fullName)}</td>
        <td>{@html escapeHtml(u.email)}</td>
        <td>{@html escapeHtml(u.role)}</td>
        <td>{@html escapeHtml(u.notes || "")}</td>
        <td>
          <button type="button" class="row-btn" onclick={() => onEdit(u.id)}>Редагувати</button>
          <button type="button" class="row-btn" onclick={(e) => onDelete(u.id, e)}>Видалити</button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
