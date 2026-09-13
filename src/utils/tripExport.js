/**
 * Trip Export and Import Utilities for YatraSarathi
 *
 * Provides canonical JSON export/import and RFC 5545 iCalendar (.ics) export.
 * Strictly client-side, zero backend dependencies.
 * Defensively sanitizes imported payloads and resolves geographic truth
 * exclusively through the centralized destination registry.
 */

import { getDestinationById } from "../data/destinations.js";
import { calculateBudget } from "./itineraryGenerator.js";

export const EXPORT_SCHEMA_VERSION = 1;

/**
 * Sanitizes a string into a safe, human-readable filename component.
 *
 * @param {string} str - Raw name string
 * @returns {string} Safe filename segment
 */
export function sanitizeFilename(str) {
  if (!str || typeof str !== "string") return "trip";
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-alphanumeric except hyphen/spaces
    .replace(/\s+/g, "-") // collapse spaces into hyphens
    .replace(/-+/g, "-") // collapse consecutive hyphens
    .slice(0, 50); // limit length
}

/**
 * Strips HTML tags and potential script content from a string.
 *
 * @param {string} text - Raw input string
 * @returns {string} Plain text string
 */
export function sanitizeText(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .split("")
    .filter((char) => {
      const code = char.charCodeAt(0);
      return (code >= 32 && code !== 127) || code === 10 || code === 13;
    })
    .join("")
    .trim();
}

/**
 * Builds the canonical export payload containing only the necessary data
 * to reconstruct the trip. Excludes internal storage keys, secrets, or browser metadata.
 *
 * @param {object} itinerary - Full itinerary object
 * @returns {object} Canonical export data structure
 */
export function buildTripExportPayload(itinerary) {
  if (!itinerary || !itinerary.destination) {
    throw new Error("Invalid itinerary object for export.");
  }

  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    generator: "YatraSarathi",
    exportedAt: new Date().toISOString(),
    trip: {
      id: itinerary.id || `trip-${itinerary.destination.id}-${Date.now()}`,
      destination: {
        id: itinerary.destination.id,
        name: itinerary.destination.name,
        state: itinerary.destination.state,
      },
      duration: Number(itinerary.duration) || 1,
      travellers: Number(itinerary.travellers) || 1,
      budgetTier: itinerary.budgetTier || "moderate",
      travelStyle: itinerary.travelStyle || "Balanced",
      interests: Array.isArray(itinerary.interests) ? itinerary.interests : [],
      mode: itinerary.mode || "deterministic",
      summary: itinerary.summary || null,
      personalizationNotes: Array.isArray(itinerary.personalizationNotes)
        ? itinerary.personalizationNotes
        : [],
      pricing: itinerary.pricing || null,
      days: (itinerary.days || []).map((d) => ({
        day: d.day,
        theme: d.theme,
        morning: {
          time: d.morning?.time || "08:30 AM – 12:30 PM",
          title: d.morning?.title || "",
          description: d.morning?.description || "",
          location: d.morning?.location || "",
          type: d.morning?.type || "sightseeing",
          tag: d.morning?.tag || "Morning Activity",
        },
        afternoon: {
          time: d.afternoon?.time || "01:30 PM – 05:00 PM",
          title: d.afternoon?.title || "",
          description: d.afternoon?.description || "",
          location: d.afternoon?.location || "",
          type: d.afternoon?.type || "sightseeing",
          tag: d.afternoon?.tag || "Afternoon Activity",
        },
        evening: {
          time: d.evening?.time || "05:30 PM – 08:30 PM",
          title: d.evening?.title || "",
          description: d.evening?.description || "",
          location: d.evening?.location || "",
          type: d.evening?.type || "dining",
          tag: d.evening?.tag || "Evening Activity",
        },
        ecoTip: d.ecoTip || "",
      })),
    },
  };
}

/**
 * Triggers client-side browser file download of the itinerary as formatted JSON.
 *
 * @param {object} itinerary - Full itinerary object
 * @returns {{ success: boolean, filename: string }}
 */
export function exportTripAsJson(itinerary) {
  const payload = buildTripExportPayload(itinerary);
  const jsonStr = JSON.stringify(payload, null, 2);

  const destName = sanitizeFilename(itinerary.destination?.name || "trip");
  const filename = `yatra-sarathi-${destName}-trip.json`;

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return { success: true, filename, payload };
}

/**
 * Validates, parses, and sanitizes an imported JSON trip string.
 * Resolves destination and geographic coordinates strictly against the centralized registry.
 *
 * @param {string} jsonString - Raw JSON file content
 * @returns {{ valid: boolean, itinerary?: object, error?: string }}
 */
