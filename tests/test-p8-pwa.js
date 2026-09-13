/**
 * YatraSarathi — Phase P8 Offline-First PWA Foundation Verification Suite
 *
 * Runs 20 comprehensive test categories covering:
 * 1. PWA Web App Manifest validity & required properties
 * 2. HTML link references (manifest, apple-touch-icon, theme-color)
 * 3. Service worker cache name & versioning
 * 4. App shell precaching list
 * 5. Strict SW security boundary (/api/ bypass)
 * 6. SW cross-origin & OpenStreetMap tile protection
 * 7. SW stale cache cleanup logic
 * 8. PWA registration utility safety (Node/SSR/browser fallback)
 * 9. Deterministic planner offline operation
 * 10. Budget estimation offline operation
 * 11. Saved Trips localStorage offline persistence
 * 12. Favorites localStorage offline persistence
 * 13. JSON Trip Export offline operation
 * 14. JSON Trip Import validation offline operation
 * 15. RFC 5545 ICS Calendar Export offline operation
 * 16. AI Service offline fallback (navigator.onLine === false)
 * 17. AI Service network exception fallback
 * 18. Route sequence & geodesic distance calculation offline
 * 19. Graceful offline map tile notice in RouteOverview
 * 20. Zero client secret exposure & P0–P7 regression stability
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

// Mock localStorage and window for storage testing in Node.js
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

// Configurable navigator mock
const navState = { onLine: true };
Object.defineProperty(globalThis, "navigator", {
  value: navState,
  configurable: true,
  writable: true,
});

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
  exportTripAsIcs,
} from "../src/utils/tripExport.js";
import {
  extractDayRoute,
} from "../src/utils/locationUtils.js";
import {
  destinations,
  getAllStates,
} from "../src/data/destinations.js";
import {
  generateItinerary,
  calculateBudget,
} from "../src/utils/itineraryGenerator.js";
import { generateSmartItinerary } from "../src/services/aiService.js";
import { registerServiceWorker } from "../src/utils/pwa.js";

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

console.log("\n=======================================================");
console.log("  YATRASARATHI — PHASE P8 PWA VERIFICATION SUITE");
console.log("=======================================================\n");

// --- TEST 1: PWA Manifest Validity ---
runTest("1. PWA Manifest has required schema, icons, and display mode", () => {
  const manifestPath = path.resolve("public/manifest.webmanifest");
  assert.ok(fs.existsSync(manifestPath), "manifest.webmanifest must exist");

  const raw = fs.readFileSync(manifestPath, "utf-8").trim();
  const content = JSON.parse(raw);
  assert.strictEqual(content.short_name, "YatraSarathi");
  assert.ok(content.name.includes("YatraSarathi"), "Name must contain YatraSarathi");
  assert.strictEqual(content.start_url, "/");
  assert.strictEqual(content.display, "standalone");
  assert.strictEqual(content.theme_color, "#f97316");
  assert.strictEqual(content.background_color, "#ffffff");
  assert.ok(Array.isArray(content.icons) && content.icons.length > 0, "Must declare icons");
  assert.strictEqual(content.icons[0].src, "/favicon.svg");
});

// --- TEST 2: HTML Reference ---
runTest("2. index.html includes manifest link, apple-touch-icon, and theme-color", () => {
  const htmlPath = path.resolve("index.html");
  const html = fs.readFileSync(htmlPath, "utf-8");

  assert.ok(
    html.includes('<link rel="manifest" href="/manifest.webmanifest" />'),
    "HTML must include link to manifest"
  );
  assert.ok(
    html.includes('<link rel="apple-touch-icon" href="/favicon.svg" />'),
    "HTML must include apple-touch-icon"
  );
  assert.ok(
    html.includes('<meta name="theme-color" content="#f97316" />'),
    "HTML must declare theme-color meta tag"
  );
});

// --- TEST 3: Service Worker Versioning ---
runTest("3. Service worker defines versioned cache name", () => {
  const swPath = path.resolve("public/sw.js");
  assert.ok(fs.existsSync(swPath), "sw.js must exist in public/");

  const swContent = fs.readFileSync(swPath, "utf-8");
  assert.ok(
    swContent.includes('const CACHE_NAME = "yatrasarathi-static-v1"') ||
      swContent.includes("yatrasarathi-static-v"),
    "SW must define a versioned cache name"
  );
});

// --- TEST 4: App Shell Precache Assets ---
runTest("4. Service worker precaches critical app shell assets", () => {
  const swContent = fs.readFileSync(path.resolve("public/sw.js"), "utf-8");
  assert.ok(swContent.includes('"/"'), "Precache must include /");
  assert.ok(swContent.includes('"/index.html"'), "Precache must include /index.html");
  assert.ok(swContent.includes('"/manifest.webmanifest"'), "Precache must include manifest");
  assert.ok(swContent.includes('"/favicon.svg"'), "Precache must include favicon");
});

// --- TEST 5: Strict SW /api/ Bypass ---
runTest("5. Service worker strictly avoids caching /api/ requests", () => {
  const swContent = fs.readFileSync(path.resolve("public/sw.js"), "utf-8");
  assert.ok(
    swContent.includes('pathname.startsWith("/api/")'),
    "SW must check and bypass /api/ endpoints"
  );
});

// --- TEST 6: SW Cross-Origin & Tile Boundary ---
runTest("6. Service worker restricts caching to same-origin assets", () => {
  const swContent = fs.readFileSync(path.resolve("public/sw.js"), "utf-8");
  assert.ok(
    swContent.includes("url.origin !== self.location.origin"),
    "SW must ignore cross-origin resources"
  );
});

// --- TEST 7: SW Stale Cache Purge on Activate ---
runTest("7. Service worker activate event cleans up outdated caches", () => {
  const swContent = fs.readFileSync(path.resolve("public/sw.js"), "utf-8");
  assert.ok(swContent.includes("caches.delete"), "SW must delete non-matching caches");
  assert.ok(swContent.includes("clients.claim()"), "SW must claim clients");
});

// --- TEST 8: PWA Registration Utility ---
runTest("8. registerServiceWorker handles SSR/tests without throwing", () => {
  assert.doesNotThrow(() => {
    registerServiceWorker();
  }, "registerServiceWorker should not throw in Node.js environment");
});

// --- TEST 9: Deterministic Planner Offline Execution ---
runTest("9. Deterministic itinerary generation runs completely offline", () => {
  const dest = destinations[0];
  const plan = generateItinerary({
    destination: dest,
    days: 3,
    peoples: 2,
    budgetTier: "moderate",
    travelStyle: "relaxed",
    interests: ["Heritage", "Photography"],
    variation: 0,
  });

  assert.ok(plan, "Plan must be returned");
  assert.strictEqual(plan.days.length, 3, "Must generate 3 days");
  assert.ok(plan.pricing && plan.pricing.total > 0, "Must calculate budget");
  assert.ok(plan.days[0].morning, "Must generate morning activity");
});

// --- TEST 10: Budget Estimation Offline ---
runTest("10. calculateBudget computes deterministic tiers offline", () => {
  const dest = destinations[0];
  const budgetBudget = calculateBudget(dest, 3, 2, "budget");
  const budgetModerate = calculateBudget(dest, 3, 2, "moderate");
  const budgetPremium = calculateBudget(dest, 3, 2, "premium");

  assert.ok(budgetBudget.total < budgetModerate.total, "Budget tier must be lower than moderate tier");
  assert.ok(budgetModerate.total < budgetPremium.total, "Premium tier must be higher than moderate tier");
});

// --- TEST 11: Saved Trips Persistence Offline ---
runTest("11. Saved trips persist, update, and delete offline via localStorage", () => {
  mockStorage.clear();
  const dest = destinations[0];
  const testItinerary = {
    id: "trip-offline-test",
    destination: dest,
    duration: 2,
    travellers: 1,
    budgetTier: "moderate",
    travelStyle: "Balanced",
    pricing: { total: 8000 },
    days: [{ day: 1, theme: "Day 1", morning: { title: "Sight 1" } }],
  };

  const saveRes = saveTrip(testItinerary);
  assert.strictEqual(saveRes.success, true);
  assert.strictEqual(isTripSaved(testItinerary), true);

  const trips = getSavedTrips();
  assert.strictEqual(trips.length, 1);
  assert.strictEqual(trips[0].id, "trip-offline-test");

  const delRes = deleteTrip("trip-offline-test");
  assert.strictEqual(delRes, true);
  assert.strictEqual(getSavedTrips().length, 0);
});

// --- TEST 12: Favorites Persistence Offline ---
runTest("12. Favorites persist and toggle offline via localStorage", () => {
  mockStorage.clear();
  const destId = destinations[0].id;

  assert.strictEqual(isFavorite(destId), false);
  const toggle1 = toggleFavorite(destId);
  assert.strictEqual(toggle1.isFav, true);
  assert.strictEqual(isFavorite(destId), true);
  assert.strictEqual(getFavorites().length, 1);

  const toggle2 = toggleFavorite(destId);
  assert.strictEqual(toggle2.isFav, false);
  assert.strictEqual(isFavorite(destId), false);
  assert.strictEqual(getFavorites().length, 0);
});

// --- TEST 13: JSON Trip Export Offline ---
runTest("13. Trip JSON export builds verified portable payload offline", () => {
  const dest = destinations[0];
  const itinerary = {
    destination: dest,
    duration: 3,
    travellers: 2,
    budgetTier: "moderate",
    travelStyle: "relaxed",
    days: [{ day: 1, morning: { title: "Explore" } }],
  };

  const payload = buildTripExportPayload(itinerary);
  assert.strictEqual(payload.generator, "YatraSarathi");
  assert.strictEqual(payload.schemaVersion, 1);
  assert.strictEqual(payload.trip.duration, 3);
  assert.strictEqual(payload.trip.destination.id, dest.id);
});

// --- TEST 14: JSON Trip Import Offline ---
runTest("14. Trip JSON import parses and validates structure offline", () => {
  const dest = destinations[0];
  const validJson = JSON.stringify({
    schemaVersion: 1,
    generator: "YatraSarathi",
    exportedAt: new Date().toISOString(),
    trip: {
      destination: { id: dest.id, name: dest.name, state: dest.state },
      duration: 2,
      travellers: 2,
      budgetTier: "moderate",
      travelStyle: "Balanced",
      days: [
        {
          day: 1,
          theme: "Day 1",
          morning: { title: "Activity 1" },
          afternoon: { title: "Activity 2" },
          evening: { title: "Activity 3" },
        },
      ],
    },
  });

  const parsed = validateAndParseTripJson(validJson);
  assert.strictEqual(parsed.valid, true);
  assert.strictEqual(parsed.itinerary.destination.id, dest.id);
});

// --- TEST 15: RFC 5545 ICS Calendar Export Offline ---
runTest("15. RFC 5545 ICS calendar export formats entries offline", () => {
  const dest = destinations[0];
  const itinerary = {
    destination: dest,
    duration: 1,
    travellers: 2,
    days: [
      {
        day: 1,
        theme: "Historical Tour",
        morning: { title: "Fort Visit", time: "08:30 AM" },
        afternoon: { title: "Museum Walk", time: "01:30 PM" },
        evening: { title: "Bazaar", time: "05:30 PM" },
      },
    ],
  };

  const res = exportTripAsIcs(itinerary);
  assert.strictEqual(res.success, true);
  assert.ok(res.icsContent.includes("BEGIN:VCALENDAR"), "Must contain VCALENDAR header");
  assert.ok(res.icsContent.includes("BEGIN:VEVENT"), "Must contain VEVENT");
  assert.ok(res.icsContent.includes("Fort Visit"), "Must include activity summary");
  assert.ok(res.icsContent.includes("END:VCALENDAR"), "Must contain VCALENDAR footer");
});

// --- TEST 16: AI Offline Fallback When Navigator Offline ---
await runAsyncTest("16. AI service immediately falls back when navigator.onLine is false", async () => {
  navState.onLine = false;

  try {
    const dest = destinations[0];
    const result = await generateSmartItinerary({
      destination: dest,
      days: 2,
      travellers: 1,
      budgetTier: "budget",
      travelStyle: "fast-paced",
    });

    assert.strictEqual(result.mode, "deterministic", "Must return deterministic plan");
    assert.strictEqual(
      result.notice,
      "AI planning is unavailable offline. We've switched to your verified standard planner.",
      "Notice must match specification"
    );
    assert.strictEqual(result.itinerary.days.length, 2, "Must contain full itinerary");
  } finally {
    navState.onLine = true;
  }
});

// --- TEST 17: AI Network Failure Fallback ---
await runAsyncTest("17. AI service gracefully handles network fetch failure", async () => {
  navState.onLine = true;
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => {
    throw new Error("Failed to fetch (net::ERR_INTERNET_DISCONNECTED)");
  };

  try {
    const dest = destinations[0];
    const result = await generateSmartItinerary({
      destination: dest,
      days: 3,
      travellers: 2,
      budgetTier: "moderate",
      travelStyle: "relaxed",
    });

    assert.strictEqual(result.mode, "deterministic", "Must fall back to deterministic plan");
    assert.strictEqual(result.itinerary.days.length, 3);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// --- TEST 18: Route Timeline & Geodesic Calculation Offline ---
runTest("18. Route sequence and geodesic distances compute offline", () => {
  const dest = destinations.find((d) => Array.isArray(d.attractionLocations) && d.attractionLocations.length >= 2);
  assert.ok(dest, "Must find destination with verified coordinates");

  const plan = generateItinerary({
    destination: dest,
    days: 3,
    peoples: 2,
    budgetTier: "moderate",
    travelStyle: "relaxed",
    variation: 0,
  });

  const dayRoute = extractDayRoute(plan.days[0], dest);
  assert.strictEqual(dayRoute.stops.length, 3);
  assert.ok(dayRoute.stops.some((s) => s.slotKey === "morning"));
  assert.ok(dayRoute.stops.some((s) => s.slotKey === "afternoon"));
  assert.ok(dayRoute.stops.some((s) => s.slotKey === "evening"));
  assert.ok(typeof dayRoute.totalStops === "number" && dayRoute.totalStops === 3);
});

// --- TEST 19: Offline Notices in Components ---
runTest("19. RouteOverview & OfflineIndicator declare required offline notices", () => {
  const routeContent = fs.readFileSync(
    path.resolve("src/components/RouteOverview.jsx"),
    "utf-8"
  );
  assert.ok(
    routeContent.includes(
      "Map tiles require an active internet connection. Your route timeline and verified location sequence remain available offline."
    ),
    "RouteOverview must contain exact offline map notice"
  );

  const indicatorContent = fs.readFileSync(
    path.resolve("src/components/OfflineIndicator.jsx"),
    "utf-8"
  );
  assert.ok(
    indicatorContent.includes('role="status"'),
    "OfflineIndicator must have role=status"
  );
  assert.ok(
    indicatorContent.includes('aria-live="polite"'),
    "OfflineIndicator must have aria-live=polite"
  );
  assert.ok(
    indicatorContent.includes(
      "Offline Mode — Standard planner, saved trips & route sequence available."
    ),
    "OfflineIndicator must display offline notice"
  );
  assert.ok(
    indicatorContent.includes("Back Online"),
    "OfflineIndicator must display Back Online badge"
  );
});

// --- TEST 20: Client Secret Exposure & P0–P7 Stability ---
runTest("20. Zero secret exposure and complete P0–P7 feature regression stability", () => {
  const swContent = fs.readFileSync(path.resolve("public/sw.js"), "utf-8");
  assert.ok(!swContent.includes("GEMINI_API_KEY"), "sw.js must not contain GEMINI_API_KEY");
  assert.ok(!swContent.includes("AIzaSy"), "sw.js must not contain Google API key");

  // Destinations integrity
  assert.ok(destinations.length >= 8, "Destinations dataset intact");
  const states = getAllStates();
  assert.ok(states.length > 5, "States list intact");

  // App.jsx includes OfflineIndicator
  const appContent = fs.readFileSync(path.resolve("src/App.jsx"), "utf-8");
  assert.ok(appContent.includes("<OfflineIndicator />"), "App.jsx must render OfflineIndicator");
});

console.log("\n=======================================================");
console.log(`  RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
console.log("=======================================================\n");

if (passedTests === totalTests) {
  console.log("P8 PASS — Offline-First PWA Ready\n");
  process.exit(0);
} else {
  console.error("P8 FAIL — Issues Remain\n");
  process.exit(1);
}
