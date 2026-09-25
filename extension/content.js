(() => {
  "use strict";

  const { STORAGE_KEY, DEFAULTS, normalizeSettings, readSettings } = globalThis.YomouDark;
  const systemTheme = matchMedia("(prefers-color-scheme: dark)");
  let settings = DEFAULTS;
  let ready = false;
  let storageRevision = 0;

  function applyTheme() {
    const root = document.documentElement;
    if (!ready || !root) return;
    const dark = settings.mode === "dark" || (settings.mode === "system" && systemTheme.matches);

    if (!dark) {
      root.removeAttribute("data-yomou-dark");
      root.removeAttribute("data-yomou-palette");
      root.removeAttribute("data-yomou-reader");
      root.style.removeProperty("--yd-reader-size");
      root.style.removeProperty("--yd-reader-leading");
      return;
    }

    root.setAttribute("data-yomou-dark", "on");
    root.setAttribute("data-yomou-palette", settings.palette);
    if (settings.customReader) {
      root.setAttribute("data-yomou-reader", "on");
      root.style.setProperty("--yd-reader-size", `${settings.fontSize}px`);
      root.style.setProperty("--yd-reader-leading", String(settings.lineHeight));
    } else {
      root.removeAttribute("data-yomou-reader");
      root.style.removeProperty("--yd-reader-size");
      root.style.removeProperty("--yd-reader-leading");
    }
  }

  // document_start can precede creation of <html>. Observe only the document,
  // never the novel text or individual page elements.
  if (!document.documentElement) {
    const rootObserver = new MutationObserver(() => {
      if (document.documentElement) {
        rootObserver.disconnect();
        applyTheme();
      }
    });
    rootObserver.observe(document, { childList: true });
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !Object.hasOwn(changes, STORAGE_KEY)) return;
    storageRevision += 1;
    settings = normalizeSettings(changes[STORAGE_KEY].newValue);
    ready = true;
    applyTheme();
  });
  systemTheme.addEventListener("change", applyTheme);
  window.addEventListener("pageshow", applyTheme);

  const initialRevision = storageRevision;
  readSettings().then((saved) => {
    if (storageRevision !== initialRevision) return;
    settings = saved;
    ready = true;
    applyTheme();
  }).catch(() => {
    // If extension storage is temporarily unavailable, use safe defaults.
    if (storageRevision !== initialRevision) return;
    ready = true;
    applyTheme();
  });
})();