export function validateAndParseTripJson(jsonString) {
  if (!jsonString || typeof jsonString !== "string") {
    return { valid: false, error: "Empty or invalid file content." };
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return { valid: false, error: "Malformed JSON file. Please ensure the file is valid JSON." };
  }

  if (!parsed || typeof parsed !== "object") {
    return { valid: false, error: "Imported file does not contain a valid JSON object." };
  }

  // Schema version check
  if (parsed.schemaVersion && parsed.schemaVersion > EXPORT_SCHEMA_VERSION) {
    return {
      valid: false,
      error: `Unsupported export schema version (${parsed.schemaVersion}). Please use a file compatible with version ${EXPORT_SCHEMA_VERSION}.`,
    };
  }

  // Support both canonical { trip: { ... } } and direct itinerary structures
  const tripData = parsed.trip && typeof parsed.trip === "object" ? parsed.trip : parsed;

  // 1. Destination verification
  if (!tripData.destination || typeof tripData.destination !== "object" || !tripData.destination.id) {
    return { valid: false, error: "Missing or invalid destination reference." };
  }

  const destId = sanitizeText(tripData.destination.id);
  const registeredDest = getDestinationById(destId);

  if (!registeredDest) {
    return {
      valid: false,
      error: `Destination "${destId}" is not recognized in the YatraSarathi verified destination registry.`,
    };
  }

  // 2. Duration and Travelers
  const duration = Math.min(14, Math.max(1, Number(tripData.duration) || 1));
  const travellers = Math.min(10, Math.max(1, Number(tripData.travellers) || 1));
  const budgetTier = ["budget", "moderate", "premium"].includes(tripData.budgetTier)
    ? tripData.budgetTier
    : "moderate";
  const travelStyle = sanitizeText(tripData.travelStyle) || "Balanced";
  const mode = tripData.mode === "ai" || tripData.mode === "ai-personalized" ? "ai-personalized" : "deterministic";

  // 3. Days array validation
  if (!Array.isArray(tripData.days) || tripData.days.length === 0) {
    return { valid: false, error: "The imported trip has no daily itinerary plans." };
  }

  const sanitizedDays = [];
  const validSlots = ["morning", "afternoon", "evening"];

  for (let i = 0; i < tripData.days.length; i++) {
    const rawDay = tripData.days[i];
    const dayNum = i + 1;

    const dayObj = {
      day: dayNum,
      theme: sanitizeText(rawDay?.theme) || `Day ${dayNum}: Exploration of ${registeredDest.name}`,
      ecoTip: sanitizeText(rawDay?.ecoTip) || registeredDest.culture || "Respect local heritage and environment.",
    };

    for (const slot of validSlots) {
      const rawSlot = rawDay?.[slot] || {};
      dayObj[slot] = {
        time: sanitizeText(rawSlot.time) || (slot === "morning" ? "08:30 AM – 12:30 PM" : slot === "afternoon" ? "01:30 PM – 05:00 PM" : "05:30 PM – 08:30 PM"),
        title: sanitizeText(rawSlot.title) || `Day ${dayNum} ${slot.charAt(0).toUpperCase() + slot.slice(1)} Discovery`,
        description: sanitizeText(rawSlot.description) || `Experience ${registeredDest.name}.`,
        location: sanitizeText(rawSlot.location) || registeredDest.name,
        type: sanitizeText(rawSlot.type) || (slot === "evening" ? "dining" : "sightseeing"),
        tag: sanitizeText(rawSlot.tag) || (slot === "evening" ? "Sunset & Dining" : "Sightseeing"),
      };
    }

    sanitizedDays.push(dayObj);
  }

  // 4. Calculate authoritative budget pricing (deterministic balance guarantee)
  const pricing = tripData.pricing && typeof tripData.pricing === "object" && tripData.pricing.total
    ? tripData.pricing
    : calculateBudget(registeredDest, duration, travellers, budgetTier);

  // 5. Reconstruct verified itinerary with authoritative destination data
  const sanitizedItinerary = {
    id: `trip-imported-${registeredDest.id}-${Date.now()}`,
    importedAt: new Date().toISOString(),
    createdAt: tripData.createdAt || new Date().toISOString(),
    destination: registeredDest, // Always use registered destination for authoritative location & coordinates
    duration,
    travellers,
    budgetTier,
    travelStyle,
    interests: Array.isArray(tripData.interests) ? tripData.interests.map(sanitizeText) : registeredDest.tags,
    mode,
    summary: sanitizeText(tripData.summary) || `Imported ${duration}-day ${travelStyle.toLowerCase()} trip to ${registeredDest.name}.`,
    personalizationNotes: Array.isArray(tripData.personalizationNotes)
      ? tripData.personalizationNotes.map(sanitizeText)
      : [],
    pricing,
    days: sanitizedDays,
  };

  return {
    valid: true,
    itinerary: sanitizedItinerary,
  };
}

