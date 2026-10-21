const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert");

let mockSupabaseState = {};

function getMockSupabase() {
  return {
    from: (table) => {
      mockSupabaseState.calls.push({ method: "from", table });

      const queryBuilder = {
        select: (cols, options) => {
          mockSupabaseState.calls.push({ method: "select", cols, options });
          return queryBuilder;
        },
        ilike: (col, pattern) => {
          mockSupabaseState.calls.push({ method: "ilike", col, pattern });
          mockSupabaseState.filters.ilike.push({ col, pattern });
          return queryBuilder;
        },
        or: (filterStr) => {
          mockSupabaseState.calls.push({ method: "or", filterStr });
          mockSupabaseState.filters.or.push(filterStr);
          return queryBuilder;
        },
        range: (from, to) => {
          mockSupabaseState.calls.push({ method: "range", from, to });
          mockSupabaseState.filters.range = { from, to };
          return queryBuilder;
        },
        order: (col, options) => {
          mockSupabaseState.calls.push({ method: "order", col, options });
          return queryBuilder;
        },
        then: (resolve, reject) => {
          if (mockSupabaseState.throwError) {
            return Promise.reject(mockSupabaseState.throwError).then(resolve, reject);
          }
          if (mockSupabaseState.queryError) {
            return Promise.resolve({
              data: null,
              count: null,
              error: mockSupabaseState.queryError,
            }).then(resolve, reject);
          }
          return Promise.resolve({
            data: mockSupabaseState.data,
            count:
              mockSupabaseState.count !== undefined
                ? mockSupabaseState.count
                : mockSupabaseState.data.length,
            error: null,
          }).then(resolve, reject);
        },
      };
      return queryBuilder;
    },
  };
}

require.cache[require.resolve("@supabase/supabase-js")] = {
  id: require.resolve("@supabase/supabase-js"),
  filename: require.resolve("@supabase/supabase-js"),
  loaded: true,
  exports: {
    createClient: () => getMockSupabase(),
  },
};

function createMockReq({ headers = {}, query = {}, method = "GET" } = {}) {
  const normalizedHeaders = {};
  for (const [key, value] of Object.entries(headers)) {
    normalizedHeaders[key.toLowerCase()] = value;
  }
  return { headers: normalizedHeaders, query, method };
}

function createMockRes() {
  const headers = {};
  return {
    statusCode: 200,
    headers,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    getHeader(name) {
      return this.headers[name.toLowerCase()];
    },
  };
}

function loadHandler() {
  delete require.cache[require.resolve("./quotes")];
  return require("./quotes");
}

describe("GET /api/quotes - BFF API Endpoint", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.SUPABASE_URL = "https://mock.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy-service-key";
    mockSupabaseState = {
      calls: [],
      filters: { ilike: [], or: [], range: null },
      data: [{ id: 1, quote_text: "Test quote", quote_author: "Test author", category: "Test" }],
      count: 1,
      throwError: null,
      queryError: null,
    };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("1. filters by category using Supabase query builder", async () => {
    const handler = loadHandler();
    const req = createMockReq({ query: { category: "Motivation" } });
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 200);
    const hasCategoryFilter =
      mockSupabaseState.filters.ilike.some((f) => f.col === "category" && f.pattern.includes("Motivation")) ||
      mockSupabaseState.filters.or.some((str) => str.includes("category.ilike.%Motivation%"));
    assert.ok(hasCategoryFilter, "Must apply category filter in Supabase query");
    assert.deepStrictEqual(res.body.data, mockSupabaseState.data);
  });

  it("2. filters by author name using Supabase query builder", async () => {
    const handler = loadHandler();
    const req = createMockReq({ query: { name: "Einstein" } });
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 200);
    const hasAuthorFilter =
      mockSupabaseState.filters.ilike.some((f) => f.col === "quote_author" && f.pattern.includes("Einstein")) ||
      mockSupabaseState.filters.or.some((str) => str.includes("quote_author.ilike.%Einstein%"));
    assert.ok(hasAuthorFilter, "Must apply author name filter in Supabase query");
  });

  it("3. sanitizes PostgREST special/disruptive characters in search query", async () => {
    const handler = loadHandler();
    const maliciousQuery = "test, (injection), syntax";
    const req = createMockReq({ query: { query: maliciousQuery } });
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 200);
    for (const orClause of mockSupabaseState.filters.or) {
      assert.ok(!orClause.includes(", (injection),"), "Disruptive PostgREST commas/parentheses must be sanitized");
      assert.ok(!orClause.includes("syntax%,"), "Comma injection inside PostgREST filter string must be sanitized");
    }
  });

  it("4. handles pagination parameters correctly with .range()", async () => {
    const handler = loadHandler();
    const req = createMockReq({ query: { page: "2", limit: "10" } });
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.deepStrictEqual(
      mockSupabaseState.filters.range,
      { from: 10, to: 19 },
      "page=2 and limit=10 must map to range(10, 19)"
    );
    assert.strictEqual(res.body.page, 2);
  });

  it("5. sanitizes invalid/adversarial pagination bounds safely", async () => {
    const handler = loadHandler();
    const req = createMockReq({ query: { page: "-3", limit: "9999" } });
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(mockSupabaseState.filters.range.from >= 0, "Range offset must never be negative");
    assert.ok(mockSupabaseState.filters.range.to - mockSupabaseState.filters.range.from <= 100, "Limit must be capped defensively");
    assert.strictEqual(res.body.page, 1, "Negative page must default to 1");
  });

  it("6. rejects non-GET HTTP methods with 405 Method Not Allowed", async () => {
    const handler = loadHandler();
    const req = createMockReq({ method: "POST" });
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 405);
    assert.ok(res.headers.allow?.includes("GET"), "Must provide Allow header");
  });

  it("7. returns generic HTTP 500 without leaking credentials or stack traces on DB error", async () => {
    const handler = loadHandler();
    const sensitiveMsg = "FATAL: connect postgres://postgres:p@ssw0rd123@db.supabase.co:5432 failed";
    mockSupabaseState.throwError = new Error(sensitiveMsg);

    const req = createMockReq();
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.notStrictEqual(res.body?.error, sensitiveMsg, "Raw DB error must not leak");
    assert.ok(!JSON.stringify(res.body || {}).includes("p@ssw0rd123"), "Credentials must never leak");
  });

  it("8. returns HTTP 500 when Supabase server credentials are missing", async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_ANON_KEY;

    const handler = loadHandler();
    const req = createMockReq();
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body?.error, "Internal Server Error");
  });

  it("9. sets Cache-Control HTTP headers with s-maxage", async () => {
    const handler = loadHandler();
    const req = createMockReq();
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 200);
    const cacheHeader = res.getHeader("cache-control");
    assert.ok(cacheHeader, "Cache-Control header must be set");
    assert.ok(cacheHeader.includes("s-maxage="), "Cache-Control must contain s-maxage");
  });
});
