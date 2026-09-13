/**
 * Provider-Agnostic AI Service Interface for YatraSarathi
 *
 * Sits between the UI components (Hero / PlannerForm) and the server-side AI boundary.
 * The UI consumes this service without knowing any Gemini-specific or provider-specific details.
 *
 * If the API endpoint is unavailable, unconfigured, or times out, this service
 * automatically and seamlessly falls back to the deterministic itinerary generator.
 */

import { generateItinerary } from "../utils/itineraryGenerator.js";

/**
 * Generates an itinerary by querying the server-side AI planning endpoint.
 * Automatically falls back to the verified deterministic engine on any failure.
 *
 * @param {object} planParams - User trip parameters (destination, days, travellers, budgetTier, travelStyle, interests)
 * @returns {Promise<{ itinerary: object, mode: 'ai' | 'deterministic', notice?: string }>}
 */
export async function generateSmartItinerary(planParams) {
  if (!planParams || !planParams.destination) {
    throw new Error("A valid destination is required to generate an itinerary.");
  }

  // Offline boundary: immediately bypass /api/plan without network delay or timeout
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    const deterministicPlan = generateItinerary({ ...planParams, variation: 0 });
    const offlineNotice =
      "Personalization is unavailable offline. Displaying your verified standard plan.";
    return {
      itinerary: { ...deterministicPlan, mode: "deterministic", notice: offlineNotice },
      mode: "deterministic",
      notice: offlineNotice,
    };
  }

  // 15-second client timeout to guarantee the user is never stuck waiting
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("/api/plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(planParams),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[aiService] /api/plan returned HTTP ${response.status}. Falling back to standard plan.`);
      const deterministicPlan = generateItinerary({ ...planParams, variation: 0 });
      const unavailNotice = "We couldn't personalize the plan right now. Displaying your verified standard plan.";
      return {
        itinerary: { ...deterministicPlan, mode: "deterministic", notice: unavailNotice },
        mode: "deterministic",
        notice: unavailNotice,
      };
    }

    const data = await response.json();

    // If server sent fallback signal (missing API key, rate limit, or guardrail intervention)
    if (data.fallback || !data.itinerary) {
      const deterministicPlan = generateItinerary({ ...planParams, variation: 0 });
      const fallbackReason = "Displaying your verified standard plan.";
      return {
        itinerary: { ...deterministicPlan, mode: "deterministic", notice: fallbackReason },
        mode: "deterministic",
        notice: fallbackReason,
      };
    }

    // Successfully received validated AI itinerary
    return {
      itinerary: { ...data.itinerary, mode: "ai" },
      mode: "ai",
    };
  } catch (err) {
    clearTimeout(timeoutId);

    const isTimeout = err.name === "AbortError";
    console.warn(
      `[aiService] ${isTimeout ? "AI request timed out" : "AI request failed"}: ${err.message}. Falling back to standard plan.`
    );

    // Guaranteed fallback: return deterministic plan
    const deterministicPlan = generateItinerary({ ...planParams, variation: 0 });
    const catchNotice =
      typeof navigator !== "undefined" && navigator.onLine === false
        ? "Personalization is unavailable offline. Displaying your verified standard plan."
        : isTimeout
        ? "Personalization took longer than expected. Displaying your verified standard plan."
        : "Displaying your verified standard plan.";
    return {
      itinerary: { ...deterministicPlan, mode: "deterministic", notice: catchNotice },
      mode: "deterministic",
      notice: catchNotice,
    };
  }
}

/**
 * Regenerates an itinerary variation deterministically.
 */
export function regenerateVariation(planParams, variationSeed = 1) {
  const plan = generateItinerary({ ...planParams, variation: variationSeed });
  return {
    itinerary: { ...plan, mode: "deterministic" },
    mode: "deterministic",
  };
}
