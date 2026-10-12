const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const componentPath = path.join(__dirname, "../src/components/sites/pacomepertant-com-b16b412f/root-8a5edab2/EntranceOverlay.tsx");
const compiled = ts.transpileModule(fs.readFileSync(componentPath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
let activeErrors;
process.on("unhandledRejection", (error) => activeErrors?.push(error.message));
const flush = () => new Promise((resolve) => setImmediate(resolve));

function mount(options = {}) {
  let now = 0, nextTimer = 1, cursor = 0, firstRender = true, mounted = true, tree;
  const timers = new Map(), hooks = [], effects = [], cleanups = [], segments = [], stoppedFrames = [], dismissed = [], errors = [];
  activeErrors = errors;
  const clock = {
    set(callback, delay = 0) { const id = nextTimer++; timers.set(id, { callback, at: now + delay }); return id; },
    clear(id) { timers.delete(id); },
    tick(delay) {
      const end = now + delay;
      for (let count = 0; count < 1000; count++) {
        const due = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) { now = end; return; }
        now = due[1].at; timers.delete(due[0]); due[1].callback();
      }
      throw new Error("Timer loop did not settle");
    },
    get count() { return timers.size; },
  };
  const listeners = new Map();
  let loadedTimer;
  const animation = {
    totalFrames: 67, destroyed: false,
    addEventListener(name, callback) { listeners.set(name, [...(listeners.get(name) || []), callback]); },
    removeEventListener(name, callback) { listeners.set(name, (listeners.get(name) || []).filter((item) => item !== callback)); },
    playSegments(frames) { segments.push({ frames, at: now }); },
    goToAndStop(frame, isFrame) { stoppedFrames.push({ frame, isFrame }); },
    destroy() { this.destroyed = true; clock.clear(loadedTimer); },
  };
  const emit = (name) => (listeners.get(name) || []).forEach((callback) => callback());
  const container = {
    querySelector: () => ({ getBoundingClientRect: () => ({ x: 158, y: 124.2, width: 31, height: 31 }) }),
    parentElement: { getBoundingClientRect: () => ({ x: 0, y: 0, width: 460, height: 300 }) },
  };
  const jsx = (type, props) => ({ type, props: props || {} });
  const visit = (node, callback) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) { node.forEach((child) => visit(child, callback)); return; }
    callback(node); visit(node.props?.children, callback);
  };
  const text = (node) => typeof node === "string" ? node : Array.isArray(node) ? node.map(text).join("") : text(node?.props?.children || "");
  let Component;
  const render = () => {
    if (!mounted) throw new Error("State update after unmount");
    cursor = 0; tree = Component({ onDismiss: (sound) => dismissed.push(sound) });
    visit(tree, (node) => { if (node.props.ref) node.props.ref.current = container; });
    firstRender = false;
  };
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = initial;
      return [hooks[index], (value) => { hooks[index] = typeof value === "function" ? value(hooks[index]) : value; render(); }];
    },
    useRef(initial) { const index = cursor++; return hooks[index] ||= { current: initial }; },
    useEffect(effect) { cursor++; if (firstRender) effects.push(effect); },
  };
  class Image {
    decode() {
      if (options.decode === "reject") return Promise.reject(new Error("Image decode failed"));
      if (options.decode === "pending") return new Promise(() => {});
      return Promise.resolve();
    }
  }
  const modules = {
    react, "react-dom": { flushSync: (callback) => callback() },
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "next/image": { getImageProps: ({ src }) => ({ props: { src } }) },
    "./Chrome.module.css": { __esModule: true, default: new Proxy({}, { get: (_, name) => name }) },
    "./SiteChrome": { setAmbientEnabled: () => options.audio === "pending" ? new Promise(() => {}) : Promise.resolve() },
    "lottie-web": { __esModule: true, default: { loadAnimation: () => {
      loadedTimer = clock.set(() => emit("DOMLoaded"), 0); return animation;
    } } },
  };
  const exports = {};
  const sandbox = {
    exports, module: { exports }, require: (name) => { assert.ok(modules[name], `Unexpected module ${name}`); return modules[name]; },
    Image, console, setTimeout: clock.set, clearTimeout: clock.clear,
    window: { setTimeout: clock.set, clearTimeout: clock.clear, matchMedia: () => ({ matches: Boolean(options.reducedMotion) }) },
    fetch: async () => {
      if (options.fetch === "reject") throw new Error("Fetch failed");
      return { ok: options.fetch !== "http-error", status: options.fetch === "http-error" ? 503 : 200, json: async () => ({ layers: [], assets: [], fonts: { list: [] } }) };
    },
  };
  vm.runInNewContext(compiled, sandbox, { filename: componentPath });
  Component = exports.default; render();
  effects.forEach((effect) => { const cleanup = effect(); if (cleanup) cleanups.push(cleanup); });
  return {
    clock, segments, stoppedFrames, dismissed, errors, animation, emit,
    button(label) { let button; visit(tree, (node) => { if (node.type === "button" && text(node).trim() === label) button = node; }); assert.ok(button, `Missing button ${label}`); return button; },
    hasClass(name) { let found = false; visit(tree, (node) => { if (node.props.className?.split(" ").includes(name)) found = true; }); return found; },
    unmount() { cleanups.forEach((cleanup) => cleanup()); mounted = false; activeErrors = undefined; },
  };
}

