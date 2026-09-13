import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ItineraryView from "./components/ItineraryView";
import PopularDestinations from "./components/Destination";
import HiddenGems from "./components/HiddenGems";
import MyTrips from "./components/MyTrips";
import MyFavorites from "./components/MyFavorites";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Impact from "./components/Impact";
import Footer from "./components/Footer";
import OfflineIndicator from "./components/OfflineIndicator";
import { generateSmartItinerary, regenerateVariation } from "./services/aiService";
import { generateItinerary } from "./utils/itineraryGenerator";
import {
  getSavedTrips,
  saveTrip,
  deleteTrip,
  isTripSaved,
  getFavorites,
  toggleFavorite,
} from "./utils/storage";

function App() {
  const [plannerPrefill, setPlannerPrefill] = useState(null);
  const [activeItinerary, setActiveItinerary] = useState(null);
  const [currentPlanParams, setCurrentPlanParams] = useState(null);
  const [variationCount, setVariationCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Persistence State
  const [savedTrips, setSavedTrips] = useState(() => getSavedTrips());
  const [favorites, setFavorites] = useState(() => getFavorites());

  const handleGenerateItinerary = async (params) => {
    setCurrentPlanParams(params);
    setVariationCount(0);
    setIsGenerating(true);

    try {
      const result = await generateSmartItinerary(params);
      setActiveItinerary({
        ...result.itinerary,
        notice: result.notice || result.itinerary?.notice || null,
      });
    } catch (err) {
      console.warn("[App] AI generation failed, falling back to deterministic plan:", err);
      const fallbackPlan = generateItinerary({ ...params, variation: 0 });
      setActiveItinerary({
        ...fallbackPlan,
        mode: "deterministic",
        notice: "Displaying verified standard plan.",
      });
    } finally {
      setIsGenerating(false);
    }

    // Smooth scroll down to generated itinerary results
    setTimeout(() => {
      const resultsEl = document.getElementById("itinerary-results");
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleRegenerateItinerary = () => {
    if (!currentPlanParams) return;
    const nextVariation = variationCount + 1;
    setVariationCount(nextVariation);
    const result = regenerateVariation(currentPlanParams, nextVariation);
    setActiveItinerary(result.itinerary);
  };

  const handleEditPreferences = (itinerary) => {
    if (itinerary && itinerary.destination) {
      setPlannerPrefill({
        ...itinerary.destination,
        days: itinerary.duration,
        peoples: itinerary.travellers,
        budgetTier: itinerary.budgetTier,
        travelStyle: itinerary.travelStyle,
        tags: itinerary.interests || itinerary.destination.tags || [],
      });
    }
    const plannerEl = document.getElementById("planner");
    if (plannerEl) {
      plannerEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handlePlanTripPrefill = (destination) => {
    setPlannerPrefill(destination);
    const plannerEl = document.getElementById("planner");
    if (plannerEl) {
      plannerEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Saved Trips Handlers
  const handleSaveTrip = (itinerary) => {
    const result = saveTrip(itinerary);
    if (result.success) {
      setSavedTrips(getSavedTrips());
    }
    return result;
  };

  const handleDeleteTrip = (tripId) => {
    const success = deleteTrip(tripId);
    if (success) {
      setSavedTrips(getSavedTrips());
    }
  };

  const handleViewSavedTrip = (trip) => {
    setActiveItinerary(trip);
    setCurrentPlanParams({
      destination: trip.destination,
      days: trip.duration,
      peoples: trip.travellers,
      budgetTier: trip.budgetTier,
      travelStyle: trip.travelStyle,
      interests: trip.interests || [],
    });
    setTimeout(() => {
      const resultsEl = document.getElementById("itinerary-results");
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleModifySavedTrip = (trip) => {
    setPlannerPrefill({
      ...trip.destination,
      days: trip.duration,
      peoples: trip.travellers,
      budgetTier: trip.budgetTier,
      travelStyle: trip.travelStyle,
      tags: trip.interests || trip.destination?.tags || [],
    });
    const plannerEl = document.getElementById("planner");
    if (plannerEl) {
      plannerEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Favorites Handlers
  const handleToggleFavorite = (destId) => {
    const { favorites: updatedFavs } = toggleFavorite(destId);
    setFavorites(updatedFavs);
  };

  const activeIsSaved = activeItinerary ? isTripSaved(activeItinerary) : false;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-900">
      <Navbar
        savedTripsCount={savedTrips.length}
        favoritesCount={favorites.length}
      />
      <main className="flex-grow">
        <Hero
          onGenerate={handleGenerateItinerary}
          prefill={plannerPrefill}
          isGenerating={isGenerating}
        />
        {activeItinerary && (
          <ItineraryView
            itinerary={activeItinerary}
            onEdit={handleEditPreferences}
            onRegenerate={handleRegenerateItinerary}
            onClose={() => setActiveItinerary(null)}
            onSaveTrip={handleSaveTrip}
            isSaved={activeIsSaved}
          />
        )}
        <MyTrips
          trips={savedTrips}
          onViewTrip={handleViewSavedTrip}
          onModifyTrip={handleModifySavedTrip}
          onDeleteTrip={handleDeleteTrip}
          onSaveTrip={handleSaveTrip}
        />
        <PopularDestinations
          onPlanTrip={handlePlanTripPrefill}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />
        <HiddenGems
          onPlanTrip={handlePlanTripPrefill}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />
        <MyFavorites
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onPlanTrip={handlePlanTripPrefill}
        />
        <Features />
        <HowItWorks />
        <Impact />
      </main>
      <OfflineIndicator />
      <Footer />
    </div>
  );
}

export default App;
