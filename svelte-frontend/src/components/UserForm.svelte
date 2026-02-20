<script>
  let {
    editMode = false,
    submitting = false,
    form,
    errors,
    onSubmit = () => {},
    onReset = () => {},
    focusTick = 0
  } = $props();

  let fullNameInput;

  $effect(() => {
    focusTick;
    fullNameInput?.focus();
  });
</script>

<section class="card" id="create-section">
  <h2>{editMode ? "Редагувати користувача" : "Додати користувача"}</h2>

  <form id="userForm" novalidate onsubmit={onSubmit}>
    <div class="field">
      <label for="fullNameInput">Ім’я / ПІБ</label>
      <input
        id="fullNameInput"
        bind:this={fullNameInput}
        name="fullName"
        type="text"
        placeholder="Напр., Павло Іваненко"
        bind:value={form.fullName}
        class:is-invalid={!!errors.fullName}
        autocomplete="name"
      />
      <p class="error-text" id="fullNameError">{errors.fullName}</p>
    </div>

    <div class="field">
      <label for="emailInput">Email</label>
      <input
        id="emailInput"
        name="email"
        type="email"
        placeholder="name@example.com"
        bind:value={form.email}
        class:is-invalid={!!errors.email}
        autocomplete="email"
      />
      <p class="error-text" id="emailError">{errors.email}</p>
    </div>

    <div class="field">
      <span class="label">Роль</span>
      <div
        class="role-options"
        id="roleOptions"
        role="radiogroup"
        aria-label="Роль"
        class:is-invalid={!!errors.role}
      >
        <label class="role-option">
          <input type="radio" name="role" value="Студент" bind:group={form.role} />
          <span>Студент</span>
        </label>
        <label class="role-option">
          <input type="radio" name="role" value="Викладач" bind:group={form.role} />
          <span>Викладач</span>
        </label>
        <label class="role-option">
          <input type="radio" name="role" value="Гість" bind:group={form.role} />
          <span>Гість</span>
        </label>
      </div>
      <p class="error-text" id="roleError">{errors.role}</p>
    </div>

    <div class="field">
      <label for="notesInput">Коментар (необов’язково)</label>
      <textarea
        id="notesInput"
        name="notes"
        rows="4"
        maxlength="300"
        placeholder="Напр., потрібен доступ до хім. лабораторії на 2 години"
        bind:value={form.notes}
        class:is-invalid={!!errors.notes}
      ></textarea>
      <p class="error-text" id="notesError">{errors.notes}</p>
    </div>

    <div class="buttons">
      <button type="submit" id="submitBtn" disabled={submitting}>
        {editMode ? "Зберегти" : "Додати"}
      </button>
      <button type="button" id="resetBtn" onclick={onReset}>Очистити</button>
    </div>
  </form>
</section>
