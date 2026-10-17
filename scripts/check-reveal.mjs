// Focused lifecycle checks using the project's existing TypeScript compiler.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync("src/components/use-reveal.ts", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function setup(reduced = false, supported = true) {
  let effect, intersection, mutation, mediaChange, focus;
  let disconnected = 0;
  const timers = new Map();
  const parent = {};
  class Element {
    constructor() {
      this.dataset = {};
      this.parentElement = parent;
      this.values = new Map();
      this.style = {
        setProperty: (key, value) => this.values.set(key, value),
        getPropertyValue: key => this.values.get(key),
        removeProperty: key => this.values.delete(key),
      };
    }
    contains() { return false; }
    closest() { return this; }
  }
  const elements = [new Element(), new Element(), new Element()];
  const observed = new Set();
  class Observer {
    constructor(callback, options) { intersection = callback; assert.equal(options.threshold, 0.15); }
    observe(element) { observed.add(element); }
    unobserve(element) { observed.delete(element); }
    disconnect() { disconnected++; observed.clear(); }
  }
  const media = {
    matches: reduced,
    addEventListener: (_event, cb) => { mediaChange = cb; },
    removeEventListener() {},
  };
  const context = {
    exports: {},
    require: () => ({ useEffect: callback => { effect = callback; } }),
    window: { matchMedia: () => media, ...(supported ? { IntersectionObserver: Observer } : {}) },
    IntersectionObserver: Observer,
    MutationObserver: class { constructor(cb) { mutation = cb; } observe() {} disconnect() {} },
    Element,
    document: {
      activeElement: null,
      querySelectorAll: selector => selector === ".cards > *" ? elements : [],
      addEventListener: (_event, cb) => { focus = cb; },
      removeEventListener() {},
    },
    setTimeout: (cb, delay) => { const id = timers.size + 1; timers.set(id, { cb, delay }); return id; },
    clearTimeout: id => timers.delete(id),
  };
  vm.runInNewContext(compiled, context);
  context.exports.useReveal([{ selector: ".cards > *", stagger: 90 }]);
  const cleanup = effect();
  return { elements, observed, timers, media, cleanup,
    enter: (element, ratio = 0.2) => intersection([{ target: element, isIntersecting: true, intersectionRatio: ratio }]),
    change: () => mediaChange(), focus: element => focus({ target: element }), mutate: () => mutation(),
    disconnected: () => disconnected,
  };
}

const normal = setup();
assert.equal(normal.observed.size, 3);
assert.equal(normal.elements[1].style.getPropertyValue("--reveal-delay"), "90ms");
assert.equal(normal.elements[0].dataset.revealState, undefined, "Waiting content remains visible");
normal.enter(normal.elements[0], 0.1);
assert.equal(normal.elements[0].dataset.revealState, undefined);
normal.enter(normal.elements[0]);
assert.equal(normal.elements[0].dataset.revealState, "running");
assert.equal(normal.observed.size, 2);
normal.timers.values().next().value.cb();
assert.equal(normal.elements[0].dataset.revealState, "done");
normal.enter(normal.elements[0]);
assert.equal(normal.elements[0].dataset.revealState, "done", "Reveal does not repeat");
normal.enter(normal.elements[1]);
normal.focus(normal.elements[1]);
assert.equal(normal.elements[1].dataset.revealState, "done", "Keyboard focus cancels delay");
normal.media.matches = true;
normal.change();
assert.ok(normal.elements.every(e => e.dataset.revealState === "done"));
assert.equal(normal.timers.size, 0);
normal.cleanup();
assert.ok(normal.elements.every(e => !e.dataset.reveal && !e.dataset.revealState));
assert.equal(normal.timers.size, 0);

const reduced = setup(true);
assert.equal(reduced.observed.size, 0);
assert.ok(reduced.elements.every(e => e.dataset.revealState === "done"));
reduced.cleanup();
const unsupported = setup(false, false);
assert.ok(unsupported.elements.every(e => !e.dataset.revealState));
assert.equal(unsupported.cleanup, undefined);
console.log("Reveal checks passed: threshold, stagger, once-only, keyboard focus, reduced motion, cleanup, unsupported-browser fallback.");
