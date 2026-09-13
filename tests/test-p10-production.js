/**
 * YatraSarathi — Phase P10: Production Deployment & Live Validation Suite
 *
 * Verifies production environment configuration, vercel.json routing,
 * serverless /api/plan handler error/fallback states, secret isolation,
 * production bundle output, PWA asset resolution, and security headers.
 *
 * Usage: node tests/test-p10-production.js
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
console.log("  YATRASARATHI — PHASE P10 PRODUCTION VALIDATION SUITE");
console.log("=======================================================\n");

// Helper to mock serverless req/res
function createMockReqRes({ method = "POST", body = {}, headers = {} } = {}) {
  const req = {
    method,
    body,
    headers,
    url: "/api/plan",
  };

  const res = {
    statusCode: 200,
    headersSent: {},
    responseData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, value) {
      this.headersSent[key] = value;
      return this;
    },
    json(data) {
      this.responseData = data;
      return this;
    },
    end() {
      return this;
    },
  };

  return { req, res };
}

// -------------------------------------------------------------
// 1. Vercel Configuration Validation
// -------------------------------------------------------------
runTest("1. vercel.json exists, is valid JSON, and defines required SPA routing", () => {
  const vercelPath = path.join(ROOT, "vercel.json");
  assert.ok(fs.existsSync(vercelPath), "vercel.json must exist in root");

  const config = JSON.parse(fs.readFileSync(vercelPath, "utf-8"));
  assert.ok(Array.isArray(config.rewrites), "rewrites array must exist");

  const apiRewrite = config.rewrites.find((r) => r.source === "/api/(.*)");
  assert.ok(apiRewrite, "Must include rewrite rule for /api/(.*)");
  assert.strictEqual(apiRewrite.destination, "/api/$1");

  const spaRewrite = config.rewrites.find((r) => r.destination === "/index.html");
  assert.ok(spaRewrite, "Must include SPA fallback rewrite to /index.html");
});

runTest("2. vercel.json defines required service worker and security headers", () => {
  const config = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf-8"));
  assert.ok(Array.isArray(config.headers), "headers array must exist");

  const swHeader = config.headers.find((h) => h.source === "/sw.js");
  assert.ok(swHeader, "Must have header rule for /sw.js");
  const swAllowed = swHeader.headers.find((h) => h.key === "Service-Worker-Allowed");
  assert.ok(swAllowed && swAllowed.value === "/", "Service-Worker-Allowed must be /");
  const swCache = swHeader.headers.find((h) => h.key === "Cache-Control");
  assert.ok(swCache && swCache.value.includes("max-age=0"), "sw.js cache must be max-age=0");

  const globalHeader = config.headers.find((h) => h.source === "/(.*)");
  assert.ok(globalHeader, "Must have global security headers for /(.*)");
  const nosniff = globalHeader.headers.find((h) => h.key === "X-Content-Type-Options");
  assert.ok(nosniff && nosniff.value === "nosniff");
  const frameDeny = globalHeader.headers.find((h) => h.key === "X-Frame-Options");
  assert.ok(frameDeny && frameDeny.value === "DENY");
  const referrer = globalHeader.headers.find((h) => h.key === "Referrer-Policy");
  assert.ok(referrer && referrer.value === "strict-origin-when-cross-origin");
});

// -------------------------------------------------------------
// 2. Serverless API Handler Behavior
// -------------------------------------------------------------
const planHandler = (await import("../api/plan.js")).default;

await runAsyncTest("3. /api/plan rejects non-POST methods with 405 Method Not Allowed", async () => {
  for (const method of ["GET", "PUT", "DELETE", "PATCH"]) {
    const { req, res } = createMockReqRes({ method });
    await planHandler(req, res);
    assert.strictEqual(res.statusCode, 405, `Method ${method} must return 405`);
    assert.strictEqual(res.responseData.error, "Method Not Allowed");
    assert.ok(res.headersSent["Allow"], "Must include Allow header");
  }
});

await runAsyncTest("4. /api/plan gracefully falls back when GEMINI_API_KEY is unconfigured", async () => {
  const origKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  try {
    const { req, res } = createMockReqRes({
      method: "POST",
      body: { destination: { id: "jaipur", name: "Jaipur" }, days: 3 },
    });

    await planHandler(req, res);
    assert.strictEqual(res.statusCode, 200, "Must return 200 to prevent client crash");
    assert.strictEqual(res.responseData.fallback, true, "Must signal fallback: true");
    assert.strictEqual(res.responseData.mode, "deterministic");
    assert.ok(res.responseData.reason.includes("Falling back to verified standard planner"));
  } finally {
    if (origKey !== undefined) {
      process.env.GEMINI_API_KEY = origKey;
    }
  }
});

await runAsyncTest("5. /api/plan rejects malformed or missing request body with 400 Bad Request", async () => {
  // Save key if set
  const origKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "dummy_test_key_for_validation";

  try {
    // Empty body
    const { req: req1, res: res1 } = createMockReqRes({ method: "POST", body: null });
    await planHandler(req1, res1);
    assert.strictEqual(res1.statusCode, 400);

    // Missing destination
    const { req: req2, res: res2 } = createMockReqRes({ method: "POST", body: { days: 3 } });
    await planHandler(req2, res2);
    assert.strictEqual(res2.statusCode, 400);

    // Destination without id
    const { req: req3, res: res3 } = createMockReqRes({
      method: "POST",
      body: { destination: { name: "Mystery City" } },
    });
    await planHandler(req3, res3);
    assert.strictEqual(res3.statusCode, 400);
  } finally {
    if (origKey !== undefined) {
      process.env.GEMINI_API_KEY = origKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  }
});

// -------------------------------------------------------------
// 3. Security & Secret Isolation Audit
// -------------------------------------------------------------
runTest("6. Zero client secret exposure in src/ directory", () => {
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

runTest("7. Zero secret exposure in production dist/ bundle", () => {
  const distDir = path.join(ROOT, "dist");
  assert.ok(fs.existsSync(distDir), "dist/ directory must exist from build");

  function scanDist(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        scanDist(fullPath);
      } else if (file.isFile() && /\.(js|html|css)$/.test(file.name)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        assert.ok(
          !content.includes("process.env.GEMINI_API_KEY"),
          `Secret leaked in bundle: ${fullPath}`
        );
        assert.ok(
          !content.includes("AIzaSy"),
          `Potential Google API key prefix leaked in bundle: ${fullPath}`
        );
      }
    }
  }

  scanDist(distDir);
});

// -------------------------------------------------------------
// 4. Production Bundle Integrity & Deferred Loading
// -------------------------------------------------------------
runTest("8. Production dist/ contains index.html, manifest, and service worker", () => {
  const distDir = path.join(ROOT, "dist");
  assert.ok(fs.existsSync(path.join(distDir, "index.html")), "dist/index.html must exist");
  assert.ok(
    fs.existsSync(path.join(distDir, "manifest.webmanifest")),
    "dist/manifest.webmanifest must exist"
  );
  assert.ok(fs.existsSync(path.join(distDir, "sw.js")), "dist/sw.js must exist");
  assert.ok(fs.existsSync(path.join(distDir, "favicon.svg")), "dist/favicon.svg must exist");
});

runTest("9. Leaflet and RouteOverview remain in separate deferred chunks", () => {
  const assetsDir = path.join(ROOT, "dist", "assets");
  assert.ok(fs.existsSync(assetsDir), "dist/assets must exist");

  const files = fs.readdirSync(assetsDir);
  const leafletChunk = files.find((f) => f.startsWith("leaflet-") && f.endsWith(".js"));
  const routeChunk = files.find((f) => f.startsWith("RouteOverview-") && f.endsWith(".js"));
  const indexChunk = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));

  assert.ok(leafletChunk, "Deferred leaflet chunk must exist");
  assert.ok(routeChunk, "Deferred RouteOverview chunk must exist");
  assert.ok(indexChunk, "Main application entry chunk must exist");
  assert.notStrictEqual(leafletChunk, indexChunk, "Leaflet must NOT be bundled into main index chunk");
});

// -------------------------------------------------------------
// 5. Metadata and Platform-Neutral URLs
// -------------------------------------------------------------
runTest("10. index.html defines clean platform-neutral Open Graph and Twitter metadata", () => {
  const htmlContent = fs.readFileSync(path.join(ROOT, "index.html"), "utf-8");

  assert.ok(
    htmlContent.includes('<meta property="og:url" content="/" />'),
    "og:url must be platform-neutral root"
  );
  assert.ok(
    htmlContent.includes('<meta property="og:image" content="/favicon.svg" />'),
    "og:image must be platform-neutral asset"
  );
  assert.ok(
    htmlContent.includes('<meta name="twitter:image" content="/favicon.svg" />'),
    "twitter:image must be platform-neutral asset"
  );
});

// -------------------------------------------------------------
// 6. PWA Manifest and Service Worker Production Consistency
// -------------------------------------------------------------
runTest("11. PWA Manifest defines valid standalone configuration and assets", () => {
  const manifestPath = path.join(ROOT, "public", "manifest.webmanifest");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

  assert.ok(manifest.name.includes("YatraSarathi"), "Manifest name must include YatraSarathi");
  assert.strictEqual(manifest.short_name, "YatraSarathi");
  assert.strictEqual(manifest.start_url, "/");
  assert.strictEqual(manifest.display, "standalone");
  assert.strictEqual(manifest.theme_color, "#f97316");
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0);
});

runTest("12. Service worker excludes /api/ and caches same-origin app shell", () => {
  const swContent = fs.readFileSync(path.join(ROOT, "public", "sw.js"), "utf-8");

  assert.ok(swContent.includes("yatrasarathi-static-v1"), "Cache version must be defined");
  assert.ok(
    swContent.includes('url.pathname.startsWith("/api/")'),
    "Must check /api/ path to bypass caching"
  );
  assert.ok(
    swContent.includes("url.origin !== self.location.origin"),
    "Must restrict caching to same-origin assets"
  );
});

console.log("\n=======================================================");
console.log(`  RESULTS: ${passed}/${total} TESTS PASSED`);
console.log("=======================================================\n");

if (passed === total) {
  console.log("P10 PRODUCTION VALIDATION SUITE PASSED CLEANLY.\n");
  process.exit(0);
} else {
  console.error("FAILURES IN PRODUCTION VALIDATION SUITE.\n");
  process.exit(1);
}
