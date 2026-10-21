const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert");

// Mock Supabase
let mockSupabaseState = {};

function getMockSupabase() {
  return {
    from: (table) => {
      if (mockSupabaseState.throwError) {
        throw mockSupabaseState.throwError;
      }

      if (table === "quotes") {
        return {
          select: (cols, options) => {
            if (options?.head) {
              return Promise.resolve({
                count: mockSupabaseState.quotesCount || 1,
                error: null,
              });
            }
            return {
              range: () => ({
                single: () =>
                  Promise.resolve({
                    data: mockSupabaseState.quote || {
                      id: 1,
                      quote_text: "La persévérance mène au succès.",
                      quote_author: "Anonyme",
                    },
                    error: null,
                  }),
              }),
            };
          },
        };
      }

      if (table === "articles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: mockSupabaseState.existingArticle || {
                    id: 99,
                    title: "Article Déjà Publié",
                  },
                  error: null,
                }),
            }),
          }),
        };
      }

      return {};
    },
  };
}

// Hook require cache pour @supabase/supabase-js
require.cache[require.resolve("@supabase/supabase-js")] = {
  id: require.resolve("@supabase/supabase-js"),
  filename: require.resolve("@supabase/supabase-js"),
  loaded: true,
  exports: {
    createClient: () => getMockSupabase(),
  },
};

function createMockReq({ headers = {}, query = {}, method = "POST" } = {}) {
  const normalizedHeaders = {};
  for (const [key, value] of Object.entries(headers)) {
    normalizedHeaders[key.toLowerCase()] = value;
  }
  return {
    headers: normalizedHeaders,
    query,
    method,
  };
}

function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
}

function loadHandler() {
  delete require.cache[require.resolve("./daily-update")];
  return require("./daily-update");
}

describe("POST /api/daily-update - Cron Security & Authentication", () => {
  const originalEnv = { ...process.env };
  const VALID_SECRET = "super-secret-cron-token-42";

  beforeEach(() => {
    process.env.SUPABASE_URL = "https://mock.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy-service-key";
    process.env.CRON_SECRET = VALID_SECRET;
    mockSupabaseState = {
      quotesCount: 5,
      quote: { id: 1, quote_text: "Quote", quote_author: "Author" },
      existingArticle: { id: 10, title: "Article Already Exists" },
      throwError: null,
    };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("1. rejects with HTTP 401 when Authorization header is absent", async () => {
    const handler = loadHandler();
    const req = createMockReq({ headers: {} });
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 401, "Missing Authorization header must return 401");
    assert.strictEqual(res.body?.error, "Unauthorized");
  });

  it("2. rejects with HTTP 401 on spoofed 'User-Agent: vercel-cron' without secret (anti-spoofing)", async () => {
    const handler = loadHandler();
    const req = createMockReq({
      headers: {
        "user-agent": "vercel-cron/1.0",
      },
    });
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(
      res.statusCode,
      401,
      "Spoofed User-Agent 'vercel-cron' must be rejected with 401"
    );
    assert.strictEqual(res.body?.error, "Unauthorized");
  });

  it("3. rejects with HTTP 401 when Bearer token is invalid or malformed", async () => {
    const handler = loadHandler();

    // 3a. Invalid token value
    const resWrong = createMockRes();
    await handler(
      createMockReq({ headers: { authorization: "Bearer wrong-secret" } }),
      resWrong
    );
    assert.strictEqual(resWrong.statusCode, 401, "Invalid Bearer token must return 401");

    // 3b. Malformed scheme (Basic instead of Bearer)
    const resBasic = createMockRes();
    await handler(
      createMockReq({ headers: { authorization: "Basic some-token" } }),
      resBasic
    );
    assert.strictEqual(resBasic.statusCode, 401, "Non-Bearer scheme must return 401");

    // 3c. Empty Bearer token
    const resEmpty = createMockRes();
    await handler(
      createMockReq({ headers: { authorization: "Bearer " } }),
      resEmpty
    );
    assert.strictEqual(resEmpty.statusCode, 401, "Empty Bearer token must return 401");

    // 3d. Query parameter token bypass rejected (must require header)
    const resQuery = createMockRes();
    await handler(
      createMockReq({ headers: {}, query: { token: VALID_SECRET } }),
      resQuery
    );
    assert.strictEqual(
      resQuery.statusCode,
      401,
      "URL query token must be rejected in favor of Authorization header"
    );
  });

  it("4. rejects with HTTP 500 or 401 when CRON_SECRET is not configured on server (no bypass)", async () => {
    delete process.env.CRON_SECRET;
    const handler = loadHandler();

    const req = createMockReq({
      headers: {},
      query: {},
    });
    const res = createMockRes();

    await handler(req, res);

    assert.ok(
      res.statusCode === 500 || res.statusCode === 401,
      `Expected 500 or 401 when CRON_SECRET is missing, got ${res.statusCode}`
    );
    assert.notStrictEqual(
      res.statusCode,
      200,
      "Must NEVER allow access or return 200 when CRON_SECRET is undefined"
    );
  });

  it("5. accepts with HTTP 200 when valid 'Authorization: Bearer <valid_token>' is provided", async () => {
    const handler = loadHandler();
    const req = createMockReq({
      headers: {
        authorization: `Bearer ${VALID_SECRET}`,
      },
    });
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(
      res.statusCode,
      200,
      `Expected HTTP 200 with valid Bearer token, got ${res.statusCode}`
    );
    assert.ok(res.body, "Response must include JSON body");
  });

  it("6. does not leak raw internal error details in HTTP 500 responses", async () => {
    const handler = loadHandler();
    const sensitiveErrorMsg =
      "FATAL_DB_LEAK: connection to postgresql://postgres:p@ssw0rd123@db.supabase.co:5432/quoter timed out";

    mockSupabaseState.throwError = new Error(sensitiveErrorMsg);

    const req = createMockReq({
      headers: {
        authorization: `Bearer ${VALID_SECRET}`,
      },
    });
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 500, "Should return 500 on internal exception");
    assert.notStrictEqual(
      res.body?.error,
      sensitiveErrorMsg,
      "Raw internal error message must not be exposed to client"
    );
    assert.ok(
      !JSON.stringify(res.body || {}).includes("p@ssw0rd123"),
      "Sensitive database credentials must never leak into response payload"
    );
  });
});
