import React from "react";
import { MapPin, IndianRupee, Leaf, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function Features() {
  const features = [
    {
      icon: <MapPin className="w-10 h-10 text-orange-500" />,
      title: "Personalized Itinerary",
      desc: "Get a complete day-by-day plan tailored to your budget, preferences, and travel dates.",
    },
    {
      icon: <IndianRupee className="w-10 h-10 text-green-600" />,
      title: "Budget-Friendly Planning",
      desc: "Smart suggestions for hotels, food, and transport options that fit your budget.",
    },
    {
      icon: <Leaf className="w-10 h-10 text-emerald-500" />,
      title: "Sustainable Tourism",
      desc: "Explore offbeat, eco-conscious destinations and support local communities directly.",
    },
    {
      icon: <Users className="w-10 h-10 text-sky-600" />,
      title: "Local Community Support",
      desc: "Promote remote destinations and support local SMEs and artisans.",
    },
  ];

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.2, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-gradient-to-br from-orange-100 via-white to-green-100 py-20"
    >
      {/* Floating Background Blobs */}
      <motion.div
        className="absolute top-0 right-0 h-96 w-96 rounded-full bg-orange-300 opacity-25 blur-3xl"
        animate={{ y: [0, -25, 0], x: [0, 25, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-green-300 opacity-25 blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative z-10 mx-auto px-6">
        {/* Section Title */}
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={sectionVariants}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4 text-gray-800"
            variants={cardVariants}
          >
            Explore the <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-green-500 to-emerald-600">Features</span>
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            variants={cardVariants}
          >
            YatraSarathi makes your journey effortless — blending personalization, affordability, and sustainability.
          </motion.p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative bg-white/30 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              variants={cardVariants}
              whileHover={{ scale: 1.05 }}
            >
              {/* Icon */}
              <motion.div
                className="mb-4 flex justify-center"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="p-4 bg-white/40 backdrop-blur-md rounded-full shadow-inner group-hover:shadow-md transition-all duration-300">
                  {feature.icon}
                </div>
              </motion.div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-700 text-sm text-center leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
