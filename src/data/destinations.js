// Centralized Destination Data Source for YatraSarathi
// Curated destination dataset with structured regional information and public local imagery.
// Geographic coordinates represent regional centers and prominent landmarks.

export const destinations = [
  {
    id: "goa",
    name: "Goa, India",
    state: "Goa",
    category: "popular",
    badge: "Trending",
    price: 40000,
    priceDisplay: "40,000",
    budgetTier: "moderate",
    days: 5,
    peoples: 2,
    image: "/images/Goa.jpeg",
    tags: ["Beaches", "Nightlife", "Nature"],
    shortDescription: "Sun-kissed Arabian Sea coastline, Portuguese heritage architecture, and coastal serenity.",
    description: "Goa blends tropical coastal serenity with centuries of Indo-Portuguese history. Renowned for palm-fringed sandy shores, UNESCO-listed colonial basilicas in Old Goa, spice plantations, and fresh coastal cuisine, it offers a balanced escape for relaxation and exploration.",
    bestSeason: "November to February",
    travelStyle: "Coastal & Relaxation",
    location: {
      city: "Panaji",
      state: "Goa",
      country: "India",
      latitude: 15.4989,
      longitude: 73.8278,
    },
    attractions: ["Baga & Anjuna Beaches", "Fort Aguada", "Basilica of Bom Jesus", "Dudhsagar Waterfalls"],
    attractionLocations: [
      {
        id: "goa-baga",
        name: "Baga & Anjuna Beaches",
        latitude: 15.5553,
        longitude: 73.7517,
        label: "Baga Beach, North Goa",
      },
      {
        id: "goa-fort-aguada",
        name: "Fort Aguada",
        latitude: 15.492,
        longitude: 73.7737,
        label: "Fort Aguada, Candolim",
      },
      {
        id: "goa-basilica",
        name: "Basilica of Bom Jesus",
        latitude: 15.5009,
        longitude: 73.9116,
        label: "Basilica of Bom Jesus, Old Goa",
      },
      {
        id: "goa-dudhsagar",
        name: "Dudhsagar Waterfalls",
        latitude: 15.3144,
        longitude: 74.3143,
        label: "Dudhsagar Falls, Sonaulim",
      },
    ],
    highlights: ["Sunset beach strolls along golden sands", "Heritage walks through colorful Fontainhas quarters", "Authentic Goan coastal fish curry and spices", "Coastal cycling and dolphin observation cruises"],
    culture: "Vibrant blend of Konkani traditions and Portuguese architectural heritage. Respect beach environmental guidelines and local fishing communities."
  },
  {
    id: "jaipur",
    name: "Jaipur, Rajasthan",
    state: "Rajasthan",
    category: "popular",
    badge: "Trending",
    price: 30000,
    priceDisplay: "30,000",
    budgetTier: "budget",
    days: 4,
    peoples: 3,
    image: "/images/Jaipur.jpeg",
    tags: ["Heritage", "History", "Culture"],
    shortDescription: "The Pink City of majestic Rajput fortresses, royal palaces, and vibrant handicraft bazaars.",
    description: "Jaipur is the storied capital of Rajasthan, famous for its distinctive terracotta-pink stone facades, UNESCO-listed hilltop forts, the astronomical wonders of Jantar Mantar, and multi-generational artisan bazaars renowned for block printing, blue pottery, and gems.",
    bestSeason: "October to March",
    travelStyle: "Heritage & Royal Culture",
    location: {
      city: "Jaipur",
      state: "Rajasthan",
      country: "India",
      latitude: 26.9124,
      longitude: 75.7873,
    },
    attractions: ["Amer Fort", "Hawa Mahal", "City Palace", "Jantar Mantar", "Nahargarh Fort"],
    attractionLocations: [
      {
        id: "jaipur-amer-fort",
        name: "Amer Fort",
        latitude: 26.9855,
        longitude: 75.8513,
        label: "Amer Fort, Devisinghpura",
      },
      {
        id: "jaipur-hawa-mahal",
        name: "Hawa Mahal",
        latitude: 26.9239,
        longitude: 75.8267,
        label: "Hawa Mahal, Badi Choupad",
      },
      {
        id: "jaipur-city-palace",
        name: "City Palace",
        latitude: 26.9258,
        longitude: 75.8237,
        label: "City Palace, J.D.A. Market",
      },
      {
        id: "jaipur-jantar-mantar",
        name: "Jantar Mantar",
        latitude: 26.9248,
        longitude: 75.8246,
        label: "Jantar Mantar Observatory",
      },
      {
        id: "jaipur-nahargarh",
        name: "Nahargarh Fort",
        latitude: 26.9373,
        longitude: 75.8155,
        label: "Nahargarh Fort, Aravalli Hills",
      },
    ],
    highlights: ["Panoramic desert city views from Amer Fort ramparts", "Traditional Rajasthani thali dining experience", "Exploring colorful Johari and Bapu Bazaars", "Observing artisanal block-printing and jewelry craft"],
    culture: "Steeped in royal Rajput traditions and legendary hospitality. Dress respectfully when visiting temple sites, stepwells, and historical monuments."
  },
  {
    id: "alleppey",
    name: "Alleppey, Kerala",
    state: "Kerala",
    category: "popular",
    badge: "Trending",
    price: 55000,
    priceDisplay: "55,000",
    budgetTier: "premium",
    days: 7,
    peoples: 2,
    image: "/images/Kerala.jpeg",
    tags: ["Backwaters", "Ayurveda", "Wildlife"],
    shortDescription: "The Venice of the East, famed for tranquil palm-fringed canals, houseboats, and Ayurvedic retreats.",
    description: "Alappuzha (Alleppey) is the center of Kerala's serene backwaters. Glide through palm-canopied waterways on traditional thatched Kettuvallam houseboats, explore quiet rural hamlets bordered by emerald paddy fields, and rejuvenate with traditional Ayurvedic treatments.",
    bestSeason: "September to March",
    travelStyle: "Eco-Tourism & Wellness",
    location: {
      city: "Alappuzha",
      state: "Kerala",
      country: "India",
      latitude: 9.4981,
      longitude: 76.3388,
    },
    attractions: ["Vembanad Lake Backwaters", "Marari Beach", "Alappuzha Lighthouse", "Kuttanad Below-Sea Paddy Fields"],
    attractionLocations: [
      {
        id: "alleppey-vembanad",
        name: "Vembanad Lake Backwaters",
        latitude: 9.5833,
        longitude: 76.4167,
        label: "Vembanad Lake, Muhamma",
      },
      {
        id: "alleppey-marari",
        name: "Marari Beach",
        latitude: 9.6,
        longitude: 76.2996,
        label: "Marari Beach, Mararikulam",
      },
      {
        id: "alleppey-lighthouse",
        name: "Alappuzha Lighthouse",
        latitude: 9.495,
        longitude: 76.3197,
        label: "Alappuzha Lighthouse, Sea View",
      },
      {
        id: "alleppey-kuttanad",
        name: "Kuttanad Below-Sea Paddy Fields",
        latitude: 9.4,
        longitude: 76.45,
        label: "Kuttanad Delta Region",
      },
    ],
    highlights: ["Overnight tranquil backwater cruise on an eco-friendly houseboat", "Authentic traditional Ayurvedic massage and herbal wellness", "Village coir-making and weaving demonstrations", "Freshly caught Karimeen Pollichathu backwater dining"],
    culture: "Gentle Malayali traditions rooted in ecological mindfulness. Please avoid disposing single-use plastics into backwater canals."
  },
  {
    id: "shimla",
    name: "Shimla, Himachal",
    state: "Himachal Pradesh",
    category: "popular",
    badge: "Trending",
    price: 28000,
    priceDisplay: "28,000",
    budgetTier: "budget",
    days: 5,
    peoples: 4,
    image: "/images/Shimla.jpeg",
    tags: ["Hills", "Adventure", "Nature"],
    shortDescription: "Historic Himalayan hill capital surrounded by fragrant deodar forests and snow-crowned peaks.",
    description: "Perched along an amphitheater ridge in the lower Himalayas, Shimla is celebrated for its British colonial architecture, the pedestrianized Ridge and Mall Road, the historic Kalka-Shimla mountain toy train, and pine-scented nature trails leading toward Kufri.",
    bestSeason: "March to June & December to January",
    travelStyle: "Mountain & Adventure",
    location: {
      city: "Shimla",
      state: "Himachal Pradesh",
      country: "India",
      latitude: 31.1048,
      longitude: 77.1734,
    },
    attractions: ["The Ridge & Mall Road", "Jakhoo Hanuman Temple", "Kalka-Shimla Heritage Railway", "Kufri Nature & Snow Point"],
    attractionLocations: [
      {
        id: "shimla-ridge",
        name: "The Ridge & Mall Road",
        latitude: 31.1051,
        longitude: 77.1752,
        label: "The Ridge, Shimla",
      },
      {
        id: "shimla-jakhoo",
        name: "Jakhoo Hanuman Temple",
        latitude: 31.1011,
        longitude: 77.1842,
        label: "Jakhoo Hill, Shimla",
      },
      {
        id: "shimla-toy-train",
        name: "Kalka-Shimla Heritage Railway",
        latitude: 31.103,
        longitude: 77.165,
        label: "Shimla Railway Station",
      },
      {
        id: "shimla-kufri",
        name: "Kufri Nature & Snow Point",
        latitude: 31.0984,
        longitude: 77.2682,
        label: "Kufri Hill Station",
      },
    ],
    highlights: ["Scenic mountain journey aboard the historic UNESCO toy train", "Crisp deodar forest walks and panoramic Himalayan viewpoints", "Visiting the iconic Christ Church on the Ridge", "Local Himachali cuisine and warm mountain teas"],
    culture: "Peaceful Pahari hospitality. Respect clean mountain trail initiatives and protect sensitive Himalayan flora."
  },
  {
    id: "laitlum",
    name: "Laitlum, Meghalaya",
    state: "Meghalaya",
    category: "hidden-gem",
    badge: "Hidden Gem",
    price: 38000,
    priceDisplay: "38,000",
    budgetTier: "moderate",
    days: 2,
    peoples: 2,
    image: "/images/Laitlum.jpg",
    tags: ["Valley", "Waterfalls", "Scenic"],
    shortDescription: "Breath-taking misty canyon ravines perched on the edge of the East Khasi Hills.",
    description: "Laitlum Canyons, translating to 'End of the Hills', is one of Meghalaya's most dramatic natural viewpoints. Perched above verdant valleys and sheer cliffs, this serene sanctuary offers sweeping panorama views, misty mountain trails, and a rare escape from tourist crowds.",
    bestSeason: "October to April",
    travelStyle: "Scenic Landscapes & Trekking",
    location: {
      city: "Shillong",
      state: "Meghalaya",
      country: "India",
      latitude: 25.4497,
      longitude: 91.9056,
    },
    attractions: ["Laitlum Canyon Viewpoint", "Smit Cultural Village", "Rasong Step Trail", "Laitlum Gorge Edge"],
    attractionLocations: [
      {
        id: "laitlum-canyon",
        name: "Laitlum Canyon Viewpoint",
        latitude: 25.4497,
        longitude: 91.9056,
        label: "Laitlum Canyons, East Khasi Hills",
      },
      {
        id: "laitlum-smit",
        name: "Smit Cultural Village",
        latitude: 25.5,
        longitude: 91.9167,
        label: "Smit Royal Seat, Meghalaya",
      },
      {
        id: "laitlum-rasong",
        name: "Rasong Step Trail",
        latitude: 25.451,
        longitude: 91.904,
        label: "Rasong Steps Canyon Path",
      },
      {
        id: "laitlum-gorge",
        name: "Laitlum Gorge Edge",
        latitude: 25.4485,
        longitude: 91.9065,
        label: "Laitlum Gorge View",
      },
    ],
    highlights: ["Standing atop dramatic misty gorge cliffs with rolling clouds", "Trekking the ancient 3,000-step stone stairway down to the valley", "Panoramic photography of undisturbed green ravines", "Experiencing calm mountain breezes and pristine skies"],
    culture: "Revered by the indigenous Khasi community. Practice Leave No Trace principles and strictly avoid littering along canyon edges."
  },
  {
    id: "hampi",
    name: "Hampi, Karnataka",
    state: "Karnataka",
    category: "hidden-gem",
    badge: "Hidden Gem",
    price: 40000,
    priceDisplay: "40,000",
    budgetTier: "moderate",
    days: 3,
    peoples: 2,
    image: "/images/Hampi.jpg",
    tags: ["Heritage", "Ruins", "River"],
    shortDescription: "Surreal open-air museum of granite boulders and ruins of the 14th-century Vijayanagara Empire.",
    description: "Hampi is a UNESCO World Heritage site set across a spellbinding landscape of giant monolithic boulders and the Tungabhadra River. The vast ruins comprise intricately carved royal pavilions, soaring gopurams, musical stone pillared halls, and ancient bazaar streets.",
    bestSeason: "October to February",
    travelStyle: "Archaeological & Heritage Discovery",
    location: {
      city: "Hampi",
      state: "Karnataka",
      country: "India",
      latitude: 15.335,
      longitude: 76.46,
    },
    attractions: ["Virupaksha Temple", "Vittala Temple Stone Chariot", "Matanga Hill Sunset Point", "Hemakuta Hill", "Anegundi Village"],
    attractionLocations: [
      {
        id: "hampi-virupaksha",
        name: "Virupaksha Temple",
        latitude: 15.3353,
        longitude: 76.4601,
        label: "Virupaksha Temple, Hampi",
      },
      {
        id: "hampi-vittala",
        name: "Vittala Temple Stone Chariot",
        latitude: 15.3392,
        longitude: 76.4795,
        label: "Vittala Temple Complex",
      },
      {
        id: "hampi-matanga",
        name: "Matanga Hill Sunset Point",
        latitude: 15.3325,
        longitude: 76.4678,
        label: "Matanga Hill Peak",
      },
      {
        id: "hampi-hemakuta",
        name: "Hemakuta Hill",
        latitude: 15.334,
        longitude: 76.459,
        label: "Hemakuta Hill Temples",
      },
      {
        id: "hampi-anegundi",
        name: "Anegundi Village",
        latitude: 15.3524,
        longitude: 76.4956,
        label: "Anegundi Historic Village",
      },
    ],
    highlights: ["Exploring ancient boulder trails and temples by bicycle", "Catching sunrise or sunset from the peak of Matanga Hill", "Traditional round coracle boat ride along the Tungabhadra River", "Admiring the iconic monolithic Stone Chariot"],
    culture: "An active sacred pilgrimage site for over a millennium. Dress modestly inside temple enclosures and do not climb or touch fragile ancient carvings."
  },
  {
    id: "laitmawsiang",
    name: "Laitmawsiang, Meghalaya",
    state: "Meghalaya",
    category: "hidden-gem",
    badge: "Hidden Gem",
    price: 30000,
    priceDisplay: "30,000",
    budgetTier: "budget",
    days: 3,
    peoples: 3,
    image: "/images/Laitmawsiang.jpg",
    tags: ["Hills", "Village", "Waterfalls", "Scenic"],
    shortDescription: "Enchanting forest sanctuary of subterranean waterfalls, limestone caves, and natural pools.",
    description: "Nestled near Sohra (Cherrapunji), Laitmawsiang is celebrated for the magical Garden of Caves (Ka Bri Synrang). The site features natural limestone rock shelters, sparkling underground spring pools, and curtains of waterfalls concealed beneath lush subtropical foliage.",
    bestSeason: "September to May",
    travelStyle: "Eco-Village & Nature",
    location: {
      city: "Cherrapunji",
      state: "Meghalaya",
      country: "India",
      latitude: 25.3267,
      longitude: 91.7348,
    },
    attractions: ["Garden of Caves (Ka Bri Synrang)", "Sum Syiem Falls", "Arwah Cave System", "Sohra Plateau Rim"],
    attractionLocations: [
      {
        id: "laitmawsiang-garden-caves",
        name: "Garden of Caves (Ka Bri Synrang)",
        latitude: 25.3267,
        longitude: 91.7348,
        label: "Ka Bri Synrang, Laitmawsiang",
      },
      {
        id: "laitmawsiang-sum-syiem",
        name: "Sum Syiem Falls",
        latitude: 25.33,
        longitude: 91.73,
        label: "Sum Syiem Falls, Meghalaya",
      },
      {
        id: "laitmawsiang-arwah",
        name: "Arwah Cave System",
        latitude: 25.2917,
        longitude: 91.7083,
        label: "Arwah Cave, Sohra",
      },
      {
        id: "laitmawsiang-plateau",
        name: "Sohra Plateau Rim",
        latitude: 25.27,
        longitude: 91.72,
        label: "Cherrapunji Plateau View",
      },
    ],
    highlights: ["Walking along stone trails behind natural curtain waterfalls", "Exploring ancient natural limestone formations and caverns", "Cooling off beside pristine spring pools inside the rainforest", "Experiencing genuine Khasi village homestay warmth"],
    culture: "Managed by the local village community councils (Dorbar Shnong). Support local guides and preserve forest purity."
  },
  {
    id: "dzukou-valley",
    name: "Dzukou Valley, Nagaland",
    state: "Nagaland",
    category: "hidden-gem",
    badge: "Hidden Gem",
    price: 34000,
    priceDisplay: "34,000",
    budgetTier: "moderate",
    days: 4,
    peoples: 2,
    image: "/images/DzukouValley.jpeg",
    tags: ["Valley", "Trekking", "Flowers"],
    shortDescription: "The Valley of Celestial Flowers, a rolling high-altitude meadow straddling Nagaland and Manipur.",
    description: "Dzukou Valley sits at 2,452 meters above sea level, famed for its sweeping emerald hillocks, icy natural brooks, and the rare endemic Dzukou Lily. It is widely considered one of Northeast India's premier pristine trekking and wilderness camping destinations.",
    bestSeason: "June to September & October to March",
    travelStyle: "Wilderness Trekking & Camping",
    location: {
      city: "Kohima",
      state: "Nagaland",
      country: "India",
      latitude: 25.56,
      longitude: 94.06,
    },
    attractions: ["Dzukou Valley Trail", "Viswema & Jakhama Trek Approaches", "Dzukou River Stream", "Natural Ghost Rock Caves"],
    attractionLocations: [
      {
        id: "dzukou-trail",
        name: "Dzukou Valley Trail",
        latitude: 25.56,
        longitude: 94.06,
        label: "Dzukou Valley Main Trail",
      },
      {
        id: "dzukou-viswema",
        name: "Viswema & Jakhama Trek Approaches",
        latitude: 25.58,
        longitude: 94.13,
        label: "Viswema Trek Trailhead",
      },
      {
        id: "dzukou-river",
        name: "Dzukou River Stream",
        latitude: 25.555,
        longitude: 94.058,
        label: "Dzukou Valley Brook",
      },
      {
        id: "dzukou-caves",
        name: "Natural Ghost Rock Caves",
        latitude: 25.565,
        longitude: 94.065,
        label: "Dzukou Natural Caves",
      },
    ],
    highlights: ["Camping under starry mountain skies in undulating emerald meadows", "Witnessing wild blooms of seasonal lilies, rhododendrons, and aconitum", "Crossing crystal-clear natural bamboo stream beds", "Trekking alongside warm Angami Naga guides"],
    culture: "Declared a protected plastic-free zone by the Southern Angami Youth Organization (SAYO). Strict zero-plastic and carry-your-trash rules apply."
  },
  {
    id: "ziro-valley",
    name: "Ziro Valley, Arunachal Pradesh",
    state: "Arunachal Pradesh",
    category: "hidden-gem",
    badge: "Hidden Gem",
    price: 32000,
    priceDisplay: "32,000",
    budgetTier: "moderate",
    days: 4,
    peoples: 2,
    image: "/images/ZiroValley.jpg",
    tags: ["Valley", "Music Festival", "Tribes"],
    shortDescription: "UNESCO-proposed green plateau renowned for pine hills, rice-fish wetlands, and Apatani culture.",
    description: "Ziro Valley is a cultural and ecological treasure in the lower Subansiri district of Arunachal Pradesh. Celebrated for the indigenous Apatani tribe's sustainable wet-rice and fish agro-ecology, traditional bamboo houses, and the annual outdoor Ziro Festival of Music.",
    bestSeason: "March to October",
    travelStyle: "Cultural Heritage & Eco-Tourism",
    location: {
      city: "Ziro",
      state: "Arunachal Pradesh",
      country: "India",
      latitude: 27.53,
      longitude: 93.83,
    },
    attractions: ["Hong & Hari Apatani Villages", "Tarin High-Altitude Fish Farm", "Kardo Shiva Temple Lingam", "Talley Valley Wildlife Sanctuary"],
    attractionLocations: [
      {
        id: "ziro-apatani",
        name: "Hong & Hari Apatani Villages",
        latitude: 27.525,
        longitude: 93.835,
        label: "Hong & Hari Villages, Ziro",
      },
      {
        id: "ziro-fish-farm",
        name: "Tarin High-Altitude Fish Farm",
        latitude: 27.54,
        longitude: 93.82,
        label: "Tarin Fish Farm, Bulla",
      },
      {
        id: "ziro-shiva",
        name: "Kardo Shiva Temple Lingam",
        latitude: 27.55,
        longitude: 93.84,
        label: "Kardo Shiva Temple",
      },
      {
        id: "ziro-talley",
        name: "Talley Valley Wildlife Sanctuary",
        latitude: 27.53,
        longitude: 93.9,
        label: "Talley Valley Sanctuary",
      },
    ],
    highlights: ["Walking through sustainable rice-fish paddy wetlands flanked by pines", "Visiting traditional wooden stilt houses and bamboo groves", "Experiencing the vibrant eco-friendly outdoor Ziro Festival of Music", "Learning ancient sustainable land management from village elders"],
    culture: "Deep respect for indigenous Apatani spiritual customs and Donyi-Polo traditions. Always request permission before photographing community elders."
  }
];

