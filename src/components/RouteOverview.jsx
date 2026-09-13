import { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Navigation,
  Compass,
  Info,
  Layers,
  MapPinOff,
  ChevronRight,
  ExternalLink,
  WifiOff,
} from "lucide-react";
import {
  extractDayRoute,
  extractTripRoute,
  formatApproximateDistance,
} from "../utils/locationUtils";
import { getDestinationById } from "../data/destinations";

export default function RouteOverview({
  itinerary,
  activeDayTab = "all",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [viewMode, setViewMode] = useState("map"); // "map" | "timeline"
  const [isOnline, setIsOnline] = useState(() => {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Ensure we have the authoritative destination with spatial coordinates
  // (Provides instant backwards compatibility for P4 legacy saved trips)
  const resolvedDestination = useMemo(() => {
    if (!itinerary || !itinerary.destination) return null;
    const dest = itinerary.destination;
    if (dest.location && Array.isArray(dest.attractionLocations)) {
      return dest;
    }
    // Lookup from centralized registry
    const registered = getDestinationById(dest.id);
    return registered || dest;
  }, [itinerary]);

  // Compute route data based on active day tab
  const activeRouteData = useMemo(() => {
    if (!itinerary || !resolvedDestination) return null;

    const days = itinerary.days || [];
    if (days.length === 0) return null;

    if (activeDayTab === "all") {
      return extractTripRoute(days, resolvedDestination);
    }

    const dayNumber = Number(activeDayTab);
    const dayPlan = days.find((d) => d.day === dayNumber) || days[0];
    return extractDayRoute(dayPlan, resolvedDestination);
  }, [itinerary, resolvedDestination, activeDayTab]);

  // Extract stops and valid waypoints for the current view
  const { displayStops, validWaypoints, approximateDistanceKm, isAllDays } =
    useMemo(() => {
      if (!activeRouteData) {
        return {
          displayStops: [],
          validWaypoints: [],
          approximateDistanceKm: null,
          isAllDays: false,
        };
      }

      if (activeDayTab === "all" && activeRouteData.dayRoutes) {
        // Flatten all day stops
        const allStops = [];
        for (const dr of activeRouteData.dayRoutes) {
          for (const s of dr.stops) {
            allStops.push({ ...s, dayNumber: dr.day });
          }
        }
        return {
          displayStops: allStops,
          validWaypoints: activeRouteData.allValidWaypoints || [],
          approximateDistanceKm: activeRouteData.totalApproximateDistanceKm,
          isAllDays: true,
        };
      }

      return {
        displayStops: activeRouteData.stops || [],
        validWaypoints: activeRouteData.validWaypoints || [],
        approximateDistanceKm: activeRouteData.approximateDistanceKm,
        isAllDays: false,
      };
    }, [activeRouteData, activeDayTab]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    // Only initialize in browser environment and if container is present
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    // Clean up existing map instance before creating a new one
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // If there are no valid coordinates, don't initialize a broken map
    if (validWaypoints.length === 0) return;

    try {
      // Create fresh map instance
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false, // Prevent page scroll interception
        attributionControl: true,
      });
      mapInstanceRef.current = map;

      // Add OpenStreetMap tile layer (Free, no API key required)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      const latLngPoints = [];

      // Create custom styled marker for each valid waypoint
      validWaypoints.forEach((wp, index) => {
        const latLng = [wp.latitude, wp.longitude];
        latLngPoints.push(latLng);

        // Styling based on slot
        const pinNumber = wp.slotIndex || index + 1;
        const colorClass =
          wp.slotKey === "morning"
            ? "bg-amber-500"
            : wp.slotKey === "afternoon"
            ? "bg-blue-600"
            : "bg-emerald-600";

        // Accessible, retina-crisp divIcon without external PNG asset dependencies
        const customIcon = L.divIcon({
          className: "custom-map-marker",
          html: `
            <div class="relative flex items-center justify-center">
              <div class="w-8 h-8 rounded-full ${colorClass} text-white font-extrabold text-xs flex items-center justify-center shadow-lg ring-2 ring-white cursor-pointer transform hover:scale-110 transition-transform">
                ${pinNumber}
              </div>
              <div class="absolute -bottom-1 w-2 h-2 ${colorClass} rotate-45"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 2px;">
            <div style="font-weight: 800; font-size: 13px; color: #111827; margin-bottom: 2px;">
              ${wp.label || wp.locationName}
            </div>
            <div style="color: #4b5563; margin-bottom: 4px;">
              ${wp.title}
            </div>
            ${
              wp.time
                ? `<div style="display: inline-block; padding: 1px 6px; border-radius: 9999px; background: #f3f4f6; color: #374151; font-weight: 600; font-size: 11px;">
                    ${wp.time}
                  </div>`
                : ""
            }
          </div>
        `;

        L.marker(latLng, { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent);
      });

      // Draw dashed connecting path between consecutive waypoints
      if (latLngPoints.length >= 2) {
        L.polyline(latLngPoints, {
          color: "#ea580c", // Orange-600
          weight: 3,
          opacity: 0.8,
          dashArray: "6, 8",
          lineCap: "round",
        }).addTo(map);
      }

      // Adjust camera bounds to enclose all markers with breathing room
      if (latLngPoints.length === 1) {
        map.setView(latLngPoints[0], 13);
      } else if (latLngPoints.length > 1) {
        const bounds = L.latLngBounds(latLngPoints);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }

      // Fix any leaflet container size calculation issues
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);
    } catch (err) {
      console.warn("[RouteOverview] Leaflet initialization error:", err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [validWaypoints, activeDayTab, viewMode]);

  if (!itinerary) return null;

  const cityName = resolvedDestination?.name || "Destination";
  const hasCoordinates = validWaypoints.length > 0;

  return (
    <section
      id="route-overview"
      aria-label={`Route Overview and Map for ${cityName}`}
      className="mb-10 rounded-3xl bg-white border border-gray-200 p-6 sm:p-8 shadow-sm print:border-none print:shadow-none"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-orange-100 text-orange-700">
              <Navigation className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
              Spatial Route Intelligence
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
            Route Overview:{" "}
            {isAllDays
              ? `All Sights in ${cityName}`
              : `Day ${activeDayTab} Sequence`}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Geographic sequence of planned sights and activities grounded on verified local coordinates.
          </p>
        </div>

        {/* View Toggle (Map vs Timeline) */}
        {hasCoordinates && (
          <div className="inline-flex items-center p-1 rounded-xl bg-gray-100 border border-gray-200 text-xs font-bold self-start sm:self-auto print:hidden">
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "map"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Interactive Map</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "timeline"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Route Sequence</span>
            </button>
          </div>
        )}
      </div>

      {/* Approximate Route Distance Badge & Disclaimers */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">
              Approx. Straight-Line Distance
            </div>
            <div className="text-base font-extrabold text-gray-900 flex items-center gap-1.5">
              <span>{formatApproximateDistance(approximateDistanceKm)}</span>
              {typeof approximateDistanceKm === "number" && (
                <span className="text-[11px] font-normal text-gray-500">
                  (straight-line geodesic)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 max-w-md">
          <span className="font-semibold text-gray-700 block mb-0.5">
            Spatial Accuracy Note:
          </span>
          {typeof approximateDistanceKm === "number" ? (
            <p className="leading-relaxed text-[11px]">
              Calculated straight-line between {validWaypoints.length} verified
              landmarks. Does not account for road traffic, winding terrain, or
              transit detours.
            </p>
          ) : validWaypoints.length === 1 ? (
            <p className="leading-relaxed text-[11px]">
              Only 1 landmark mapped for this period. At least 2 mapped points
              are required to calculate sequential distance.
            </p>
          ) : (
            <p className="leading-relaxed text-[11px]">
              Geographic coordinates are not available for these activities.
            </p>
          )}
        </div>
      </div>

      {/* Map Display / Graceful Fallback Container */}
      {hasCoordinates ? (
        <div className="space-y-6">
          {!isOnline && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-xl bg-amber-200/70 text-amber-800 shrink-0">
                  <WifiOff className="w-4 h-4" />
                </span>
                <p className="leading-relaxed font-medium">
                  <strong>Offline Notice:</strong> Map tiles require an active internet connection. Your route timeline and verified location sequence remain available offline.
                </p>
              </div>
              {viewMode !== "timeline" && (
                <button
                  type="button"
                  onClick={() => setViewMode("timeline")}
                  className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold shrink-0 text-xs transition cursor-pointer self-start sm:self-auto"
                >
                  View Route Sequence
                </button>
              )}
            </div>
          )}

          {/* Leaflet Map View */}
          <div
            className={`relative rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-slate-100 ${
              viewMode === "map" ? "block" : "hidden"
            } print:hidden`}
          >
            <div
              ref={mapContainerRef}
              className="h-72 sm:h-96 w-full z-0"
              style={{ minHeight: "280px" }}
            />
            {/* Map corner badge */}
            <div className="absolute top-3 right-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-gray-700 shadow-xs border border-gray-200 pointer-events-none">
              OpenStreetMap • {validWaypoints.length} Mapped Stop(s)
            </div>
          </div>

          {/* Sequential Route Timeline Cards */}
          <div
            className={`${
              viewMode === "timeline" ? "block" : "block"
            } print:block`}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-1.5">
              <span>Day Sights Sequence</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayStops.map((stop, index) => {
                const isMapped = stop.mapReady;
                const slotColor =
                  stop.slotKey === "morning"
                    ? "border-l-amber-500 bg-amber-50/40"
                    : stop.slotKey === "afternoon"
                    ? "border-l-blue-500 bg-blue-50/40"
                    : "border-l-emerald-500 bg-emerald-50/40";

                return (
                  <div
                    key={`${stop.slotKey}-${index}`}
                    className={`p-3.5 rounded-2xl border border-gray-200 border-l-4 ${slotColor} flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-wide text-gray-600">
                          {stop.dayNumber ? `Day ${stop.dayNumber} • ` : ""}
                          {stop.slotLabel}
                        </span>
                        {isMapped ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>Mapped</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium">
                            <span>Unmapped Area</span>
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-gray-900 text-sm leading-snug mb-1">
                        {stop.label || stop.locationName}
                      </div>

                      <div className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {stop.title}
                      </div>
                    </div>

                    {/* Coordinates & External Link if mapped */}
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      {isMapped ? (
                        <>
                          <span className="text-gray-400 font-mono text-[10px]">
                            {stop.latitude?.toFixed(3)}°N, {stop.longitude?.toFixed(3)}°E
                          </span>
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${stop.latitude}&mlon=${stop.longitude}#map=15/${stop.latitude}/${stop.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                          >
                            <span>OSM</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </>
                      ) : (
                        <span className="text-gray-400 text-[10px] italic">
                          Regional exploration / dining
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Graceful Fallback Banner when no coordinates exist */
        <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
            <MapPinOff className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-amber-900 mb-1">
            Route Preview Unavailable
          </h4>
          <p className="text-xs text-amber-800 leading-relaxed">
            Location coordinates are not available for this legacy saved trip or
            custom activity set. All schedule activities and timing details
            remain fully visible in the day-by-day plan below.
          </p>
        </div>
      )}

      {/* Explanatory Footer Info */}
      <div className="mt-6 flex items-start gap-2 text-xs text-gray-500 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
        <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Open Tourism Data:</strong> Map data &copy; OpenStreetMap
          contributors. Geographic sequences and straight-line calculations are
          provided as spatial guidance. Real travel times will depend on local
          terrain, road conditions, and preferred modes of transit.
        </p>
      </div>
    </section>
  );
}
