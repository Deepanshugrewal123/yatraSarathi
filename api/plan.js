/**
 * Vercel Serverless Function & Local Dev Handler for YatraSarathi AI Planning
 *
 * Endpoint: POST /api/plan
 * Orchestrates Gemini AI generation, guardrail validation, and deterministic fallback.
 *
 * Runs exclusively server-side. process.env.GEMINI_API_KEY is never exposed to clients.
 */

import { generateGeminiItinerary } from "./geminiAdapter.js";
import { validateAndSanitizeItinerary } from "./guardrails.js";

export default async function handler(req, res) {
  // 1. Validate HTTP Method
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      error: "Method Not Allowed",
      message: "This endpoint only accepts POST requests.",
    });
  }

  // 2. Verify Server-Side GEMINI_API_KEY
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
    // Return friendly fallback signal without throwing error or exposing server state
    return res.status(200).json({
      fallback: true,
      mode: "deterministic",
      reason: "GEMINI_API_KEY is not configured on the server. Falling back to verified standard planner.",
    });
  }

  // 3. Validate Request Body
  const payload = req.body;
  if (!payload || typeof payload !== "object" || !payload.destination || !payload.destination.id) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Valid destination object and travel parameters are required.",
    });
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
    // 4. Request Gemini structured plan
    const aiResponse = await generateGeminiItinerary(normalizedParams, apiKey);

    // 5. Run Guardrails & Factual Sanitization
    const guardrailResult = validateAndSanitizeItinerary(aiResponse, normalizedParams);

    if (!guardrailResult.valid) {
      console.warn(
        `[YatraSarathi Guardrail] AI response failed schema validation (${guardrailResult.reason}). Falling back to deterministic plan.`
      );
      return res.status(200).json({
        fallback: true,
        mode: "deterministic",
        reason: `AI output failed validation (${guardrailResult.reason}). Falling back to verified standard planner.`,
      });
    }

    // 6. Return verified AI itinerary
    return res.status(200).json({
      success: true,
      mode: "ai",
      itinerary: guardrailResult.sanitizedItinerary,
    });
  } catch (error) {
    // Diagnostic logging on server without leaking secrets to client
    const errorMessage = error?.message || "Unknown error";
    console.error(`[YatraSarathi AI API Error] Failed to generate itinerary with Gemini: ${errorMessage}`);

    // Return clean fallback signal so client seamlessly switches to deterministic engine
    return res.status(200).json({
      fallback: true,
      mode: "deterministic",
      reason: "AI service temporarily unavailable. Falling back to verified standard planner.",
    });
  }
}
