import { UserProfile } from '../types';

export const MOCK_USERS: UserProfile[] = [
  {
    id: "user-01",
    name: "Alex Rivera",
    email: "alex.rivera@techdev.io",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    persona: "Audiophile & Software Engineer",
    badge: "Tech & Audio Pro",
    bio: "Focuses on distraction-free remote work, hi-res sound, and ergonomic workstation accessories.",
    cartItems: [
      { product_id: "101", addedAt: "Yesterday, 3:15 PM", quantity: 1 }, // Sony WH-1000XM5
      { product_id: "106", addedAt: "Today, 9:20 AM", quantity: 1 }      // Logitech MX Master 3S
    ],
    searchHistory: [
      "noise canceling headphones",
      "mechanical keyboard tactile",
      "4k usb-c hub monitor"
    ],
    recentViews: ["101", "106", "107", "110"]
  },
  {
    id: "user-02",
    name: "Chef Samantha Reed",
    email: "samantha.kitchen@cuisines.org",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
    persona: "Home Cook & Specialty Barista",
    badge: "Culinary Connoisseur",
    bio: "Home barista passionate about espresso extraction pressure and rapid multi-cooker meal prepping.",
    cartItems: [
      { product_id: "115", addedAt: "2 days ago", quantity: 1 }, // Instant Pot Duo
      { product_id: "118", addedAt: "Yesterday, 5:40 PM", quantity: 1 } // Breville Barista Express
    ],
    searchHistory: [
      "air fryer dual basket",
      "cast iron pre-seasoned skillet",
      "single serve coffee pod maker"
    ],
    recentViews: ["115", "118", "116", "122"]
  },
  {
    id: "user-03",
    name: "Marcus Chen",
    email: "marcus.fit@athletelab.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    persona: "Marathon Runner & Strength Trainer",
    badge: "Fitness Athlete",
    bio: "Calisthenics enthusiast training for half-marathons, monitoring heart-rate variability and recovery.",
    cartItems: [
      { product_id: "124", addedAt: "3 days ago", quantity: 1 }, // Bowflex 552 Dumbbells
      { product_id: "137", addedAt: "Yesterday, 11:10 AM", quantity: 2 } // Hydro Flask 32oz
    ],
    searchHistory: [
      "gps running smartwatch amoled",
      "yoga non-slip alignment mat",
      "doorway pull up bar"
    ],
    recentViews: ["124", "137", "130", "127"]
  },
  {
    id: "user-04",
    name: "Elena Rostova",
    email: "elena.wander@nomadpulse.net",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    persona: "Digital Nomad & Frequent Flyer",
    badge: "Travel & Minimalism",
    bio: "Flies carry-on only, seeking durable lightweight bags, RFID cardholders, and high-wattage power banks.",
    cartItems: [
      { product_id: "132", addedAt: "Yesterday, 8:05 PM", quantity: 1 }, // Bellroy Classic Backpack
      { product_id: "134", addedAt: "Today, 7:30 AM", quantity: 1 }      // Samsonite Omni PC Luggage
    ],
    searchHistory: [
      "rfid slim metal wallet",
      "power bank 24000mah 140w",
      "compact gan fast wall charger"
    ],
    recentViews: ["132", "134", "136", "113"]
  },
  {
    id: "user-05",
    name: "David Miller",
    email: "david.fps@esportshub.gg",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    persona: "Competitive Esports & PC Modder",
    badge: "Gaming Enthusiast",
    bio: "Optimizes battle station setups for minimal input latency, high-refresh displays, and mechanical switches.",
    cartItems: [
      { product_id: "111", addedAt: "4 hours ago", quantity: 1 }, // LG UltraGear Monitor
      { product_id: "108", addedAt: "2 hours ago", quantity: 1 }  // Razer DeathAdder Mouse
    ],
    searchHistory: [
      "mechanical keyboard rgb tenkeyless",
      "curved oled gaming monitor",
      "high fidelity wireless gaming headset"
    ],
    recentViews: ["111", "108", "109", "112"]
  }
];
