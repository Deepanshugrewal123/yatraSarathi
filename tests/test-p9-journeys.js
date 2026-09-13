/**
 * YatraSarathi — Phase P9 User Journeys Verification Suite
 *
 * Simulates and verifies the 6 required real-world user journeys:
 * - Journey A: First-Time User
 * - Journey B: AI User
 * - Journey C: Standard Planner User
 * - Journey D: Returning User
 * - Journey E: Favorites Synchronization
 * - Journey F: Offline-First Traveler
 */

import assert from "node:assert";

// Mock localStorage and window
const storageStore = new Map();
global.window = {
  localStorage: {
    getItem: (k) => storageStore.get(k) || null,
    setItem: (k, v) => storageStore.set(k, String(v)),
    removeItem: (k) => storageStore.delete(k),
    clear: () => storageStore.clear(),
  },
  location: { reload: () => {} },
  navigator: {
    clipboard: {
      writeText: async (t) => t,
    },
  },
};

const navState = { onLine: true };
Object.defineProperty(globalThis, "navigator", {
  value: navState,
  configurable: true,
  writable: true,
});

// Import modules under test
import { destinations, getDestinationById } from "../src/data/destinations.js";
import { generateItinerary } from "../src/utils/itineraryGenerator.js";
import { generateSmartItinerary, regenerateVariation } from "../src/services/aiService.js";
import {
  saveTrip,
  getSavedTrips,
  deleteTrip,
  isTripSaved,
  toggleFavorite,
  getFavorites,
  isFavorite,
} from "../src/utils/storage.js";
import {
  buildTripExportPayload,
  validateAndParseTripJson,
  exportTripAsIcs,
} from "../src/utils/tripExport.js";
import { extractDayRoute } from "../src/utils/locationUtils.js";
import { validateAndSanitizeItinerary } from "../api/guardrails.js";

let passed = 0;
let total = 0;

