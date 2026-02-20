<script>
  let { filters, onClear = () => {} } = $props();
</script>

<div class="controls">
  <div class="control">
    <label for="searchInput">Пошук (ім’я або email)</label>
    <input id="searchInput" type="text" placeholder="Введіть текст..." bind:value={filters.search} />
  </div>

  <div class="control">
    <label for="roleFilter">Фільтр за роллю</label>
    <select id="roleFilter" bind:value={filters.role}>
      <option value="">Оберіть роль</option>
      <option value="Студент">Студент</option>
      <option value="Викладач">Викладач</option>
      <option value="Гість">Гість</option>
    </select>
  </div>

  <div class="control control-btn">
    <button type="button" id="clearFiltersBtn" onclick={onClear}>Скинути</button>
  </div>
</div>
