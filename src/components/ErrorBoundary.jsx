import { Component } from "react";
import { Compass, RefreshCw, Home } from "lucide-react";

/**
 * Application-level React Error Boundary for YatraSarathi.
 *
 * Catches unhandled rendering errors in child component trees,
 * displays a friendly recovery UI with brand identity,
 * and ensures raw JavaScript stack traces are never exposed to end-users.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.handleReset = this.handleReset.bind(this);
    this.handleReload = this.handleReload.bind(this);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Safely log internally without exposing secrets or leaking to UI
    if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
      console.error("[YatraSarathi ErrorBoundary] Uncaught rendering exception:", error, errorInfo);
    }
  }

  handleReset() {
    this.setState({ hasError: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  handleReload() {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-[50vh] flex items-center justify-center p-6 bg-slate-50 text-gray-900"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 text-center relative overflow-hidden">
            {/* Top tricolor gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-600" />

            <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Compass className="w-8 h-8" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Something went off course
            </h2>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              We encountered an unexpected issue while preparing your travel plan.
              Your saved trips, favorites, and preferences are safe in your browser.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-green-600 text-white font-bold text-sm shadow-md hover:scale-105 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white border border-gray-300 text-gray-700 font-bold text-sm shadow-xs hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4 text-gray-600" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