async function start(harness) { await flush(); harness.clock.tick(0); await flush(); }
function assertReady(harness) {
  assert.equal(harness.button("enter website").props.disabled, false, "Entry remains locked");
  assert.equal(harness.button("enter without sound").props.disabled, false, "Silent entry remains locked");
}
async function finish(harness) {
  await start(harness); harness.emit("complete"); harness.clock.tick(2040); harness.emit("complete"); await flush();
  assertReady(harness);
}

const tests = [
  ["decode rejection allows entry", async () => {
    const h = mount({ decode: "reject" });
    try { await start(h); h.clock.tick(12000); await flush(); assertReady(h); assert.ok(h.hasClass("entranceFinal")); assert.deepEqual(h.errors, []); }
    finally { h.unmount(); }
  }],
  ["fetch rejection allows entry", async () => {
    const h = mount({ fetch: "reject" });
    try { await start(h); h.clock.tick(12000); await flush(); assertReady(h); assert.deepEqual(h.errors, []); }
    finally { h.unmount(); }
  }],
  ["HTTP failure bypasses Lottie and allows entry", async () => {
    const h = mount({ fetch: "http-error" });
    try { await start(h); assertReady(h); assert.ok(h.hasClass("entranceFinal")); assert.equal(h.segments.length, 0); assert.deepEqual(h.errors, []); }
    finally { h.unmount(); }
  }],
  ...["error", "data_failed"].map((event) => [`Lottie ${event} clears pending stages and allows entry`, async () => {
    const h = mount();
    try {
      await start(h); h.emit("complete"); h.clock.tick(400); h.emit(event);
      assertReady(h); assert.ok(h.hasClass("entranceFinal")); assert.equal(h.hasClass("entranceArtStageActive"), false); assert.equal(h.animation.destroyed, true);
      h.clock.tick(12000); assertReady(h); assert.equal(h.segments.length, 1); assert.equal(h.clock.count, 0); assert.deepEqual(h.errors, []);
    } finally { h.unmount(); }
  }]),
  ["pending resources unlock at the 12 second watchdog", async () => {
    const h = mount({ decode: "pending" });
    try { await start(h); h.clock.tick(11999); assert.equal(h.button("enter website").props.disabled, true); h.clock.tick(1); await flush(); assertReady(h); assert.ok(h.hasClass("entranceFinal")); }
    finally { h.unmount(); }
  }],
  ["normal Lottie and artwork timings remain intact", async () => {
    const h = mount();
    try {
      await start(h); assert.equal(JSON.stringify(h.segments.map((item) => item.frames)), "[[0,20]]");
      h.clock.tick(800); h.emit("complete"); assert.ok(h.hasClass("entranceArtStageActive"));
      h.clock.tick(1899); assert.equal(h.hasClass("entranceArtStageLeaving"), false);
      h.clock.tick(1); assert.ok(h.hasClass("entranceArtStageLeaving"));
      h.clock.tick(139); assert.equal(h.segments.length, 1);
      h.clock.tick(1); assert.equal(JSON.stringify(h.segments.map((item) => item.frames)), "[[0,20],[50,67]]"); assert.ok(h.hasClass("entranceFinal"));
      h.clock.tick(379); assert.ok(h.hasClass("entranceArtStageActive"));
      h.clock.tick(1); assert.equal(h.hasClass("entranceArtStageActive"), false);
      h.clock.tick(300); h.emit("complete"); assertReady(h); assert.deepEqual(h.errors, []);
    } finally { h.unmount(); }
  }],
  ["completed animation cancels the loading watchdog", async () => {
    const h = mount();
    try {
      await finish(h); h.clock.tick(12000); assertReady(h); assert.ok(h.hasClass("entranceFinal"));
      assert.equal(h.animation.destroyed, false, "Watchdog destroys an already completed animation"); assert.equal(h.segments.length, 2); assert.equal(h.clock.count, 0); assert.deepEqual(h.errors, []);
    } finally { h.unmount(); }
  }],
  ["reduced motion shows the final frame and unlocks immediately", async () => {
    const h = mount({ reducedMotion: true });
    try {
      await start(h); assertReady(h); assert.ok(h.hasClass("entranceFinal")); assert.equal(h.segments.length, 0); assert.deepEqual(h.stoppedFrames, [{ frame: 66, isFrame: true }]);
      h.clock.tick(12000); assertReady(h); assert.equal(h.animation.destroyed, false); assert.equal(h.clock.count, 0); assert.deepEqual(h.errors, []);
    } finally { h.unmount(); }
  }],
  ["pending audio does not delay exit", async () => {
    const h = mount({ audio: "pending" });
    try { await finish(h); h.button("enter website").props.onClick(); await flush(); h.clock.tick(500); assert.deepEqual(h.dismissed, [true]); }
    finally { h.unmount(); }
  }],
  ["unmount clears animation and exit timers", async () => {
    const h = mount(); await finish(h); h.button("enter without sound").props.onClick(); await flush();
    assert.ok(h.clock.count > 0); h.unmount(); assert.equal(h.clock.count, 0, "Timers survive unmount"); h.clock.tick(20000); assert.deepEqual(h.dismissed, []); assert.equal(h.animation.destroyed, true);
  }],
];

(async () => {
  let failed = 0;
  for (const [name, run] of tests) {
    try { await run(); console.log(`PASS ${name}`); }
    catch (error) { failed++; console.error(`FAIL ${name}: ${error.message}`); }
  }
  console.log(`${tests.length - failed}/${tests.length} entrance regressions passed`);
  process.exitCode = failed ? 1 : 0;
})();
