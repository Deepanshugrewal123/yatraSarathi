/**
 * Itinerary Generator & Budget Calculation Engine for YatraSarathi
 *
 * 100% Deterministic & Frontend-Only.
 * Calculates transparent budget breakdowns and creates non-repeating day-by-day travel schedules
 * using verified destination landmarks, highlights, and cultural recommendations from destinations.js.
 */

// Budget multipliers relative to destination baseline pricing
export const BUDGET_MULTIPLIERS = {
  budget: 0.85,
  moderate: 1.0,
  premium: 1.45,
};

// Format numbers into Indian Rupee locale (e.g., 45,000)
export const formatINR = (amount) => {
  if (typeof amount !== "number" || isNaN(amount)) return "0";
  return new Intl.NumberFormat("en-IN").format(amount);
};

/**
 * Calculates deterministic budget breakdown based on destination baseline pricing.
 * Baseline price represents standard stay for destination.days and destination.peoples.
 * Breakdown categories: Stay 40% + Transport 25% + Food 20% + Activities 15% = 100%
 */
export const calculateBudget = (
  destination,
  days,
  travellers,
  budgetTier = "moderate"
) => {
  if (
    !destination ||
    !destination.price ||
    !destination.days ||
    !destination.peoples
  ) {
    return {
      total: 0,
      perPerson: 0,
      breakdown: { accommodation: 0, transport: 0, food: 0, activities: 0 },
      currency: "INR",
    };
  }

  const baseDays = Math.max(1, destination.days);
  const basePeoples = Math.max(1, destination.peoples);
  const baseDailyPerPerson = destination.price / (baseDays * basePeoples);

  const multiplier = BUDGET_MULTIPLIERS[budgetTier] || 1.0;
  const numDays = Math.max(1, Number(days) || 1);
  const numTravellers = Math.max(1, Number(travellers) || 1);

  // Total estimated budget rounded to nearest 100 to avoid fake precision
  const rawTotal = baseDailyPerPerson * multiplier * numDays * numTravellers;
  const total = Math.round(rawTotal / 100) * 100;
  const perPerson = Math.round(total / numTravellers);

  // Exact 100% category distribution:
  // Accommodation: 40% | Local Transport: 25% | Food & Dining: 20% | Activities & Sights: 15%
  const accommodation = Math.round(total * 0.4);
  const transport = Math.round(total * 0.25);
  const food = Math.round(total * 0.2);
  const activities = total - (accommodation + transport + food); // Exact balance guarantee

  return {
    total,
    perPerson,
    breakdown: {
      accommodation,
      transport,
      food,
      activities,
    },
    currency: "INR",
  };
};

/**
 * Themed daily schedule generator.
 * Creates contextual morning, afternoon, and evening time-slots
 * matching user travel style, interests, and actual destination sights without repeating attractions.
 */
