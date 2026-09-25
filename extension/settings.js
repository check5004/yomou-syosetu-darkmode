/* Shared by the isolated content script and the extension popup. */
(() => {
  "use strict";

  const STORAGE_KEY = "yomouDarkSettings";
  const DEFAULTS = Object.freeze({
    mode: "dark",
    palette: "night",
    customReader: false,
    fontSize: 18,
    lineHeight: 2,
  });

  function boundedNumber(value, fallback, min, max, step) {
    if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
    const bounded = Math.min(max, Math.max(min, value));
    return Math.round(bounded / step) * step;
  }

  function normalizeSettings(value) {
    const source = value && typeof value === "object" ? value : {};
    return {
      mode: ["dark", "light", "system"].includes(source.mode) ? source.mode : DEFAULTS.mode,
      palette: ["night", "ink", "warm"].includes(source.palette) ? source.palette : DEFAULTS.palette,
      customReader: typeof source.customReader === "boolean" ? source.customReader : DEFAULTS.customReader,
      fontSize: boundedNumber(source.fontSize, DEFAULTS.fontSize, 14, 28, 1),
      lineHeight: Number(boundedNumber(source.lineHeight, DEFAULTS.lineHeight, 1.6, 2.8, 0.1).toFixed(1)),
    };
  }

  async function readSettings() {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return normalizeSettings(result[STORAGE_KEY]);
  }

  // Serialize quick changes within the popup so slider/toggle writes cannot
  // overtake one another. Read the latest settings before merging each patch.
  let pendingWrite = Promise.resolve();
  function saveSettings(patch) {
    const next = pendingWrite.then(async () => {
      const current = await readSettings();
      const settings = normalizeSettings({ ...current, ...patch });
      await chrome.storage.local.set({ [STORAGE_KEY]: settings });
      return settings;
    });
    pendingWrite = next.catch(() => {});
    return next;
  }

  globalThis.YomouDark = Object.freeze({ STORAGE_KEY, DEFAULTS, normalizeSettings, readSettings, saveSettings });
})();
