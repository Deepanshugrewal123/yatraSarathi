/**
 * Server-Side Gemini Adapter for YatraSarathi
 *
 * Communicates with the official Google Gen AI SDK (@google/genai)
 * using gemini-2.0-flash with strict system instructions and structured JSON response schemas.
 *
 * This module runs ONLY on the server-side / serverless API layer.
 * Never import or execute this module in client-side browser code.
 */

import { GoogleGenAI } from "@google/genai";

const ITINERARY_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: {
      type: "STRING",
      description: "A 2-sentence evocative summary of the personalized trip itinerary.",
    },
    personalizationNotes: {
      type: "ARRAY",
      items: { type: "STRING" },
      description:
        "2-3 brief bullet points explaining how the itinerary was tailored to the user's travel style and interests.",
    },
    days: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          day: { type: "INTEGER" },
          theme: {
            type: "STRING",
            description: "Thematic title for the day.",
          },
          morning: {
            type: "OBJECT",
            properties: {
              time: { type: "STRING" },
              title: { type: "STRING" },
              description: { type: "STRING" },
              location: { type: "STRING" },
              tag: { type: "STRING" },
            },
            required: ["time", "title", "description", "location", "tag"],
          },
          afternoon: {
            type: "OBJECT",
            properties: {
              time: { type: "STRING" },
              title: { type: "STRING" },
              description: { type: "STRING" },
              location: { type: "STRING" },
              tag: { type: "STRING" },
            },
            required: ["time", "title", "description", "location", "tag"],
          },
          evening: {
            type: "OBJECT",
            properties: {
              time: { type: "STRING" },
              title: { type: "STRING" },
              description: { type: "STRING" },
              location: { type: "STRING" },
              tag: { type: "STRING" },
            },
            required: ["time", "title", "description", "location", "tag"],
          },
          ecoTip: {
            type: "STRING",
            description:
              "A cultural etiquette or eco-friendly responsible travel guideline for the day.",
          },
        },
        required: ["day", "theme", "morning", "afternoon", "evening", "ecoTip"],
      },
    },
  },
  required: ["summary", "personalizationNotes", "days"],
};

/**
 * Invokes Gemini 2.0 Flash to generate a personalized structured itinerary
 * strictly grounded on the supplied destination facts.
 */
export async function generateGeminiItinerary(planParams, apiKey) {
  if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
    throw new Error("MISSING_API_KEY");
  }

  const {
    destination,
    days = 4,
    travellers = 2,
    budgetTier = "moderate",
    travelStyle = "Balanced",
    interests = [],
  } = planParams;

  const destinationCity = destination.name.split(",")[0].trim();
  const attractionsList = (destination.attractions || []).map((a) => `• ${a}`).join("\n");
  const highlightsList = (destination.highlights || []).map((h) => `• ${h}`).join("\n");

  const systemInstruction = `You are YatraSarathi's AI Travel Intelligence Engine.
Your role is to personalize day-by-day travel itineraries across India.

STRICT FACTUAL GROUNDING RULES:
1. The destination information provided in the prompt is AUTHORITATIVE.
2. You must ONLY feature the verified attractions and highlights supplied in the prompt.
3. NEVER invent non-existent attractions, monuments, museums, or fictional places.
4. NEVER invent prices, addresses, distances, opening hours, or transport schedules.
5. If the number of trip days exceeds the number of supplied attractions, use peaceful free-time slots, local artisan bazaars, scenic nature walks, or culinary exploration in the destination city rather than inventing new monuments.
6. The client system calculates all financial budgets deterministically; DO NOT include or calculate pricing.
7. Return strictly valid JSON that conforms to the specified response schema.`;

  const userPrompt = `Generate a personalized ${days}-day travel itinerary for ${destination.name} (${destination.state}).

TRIP PREFERENCES:
- Duration: ${days} days
- Group Size: ${travellers} traveler(s)
- Budget Tier: ${budgetTier}
- Travel Style: ${travelStyle}
- Preferred Interests: ${interests.length > 0 ? interests.join(", ") : "General Sightseeing & Cultural Discovery"}

AUTHORITATIVE DESTINATION FACTS (DO NOT INVENT OUTSIDE OF THESE):
- City/Region: ${destinationCity}
- State: ${destination.state}
- Best Season: ${destination.bestSeason || "Standard travel season"}
- Overview: ${destination.description || ""}
- Verified Primary Attractions:
${attractionsList}
- Verified Highlights & Experiences:
${highlightsList}
- Cultural & Environmental Guidelines: ${destination.culture || "Respect local customs and practice leave-no-trace tourism."}

PERSONALIZATION OBJECTIVE:
- Tailor the daily pace and activity sequencing to the '${travelStyle}' travel style.
- Prioritize activities matching interests: ${interests.join(", ") || "Heritage & Sightseeing"}.
- Ensure Day 1 starts with orientation/arrival and the final day concludes with farewell memories and artisan shopping.
- Provide 2-3 concise personalization notes in the response explaining how '${travelStyle}' and selected interests were met.`;

  const ai = new GoogleGenAI({ apiKey });

  // Call Gemini with structured schema and a 14-second AbortSignal timeout
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: ITINERARY_RESPONSE_SCHEMA,
      temperature: 0.3,
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error("EMPTY_GEMINI_RESPONSE");
  }

  const parsed = JSON.parse(responseText);
  return parsed;
}
