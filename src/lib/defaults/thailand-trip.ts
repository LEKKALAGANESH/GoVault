// Default data for Thailand trips
// Used as fallback when database tables don't exist or are empty

import type { SurvivalTip, Phrase, PackingItem, EmergencyContact, TripTodo, ItineraryDay, Activity } from "@/lib/types";

// Default itinerary for Thailand trip
export const defaultItineraryDays: Omit<ItineraryDay, "id" | "trip_id">[] = [
  {
    day_number: 1,
    date: new Date("2026-02-28"),
    title: "Arrival in Phuket",
    summary: "Arrival & recovery day. Early flight means early naps. Focus on settling in, stocking up on baby supplies at 7-Eleven, and a gentle sunset beach walk.",
    energy_level: "LOW",
    location: "Phuket",
  },
  {
    day_number: 2,
    date: new Date("2026-03-01"),
    title: "Elephants & Old Town",
    summary: "Ethical elephant sanctuary with elevated walkways (stroller-friendly, no mud). Optional Sunday Market in evening—skip if group is tired.",
    energy_level: "MEDIUM",
    location: "Phuket",
  },
  {
    day_number: 3,
    date: new Date("2026-03-02"),
    title: "Phang Nga Bay Boat Tour",
    summary: "Full-day big boat tour (NOT speedboat) through limestone karsts. Kayaking into caves, lunch on board. Long day—pack extra snacks for Kiaraa.",
    energy_level: "HIGH",
    location: "Phang Nga Bay",
  },
  {
    day_number: 4,
    date: new Date("2026-03-03"),
    title: "Kids Park & Big Buddha",
    summary: "Toddler-focused morning at Rawai Park (splash zone + AC playground). Jungle lunch at Three Monkeys. Big Buddha at sunset—car drops at summit (minimal walking).",
    energy_level: "MEDIUM",
    location: "Phuket",
  },
  {
    day_number: 5,
    date: new Date("2026-03-04"),
    title: "Fly to Bangkok",
    summary: "Travel day: Phuket → Bangkok. Check-in at riverside hotel. ONE activity only: IconSiam mall + dinner + fountain show.",
    energy_level: "MEDIUM",
    location: "Transit",
  },
  {
    day_number: 6,
    date: new Date("2026-03-05"),
    title: "Safari World (Private Car)",
    summary: "Smart safari: Private SUV drives through animal zones (AC comfort, no crowds). Giraffe feeding is highlight. Leave by 1 PM to avoid heat.",
    energy_level: "MEDIUM",
    location: "Bangkok",
  },
  {
    day_number: 7,
    date: new Date("2026-03-06"),
    title: "Aquarium Day",
    summary: "Single-venue day: Sea Life Aquarium (AC, stroller-friendly). Hotel rest in afternoon. Early dinner—pack for tomorrow's flight.",
    energy_level: "LOW",
    location: "Bangkok",
  },
  {
    day_number: 8,
    date: new Date("2026-03-07"),
    title: "Fly Home ✈️",
    summary: "Departure day. Slow morning, generous airport buffer. Flight lands Hyderabad 7:35 PM.",
    energy_level: "LOW",
    location: "Bangkok → Hyderabad",
  },
];

