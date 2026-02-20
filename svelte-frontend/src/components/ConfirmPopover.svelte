<script>
  let {
    open = false,
    top = 0,
    left = 0,
    onYes = () => {},
    onNo = () => {}
  } = $props();
</script>

<div
  id="confirmPopover"
  class="confirm-popover"
  hidden={!open}
  style="position:absolute; top:{top}px; left:{left}px;"
  onclick={(e) => e.stopPropagation()}
>
  <span class="confirm-text">Видалити запис?</span>
  <div class="confirm-actions">
    <button type="button" class="confirm-btn" title="Підтвердити" onclick={(e) => { e.stopPropagation(); onYes(); }}>Ок</button>
    <button type="button" class="confirm-btn" title="Скасувати" onclick={(e) => { e.stopPropagation(); onNo(); }}>Не ок</button>
  </div>
</div>
