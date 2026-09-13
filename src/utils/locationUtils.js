/**
 * Location and Spatial Route Utilities for YatraSarathi
 *
 * Framework-independent spatial calculations, coordinate validation,
 * Haversine great-circle distance estimation, and itinerary route extraction.
 *
 * Strictly adheres to verified geographic data: never invents coordinates.
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Validates whether latitude and longitude are valid numeric geographic coordinates.
 *
 * @param {number} lat - Latitude in degrees (-90 to 90)
 * @param {number} lng - Longitude in degrees (-180 to 180)
 * @returns {boolean}
 */
export function isValidCoordinate(lat, lng) {
  if (typeof lat !== "number" || typeof lng !== "number") return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (!isFinite(lat) || !isFinite(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Checks whether a location object has valid coordinates and is map-ready.
 *
 * @param {object} location - Location object with latitude and longitude
 * @returns {boolean}
 */
export function isMapReady(location) {
  if (!location || typeof location !== "object") return false;
  return isValidCoordinate(location.latitude, location.longitude);
}

/**
 * Calculates geodesic (great-circle) distance in kilometers between two coordinates
 * using the Haversine formula.
 *
 * @param {{ latitude: number, longitude: number } | [number, number]} coord1
 * @param {{ latitude: number, longitude: number } | [number, number]} coord2
 * @returns {number|null} Approximate straight-line distance in km, rounded to 1 decimal place, or null if invalid
 */
export function calculateDistanceKm(coord1, coord2) {
  if (!coord1 || !coord2) return null;

  const lat1 = Array.isArray(coord1) ? coord1[0] : coord1.latitude;
  const lon1 = Array.isArray(coord1) ? coord1[1] : coord1.longitude;
  const lat2 = Array.isArray(coord2) ? coord2[0] : coord2.latitude;
  const lon2 = Array.isArray(coord2) ? coord2[1] : coord2.longitude;

  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    return null;
  }

  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Calculates cumulative approximate straight-line route distance across consecutive waypoints.
 *
 * @param {Array<{ latitude: number, longitude: number }>} waypoints
 * @returns {number|null} Cumulative distance in km, or null if fewer than 2 valid waypoints exist
 */
export function calculateRouteDistance(waypoints) {
  if (!Array.isArray(waypoints) || waypoints.length < 2) return null;

  const validPoints = waypoints.filter(isMapReady);
  if (validPoints.length < 2) return null;

  let totalDistance = 0;
  for (let i = 0; i < validPoints.length - 1; i++) {
    const dist = calculateDistanceKm(validPoints[i], validPoints[i + 1]);
    if (dist !== null) {
      totalDistance += dist;
    }
  }

  return Math.round(totalDistance * 10) / 10;
}

/**
 * Formats a distance in kilometers with a clear "approximate" designation.
 *
 * @param {number|null} distanceKm
 * @returns {string} e.g. "Approx. 12.4 km (straight-line)" or "Distance unavailable"
 */
export function formatApproximateDistance(distanceKm) {
  if (typeof distanceKm !== "number" || isNaN(distanceKm) || distanceKm < 0) {
    return "Distance unavailable";
  }
  return `Approx. ${distanceKm.toLocaleString("en-IN")} km`;
}

/**
 * Resolves an activity slot to authoritative landmark coordinates if verified.
 * Never invents coordinates for generic activities.
 *
 * @param {object} activity - Activity slot object (morning, afternoon, evening)
 * @param {object} destination - Authoritative destination object
 * @returns {{
 *   id?: string,
 *   name: string,
 *   label?: string,
 *   latitude?: number,
 *   longitude?: number,
 *   mapReady: boolean
 * }}
 */
export function resolveActivityLocation(activity, destination) {
  if (!activity) {
    return { name: "Unspecified Activity", mapReady: false };
  }

  const activityName = activity.location || activity.title || "";
  const actNameLower = activityName.toLowerCase().trim();

  // If destination has attractionLocations registry, search for verified match
  if (destination && Array.isArray(destination.attractionLocations)) {
    for (const attr of destination.attractionLocations) {
      const attrNameLower = attr.name.toLowerCase();
      const attrIdLower = (attr.id || "").toLowerCase();

      // Check for exact or substring matches between activity and landmark
      if (
        actNameLower.includes(attrNameLower) ||
        attrNameLower.includes(actNameLower) ||
        actNameLower.includes(attrIdLower)
      ) {
        if (isValidCoordinate(attr.latitude, attr.longitude)) {
          return {
            id: attr.id,
            name: attr.name,
            label: attr.label || attr.name,
            latitude: attr.latitude,
            longitude: attr.longitude,
            mapReady: true,
          };
        }
      }
    }
  }

  // Not matched to a specific verified landmark; do NOT invent coordinates
  return {
    name: activity.location || activity.title || "Local Exploration",
    mapReady: false,
  };
}

/**
 * Extracts and organizes a day's ordered route stops and calculates approximate route metrics.
 *
 * @param {object} dayPlan - Single day plan object { day, morning, afternoon, evening }
 * @param {object} destination - Authoritative destination object
 * @returns {object} Day route data object
 */
export function extractDayRoute(dayPlan, destination) {
  if (!dayPlan) {
    return {
      day: 1,
      theme: "",
      stops: [],
      validWaypoints: [],
      mapReadyCount: 0,
      totalStops: 0,
      approximateDistanceKm: null,
    };
  }

  const slots = [
    { key: "morning", label: "Morning", slotIndex: 1 },
    { key: "afternoon", label: "Afternoon", slotIndex: 2 },
    { key: "evening", label: "Evening", slotIndex: 3 },
  ];

  const stops = [];

  for (const slot of slots) {
    const act = dayPlan[slot.key];
    if (act) {
      const resolved = resolveActivityLocation(act, destination);
      stops.push({
        slotKey: slot.key,
        slotLabel: slot.label,
        slotIndex: slot.slotIndex,
        title: act.title || "",
        time: act.time || "",
        tag: act.tag || "",
        locationName: resolved.name,
        label: resolved.label || resolved.name,
        latitude: resolved.latitude || null,
        longitude: resolved.longitude || null,
        mapReady: resolved.mapReady,
      });
    }
  }

  const validWaypoints = stops.filter((s) => s.mapReady);
  const approximateDistanceKm = calculateRouteDistance(validWaypoints);

  return {
    day: dayPlan.day,
    theme: dayPlan.theme || `Day ${dayPlan.day}`,
    stops,
    validWaypoints,
    mapReadyCount: validWaypoints.length,
    totalStops: stops.length,
    approximateDistanceKm,
  };
}

/**
 * Extracts route intelligence across an entire multi-day itinerary.
 *
 * @param {Array<object>} days - Array of dayPlan objects
 * @param {object} destination - Authoritative destination object
 * @returns {object}
 */
export function extractTripRoute(days = [], destination) {
  if (!Array.isArray(days)) {
    return {
      dayRoutes: [],
      allValidWaypoints: [],
      totalApproximateDistanceKm: null,
      totalMapReadyStops: 0,
      totalStops: 0,
    };
  }

  const dayRoutes = days.map((d) => extractDayRoute(d, destination));
  const allValidWaypoints = [];
  let totalStops = 0;
  let totalDistance = 0;
  let hasValidDistance = false;

  for (const dr of dayRoutes) {
    totalStops += dr.totalStops;
    for (const wp of dr.validWaypoints) {
      allValidWaypoints.push(wp);
    }
    if (typeof dr.approximateDistanceKm === "number") {
      totalDistance += dr.approximateDistanceKm;
      hasValidDistance = true;
    }
  }

  return {
    dayRoutes,
    allValidWaypoints,
    totalApproximateDistanceKm: hasValidDistance
      ? Math.round(totalDistance * 10) / 10
      : null,
    totalMapReadyStops: allValidWaypoints.length,
    totalStops,
  };
}
