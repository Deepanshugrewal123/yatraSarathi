import React from "react";
import { motion } from "framer-motion";

function HiddenGemCard({ image, name, price, days, peoples, tags, index }) {
  const tagColors = {
    Mountains: "bg-blue-100 text-blue-800",
    Tribes: "bg-green-100 text-green-800",
    "Music Festival": "bg-purple-100 text-purple-800",
    Monastery: "bg-yellow-100 text-yellow-800",
    Snow: "bg-sky-100 text-sky-800",
    Adventure: "bg-red-100 text-red-800",
    Island: "bg-teal-100 text-teal-800",
    Culture: "bg-pink-100 text-pink-800",
    Nature: "bg-lime-100 text-lime-800",
    Valley: "bg-indigo-100 text-indigo-800",
    Trekking: "bg-orange-100 text-orange-800",
    Flowers: "bg-fuchsia-100 text-fuchsia-800",
    Hills: "bg-emerald-100 text-emerald-800",
    Meadows: "bg-amber-100 text-amber-800",
    Village: "bg-rose-100 text-rose-800",
    Beaches: "bg-cyan-100 text-cyan-800",
    Spirituality: "bg-violet-100 text-violet-800",
    Relaxation: "bg-gray-100 text-gray-800",
    Heritage: "bg-yellow-100 text-yellow-900",
    Ruins: "bg-orange-100 text-orange-800",
    River: "bg-blue-100 text-blue-800",
    Waterfalls: "bg-cyan-100 text-cyan-800",
    Scenic: "bg-lime-100 text-lime-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        delay: index * 0.15,
        type: "spring",
        stiffness: 120,
        damping: 15,
      }}
      whileHover={{
        scale: 1.05,
        y: -8,
        transition: { type: "spring", stiffness: 300 },
      }}
      className="relative bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow duration-300 group"
    >
      {/* Image with overlay */}
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>
      </div>

      {/* Card content */}
      <div className="p-6">
        <h3 className="text-lg font-bold mb-3 text-gray-900">{name}</h3>
        <div className="flex items-center justify-between text-gray-600 mb-4 text-sm">
          <span>₹{price}+</span>
          <span className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10m-9 4h6m-6 4h6"
              />
            </svg>
            {days} days
          </span>
          <span className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a4 4 0 0 0-3-3.87V11a5 5 0 0 0-10 0v3.13A4 4 0 0 0 6 18v2h5"
              />
            </svg>
            {peoples} people
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <motion.span
              key={idx}
              whileHover={{ scale: 1.1 }}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                tagColors[tag] || "bg-gray-100 text-gray-700"
              }`}
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function HiddenGems() {
  const gems = [
    {
      image: "/images/Laitlum.jpg",
      name: "Laitlum, Meghalaya",
      price: "38,000",
      days: 2,
      peoples: 2,
      tags: ["Valley", "Waterfalls", "Scenic"],
    },
    {
      image: "/images/Hampi.jpg",
      name: "Hampi, Karnataka",
      price: "40,000",
      days: 3,
      peoples: 2,
      tags: ["Heritage", "Ruins", "River"],
    },
    {
      image: "/images/Laitmawsiang.jpg",
      name: "Laitmawsiang, Meghalaya",
      price: "30,000",
      days: 3,
      peoples: 3,
      tags: ["Hills", "Village", "Waterfalls", "Scenic"],
    },
    {
      image: "/images/DzukouValley.jpeg",
      name: "Dzukou Valley, Nagaland",
      price: "34,000",
      days: 4,
      peoples: 2,
      tags: ["Valley", "Trekking", "Flowers"],
    },
  ];

  return (
    <section className="relative overflow-hidden py-20 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-100">
      {/* Floating gradient blobs */}
      <motion.div
        className="absolute top-10 right-10 h-64 w-64 rounded-full bg-blue-400 opacity-20 blur-3xl"
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-purple-400 opacity-20 blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 120 }}
          className="text-4xl font-bold text-gray-800 mb-14"
        >
          Hidden Gems of India ✨
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {gems.map((gem, idx) => (
            <HiddenGemCard key={idx} index={idx} {...gem} />
          ))}
        </div>
      </div>
    </section>
  );
}
