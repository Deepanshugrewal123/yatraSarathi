/**
 * YatraSarathi — Platform-Independent Production Server
 *
 * A standalone, zero-dependency Node.js HTTP server.
 * Serves static assets from `dist/`, handles `/api/plan` AI requests,
 * and routes client-side SPA navigation to `index.html`.
 *
 * Runs on any standard Node.js hosting platform:
 * - Docker / Kubernetes
 * - VM / VPS (Ubuntu, Debian, Windows Server, etc.)
 * - PaaS (Render, Railway, Fly.io, Heroku, DigitalOcean App Platform)
 * - Local testing / staging
 *
 * Usage:
 *   npm run build
 *   node server.js
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import planHandler from "./api/plan.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, "dist");
const PORT = Number(process.env.PORT) || 3000;

// Content types mapping
const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".webmanifest": "application/manifest+json; charset=UTF-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=UTF-8",
};

export function createServer() {
  return http.createServer(async (req, res) => {
    // 1. Injected Security Headers (Platform-Independent)
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    // 2. Handle API routes
    if (req.url && req.url.startsWith("/api/plan")) {
      try {
        await planHandler(req, res);
      } catch (err) {
        console.error("[Server API Error]", err);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            fallback: true,
            mode: "deterministic",
            reason: "Server encountered an error. Falling back to standard planner.",
          })
        );
      }
      return;
    }

    // Only handle GET and HEAD for static serving
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "text/plain");
      res.end("Method Not Allowed");
      return;
    }

    // 3. Resolve Static File Path
    const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);
    if (pathname === "/") {
      pathname = "/index.html";
    }

    const safePath = path.normalize(path.join(DIST_DIR, pathname));

    // Security check: prevent directory traversal outside DIST_DIR
    if (!safePath.startsWith(DIST_DIR)) {
      res.statusCode = 403;
      res.setHeader("Content-Type", "text/plain");
      res.end("Forbidden");
      return;
    }

    // 4. Serve File if it exists
    if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
      const ext = path.extname(safePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);

      // Special header handling for service worker
      if (pathname === "/sw.js") {
        res.setHeader("Service-Worker-Allowed", "/");
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      } else if (pathname.startsWith("/assets/")) {
        // Hashed assets can be cached for a long duration
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else {
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      }

      const stream = fs.createReadStream(safePath);
      stream.pipe(res);
      return;
    }

    // 5. SPA Fallback: Serve dist/index.html for any client route
    const indexPath = path.join(DIST_DIR, "index.html");
    if (fs.existsSync(indexPath)) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=UTF-8");
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      fs.createReadStream(indexPath).pipe(res);
      return;
    }

    // Fallback if build hasn't run yet
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Build artifacts not found. Please run 'npm run build' first.");
  });
}

// Auto-start server when executed directly: `node server.js`
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`\n=======================================================`);
    console.log(`  YatraSarathi Platform-Independent Server Running`);
    console.log(`  Local: http://localhost:${PORT}`);
    console.log(`=======================================================\n`);
  });
}
