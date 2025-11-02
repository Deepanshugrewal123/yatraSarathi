import React, { useState } from "react";
import { MapPin, IndianRupee, Users, Plane } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  const [days, setDays] = useState(7);
  const [people, setPeople] = useState("");

  const handlePeopleChange = (e) => {
    const value = e.target.value;
    setPeople(value === "" ? "" : Number(value));
  };

  const fadeInUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.8, ease: "easeOut" },
    },
  });

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-orange-100 via-white to-green-100 py-16 md:py-24"
    >
      {/* Animated Blobs */}
      <motion.div
        className="absolute top-10 left-10 h-72 w-72 bg-orange-300/40 rounded-full blur-3xl"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-96 w-96 bg-green-300/40 rounded-full blur-3xl"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative z-10 mx-auto flex flex-col md:flex-row items-center md:justify-between px-6 md:px-12">
        {/* LEFT: IMAGE COLLAGE SECTION */}
        <motion.div
          className="relative flex-1 flex justify-center md:justify-start mb-10 md:mb-0 w-full"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 70, damping: 12, delay: 0.2 }}
        >
          <div className="relative w-full max-w-lg h-[320px] md:h-[420px] flex justify-center items-center">
            {/* Main Image */}
            <motion.img
              src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1200&auto=format&fit=crop"
              alt="Taj Mahal"
              className="w-[90%] h-[90%] object-cover rounded-3xl shadow-2xl border border-white/50"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Floating small cards (only on md and up) */}
            <motion.img
              src="https://madhutourism.com/wp-content/uploads/2022/01/kashi.jpg"
              alt="Goa Beach"
              className="hidden md:block absolute bottom-10 left-0 w-40 h-28 rounded-xl object-cover shadow-lg border border-white/50"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.img
              src="https://i.ytimg.com/vi/KpkiH7JLkLg/maxresdefault.jpg"
              alt="Himalayas"
              className="hidden md:block absolute top-10 right-0 w-44 h-32 rounded-xl object-cover shadow-lg border border-white/50"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Floating Plane Animation */}
            <motion.div
              className="absolute top-[-30px] right-[-40px] hidden md:block"
              animate={{ x: [0, 25, 0], y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Plane className="h-10 w-10 text-orange-600 rotate-12 opacity-80" />
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT: TEXT + FORM SECTION */}
        <motion.div
          className="flex-1 text-center md:text-left md:max-w-xl"
          variants={fadeInUp(0.3)}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold leading-tight text-gray-900"
            variants={fadeInUp(0.3)}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-green-500 to-emerald-600">
              YatraSarathi
            </span>
            : India’s Smart Tourism Companion
          </motion.h1>

          <motion.p
            className="mt-6 text-lg text-gray-700 md:text-xl leading-relaxed"
            variants={fadeInUp(0.5)}
          >
            Personalized, budget-friendly, and eco-conscious trip planning in
            one trusted app. Empowering governments with tourism insights and
            supporting local communities.
          </motion.p>

          {/* FORM CARD */}
          <motion.div
            className="mt-10 w-full rounded-2xl bg-white/40 border border-white/50 p-6 shadow-2xl backdrop-blur-md md:max-w-md"
            variants={fadeInUp(0.7)}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div className="relative" variants={fadeInUp(0.8)}>
                  <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-600" />
                  <input
                    type="text"
                    placeholder="Destination"
                    aria-label="Destination"
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-3 text-gray-800 placeholder:text-gray-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-300 focus:outline-none"
                  />
                </motion.div>

                <motion.div className="relative" variants={fadeInUp(0.9)}>
                  <IndianRupee className="absolute left-3 top-3.5 h-5 w-5 text-gray-600" />
                  <input
                    type="text"
                    placeholder="Budget (₹)"
                    aria-label="Budget"
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-3 text-gray-800 placeholder:text-gray-500 focus:border-green-400 focus:ring-2 focus:ring-green-300 focus:outline-none"
                  />
                </motion.div>
              </div>

              <motion.div variants={fadeInUp(1)}>
                <label className="text-sm font-semibold text-gray-700 flex justify-between">
                  <span>Trip Duration (days)</span>
                  <span className="font-bold text-orange-600">{days} days</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-lg bg-gray-200 h-2 accent-orange-500 focus:outline-none"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>1</span>
                  <span>15</span>
                  <span>30</span>
                </div>
              </motion.div>

              <motion.div className="relative" variants={fadeInUp(1.1)}>
                <Users className="absolute left-3 top-3.5 h-5 w-5 text-gray-600" />
                <input
                  type="number"
                  min="1"
                  value={people}
                  onChange={handlePeopleChange}
                  placeholder="Number of People"
                  aria-label="Number of People"
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-3 text-gray-800 placeholder:text-gray-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-300 focus:outline-none"
                />
              </motion.div>

              <motion.button
                className="w-full rounded-lg bg-gradient-to-r from-orange-500 via-white to-green-500 px-6 py-3 font-semibold text-gray-900 shadow-lg"
                variants={fadeInUp(1.2)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Planning
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
