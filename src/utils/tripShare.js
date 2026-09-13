/**
 * Native Sharing and Serialization Utilities for YatraSarathi
 *
 * Formats human-readable travel summaries and manages Web Share API
 * with robust clipboard fallback.
 * Strictly client-side, zero cloud dependencies or user accounts.
 */

import { formatINR } from "./itineraryGenerator.js";

/**
 * Formats a clean, structured, human-readable summary of an itinerary
 * suitable for sharing via WhatsApp, Messages, Email, or Social Media.
 *
 * @param {object} itinerary - Full itinerary object
 * @returns {string} Formatted share text
 */
export function formatTripShareText(itinerary) {
  if (!itinerary || !itinerary.destination) return "";

  const { destination, duration, travellers, budgetTier, pricing, days = [] } =
    itinerary;
  const destName = destination.name || "India";
  const budgetStr =
    pricing && pricing.total
      ? `₹${formatINR(pricing.total)}`
      : "Customized estimate";

  const lines = [
    `🇮🇳 My Travel Plan to ${destName}`,
    `🗓️ Duration: ${duration} Days | 👥 Travelers: ${travellers} | 🏷️ Tier: ${budgetTier?.toUpperCase()}`,
    `💰 Estimated Budget: ${budgetStr} (Indicative total)`,
    "",
    "📍 Daily Sights & Highlights:",
  ];

  days.forEach((d) => {
    const highlights = [
      d.morning?.title,
      d.afternoon?.title,
    ]
      .filter(Boolean)
      .join(" • ");

    lines.push(`• Day ${d.day}: ${d.theme || highlights || "Exploration"}`);
  });

  lines.push("");
  lines.push("✨ Planned with YatraSarathi — India's Smart Tourism Companion");

  return lines.join("\n");
}

/**
 * Executes a native share via the Web Share API (navigator.share) when supported,
 * or gracefully falls back to clipboard copying.
 *
 * @param {object} itinerary - Full itinerary object
 * @returns {Promise<{ shared: boolean, method: "native" | "clipboard" | "unsupported", error?: string }>}
 */
export async function shareTrip(itinerary) {
  if (!itinerary || !itinerary.destination) {
    return { shared: false, method: "unsupported", error: "Invalid itinerary data." };
  }

  const shareText = formatTripShareText(itinerary);
  const shareTitle = `Travel Plan to ${itinerary.destination.name} - YatraSarathi`;

  // 1. Try Native Web Share API
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: typeof window !== "undefined" ? window.location.href : undefined,
      });
      return { shared: true, method: "native" };
    } catch (err) {
      // If user cancelled the share dialog, treat as cancelled rather than failure
      if (err && err.name === "AbortError") {
        return { shared: false, method: "native", error: "Share cancelled by user." };
      }
      // Otherwise fall through to clipboard copy
    }
  }

  // 2. Fallback to Clipboard Copy
  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(shareText);
      return { shared: true, method: "clipboard" };
    } catch {
      return { shared: false, method: "clipboard", error: "Failed to copy to clipboard." };
    }
  }

  return { shared: false, method: "unsupported", error: "Sharing is not supported on this device." };
}