// Default activities for each day
export const defaultActivities: Record<number, Omit<Activity, "id" | "day_id">[]> = {
  // Day 1: Arrival in Phuket
  1: [
    { time: "06:10", title: "✈️ Depart Hyderabad (HYD)", description: "Air India Express IX 938 • Be at airport by 04:00 • 4h flight", order: 1, status: "CONFIRMED", tags: [] },
    { time: "11:40", title: "🛬 Arrive Phuket (HKT)", description: "Phuket Intl Airport • Visa on Arrival + baggage (~45 min)", tips: "VOA counter on left after immigration. Keep passport copies handy.", order: 2, status: "CONFIRMED", tags: [] },
    { time: "12:30", title: "🚗 Taxi to Hotel", description: "Pre-booked taxi to Centara Grand (~45 min drive)", order: 3, status: "CONFIRMED", tags: [] },
    { time: "14:00", title: "🏨 Check-in Centara Grand", description: "Deluxe Suite Private Pool • Request early check-in", order: 4, status: "CONFIRMED", tags: [] },
    { time: "15:00", title: "😴 Rest & Private Pool", description: "Kiaraa nap time. Splash in private pool. Stock up at 7-Eleven.", tips: "Buy at 7-Eleven: Meiji milk (blue bottle), MamyPoko diapers, banana cake", order: 5, status: "CONFIRMED", tags: [] },
    { time: "17:30", title: "🌅 Sunset at Karon Beach", description: "Direct beach access from hotel • 5 min walk", location: "Karon Beach", location_url: "https://www.google.com/maps/place/Karon+Beach", order: 6, status: "CONFIRMED", tags: [] },
    { time: "19:00", title: "🍽️ Dinner: Tandoori Flames", description: "5 min from hotel • Reliable Indian vegetarian", food_recommendations: "Order: Dal Makhani, Paneer Butter Masala, Garlic Naan", location: "Tandoori Flames Karon", location_url: "https://www.google.com/maps/place/Tandoori+Flames+Karon", order: 7, status: "CONFIRMED", tags: [] },
  ],
  // Day 2: Elephants & Old Town
  2: [
    { time: "08:00", title: "🍳 Breakfast at Hotel", description: "Buffet breakfast • Pack snacks for Kiaraa", order: 1, status: "CONFIRMED", tags: [] },
    { time: "09:30", title: "🐘 Phuket Elephant Sanctuary", description: "Canopy Walkway Experience (2-3 hours)", tips: "Elevated bridges = no mud, stroller-friendly. Watch elephants roam free from above.", location: "Phuket Elephant Sanctuary", location_url: "https://www.google.com/maps/place/Phuket+Elephant+Sanctuary", order: 2, status: "CONFIRMED", tags: [] },
    { time: "13:00", title: "🍜 Lunch: Tu Kab Khao", description: "Award-winning Thai • Phuket Old Town", food_recommendations: 'Veg: "Bai Liang Pad Kai" (greens + egg), Massaman Curry, Coconut soup', location: "Tu Kab Khao", location_url: "https://www.google.com/maps/place/Tu+Kab+Khao", order: 3, status: "CONFIRMED", tags: [] },
    { time: "15:00", title: "🏨 Return to Hotel (Optional)", description: "Afternoon rest • Pool time • Kiaraa nap", tips: "If everyone is tired, skip the market and relax at the resort!", order: 4, status: "TENTATIVE", tags: [] },
    { time: "17:00", title: "🛍️ Phuket Old Town Sunday Market (Optional)", description: "Lard Yai Walking Street • Runs until 10 PM", tips: "Street closes for pedestrians = great for stroller. Coconut ice cream, local snacks.", location: "Phuket Walking Street", location_url: "https://www.google.com/maps/place/Phuket+Walking+Street", order: 5, status: "TENTATIVE", tags: [] },
  ],
  // Day 3: Phang Nga Bay Boat Tour
  3: [
    { time: "08:00", title: "🍳 Early Breakfast", description: "Eat well - long day ahead!", order: 1, status: "CONFIRMED", tags: [] },
    { time: "11:00", title: "🚢 John Gray Sea Canoe Tour", description: "Big boat tour • Kayaking • Lunch included • Returns ~7 PM", tips: "Pack: sunscreen, hats, change of clothes for Kiaraa. Motion sickness meds if needed.", location: "Phang Nga Bay", location_url: "https://www.google.com/maps/place/Phang+Nga+Bay", order: 2, status: "CONFIRMED", tags: [] },
    { time: "19:30", title: "🍽️ Light Dinner at Hotel", description: "Room service or hotel restaurant - everyone will be tired!", order: 3, status: "CONFIRMED", tags: [] },
  ],
  // Day 4: Kids Park & Big Buddha
  4: [
    { time: "08:00", title: "🍳 Breakfast at Hotel", description: "Relaxed start after yesterday's long day", order: 1, status: "CONFIRMED", tags: [] },
    { time: "09:30", title: "🎢 Rawai Park", description: "Kids water park + indoor AC playground", tips: "Bring swimwear & change of clothes. Great for toddlers!", location: "Rawai Park", location_url: "https://www.google.com/maps/place/Rawai+Park", order: 2, status: "CONFIRMED", tags: [] },
    { time: "13:00", title: "🌴 Lunch: Three Monkeys", description: "Jungle treehouse restaurant • Amazing photos!", location: "Three Monkeys Restaurant", location_url: "https://www.google.com/maps/place/Three+Monkeys+Restaurant+Phuket", order: 3, status: "CONFIRMED", tags: [] },
    { time: "14:30", title: "🏨 Hotel Rest", description: "Kiaraa nap time • Pool for adults", order: 4, status: "CONFIRMED", tags: [] },
    { time: "16:00", title: "🙏 Big Buddha", description: "45m marble Buddha • Panoramic views", tips: "Have driver drop at TOP parking—avoids stairs for Neena. Wear clothes covering shoulders & knees.", location: "Big Buddha Phuket", location_url: "https://www.google.com/maps/place/Big+Buddha+Phuket", order: 5, status: "CONFIRMED", tags: [] },
    { time: "18:30", title: "🍽️ Dinner: Kata Rocks", description: "Sunset dinner with ocean views", order: 6, status: "TENTATIVE", tags: [] },
  ],
  // Day 5: Fly to Bangkok
  5: [
    { time: "09:00", title: "🧳 Checkout Centara Grand", description: "Pack up, last breakfast at hotel", order: 1, status: "CONFIRMED", tags: [] },
    { time: "09:30", title: "🚗 Taxi to Airport", description: "~45 min to Phuket Airport", order: 2, status: "CONFIRMED", tags: [] },
    { time: "11:30", title: "✈️ Nok Air DD525 to Bangkok (DMK)", description: "NOK XTRA • Lands 13:00 at Don Mueang • 1.5h flight", order: 3, status: "CONFIRMED", tags: [] },
    { time: "13:30", title: "🚗 Taxi to Hotel", description: "Don Mueang to Chatrium Riverside (~45 min)", tips: "Use Grab app or pre-book transfer. Expressway toll ~75 THB.", order: 4, status: "CONFIRMED", tags: [] },
    { time: "15:00", title: "🏨 Check-in Chatrium Riverside", description: "Grand Deluxe River View • Request high floor", order: 5, status: "CONFIRMED", tags: [] },
    { time: "16:00", title: "😴 Rest at Hotel", description: "Quick nap, freshen up", order: 6, status: "CONFIRMED", tags: [] },
    { time: "17:00", title: "🚤 Hotel Boat to IconSiam", description: "Free shuttle! HarborLand playground + SookSiam dinner", tips: "Boat runs every 30 min. SookSiam food court has veg Thai options.", location: "IconSiam", location_url: "https://www.google.com/maps/place/ICONSIAM", order: 7, status: "CONFIRMED", tags: [] },
    { time: "20:00", title: "⛲ Fountain Show", description: "ICONIC Multimedia Water Features • Free show at river promenade", order: 8, status: "CONFIRMED", tags: [] },
  ],
  // Day 6: Safari World
  6: [
    { time: "07:30", title: "🍳 Early Breakfast", description: "Hotel breakfast, pack snacks for safari", order: 1, status: "CONFIRMED", tags: [] },
    { time: "08:30", title: "🚗 Private Car Pickup", description: "Klook private transfer • ~1 hour to Safari World", tips: "Private car lets you go at your own pace through safari park.", order: 2, status: "CONFIRMED", tags: [] },
    { time: "09:45", title: "🦁 Safari Park Drive-Through", description: "See lions, tigers, bears from AC comfort of car", location: "Safari World Bangkok", location_url: "https://www.google.com/maps/place/Safari+World", order: 3, status: "CONFIRMED", tags: [] },
    { time: "11:00", title: "🦒 Giraffe Feeding", description: "Kiaraa feeds bananas to giraffes! • Marine Park zone", tips: "Buy banana bunches at entrance. Best photo op of the trip!", order: 4, status: "CONFIRMED", tags: [] },
    { time: "12:00", title: "🍽️ Lunch at Safari World", description: "Multiple food courts available", order: 5, status: "CONFIRMED", tags: [] },
    { time: "13:00", title: "🚗 Leave Safari • Lunch at Fashion Island", description: "Beat the afternoon heat", tips: "Fashion Island mall has good AC food court if still hungry.", order: 6, status: "CONFIRMED", tags: [] },
    { time: "15:00", title: "🏨 Return to Hotel", description: "Rest time, hotel pool", order: 7, status: "CONFIRMED", tags: [] },
    { time: "16:00", title: "🏊 Relax at Hotel Pool", description: "Infinity pool with river views", order: 8, status: "CONFIRMED", tags: [] },
    { time: "19:00", title: "🍽️ Dinner at Hotel", description: "Silver Waves restaurant or room service", order: 9, status: "CONFIRMED", tags: [] },
  ],
  // Day 7: Aquarium Day
  7: [
    { time: "08:30", title: "🍳 Breakfast at Hotel", description: "Leisurely start - only one activity today", order: 1, status: "CONFIRMED", tags: [] },
    { time: "09:30", title: "🚗 Grab to Siam Paragon", description: "~30 min depending on traffic", order: 2, status: "CONFIRMED", tags: [] },
    { time: "10:00", title: "🐠 Sea Life Ocean World", description: "Siam Paragon basement • Shark tunnel + penguins", tips: "Stroller-friendly, fully AC. Penguin feeding at 11:30 & 14:30.", location: "Sea Life Bangkok", location_url: "https://www.google.com/maps/place/SEA+LIFE+Bangkok+Ocean+World", order: 3, status: "CONFIRMED", tags: [] },
    { time: "12:30", title: "🥗 Lunch: Veganerie", description: "Pure vegan cafe • Siam Paragon food hall", food_recommendations: "Try: Pad Thai, Green Curry, Mango Sticky Rice - all vegan!", location: "Veganerie Siam Paragon", order: 4, status: "CONFIRMED", tags: [] },
    { time: "14:00", title: "🏨 Return to Hotel", description: "Grab back to Chatrium", order: 5, status: "CONFIRMED", tags: [] },
    { time: "14:30", title: "🧳 Hotel Rest • Packing", description: "Start packing for tomorrow's flight", tips: "Pack tonight so morning is stress-free!", order: 6, status: "CONFIRMED", tags: [] },
    { time: "18:00", title: "🍽️ Early Dinner", description: "Hotel or nearby restaurant", order: 7, status: "CONFIRMED", tags: [] },
    { time: "20:00", title: "😴 Early Night", description: "Tomorrow is travel day!", order: 8, status: "CONFIRMED", tags: [] },
  ],
  // Day 8: Fly Home
  8: [
    { time: "08:00", title: "☕ Breakfast by the River", description: "Last Thai breakfast • Enjoy the view", order: 1, status: "CONFIRMED", tags: [] },
    { time: "10:00", title: "🧳 Final Packing", description: "Double-check room, gather souvenirs", order: 2, status: "CONFIRMED", tags: [] },
    { time: "12:00", title: "🏨 Checkout Chatrium", description: "Late checkout if available", order: 3, status: "CONFIRMED", tags: [] },
    { time: "12:30", title: "🍽️ Light Lunch", description: "Hotel or nearby - nothing heavy before flight", order: 4, status: "CONFIRMED", tags: [] },
    { time: "13:30", title: "🚗 Depart for Airport (BKK)", description: "Suvarnabhumi Airport • ~45 min", tips: "Leave extra time for traffic. Check-in closes 45 min before departure.", order: 5, status: "CONFIRMED", tags: [] },
    { time: "14:30", title: "✈️ Airport Check-in", description: "IndiGo counter • Drop bags, get boarding passes", order: 6, status: "CONFIRMED", tags: [] },
    { time: "17:10", title: "✈️ IndiGo 6E-1068 to Hyderabad", description: "PNR: ZF7GUH • Airbus A320 • Economy • 7kg + 20kg • Lands 19:35 IST • Welcome home! 🏠", order: 7, status: "CONFIRMED", tags: [] },
  ],
};

