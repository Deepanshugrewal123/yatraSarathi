import React from "react";
import { motion } from "framer-motion";

// Destination Card Component
function DestinationCard({ image, name, price, days, peoples, tags, index }) {
  const tagGradients = {
    Beaches: "bg-gradient-to-r from-sky-200 to-blue-300 text-blue-900",
    Nightlife: "bg-gradient-to-r from-purple-200 to-fuchsia-300 text-fuchsia-900",
    Nature: "bg-gradient-to-r from-green-200 to-emerald-300 text-emerald-900",
    Heritage: "bg-gradient-to-r from-yellow-200 to-amber-300 text-amber-900",
    History: "bg-gradient-to-r from-red-200 to-rose-300 text-rose-900",
    Culture: "bg-gradient-to-r from-pink-200 to-rose-300 text-rose-900",
    Backwaters: "bg-gradient-to-r from-teal-200 to-cyan-300 text-cyan-900",
    Ayurveda: "bg-gradient-to-r from-indigo-200 to-blue-300 text-indigo-900",
    Wildlife: "bg-gradient-to-r from-lime-200 to-green-300 text-green-900",
    Hills: "bg-gradient-to-r from-orange-200 to-amber-300 text-amber-900",
    Adventure: "bg-gradient-to-r from-fuchsia-200 to-pink-300 text-pink-900",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        delay: index * 0.15,
        type: "spring",
        stiffness: 120,
        damping: 20,
      }}
      whileHover={{
        y: -10,
        scale: 1.05,
        boxShadow: "0 12px 30px rgba(59,130,246,0.3)",
      }}
      className="group bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative"
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/80 text-xs font-semibold text-gray-700 backdrop-blur-sm">
          ✨ Trending
        </div>
      </div>

      {/* Details */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>

        <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
          <span className="font-semibold text-blue-600">₹{price}+</span>
          <span className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-9 4h6m-6 4h6" />
            </svg>
            {days} days
          </span>
          <span className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4H2v16h5" />
            </svg>
            {peoples} people
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.1 }}
              className={`px-3 py-1 text-xs rounded-full font-medium shadow-sm ${tagGradients[tag] || "bg-gray-200 text-gray-800"}`}
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Subtle Glow Border */}
      <motion.div
        className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-blue-400/50 transition-all duration-300 pointer-events-none"
      />
    </motion.div>
  );
}

// Main Component
export default function PopularDestinations() {
  const destinations = [
    {
      image: "/images/Goa.jpeg",
      name: "Goa, India",
      price: "40,000",
      days: 5,
      peoples: 2,
      tags: ["Beaches", "Nightlife", "Nature"],
    },
    {
      image: "/images/Jaipur.jpeg",
      name: "Jaipur, Rajasthan",
      price: "30,000",
      days: 4,
      peoples: 3,
      tags: ["Heritage", "History", "Culture"],
    },
    {
      image: "/images/Kerala.jpeg",
      name: "Alleppey, Kerala",
      price: "55,000",
      days: 7,
      peoples: 2,
      tags: ["Backwaters", "Ayurveda", "Wildlife"],
    },
    {
      image: "/images/Shimla.jpeg",
      name: "Shimla, Himachal",
      price: "28,000",
      days: 5,
      peoples: 4,
      tags: ["Hills", "Adventure", "Nature"],
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-100 py-20 md:py-28">
      {/* Floating blobs */}
      <motion.div
        className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-400 opacity-20 blur-3xl"
        animate={{ y: [0, -30, 0], x: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-cyan-300 opacity-20 blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Title */}
      <div className="container relative z-10 mx-auto px-6">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-14"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Popular Indian Destinations
          </span>
        </motion.h2>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {destinations.map((dest, idx) => (
            <DestinationCard key={idx} index={idx} {...dest} />
          ))}
        </div>
      </div>
    </section>
  );
}
