import { motion } from "motion/react";
import { Calendar, Users, ArrowRight, Sparkles, Heart } from "lucide-react";

export default function DestinationCard({
  destination,
  onSelect,
  index = 0,
  isFavorite = false,
  onToggleFavorite,
}) {
  const {
    id,
    name,
    state,
    image,
    priceDisplay,
    days,
    peoples,
    tags = [],
    badge = "Featured",
    category,
    shortDescription,
  } = destination;

  const tagGradients = {
    Beaches: "bg-sky-100 text-sky-800 border-sky-200",
    Nightlife: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
    Nature: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Heritage: "bg-amber-100 text-amber-800 border-amber-200",
    History: "bg-rose-100 text-rose-800 border-rose-200",
    Culture: "bg-pink-100 text-pink-800 border-pink-200",
    Backwaters: "bg-teal-100 text-teal-800 border-teal-200",
    Ayurveda: "bg-indigo-100 text-indigo-800 border-indigo-200",
    Wildlife: "bg-lime-100 text-lime-800 border-lime-200",
    Hills: "bg-orange-100 text-orange-800 border-orange-200",
    Adventure: "bg-purple-100 text-purple-800 border-purple-200",
    Valley: "bg-indigo-100 text-indigo-800 border-indigo-200",
    Waterfalls: "bg-cyan-100 text-cyan-800 border-cyan-200",
    Scenic: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Trekking: "bg-orange-100 text-orange-800 border-orange-200",
    Flowers: "bg-rose-100 text-rose-800 border-rose-200",
    Ruins: "bg-amber-100 text-amber-800 border-amber-200",
    River: "bg-blue-100 text-blue-800 border-blue-200",
    Village: "bg-teal-100 text-teal-800 border-teal-200",
    "Music Festival": "bg-purple-100 text-purple-800 border-purple-200",
    Tribes: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };

  const isHiddenGem = category === "hidden-gem";

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(id);
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`View full details for ${name}`}
      onClick={() => onSelect && onSelect(destination)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect && onSelect(destination);
        }
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        delay: Math.min(index * 0.08, 0.4),
        type: "spring",
        stiffness: 120,
        damping: 18,
      }}
      whileHover={{
        y: -6,
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      className="group text-left bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex flex-col h-full relative"
    >
      {/* Image container */}
      <div className="relative overflow-hidden h-60 w-full bg-gray-100">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-semibold text-gray-800 shadow-sm pointer-events-none">
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
        </div>

        {/* Favorite Heart Toggle Button */}
        {onToggleFavorite && (
          <button
            type="button"
            aria-label={isFavorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
            aria-pressed={isFavorite}
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200 cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-rose-400 ${
              isFavorite
                ? "bg-white/95 text-rose-600 scale-105"
                : "bg-black/40 hover:bg-black/70 text-white backdrop-blur-md hover:scale-105"
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? "fill-rose-500 text-rose-500" : "text-white"
              }`}
            />
          </button>
        )}

        {/* State chip */}
        <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-xs font-medium text-white pointer-events-none">
          {state}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1.5">
            {name}
          </h3>

          {shortDescription && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-3.5 leading-relaxed">
              {shortDescription}
            </p>
          )}

          {/* Pricing and details */}
          <div className="flex items-center justify-between text-gray-600 text-sm mb-4 font-medium">
            <span className="font-bold text-blue-600 text-base">
              ₹{priceDisplay}+
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              {days} days
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
              <Users className="h-3.5 w-3.5 text-blue-600" />
              {peoples} people
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className={`px-2.5 py-0.5 text-xs rounded-full font-medium border ${
                  tagGradients[tag] || "bg-gray-100 text-gray-700 border-gray-200"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Interactive CTA footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
          <span className="text-xs text-gray-400 font-medium">Click for details</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
            View Details
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
