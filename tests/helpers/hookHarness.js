const fs = require("node:fs");
const path = require("node:path");

// Transpileur ESM minimal pour modules sous test
const originalJsHandler = require.extensions[".js"];
require.extensions[".js"] = function (module, filename) {
  if (
    filename.includes(path.join("src", "hooks", "useGet.js")) ||
    filename.includes(path.join("src", "utils", "supabaseClient.js"))
  ) {
    let content = fs.readFileSync(filename, "utf8");
    content = content
      .replace(
        /import\s+\{\s*([^}]+)\s*\}\s+from\s+["']([^"']+)["'];?/g,
        'const { $1 } = require("$2");'
      )
      .replace(
        /import\s+([a-zA-Z0-9_$]+)\s+from\s+["']([^"']+)["'];?/g,
        'const $1 = require("$2");'
      )
      .replace(
        /export\s+const\s+([a-zA-Z0-9_$]+)\s*=/g,
        "const $1 = exports.$1 ="
      )
      .replace(/export\s+default\s+([a-zA-Z0-9_$]+);?/g, "module.exports = $1;");
    module._compile(content, filename);
  } else {
    originalJsHandler(module, filename);
  }
};

let currentHarness = null;

const mockReact = {
  useState(initial) {
    if (!currentHarness) throw new Error("Hooks must be called inside the harness");
    return currentHarness.useState(initial);
  },
  useEffect(effect, deps) {
    if (!currentHarness) throw new Error("Hooks must be called inside the harness");
    return currentHarness.useEffect(effect, deps);
  },
  useCallback(fn, deps) {
    if (!currentHarness) throw new Error("Hooks must be called inside the harness");
    return currentHarness.useCallback(fn, deps);
  },
};

require.cache[require.resolve("react")] = {
  id: require.resolve("react"),
  filename: require.resolve("react"),
  loaded: true,
  exports: mockReact,
};

class HookHarness {
  constructor(hookFn) {
    this.hookFn = hookFn;
    this.states = [];
    this.stateIndex = 0;
    this.effects = [];
    this.effectIndex = 0;
    this.callbacks = [];
    this.callbackIndex = 0;
    this.cleanups = [];
    this.result = undefined;
    this.props = undefined;
  }

  useState(initial) {
    const idx = this.stateIndex++;
    if (idx >= this.states.length) {
      const val = typeof initial === "function" ? initial() : initial;
      this.states.push(val);
    }
    const setter = (nextVal) => {
      this.states[idx] =
        typeof nextVal === "function" ? nextVal(this.states[idx]) : nextVal;
    };
    return [this.states[idx], setter];
  }

  useEffect(effect, deps) {
    const idx = this.effectIndex++;
    const prev = this.effects[idx];
    const hasChanged = !prev || !deps || deps.some((d, i) => d !== prev.deps[i]);
    if (hasChanged) {
      this.effects[idx] = { effect, deps, hasRun: false };
    }
  }

  useCallback(fn, deps) {
    const idx = this.callbackIndex++;
    const prev = this.callbacks[idx];
    const hasChanged = !prev || !deps || deps.some((d, i) => d !== prev.deps[i]);
    if (hasChanged) {
      this.callbacks[idx] = { fn, deps };
      return fn;
    }
    return prev.fn;
  }

  render(props) {
    this.props = props;
    this.stateIndex = 0;
    this.effectIndex = 0;
    this.callbackIndex = 0;
    currentHarness = this;
    try {
      this.result = this.hookFn(this.props);
    } finally {
      currentHarness = null;
    }

    for (let i = 0; i < this.effects.length; i++) {
      const eff = this.effects[i];
      if (!eff.hasRun) {
        if (typeof this.cleanups[i] === "function") {
          try {
            this.cleanups[i]();
          } catch (_) {}
        }
        eff.hasRun = true;
        const cleanup = eff.effect();
        if (typeof cleanup === "function") {
          this.cleanups[i] = cleanup;
        }
      }
    }
    return this.result;
  }

  unmount() {
    for (const cleanup of this.cleanups) {
      if (typeof cleanup === "function") {
        try {
          cleanup();
        } catch (_) {}
      }
    }
    this.cleanups = [];
  }
}

function flushPromises(ms = 10) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { HookHarness, flushPromises };
