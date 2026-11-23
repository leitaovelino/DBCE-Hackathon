# GoaSmart – Intelligent Tourism & Crowd Distribution Platform

> **ACM Hackathon (ME Track – Mobility & Environment)**  
> An AI-driven, sustainable smart destination platform designed to balance tourist footfalls across Goa, reduce congestion at popular coastal hotspots, and empower interior villages, eco-tourism destinations, and local small businesses.

---

## 🌟 The Problem
Over 9 million tourists visit Goa every year, but over 85% crowd into the same 5% coastal belt (Baga, Calangute, Anjuna, Fort Aguada, Dudhsagar Falls). This leads to severe vehicular gridlock, plastic pollution, and ecological stress on turtle nesting sites and coastal dunes. Meanwhile, interior heritage locations, tranquil river islands (Divar, Chorao), ancient Kadamba temples, spice plantations, and village homestays receive negligible visibility.

## 🚀 The GoaSmart Solution
GoaSmart intelligently redistributes visitor flows using:
1. **Real-time Crowd Estimation & Forecasting (Phase 3):** Dedicated crowd telemetry dashboard with 3 categories (LOW, MODERATE, HIGH), hourly predictions, diurnal profiles, and weekly curves.
2. **Intelligent Tourist Nudges (Phase 3):** Contextual redirection engine that prompts tourists at high-crowd hotspots with serene alternatives (e.g. Baga ➔ Cola Lagoon, Calangute ➔ Galgibaga, Aguada ➔ Reis Magos) with 1-click itinerary switching.
3. **Smart Itinerary Planner (Phase 3):** Multi-day route generator customized by duration (1, 2, 3, 5 days), start location, budget, and travel preferences with expense calculation and customizable stops.
4. **AI Tourism Companion (Phase 2):** Conversational AI travel assistant with personalized query parsing, budget reasoning, and congestion diversion suggestions.
5. **Interactive Goa Tourism Map (Phase 2):** Leaflet & OpenStreetMap GIS with color-coded crowd pins, category layers, search, and synchronized destination panel.
6. **Smart Destination Recommendations (Phase 2):** Persona-based matcher (Peaceful, Culture, Adventure, Budget) and category filtering that directs visitors to pristine alternatives.
7. **Multilingual Support:** Native support for English, हिन्दी (Hindi), and कोंकणी (Konkani).
8. **Local Business Marketplace (Phase 4):** Fair visibility for family homestays, clay potters, kayak operators, and local guides without pay-to-win advertising monopolies.
9. **Tourism Authority Analytics & Simulation Engine (Phase 5):** Agent-based modeling comparing standard tourism vs. GoaSmart distributed flow.

---

## 🛠️ Technology Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React
- **Mapping & GIS:** Leaflet, OpenStreetMap, CartoDB Voyager tiles
- **Services:** Modular `crowdService.js`, `itineraryService.js`, `nudgeService.js`, `chatService.js`, `recommendationService.js` ready for backend API endpoints
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
│   │   ├── CrowdIntelligenceDashboard.jsx # Phase 3: Crowd telemetry, 3-category badges & predictive forecasts
│   │   ├── SmartItineraryPlanner.jsx   # Phase 3: Multi-day itinerary generator & intelligent tourist nudges
│   │   ├── AIChatbot.jsx               # Phase 2: Dedicated AI Tourism Assistant conversational UI
│   │   ├── InteractiveMap.jsx          # Phase 2: Interactive Leaflet map with crowd pins & layers
│   │   ├── SmartRecommendations.jsx    # Phase 2: Persona-based recommendations & category matcher
│   │   ├── WhyGoaSmart.jsx             # Problem vs solution impact overview
│   │   ├── BusinessPortalPreview.jsx   # Phase 4 local business preview
│   │   ├── AuthorityDashboardPreview.jsx # Phase 5 authority analytics & simulation preview
│   │   └── Footer.jsx                  # Comprehensive footer with portal switchers
│   ├── services/
│   │   ├── crowdService.js             # Phase 3: Synthetic crowd metrics, hourly & weekly forecasts
│   │   ├── itineraryService.js         # Phase 3: Multi-day route & expense planning engine
│   │   ├── nudgeService.js             # Phase 3: Congestion detection and alternative nudges
│   │   ├── chatService.js              # Phase 2: Conversational reasoning service (Gemini ready)
│   │   └── recommendationService.js    # Phase 2: Personalized recommendation algorithms
│   ├── data/
│   │   ├── destinations.js             # 20 curated destinations with coordinates, GIS layers & crowd scores
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

## 🏆 Current Status: Phase 1, Phase 2 & Phase 3 Complete
- [x] **Phase 1: Working Foundation & Destination Explorer**
- [x] **Phase 2: Intelligent Chatbot, Map System & Recommendations**
- [x] **Phase 3: Crowd Intelligence, Smart Itinerary Planner & Tourist Nudges**
  - Dedicated Crowd Intelligence Dashboard with 3 status tiers (LOW, MODERATE, HIGH)
  - Visual state-wide crowd distribution chart and KPI summaries
  - Hourly, tomorrow, and weekly crowd forecast visualizers (clearly labelled simulated data)
  - Smart Itinerary Planner supporting customizable duration, starting point, budget, travelers, and categories
  - Day-by-day organized plan with duration, expense, travel time, and stop removal/addition
  - Contextual Tourist Nudges prompting alternative quiet spots when high crowd is anticipated
  - Zero breaking changes to Phase 1 and Phase 2; full production build passing (0 errors)
