import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Compass,
  Sparkles,
  Sunrise,
  Sun,
  Sunset,
  Leaf,
  Printer,
  RefreshCw,
  Edit3,
  CheckCircle2,
  X,
  Share2,
  Check,
  Info,
  Bookmark,
  Download,
  FileText,
  CalendarDays,
} from "lucide-react";
import { formatINR } from "../utils/itineraryGenerator";
import { exportTripAsJson, exportTripAsIcs } from "../utils/tripExport";
import { shareTrip } from "../utils/tripShare";

const RouteOverview = lazy(() => import("./RouteOverview"));

function RouteLoadingSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-10 rounded-3xl bg-white border border-gray-200 p-8 shadow-sm flex flex-col items-center justify-center min-h-[360px] text-center"
    >
      <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
      <h4 className="text-sm font-bold text-gray-800">
        Loading Route Intelligence & Map...
      </h4>
      <p className="text-xs text-gray-500 mt-1 max-w-sm">
        Preparing geographic landmarks and interactive waypoint visualization.
      </p>
    </div>
  );
}

export default function ItineraryView({
  itinerary,
  onEdit,
  onRegenerate,
  onClose,
  onSaveTrip,
  isSaved = false,
}) {
  const [copied, setCopied] = useState(false);
  const [activeDayTab, setActiveDayTab] = useState("all");
  const [saveFeedback, setSaveFeedback] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const exportTriggerRef = useRef(null);

  useEffect(() => {
    if (!showExportModal) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowExportModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (exportTriggerRef.current && typeof exportTriggerRef.current.focus === "function") {
        exportTriggerRef.current.focus();
      }
    };
  }, [showExportModal]);

  const handleSaveClick = () => {
    if (onSaveTrip) {
      const res = onSaveTrip(itinerary);
      if (res && res.isDuplicate) {
        setSaveFeedback("Trip is already in My Trips.");
      } else {
        setSaveFeedback("Trip saved to My Trips!");
      }
      setTimeout(() => setSaveFeedback(null), 3000);
    }
  };

  const handleDownloadJson = () => {
    exportTripAsJson(itinerary);
    setShowExportModal(false);
    setSaveFeedback("JSON trip plan downloaded!");
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const handleDownloadIcs = () => {
    exportTripAsIcs(itinerary);
    setShowExportModal(false);
    setSaveFeedback("Calendar (.ics) file exported!");
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  if (!itinerary) return null;

  const {
    destination,
    duration,
    travellers,
    budgetTier,
    travelStyle,
    interests = [],
    pricing,
    days = [],
    mode = "deterministic",
    personalizationNotes = [],
    notice = null,
  } = itinerary;

  const isAI = mode === "ai";

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const res = await shareTrip(itinerary);
    if (res.shared && res.method === "clipboard") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const displayedDays =
    activeDayTab === "all"
      ? days
      : days.filter((d) => d.day === Number(activeDayTab));

  return (
    <section
      id="itinerary-results"
      aria-label="Generated Travel Itinerary"
      className="py-12 md:py-16 bg-gradient-to-b from-slate-50 via-white to-slate-100 border-t border-b border-gray-200"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            {isAI ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                Personalized Plan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Curated Regional Plan
              </span>
            )}
            <span className="text-xs text-gray-500 font-medium hidden sm:inline">
              {isAI
                ? "Tailored to your travel style and verified destination highlights"
                : "Curated day-by-day plan based on verified local highlights"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onSaveTrip && (
              <button
                type="button"
                onClick={handleSaveClick}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer border ${
                  isSaved
                    ? "bg-amber-50 border-amber-300 text-amber-800"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
                aria-label={isSaved ? "Trip is saved in My Trips" : "Save trip to My Trips"}
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${
                    isSaved ? "fill-amber-500 text-amber-500" : "text-gray-600"
                  }`}
                />
                <span>{isSaved ? "Saved" : "Save Trip"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onEdit && onEdit(itinerary)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold shadow-xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-orange-500" />
              <span>Edit Preferences</span>
            </button>

            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold shadow-xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
              <span>Regenerate Plan</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold shadow-xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Summary Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-gray-600" />
                  <span>Share Plan</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                exportTriggerRef.current = e.currentTarget;
                setShowExportModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold shadow-xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-sm hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Plan</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close itinerary"
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Save Feedback Banner */}
        <AnimatePresence>
          {saveFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveFeedback}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fallback / Informational Notice */}
        {notice && (
          <div className="mb-6 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2 shadow-xs">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Hero Itinerary Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-900 text-white mb-8 border border-gray-800"
        >
          <div className="absolute inset-0 z-0">
            <img
              src={destination.image}
              alt={destination.name}
              className="w-full h-full object-cover opacity-35 filter brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  {destination.state}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/80 backdrop-blur-md text-xs font-semibold text-white">
                  <Sparkles className="w-3.5 h-3.5" />
                  {budgetTier.toUpperCase()} TIER
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-xs font-semibold text-white">
                  <Compass className="w-3.5 h-3.5" />
                  {travelStyle} Style
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
                {destination.name}
              </h2>

              <p className="text-sm sm:text-base text-gray-200 line-clamp-2 leading-relaxed font-light">
                {itinerary.summary || destination.description}
              </p>

              {interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/40 text-gray-300 border border-white/10 backdrop-blur-xs"
                    >
                      #{interest}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick stats badge */}
            <div className="flex-shrink-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:items-end text-left sm:text-right">
              <span className="text-[11px] uppercase tracking-wider text-gray-300 font-bold">
                Estimated Trip Budget
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-0.5 sm:justify-end mt-0.5">
                <IndianRupee className="w-6 h-6 text-emerald-400" />
                {formatINR(pricing.total)}
              </span>
              <span className="text-xs text-emerald-300 font-medium mt-1">
                ≈ ₹{formatINR(pricing.perPerson)} per person
              </span>
              <span className="text-[10px] text-gray-400 mt-1 max-w-[200px] sm:text-right block">
                Indicative estimate based on baseline local rates.
              </span>
              <div className="flex items-center gap-3 text-xs text-gray-300 mt-3 pt-3 border-t border-white/10">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-orange-400" />
                  {duration} Days
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  {travellers} {travellers === 1 ? "Traveler" : "Travelers"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Personalization Insights Box */}
        {isAI && personalizationNotes.length > 0 && (
          <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-amber-50/80 border border-indigo-100 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950">
                Personalization Highlights
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-indigo-900 leading-relaxed font-medium">
              {personalizationNotes.map((note, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 bg-white/80 p-3 rounded-2xl border border-indigo-100/60 shadow-xs"
                >
                  <span className="text-indigo-600 font-bold text-sm leading-none mt-0.5">✓</span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transparent Budget Breakdown Card */}
        <div className="mb-10 rounded-3xl bg-white border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
                Estimated Trip Budget Breakdown
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Estimated from verified local pricing benchmarks for {travellers}{" "}
                traveler(s) over {duration} days. Indicative estimate only.
              </p>
            </div>
            <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {budgetTier.toUpperCase()} PRICING
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Stay */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 flex flex-col">
              <div className="flex justify-between items-center text-xs font-semibold text-amber-900 mb-1">
                <span>Accommodation</span>
                <span>40%</span>
              </div>
              <span className="text-xl font-extrabold text-gray-900 mt-auto">
                ₹{formatINR(pricing.breakdown.accommodation)}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5">
                Hotels, resorts or homestays
              </span>
            </div>

            {/* Transport */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col">
              <div className="flex justify-between items-center text-xs font-semibold text-blue-900 mb-1">
                <span>Local Transport</span>
                <span>25%</span>
              </div>
              <span className="text-xl font-extrabold text-gray-900 mt-auto">
                ₹{formatINR(pricing.breakdown.transport)}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5">
                Cabs, autos, rentals & ferries
              </span>
            </div>

            {/* Food */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col">
              <div className="flex justify-between items-center text-xs font-semibold text-emerald-900 mb-1">
                <span>Food & Dining</span>
                <span>20%</span>
              </div>
              <span className="text-xl font-extrabold text-gray-900 mt-auto">
                ₹{formatINR(pricing.breakdown.food)}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5">
                Local cafes, regional thalis & snacks
              </span>
            </div>

            {/* Activities */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex flex-col">
              <div className="flex justify-between items-center text-xs font-semibold text-purple-900 mb-1">
                <span>Sights & Activities</span>
                <span>15%</span>
              </div>
              <span className="text-xl font-extrabold text-gray-900 mt-auto">
                ₹{formatINR(pricing.breakdown.activities)}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5">
                Monuments, boat rides & permits
              </span>
            </div>
          </div>

          {/* Visual Percentage Progress Bar */}
          <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden flex shadow-inner mb-4">
            <div
              style={{ width: "40%" }}
              className="bg-amber-500 h-full"
              title="Accommodation 40%"
            />
            <div
              style={{ width: "25%" }}
              className="bg-blue-500 h-full"
              title="Transport 25%"
            />
            <div
              style={{ width: "20%" }}
              className="bg-emerald-500 h-full"
              title="Dining 20%"
            />
            <div
              style={{ width: "15%" }}
              className="bg-purple-500 h-full"
              title="Activities 15%"
            />
          </div>

          {/* Transparent pricing note */}
          <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Estimated Trip Budget Note:</strong> All figures are estimated from verified local tourism pricing benchmarks for {destination.name}. Actual expenses may vary depending on season, accommodation availability, and individual preferences.
            </p>
          </div>
        </div>

        {/* Day Filter Tabs */}
        {days.length > 1 && (
          <div
            role="tablist"
            aria-label="Filter itinerary by day"
            className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 print:hidden"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeDayTab === "all"}
              onClick={() => setActiveDayTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeDayTab === "all"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              All Days ({days.length})
            </button>
            {days.map((d) => (
              <button
                key={d.day}
                type="button"
                role="tab"
                aria-selected={activeDayTab === String(d.day)}
                onClick={() => setActiveDayTab(String(d.day))}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeDayTab === String(d.day)
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Day {d.day}
              </button>
            ))}
          </div>
        )}

        {/* Spatial Route Overview & Map */}
        <Suspense fallback={<RouteLoadingSkeleton />}>
          <RouteOverview
            itinerary={itinerary}
            activeDayTab={activeDayTab}
          />
        </Suspense>

        {/* Day-by-Day Timeline Cards */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {displayedDays.map((dayPlan) => (
              <motion.div
                key={dayPlan.day}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="rounded-3xl bg-white border border-gray-200 p-6 sm:p-8 shadow-sm"
              >
                {/* Day Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-gray-100 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-extrabold text-sm shadow-sm">
                      D{dayPlan.day}
                    </span>
                    <div>
                      <h4 className="text-lg sm:text-xl font-extrabold text-gray-900">
                        {dayPlan.theme}
                      </h4>
                      <span className="text-xs text-gray-500">
                        Structured 3-slot daily schedule
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Day {dayPlan.day} of {duration}
                  </span>
                </div>

                {/* 3 Activity Slots: Morning, Afternoon, Evening */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                  {/* Morning */}
                  <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100/80 flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                        <Sunrise className="w-3.5 h-3.5 text-amber-600" />
                        Morning
                      </span>
                      <span className="text-[11px] font-medium text-gray-500">
                        {dayPlan.morning.time}
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-gray-900 mb-2">
                      {dayPlan.morning.title}
                    </h5>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4 flex-grow">
                      {dayPlan.morning.description}
                    </p>
                    <div className="pt-3 border-t border-amber-200/50 flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-gray-700 font-medium">
                        <MapPin className="w-3 h-3 text-orange-500 flex-shrink-0" />
                        <span className="truncate max-w-[140px]">
                          {dayPlan.morning.location}
                        </span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white text-gray-600 font-medium border border-amber-200">
                        {dayPlan.morning.tag}
                      </span>
                    </div>
                  </div>

                  {/* Afternoon */}
                  <div className="p-5 rounded-2xl bg-sky-50/50 border border-sky-100/80 flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-100 text-sky-900 text-xs font-bold">
                        <Sun className="w-3.5 h-3.5 text-sky-600" />
                        Afternoon
                      </span>
                      <span className="text-[11px] font-medium text-gray-500">
                        {dayPlan.afternoon.time}
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-gray-900 mb-2">
                      {dayPlan.afternoon.title}
                    </h5>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4 flex-grow">
                      {dayPlan.afternoon.description}
                    </p>
                    <div className="pt-3 border-t border-sky-200/50 flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-gray-700 font-medium">
                        <MapPin className="w-3 h-3 text-sky-600 flex-shrink-0" />
                        <span className="truncate max-w-[140px]">
                          {dayPlan.afternoon.location}
                        </span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white text-gray-600 font-medium border border-sky-200">
                        {dayPlan.afternoon.tag}
                      </span>
                    </div>
                  </div>

                  {/* Evening */}
                  <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100/80 flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold">
                        <Sunset className="w-3.5 h-3.5 text-indigo-600" />
                        Evening
                      </span>
                      <span className="text-[11px] font-medium text-gray-500">
                        {dayPlan.evening.time}
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-gray-900 mb-2">
                      {dayPlan.evening.title}
                    </h5>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4 flex-grow">
                      {dayPlan.evening.description}
                    </p>
                    <div className="pt-3 border-t border-indigo-200/50 flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-gray-700 font-medium">
                        <MapPin className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                        <span className="truncate max-w-[140px]">
                          {dayPlan.evening.location}
                        </span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white text-gray-600 font-medium border border-indigo-200">
                        {dayPlan.evening.tag}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Eco & Cultural Tip */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
                  <Leaf className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-emerald-900 uppercase tracking-wider block mb-0.5">
                      Responsible Travel & Cultural Tip
                    </span>
                    <p className="text-emerald-800 leading-relaxed">
                      {dayPlan.ecoTip}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom Actions Footer */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 print:hidden">
          {onSaveTrip && (
            <button
              type="button"
              onClick={handleSaveClick}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold shadow-sm transition-all cursor-pointer border ${
                isSaved
                  ? "bg-amber-50 border-amber-300 text-amber-800"
                  : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Bookmark
                className={`w-4 h-4 ${
                  isSaved ? "fill-amber-500 text-amber-500" : "text-amber-500"
                }`}
              />
              <span>{isSaved ? "Saved in My Trips" : "Save to My Trips"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onEdit && onEdit(itinerary)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-gray-300 text-gray-800 text-sm font-bold shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-orange-500" />
            <span>Modify Preferences</span>
          </button>

          <button
            type="button"
            onClick={onRegenerate}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-green-600 text-white text-sm font-bold shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Regenerate Plan</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              exportTriggerRef.current = e.currentTarget;
              setShowExportModal(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-gray-300 text-gray-800 text-sm font-bold shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export Plan</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white text-sm font-bold shadow-md hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Plan</span>
          </button>
        </div>
      </div>

      {/* Export Options Modal Dialog */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExportModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="export-modal-title"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-orange-500" />
                  <h4 id="export-modal-title" className="text-base font-bold text-gray-900">
                    Export Travel Itinerary
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-gray-600 mb-5">
                Export your travel schedule for{" "}
                <strong className="text-gray-900">{destination.name}</strong> to
                take offline or sync directly with your calendar app.
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="w-full flex items-start gap-3 p-3.5 rounded-2xl border border-gray-200 hover:border-orange-300 bg-gray-50 hover:bg-orange-50/50 transition-all text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-gray-900 block group-hover:text-orange-950">
                      Download JSON Backup (.json)
                    </span>
                    <span className="text-xs text-gray-500">
                      Standard portable JSON format. Can be restored or imported on
                      any device running YatraSarathi.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadIcs}
                  className="w-full flex items-start gap-3 p-3.5 rounded-2xl border border-gray-200 hover:border-blue-300 bg-gray-50 hover:bg-blue-50/50 transition-all text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-gray-900 block group-hover:text-blue-950">
                      Export Calendar (.ics)
                    </span>
                    <span className="text-xs text-gray-500">
                      Standard iCalendar file with honest day-by-day morning, afternoon,
                      and evening activity notes for Google, Apple, or Outlook.
                    </span>
                  </div>
                </button>
              </div>

              <div className="mt-5 text-right">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
