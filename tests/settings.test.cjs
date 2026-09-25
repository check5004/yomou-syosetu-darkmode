"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { plain, settle, deferred, settingsHarness } = require("./helpers.cjs");

test("invalid or absent storage values recover to usable defaults", () => {
  const api = settingsHarness({});
  const expected = { mode: "dark", palette: "night", customReader: false, fontSize: 18, lineHeight: 2 };
  for (const invalid of [undefined, null, false, "dark", 7, [], {}]) {
    assert.deepEqual(plain(api.normalizeSettings(invalid)), expected);
  }
  assert.deepEqual(plain(api.normalizeSettings({
    mode: "auto", palette: "unknown", customReader: "true", fontSize: "24", lineHeight: Infinity,
  })), expected);
  assert.equal(api.normalizeSettings({ fontSize: NaN, lineHeight: NaN }).fontSize, 18);
  assert.ok(Object.isFrozen(api.DEFAULTS));
});

test("reader controls clamp and round values without modifying caller data", () => {
  const api = settingsHarness({});
  const settings = { mode: "system", palette: "warm", customReader: true, fontSize: 80, lineHeight: 0.5, extra: "ignored" };
  assert.deepEqual(plain(api.normalizeSettings(settings)), {
    mode: "system", palette: "warm", customReader: true, fontSize: 28, lineHeight: 1.6,
  });
  assert.equal(settings.fontSize, 80);
  assert.equal(settings.lineHeight, 0.5);
  assert.deepEqual(plain(api.normalizeSettings({ mode: "light", palette: "ink", fontSize: -9, lineHeight: 9 })), {
    mode: "light", palette: "ink", customReader: false, fontSize: 14, lineHeight: 2.8,
  });
  assert.equal(api.normalizeSettings({ fontSize: 19.8 }).fontSize, 20);
  assert.equal(api.normalizeSettings({ lineHeight: 2.24 }).lineHeight, 2.2);
  assert.equal(api.normalizeSettings({ lineHeight: 2.26 }).lineHeight, 2.3);
});

test("reading missing preferences uses defaults and accesses only the extension key", async () => {
  const keys = [];
  const api = settingsHarness({ get: async (key) => { keys.push(key); return {}; } });
  assert.deepEqual(plain(await api.readSettings()), plain(api.DEFAULTS));
  assert.deepEqual(keys, [api.STORAGE_KEY]);
});

test("rapid saves wait for prior commits and merge into their latest result", async () => {
  const firstCommit = deferred();
  let stored;
  const calls = [];
  let writes = 0;
  const api = settingsHarness({
    get: async (key) => { calls.push("read"); return { [key]: stored }; },
    set: async (value) => {
      calls.push("write");
      if (++writes === 1) await firstCommit.promise;
      stored = plain(value.yomouDarkSettings);
    },
  });
  const first = api.saveSettings({ mode: "system", palette: "warm" });
  const second = api.saveSettings({ customReader: true, fontSize: 23 });
  const third = api.saveSettings({ lineHeight: 2.4 });
  await settle();
  assert.deepEqual(calls, ["read", "write"], "later requests must not read stale storage while the first commit is pending");
  firstCommit.resolve();
  const results = await Promise.all([first, second, third]);
  assert.deepEqual(stored, { mode: "system", palette: "warm", customReader: true, fontSize: 23, lineHeight: 2.4 });
  assert.equal(results[0].customReader, false);
  assert.equal(results[1].lineHeight, 2);
  assert.deepEqual(calls, ["read", "write", "read", "write", "read", "write"]);
});

test("one rejected write does not poison subsequent preference saves", async () => {
  let stored = { mode: "light", palette: "ink" };
  let writes = 0;
  const api = settingsHarness({
    get: async (key) => ({ [key]: stored }),
    set: async (value) => {
      if (++writes === 1) throw new Error("Storage temporarily unavailable");
      stored = plain(value.yomouDarkSettings);
    },
  });
  const failed = api.saveSettings({ mode: "dark" });
  const next = api.saveSettings({ fontSize: 22 });
  await assert.rejects(failed, /temporarily unavailable/);
  assert.deepEqual(plain(await next), { mode: "light", palette: "ink", customReader: false, fontSize: 22, lineHeight: 2 });
  assert.equal(writes, 2);
});
