"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = (name) => fs.readFileSync(path.join(__dirname, "..", "extension", name), "utf8");
const plain = (value) => JSON.parse(JSON.stringify(value));
const settle = () => new Promise((resolve) => setImmediate(resolve));

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function eventTarget() {
  const listeners = new Map();
  return {
    addEventListener(type, listener) {
      const group = listeners.get(type) || [];
      group.push(listener);
      listeners.set(type, group);
    },
    dispatch(type) {
      for (const listener of listeners.get(type) || []) listener({ type });
    },
  };
}

function rootElement() {
  const attributes = new Map();
  const styles = new Map();
  return {
    attributes,
    styles,
    getAttribute: (name) => attributes.get(name) ?? null,
    setAttribute: (name, value) => attributes.set(name, String(value)),
    removeAttribute: (name) => attributes.delete(name),
    style: {
      setProperty: (name, value) => styles.set(name, String(value)),
      removeProperty: (name) => styles.delete(name),
      getPropertyValue: (name) => styles.get(name) || "",
    },
  };
}

function settingsHarness(local) {
  const context = vm.createContext({ chrome: { storage: { local } } });
  vm.runInContext(source("settings.js"), context, { filename: "settings.js" });
  return context.YomouDark;
}

function contentHarness({ saved, darkSystem = false, missingRoot = false, initialRead } = {}) {
  const changes = [];
  const observers = [];
  const root = rootElement();
  const document = { documentElement: missingRoot ? null : root };
  const window = eventTarget();
  const media = { ...eventTarget(), matches: darkSystem };
  const chrome = {
    storage: {
      local: {
        get: async (key) => initialRead ? initialRead.promise : { [key]: saved },
        set: async () => { throw new Error("Content scripts must not write preferences"); },
      },
      onChanged: { addListener: (listener) => changes.push(listener) },
    },
  };
  class MutationObserver {
    constructor(callback) {
      this.callback = callback;
      this.disconnected = false;
      observers.push(this);
    }
    observe(target, options) { this.target = target; this.options = plain(options); }
    disconnect() { this.disconnected = true; }
  }
  const context = vm.createContext({
    chrome, document, window, MutationObserver,
    matchMedia(query) {
      if (query !== "(prefers-color-scheme: dark)") throw new Error(`Unexpected media query: ${query}`);
      return media;
    },
  });
  vm.runInContext(source("settings.js"), context, { filename: "settings.js" });
  vm.runInContext(source("content.js"), context, { filename: "content.js" });
  return {
    root, document, media, window, observers,
    key: context.YomouDark.STORAGE_KEY,
    emitChanges(value, area = "local") {
      for (const listener of changes) listener(value, area);
    },
    changeSettings(value, area = "local") {
      for (const listener of changes) listener({ [context.YomouDark.STORAGE_KEY]: { newValue: value } }, area);
    },
    setSystemDark(value) { media.matches = value; media.dispatch("change"); },
    createRoot() {
      document.documentElement = root;
      for (const observer of observers) if (!observer.disconnected) observer.callback();
    },
  };
}

module.exports = { plain, settle, deferred, settingsHarness, contentHarness };