export const generateItinerary = ({
  destination,
  days = 4,
  travellers = 2,
  budgetTier = "moderate",
  travelStyle = "Balanced",
  interests = [],
  variation = 0,
}) => {
  if (!destination) {
    throw new Error("A valid destination is required to generate an itinerary.");
  }

  const numDays = Math.max(1, Math.min(14, Number(days) || 4));
  const numTravellers = Math.max(1, Math.min(10, Number(travellers) || 2));

  // 1. Calculate estimated budget
  const pricing = calculateBudget(
    destination,
    numDays,
    numTravellers,
    budgetTier
  );

  // 2. Extract destination landmarks & highlights
  const baseAttractions =
    destination.attractions && destination.attractions.length > 0
      ? destination.attractions
      : [destination.name];

  const baseHighlights =
    destination.highlights && destination.highlights.length > 0
      ? destination.highlights
      : ["Scenic photography and local culture"];

  const destinationCity = destination.name.split(",")[0].trim();

  // Shift attractions by variation seed deterministically for the 'Regenerate' action
  const rotatedAttractions = [...baseAttractions];
  if (variation > 0) {
    const shift = variation % rotatedAttractions.length;
    for (let i = 0; i < shift; i++) {
      rotatedAttractions.push(rotatedAttractions.shift());
    }
  }

  // Queue of verified attractions to consume without repetition
  const attractionQueue = [...rotatedAttractions];

  // Secondary activities pool derived from destination highlights and tags
  // Used only after primary attractions are consumed, preventing duplicate landmark visits
  const secondaryHighlights = [...baseHighlights];

  const fallbackThematicActivities = [
    {
      title: `Artisan Handicrafts & Regional Bazaars`,
      desc: `Explore traditional artisan cooperatives and handicraft bazaars in ${destinationCity}, discovering local handlooms, pottery, and heritage crafts.`,
      loc: `${destinationCity} Traditional Market`,
      type: "culture",
      tag: "Artisan Crafts",
    },
    {
      title: `Local Culinary Trail & Regional Food Tasting`,
      desc: `Take a leisurely food trail through authentic family-run eateries to savor signature ${destination.state} regional dishes and sweets.`,
      loc: `${destinationCity} Old Town`,
      type: "dining",
      tag: "Food Trail",
    },
    {
      title: `Scenic Nature Trails & Panoramic Photography`,
      desc: `Embark on a tranquil morning nature trail along scenic viewpoints to capture breathtaking landscape photography.`,
      loc: `${destinationCity} Scenic Trail`,
      type: "nature",
      tag: "Nature Trail",
    },
    {
      title: `Village Heritage & Community Immersion`,
      desc: `Visit a nearby rural village to experience genuine local hospitality and observe traditional sustainable lifestyles.`,
      loc: `${destinationCity} Rural Belt`,
      type: "culture",
      tag: "Community Walk",
    },
    {
      title: `Quiet Leisure & Riverside Promenade Stroll`,
      desc: `Enjoy an unhurried afternoon relaxing beside local natural water bodies, parks, and charming village lanes.`,
      loc: `${destinationCity} Promenade`,
      type: "relaxation",
      tag: "Leisure Walk",
    },
  ];

  let fallbackIndex = 0;
  const getNextThematicActivity = () => {
    if (secondaryHighlights.length > 0) {
      const hl = secondaryHighlights.shift();
      return {
        title: `Experience: ${hl}`,
        desc: `Immerse yourself in ${hl.toLowerCase()} with a local guide, taking in authentic local traditions.`,
        loc: `${destinationCity} Surroundings`,
        type: "sightseeing",
        tag: "Local Experience",
      };
    }
    const act =
      fallbackThematicActivities[fallbackIndex % fallbackThematicActivities.length];
    fallbackIndex++;
    return act;
  };

  // 3. Build day-by-day itinerary
  const dailyPlans = [];

  for (let dayNum = 1; dayNum <= numDays; dayNum++) {
    const isFirstDay = dayNum === 1;
    const isLastDay = dayNum === numDays;

    let dayTheme;
    let morning;
    let afternoon;
    let evening;

    // A. SINGLE-DAY TRIP SPECIAL CASE
    if (numDays === 1) {
      dayTheme = `Day 1: Essential Highlights of ${destinationCity}`;
      const primeSight1 = attractionQueue.shift() || baseAttractions[0];
      const primeSight2 = attractionQueue.shift() || baseHighlights[0];
      const primeHighlight = baseHighlights[0];

      morning = {
        time: "08:30 AM – 12:30 PM",
        title: `Morning Landmark: ${primeSight1}`,
        description: `Start early to experience ${primeSight1} during the best morning lighting. Discover its architectural beauty and historic significance.`,
        location: primeSight1,
        type: "sightseeing",
        tag: "Must-See Sight",
      };

      afternoon = {
        time: "01:30 PM – 05:00 PM",
        title: `Afternoon Expedition: ${primeSight2}`,
        description: `After a regional lunch, head toward ${primeSight2}. Enjoy scenic viewpoints and cultural discovery.`,
        location: primeSight2,
        type: "culture",
        tag: "Sightseeing",
      };

      evening = {
        time: "05:30 PM – 08:30 PM",
        title: `Golden Hour Sunset & Traditional Dinner`,
        description: `${primeHighlight}. Conclude your single-day exploration with authentic ${destination.state} cuisine at a reputable local eatery.`,
        location: `${destinationCity} Promenade`,
        type: "dining",
        tag: "Sunset & Dinner",
      };
    }
    // B. MULTI-DAY TRIP
    else {
      // Day Theme
      if (isFirstDay) {
        dayTheme = `Day 1: Arrival & Welcome to ${destinationCity}`;
      } else if (isLastDay) {
        dayTheme = `Day ${dayNum}: Scenic Vistas & Farewell Memories`;
      } else if (dayNum === 2) {
        dayTheme = `Day 2: Iconic Landmarks & Cultural Trails`;
      } else if (dayNum === 3) {
        dayTheme = `Day 3: Nature, Heritage & Scenic Corners`;
      } else {
        dayTheme = `Day ${dayNum}: ${travelStyle} Adventures in ${destination.state}`;
      }

      // Morning Slot
      if (isFirstDay) {
        morning = {
          time: "08:30 AM – 12:30 PM",
          title: `Arrival, Check-in & Neighborhood Orientation`,
          description: `Arrive in ${destinationCity}, settle comfortably into your accommodations, and take a gentle orientation stroll around the local neighborhood.`,
          location: `${destinationCity} Center`,
          type: "relaxation",
          tag: "Arrival",
        };
      } else if (isLastDay) {
        // Last morning: visit a final landmark or panoramic vista
        if (attractionQueue.length > 0) {
          const finalAttraction = attractionQueue.shift();
          morning = {
            time: "08:30 AM – 12:00 PM",
            title: `Morning Sightseeing: ${finalAttraction}`,
            description: `Visit ${finalAttraction} for morning vistas, photography, and an unhurried stroll before your return journey.`,
            location: finalAttraction,
            type: "sightseeing",
            tag: "Final Landmark",
          };
        } else {
          morning = {
            time: "08:30 AM – 12:00 PM",
            title: `Panoramic Sunrise Viewpoint & Photography`,
            description: `Catch peaceful morning mountain/coastal breezes and capture last memorable photos of ${destinationCity}.`,
            location: `${destinationCity} Viewpoint`,
            type: "nature",
            tag: "Photography",
          };
        }
      } else {
        // Intermediate days morning: use remaining attractions first without repetition
        if (attractionQueue.length > 0) {
          const currentAttraction = attractionQueue.shift();
          morning = {
            time: "08:30 AM – 12:30 PM",
            title: `Morning Expedition: ${currentAttraction}`,
            description: `Start early to experience ${currentAttraction} with pleasant temperatures and fewer crowds. Soak in its cultural significance.`,
            location: currentAttraction,
            type: "sightseeing",
            tag: travelStyle === "Adventure" ? "Outdoor Trek" : "Sightseeing",
          };
        } else {
          const thematic = getNextThematicActivity();
          morning = {
            time: "08:30 AM – 12:30 PM",
            title: thematic.title,
            description: thematic.desc,
            location: thematic.loc,
            type: thematic.type,
            tag: thematic.tag,
          };
        }
      }

      // Afternoon Slot
      if (isLastDay) {
        afternoon = {
          time: "01:30 PM – 05:00 PM",
          title: `Artisan Souvenirs & Heritage Bazaars`,
          description: `Visit local artisan cooperatives to pick up authentic regional handicrafts, spices, and souvenirs while directly supporting local craftspeople.`,
          location: `${destinationCity} Traditional Market`,
          type: "culture",
          tag: "Souvenirs",
        };
      } else {
        // Use next attraction if available
        if (attractionQueue.length > 0) {
          const currentAttraction = attractionQueue.shift();
          afternoon = {
            time: "01:30 PM – 05:00 PM",
            title: `Afternoon Discovery: ${currentAttraction}`,
            description: `After a regional lunch, head toward ${currentAttraction}. Immerse yourself in panoramic surroundings, guided paths, and local heritage.`,
            location: currentAttraction,
            type: "culture",
            tag: travelStyle === "Relaxed" ? "Leisure Walk" : "Cultural Discovery",
          };
        } else {
          const thematic = getNextThematicActivity();
          afternoon = {
            time: "01:30 PM – 05:00 PM",
            title: thematic.title,
            description: thematic.desc,
            location: thematic.loc,
            type: thematic.type,
            tag: thematic.tag,
          };
        }
      }

      // Evening Slot
      if (isLastDay) {
        evening = {
          time: "05:30 PM – 08:30 PM",
          title: `Farewell Dinner & Cultural Night`,
          description: `Celebrate the final evening of your journey with a curated authentic dinner featuring local ${destination.state} regional specialties and music.`,
          location: `${destinationCity} Dining Promenade`,
          type: "dining",
          tag: "Farewell Dinner",
        };
      } else {
        const highlight =
          baseHighlights[(dayNum - 1 + variation) % baseHighlights.length];
        evening = {
          time: "05:30 PM – 08:30 PM",
          title: `Golden Hour Sunset & Evening Exploration`,
          description: `${highlight}. Unwind as twilight settles over the landscape, followed by dinner at a highly rated local eatery.`,
          location: `${destinationCity} Scenic Area`,
          type: "dining",
          tag: "Sunset & Dinner",
        };
      }
    }

    // Eco / Cultural Tip
    const ecoTips = [
      destination.culture ||
        "Respect sacred spaces and practice responsible tourism.",
      "Support local artisans directly by purchasing authentic handmade regional souvenirs.",
      "Carry reusable water containers and keep mountain and coastal trails completely plastic-free.",
      "Always seek courteous consent before photographing local villagers, monks, or elders.",
      "Savor locally sourced seasonal delicacies to encourage sustainable culinary heritage.",
    ];
    const ecoTip = ecoTips[(dayNum - 1 + variation) % ecoTips.length];

    dailyPlans.push({
      day: dayNum,
      theme: dayTheme,
      morning,
      afternoon,
      evening,
      ecoTip,
    });
  }

  return {
    id: `itin-${destination.id}-${numDays}d-${numTravellers}p-${budgetTier}-${variation}`,
    generatedAt: new Date().toISOString(),
    mode: "deterministic",
    destination,
    duration: numDays,
    travellers: numTravellers,
    budgetTier,
    travelStyle,
    interests: interests.length > 0 ? interests : destination.tags,
    pricing,
    days: dailyPlans,
  };
};
