import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Compass,
  Sparkles,
  CheckCircle2,
  Leaf,
  Sun,
  ArrowRight,
  Heart
} from "lucide-react";

export default function DestinationDetails({
  destination,
  onClose,
  onPlanTrip,
  isFavorite = false,
  onToggleFavorite,
}) {
  const closeBtnRef = useRef(null);
  const triggerElementRef = useRef(null);

  useEffect(() => {
    if (!destination) return;

    // Capture triggering element for focus restoration
    triggerElementRef.current = document.activeElement;

    // Focus close button on open
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Escape listener
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      // Restore focus to the trigger element if still in DOM
      if (
        triggerElementRef.current &&
        typeof triggerElementRef.current.focus === "function" &&
        document.body.contains(triggerElementRef.current)
      ) {
        triggerElementRef.current.focus({ preventScroll: true });
      }
    };
  }, [destination, onClose]);

  if (!destination) return null;

  const {
    name,
    state,
    category,
    badge = "Featured",
    priceDisplay,
    days,
    peoples,
    image,
    tags = [],
    description,
    bestSeason,
    travelStyle,
    attractions = [],
    highlights = [],
    culture
  } = destination;

  const isHiddenGem = category === "hidden-gem";

  const handlePlanClick = () => {
    // Prevent unmount cleanup from refocusing the card at page bottom
    triggerElementRef.current = null;

    if (onPlanTrip) {
      onPlanTrip(destination);
    }
    onClose();
    const plannerEl = document.getElementById("planner");
    if (plannerEl) {
      plannerEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => {
      const destSelect = document.getElementById("planner-destination");
      if (destSelect) {
        destSelect.focus({ preventScroll: true });
      }
    }, 150);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          aria-hidden="true"
        />

        {/* Modal Dialog */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="destination-modal-title"
          aria-describedby="destination-modal-desc"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 z-10 my-auto"
        >
          {/* Header image banner */}
          <div className="relative h-64 sm:h-72 w-full flex-shrink-0 bg-gray-900">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Actions: Favorite & Close */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {onToggleFavorite && (
                <button
                  type="button"
                  aria-label={isFavorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
                  aria-pressed={isFavorite}
                  onClick={() => onToggleFavorite(destination.id)}
                  className={`p-2.5 rounded-full transition-all duration-200 cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                    isFavorite
                      ? "bg-white text-rose-600 scale-105"
                      : "bg-black/50 hover:bg-black/80 text-white backdrop-blur-md"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${isFavorite ? "fill-rose-500 text-rose-500" : "text-white"}`}
                  />
                </button>
              )}

              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label="Close destination details"
                className="p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Badges on image */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-semibold text-gray-900 shadow-sm">
                {isHiddenGem ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Hidden Gem</span>
                  </>
                ) : (
                  <>
                    <span className="text-orange-500">✨</span>
                    <span>{badge}</span>
                  </>
                )}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-medium text-white">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>{state}</span>
              </span>
            </div>

            {/* Title & subtitle on image */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h2
                id="destination-modal-title"
                className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-md mb-1"
              >
                {name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-200 font-medium">
                <span className="flex items-center gap-1">
                  <Sun className="w-4 h-4 text-amber-300" />
                  Best: {bestSeason}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Compass className="w-4 h-4 text-sky-300" />
                  {travelStyle}
                </span>
              </div>
            </div>
          </div>

          {/* Scrollable Modal Body */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col">
                <span className="text-xs text-blue-700 font-medium flex items-center gap-1 mb-1">
                  <IndianRupee className="w-3.5 h-3.5" /> Est. Budget
                </span>
                <span className="text-lg font-bold text-gray-900">₹{priceDisplay}+</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-100 flex flex-col">
                <span className="text-xs text-orange-700 font-medium flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5" /> Duration
                </span>
                <span className="text-lg font-bold text-gray-900">{days} Days</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col">
                <span className="text-xs text-emerald-700 font-medium flex items-center gap-1 mb-1">
                  <Users className="w-3.5 h-3.5" /> Group Size
                </span>
                <span className="text-lg font-bold text-gray-900">{peoples} Travelers</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col">
                <span className="text-xs text-indigo-700 font-medium flex items-center gap-1 mb-1">
                  <Sun className="w-3.5 h-3.5" /> Season
                </span>
                <span className="text-xs font-bold text-gray-900 leading-tight line-clamp-2">
                  {bestSeason}
                </span>
              </div>
            </div>

            {/* Overview text */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Overview
              </h3>
              <p
                id="destination-modal-desc"
                className="text-gray-700 text-sm sm:text-base leading-relaxed"
              >
                {description}
              </p>
            </div>

            {/* Top Attractions */}
            {attractions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Top Attractions & Sightseeing
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {attractions.map((place, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-800 text-sm font-medium"
                    >
                      <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span>{place}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Trip Highlights & Experiences
                </h3>
                <ul className="space-y-2">
                  {highlights.map((highlight, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-gray-700 text-sm leading-normal"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Culture & Sustainability note */}
            {culture && (
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3">
                <Leaf className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">
                    Cultural Insight & Responsible Travel
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {culture}
                  </p>
                </div>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Tags & Activities
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer actions */}
          <div className="p-4 sm:px-8 sm:py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close
              </button>

              {onToggleFavorite && (
                <button
                  type="button"
                  aria-pressed={isFavorite}
                  onClick={() => onToggleFavorite(destination.id)}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-sm font-semibold transition-colors cursor-pointer ${
                    isFavorite
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-500"}`} />
                  <span>{isFavorite ? "Saved to Favorites" : "Add to Favorites"}</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handlePlanClick}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-green-600 text-white font-semibold text-sm shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <span>Plan Trip Here</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
