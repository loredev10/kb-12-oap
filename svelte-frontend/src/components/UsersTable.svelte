<script>
  const props = $props();
</script>

<h2>Список користувачів</h2>

<table id="usersTable">
  <thead>
    <tr>
      <th>#</th>
      <th class="sortable" onclick={() => props.onSort?.("fullName")}>
        Ім’я{props.sort?.key === "fullName" ? (props.sort.dir === "asc" ? " ▲" : " ▼") : ""}
      </th>
      <th class="sortable" onclick={() => props.onSort?.("email")}>
        Email{props.sort?.key === "email" ? (props.sort.dir === "asc" ? " ▲" : " ▼") : ""}
      </th>
      <th class="sortable" onclick={() => props.onSort?.("role")}>
        Роль{props.sort?.key === "role" ? (props.sort.dir === "asc" ? " ▲" : " ▼") : ""}
      </th>
      <th>Коментар</th>
      <th>Дії</th>
    </tr>
  </thead>

  <tbody id="usersTableBody">
    {#each (props.users ?? []) as u, idx (u.id)}
      <tr data-id={u.id}>
        <td>{idx + 1}</td>
        <td>{u.fullName}</td>
        <td>{u.email}</td>
        <td>{u.role}</td>
        <td>{u.notes || ""}</td>
        <td>
          <button type="button" class="row-btn" onclick={() => props.onEdit?.(u.id)}>Редагувати</button>
          <button type="button" class="row-btn" onclick={(e) => props.onDelete?.(u.id, e)}>Видалити</button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
