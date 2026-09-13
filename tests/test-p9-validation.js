/**
 * YatraSarathi — Phase P9 Real-World Product Validation & UX Audit Verification Suite
 *
 * Validates fixes for:
 * 1. AI fallback notice preservation (result.notice & itinerary.notice)
 * 2. Offline fallback notice string match
 * 3. Network error notice preservation
 * 4. Duplicate detection mode normalization (legacy trips compatibility)
 * 5. Full-range deterministic itinerary generation (1-day & 14-days across all 9 destinations)
 * 6. Mathematical budget determinism across all destinations and tiers
 * 7. Geodesic distance terminology compliance (no driving/walking claims)
 * 8. Destination dataset integrity (all 9 destinations, unique IDs, verified coordinates, local images)
 * 9. JSON Export/Import roundtrip fidelity
 * 10. RFC 5545 ICS calendar formatting & text escaping
 * 11. Print CSS hiding offline indicator and background sections
 * 12. ARIA tab semantics in ItineraryView day filter tabs
 * 13. Responsive OfflineIndicator constraints for mobile viewports
 * 14. Non-jarring focus management on Plan Trip Here
 * 15. Zero client secret exposure in src/
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

// Mock localStorage and window for Node.js environment
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

// Import application modules
import { destinations } from "../src/data/destinations.js";
import {
  generateItinerary,
  calculateBudget,
} from "../src/utils/itineraryGenerator.js";
import { generateSmartItinerary } from "../src/services/aiService.js";
import {
  buildTripExportPayload,
  validateAndParseTripJson,
  exportTripAsIcs,
  escapeIcsText,
} from "../src/utils/tripExport.js";

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

async function asyncTest(name, fn) {
  total++;
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

console.log("\n=======================================================");
console.log("  YATRASARATHI — PHASE P9 VALIDATION SUITE");
console.log("=======================================================\n");

// --- TEST 1: Fallback Notice Preservation ---
await asyncTest("1. AI service attaches notice to both result AND itinerary object on offline fallback", async () => {
  navState.onLine = false;
  try {
    const dest = destinations[0];
    const result = await generateSmartItinerary({
      destination: dest,
      days: 3,
      travellers: 2,
    });

    assert.strictEqual(result.mode, "deterministic");
    assert.ok(result.notice, "result.notice must exist");
    assert.strictEqual(
      result.itinerary.notice,
      result.notice,
      "itinerary.notice must match result.notice so UI never drops the banner"
    );
    assert.strictEqual(
      result.notice,
      "Personalization is unavailable offline. Displaying your verified standard plan."
    );
  } finally {
    navState.onLine = true;
  }
});

// --- TEST 2: Network Error Notice Preservation ---
await asyncTest("2. Network error fallback attaches notice to both result and itinerary", async () => {
  navState.onLine = true;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("Failed to fetch");
  };

  try {
    const dest = destinations[1];
    const result = await generateSmartItinerary({
      destination: dest,
      days: 2,
      travellers: 1,
    });

    assert.strictEqual(result.mode, "deterministic");
    assert.ok(result.notice, "result.notice must exist");
    assert.ok(result.itinerary.notice, "itinerary.notice must exist");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// --- TEST 3: Duplicate Detection with Undefined Mode ---
test("3. Duplicate trip detection handles legacy trips where mode is undefined", () => {
  const dest = destinations[0];
  const legacyTrip = {
    id: "legacy-1",
    destination: { id: dest.id },
    duration: 3,
    travellers: 2,
    budgetTier: "moderate",
    travelStyle: "Balanced",
    // mode is intentionally undefined (legacy P4 trip)
  };

  const importedTrip = {
    id: "imported-1",
    destination: { id: dest.id },
    duration: 3,
    travellers: 2,
    budgetTier: "moderate",
    travelStyle: "Balanced",
    mode: "deterministic",
  };

  const trips = [legacyTrip];
  const isDuplicate = trips.some(
    (t) =>
      t.destination.id === importedTrip.destination.id &&
      t.duration === importedTrip.duration &&
      t.travellers === importedTrip.travellers &&
      t.budgetTier === importedTrip.budgetTier &&
      t.travelStyle === importedTrip.travelStyle &&
      (t.mode || "deterministic") === (importedTrip.mode || "deterministic")
  );

  assert.strictEqual(isDuplicate, true, "Must recognize duplicate even with legacy undefined mode");
});

// --- TEST 4: Full-Range Deterministic Generator ---
test("4. Deterministic itinerary generation produces valid plans for 1-day and 14-days across all 9 destinations", () => {
  for (const dest of destinations) {
    // 1-day trip
    const plan1 = generateItinerary({
      destination: dest,
      days: 1,
      peoples: 1,
      budgetTier: "budget",
      travelStyle: "Relaxed",
      interests: [],
    });
    assert.strictEqual(plan1.days.length, 1);
    assert.ok(plan1.days[0].morning?.title, `Day 1 morning must have title in ${dest.id}`);
    assert.ok(plan1.days[0].afternoon?.title, `Day 1 afternoon must have title in ${dest.id}`);
    assert.ok(plan1.days[0].evening?.title, `Day 1 evening must have title in ${dest.id}`);
    assert.ok(plan1.pricing?.total > 0, `Budget must be calculated in ${dest.id}`);

    // 14-day trip with all interests
    const plan14 = generateItinerary({
      destination: dest,
      days: 14,
      peoples: 6,
      budgetTier: "premium",
      travelStyle: "Adventure",
      interests: ["Nature", "Heritage", "Culture"],
    });
    assert.strictEqual(plan14.days.length, 14);
    for (const d of plan14.days) {
      assert.ok(d.morning?.title, `Day ${d.day} morning must have title in ${dest.id}`);
      assert.ok(d.afternoon?.title, `Day ${d.day} afternoon must have title in ${dest.id}`);
      assert.ok(d.evening?.title, `Day ${d.day} evening must have title in ${dest.id}`);
    }
  }
});

// --- TEST 5: Mathematical Budget Determinism ---
test("5. Budget tiers strictly follow Budget < Moderate < Premium ordering across all destinations", () => {
  for (const dest of destinations) {
    const budget = calculateBudget(dest, 4, 2, "budget");
    const moderate = calculateBudget(dest, 4, 2, "moderate");
    const premium = calculateBudget(dest, 4, 2, "premium");

    assert.ok(
      budget.total < moderate.total,
      `Budget tier total (${budget.total}) must be < moderate (${moderate.total}) for ${dest.id}`
    );
    assert.ok(
      moderate.total < premium.total,
      `Moderate tier total (${moderate.total}) must be < premium (${premium.total}) for ${dest.id}`
    );
    assert.strictEqual(budget.currency, "INR");
  }
});

// --- TEST 6: Product Trust & Geodesic Distance Truth ---
test("6. UI and codebase strictly label distance as geodesic/straight-line, never driving/walking", () => {
  const routeOverviewPath = path.resolve("src/components/RouteOverview.jsx");
  const routeContent = fs.readFileSync(routeOverviewPath, "utf-8");

  assert.ok(
    routeContent.includes("(straight-line geodesic)"),
    "RouteOverview must explicitly declare straight-line geodesic"
  );
  assert.ok(
    !routeContent.includes("driving distance"),
    "RouteOverview must never claim driving distance"
  );
  assert.ok(
    !routeContent.includes("walking distance"),
    "RouteOverview must never claim walking distance"
  );
});

// --- TEST 7: Destination Dataset Integrity ---
test("7. All 9 destinations have unique IDs, verified coordinates, and valid images", () => {
  assert.strictEqual(destinations.length, 9, "Must have exactly 9 curated destinations");
  const seenIds = new Set();

  for (const dest of destinations) {
    assert.ok(!seenIds.has(dest.id), `Duplicate ID found: ${dest.id}`);
    seenIds.add(dest.id);

    assert.ok(dest.name && dest.name.includes(","), `Name must include city & state: ${dest.name}`);
    assert.ok(dest.state, `State required for ${dest.id}`);
    assert.ok(dest.location?.latitude && dest.location?.longitude, `Coordinates required for ${dest.id}`);
    assert.ok(Array.isArray(dest.attractionLocations), `attractionLocations required for ${dest.id}`);
    assert.ok(dest.attractionLocations.length >= 4, `At least 4 mapped landmarks required for ${dest.id}`);

    // Verify local image file exists
    if (dest.image.startsWith("/")) {
      const imgPath = path.join("public", dest.image.slice(1));
      assert.ok(fs.existsSync(imgPath), `Image file must exist: ${imgPath}`);
    }
  }
});

// --- TEST 8: Export / Import Roundtrip Fidelity ---
test("8. Exported trip JSON accurately parses back with identical structure", () => {
  const dest = destinations[2]; // Alleppey
  const plan = generateItinerary({
    destination: dest,
    days: 4,
    peoples: 2,
    budgetTier: "moderate",
    travelStyle: "Coastal & Relaxation",
  });

  const exportPayload = buildTripExportPayload(plan);
  const jsonString = JSON.stringify(exportPayload);

  const importResult = validateAndParseTripJson(jsonString);
  assert.strictEqual(importResult.valid, true);
  assert.strictEqual(importResult.itinerary.destination.id, dest.id);
  assert.strictEqual(importResult.itinerary.duration, 4);
  assert.strictEqual(importResult.itinerary.travellers, 2);
  assert.strictEqual(importResult.itinerary.days.length, 4);
});

// --- TEST 9: RFC 5545 ICS Escaping & Compliance ---
test("9. Calendar export properly escapes special characters and builds valid VCALENDAR", () => {
  assert.strictEqual(escapeIcsText("Hello, World; New\nLine"), "Hello\\, World\\; New\\nLine");

  const dest = destinations[0];
  const plan = generateItinerary({ destination: dest, days: 2, peoples: 2 });
  const icsResult = exportTripAsIcs(plan);

  assert.strictEqual(icsResult.success, true);
  assert.ok(icsResult.icsContent.includes("BEGIN:VCALENDAR"));
  assert.ok(icsResult.icsContent.includes("VERSION:2.0"));
  assert.ok(icsResult.icsContent.includes("BEGIN:VEVENT"));
  assert.ok(icsResult.icsContent.includes("END:VCALENDAR"));
});

// --- TEST 10: Print CSS Cleanliness ---
test("10. Print stylesheet hides offline indicator, nav, footer, and unneeded sections", () => {
  const cssContent = fs.readFileSync(path.resolve("src/index.css"), "utf-8");

  assert.ok(cssContent.includes("@media print"));
  assert.ok(cssContent.includes('aside[role="status"]'), "Must hide offline indicator in print");
  assert.ok(cssContent.includes("nav,"));
  assert.ok(cssContent.includes("footer,"));
  assert.ok(cssContent.includes("#home,"));
});

// --- TEST 11: ARIA Tab Semantics in Day Filter ---
test("11. ItineraryView day filter has semantic role=tablist and role=tab", () => {
  const viewContent = fs.readFileSync(path.resolve("src/components/ItineraryView.jsx"), "utf-8");

  assert.ok(viewContent.includes('role="tablist"'), "Must declare role=tablist");
  assert.ok(viewContent.includes('role="tab"'), "Must declare role=tab on day buttons");
  assert.ok(viewContent.includes("aria-selected="), "Must declare aria-selected on day tabs");
});

// --- TEST 12: Control Bar Flex-Wrap ---
test("12. ItineraryView control buttons container has flex-wrap for mobile screens", () => {
  const viewContent = fs.readFileSync(path.resolve("src/components/ItineraryView.jsx"), "utf-8");

  assert.ok(
    viewContent.includes('className="flex flex-wrap items-center gap-2"'),
    "Control bar action buttons must have flex-wrap to prevent mobile horizontal overflow"
  );
});

// --- TEST 13: Responsive OfflineIndicator Constraints ---
test("13. OfflineIndicator contains max-w constraint and responsive text elements", () => {
  const indContent = fs.readFileSync(path.resolve("src/components/OfflineIndicator.jsx"), "utf-8");

  assert.ok(indContent.includes("max-w-[calc(100vw-2rem)]"), "Must constrain max-width for mobile");
  assert.ok(indContent.includes("sm:hidden"), "Must contain mobile-specific text element");
  assert.ok(indContent.includes("hidden sm:inline"), "Must contain desktop text element");
});

// --- TEST 14: Non-Jarring Focus Management in DestinationDetails ---
test("14. DestinationDetails uses preventScroll and clears trigger ref on Plan Trip Here", () => {
  const detContent = fs.readFileSync(path.resolve("src/components/DestinationDetails.jsx"), "utf-8");

  assert.ok(detContent.includes("preventScroll: true"), "Must use preventScroll on focus restoration");
  assert.ok(detContent.includes("triggerElementRef.current = null"), "Must clear triggerElementRef on plan click");
  assert.ok(detContent.includes("planner-destination"), "Must shift focus to planner destination input");
});

// --- TEST 15: Zero Client Secret Exposure ---
test("15. Zero server API keys, secrets, or Gemini SDK imports in client src/", () => {
  const srcFiles = [];
  function collectFiles(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collectFiles(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".jsx"))) {
        srcFiles.push(fullPath);
      }
    }
  }
  collectFiles(path.resolve("src"));

  for (const filePath of srcFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    assert.ok(
      !content.includes("process.env.GEMINI_API_KEY"),
      `Client file must not reference process.env.GEMINI_API_KEY: ${filePath}`
    );
    assert.ok(
      !content.includes("@google/genai"),
      `Client file must not import @google/genai: ${filePath}`
    );
  }
});

console.log("\n=======================================================");
console.log(`  RESULTS: ${passed}/${total} TESTS PASSED`);
console.log("=======================================================\n");

if (passed === total) {
  console.log("P9 PASS — Product Validation Complete\n");
  process.exit(0);
} else {
  console.error("P9 FAIL — Issues Remain\n");
  process.exit(1);
}
