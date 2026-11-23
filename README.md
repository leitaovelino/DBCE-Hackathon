# GoaSmart – Intelligent Tourism & Crowd Distribution Platform

> **ACM Hackathon (ME Track – Mobility & Environment)**  
> An AI-driven, sustainable smart destination platform designed to balance tourist footfalls across Goa, reduce congestion at popular coastal hotspots, calculate realistic driving routes, and empower interior villages, eco-tourism destinations, and local small businesses.

---

## 🌟 The Challenge
Over 9 million tourists visit Goa every year, but over 85% crowd into the same 5% coastal belt (Baga, Calangute, Anjuna, Fort Aguada, Dudhsagar Falls). This causes vehicular gridlocks, plastic pollution, and severe ecological stress on turtle nesting beaches and coastal dunes. Meanwhile, interior heritage sites, tranquil river islands (Divar, Chorao), ancient Kadamba temples, spice plantations, and village homestays receive negligible visibility.

## 🚀 The GoaSmart Solution
GoaSmart redistributes visitor flows sustainably through an end-to-end integrated ecosystem:
1. **AI Travel Companion (Phase 7 - Live Gemini 3.5 Flash):** Conversational AI assistant grounded in a verified Goan destination catalog and sustainable travel guidelines. Promotes offbeat gems and suggests crowd-conscious alternatives.
2. **OpenRouteService Integration (Phase 8 - driving-car Profile):** Calculates real road driving distances, durations, and multi-stop route polylines directly plotted on Leaflet maps.
3. **Smart Itinerary Planner (Phase 3 & 8):** Multi-day route optimizer with per-segment driving times, proactive tourist nudges, and budget breakdowns.
4. **Interactive Leaflet Map (Phase 2 & 8):** Visualizes destinations with color-coded crowd pins, real road geometries, and category filters.
5. **Crowd Intelligence Dashboard (Phase 3):** Hourly and weekly visitor curves, 3-tier crowd indicators (LOW, MODERATE, HIGH), and time-slot optimization. *(Simulated synthetic telemetry clearly labelled)*.
6. **Local Business Marketplace (Phase 4 & 6):** Connects tourists directly with local Goan artisans, homestays, eco-guides, and authentic seafood shacks.
7. **Business Owner Portal (Phase 4 & 5):** Protected portal allowing verified local owners to list experiences, manage inquiries, and track fair exposure.
8. **Tourism Authority Command Center (Phase 4 & 5):** State-level GIS command center with regional density metrics, algorithmic diversion analytics, and nudge impact comparisons.
9. **Role-Based Access Control (Phase 5):** Multi-role authentication (Tourist, Business Owner, Tourism Authority) enforced with Firebase Authentication, cryptographically signed Custom Claims, and hardened Firestore Security Rules.
10. **Multilingual Localization:** Seamless switching between English, हिन्दी (Hindi), and कोंकणी (Konkani).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Leaflet |
| **Backend** | Node.js, Express, CORS, Dotenv (Unified on Port 5000) |
| **Artificial Intelligence** | Google Gemini API (`gemini-3.5-flash` via `@google/genai` SDK) |
| **Geospatial & Routing** | OpenRouteService API (`driving-car/geojson`), Leaflet GIS |
| **Authentication & RBAC** | Firebase Authentication, Firebase Custom Claims |
| **Database & Security** | Cloud Firestore, Firestore Security Rules (Phase 5 Hardened) |
| **Testing & Tooling** | Custom Automated Backend Test Suite, Security Rules Evaluator, Key Diagnostics |

---

## 🗺️ Project Structure

```
DBCE-Hackathon/
├── .env.example                # Frontend environment template
├── .env.local                  # Frontend Firebase credentials (git-ignored)
├── firestore.rules             # Production Firestore security rules
├── index.html                  # HTML entry shell
├── package.json                # Root scripts and dependencies
├── scripts/
│   ├── checkApiKeys.js         # Unified live API keys & connectivity audit tool
│   ├── testSecurityRules.js    # 10-scenario security hardening test suite
│   ├── provisionAuthority.js   # Admin SDK script to assign Authority Custom Claims
│   └── seedDestinations.js     # Seeds 20 curated Goa destinations to Firestore
├── server/
│   ├── .env.example            # Backend environment template
│   ├── .env                    # Backend API keys for Gemini & ORS (git-ignored)
│   ├── index.js                # Express backend (hosts /api/chat and /api/routes)
│   ├── package.json            # Server dependencies
│   ├── testBackend.js          # 9-scenario integration test suite
│   ├── routes/
│   │   ├── chat.js             # POST /api/chat endpoint
│   │   └── routes.js           # POST /api/routes/directions endpoint
│   └── services/
│       ├── geminiService.js    # Gemini GenAI client with resilient model fallbacks
│       └── orsService.js       # OpenRouteService API client (driving-car profile)
└── src/
    ├── App.jsx                 # Master application router & state
    ├── firebase.js             # Firebase SDK client initialization
    ├── components/             # React UI components
    │   ├── AIChatbot.jsx
    │   ├── InteractiveMap.jsx
    │   ├── SmartItineraryPlanner.jsx
    │   ├── CrowdIntelligenceDashboard.jsx
    │   ├── LocalBusinessMarketplace.jsx
    │   ├── BusinessOwnerDashboard.jsx
    │   ├── TourismAuthorityDashboard.jsx
    │   ├── TouristDashboard.jsx
    │   ├── Navbar.jsx
    │   └── ProtectedAccessGuard.jsx
    ├── context/
    │   └── AuthContext.jsx     # Firebase Auth context & claims observer
    ├── data/
    │   ├── destinations.js     # 20 curated Goan destinations
    │   ├── businesses.js       # Local marketplace mock dataset
    │   └── translations.js     # English, Hindi, Konkani localizations
    └── services/
        ├── chatService.js      # Frontend client for /api/chat
        ├── itineraryService.js # Route calculation client for /api/routes
        ├── destinationService.js
        ├── crowdService.js
        └── authorityService.js
```

