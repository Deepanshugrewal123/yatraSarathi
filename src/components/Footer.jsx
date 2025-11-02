import React from "react";

export default function Footer() {
  const navLinks = [
    "Home",
    "Destination",
    "Features",
    "Hidden Gems",
    "How It Works",
    "Impact",
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-t from-gray-950 via-gray-900 to-gray-800 text-gray-300 pt-16 pb-8 rounded-t-3xl backdrop-blur-lg">
      {/* Floating glow orbs for ambiance */}
      <div className="absolute -top-10 right-10 h-40 w-40 bg-blue-500/20 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 left-10 h-32 w-32 bg-emerald-400/20 blur-3xl rounded-full animate-pulse"></div>

      <div className="relative container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* About Section */}
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-5">
              <span className="bg-gradient-to-r from-orange-400 via-white to-green-400 bg-clip-text text-transparent drop-shadow-md">
                YatraSarathi
              </span>
            </h2>
            <p className="text-base leading-relaxed mb-6 text-gray-400">
              Your AI-powered travel buddy. Plan smart, travel better, and
              explore sustainably with YatraSarathi.
            </p>

            {/* Social Icons */}
            <div className="flex space-x-5">
              {[
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-globe"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                      <path d="M2 12h20" />
                    </svg>
                  ),
                  link: "#",
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-facebook"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  ),
                  link: "#",
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-instagram"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.5" y1="6.5" y2="6.5" />
                    </svg>
                  ),
                  link: "#",
                },
              ].map(({ icon, link }, idx) => (
                <a
                  key={idx}
                  href={link}
                  className="text-gray-400 hover:text-blue-400 transition transform hover:scale-125 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4 border-b border-blue-400/40 inline-block pb-2">
              Quick Links
            </h3>
            <ul className="space-y-3 text-base">
              {navLinks.map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace(/\s/g, "")}`}
                    className="hover:text-blue-400 hover:translate-x-2 inline-block transition-all duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4 border-b border-blue-400/40 inline-block pb-2">
              Contact Us
            </h3>
            <div className="space-y-4 text-base text-gray-400">
              {[
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-400"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  ),
                  text: "New Delhi, India",
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-400"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-10 7L2 7" />
                    </svg>
                  ),
                  text: "support@yatrasarathi.com",
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-400"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12.81.34 1.59.63 2.34a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.74-1.74a2 2 0 0 1 2.11-.45c.75.29 1.53.51 2.34.63A2 2 0 0 1 22 16.92z" />
                    </svg>
                  ),
                  text: "+91 98765 43210",
                },
              ].map(({ icon, text }, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-3 hover:text-blue-400 transition-all duration-300"
                >
                  {icon}
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-gray-500 mt-12 border-t border-gray-700 pt-8">
          © {new Date().getFullYear()}{" "}
          <span className="text-blue-400 font-semibold">YatraSarathi</span>. All
          rights reserved.
        </div>
      </div>
    </footer>
  );
}
