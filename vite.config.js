import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import planHandler from "./api/plan.js";

/**
 * Local development plugin for running /api/plan inside Vite dev server.
 * In production, Vercel natively executes api/plan.js as a serverless function.
 */
function apiDevPlugin() {
  return {
    name: "api-dev-server",
    configureServer(server) {
      // Safely load server-side environment variables without exposing to client
      const env = loadEnv("development", process.cwd(), "");
      if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
        process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
      }

      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith("/api/plan")) {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Method Not Allowed" }));
            return;
          }

          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", async () => {
            try {
              req.body = body ? JSON.parse(body) : {};
            } catch {
              req.body = {};
            }

            // Serverless-style response helpers
            res.status = function (code) {
              res.statusCode = code;
              return this;
            };
            res.json = function (data) {
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(data));
              return this;
            };

            try {
              await planHandler(req, res);
            } catch (err) {
              console.error("[Vite API Middleware Error]", err);
              res.status(200).json({
                fallback: true,
                mode: "deterministic",
                reason: "Internal dev server error, falling back to deterministic planner.",
              });
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          leaflet: ["leaflet"],
        },
      },
    },
  },
});
