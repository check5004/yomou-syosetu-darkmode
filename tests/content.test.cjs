"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { deferred, settle, contentHarness } = require("./helpers.cjs");

test("first install enables the night palette without overriding reader typography", async () => {
  const app = contentHarness();
  await settle();
  assert.equal(app.root.getAttribute("data-yomou-dark"), "on");
  assert.equal(app.root.getAttribute("data-yomou-palette"), "night");
  assert.equal(app.root.getAttribute("data-yomou-reader"), null);
  assert.equal(app.root.styles.size, 0);
});

test("saved light mode stays off even when the OS is dark", async () => {
  const app = contentHarness({ saved: { mode: "light" }, darkSystem: true });
  await settle();
  assert.equal(app.root.getAttribute("data-yomou-dark"), null);
  app.setSystemDark(false);
  app.setSystemDark(true);
  assert.equal(app.root.getAttribute("data-yomou-dark"), null);
});

test("Nocturne site styling follows initial and live theme preferences", async () => {
  const app = contentHarness({ hostname: "noc.syosetu.com" });
  await settle();
  assert.equal(app.root.getAttribute("data-yomou-site"), "noc");
  app.changeSettings({ mode: "light" });
  assert.equal(app.root.getAttribute("data-yomou-site"), null);
  app.changeSettings({ mode: "dark" });
  assert.equal(app.root.getAttribute("data-yomou-site"), "noc");
});

test("saved light mode removes Nocturne site styling on startup", async () => {
  const app = contentHarness({ hostname: "noc.syosetu.com", saved: { mode: "light" }, darkSystem: true });
  app.root.setAttribute("data-yomou-site", "noc");
  await settle();
  assert.equal(app.root.getAttribute("data-yomou-site"), null);
});

test("other hosts never receive Nocturne site styling", async () => {
  for (const hostname of ["yomou.syosetu.com", "syosetu.com", "ncode.syosetu.com", "novel18.syosetu.com", "mnlt.syosetu.com", "mid.syosetu.com"]) {
    const app = contentHarness({ hostname });
    app.root.setAttribute("data-yomou-site", "noc");
    await settle();
    assert.equal(app.root.getAttribute("data-yomou-dark"), "on");
    assert.equal(app.root.getAttribute("data-yomou-site"), null, hostname);
  }
});

test("system mode tracks OS changes and forced dark mode remains on", async () => {
  const app = contentHarness({ saved: { mode: "system", palette: "warm" } });
  await settle();
  assert.equal(app.root.getAttribute("data-yomou-dark"), null);
  app.setSystemDark(true);
  assert.equal(app.root.getAttribute("data-yomou-dark"), "on");
  assert.equal(app.root.getAttribute("data-yomou-palette"), "warm");
  app.setSystemDark(false);
  assert.equal(app.root.getAttribute("data-yomou-dark"), null);
  app.changeSettings({ mode: "dark", palette: "ink" });
  app.setSystemDark(true);
  app.setSystemDark(false);
  assert.equal(app.root.getAttribute("data-yomou-dark"), "on");
  assert.equal(app.root.getAttribute("data-yomou-palette"), "ink");
});

test("live preference changes update reader styling, and disabling preserves site state", async () => {
  const app = contentHarness();
  app.root.setAttribute("class", "site-layout");
  app.root.setAttribute("data-site-theme", "original");
  app.root.style.setProperty("color", "red");
  app.root.style.setProperty("--site-spacing", "12px");
  await settle();
  app.changeSettings({ mode: "dark", palette: "warm", customReader: true, fontSize: 21, lineHeight: 2.3 });
  assert.equal(app.root.getAttribute("data-yomou-reader"), "on");
  assert.equal(app.root.style.getPropertyValue("--yd-reader-size"), "21px");
  assert.equal(app.root.style.getPropertyValue("--yd-reader-leading"), "2.3");
  app.changeSettings({ mode: "dark", palette: "warm", customReader: false });
  assert.equal(app.root.getAttribute("data-yomou-dark"), "on");
  assert.equal(app.root.getAttribute("data-yomou-reader"), null);
  assert.equal(app.root.style.getPropertyValue("--yd-reader-size"), "");
  assert.equal(app.root.style.getPropertyValue("--yd-reader-leading"), "");
  app.changeSettings({ mode: "dark", customReader: true });
  app.changeSettings({ mode: "light", customReader: true });
  assert.deepEqual([...app.root.attributes], [["class", "site-layout"], ["data-site-theme", "original"]]);
  assert.deepEqual([...app.root.styles], [["color", "red"], ["--site-spacing", "12px"]]);
});

test("unrelated storage areas and keys do not change the displayed theme", async () => {
  const app = contentHarness({ saved: { mode: "dark", palette: "ink" } });
  await settle();
  app.changeSettings({ mode: "light" }, "sync");
  app.emitChanges({ otherPreference: { newValue: { mode: "light" } } });
  assert.equal(app.root.getAttribute("data-yomou-dark"), "on");
  assert.equal(app.root.getAttribute("data-yomou-palette"), "ink");
});

test("deleting saved preferences immediately restores first-install defaults", async () => {
  const app = contentHarness({ saved: { mode: "light" } });
  await settle();
  app.emitChanges({ [app.key]: { oldValue: { mode: "light" } } });
  assert.equal(app.root.getAttribute("data-yomou-dark"), "on");
  assert.equal(app.root.getAttribute("data-yomou-palette"), "night");
});

for (const outcome of ["resolve", "reject"]) {
  test(`a late initial storage ${outcome} cannot overwrite a newer live preference change`, async () => {
    const initialRead = deferred();
    const app = contentHarness({ initialRead });
    assert.equal(app.root.getAttribute("data-yomou-dark"), null);
    app.changeSettings({ mode: "light" });
    if (outcome === "resolve") initialRead.resolve({ [app.key]: { mode: "dark" } });
    else initialRead.reject(new Error("Storage offline"));
    await settle();
    assert.equal(app.root.getAttribute("data-yomou-dark"), null);
  });
}

test("storage failure on startup still gives a working default theme", async () => {
  const initialRead = deferred();
  const app = contentHarness({ initialRead });
  initialRead.reject(new Error("Storage offline"));
  await settle();
  assert.equal(app.root.getAttribute("data-yomou-dark"), "on");
  assert.equal(app.root.getAttribute("data-yomou-palette"), "night");
});

for (const rootFirst of [true, false]) {
  test(`document_start works when the root appears ${rootFirst ? "before" : "after"} saved preferences load`, async () => {
    const initialRead = deferred();
    const app = contentHarness({ initialRead, missingRoot: true });
    assert.equal(app.observers.length, 1);
    assert.equal(app.observers[0].target, app.document);
    assert.deepEqual(app.observers[0].options, { childList: true });
    if (rootFirst) app.createRoot();
    initialRead.resolve({ [app.key]: { mode: "dark", palette: "warm" } });
    await settle();
    if (!rootFirst) app.createRoot();
    assert.equal(app.root.getAttribute("data-yomou-dark"), "on");
    assert.equal(app.root.getAttribute("data-yomou-palette"), "warm");
    assert.equal(app.observers[0].disconnected, true);
  });
}

test("a restored page reapplies the current preference", async () => {
  const app = contentHarness({ saved: { mode: "system" }, darkSystem: true });
  await settle();
  app.media.matches = false;
  app.window.dispatch("pageshow");
  assert.equal(app.root.getAttribute("data-yomou-dark"), null);
});