/**
 * Escapes text strings for RFC 5545 iCalendar content.
 * Characters requiring escaping: backslash, semicolon, comma, newlines.
 *
 * @param {string} str - Raw text string
 * @returns {string} ICS-safe escaped string
 */
export function escapeIcsText(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Formats a Date object into an ICS all-day date string (YYYYMMDD).
 *
 * @param {Date} date - JavaScript Date
 * @returns {string} YYYYMMDD
 */
export function formatIcsDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/**
 * Generates an RFC 5545 compliant .ics calendar file for the itinerary.
 *
 * Represents each day as an honest all-day event containing morning, afternoon,
 * and evening schedule details. Strictly avoids inventing fake clock times.
 *
 * @param {object} itinerary - Full itinerary object
 * @param {object} [options] - Options like startDate
 * @returns {{ success: boolean, filename: string, icsContent: string }}
 */
export function exportTripAsIcs(itinerary, options = {}) {
  if (!itinerary || !itinerary.destination) {
    throw new Error("Invalid itinerary object for calendar export.");
  }

  const dest = itinerary.destination;
  const days = itinerary.days || [];
  const destName = sanitizeFilename(dest.name);
  const filename = `yatra-sarathi-${destName}-calendar.ics`;

  // Determine base start date (defaults to tomorrow if not specified)
  const baseDate = options.startDate instanceof Date && !isNaN(options.startDate)
    ? new Date(options.startDate)
    : new Date(Date.now() + 24 * 60 * 60 * 1000);

  const nowTimestamp =
    new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  // Build VCALENDAR content with CRLF line endings per RFC 5545
  const CRLF = "\r\n";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//YatraSarathi//Tourism Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(`Trip: ${dest.name}`)}`,
    "X-WR-TIMEZONE:Asia/Kolkata",
  ];

  days.forEach((day) => {
    // Calculate event date for current day
    const eventDate = new Date(baseDate);
    eventDate.setDate(baseDate.getDate() + (day.day - 1));
    const nextDate = new Date(eventDate);
    nextDate.setDate(eventDate.getDate() + 1);

    const dtStart = formatIcsDate(eventDate);
    const dtEnd = formatIcsDate(nextDate);
    const uid = `yatra-${dest.id}-day-${day.day}-${dtStart}@yatrasarathi.app`;

    const summary = `Day ${day.day} in ${dest.name.split(",")[0]}: ${day.theme || "Exploration"}`;

    // Build description without fabricated clock minutes
    const descLines = [
      `Destination: ${dest.name} (${dest.state})`,
      `Day Theme: ${day.theme || "Sightseeing & Leisure"}`,
      "",
      "--- DAILY ACTIVITIES ---",
      `• Morning: ${day.morning?.title || "Sights"} [Location: ${day.morning?.location || "Local Area"}]`,
      `  Time Slot: ${day.morning?.time || "Morning"}`,
      `  Details: ${day.morning?.description || ""}`,
      "",
      `• Afternoon: ${day.afternoon?.title || "Exploration"} [Location: ${day.afternoon?.location || "Local Area"}]`,
      `  Time Slot: ${day.afternoon?.time || "Afternoon"}`,
      `  Details: ${day.afternoon?.description || ""}`,
      "",
      `• Evening: ${day.evening?.title || "Dining & Leisure"} [Location: ${day.evening?.location || "Local Area"}]`,
      `  Time Slot: ${day.evening?.time || "Evening"}`,
      `  Details: ${day.evening?.description || ""}`,
      "",
      `Responsible Tourism Tip: ${day.ecoTip || dest.culture || "Respect local heritage"}`,
      "",
      "Planned with YatraSarathi — India's Smart Tourism Companion",
    ];

    const description = descLines.join("\n");
    const location = `${dest.name}, India`;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${nowTimestamp}`);
    lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
    lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
    lines.push(`SUMMARY:${escapeIcsText(summary)}`);
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
    lines.push(`LOCATION:${escapeIcsText(location)}`);
    lines.push("STATUS:CONFIRMED");
    lines.push("TRANSP:TRANSPARENT");
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");

  const icsContent = lines.join(CRLF) + CRLF;

  // Trigger browser file download
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return { success: true, filename, icsContent };
}