export const defaultSurvivalTips: Omit<SurvivalTip, "id" | "trip_id">[] = [
  {
    category: "7-eleven",
    title: "7-Eleven Essentials",
    tips: [
      'Milk: "Meiji" Brand (Blue Bottle) - Fresh Pasteurized',
      'Diapers: "MamyPoko" packs (all sizes)',
      "Snacks: Toasted Cheese Sandwiches (white wrapper)",
      "Snacks: Banana Cake, rice crackers",
      "Drinks: Coconut water, Yakult",
      "Open 24/7, every 200 meters!",
    ],
    order: 1,
  },
  {
    category: "vegetarian",
    title: "Vegetarian Ordering",
    tips: [
      'Say "Kin Jay" (กินเจ) - I eat vegan',
      "This avoids fish sauce & oyster sauce",
      "Safe dishes: Pad Thai Jay, Som Tum (no shrimp)",
      "Safe dishes: Tom Kha Hed (coconut mushroom soup)",
      "Always safe: Mango Sticky Rice!",
      "Indian restaurants are backup plan",
    ],
    order: 2,
  },
  {
    category: "transport",
    title: "Transport Tips",
    tips: [
      "Download Grab app (like Uber)",
      "Link credit card for cashless rides",
      'Request "child seat" when booking',
      "Keep hotel business card for taxi drivers",
      "Metered taxis: Insist on meter or negotiate first",
      "BTS/MRT: Free for kids under 90cm",
    ],
    order: 3,
  },
  {
    category: "money",
    title: "Money Tips",
    tips: [
      "1 INR ≈ 0.42 THB (check XE.com)",
      "Withdraw from ATMs (best exchange rates)",
      "ATM fee: ~220 THB per withdrawal",
      "Tip 20-50 THB for good service",
      "Bargain at markets (start at 50% of asking)",
      "7-Eleven accepts cards (min 300 THB)",
    ],
    order: 4,
  },
  {
    category: "toddler",
    title: "Toddler Survival",
    tips: [
      "Nap time is sacred - plan around it!",
      "Bring portable white noise machine",
      "Pack comfort toy & favorite snacks",
      "Swim diapers for pools (MamyPoko)",
      "Baby sunscreen SPF 50+ is essential",
      "Stroller-friendly: malls, walkways, beaches",
    ],
    order: 5,
  },
  {
    category: "senior",
    title: "Senior Comfort",
    tips: [
      "Bring prescription copies in English",
      "AC everywhere - carry light cardigan",
      "Comfortable walking shoes (lots of tile floors)",
      "Grab cars have AC, better than tuk-tuks",
      "Most malls have wheelchairs on request",
      "Stay hydrated - heat is intense!",
    ],
    order: 6,
  },
];

