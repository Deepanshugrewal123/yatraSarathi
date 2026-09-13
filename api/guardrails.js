/**
 * Server-Side Output Validation and Factual Guardrails for YatraSarathi
 *
 * Validates AI responses against strict schema requirements,
 * cross-references referenced landmarks against the authoritative destination dataset,
 * sanitizes any hallucinated attractions, and injects the deterministic budget calculation.
 */

import { calculateBudget } from "../src/utils/itineraryGenerator.js";

/**
 * Checks whether a given location string is grounded in the authoritative destination data
 * or represents safe generic travel exploration (e.g., "Old Town", "Local Market").
 */
function isLocationGrounded(location, validLandmarks, destinationCity, destinationState) {
  if (!location || typeof location !== "string") return false;

  const locLower = location.toLowerCase().trim();
  const cityLower = destinationCity.toLowerCase();
  const stateLower = destinationState.toLowerCase();

  // Allow matches with verified attractions
  for (const landmark of validLandmarks) {
    if (locLower.includes(landmark) || landmark.includes(locLower)) {
      return true;
    }
  }

  // Allow general geographic references within the verified city/state
  const safeGenericKeywords = [
    cityLower,
    stateLower,
    "center",
    "market",
    "bazaar",
    "promenade",
    "old town",
    "viewpoint",
    "trail",
    "waterfront",
    "cooperative",
    "village",
    "neighborhood",
    "hotel",
    "homestay",
    "resort",
    "cafe",
    "district",
    "surroundings",
    "heritage quarters",
  ];

  for (const keyword of safeGenericKeywords) {
    if (locLower.includes(keyword)) {
      return true;
    }
  }

  // Location does not match verified attractions or safe regional exploration
  return false;
}

/**
 * Validates and sanitizes the raw AI response.
 *
 * @param {object} aiResponse - Raw JSON parsed from Gemini
 * @param {object} context - User trip request parameters and destination object
 * @returns {{ valid: boolean, sanitizedItinerary?: object, reason?: string }}
 */
export function validateAndSanitizeItinerary(aiResponse, context) {
  if (!aiResponse || typeof aiResponse !== "object") {
    return { valid: false, reason: "Response is not a valid object." };
  }

  const { destination, days = 4, travellers = 2, budgetTier = "moderate", travelStyle = "Balanced", interests = [] } = context;

  if (!Array.isArray(aiResponse.days)) {
    return { valid: false, reason: "Missing days array in AI response." };
  }

  if (aiResponse.days.length !== Number(days)) {
    return {
      valid: false,
      reason: `Day count mismatch: expected ${days}, got ${aiResponse.days.length}.`,
    };
  }

  const destinationCity = destination.name.split(",")[0].trim();
  const destinationState = destination.state;
  const validLandmarks = (destination.attractions || []).map((a) => a.toLowerCase().trim());

  const sanitizedDays = [];

  for (let i = 0; i < aiResponse.days.length; i++) {
    const dayObj = aiResponse.days[i];
    const expectedDayNum = i + 1;

    if (dayObj.day !== expectedDayNum) {
      dayObj.day = expectedDayNum; // Auto-correct day numbering if off-by-one
    }

    if (!dayObj.theme || typeof dayObj.theme !== "string") {
      dayObj.theme = `Day ${expectedDayNum}: Exploring ${destinationCity}`;
    }

    const slots = ["morning", "afternoon", "evening"];
    for (const slotKey of slots) {
      const slot = dayObj[slotKey];
      if (!slot || typeof slot !== "object") {
        return {
          valid: false,
          reason: `Day ${expectedDayNum} is missing valid ${slotKey} slot.`,
        };
      }

      // Check required fields
      if (!slot.title || typeof slot.title !== "string" || slot.title.trim() === "") {
        slot.title = `Day ${expectedDayNum} ${slotKey.charAt(0).toUpperCase() + slotKey.slice(1)} Discovery`;
      }
      if (!slot.description || typeof slot.description !== "string" || slot.description.trim() === "") {
        slot.description = `Take time to discover the unique atmosphere, sights, and culture of ${destinationCity}.`;
      }
      if (!slot.time || typeof slot.time !== "string") {
        slot.time =
          slotKey === "morning"
            ? "08:30 AM – 12:30 PM"
            : slotKey === "afternoon"
            ? "01:30 PM – 05:00 PM"
            : "05:30 PM – 08:30 PM";
      }
      if (!slot.tag || typeof slot.tag !== "string") {
        slot.tag = slotKey === "evening" ? "Sunset & Dining" : "Sightseeing";
      }
      if (!slot.location || typeof slot.location !== "string") {
        slot.location = `${destinationCity} Area`;
      }

      // Sanitize string length limits to prevent UI overflow or prompt injection output
      slot.title = slot.title.slice(0, 120);
      slot.description = slot.description.slice(0, 350);

      // FACTUAL GROUNDING GUARDRAIL:
      // Verify that the location is grounded in verified destination data
      if (!isLocationGrounded(slot.location, validLandmarks, destinationCity, destinationState)) {
        // Replace hallucinated landmark with safe generic regional exploration
        slot.location = `${destinationCity} Area`;
        slot.title = `Free time / local exploration in ${destinationCity}`;
        slot.tag = "Local Exploration";
        slot.description = `Enjoy an unhurried period of local exploration, visiting authentic neighborhood lanes and resting before your next planned activity.`;
      }
    }

    if (!dayObj.ecoTip || typeof dayObj.ecoTip !== "string") {
      dayObj.ecoTip =
        destination.culture ||
        "Practice responsible tourism and keep all natural and cultural sites clean.";
    }

    sanitizedDays.push(dayObj);
  }

  // Calculate authoritative deterministic budget
  const authoritativePricing = calculateBudget(destination, days, travellers, budgetTier);

  const sanitizedItinerary = {
    id: `itin-ai-${destination.id}-${days}d-${travellers}p-${Date.now()}`,
    mode: "ai",
    generatedAt: new Date().toISOString(),
    destination,
    duration: Number(days),
    travellers: Number(travellers),
    budgetTier,
    travelStyle,
    interests: interests.length > 0 ? interests : destination.tags,
    summary: typeof aiResponse.summary === "string" && aiResponse.summary.trim() !== ""
      ? aiResponse.summary.slice(0, 300)
      : `Personalized ${days}-day ${travelStyle.toLowerCase()} itinerary for ${destination.name}.`,
    personalizationNotes: Array.isArray(aiResponse.personalizationNotes)
      ? aiResponse.personalizationNotes.slice(0, 4).map((n) => String(n).slice(0, 150))
      : [`Tailored specifically for ${travelStyle} travel style and your chosen interests.`],
    pricing: authoritativePricing,
    days: sanitizedDays,
  };

  return {
    valid: true,
    sanitizedItinerary,
  };
}