function runJourneyTest(journeyName, stepName, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✓ [${journeyName}] ${stepName}`);
  } catch (err) {
    console.error(`  ✗ [${journeyName}] ${stepName}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

async function runAsyncJourneyTest(journeyName, stepName, fn) {
  total++;
  try {
    await fn();
    passed++;
    console.log(`  ✓ [${journeyName}] ${stepName}`);
  } catch (err) {
    console.error(`  ✗ [${journeyName}] ${stepName}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

console.log("\n=======================================================");
console.log("  YATRASARATHI — PHASE P9 USER JOURNEYS SUITE");
console.log("=======================================================\n");

// ==========================================================
// JOURNEY A: FIRST-TIME USER
// ==========================================================
runJourneyTest("Journey A", "1. Discover and filter destinations by state and search keyword", () => {
  const query = "beach";
  const filtered = destinations.filter(
    (d) =>
      d.name.toLowerCase().includes(query) ||
      d.tags.some((t) => t.toLowerCase().includes(query))
  );
  assert.ok(filtered.length > 0, "Search for 'beach' must find destinations");
  assert.strictEqual(filtered[0].id, "goa");
});

runJourneyTest("Journey A", "2. Open destination details and favorite destination", () => {
  storageStore.clear();
  const dest = getDestinationById("goa");
  assert.ok(dest, "Destination details must load");
  const favResult = toggleFavorite(dest.id);
  assert.strictEqual(favResult.isFav, true);
  assert.strictEqual(isFavorite(dest.id), true);
});

runJourneyTest("Journey A", "3. Trigger Plan Trip Here prefill and generate initial itinerary", () => {
  const dest = getDestinationById("goa");
  const prefill = {
    destination: dest,
    days: dest.days,
    peoples: dest.peoples,
    budgetTier: dest.budgetTier,
    travelStyle: dest.travelStyle,
    interests: dest.tags,
  };

  const plan = generateItinerary(prefill);
  assert.ok(plan, "Must generate valid itinerary");
  assert.strictEqual(plan.destination.id, "goa");
  assert.strictEqual(plan.days.length, dest.days);
  assert.ok(plan.pricing.total > 0, "Must calculate budget");
});

// ==========================================================
// JOURNEY B: AI USER
// ==========================================================
runJourneyTest("Journey B", "1. Provide user preferences and generate guarded AI plan", () => {
  const dest = getDestinationById("jaipur");
  const params = {
    destination: dest,
    days: 3,
    travellers: 2,
    budgetTier: "moderate",
    travelStyle: "Cultural & Heritage",
    interests: ["Heritage", "Photography"],
  };

  // Mock raw Gemini response conforming to structured JSON schema
  const simulatedAiRaw = {
    summary: "An evocative 3-day cultural exploration of Jaipur's royal palaces and heritage trails.",
    personalizationNotes: [
      "Sequenced early morning visits to Amber Palace to capture optimal golden-hour photography.",
      "Balanced heritage monument exploration with authentic Rajasthani dining in the Old City.",
    ],
    days: [
      {
        day: 1,
        theme: "Day 1: Royal Palaces & Grand Citadels",
        morning: {
          time: "08:30 AM – 12:30 PM",
          title: "Amber Palace Citadel",
          description: "Explore the ornate courtyards and hilltop ramparts.",
          location: "Amber Palace (Amer Fort)",
          tag: "Heritage",
        },
        afternoon: {
          time: "01:30 PM – 05:00 PM",
          title: "City Palace Exploration",
          description: "Admire royal costume museums and marble pavilions.",
          location: "City Palace",
          tag: "Culture",
        },
        evening: {
          time: "05:30 PM – 08:30 PM",
          title: "Johari Bazaar & Heritage Dining",
          description: "Wander through traditional textile and jewelry markets.",
          location: "Johari Bazaar",
          tag: "Dining",
        },
        ecoTip: "Support traditional block-print craft cooperatives directly.",
      },
      {
        day: 2,
        theme: "Day 2: Astronomic Curiosities & Scenic Vistas",
        morning: {
          time: "08:30 AM – 12:30 PM",
          title: "Jantar Mantar Observatory",
          description: "Marvel at ancient UNESCO-listed geometric astronomical instruments.",
          location: "Jantar Mantar",
          tag: "Heritage",
        },
        afternoon: {
          time: "01:30 PM – 05:00 PM",
          title: "Hawa Mahal Facade",
          description: "Photograph the iconic honeycomb sandstone windows.",
          location: "Hawa Mahal",
          tag: "Photography",
        },
        evening: {
          time: "05:30 PM – 08:30 PM",
          title: "Sunset at Nahargarh Foothills",
          description: "Watch dusk settle over the pink city rooftops.",
          location: "Jaipur Promenade",
          tag: "Sunset",
        },
        ecoTip: "Keep historical palace courtyards clean and respect quiet zones.",
      },
      {
        day: 3,
        theme: "Day 3: Hilltop Fortresses & Farewell Memories",
        morning: {
          time: "08:30 AM – 12:30 PM",
          title: "Nahargarh Fort Overlook",
          description: "Stroll the rugged Aravalli ridge walls for panoramic views.",
          location: "Nahargarh Fort",
          tag: "Scenic",
        },
        afternoon: {
          time: "01:30 PM – 05:00 PM",
          title: "Local Artisan Exploration",
          description: "Discover handcrafted blue pottery and artisanal bazaars.",
          location: "Old Town Market",
          tag: "Shopping",
        },
        evening: {
          time: "05:30 PM – 08:30 PM",
          title: "Farewell Rajasthani Thali",
          description: "Savor dal baati churma and traditional folk melodies.",
          location: "Jaipur Dining",
          tag: "Dining",
        },
        ecoTip: "Choose government-certified emporiums for authentic handicraft provenance.",
      },
    ],
  };

  const guardResult = validateAndSanitizeItinerary(simulatedAiRaw, params);
  assert.strictEqual(guardResult.valid, true, "Guardrail must accept grounded AI plan");
  assert.strictEqual(guardResult.sanitizedItinerary.mode, "ai");
  assert.strictEqual(guardResult.sanitizedItinerary.personalizationNotes.length, 2);
  assert.ok(guardResult.sanitizedItinerary.pricing.total > 0, "Budget must be injected deterministically");

  // Save the AI itinerary
  const saveRes = saveTrip(guardResult.sanitizedItinerary);
  assert.strictEqual(saveRes.success, true);
  assert.strictEqual(isTripSaved(guardResult.sanitizedItinerary), true);
});

// ==========================================================
// JOURNEY C: STANDARD PLANNER USER
// ==========================================================
runJourneyTest("Journey C", "1. Generate deterministic plan and test regenerate variation", () => {
  const dest = getDestinationById("shimla");
  const params = {
    destination: dest,
    days: 4,
    travellers: 2,
    budgetTier: "moderate",
    travelStyle: "Balanced",
  };

  const initialPlan = generateItinerary({ ...params, variation: 0 });
  const var1Result = regenerateVariation(params, 1);

  assert.strictEqual(initialPlan.destination.id, "shimla");
  assert.strictEqual(var1Result.itinerary.destination.id, "shimla");
  assert.strictEqual(initialPlan.pricing.total, var1Result.itinerary.pricing.total, "Budget must remain identical across variations");
  assert.notStrictEqual(initialPlan.id, var1Result.itinerary.id, "Variation seed must produce unique ID");

  // Save and reopen
  saveTrip(initialPlan);
  saveTrip(var1Result.itinerary);
  const saved = getSavedTrips();
  assert.strictEqual(saved.length, 2, "Both distinct variations must be preserved");
});

// ==========================================================
// JOURNEY D: RETURNING USER (RELOAD, EXPORT, IMPORT, DELETE)
// ==========================================================
runJourneyTest("Journey D", "1. Reload state, export trip, validate import duplicate detection, and delete", () => {
  // 1. Reload verification
  const tripsOnReload = getSavedTrips();
  assert.ok(tripsOnReload.length >= 2, "Saved trips must survive reload");

  // 2. Export
  const tripToExport = tripsOnReload[0];
  const exportPayload = buildTripExportPayload(tripToExport);
  assert.strictEqual(exportPayload.generator, "YatraSarathi");
  assert.strictEqual(exportPayload.schemaVersion, 1);

  // 3. Import & Duplicate check
  const jsonStr = JSON.stringify(exportPayload);
  const importRes = validateAndParseTripJson(jsonStr);
  assert.strictEqual(importRes.valid, true);

  const isDuplicate = tripsOnReload.some(
    (t) =>
      t.destination.id === importRes.itinerary.destination.id &&
      t.duration === importRes.itinerary.duration &&
      t.travellers === importRes.itinerary.travellers &&
      t.budgetTier === importRes.itinerary.budgetTier &&
      t.travelStyle === importRes.itinerary.travelStyle &&
      (t.mode || "deterministic") === (importRes.itinerary.mode || "deterministic")
  );
  assert.strictEqual(isDuplicate, true, "Must recognize re-imported trip as duplicate");

  // 4. Delete
  const delSuccess = deleteTrip(tripToExport.id);
  assert.strictEqual(delSuccess, true);
  assert.strictEqual(getSavedTrips().length, tripsOnReload.length - 1);
});

// ==========================================================
// JOURNEY E: FAVORITES SYNCHRONIZATION
// ==========================================================
runJourneyTest("Journey E", "1. Synchronize favorites across explorer, hidden gems, and details modal", () => {
  storageStore.clear();
  assert.strictEqual(getFavorites().length, 0);

  // Favorite from Explorer
  toggleFavorite("goa");
  assert.strictEqual(isFavorite("goa"), true);
  assert.strictEqual(getFavorites().length, 1);

  // Favorite from Hidden Gems
  toggleFavorite("ziro-valley");
  assert.strictEqual(isFavorite("ziro-valley"), true);
  assert.strictEqual(getFavorites().length, 2);

  // Unfavorite from Details Modal
  toggleFavorite("goa");
  assert.strictEqual(isFavorite("goa"), false);
  assert.strictEqual(isFavorite("ziro-valley"), true);
  assert.strictEqual(getFavorites().length, 1);
});

// ==========================================================
// JOURNEY F: OFFLINE-FIRST TRAVELER
// ==========================================================
await runAsyncJourneyTest("Journey F", "1. Complete full offline flow: browse, plan, route, export, and deterministic AI fallback", async () => {
  // 1. Go Offline
  navState.onLine = false;

  // 2. Offline browsing & planning
  const dest = destinations[0];
  const offlinePlan = generateItinerary({
    destination: dest,
    days: 3,
    peoples: 2,
    budgetTier: "moderate",
    travelStyle: "Balanced",
  });
  assert.ok(offlinePlan && offlinePlan.days.length === 3);

  // 3. Offline route calculations
  // Day 1: Single landmark stop — distance safely null, no invented points
  const day1Route = extractDayRoute(offlinePlan.days[0], dest);
  assert.ok(day1Route.stops.length === 3);
  assert.strictEqual(day1Route.validWaypoints.length, 1);
  assert.strictEqual(day1Route.approximateDistanceKm, null, "Single stop day must not invent distance");

  // Day 2: Multi-landmark day — at least 2 valid waypoints with straight-line distance
  const day2Route = extractDayRoute(offlinePlan.days[1], dest);
  assert.ok(day2Route.stops.length === 3);
  assert.ok(day2Route.validWaypoints.length >= 2);
  assert.ok(typeof day2Route.approximateDistanceKm === "number" && day2Route.approximateDistanceKm > 0);

  // 4. Offline exports
  const jsonExport = buildTripExportPayload(offlinePlan);
  assert.ok(jsonExport.generator === "YatraSarathi");
  const icsExport = exportTripAsIcs(offlinePlan);
  assert.ok(icsExport.success && icsExport.icsContent.includes("BEGIN:VCALENDAR"));

  // 5. Offline AI fallback
  const aiResult = await generateSmartItinerary({
    destination: dest,
    days: 3,
    travellers: 2,
  });
  assert.strictEqual(aiResult.mode, "deterministic");
  assert.strictEqual(
    aiResult.notice,
    "AI planning is unavailable offline. We've switched to your verified standard planner."
  );
  assert.strictEqual(aiResult.itinerary.notice, aiResult.notice);

  // 6. Reconnect Online
  navState.onLine = true;
});

console.log("\n=======================================================");
console.log(`  JOURNEYS RESULT: ${passed}/${total} TESTS PASSED`);
console.log("=======================================================\n");

if (passed === total) {
  console.log("ALL 6 USER JOURNEYS VALIDATED IN AUTOMATED SIMULATION.\n");
  process.exit(0);
} else {
  console.error("FAILURES IN USER JOURNEYS.\n");
  process.exit(1);
}
