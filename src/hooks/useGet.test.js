const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

// 1. Hook de chargement pour transpiler la syntaxe ESM (import/export) dans Node
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

// 2. Harness React Hook pour environnement Node.js
let currentHarness = null;

const mockReact = {
  useState(initial) {
    if (!currentHarness) {
      throw new Error("Hooks must be called inside the harness");
    }
    return currentHarness.useState(initial);
  },
  useEffect(effect, deps) {
    if (!currentHarness) {
      throw new Error("Hooks must be called inside the harness");
    }
    return currentHarness.useEffect(effect, deps);
  },
  useCallback(fn, deps) {
    if (!currentHarness) {
      throw new Error("Hooks must be called inside the harness");
    }
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
    const hasChanged =
      !prev || !deps || deps.some((d, i) => d !== prev.deps[i]);
    if (hasChanged) {
      this.effects[idx] = { effect, deps, hasRun: false };
    }
  }

  useCallback(fn, deps) {
    const idx = this.callbackIndex++;
    const prev = this.callbacks[idx];
    const hasChanged =
      !prev || !deps || deps.some((d, i) => d !== prev.deps[i]);
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

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 10));
}

function loadUseGet() {
  const filePath = require.resolve("./useGet");
  delete require.cache[filePath];
  return require("./useGet").useGet;
}

describe("useGet Hook - BFF Migration & Security", () => {
  let originalFetch;
  let fetchCalls;

  beforeEach(() => {
    originalFetch = global.fetch;
    fetchCalls = [];

    global.fetch = async (url, opts = {}) => {
      fetchCalls.push({ url: String(url), opts });
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: [
            {
              id: 1,
              quote_text: "Life is short",
              quote_author: "Seneca",
              category: "Philosophie",
            },
          ],
          count: 42,
          page: 1,
          limit: 8,
        }),
      };
    };

    // Sentinelle de sécurité : le client Supabase ne doit JAMAIS être importé ni accédé
    const supabasePath = path.resolve(__dirname, "../utils/supabaseClient");
    try {
      const resolved = require.resolve(supabasePath);
      require.cache[resolved] = {
        id: resolved,
        filename: resolved,
        loaded: true,
        exports: {
          get supabase() {
            throw new Error(
              "SECURITY VIOLATION: useGet directly accessed Supabase client instead of BFF /api/quotes"
            );
          },
        },
      };
    } catch (_) {}
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("1. calls /api/quotes BFF endpoint with URL-encoded query parameters", async () => {
    const useGet = loadUseGet();
    const harness = new HookHarness(useGet);

    harness.render({
      query: "sagesse & vérité",
      name: "René Descartes",
      category: "Philosophie / Morale",
      enabled: true,
    });

    await flushPromises();
    harness.render({
      query: "sagesse & vérité",
      name: "René Descartes",
      category: "Philosophie / Morale",
      enabled: true,
    });

    assert.ok(fetchCalls.length > 0, "useGet must invoke fetch to /api/quotes");
    const [call] = fetchCalls;
    assert.ok(call.url.startsWith("/api/quotes"), "Must call relative BFF endpoint /api/quotes");
    assert.ok(
      call.url.includes("query=" + encodeURIComponent("sagesse & vérité")),
      "query parameter must be URL-encoded"
    );
    assert.ok(
      call.url.includes("name=" + encodeURIComponent("René Descartes")),
      "name parameter must be URL-encoded"
    );
    assert.ok(
      call.url.includes("category=" + encodeURIComponent("Philosophie / Morale")),
      "category parameter must be URL-encoded"
    );
  });

  it("2. cancels stale in-flight requests via AbortController on new input", async () => {
    const useGet = loadUseGet();
    const harness = new HookHarness(useGet);

    // Première recherche
    harness.render({ query: "prem", enabled: true });
    assert.ok(fetchCalls.length >= 1, "First search must initiate fetch");
    const firstCall = fetchCalls[0];
    const firstSignal = firstCall.opts.signal;

    assert.ok(firstSignal, "Fetch call must be passed an AbortSignal");
    assert.strictEqual(firstSignal.aborted, false, "First signal should not be aborted yet");

    // Deuxième recherche rapide avant fin de la première
    harness.render({ query: "deuxieme", enabled: true });

    assert.strictEqual(
      firstSignal.aborted,
      true,
      "Previous in-flight request must be aborted when query changes"
    );
    assert.ok(fetchCalls.length >= 2, "Second search must initiate new fetch");
  });

  it("3. sets count from API response json.count (total matching count, not page length)", async () => {
    global.fetch = async (url, opts) => {
      fetchCalls.push({ url, opts });
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: [
            { id: 1, quote_text: "Quote 1" },
            { id: 2, quote_text: "Quote 2" },
          ],
          count: 150,
        }),
      };
    };

    const useGet = loadUseGet();
    const harness = new HookHarness(useGet);

    harness.render({ query: "test", enabled: true });
    await flushPromises();
    const result = harness.render({ query: "test", enabled: true });

    assert.strictEqual(result.count, 150, "count must reflect json.count from BFF API");
    assert.strictEqual(result.data.length, 2, "data length reflects current page results");
  });

  it("4. handles HTTP errors (e.g. 500) gracefully without crashing component", async () => {
    global.fetch = async () => ({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({ error: "Failed to fetch quotes" }),
    });

    const useGet = loadUseGet();
    const harness = new HookHarness(useGet);

    harness.render({ query: "fail", enabled: true });
    await flushPromises();
    const result = harness.render({ query: "fail", enabled: true });

    assert.strictEqual(result.isLoading, false, "isLoading must reset to false on error");
    assert.deepStrictEqual(result.data, [], "data must default to empty array on error");
    assert.ok(result.error, "error must contain error message on HTTP failure");
  });

  it("5. does not import or depend on Supabase browser client", () => {
    const hookSourcePath = path.resolve(__dirname, "useGet.js");
    const source = fs.readFileSync(hookSourcePath, "utf8");

    assert.ok(
      !source.includes("supabaseClient"),
      "useGet source code must not import supabaseClient"
    );
    assert.ok(
      !source.includes("supabase.from"),
      "useGet must not invoke supabase client directly in browser"
    );
  });
});
