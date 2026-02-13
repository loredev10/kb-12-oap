(() => {
  const btn = document.getElementById("helloBtn");
  const statusText = document.getElementById("statusText");
  const metaText = document.getElementById("metaText");

  const now = () => new Date().toLocaleString();

  metaText.textContent = `Loaded at: ${now()}`;

  btn.addEventListener("click", () => {
    statusText.textContent = "clicked!";
    metaText.textContent = `Last click: ${now()}`;

    window.clearTimeout(btn._t);
    btn._t = window.setTimeout(() => {
      statusText.textContent = "waiting…";
    }, 1200);
  });
})();