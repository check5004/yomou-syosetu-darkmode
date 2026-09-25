"use strict";

(() => {
  const api = globalThis.YomouDark;
  const form = document.getElementById("settings-form");
  const controls = document.getElementById("settings-controls");
  const readerToggle = document.getElementById("custom-reader");
  const readerControls = document.getElementById("reader-controls");
  const fontSize = document.getElementById("font-size");
  const lineHeight = document.getElementById("line-height");
  const fontSizeOutput = document.getElementById("font-size-output");
  const lineHeightOutput = document.getElementById("line-height-output");
  const preview = document.getElementById("preview");
  const previewText = document.getElementById("preview-text");
  const status = document.getElementById("save-status");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  let settings;
  let revision = 0;
  let saveQueue = Promise.resolve();

  function setStatus(message, error = false) {
    status.textContent = message;
    status.dataset.error = String(error);
  }

  function render() {
    form.elements.mode.value = settings.mode;
    form.elements.palette.value = settings.palette;
    readerToggle.checked = settings.customReader;
    readerControls.disabled = !settings.customReader;
    fontSize.value = String(settings.fontSize);
    lineHeight.value = String(settings.lineHeight);
    fontSizeOutput.value = `${settings.fontSize} px`;
    lineHeightOutput.value = `${settings.lineHeight.toFixed(1)} 倍`;
    fontSize.setAttribute("aria-valuetext", `${settings.fontSize} ピクセル`);
    lineHeight.setAttribute("aria-valuetext", `${settings.lineHeight.toFixed(1)} 倍`);
    preview.dataset.palette = settings.palette;
    preview.dataset.mode = settings.mode === "system"
      ? (systemTheme.matches ? "dark" : "light")
      : settings.mode;
    const useTypography = settings.customReader && preview.dataset.mode === "dark";
    previewText.style.fontSize = useTypography ? `${settings.fontSize}px` : "";
    previewText.style.lineHeight = useTypography ? String(settings.lineHeight) : "";
  }

  function update(partial) {
    settings = api.normalizeSettings({ ...settings, ...partial });
    render();
    const snapshot = { ...settings };
    const currentRevision = ++revision;
    setStatus("保存しています…");
    saveQueue = saveQueue.then(() => api.saveSettings(snapshot)).then(() => {
      if (currentRevision === revision) setStatus("設定を保存しました");
    }).catch(() => {
      if (currentRevision === revision) {
        setStatus("保存できませんでした。もう一度設定を変更してください。", true);
      }
    });
  }

  form.addEventListener("submit", (event) => event.preventDefault());
  form.addEventListener("change", (event) => {
    const input = event.target;
    if (!settings) return;
    if (input.name === "mode" || input.name === "palette") {
      update({ [input.name]: input.value });
    } else if (input.name === "customReader") {
      update({ customReader: input.checked });
    }
  });
  fontSize.addEventListener("input", () => {
    if (settings) update({ fontSize: Number(fontSize.value) });
  });
  lineHeight.addEventListener("input", () => {
    if (settings) update({ lineHeight: Number(lineHeight.value) });
  });
  systemTheme.addEventListener("change", () => {
    if (settings) render();
  });

  async function initialize() {
    try {
      settings = await api.readSettings();
      render();
      controls.disabled = false;
      setStatus("設定は自動で保存されます");
    } catch {
      if (api) {
        settings = api.normalizeSettings(api.DEFAULTS);
        render();
        controls.disabled = false;
      }
      setStatus("設定を読み込めませんでした。拡張機能を開き直してください。", true);
    }
  }

  initialize();
})();