export const getAllDestinations = () => destinations;

export const getPopularDestinations = () =>
  destinations.filter((d) => d.category === "popular");

export const getHiddenGems = () =>
  destinations.filter((d) => d.category === "hidden-gem");

export const getAllStates = () => [
  "All States",
  ...Array.from(new Set(destinations.map((d) => d.state))).sort()
];

export const getAllTags = () => {
  const tagsSet = new Set();
  destinations.forEach((d) => d.tags.forEach((tag) => tagsSet.add(tag)));
  return Array.from(tagsSet).sort();
};

export const BUDGET_TIERS = [
  { id: "all", label: "All Budgets" },
  { id: "budget", label: "Budget (<= ₹30k)", max: 30000 },
  { id: "moderate", label: "Moderate (₹30k – ₹45k)", min: 30001, max: 45000 },
  { id: "premium", label: "Premium (> ₹45k)", min: 45001 }
];

export const CATEGORY_OPTIONS = [
  { id: "all", label: "All Places" },
  { id: "popular", label: "Popular Destinations" },
  { id: "hidden-gem", label: "Hidden Gems" }
];

export const PLANNER_BUDGET_TIERS = [
  { id: "budget", label: "Budget", desc: "Economical stays & transit", multiplier: 0.85 },
  { id: "moderate", label: "Moderate", desc: "Balanced comfort & prime sights", multiplier: 1.0 },
  { id: "premium", label: "Premium", desc: "Curated stays & experiences", multiplier: 1.45 }
];

export const TRAVEL_STYLES = [
  "Balanced",
  "Relaxed",
  "Adventure",
  "Culture",
  "Nature"
];

export const INTEREST_OPTIONS = [
  "Beaches",
  "Heritage",
  "Nature",
  "Trekking",
  "Culture",
  "Wildlife",
  "Hills",
  "Valleys"
];

export const getDestinationById = (id) =>
  destinations.find((d) => d.id === id) || null;