export const defaultPhrases: Omit<Phrase, "id" | "trip_id">[] = [
  { english: "Hello / Goodbye", local_text: "สวัสดี", pronunciation: "Sa-wat-dee (+ krap/ka)", order: 1 },
  { english: "Thank you", local_text: "ขอบคุณ", pronunciation: "Khob-khun (+ krap/ka)", order: 2 },
  { english: "I eat vegetarian", local_text: "กินเจ", pronunciation: "Kin Jay", order: 3 },
  { english: "No spicy please", local_text: "ไม่เผ็ด", pronunciation: "Mai Phet", order: 4 },
  { english: "How much?", local_text: "เท่าไหร่", pronunciation: "Tao-rai?", order: 5 },
  { english: "Too expensive", local_text: "แพงไป", pronunciation: "Paeng pai", order: 6 },
  { english: "Where is toilet?", local_text: "ห้องน้ำอยู่ที่ไหน", pronunciation: "Hong nam yoo tee nai?", order: 7 },
  { english: "Help!", local_text: "ช่วยด้วย", pronunciation: "Chuay duay!", order: 8 },
  { english: "Delicious!", local_text: "อร่อย", pronunciation: "A-roy!", order: 9 },
  { english: "Check bill please", local_text: "เช็คบิล", pronunciation: "Check bin", order: 10 },
];

