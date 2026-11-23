# GoaSmart – Intelligent Tourism & Crowd Distribution Platform

> **ACM Hackathon (ME Track – Mobility & Environment)**  
> An AI-driven, sustainable smart destination platform designed to balance tourist footfalls across Goa, reduce congestion at popular coastal hotspots, and empower interior villages, eco-tourism destinations, and local small businesses.

---

## 🌟 The Problem
Over 9 million tourists visit Goa every year, but over 85% crowd into the same 5% coastal belt (Baga, Calangute, Anjuna, Fort Aguada, Dudhsagar Falls). This leads to severe vehicular gridlock, plastic pollution, and ecological stress on turtle nesting sites and coastal dunes. Meanwhile, interior heritage locations, tranquil river islands (Divar, Chorao), ancient Kadamba temples, spice plantations, and village homestays receive negligible visibility.

## 🚀 The GoaSmart Solution
GoaSmart intelligently redistributes visitor flows using:
1. **Local Business Marketplace (Phase 4):** Discover and book authentic Goan homestays, seafood shacks, kayak guides, and pottery workshops with fair algorithmic visibility.
2. **Business Owner Management Portal (Phase 4):** Dedicated interface for local hosts to manage experience listings, incoming booking requests, and fair exposure analytics.
3. **Tourism Authority Analytics & Nudge Telemetry (Phase 4):** State-wide GIS monitoring map, regional visitor flow comparisons, and simulated intervention assessments demonstrating hotspot congestion drops (-28%) and village revenue growth (+240%).
4. **Real-time Crowd Estimation & Forecasting (Phase 3):** Dedicated crowd telemetry dashboard with 3 status categories (LOW, MODERATE, HIGH), hourly projections, and weekly curves.
5. **Intelligent Tourist Nudges (Phase 3):** Contextual redirection engine that prompts tourists at high-crowd hotspots with serene alternatives with 1-click itinerary switching.
6. **Smart Itinerary Planner (Phase 3):** Multi-day route generator customized by duration (1, 2, 3, 5 days), start location, budget, and travel preferences.
7. **AI Tourism Companion (Phase 2):** Conversational AI travel assistant with personalized query parsing, budget reasoning, and congestion diversion suggestions.
8. **Interactive Goa Tourism Map (Phase 2):** Leaflet & OpenStreetMap GIS with color-coded crowd pins, category layers, search, and synchronized destination panel.
9. **Smart Destination Recommendations (Phase 2):** Persona-based matcher (Peaceful, Culture, Adventure, Budget) and category filtering.
10. **Multilingual Support:** Native support for English, हिन्दी (Hindi), and कोंकणी (Konkani).

---

## 🛠️ Technology Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React
- **Mapping & GIS:** Leaflet, OpenStreetMap, CartoDB tiles
- **Services & Data Architecture:** 
  - `businessService.js` (Marketplace & local bookings)
  - `authorityService.js` (State analytics, regional flows & nudge impact)
  - `crowdService.js` (Crowd forecasting & telemetry)
  - `itineraryService.js` (Route & multi-day planning)
  - `nudgeService.js` (Congestion detection & alternatives)
  - `chatService.js` (AI conversational assistant)
  - `recommendationService.js` (Persona-based matcher)
- **Internationalization:** Multi-language state architecture (English, Hindi, Konkani)
- **Design System:** Custom Goa-inspired palette (Deep Ocean Turquoise, Sand Amber, Western Ghats Emerald)

---

## 📦 Project Setup & Local Execution

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/leitaovelino/DBCE-Hackathon.git
cd DBCE-Hackathon

