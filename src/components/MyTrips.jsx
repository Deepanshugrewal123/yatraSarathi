import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  Users,
  IndianRupee,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit3,
  Compass,
  ArrowRight,
  AlertTriangle,
  Clock,
  Upload,
  Download,
  Share2,
  Check,
  FileText,
  CalendarDays,
  X,
} from "lucide-react";
import { formatINR } from "../utils/itineraryGenerator";
import {
  exportTripAsJson,
  exportTripAsIcs,
  validateAndParseTripJson,
} from "../utils/tripExport";
import { shareTrip } from "../utils/tripShare";

export default function MyTrips({
  trips = [],
  onViewTrip,
  onModifyTrip,
  onDeleteTrip,
  onSaveTrip,
}) {
  const [tripToDelete, setTripToDelete] = useState(null);
  const [exportingTrip, setExportingTrip] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fileInputRef = useRef(null);
  const triggerRef = useRef(null);

  const activeModal = tripToDelete || exportingTrip || importPreview || importError;

  useEffect(() => {
    if (!activeModal) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setTripToDelete(null);
        setExportingTrip(null);
        setImportPreview(null);
        setImportError(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (triggerRef.current && typeof triggerRef.current.focus === "function") {
        triggerRef.current.focus();
      }
    };
  }, [activeModal]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const confirmDelete = () => {
    if (tripToDelete && onDeleteTrip) {
      onDeleteTrip(tripToDelete.id);
      setTripToDelete(null);
      showToast("Trip deleted from My Trips.");
    }
  };

  const handlePlanNow = () => {
    const plannerEl = document.getElementById("planner");
    if (plannerEl) {
      plannerEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Trigger file selector
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      const res = validateAndParseTripJson(content);

      if (!res.valid) {
        setImportError(res.error || "Failed to parse imported trip.");
      } else {
        // Check if imported trip already exists in trips
        const isDuplicate = trips.some(
          (t) =>
            t.destination.id === res.itinerary.destination.id &&
            t.duration === res.itinerary.duration &&
            t.travellers === res.itinerary.travellers &&
            t.budgetTier === res.itinerary.budgetTier &&
            t.travelStyle === res.itinerary.travelStyle &&
            (t.mode || "deterministic") === (res.itinerary.mode || "deterministic")
        );
        setImportPreview({ itinerary: res.itinerary, isDuplicate });
      }

      // Reset input value so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    reader.onerror = () => {
      setImportError("Error reading the selected file. Please try again.");
    };

    reader.readAsText(file);
  };

  const handleSaveImportedTrip = () => {
    if (importPreview && onSaveTrip) {
      onSaveTrip(importPreview.itinerary);
      showToast("Imported trip saved to My Trips!");
      setImportPreview(null);
    }
  };

  const handleViewImportedTrip = () => {
    if (importPreview && onViewTrip) {
      onViewTrip(importPreview.itinerary);
      setImportPreview(null);
    }
  };

  const handleCardShare = async (trip) => {
    const res = await shareTrip(trip);
    if (res.shared) {
      if (res.method === "clipboard") {
        showToast("Trip summary copied to clipboard!");
      }
    } else if (res.error && res.error !== "Share cancelled by user.") {
      showToast(res.error);
    }
  };

  const handleDownloadJson = (trip) => {
    exportTripAsJson(trip);
    setExportingTrip(null);
    showToast("JSON trip plan downloaded!");
  };

  const handleDownloadIcs = (trip) => {
    exportTripAsIcs(trip);
    setExportingTrip(null);
    showToast("Calendar (.ics) file downloaded!");
  };

  return (
    <section
      id="mytrips"
      className="relative py-20 bg-gradient-to-b from-white via-slate-50 to-orange-50/20 overflow-hidden"
    >
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Action Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold border border-slate-700"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-2 mb-3"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider shadow-xs">
              <Compass className="w-4 h-4 text-orange-600" />
              <span>Saved Itineraries</span>
              {trips.length > 0 && (
                <span className="ml-1 px-2 py-0.2 rounded-full bg-orange-200 text-orange-900 text-xs">
                  {trips.length}
                </span>
              )}
            </div>

            {/* Accessible Import Trip Action */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Import a trip plan from a JSON file"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Import Trip (.json)</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              aria-label="Upload trip plan JSON file"
              className="hidden"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4"
          >
            My Saved Trips 🎒
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-base leading-relaxed"
          >
            Access and manage your saved personalized travel plans anytime. Saved
            securely on this device, with portable JSON and Calendar exports.
          </motion.p>
        </div>

        {/* Trips Grid or Empty State */}
        {trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {trips.map((trip, idx) => {
              const isAI = trip.mode === "ai-personalized" || trip.mode === "ai";
              const savedDate = trip.createdAt
                ? new Date(trip.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : null;

              return (
                <motion.article
                  key={trip.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: Math.min(idx * 0.08, 0.4),
                    type: "spring",
                    stiffness: 120,
                  }}
                  className="group bg-white rounded-3xl border border-gray-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between relative"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-48 w-full bg-gray-900 overflow-hidden">
                    <img
                      src={trip.destination?.image}
                      alt={trip.destination?.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Mode Tag */}
                    <div className="absolute top-3 left-3">
                      {isAI ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/90 backdrop-blur-md text-white text-xs font-bold shadow-xs">
                          <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                          Personalized
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/90 backdrop-blur-md text-white text-xs font-bold shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                          Curated Plan
                        </span>
                      )}
                    </div>

                    {/* Top Right Actions Bar: Share, Export, Delete */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCardShare(trip)}
                        aria-label={`Share trip to ${trip.destination?.name}`}
                        className="p-2 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md transition-all duration-200 cursor-pointer shadow-sm hover:scale-105"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          triggerRef.current = e.currentTarget;
                          setExportingTrip(trip);
                        }}
                        aria-label={`Export trip to ${trip.destination?.name}`}
                        className="p-2 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md transition-all duration-200 cursor-pointer shadow-sm hover:scale-105"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          triggerRef.current = e.currentTarget;
                          setTripToDelete(trip);
                        }}
                        aria-label={`Delete saved trip to ${trip.destination?.name}`}
                        className="p-2 rounded-full bg-black/40 hover:bg-rose-600/90 text-white backdrop-blur-md transition-all duration-200 cursor-pointer shadow-sm hover:scale-105"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Title Overlay */}
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold truncate drop-shadow-sm">
                        {trip.destination?.name}
                      </h3>
                      <p className="text-xs text-gray-200 font-medium">
                        {trip.destination?.state}
                      </p>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between gap-5">
                    {/* Key Trip Meta Chips */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 font-medium">
                        <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>{trip.duration} Days</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 font-medium">
                        <Users className="w-4 h-4 text-orange-500 shrink-0" />
                        <span>{trip.travellers} People</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 font-medium capitalize truncate">
                        <Compass className="w-4 h-4 text-purple-500 shrink-0" />
                        <span className="truncate">{trip.travelStyle}</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 font-medium capitalize truncate">
                        <IndianRupee className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="truncate">{trip.budgetTier}</span>
                      </div>
                    </div>

                    {/* Estimated Total & Save Timestamp */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-500 font-medium block">
                          Estimated Total
                        </span>
                        <span className="text-base font-extrabold text-emerald-700 flex items-center">
                          <IndianRupee className="w-4 h-4 mr-0.5" />
                          {formatINR(
                            trip.pricing?.totalEstimatedINR ||
                              trip.pricing?.total ||
                              0
                          )}
                        </span>
                      </div>

                      {savedDate && (
                        <div className="text-right">
                          <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {savedDate}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => onViewTrip && onViewTrip(trip)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
                      >
                        <span>View Itinerary</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onModifyTrip && onModifyTrip(trip)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Modify</span>
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-6 bg-white/70 backdrop-blur-md rounded-3xl border border-gray-200/70 max-w-md mx-auto shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No saved trips yet
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Use our Smart Trip Planner to generate a personalized itinerary,
              or import a saved trip JSON file to keep it here for easy reference!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handlePlanNow}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-green-600 text-white font-bold text-sm shadow-md hover:scale-105 transition-all cursor-pointer"
              >
                <span>Plan a Trip Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white border border-gray-300 text-gray-700 font-bold text-sm shadow-xs hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Import JSON</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Export Options Modal Dialog */}
      <AnimatePresence>
        {exportingTrip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExportingTrip(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="export-trip-modal-title"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-orange-500" />
                  <h4 id="export-trip-modal-title" className="text-base font-bold text-gray-900">
                    Export Trip Plan
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setExportingTrip(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-gray-600 mb-5">
                Export your itinerary for{" "}
                <strong className="text-gray-900">
                  {exportingTrip.destination?.name}
                </strong>{" "}
                to store as a backup or sync with your calendar application.
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleDownloadJson(exportingTrip)}
                  className="w-full flex items-start gap-3 p-3.5 rounded-2xl border border-gray-200 hover:border-orange-300 bg-gray-50 hover:bg-orange-50/50 transition-all text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-gray-900 block group-hover:text-orange-950">
                      Download JSON Backup
                    </span>
                    <span className="text-xs text-gray-500">
                      Standard JSON format containing full day-by-day plan. Can be
                      imported into YatraSarathi on any device.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadIcs(exportingTrip)}
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
                      Standard iCalendar file with daily morning, afternoon, and
                      evening activity notes for Google Calendar, Apple, or Outlook.
                    </span>
                  </div>
                </button>
              </div>

              <div className="mt-5 text-right">
                <button
                  type="button"
                  onClick={() => setExportingTrip(null)}
                  className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import Preview Modal Dialog */}
      <AnimatePresence>
        {importPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setImportPreview(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="import-preview-modal-title"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <h4 id="import-preview-modal-title" className="text-base font-bold text-gray-900">
                    Import Trip Plan
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setImportPreview(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Destination Card Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-4">
                <div className="font-extrabold text-base text-gray-900">
                  {importPreview.itinerary.destination?.name}
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  {importPreview.itinerary.destination?.state}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium">
                    Duration: <strong>{importPreview.itinerary.duration} Days</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium">
                    Travelers: <strong>{importPreview.itinerary.travellers}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium capitalize">
                    Style: <strong>{importPreview.itinerary.travelStyle}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium capitalize">
                    Budget: <strong>{importPreview.itinerary.budgetTier}</strong>
                  </div>
                </div>
              </div>

              {importPreview.isDuplicate && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    This trip matches an itinerary already saved in your My Trips.
                    You can view it now or save it as another entry.
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setImportPreview(null)}
                  className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleViewImportedTrip}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  View Itinerary
                </button>

                <button
                  type="button"
                  onClick={handleSaveImportedTrip}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Save to My Trips
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import Error Modal Dialog */}
      <AnimatePresence>
        {importError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setImportError(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="import-error-modal-title"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 z-10 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 id="import-error-modal-title" className="text-base font-bold text-gray-900 mb-1">
                Unable to Import Trip
              </h4>
              <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                {importError}
              </p>
              <button
                type="button"
                onClick={() => setImportError(null)}
                className="px-5 py-2 rounded-full bg-gray-900 text-white font-bold text-xs hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog for Deletion */}
      <AnimatePresence>
        {tripToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTripToDelete(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-trip-modal-title"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 z-10 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 id="delete-trip-modal-title" className="text-lg font-bold text-gray-900 mb-2">
                Delete Saved Trip?
              </h4>
              <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                Are you sure you want to remove your trip to{" "}
                <strong className="text-gray-900">
                  {tripToDelete.destination?.name}
                </strong>
                ? This action cannot be undone.
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setTripToDelete(null)}
                  className="px-4 py-2.5 rounded-full border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  Delete Trip
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