export const defaultPackingItems: Omit<PackingItem, "id" | "trip_id">[] = [
  // Baby essentials
  { category: "baby", item: "Diapers (2-day supply, buy rest there)", checked: false, order: 1 },
  { category: "baby", item: "Favorite comfort toy / blanket", checked: false, order: 2 },
  { category: "baby", item: "Portable white noise machine", checked: false, order: 3 },
  { category: "baby", item: "Snacks for flights", checked: false, order: 4 },
  { category: "baby", item: "Swim diapers", checked: false, order: 5 },
  { category: "baby", item: "Baby sunscreen SPF 50+", checked: false, order: 6 },
  { category: "baby", item: "Foldable stroller", checked: false, order: 7 },
  // Senior comfort
  { category: "senior", item: "Daily medications + prescriptions", checked: false, order: 1 },
  { category: "senior", item: "Comfortable walking shoes", checked: false, order: 2 },
  { category: "senior", item: "Light cardigan for AC", checked: false, order: 3 },
  { category: "senior", item: "Reading glasses + case", checked: false, order: 4 },
  // Documents
  { category: "documents", item: "Passports (6+ months validity)", checked: false, order: 1 },
  { category: "documents", item: "Passport photocopies (4 each)", checked: false, order: 2 },
  { category: "documents", item: "Flight tickets (printed)", checked: false, order: 3 },
  { category: "documents", item: "Hotel confirmations (printed)", checked: false, order: 4 },
  { category: "documents", item: "Travel insurance docs", checked: false, order: 5 },
  // Medical
  { category: "medical", item: "Fever meds (Crocin/Tylenol)", checked: false, order: 1 },
  { category: "medical", item: "ORS packets", checked: false, order: 2 },
  { category: "medical", item: "Anti-diarrhea meds", checked: false, order: 3 },
  { category: "medical", item: "Band-aids & antiseptic", checked: false, order: 4 },
  { category: "medical", item: "Mosquito repellent", checked: false, order: 5 },
  // Electronics
  { category: "electronics", item: "Phone chargers", checked: false, order: 1 },
  { category: "electronics", item: "Power bank (10000mAh+)", checked: false, order: 2 },
  { category: "electronics", item: "Universal adapter", checked: false, order: 3 },
  { category: "electronics", item: "Camera + SD card", checked: false, order: 4 },
  // Beach/Temple
  { category: "beach", item: "Swimwear for everyone", checked: false, order: 1 },
  { category: "beach", item: "Cover-ups for temples", checked: false, order: 2 },
  { category: "beach", item: "Sun hats", checked: false, order: 3 },
  { category: "beach", item: "Sunglasses", checked: false, order: 4 },
  { category: "beach", item: "Flip flops / water shoes", checked: false, order: 5 },
];

