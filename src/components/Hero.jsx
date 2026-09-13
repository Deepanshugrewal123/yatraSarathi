import { Plane, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import PlannerForm from "./PlannerForm";

export default function Hero({ onGenerate, prefill, isGenerating }) {
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
        className="absolute top-10 left-10 h-72 w-72 bg-orange-300/40 rounded-full blur-3xl pointer-events-none"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-96 w-96 bg-green-300/40 rounded-full blur-3xl pointer-events-none"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative z-10 mx-auto flex flex-col lg:flex-row items-center lg:justify-between gap-10 px-6 md:px-12">
        {/* LEFT: IMAGE COLLAGE SECTION */}
        <motion.div
          className="relative flex-1 flex justify-center lg:justify-start w-full"
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 70, damping: 12, delay: 0.2 }}
        >
          <div className="relative w-full max-w-lg h-[320px] md:h-[420px] flex justify-center items-center">
            {/* Main Image */}
            <motion.img
              src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1200&auto=format&fit=crop"
              alt="Taj Mahal, Agra"
              loading="eager"
              className="w-[90%] h-[90%] object-cover rounded-3xl shadow-2xl border border-white/50"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Floating small cards (only on md and up) */}
            <motion.img
              src="https://madhutourism.com/wp-content/uploads/2022/01/kashi.jpg"
              alt="Varanasi Ghats"
              loading="lazy"
              className="hidden md:block absolute bottom-6 left-0 w-40 h-28 rounded-xl object-cover shadow-lg border border-white/50"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.img
              src="https://i.ytimg.com/vi/KpkiH7JLkLg/maxresdefault.jpg"
              alt="Himalayan Mountain Peaks"
              loading="lazy"
              className="hidden md:block absolute top-6 right-0 w-44 h-32 rounded-xl object-cover shadow-lg border border-white/50"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Floating Plane Animation */}
            <motion.div
              className="absolute top-[-30px] right-[-40px] hidden md:block pointer-events-none"
              animate={{ x: [0, 25, 0], y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Plane className="h-10 w-10 text-orange-600 rotate-12 opacity-80" />
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT: TEXT + SMART PLANNER FORM SECTION */}
        <motion.div
          className="flex-1 text-center lg:text-left w-full lg:max-w-xl"
          variants={fadeInUp(0.3)}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900"
            variants={fadeInUp(0.3)}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-green-500 to-emerald-600">
              YatraSarathi
            </span>
            : India’s Smart Tourism Companion
          </motion.h1>

          <motion.p
            className="mt-4 text-base md:text-lg text-gray-700 leading-relaxed"
            variants={fadeInUp(0.4)}
          >
            Personalized, budget-friendly, and eco-conscious trip planning in
            one trusted app. Empowering travellers with transparent itineraries
            and supporting local communities.
          </motion.p>

          {/* SMART PLANNER FORM CARD */}
          <motion.div
            id="planner"
            className="mt-8 w-full rounded-3xl bg-white/80 border border-white/70 p-5 sm:p-7 shadow-2xl backdrop-blur-xl"
            variants={fadeInUp(0.5)}
          >
            <div className="mb-4 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                Smart Trip Planner
              </span>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 mt-2">
                Plan Your Journey in Seconds
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Select your destination & preferences for a personalized, transparent day-by-day itinerary.
              </p>
            </div>

            <PlannerForm
              onGenerate={onGenerate}
              prefill={prefill}
              isGenerating={isGenerating}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