---

## ⚙️ Environment Configuration

### 1. Frontend Configuration (`.env.local`)
Create `.env.local` in the project root:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 2. Backend Configuration (`server/.env`)
Create `server/.env` in the `server/` directory:
```env
# Google Gemini API Key (from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash

# OpenRouteService API Key (from https://openrouteservice.org/dev/#/signup)
ORS_API_KEY=your_ors_api_key_here

# Server Settings
PORT=5000
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Running the Project

### 1. Install Dependencies
```bash
# Root frontend dependencies
npm install

# Backend server dependencies
cd server
npm install
cd ..
```

### 2. Start the Backend Server (Port 5000)
```bash
npm run server
```
*Backend runs on `http://localhost:5000` exposing `POST /api/chat` and `POST /api/routes/directions`.*

### 3. Start the Frontend Application (Port 5173 / 3000)
In a second terminal:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing & Verification Commands

All test scripts are automated and runnable via `npm`:

```bash
# 1. Unified live API keys & provider connectivity audit
npm run check:keys

# 2. Backend integration tests (Gemini chat, ORS routing & validation)
npm run test:backend

# 3. Security rules & RBAC hardening tests (10 test cases)
npm run test:security

# 4. Production build check
npm run build
```

---

## 🛡️ Role-Based Access & Authority Provisioning

- **Tourist (Default):** Can register publicly, browse destinations, query AI, create itineraries, book marketplace experiences.
- **Business Owner:** Can register publicly, create and manage their own local business listings, and view received demo bookings. Cannot modify other businesses' listings.
- **Tourism Authority:** Strictly protected. **Cannot be registered via the public frontend.** Must be provisioned by a Firebase administrator using the Admin SDK:

```bash
# Provision an existing account as Tourism Authority
node scripts/provisionAuthority.js official@goa.gov.in
```
*This cryptographically stamps the Custom Claim `role: "authority"` onto the user's Firebase token, granting access to the State Command Center and protected administrative functions.*

---

## 🎭 10-Step Hackathon Demonstration Walkthrough

Follow this sequence for an optimal live demo:

1. **Landing & Explorer:** Open the home page. Explore the hero banner, language selector (English/Hindi/Konkani), and the live **Crowd Status Marquee Ticker**.
2. **Tourist Filter & Card Details:** Filter destinations by region (North, Central, South) and crowd score. Click on **Cola Beach Lagoon** to view opening hours, highlights, and hourly crowd trends.
3. **Interactive Leaflet Map:** Switch to the **Goa Map** tab. Filter by "Waterfalls & Nature" or "Historic Forts". Click on pins to view synchronized popups and navigate directly to destination deep-dives.
4. **Crowd Intelligence:** Open the **Crowd Intelligence** tab. Observe the 3-category badges (`LOW`, `MODERATE`, `HIGH`) and explain how off-peak hours and weekend forecasts help tourists avoid congestion. *(Note: Clearly labelled as simulated telemetry)*.
5. **Smart Itinerary Planner & Proactive Nudges:** Open the **Smart Itinerary** tab. Select a 2-day trip starting from *Panaji*. Notice how a high-crowd stop triggers an **Intelligent Tourist Nudge** (e.g. replace congested Baga with pristine Galgibaga, saving 74% crowd congestion).
6. **Live OpenRouteService Road Telemetry:** Observe the **Road Telemetry Banner** showing real driving distance (km) and driving duration (mins) computed by OpenRouteService (`driving-car`). Click **"Plot Road on Map"** to see the actual road polyline dynamically rendered on Leaflet.
7. **Gemini AI Travel Companion:** Navigate to **AI Travel Companion**. Ask: *"I want a peaceful beach day with good seafood and a budget of ₹1500"*. Watch Gemini generate an authentic, itemized Goan plan recommending Galgibaga Beach and Cola Lagoon with clickable destination tags.
8. **Local Business Marketplace:** Open the **Marketplace** tab. Filter by "Homestays" or "Eco-Tours & Water Sports". Click on an experience (e.g. *Canacona Kayak Trails*), fill the demo booking form, and receive instant confirmation.
9. **Business Owner Portal:** Sign in as a Local Business Owner. Open the **Host Dashboard** to showcase listing management, active listings, and incoming demo reservations.
10. **Tourism Authority Command Center:** Sign in with the provisioned Authority account. Open the **Authority Portal** to demonstrate the dark-mode GIS heat map, regional congestion comparison charts, and algorithm diversion impact metrics (-28% peak congestion drop at hotspots).

---

## ⚠️ Known Limitations & Transparency Disclosures
- **Simulated Crowd Telemetry:** Real-time crowd scores and hourly projections are generated by the platform's synthetic simulation engine; no physical IoT sensors or telecommunication cell towers are connected.
- **Booking & Payments:** Marketplace reservations are mock demonstrations; no real credit cards are processed.
- **Authority Provisioning:** Authority accounts require administrative Firebase Admin assignment via `scripts/provisionAuthority.js` to prevent unauthorized public self-promotion.
- **Free Tier API Rate Limits:** Google Gemini and OpenRouteService operate on free developer quotas; automatic fallbacks and helpful user alerts are in place if quotas are temporarily exceeded.