export const defaultEmergencyContacts: Omit<EmergencyContact, "id" | "trip_id">[] = [
  { category: "emergency", label: "Tourist Police", phone: "1155", order: 1 },
  { category: "emergency", label: "Ambulance", phone: "1669", order: 2 },
  { category: "emergency", label: "Police", phone: "191", order: 3 },
  { category: "hospital", label: "Phuket: Bangkok Hospital", phone: "+66 76 254 425", order: 1 },
  { category: "hospital", label: "Bangkok: Bumrungrad", phone: "+66 2 066 7888", order: 2 },
  { category: "embassy", label: "Indian Embassy Bangkok", phone: "+66 2 258 0300", order: 1 },
  { category: "embassy", label: "24/7 Emergency Line", phone: "+66 81 850 0025", order: 2 },
  { category: "hotel", label: "Centara Grand Phuket", phone: "+66 76 201 234", order: 1 },
  { category: "hotel", label: "Chatrium Bangkok", phone: "+66 2 307 0100", order: 2 },
];

export const defaultTodos: Omit<TripTodo, "id" | "trip_id">[] = [
  // Flights & Transport
  {
    category: "flights",
    title: "Nok Air Flight DD525 (Phuket → Bangkok)",
    completed: true,
    order: 1,
    due_date: "Feb 1",
    priority: "HIGH",
    link_url: "https://www.nokair.com",
    link_text: "nokair.com →",
    booking_date: "Mar 4, 2026 • 11:30 AM",
    booking_ref: "DD525",
  },
  {
    category: "flights",
    title: "Book Private Car for Safari World (Klook)",
    completed: false,
    order: 2,
    due_date: "Feb 15",
    priority: "HIGH",
    link_url: "https://www.klook.com/activity/safari-world-private-transfer",
    link_text: "klook.com →",
    booking_date: "Mar 5, 2026 • 08:30 AM",
  },
  {
    category: "flights",
    title: "Book Airport Taxi (Phuket Airport → Hotel)",
    completed: false,
    order: 3,
    due_date: "Feb 20",
    priority: "MEDIUM",
    link_url: "https://www.klook.com/activity/phuket-airport-transfer",
    link_text: "klook.com →",
    booking_date: "Feb 28, 2026 • 11:40 AM (arrival)",
  },
  // Tours & Tickets
  {
    category: "tours",
    title: "Book Phuket Elephant Sanctuary",
    completed: false,
    order: 1,
    due_date: "Feb 10",
    priority: "HIGH",
    link_url: "https://www.phuketelephantsanctuary.org/booking",
    link_text: "Book tickets →",
    booking_date: "Mar 1, 2026 • 09:30 AM",
  },
  {
    category: "tours",
    title: "Book John Gray Sea Canoe (Phang Nga Bay)",
    completed: false,
    order: 2,
    due_date: "Feb 10",
    priority: "HIGH",
    link_url: "https://www.johngray-seacanoe.com",
    link_text: "johngray-seacanoe.com →",
    booking_date: "Mar 2, 2026 • 11:00 AM",
  },
  {
    category: "tours",
    title: "Buy Safari World Tickets Online",
    completed: false,
    order: 3,
    due_date: "Feb 20",
    priority: "MEDIUM",
    link_url: "https://www.safariworld.com/tickets",
    link_text: "safariworld.com →",
    booking_date: "Mar 5, 2026 • 09:45 AM",
  },
  {
    category: "tours",
    title: "Buy Sea Life Ocean World Tickets",
    completed: false,
    order: 4,
    due_date: "Feb 20",
    priority: "MEDIUM",
    link_url: "https://www.visitsealife.com/bangkok/tickets",
    link_text: "visitsealife.com →",
    booking_date: "Mar 6, 2026 • 10:00 AM",
  },
  // Pre-Trip Admin
  {
    category: "admin",
    title: "Notify Bank About Thailand Travel Dates",
    completed: false,
    order: 1,
    due_date: "Feb 25",
    priority: "MEDIUM",
  },
  {
    category: "admin",
    title: "Buy Travel Insurance (All 4 Travelers)",
    completed: false,
    order: 2,
    due_date: "Feb 20",
    priority: "HIGH",
  },
  {
    category: "admin",
    title: "Install Grab App + Add Payment Method",
    completed: false,
    order: 3,
    due_date: "Feb 27",
    priority: "LOW",
    link_url: "https://www.grab.com/download",
    link_text: "Download →",
  },
  {
    category: "admin",
    title: "Download Offline Google Maps (Phuket + Bangkok)",
    completed: false,
    order: 4,
    due_date: "Feb 27",
    priority: "LOW",
  },
  {
    category: "admin",
    title: "Online Check-in All Flights (24h before)",
    completed: false,
    order: 5,
    due_date: "Feb 27 / Mar 3 / Mar 6",
    priority: "HIGH",
  },
];

