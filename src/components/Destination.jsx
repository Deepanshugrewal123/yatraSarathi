import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Search, X, RotateCcw, Filter, MapPinOff } from "lucide-react";
import DestinationCard from "./DestinationCard";
import DestinationDetails from "./DestinationDetails";
import {
  destinations,
  getAllStates,
  BUDGET_TIERS,
  CATEGORY_OPTIONS,
} from "../data/destinations";

export default function PopularDestinations({
  onPlanTrip,
  favorites = [],
  onToggleFavorite,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedBudget, setSelectedBudget] = useState("all");
  const [selectedDestination, setSelectedDestination] = useState(null);

  const states = useMemo(() => getAllStates(), []);

  // Combined search and filtering logic
  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      // Search matching (name, state, tags, shortDescription)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = dest.name.toLowerCase().includes(q);
        const matchState = dest.state.toLowerCase().includes(q);
        const matchTags = dest.tags.some((t) => t.toLowerCase().includes(q));
        const matchDesc =
          dest.shortDescription?.toLowerCase().includes(q) || false;

        if (!matchName && !matchState && !matchTags && !matchDesc) {
          return false;
        }
      }

      // Category matching
      if (selectedCategory !== "all" && dest.category !== selectedCategory) {
        return false;
      }

      // State matching
      if (selectedState !== "All States" && dest.state !== selectedState) {
        return false;
      }

      // Budget matching
      if (selectedBudget !== "all") {
        if (dest.budgetTier !== selectedBudget) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedState, selectedBudget]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedState !== "All States" ||
    selectedBudget !== "all";

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedState("All States");
    setSelectedBudget("all");
  };

  return (
    <section
      id="destination"
      className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-100 py-20 md:py-28"
    >
      {/* Floating background ambient blobs */}
      <motion.div
        className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-400 opacity-20 blur-3xl pointer-events-none"
        animate={{ y: [0, -30, 0], x: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-cyan-300 opacity-20 blur-3xl pointer-events-none"
        animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative z-10 mx-auto px-6 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
              Destination Explorer
            </span>
          </motion.h2>
          <motion.p
            className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Explore popular Indian retreats and offbeat hidden gems. Search by
            name, filter by region and budget, and view detailed guides.
          </motion.p>
        </div>

        {/* Explorer Control Panel (Search & Filter Card) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 md:p-6 shadow-xl border border-white/60 mb-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input (Takes 6 cols on md) */}
            <div className="md:col-span-6 relative">
              <label htmlFor="destination-search-input" className="sr-only">
                Search destinations by name, state, or tag
              </label>
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                id="destination-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by destination, state, or tag (e.g. Goa, Heritage, Hills)..."
                aria-label="Search destinations"
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-gray-50/80 border border-gray-200 text-gray-800 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search input"
                  className="absolute right-3.5 top-3.5 p-1 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* State Filter (Takes 3 cols on md) */}
            <div className="md:col-span-3">
              <label htmlFor="state-filter-select" className="sr-only">
                Filter by State
              </label>
              <select
                id="state-filter-select"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                aria-label="Filter destinations by state"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50/80 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
              >
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget Filter (Takes 3 cols on md) */}
            <div className="md:col-span-3">
              <label htmlFor="budget-filter-select" className="sr-only">
                Filter by Budget
              </label>
              <select
                id="budget-filter-select"
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                aria-label="Filter destinations by budget tier"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50/80 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
              >
                {BUDGET_TIERS.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Tabs & Active Filters Bar */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            {/* Category Segmented Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100/90 rounded-2xl">
              {CATEGORY_OPTIONS.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Results count & reset action */}
            <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
              <span>
                Showing <strong className="text-gray-900">{filteredDestinations.length}</strong> of{" "}
                {destinations.length} destinations
              </span>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  aria-label="Reset all search and filter settings"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Results Grid / Empty State */}
        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch">
            {filteredDestinations.map((dest, idx) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                index={idx}
                isFavorite={favorites.includes(dest.id)}
                onToggleFavorite={onToggleFavorite}
                onSelect={setSelectedDestination}
              />
            ))}
          </div>
        ) : (
          /* Polished Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-6 bg-white/60 backdrop-blur-md rounded-3xl border border-white/80 max-w-md mx-auto shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <MapPinOff className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No matching destinations
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              We couldn\'t find any places matching your current search and
              filter selection. Try loosening your filters or resetting them.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Filters</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Destination Details Modal */}
      <DestinationDetails
        destination={selectedDestination}
        onClose={() => setSelectedDestination(null)}
        onPlanTrip={onPlanTrip}
        isFavorite={selectedDestination ? favorites.includes(selectedDestination.id) : false}
        onToggleFavorite={onToggleFavorite}
      />
    </section>
  );
}
