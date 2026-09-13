import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import planHandler from "./api/plan.js";

/**
 * Universal Vite middleware plugin for handling /api/plan
 * during both local development (`npm run dev`) and production preview (`npm run preview`).
 */
function apiMiddlewarePlugin() {
  const mountMiddleware = (server) => {
    // Safely load server-side environment variables without exposing to client
    const env = loadEnv("development", process.cwd(), "");
    if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
    }

    server.middlewares.use(async (req, res, next) => {
      if (req.url && req.url.startsWith("/api/plan")) {
        try {
          await planHandler(req, res);
        } catch (err) {
          console.error("[Vite API Middleware Error]", err);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              fallback: true,
              mode: "deterministic",
              reason: "Internal server error, falling back to deterministic planner.",
            })
          );
        }
        return;
      }
      next();
    });
  };

  return {
    name: "api-server-middleware",
    configureServer(server) {
      mountMiddleware(server);
    },
    configurePreviewServer(server) {
      mountMiddleware(server);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiMiddlewarePlugin()],
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
