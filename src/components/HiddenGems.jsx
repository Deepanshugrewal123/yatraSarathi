import { useState } from "react";
import { motion } from "motion/react";
import DestinationCard from "./DestinationCard";
import DestinationDetails from "./DestinationDetails";
import { getHiddenGems } from "../data/destinations";

export default function HiddenGems({
  onPlanTrip,
  favorites = [],
  onToggleFavorite,
}) {
  const [selectedGem, setSelectedGem] = useState(null);
  const gems = getHiddenGems();

  return (
    <section
      id="hiddengems"
      className="relative overflow-hidden py-20 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-100"
    >
      {/* Floating gradient blobs */}
      <motion.div
        className="absolute top-10 right-10 h-64 w-64 rounded-full bg-blue-400 opacity-20 blur-3xl pointer-events-none"
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-purple-400 opacity-20 blur-3xl pointer-events-none"
        animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 120 }}
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
        >
          Hidden Gems of India ✨
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-gray-600 max-w-xl mx-auto mb-14 text-base"
        >
          Offbeat hill sanctuaries, dramatic mist-covered canyons, and living
          indigenous heritage far from the standard tourist circuits.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch">
          {gems.map((gem, idx) => (
            <DestinationCard
              key={gem.id}
              destination={gem}
              index={idx}
              isFavorite={favorites.includes(gem.id)}
              onToggleFavorite={onToggleFavorite}
              onSelect={setSelectedGem}
            />
          ))}
        </div>
      </div>

      {/* Details Modal */}
      <DestinationDetails
        destination={selectedGem}
        onClose={() => setSelectedGem(null)}
        onPlanTrip={onPlanTrip}
        isFavorite={selectedGem ? favorites.includes(selectedGem.id) : false}
        onToggleFavorite={onToggleFavorite}
      />
    </section>
  );
}
