const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { HookHarness, flushPromises } = require("./helpers/hookHarness");

function loadUseGet() {
  const filePath = require.resolve("../src/hooks/useGet");
  delete require.cache[filePath];
  return require("../src/hooks/useGet").useGet;
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
    const supabasePath = path.resolve(__dirname, "../src/utils/supabaseClient");
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

    harness.render({ query: "prem", enabled: true });
    assert.ok(fetchCalls.length >= 1, "First search must initiate fetch");
    const firstCall = fetchCalls[0];
    const firstSignal = firstCall.opts.signal;

    assert.ok(firstSignal, "Fetch call must be passed an AbortSignal");
    assert.strictEqual(firstSignal.aborted, false, "First signal should not be aborted yet");

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
    const hookSourcePath = path.resolve(__dirname, "../src/hooks/useGet.js");
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
