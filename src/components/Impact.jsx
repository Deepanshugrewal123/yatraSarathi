import React from "react";
import { Users, Briefcase, Leaf } from "lucide-react";
import { motion } from "motion/react";

export default function Impact() {
  const impacts = [
    {
      icon: <Users className="w-10 h-10 text-orange-500" />,
      title: "Social Impact",
      desc: "Makes travel planning accessible for everyone, promotes cultural preservation, and empowers diverse communities.",
    },
    {
      icon: <Briefcase className="w-10 h-10 text-green-500" />,
      title: "Economic Impact",
      desc: "Boosts local businesses and rural tourism by diverting travelers to less crowded destinations, supporting SMEs.",
    },
    {
      icon: <Leaf className="w-10 h-10 text-emerald-500" />,
      title: "Environmental Impact",
      desc: "Reduces pressure on overcrowded sites, encourages eco-friendly transport, and spreads awareness of sustainable tourism.",
    },
  ];

  return (
    <section className="relative py-20 bg-gradient-to-br from-orange-100 via-white to-green-100 overflow-hidden">
      {/* Floating Background Blobs */}
      <motion.div
        className="absolute top-10 right-10 h-80 w-80 rounded-full bg-orange-300 opacity-25 blur-3xl"
        animate={{ y: [0, -20, 0], x: [0, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-green-300 opacity-25 blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
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
          Impact &{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-green-500 to-emerald-600">
            Benefits
          </span>
        </motion.h2>

        {/* Impact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {impacts.map((impact, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.2,
                type: 'spring',
                stiffness: 120,
                damping: 15,
              }}
              whileHover={{ scale: 1.08, y: -8 }}
              className="relative p-8 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              {/* Icon with motion */}
              <motion.div
                initial={{ rotate: -10, opacity: 0 }}
                whileInView={{ rotate: 0, opacity: 1 }}
                transition={{
                  delay: 0.1 + index * 0.2,
                  type: 'spring',
                  stiffness: 120,
                }}
                className="flex justify-center mb-4"
              >
                <div className="p-3 rounded-full bg-white/40 backdrop-blur-md shadow-md">
                  {impact.icon}
                </div>
              </motion.div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {impact.title}
              </h3>

              {/* Description */}
              <p className="text-gray-700 text-sm leading-relaxed">
                {impact.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
