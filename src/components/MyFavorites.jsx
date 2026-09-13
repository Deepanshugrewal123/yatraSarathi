import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Heart, Compass, ArrowRight } from "lucide-react";
import DestinationCard from "./DestinationCard";
import DestinationDetails from "./DestinationDetails";
import { destinations } from "../data/destinations";

export default function MyFavorites({
  favorites = [],
  onToggleFavorite,
  onPlanTrip,
}) {
  const [selectedDestination, setSelectedDestination] = useState(null);

  // Resolve destination objects from stored IDs
  const favoriteDestinations = useMemo(() => {
    if (!Array.isArray(favorites) || favorites.length === 0) return [];
    return favorites
      .map((id) => destinations.find((d) => d.id === id))
      .filter(Boolean);
  }, [favorites]);

  const handleExploreNow = () => {
    const destEl = document.getElementById("destination");
    if (destEl) {
      destEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="favorites"
      className="relative py-20 bg-gradient-to-b from-slate-50 via-rose-50/20 to-white overflow-hidden"
    >
      {/* Subtle Background Glows */}
      <div className="absolute top-1/3 -left-20 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs"
          >
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>Curated Wishlist</span>
            {favoriteDestinations.length > 0 && (
              <span className="ml-1 px-2 py-0.2 rounded-full bg-rose-200 text-rose-900 text-xs">
                {favoriteDestinations.length}
              </span>
            )}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4"
          >
            Favorite Destinations ❤️
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-base leading-relaxed"
          >
            Your saved wishlist of India’s most inspiring getaways, iconic landmarks,
            and hidden sanctuaries.
          </motion.p>
        </div>

        {/* Favorites Grid or Empty State */}
        {favoriteDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch">
            {favoriteDestinations.map((dest, idx) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                index={idx}
                isFavorite={true}
                onToggleFavorite={onToggleFavorite}
                onSelect={setSelectedDestination}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-6 bg-white/70 backdrop-blur-md rounded-3xl border border-gray-200/70 max-w-md mx-auto shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 fill-rose-500/20 text-rose-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No favorites saved yet
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Explore destinations and hidden gems across India, then tap the
              heart icon on any card to save your dream destinations here!
            </p>
            <button
              type="button"
              onClick={handleExploreNow}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-green-600 text-white font-bold text-sm shadow-md hover:scale-105 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Destinations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Destination Details Modal */}
      <DestinationDetails
        destination={selectedDestination}
        onClose={() => setSelectedDestination(null)}
        onPlanTrip={onPlanTrip}
        isFavorite={
          selectedDestination ? favorites.includes(selectedDestination.id) : false
        }
        onToggleFavorite={onToggleFavorite}
      />
    </section>
  );
}
