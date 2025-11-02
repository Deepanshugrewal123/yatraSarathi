import React, { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const listVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, type: "spring", stiffness: 70 },
    }),
  };

  const mobileMenuVariants = {
    hidden: { y: "-100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.35, ease: "easeInOut" },
    },
    exit: {
      y: "-100%",
      opacity: 0,
      transition: { duration: 0.25, ease: "easeInOut" },
    },
  };

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Destinations", href: "#destination" },
    { name: "Hidden Gems", href: "#hiddengems" },
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#howitworks" },
    { name: "Impact", href: "#home" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/20 backdrop-blur-xl border-b border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
          : "bg-white/10 backdrop-blur-lg border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center py-3.5 px-6 md:px-10">
        {/* 🇮🇳 Logo with Indian Tricolor Gradient */}
        <div className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-green-500 to-emerald-600 bg-clip-text text-transparent drop-shadow-sm">
          YatraSarathi
        </div>

        {/* 🧭 Desktop Links */}
        <ul className="hidden md:flex items-center space-x-6 text-gray-800 font-medium">
          {navLinks.map((item, index) => (
            <motion.li
              key={item.name}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={listVariants}
              whileHover={{ y: -2 }}
            >
              <a
                href={item.href}
                className="relative px-4 py-2 rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-400 hover:to-green-400 hover:text-white backdrop-blur-sm"
              >
                {item.name}
              </a>
            </motion.li>
          ))}
        </ul>

        {/* ✈️ CTA Button */}
        <div className="hidden md:flex">
          <a
            href="#plantrip"
            className="ml-4 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-green-600 text-white font-semibold shadow-lg shadow-orange-400/30 hover:scale-105 hover:shadow-green-400/30 transition-transform duration-300"
          >
            Plan Your Trip
          </a>
        </div>

        {/* 🍔 Mobile Menu Button */}
        <div className="md:hidden">
          <button
            className="text-gray-800 focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle mobile menu"
          >
            {isOpen ? (
              <X className="h-7 w-7 text-gray-800" />
            ) : (
              <Menu className="h-7 w-7 text-gray-800" />
            )}
          </button>
        </div>
      </div>

      {/* 📱 Mobile Menu with Outside Click Close */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-30 bg-black/20 md:hidden">
            <motion.div
              ref={menuRef}
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-0 left-0 w-full bg-white  border-b border-white/30 shadow-lg"
            >
              <ul className="flex flex-col items-center py-6 space-y-4 text-gray-800 font-medium">
                {navLinks.map((item, index) => (
                  <motion.li
                    key={item.name}
                    custom={index}
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => setIsOpen(false)}
                  >
                    <a
                      href={item.href}
                      className="block text-lg px-5 py-2 rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-400 hover:to-green-400 hover:text-white"
                    >
                      {item.name}
                    </a>
                  </motion.li>
                ))}
                <a
                  href="#plantrip"
                  onClick={() => setIsOpen(false)}
                  className="mt-3 px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-green-600 text-white font-semibold shadow-lg shadow-orange-400/20 hover:scale-105 transition-transform duration-300"
                >
                  Plan Your Trip
                </a>
              </ul>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
}
