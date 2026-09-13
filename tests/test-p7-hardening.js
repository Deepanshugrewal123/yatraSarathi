/**
 * YatraSarathi — Phase P7 Production Hardening & Polish Verification Suite
 *
 * Runs 17 comprehensive test categories covering:
 * 1. Error Boundary rendering & stack trace suppression
 * 2. Malformed storage recovery
 * 3. Invalid saved-trip recovery
 * 4. AI fallback reliability
 * 5. AI schema validation & guardrails
 * 6. Import validation
 * 7. Malicious import handling (XSS/injection neutralization)
 * 8. RFC 5545 ICS calendar escaping
 * 9. Route coordinate validation
 * 10. Route missing-data fallback
 * 11. Reduced-motion CSS rules
 * 12. P4 persistence regression
 * 13. P5 route regression
 * 14. P6 export regression
 * 15. Destination search/filter regression
 * 16. Planner regression (budget & deterministic itineraries)
 * 17. Client secret exposure audit
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";

// Import modules under test
import {
  getSavedTrips,
  saveTrip,
  deleteTrip,
  isTripSaved,
  getFavorites,
  toggleFavorite,
  isFavorite,
} from "../src/utils/storage.js";
import {
  buildTripExportPayload,
  validateAndParseTripJson,
  escapeIcsText,
  exportTripAsIcs,
  sanitizeText,
} from "../src/utils/tripExport.js";
import {
  extractDayRoute,
  extractTripRoute,
  calculateDistanceKm,
  calculateRouteDistance,
} from "../src/utils/locationUtils.js";
import {
  destinations,
  getDestinationById,
  getAllStates,
} from "../src/data/destinations.js";
import {
  generateItinerary,
  calculateBudget,
} from "../src/utils/itineraryGenerator.js";
import { validateAndSanitizeItinerary } from "../api/guardrails.js";

let passedCount = 0;
let totalCount = 0;

function test(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`  ✓ [TEST ${totalCount}] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ [FAIL ${totalCount}] ${name}`);
    console.error(`    ${err.message}`);
    throw err;
  }
}

async function asyncTest(name, fn) {
  totalCount++;
  try {
    await fn();
    console.log(`  ✓ [TEST ${totalCount}] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ [FAIL ${totalCount}] ${name}`);
    console.error(`    ${err.message}`);
    throw err;
  }
}

// Mock localStorage for storage testing
const mockStorage = new Map();
global.window = {
  localStorage: {
    getItem: (key) => mockStorage.get(key) || null,
    setItem: (key, val) => mockStorage.set(key, String(val)),
    removeItem: (key) => mockStorage.delete(key),
    clear: () => mockStorage.clear(),
  },
  location: { reload: () => {} },
};

console.log("\n=======================================================");
console.log("  YATRASARATHI — PHASE P7 PRODUCTION HARDENING SUITE");
console.log("=======================================================\n");

// 1. Error Boundary Rendering
test("1. Error Boundary catches exceptions and renders recovery UI without stack traces", () => {
  const boundaryCode = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/ErrorBoundary.jsx"),
    "utf-8"
  );
  assert.ok(boundaryCode.includes("getDerivedStateFromError"));
  assert.ok(boundaryCode.includes("componentDidCatch"));
  assert.ok(boundaryCode.includes("Something went off course"));
  assert.ok(boundaryCode.includes("Reload Application"));
  assert.ok(boundaryCode.includes("Try Again"));
  assert.ok(!boundaryCode.includes("error.stack")); // No stack trace leakage
  assert.ok(boundaryCode.includes('role="alert"'));
  assert.ok(boundaryCode.includes('aria-live="assertive"'));

  // Transpile to ensure syntax is valid JSX/ES6
  const transformed = esbuild.transformSync(boundaryCode, { loader: "jsx" });
  assert.ok(transformed.code.length > 500);
});

// 2. Malformed Storage Recovery
test("2. Storage gracefully recovers from corrupted JSON, wrong schema, or null", () => {
  mockStorage.set("yatrasarathi_saved_trips", "INVALID_MALFORMED_JSON{{{");
  const trips = getSavedTrips();
  assert.deepStrictEqual(trips, []);

  mockStorage.set("yatrasarathi_favorites", "NOT_JSON_AT_ALL");
  const favs = getFavorites();
  assert.deepStrictEqual(favs, []);

  // Set non-object JSON
  mockStorage.set("yatrasarathi_saved_trips", JSON.stringify(12345));
  assert.deepStrictEqual(getSavedTrips(), []);
});

// 3. Invalid Saved-Trip Recovery
test("3. Storage skips corrupted/incomplete saved trips while keeping valid ones", () => {
  const validTrip = {
    id: "trip-jaipur-1",
    destination: { id: "jaipur", name: "Jaipur" },
    duration: 3,
    travellers: 2,
    budgetTier: "moderate",
    travelStyle: "Culture",
    pricing: { total: 24000 },
    days: [{ day: 1, theme: "Heritage Discovery" }],
  };

  const corruptedTrips = [
    null,
    "not an object",
    { id: "missing-dest" },
    { id: "missing-days", destination: { id: "goa" }, days: [] },
    validTrip,
    { id: "no-pricing", destination: { id: "munnar" }, days: [{ day: 1 }] },
  ];

  mockStorage.set(
    "yatrasarathi_saved_trips",
    JSON.stringify({ version: 1, trips: corruptedTrips })
  );

  const restored = getSavedTrips();
  assert.strictEqual(restored.length, 1);
  assert.strictEqual(restored[0].id, "trip-jaipur-1");
});

// 4. AI Fallback Reliability
await asyncTest("4. AI service client seamlessly falls back to deterministic planner on fetch failure", async () => {
  // Simulate fetch rejecting with network error
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error("Network request failed (offline / blocked)");
  };

  const { generateSmartItinerary } = await import("../src/services/aiService.js");
  const jaipur = getDestinationById("jaipur");
  const result = await generateSmartItinerary({
    destination: jaipur,
    days: 3,
    travellers: 2,
    budgetTier: "moderate",
    travelStyle: "Culture",
  });

  assert.strictEqual(result.mode, "deterministic");
  assert.ok(result.itinerary);
  assert.strictEqual(result.itinerary.days.length, 3);
  assert.ok(result.notice.includes("verified standard plan"));

  global.fetch = originalFetch;
});

// 5. AI Schema Validation & Guardrails
test("5. Guardrails validate and sanitize AI-generated days, themes, and activity slots", () => {
  const jaipur = getDestinationById("jaipur");

  // Case A: Missing slot rejection
  const missingSlotOutput = {
    days: [
      {
        day: 1,
        theme: "Royal Palaces",
        morning: { title: "Amber Fort", location: "Amber", time: "Morning" },
        afternoon: { title: "City Palace", location: "Jaipur", time: "Afternoon" },
        evening: { title: "Chokhi Dhani", location: "Jaipur", time: "Evening" },
      },
      // Missing afternoon & evening in day 2
      {
        day: 2,
        theme: "Bazaars",
        morning: { title: "Hawa Mahal", location: "Hawa Mahal", time: "Morning" },
      },
    ],
  };

  const validationMissing = validateAndSanitizeItinerary(missingSlotOutput, {
    destination: jaipur,
    days: 2,
    travellers: 2,
    budgetTier: "moderate",
    travelStyle: "Culture",
  });
  assert.strictEqual(validationMissing.valid, false);
  assert.ok(validationMissing.reason.includes("missing valid afternoon slot"));

  // Case B: Valid structure with hallucinated location sanitized
  const hallucinatedOutput = {
    summary: "Awesome trip to Jaipur",
    days: [
      {
        day: 1,
        theme: "Royal Heritage",
        morning: { title: "Amber Fort", location: "Amber Fort", time: "Morning" },
        afternoon: { title: "Eiffel Tower in Jaipur", location: "Fake Paris Tower", time: "Afternoon" },
        evening: { title: "Local Market", location: "Jaipur Market", time: "Evening" },
      },
    ],
  };

  const validationHallucination = validateAndSanitizeItinerary(hallucinatedOutput, {
    destination: jaipur,
    days: 1,
    travellers: 2,
    budgetTier: "moderate",
    travelStyle: "Culture",
  });
  assert.strictEqual(validationHallucination.valid, true);
  // Unverified landmark was safely neutralized by guardrail
  assert.strictEqual(validationHallucination.sanitizedItinerary.days[0].afternoon.location, "Jaipur Area");
});

// 6. Import Validation
test("6. validateAndParseTripJson parses valid exported JSON and rejects malformed inputs", () => {
  const jaipur = getDestinationById("jaipur");
  const validItinerary = generateItinerary({
    destination: jaipur,
    days: 2,
    travellers: 2,
    budgetTier: "moderate",
    travelStyle: "Culture",
  });

  const exportPayload = buildTripExportPayload(validItinerary);
  const jsonString = JSON.stringify(exportPayload);

  const importResult = validateAndParseTripJson(jsonString);
  assert.strictEqual(importResult.valid, true);
  assert.strictEqual(importResult.itinerary.destination.id, "jaipur");

  // Rejection tests
  assert.strictEqual(validateAndParseTripJson("").valid, false);
  assert.strictEqual(validateAndParseTripJson("{ broken json").valid, false);
  assert.strictEqual(
    validateAndParseTripJson(JSON.stringify({ schemaVersion: 999, trip: {} })).valid,
    false
  );
  assert.strictEqual(
    validateAndParseTripJson(
      JSON.stringify({ schemaVersion: 1, trip: { destination: { id: "atlantis" } } })
    ).valid,
    false
  );
});

// 7. Malicious Import Handling (XSS / Injection Neutralization)
test("7. HTML and script injection in imported payloads are thoroughly stripped", () => {
  const dirtyString = '<script>alert("pwned")</script><b>Hawa Mahal</b>\x00\x1F';
  const clean = sanitizeText(dirtyString);
  assert.strictEqual(clean, 'alert("pwned")Hawa Mahal');
  assert.ok(!clean.includes("<script>"));
  assert.ok(!clean.includes("<b>"));
});

// 8. RFC 5545 ICS Calendar Escaping
test("8. ICS text escaping adheres strictly to RFC 5545", () => {
  const rawText = "Visit Amber Fort; then, buy souvenirs at market\nEnjoy dinner!";
  const escaped = escapeIcsText(rawText);
  assert.strictEqual(
    escaped,
    "Visit Amber Fort\\; then\\, buy souvenirs at market\\nEnjoy dinner!"
  );

  const jaipur = getDestinationById("jaipur");
  const plan = generateItinerary({ destination: jaipur, days: 2 });
  const icsRes = exportTripAsIcs(plan, { returnContentOnly: true });
  const icsData = icsRes.icsContent;
  assert.ok(icsData.includes("BEGIN:VCALENDAR"));
  assert.ok(icsData.includes("BEGIN:VEVENT"));
  assert.ok(icsData.includes("END:VCALENDAR"));
  assert.ok(icsData.includes("\r\n")); // CRLF
});

// 9. Route Coordinate Validation
test("9. Spatial route extraction correctly resolves verified coordinates and calculates distance", () => {
  const jaipur = getDestinationById("jaipur");
  const plan = generateItinerary({ destination: jaipur, days: 2 });

  const day1Route = extractDayRoute(plan.days[0], jaipur);
  assert.ok(day1Route);
  assert.strictEqual(day1Route.stops.length, 3);
  assert.strictEqual(day1Route.validWaypoints.length, 1);
  assert.strictEqual(day1Route.validWaypoints[0].locationName, "Amer Fort");

  // Distance calculation across multiple verified waypoints
  const samplePoints = [
    { latitude: 26.9855, longitude: 75.8513 }, // Amer Fort
    { latitude: 26.9239, longitude: 75.8267 }, // Hawa Mahal
  ];
  const dist = calculateRouteDistance(samplePoints);
  assert.ok(typeof dist === "number" && dist > 5 && dist < 15);

  const tripRoute = extractTripRoute(plan.days, jaipur);
  assert.strictEqual(tripRoute.dayRoutes.length, 2);
  assert.strictEqual(tripRoute.totalMapReadyStops, 2);
});

// 10. Route Missing-Data Fallback
test("10. Route extraction safely handles destinations with missing or invalid coordinates", () => {
  const destinationWithoutCoords = {
    id: "mystery-place",
    name: "Mystery Place",
    state: "Nowhere",
    // No location or attractionLocations
  };

  const mockDay = {
    day: 1,
    theme: "Exploration",
    morning: { title: "Unknown Spot", location: "Unknown Spot" },
    afternoon: { title: "Unknown Spot 2", location: "Unknown Spot 2" },
    evening: { title: "Unknown Spot 3", location: "Unknown Spot 3" },
  };

  const route = extractDayRoute(mockDay, destinationWithoutCoords);
  assert.ok(route);
  assert.strictEqual(route.validWaypoints.length, 0);
  assert.strictEqual(route.approximateDistanceKm, null);
});

// 11. Reduced-Motion CSS Rules
test("11. index.css contains prefers-reduced-motion media query with instant transitions", () => {
  const cssPath = path.resolve(process.cwd(), "src/index.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  assert.ok(cssContent.includes("prefers-reduced-motion: reduce"));
  assert.ok(cssContent.includes("animation-duration: 0.01ms !important"));
  assert.ok(cssContent.includes("transition-duration: 0.01ms !important"));
  assert.ok(cssContent.includes("scroll-behavior: auto !important"));
});

// 12. P4 Persistence Regression
test("12. P4 storage operations function with full fidelity", () => {
  mockStorage.clear();
  const jaipur = getDestinationById("jaipur");
  const plan = generateItinerary({ destination: jaipur, days: 3 });

  // Save
  const saveRes = saveTrip(plan);
  assert.strictEqual(saveRes.success, true);
  assert.strictEqual(isTripSaved(plan), true);

  // Duplicate detection
  const duplicateRes = saveTrip(plan);
  assert.strictEqual(duplicateRes.isDuplicate, true);

  // Favorites
  const toggleRes = toggleFavorite("jaipur");
  assert.strictEqual(toggleRes.isFav, true);
  assert.strictEqual(isFavorite("jaipur"), true);

  // Toggle off
  const toggleOff = toggleFavorite("jaipur");
  assert.strictEqual(toggleOff.isFav, false);
  assert.strictEqual(isFavorite("jaipur"), false);

  // Delete trip
  const delRes = deleteTrip(saveRes.trip.id);
  assert.strictEqual(delRes, true);
  assert.strictEqual(getSavedTrips().length, 0);
});

// 13. P5 Route Intelligence Regression
test("13. Haversine distance formula returns accurate geodesic km between known coordinates", () => {
  // Mumbai (18.9220, 72.8347) to Pune (18.5204, 73.8567) ~ 120-130 km geodesic
  const dist = calculateDistanceKm([18.922, 72.8347], [18.5204, 73.8567]);
  assert.ok(dist > 100 && dist < 140, `Expected ~120km, got ${dist}`);
});

// 14. P6 Export Regression
test("14. Export payload complies with schema version 1 and contains clean serialization", () => {
  const goa = getDestinationById("goa");
  const plan = generateItinerary({ destination: goa, days: 4 });
  const payload = buildTripExportPayload(plan);

  assert.strictEqual(payload.schemaVersion, 1);
  assert.strictEqual(payload.generator, "YatraSarathi");
  assert.ok(payload.exportedAt);
  assert.strictEqual(payload.trip.destination.id, "goa");
  assert.strictEqual(payload.trip.days.length, 4);
});

// 15. Destination Search/Filter Regression
test("15. Destination query and multi-filter logic functions properly", () => {
  const allStates = getAllStates();
  assert.ok(allStates.length > 5);

  // Check popular vs hidden-gems separation
  const popular = destinations.filter((d) => d.category === "popular");
  const hiddenGems = destinations.filter((d) => d.category === "hidden-gem");
  assert.strictEqual(popular.length, 4);
  assert.strictEqual(hiddenGems.length, 5);
});

// 16. Planner Regression (Budget & Deterministic Generator)
test("16. Budget calculations and deterministic itineraries are mathematically consistent", () => {
  const alleppey = getDestinationById("alleppey");
  assert.ok(alleppey);
  const budget = calculateBudget(alleppey, 5, 2, "moderate");
  assert.ok(budget.total > 0);
  assert.ok(budget.breakdown.accommodation > 0);
  assert.ok(budget.breakdown.food > 0);
  assert.ok(budget.breakdown.activities > 0);
  assert.ok(budget.breakdown.transport > 0);

  const plan = generateItinerary({
    destination: alleppey,
    days: 5,
    travellers: 2,
    budgetTier: "moderate",
  });
  assert.strictEqual(plan.days.length, 5);
  assert.strictEqual(plan.mode, "deterministic");
});

// 17. Client Secret Exposure Audit
test("17. Zero client secret exposure in src/ directory", () => {
  const srcDir = path.resolve(process.cwd(), "src");
  const files = fs.readdirSync(srcDir, { recursive: true });

  for (const f of files) {
    const fullPath = path.join(srcDir, f);
    if (fs.statSync(fullPath).isFile() && (f.endsWith(".js") || f.endsWith(".jsx"))) {
      const content = fs.readFileSync(fullPath, "utf-8");
      assert.ok(
        !content.includes("process.env.GEMINI_API_KEY"),
        `File ${f} improperly references process.env.GEMINI_API_KEY in client code!`
      );
      assert.ok(
        !content.includes("@google/genai"),
        `File ${f} improperly imports @google/genai in client code!`
      );
    }
  }
});

console.log(`\n=======================================================`);
console.log(`  ALL ${passedCount} / ${totalCount} TESTS PASSED SUCCESSFULLY!`);
console.log(`=======================================================\n`);
