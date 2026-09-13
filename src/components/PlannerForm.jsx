import { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Compass,
  Sparkles,
  Check,
  AlertCircle,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { motion } from "motion/react";
import {
  destinations,
  PLANNER_BUDGET_TIERS,
  TRAVEL_STYLES,
  INTEREST_OPTIONS,
  getDestinationById,
} from "../data/destinations";
import { calculateBudget, formatINR } from "../utils/itineraryGenerator";

export default function PlannerForm({
  onGenerate,
  prefill = null,
  isGenerating = false,
}) {
  // Form State
  const [destinationId, setDestinationId] = useState("");
  const [days, setDays] = useState(4);
  const [travellers, setTravellers] = useState(2);
  const [budgetTier, setBudgetTier] = useState("moderate");
  const [travelStyle, setTravelStyle] = useState("Balanced");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [errors, setErrors] = useState({});

  // Populate or update form whenever prefill changes
  useEffect(() => {
    if (prefill && prefill.id) {
      setDestinationId(prefill.id);
      if (prefill.days) setDays(Math.min(14, Math.max(1, prefill.days)));
      if (prefill.peoples) setTravellers(Math.min(10, Math.max(1, prefill.peoples)));
      if (prefill.budgetTier) setBudgetTier(prefill.budgetTier);
      if (prefill.travelStyle) {
        const matchingStyle = TRAVEL_STYLES.find(
          (s) => s.toLowerCase() === prefill.travelStyle.toLowerCase()
        );
        if (matchingStyle) setTravelStyle(matchingStyle);
      }
      if (Array.isArray(prefill.tags) && prefill.tags.length > 0) {
        setSelectedInterests(prefill.tags);
      }
      // Clear errors on prefill
      setErrors((prev) => ({ ...prev, destination: null }));
    }
  }, [prefill]);

  // Lookup chosen destination object
  const selectedDestination = useMemo(() => {
    return getDestinationById(destinationId);
  }, [destinationId]);

  // Live estimated budget calculation
  const liveBudget = useMemo(() => {
    if (!selectedDestination) return null;
    return calculateBudget(selectedDestination, days, travellers, budgetTier);
  }, [selectedDestination, days, travellers, budgetTier]);

  // Handle interest chip toggle
  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );
  };

  // Stepper handlers for travellers
  const handleTravellerChange = (delta) => {
    const nextVal = Math.min(10, Math.max(1, travellers + delta));
    setTravellers(nextVal);
  };

  // Reset form to defaults
  const handleReset = () => {
    setDestinationId("");
    setDays(4);
    setTravellers(2);
    setBudgetTier("moderate");
    setTravelStyle("Balanced");
    setSelectedInterests([]);
    setErrors({});
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!destinationId) {
      newErrors.destination = "Please select a destination to start planning.";
    }
    if (days < 1 || days > 14) {
      newErrors.days = "Trip duration must be between 1 and 14 days.";
    }
    if (travellers < 1 || travellers > 10) {
      newErrors.travellers = "Number of travellers must be between 1 and 10.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (onGenerate && selectedDestination) {
      onGenerate({
        destination: selectedDestination,
        days,
        travellers,
        budgetTier,
        travelStyle,
        interests: selectedInterests,
      });
    }
  };

  const isFormDirty =
    destinationId !== "" ||
    days !== 4 ||
    travellers !== 2 ||
    budgetTier !== "moderate" ||
    travelStyle !== "Balanced" ||
    selectedInterests.length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 sm:space-y-7 text-left"
      noValidate
      aria-label="Smart Trip Planner Form"
    >
      {/* Top Header with Reset Option */}
      {isFormDirty && (
        <div className="flex justify-end -mt-1 -mb-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-orange-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Form</span>
          </button>
        </div>
      )}

      {/* 1. Destination Selector */}
      <div>
        <label
          htmlFor="planner-destination"
          className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5 flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            Destination <span className="text-red-500">*</span>
          </span>
          {selectedDestination && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {selectedDestination.state}
            </span>
          )}
        </label>
        <div className="relative">
          <select
            id="planner-destination"
            value={destinationId}
            aria-invalid={!!errors.destination}
            aria-describedby={errors.destination ? "planner-destination-error" : undefined}
            onChange={(e) => {
              setDestinationId(e.target.value);
              if (errors.destination) {
                setErrors((prev) => ({ ...prev, destination: null }));
              }
            }}
            className={`w-full appearance-none rounded-xl border ${
              errors.destination
                ? "border-red-400 bg-red-50/50 text-red-900 focus:ring-red-300"
                : "border-gray-200 bg-white/95 text-gray-800 focus:border-orange-400 focus:ring-orange-200"
            } pl-4 pr-10 py-3 text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2`}
          >
            <option value="">Select a destination...</option>
            <optgroup label="Popular Destinations">
              {destinations
                .filter((d) => d.category === "popular")
                .map((dest) => (
                  <option key={dest.id} value={dest.id}>
                    {dest.name} ({dest.state})
                  </option>
                ))}
            </optgroup>
            <optgroup label="Hidden Gems of India">
              {destinations
                .filter((d) => d.category === "hidden-gem")
                .map((dest) => (
                  <option key={dest.id} value={dest.id}>
                    ✨ {dest.name} ({dest.state})
                  </option>
                ))}
            </optgroup>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-gray-500" />
        </div>
        {errors.destination && (
          <p
            id="planner-destination-error"
            role="alert"
            aria-live="polite"
            className="mt-2 text-xs text-red-600 flex items-center gap-1 font-medium"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {errors.destination}
          </p>
        )}
      </div>

      {/* 2. Duration & Travellers (Side-by-side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Duration Slider */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 border border-gray-100 shadow-xs">
          <div className="flex justify-between items-center mb-2.5">
            <label
              htmlFor="planner-duration"
              className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-orange-500" />
              Duration
            </label>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
              {days} {days === 1 ? "Day" : "Days"}
            </span>
          </div>
          <div className="py-1">
            <input
              id="planner-duration"
              type="range"
              min="1"
              max="14"
              value={days}
              aria-valuemin={1}
              aria-valuemax={14}
              aria-valuenow={days}
              aria-valuetext={`${days} ${days === 1 ? "day" : "days"}`}
              aria-label="Trip duration in days"
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full cursor-pointer appearance-none rounded-lg bg-gray-200 h-2 accent-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mt-1.5 font-medium">
            <span>1 day</span>
            <span>7 days</span>
            <span>14 days</span>
          </div>
        </div>

        {/* Travellers Stepper */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2.5">
            <label
              htmlFor="planner-travellers"
              className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              Travellers
            </label>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {travellers} {travellers === 1 ? "Person" : "People"}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleTravellerChange(-1)}
              disabled={travellers <= 1}
              aria-label="Decrease travellers"
              className="w-9 h-9 min-h-[36px] min-w-[36px] rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold text-gray-700 transition-colors cursor-pointer text-base"
            >
              -
            </button>
            <input
              id="planner-travellers"
              type="number"
              min="1"
              max="10"
              value={travellers}
              aria-label="Number of travellers"
              onChange={(e) => {
                const val = Math.min(
                  10,
                  Math.max(1, Number(e.target.value) || 1)
                );
                setTravellers(val);
              }}
              className="w-full text-center py-1.5 rounded-lg border border-gray-200 bg-white font-bold text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <button
              type="button"
              onClick={() => handleTravellerChange(1)}
              disabled={travellers >= 10}
              aria-label="Increase travellers"
              className="w-9 h-9 min-h-[36px] min-w-[36px] rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold text-gray-700 transition-colors cursor-pointer text-base"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* 3. Budget Tier */}
      <fieldset className="border-0 p-0 m-0">
        <legend className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5 flex items-center gap-1.5">
          <IndianRupee className="w-3.5 h-3.5 text-blue-600" />
          Budget Tier
        </legend>
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5" role="radiogroup" aria-label="Budget Tier">
          {PLANNER_BUDGET_TIERS.map((tier) => {
            const isSelected = budgetTier === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setBudgetTier(tier.id)}
                className={`py-2.5 px-2 sm:py-3 sm:px-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-900 shadow-sm ring-2 ring-blue-300"
                    : "border-gray-200 bg-white/80 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span className="text-xs font-bold capitalize">{tier.label}</span>
                <span className="text-[10px] text-gray-500 leading-tight mt-0.5 sm:mt-1 line-clamp-1 font-medium">
                  {tier.id === "budget"
                    ? "Economy"
                    : tier.id === "moderate"
                    ? "Standard"
                    : "Luxury"}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 4. Travel Style */}
      <fieldset className="border-0 p-0 m-0">
        <legend className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-indigo-600" />
          Travel Style
        </legend>
        <div className="flex flex-wrap gap-2 sm:gap-2.5" role="radiogroup" aria-label="Travel Style">
          {TRAVEL_STYLES.map((style) => {
            const isSelected = travelStyle === style;
            return (
              <button
                key={style}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setTravelStyle(style)}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm"
                    : "bg-white/80 hover:bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                {style}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 5. Interests Multi-Select */}
      <fieldset className="border-0 p-0 m-0">
        <legend className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5 w-full">
          <span className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Interests & Activities
            </span>
            <span className="text-[10px] font-normal text-gray-400 tracking-normal normal-case bg-gray-100/80 px-2 py-0.5 rounded-full border border-gray-200/40">
              Optional
            </span>
          </span>
        </legend>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5" role="group" aria-label="Interests and Activities">
          {INTEREST_OPTIONS.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                onClick={() => toggleInterest(interest)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white/80 hover:bg-gray-100 text-gray-600 border border-gray-200"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 flex-shrink-0" />}
                <span>{interest}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 6. Dynamic Real-Time Estimated Trip Budget Banner */}
      {liveBudget && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-green-50 border border-amber-200/60 flex items-center justify-between text-xs shadow-xs"
        >
          <div>
            <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">
              Estimated Trip Budget ({travellers} pax • {days}d)
            </span>
            <span className="text-base sm:text-lg font-extrabold text-gray-900">
              ₹{formatINR(liveBudget.total)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">
              Per Person
            </span>
            <span className="text-xs sm:text-sm font-bold text-emerald-700">
              ₹{formatINR(liveBudget.perPerson)}
            </span>
          </div>
        </motion.div>
      )}

      {/* 7. Generate Action */}
      <div className="pt-1 sm:pt-1.5">
        <motion.button
          type="submit"
          disabled={isGenerating}
          whileHover={{ scale: isGenerating ? 1 : 1.01 }}
          whileTap={{ scale: isGenerating ? 1 : 0.98 }}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-green-600 py-3.5 px-6 font-bold text-gray-900 shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-75 disabled:cursor-wait text-sm"
        >
          <Sparkles className={`w-4 h-4 text-orange-950 ${isGenerating ? "animate-spin" : ""}`} />
          <span>{isGenerating ? "Building your personalized itinerary..." : "Generate Itinerary"}</span>
        </motion.button>
      </div>
    </form>
  );
}
