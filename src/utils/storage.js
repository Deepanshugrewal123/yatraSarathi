/**
 * Client-Side Persistence Layer for YatraSarathi
 *
 * Manages saved itineraries and favorite destinations in localStorage.
 * Uses namespaced, versioned storage keys with robust error handling
 * (safe against quota limits, private browsing, and malformed JSON).
 *
 * Strictly client-side. Never communicates with external servers or cloud databases.
 */

const TRIPS_STORAGE_KEY = "yatrasarathi_saved_trips";
const FAVORITES_STORAGE_KEY = "yatrasarathi_favorites";
const STORAGE_VERSION = 1;

/**
 * Safe localStorage reader with error handling.
 */
function safeGetItem(key) {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  try {
    return window.localStorage.getItem(key);
  } catch (err) {
    console.warn(`[YatraSarathi Storage] Failed to read key "${key}":`, err.message);
    return null;
  }
}

/**
 * Safe localStorage writer with error handling and quota protection.
 */
function safeSetItem(key, value) {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`[YatraSarathi Storage] Failed to write key "${key}":`, err.message);
    return false;
  }
}

// ==========================================
// SAVED TRIPS OPERATIONS
// ==========================================

/**
 * Retrieves all saved trips from localStorage.
 * Validates record structures and safely skips corrupted entries.
 *
 * @returns {Array<object>} Array of saved trip objects
 */
export function getSavedTrips() {
  const raw = safeGetItem(TRIPS_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return [];

    const trips = Array.isArray(parsed.trips) ? parsed.trips : [];

    // Filter and sanitize valid trips
    return trips.filter((trip) => {
      return (
        trip &&
        typeof trip === "object" &&
        typeof trip.id === "string" &&
        trip.destination &&
        typeof trip.destination.id === "string" &&
        Array.isArray(trip.days) &&
        trip.days.length > 0 &&
        trip.pricing
      );
    });
  } catch (err) {
    console.warn("[YatraSarathi Storage] Corrupted saved trips data encountered:", err.message);
    return [];
  }
}

/**
 * Saves a generated itinerary to localStorage.
 * Prevents accidental duplicate saves of the same trip.
 *
 * @param {object} itinerary - Full itinerary object from planner
 * @returns {{ success: boolean, trip?: object, isDuplicate?: boolean, error?: string }}
 */
export function saveTrip(itinerary) {
  if (!itinerary || !itinerary.destination || !itinerary.destination.id) {
    return { success: false, error: "Invalid itinerary object." };
  }

  const currentTrips = getSavedTrips();
  const planMode = itinerary.mode || "deterministic";

  // Check for duplicate save: match destination, duration, travellers, budgetTier, travelStyle, mode
  const existingTrip = currentTrips.find((t) => {
    const tMode = t.mode || "deterministic";
    return (
      t.destination.id === itinerary.destination.id &&
      t.duration === itinerary.duration &&
      t.travellers === itinerary.travellers &&
      t.budgetTier === itinerary.budgetTier &&
      t.travelStyle === itinerary.travelStyle &&
      tMode === planMode
    );
  });

  if (existingTrip) {
    return {
      success: true,
      trip: existingTrip,
      isDuplicate: true,
    };
  }

  const newTrip = {
    id: itinerary.id || `trip-${itinerary.destination.id}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    destination: itinerary.destination,
    duration: itinerary.duration,
    travellers: itinerary.travellers,
    budgetTier: itinerary.budgetTier,
    travelStyle: itinerary.travelStyle,
    interests: Array.isArray(itinerary.interests) ? itinerary.interests : [],
    mode: itinerary.mode || "deterministic",
    summary: itinerary.summary || null,
    personalizationNotes: Array.isArray(itinerary.personalizationNotes)
      ? itinerary.personalizationNotes
      : [],
    pricing: itinerary.pricing,
    days: itinerary.days,
  };

  const updatedTrips = [newTrip, ...currentTrips];

  const payload = JSON.stringify({
    version: STORAGE_VERSION,
    trips: updatedTrips,
  });

  const written = safeSetItem(TRIPS_STORAGE_KEY, payload);
  if (!written) {
    return { success: false, error: "Storage quota exceeded or storage unavailable." };
  }

  return { success: true, trip: newTrip, isDuplicate: false };
}

/**
 * Deletes a saved trip by its unique ID.
 *
 * @param {string} tripId - ID of the trip to delete
 * @returns {boolean} True if deletion succeeded
 */
export function deleteTrip(tripId) {
  if (!tripId) return false;

  const currentTrips = getSavedTrips();
  const filtered = currentTrips.filter((t) => t.id !== tripId);

  const payload = JSON.stringify({
    version: STORAGE_VERSION,
    trips: filtered,
  });

  return safeSetItem(TRIPS_STORAGE_KEY, payload);
}

/**
 * Checks if a specific itinerary is already saved.
 */
export function isTripSaved(itinerary) {
  if (!itinerary || !itinerary.destination) return false;
  const currentTrips = getSavedTrips();
  const planMode = itinerary.mode || "deterministic";

  return currentTrips.some((t) => {
    const tMode = t.mode || "deterministic";
    return (
      t.id === itinerary.id ||
      (t.destination.id === itinerary.destination.id &&
        t.duration === itinerary.duration &&
        t.travellers === itinerary.travellers &&
        t.budgetTier === itinerary.budgetTier &&
        t.travelStyle === itinerary.travelStyle &&
        tMode === planMode)
    );
  });
}

// ==========================================
// FAVORITE DESTINATIONS OPERATIONS
// ==========================================

/**
 * Retrieves all favorited destination IDs from localStorage.
 *
 * @returns {Array<string>} Array of destination IDs
 */
export function getFavorites() {
  const raw = safeGetItem(FAVORITES_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return [];

    const favs = Array.isArray(parsed.favorites) ? parsed.favorites : [];
    // Ensure all items are strings
    return favs.filter((id) => typeof id === "string");
  } catch (err) {
    console.warn("[YatraSarathi Storage] Corrupted favorites data encountered:", err.message);
    return [];
  }
}

/**
 * Checks if a destination ID is currently in favorites.
 *
 * @param {string} destinationId - Destination ID
 * @returns {boolean}
 */
export function isFavorite(destinationId) {
  if (!destinationId || typeof destinationId !== "string") return false;
  const currentFavs = getFavorites();
  return currentFavs.includes(destinationId);
}

/**
 * Toggles favorite state for a destination ID.
 *
 * @param {string} destinationId - Destination ID
 * @returns {{ isFav: boolean, favorites: Array<string> }}
 */
export function toggleFavorite(destinationId) {
  if (!destinationId || typeof destinationId !== "string") {
    return { isFav: false, favorites: getFavorites() };
  }

  const currentFavs = getFavorites();
  let updatedFavs;
  let isFav;

  if (currentFavs.includes(destinationId)) {
    updatedFavs = currentFavs.filter((id) => id !== destinationId);
    isFav = false;
  } else {
    updatedFavs = [...currentFavs, destinationId];
    isFav = true;
  }

  const payload = JSON.stringify({
    version: STORAGE_VERSION,
    favorites: updatedFavs,
  });

  safeSetItem(FAVORITES_STORAGE_KEY, payload);
  return { isFav, favorites: updatedFavs };
}
