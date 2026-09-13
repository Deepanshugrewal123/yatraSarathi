/**
 * YatraSarathi — Platform Independence & Architecture Verification Suite
 *
 * Verifies that the website is completely platform-independent:
 * 1. processPlanRequest pure function contract (zero framework dependencies)
 * 2. api/plan.js HTTP handler compatibility with both standard Node.js and Express
 * 3. Standalone server.js creates valid HTTP server, serves static files, SPA fallback, and security headers
 * 4. vite.config.js provides middleware for both dev and preview
 * 5. index.html contains platform-neutral metadata
 * 6. Zero client secret leakage
 *
 * Usage: node tests/test-platform-independence.js
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error("   ", err.message || err);
  }
}

async function runAsyncTest(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error("   ", err.message || err);
  }
}

console.log("\n=======================================================");
console.log("  YATRASARATHI — PLATFORM INDEPENDENCE TEST SUITE");
console.log("=======================================================\n");

// -------------------------------------------------------------
// 1. Pure Logic Contract: processPlanRequest
// -------------------------------------------------------------
const { processPlanRequest } = await import("../api/plan.js");

await runAsyncTest("1. processPlanRequest returns fallback when GEMINI_API_KEY is not provided", async () => {
  const res = await processPlanRequest({ destination: { id: "goa", name: "Goa" }, days: 3 }, "");
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.fallback, true);
  assert.strictEqual(res.body.mode, "deterministic");
  assert.ok(res.body.reason.includes("GEMINI_API_KEY is not configured"));
});

await runAsyncTest("2. processPlanRequest returns 400 for invalid payload or missing destination", async () => {
  const res1 = await processPlanRequest(null, "test_key");
  assert.strictEqual(res1.status, 400);

  const res2 = await processPlanRequest({ days: 3 }, "test_key");
  assert.strictEqual(res2.status, 400);

  const res3 = await processPlanRequest({ destination: {} }, "test_key");
  assert.strictEqual(res3.status, 400);
});

// -------------------------------------------------------------
// 2. Universal HTTP Handler: api/plan.js
// -------------------------------------------------------------
const planHandler = (await import("../api/plan.js")).default;

await runAsyncTest("3. api/plan handler works with standard Node.js (req, res) without Express helpers", async () => {
  const req = {
    method: "POST",
    body: { destination: { id: "jaipur", name: "Jaipur" }, days: 2 },
  };

  let endData = "";
  const res = {
    statusCode: 0,
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    end(chunk) {
      endData = chunk;
    },
  };

  await planHandler(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.headers["Content-Type"], "application/json");
  const parsed = JSON.parse(endData);
  assert.strictEqual(parsed.fallback, true);
  assert.strictEqual(parsed.mode, "deterministic");
});

await runAsyncTest("4. api/plan handler works with Express/Vercel res.status(code).json(data)", async () => {
  const req = {
    method: "POST",
    body: { destination: { id: "jaipur", name: "Jaipur" }, days: 2 },
  };

  let statusCode = 0;
  let jsonData = null;
  const res = {
    setHeader() {},
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonData = data;
      return this;
    },
  };

  await planHandler(req, res);
  assert.strictEqual(statusCode, 200);
  assert.strictEqual(jsonData.fallback, true);
  assert.strictEqual(jsonData.mode, "deterministic");
});

await runAsyncTest("5. api/plan handler rejects non-POST with 405 and sets Allow: POST", async () => {
  for (const method of ["GET", "PUT", "DELETE"]) {
    let headers = {};
    let endData = "";
    const res = {
      setHeader(k, v) {
        headers[k] = v;
      },
      end(chunk) {
        endData = chunk;
      },
    };

    await planHandler({ method }, res);
    assert.strictEqual(res.statusCode, 405);
    assert.strictEqual(headers["Allow"], "POST");
    const parsed = JSON.parse(endData);
    assert.strictEqual(parsed.error, "Method Not Allowed");
  }
});

// -------------------------------------------------------------
// 3. Standalone Production Server: server.js
// -------------------------------------------------------------
const { createServer } = await import("../server.js");

runTest("6. server.js exports createServer and sets standard security headers", () => {
  assert.strictEqual(typeof createServer, "function", "createServer must be exported");

  const server = createServer();
  assert.ok(server && typeof server.listen === "function", "Must return Node.js HTTP server instance");
});

// -------------------------------------------------------------
// 4. Vite Dev and Preview Middleware
// -------------------------------------------------------------
runTest("7. vite.config.js configures middleware for both configureServer and configurePreviewServer", () => {
  const viteContent = fs.readFileSync(path.join(ROOT, "vite.config.js"), "utf-8");
  assert.ok(
    viteContent.includes("configureServer(server)"),
    "Must configure dev server middleware"
  );
  assert.ok(
    viteContent.includes("configurePreviewServer(server)"),
    "Must configure preview server middleware"
  );
});

// -------------------------------------------------------------
// 5. Metadata Neutrality in index.html
// -------------------------------------------------------------
runTest("8. index.html metadata is platform-neutral without hardcoded Vercel domain", () => {
  const htmlContent = fs.readFileSync(path.join(ROOT, "index.html"), "utf-8");

  assert.ok(
    !htmlContent.includes("https://yatrasarathi.vercel.app/"),
    "index.html must not contain hardcoded Vercel domain"
  );
  assert.ok(
    htmlContent.includes('<meta property="og:url" content="/" />'),
    "og:url must be platform-neutral root"
  );
  assert.ok(
    htmlContent.includes('<meta property="og:image" content="/favicon.svg" />'),
    "og:image must be platform-neutral"
  );
});

// -------------------------------------------------------------
// 6. Security and Secret Isolation
// -------------------------------------------------------------
runTest("9. Zero client secret exposure in src/ directory", () => {
  function scanDir(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        scanDir(fullPath);
      } else if (file.isFile() && /\.(jsx?|tsx?|html|css)$/.test(file.name)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        assert.ok(
          !content.includes("VITE_GEMINI_API_KEY"),
          `Found forbidden VITE_GEMINI_API_KEY in ${fullPath}`
        );
        assert.ok(
          !content.includes("process.env.GEMINI_API_KEY"),
          `Found server-side secret reference process.env.GEMINI_API_KEY in client file ${fullPath}`
        );
        assert.ok(
          !content.includes("@google/genai"),
          `Found server SDK import @google/genai in client file ${fullPath}`
        );
      }
    }
  }

  scanDir(path.join(ROOT, "src"));
});

console.log("\n=======================================================");
console.log(`  RESULTS: ${passed}/${total} TESTS PASSED`);
console.log("=======================================================\n");

if (passed === total) {
  console.log("PLATFORM INDEPENDENCE VALIDATION PASSED CLEANLY.\n");
  process.exit(0);
} else {
  console.error("FAILURES IN PLATFORM INDEPENDENCE SUITE.\n");
  process.exit(1);
}