// Check if a trip is Thailand-related
export function isThailandTrip(destinations: string[]): boolean {
  const thailandKeywords = ["thailand", "phuket", "bangkok", "chiang mai", "krabi", "pattaya", "koh samui", "thai"];
  return destinations.some((dest) =>
    thailandKeywords.some((keyword) => dest.toLowerCase().includes(keyword))
  );
}

// Get default data with generated IDs
export function getDefaultSurvivalTips(tripId: string): SurvivalTip[] {
  return defaultSurvivalTips.map((tip, i) => ({
    ...tip,
    id: `default-tip-${i}`,
    trip_id: tripId,
  }));
}

export function getDefaultPhrases(tripId: string): Phrase[] {
  return defaultPhrases.map((phrase, i) => ({
    ...phrase,
    id: `default-phrase-${i}`,
    trip_id: tripId,
  }));
}

export function getDefaultPackingItems(tripId: string): PackingItem[] {
  return defaultPackingItems.map((item, i) => ({
    ...item,
    id: `default-packing-${i}`,
    trip_id: tripId,
  }));
}

export function getDefaultEmergencyContacts(tripId: string): EmergencyContact[] {
  return defaultEmergencyContacts.map((contact, i) => ({
    ...contact,
    id: `default-contact-${i}`,
    trip_id: tripId,
  }));
}

export function getDefaultTodos(tripId: string): TripTodo[] {
  return defaultTodos.map((todo, i) => ({
    ...todo,
    id: `default-todo-${i}`,
    trip_id: tripId,
  }));
}

export function getDefaultItinerary(tripId: string): (ItineraryDay & { activities: Activity[] })[] {
  return defaultItineraryDays.map((day, dayIndex) => {
    const dayId = `default-day-${dayIndex + 1}`;
    const dayActivities = defaultActivities[day.day_number] || [];

    return {
      ...day,
      id: dayId,
      trip_id: tripId,
      activities: dayActivities.map((activity, actIndex) => ({
        ...activity,
        id: `default-activity-${dayIndex + 1}-${actIndex + 1}`,
        day_id: dayId,
      })),
    };
  });
}
