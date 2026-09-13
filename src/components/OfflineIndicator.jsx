import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

/**
 * OfflineIndicator component
 *
 * Provides non-intrusive, accessible notifications of network connectivity changes.
 * - Displays a subtle notification pill when the user goes offline.
 * - Confirms restoration with a brief "Back Online" badge for 3 seconds.
 * - Zero visual clutter when online.
 */
export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(() => {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  });
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timer = null;

    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setShowBackOnline(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
      if (timer) clearTimeout(timer);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (isOnline && !showBackOnline) {
    return null;
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-[calc(100vw-2rem)] w-max"
    >
      {!isOnline ? (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl sm:rounded-full bg-slate-900/95 text-white shadow-xl border border-slate-700/80 backdrop-blur text-xs font-semibold tracking-wide animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="p-1 rounded-full bg-amber-500/20 text-amber-400 shrink-0">
            <WifiOff className="w-3.5 h-3.5" />
          </span>
          <span className="hidden sm:inline">
            Offline Mode — Standard planner, saved trips & route sequence available.
          </span>
          <span className="sm:hidden">
            Offline Mode — Standard planner active
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/95 text-white shadow-xl backdrop-blur text-xs font-semibold tracking-wide animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Wifi className="w-3.5 h-3.5" />
          <span>Back Online</span>
        </div>
      )}
    </aside>
  );
}
