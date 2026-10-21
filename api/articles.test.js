const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert");

let mockSupabaseState = {};

function createMockSupabaseClient() {
  return {
    from(table) {
      return {
        select(cols) {
          const query = {
            table,
            cols,
            filters: {},
            limitVal: 50,
            orderVal: null,
            eq(col, val) {
              query.filters[col] = val;
              return query;
            },
            order(col, opts) {
              query.orderVal = { col, ...opts };
              return query;
            },
            limit(n) {
              query.limitVal = n;
              return query;
            },
            async maybeSingle() {
              if (mockSupabaseState.simulateError) {
                return { data: null, error: new Error("DB Error") };
              }
              const id = query.filters.id;
              if (id === "123") {
                return {
                  data: {
                    id: 123,
                    title: "Article Test",
                    content: { intro: "Intro", points: [] },
                  },
                  error: null,
                };
              }
              return { data: null, error: null };
            },
            then(resolve) {
              if (mockSupabaseState.simulateError) {
                return resolve({ data: null, error: new Error("DB Error") });
              }
              resolve({
                data: [
                  { id: 1, title: "Article 1" },
                  { id: 2, title: "Article 2" },
                ],
                error: null,
              });
            },
          };
          return query;
        },
      };
    },
  };
}

const originalEnv = { ...process.env };

describe("GET /api/articles - BFF Endpoint", () => {
  let articlesHandler;

  beforeEach(() => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon-key-test";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    mockSupabaseState = { simulateError: false };

    const supabaseMod = require("@supabase/supabase-js");
    supabaseMod.createClient = () => createMockSupabaseClient();

    const handlerPath = require.resolve("./articles");
    delete require.cache[handlerPath];
    articlesHandler = require("./articles");
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("1. returns 405 on non-GET methods", async () => {
    const headers = {};
    const res = {
      setHeader: (k, v) => {
        headers[k] = v;
      },
      status: (code) => ({
        json: (data) => ({ status: code, data, headers }),
      }),
    };
    const response = await articlesHandler({ method: "POST" }, res);
    assert.strictEqual(response.status, 405);
    assert.strictEqual(headers["Allow"], "GET");
  });

  it("2. returns 500 when Supabase env variables are missing", async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    const res = {
      setHeader: () => {},
      status: (code) => ({ json: (data) => ({ status: code, data }) }),
    };
    const response = await articlesHandler({ method: "GET" }, res);
    assert.strictEqual(response.status, 500);
  });

  it("3. fetches article list when no id is provided", async () => {
    const res = {
      setHeader: () => {},
      status: (code) => ({ json: (data) => ({ status: code, data }) }),
    };
    const response = await articlesHandler({ method: "GET", query: {} }, res);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.data.length, 2);
  });

  it("4. fetches single article by id", async () => {
    const res = {
      setHeader: () => {},
      status: (code) => ({ json: (data) => ({ status: code, data }) }),
    };
    const response = await articlesHandler(
      { method: "GET", query: { id: "123" } },
      res
    );
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.data.id, 123);
  });

  it("5. returns 404 when article by id is not found", async () => {
    const res = {
      setHeader: () => {},
      status: (code) => ({ json: (data) => ({ status: code, data }) }),
    };
    const response = await articlesHandler(
      { method: "GET", query: { id: "999" } },
      res
    );
    assert.strictEqual(response.status, 404);
  });

  it("6. masks errors and returns 500 on database failure", async () => {
    mockSupabaseState.simulateError = true;
    const res = {
      setHeader: () => {},
      status: (code) => ({ json: (data) => ({ status: code, data }) }),
    };
    const response = await articlesHandler({ method: "GET", query: {} }, res);
    assert.strictEqual(response.status, 500);
    assert.strictEqual(response.data.error, "Failed to fetch articles");
  });
});
