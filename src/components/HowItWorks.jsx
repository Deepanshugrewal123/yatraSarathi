import React from "react";
import { Search, Calendar, Map, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <Search className="w-10 h-10 text-orange-500" />,
      title: "Enter Preferences",
      desc: "Fill in your destination, budget, dates, and travel style.",
    },
    {
      icon: <Calendar className="w-10 h-10 text-orange-500" />,
      title: "AI Creates Itinerary",
      desc: "Our AI instantly generates a day-by-day personalized plan.",
    },
    {
      icon: <Map className="w-10 h-10 text-orange-500" />,
      title: "Explore Hidden Gems",
      desc: "Get recommendations for offbeat places and local experiences.",
    },
    {
      icon: <CheckCircle className="w-10 h-10 text-orange-500" />,
      title: "Travel Stress-Free",
      desc: "Follow your smart itinerary and enjoy hassle-free travel.",
    },
  ];

  return (
    <section
      id="howitworks"
      className="relative overflow-hidden py-20 bg-gradient-to-br from-orange-100 via-white to-green-100"
    >
      {/* Floating Background Blobs */}
      <motion.div
        className="absolute top-10 right-10 h-80 w-80 rounded-full bg-orange-300 opacity-25 blur-3xl"
        animate={{ y: [0, -20, 0], x: [0, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-green-300 opacity-25 blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative z-10 mx-auto px-6 text-center">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-12 text-gray-800"
        >
          How <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-green-500 to-emerald-600">YatraSarathi</span> Works
        </motion.h2>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.2,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              whileHover={{ scale: 1.08, y: -8 }}
              className="relative p-8 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <motion.div
                initial={{ rotate: -15, opacity: 0 }}
                whileInView={{ rotate: 0, opacity: 1 }}
                transition={{
                  delay: 0.1 + index * 0.2,
                  type: "spring",
                  stiffness: 120,
                }}
                className="flex justify-center mb-4"
              >
                <div className="p-3 rounded-full bg-white/40 backdrop-blur-md shadow-md">
                  {step.icon}
                </div>
              </motion.div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-700 text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