# Switch to working branch
git checkout clyde

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## 🗺️ Project Structure
```
DBCE-Hackathon/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── Navbar.jsx                  # Top navigation, language selector & favorites counter
│   │   ├── Hero.jsx                    # Hero banner with quick search, AI button & trending vibes
│   │   ├── CrowdStatusTicker.jsx       # Real-time scrolling crowd radar
│   │   ├── TouristDashboard.jsx        # Destination explorer, filters, region tabs & sorting
│   │   ├── DestinationCard.jsx         # Card with crowd meters, badges, and quick actions
│   │   ├── DestinationModal.jsx        # Deep-dive modal with hourly crowd curves & alternative suggestions
│   │   ├── FavoritesDrawer.jsx         # Saved trip itinerary with overall crowd health score
│   │   ├── LocalBusinessMarketplace.jsx # Phase 4: Local business directory & booking interface
│   │   ├── BusinessOwnerDashboard.jsx  # Phase 4: Business owner listing management & booking admin
│   │   ├── TourismAuthorityDashboard.jsx # Phase 4: State command center, GIS map & nudge telemetry
│   │   ├── CrowdIntelligenceDashboard.jsx # Phase 3: Crowd telemetry, 3-category badges & predictive forecasts
│   │   ├── SmartItineraryPlanner.jsx   # Phase 3: Multi-day itinerary generator & intelligent tourist nudges
│   │   ├── AIChatbot.jsx               # Phase 2: Dedicated AI Tourism Assistant conversational UI
│   │   ├── InteractiveMap.jsx          # Phase 2: Interactive Leaflet map with crowd pins & layers
│   │   ├── SmartRecommendations.jsx    # Phase 2: Persona-based recommendations & category matcher
│   │   ├── WhyGoaSmart.jsx             # Problem vs solution impact overview
│   │   └── Footer.jsx                  # Comprehensive footer with portal switchers
│   ├── services/
│   │   ├── businessService.js          # Phase 4: Marketplace listings & booking store
│   │   ├── authorityService.js         # Phase 4: State-wide analytics & nudge comparisons
│   │   ├── crowdService.js             # Phase 3: Synthetic crowd metrics, hourly & weekly forecasts
│   │   ├── itineraryService.js         # Phase 3: Multi-day route & expense planning engine
│   │   ├── nudgeService.js             # Phase 3: Congestion detection and alternative nudges
│   │   ├── chatService.js              # Phase 2: Conversational reasoning service (Gemini ready)
│   │   └── recommendationService.js    # Phase 2: Personalized recommendation algorithms
│   ├── data/
│   │   ├── destinations.js             # 20 curated destinations with coordinates, GIS layers & crowd scores
│   │   ├── businesses.js               # Realistic Goan local businesses, homestays, and experiences
│   │   └── translations.js             # English, Hindi, and Konkani localizations
│   ├── App.jsx                         # Main app state, routing & modal management
│   ├── index.css                       # Tailwind CSS directives & custom styling
│   └── main.jsx                        # React root entrypoint
├── index.html                          # HTML shell with Google Fonts
├── package.json
├── tailwind.config.js                  # Custom Goa-themed styling tokens
├── vite.config.js                      # Vite config on port 3000
└── .env.example                        # Environment variables template
```

---

## 🏆 Current Status: Phase 1, Phase 2, Phase 3 & Phase 4 Complete
- [x] **Phase 1: Working Foundation & Destination Explorer**
- [x] **Phase 2: Intelligent Chatbot, Map System & Recommendations**
- [x] **Phase 3: Crowd Intelligence, Smart Itinerary Planner & Tourist Nudges**
- [x] **Phase 4: Local Business Marketplace & Tourism Authority Dashboard**
  - Interactive Local Business Marketplace with search, region, category, and price filters
  - Detailed experience modal and booking interface with simulated reservation confirmation
  - Business Owner Management Portal with listing creation, editing, and booking request actions
  - Tourism Authority Dashboard with state-wide GIS monitoring map and regional visitor comparisons
  - Simulated Tourist Nudge impact analytics (Before vs. After comparison with -28% peak congestion drop)
  - Automated rule-based authority insights
  - Production build tested and verified with 0 errors
