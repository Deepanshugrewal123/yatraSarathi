/**
 * Platform-Neutral Server-Side Handler for YatraSarathi AI Planning
 *
 * Endpoint: POST /api/plan
 * Orchestrates Gemini AI generation, guardrail validation, and deterministic fallback.
 *
 * Designed to run on any Node.js environment:
 * - Standard Node.js http.createServer
 * - Express / Connect middleware
 * - Vite dev & preview servers
 * - Serverless runtimes (Netlify Functions, Vercel, AWS Lambda, Cloudflare)
 * - Containerized environments (Docker, Railway, Render, Fly.io)
 *
 * Runs exclusively server-side. process.env.GEMINI_API_KEY is never exposed to clients.
 */

import { generateGeminiItinerary } from "./geminiAdapter.js";
import { validateAndSanitizeItinerary } from "./guardrails.js";

/**
 * Pure business logic function for processing travel plan requests.
 * Zero HTTP framework dependencies — completely platform-agnostic.
 *
 * @param {object} payload - Request payload containing trip preferences
 * @param {string} [apiKey] - Server-side Gemini API key
 * @returns {Promise<{ status: number, body: object, headers?: Record<string, string> }>}
 */
export async function processPlanRequest(payload, apiKey = process.env.GEMINI_API_KEY) {
  // 1. Verify Server-Side GEMINI_API_KEY
  if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
    return {
      status: 200,
      body: {
        fallback: true,
        mode: "deterministic",
        reason: "GEMINI_API_KEY is not configured on the server. Falling back to verified standard planner.",
      },
    };
  }

  // 2. Validate Request Body
  if (!payload || typeof payload !== "object" || !payload.destination || !payload.destination.id) {
    return {
      status: 400,
      body: {
        error: "Bad Request",
        message: "Valid destination object and travel parameters are required.",
      },
    };
  }

  // Normalize parameters to safe ranges
  const normalizedParams = {
    destination: payload.destination,
    days: Math.max(1, Math.min(14, Number(payload.days) || 4)),
    travellers: Math.max(1, Math.min(10, Number(payload.travellers) || 2)),
    budgetTier: ["budget", "moderate", "premium"].includes(payload.budgetTier)
      ? payload.budgetTier
      : "moderate",
    travelStyle: typeof payload.travelStyle === "string" ? payload.travelStyle : "Balanced",
    interests: Array.isArray(payload.interests) ? payload.interests.slice(0, 8) : [],
  };

  try {
    // 3. Request Gemini structured plan
    const aiResponse = await generateGeminiItinerary(normalizedParams, apiKey);

    // 4. Run Guardrails & Factual Sanitization
    const guardrailResult = validateAndSanitizeItinerary(aiResponse, normalizedParams);

    if (!guardrailResult.valid) {
      console.warn(
        `[YatraSarathi Guardrail] AI response failed schema validation (${guardrailResult.reason}). Falling back to deterministic plan.`
      );
      return {
        status: 200,
        body: {
          fallback: true,
          mode: "deterministic",
          reason: `AI output failed validation (${guardrailResult.reason}). Falling back to verified standard planner.`,
        },
      };
    }

    // 5. Return verified AI itinerary
    return {
      status: 200,
      body: {
        success: true,
        mode: "ai",
        itinerary: guardrailResult.sanitizedItinerary,
      },
    };
  } catch (error) {
    // Diagnostic logging on server without leaking secrets to client
    const errorMessage = error?.message || "Unknown error";
    console.error(`[YatraSarathi AI API Error] Failed to generate itinerary with Gemini: ${errorMessage}`);

    // Return clean fallback signal so client seamlessly switches to deterministic engine
    return {
      status: 200,
      body: {
        fallback: true,
        mode: "deterministic",
        reason: "AI service temporarily unavailable. Falling back to verified standard planner.",
      },
    };
  }
}

/**
 * Universal HTTP Request/Response Handler.
 * Supports standard Node.js (req, res), Express, Connect, and serverless runtimes.
 *
 * @param {object} req - HTTP request object or stream
 * @param {object} res - HTTP response object
 */
export default async function handler(req, res) {
  const sendResponse = (status, data, extraHeaders = {}) => {
    // Merge headers
    if (typeof res.setHeader === "function") {
      res.setHeader("Content-Type", "application/json");
      for (const [k, v] of Object.entries(extraHeaders)) {
        res.setHeader(k, v);
      }
    }

    // Support Express / Vercel res.status(code).json(data) helper
    if (typeof res.status === "function" && typeof res.json === "function") {
      res.status(status).json(data);
      return;
    }

    // Standard Node.js http.ServerResponse fallback
    res.statusCode = status;
    res.end(JSON.stringify(data));
  };

  // 1. Validate HTTP Method
  if (req.method !== "POST") {
    sendResponse(
      405,
      {
        error: "Method Not Allowed",
        message: "This endpoint only accepts POST requests.",
      },
      { Allow: "POST" }
    );
    return;
  }

  // 2. Resolve request body (already parsed or incoming stream)
  let payload = req.body;
  if (!payload && typeof req.on === "function") {
    try {
      let raw = "";
      for await (const chunk of req) {
        raw += chunk;
      }
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      payload = {};
    }
  }

  // 3. Process the plan request
  const { status, body, headers } = await processPlanRequest(payload);
  sendResponse(status, body, headers || {});
}
