# GoaSmart – Intelligent Tourism & Crowd Distribution Platform

> **ACM Hackathon (ME Track – Mobility & Environment)**  
> An AI-driven, sustainable smart destination platform designed to balance tourist footfalls across Goa, reduce congestion at popular coastal hotspots, and empower interior villages, eco-tourism destinations, and local small businesses.

---

## 🌟 The Problem
Over 9 million tourists visit Goa every year, but over 85% crowd into the same 5% coastal belt (Baga, Calangute, Anjuna, Fort Aguada, Dudhsagar Falls). This leads to severe vehicular gridlock, plastic pollution, and ecological stress on turtle nesting sites and coastal dunes. Meanwhile, interior heritage locations, tranquil river islands (Divar, Chorao), ancient Kadamba temples, spice plantations, and village homestays receive negligible visibility.

## 🚀 The GoaSmart Solution
GoaSmart intelligently redistributes visitor flows using:
1. **Real-time Crowd Estimation & Forecasting:** Dynamic density indicators (Low, Moderate, High, Very High) with hourly trend projections.
2. **Smart Alternative Recommendations:** Directing tourists away from congested hotspots to comparable, serene alternatives (e.g., swapping overcrowded Baga for pristine Galgibaga or Cola Beach Lagoon).
3. **Multilingual Tourist Companion:** Native support for English, हिन्दी (Hindi), and कोंकणी (Konkani).
4. **Local Business Marketplace (Phase 3):** Fair visibility for family homestays, clay potters, kayak operators, and local guides without pay-to-win advertising monopolies.
5. **Tourism Authority Analytics & Simulation Engine (Phase 4):** Agent-based modeling comparing standard tourism vs. GoaSmart distributed flow.

---

## 🛠️ Technology Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React
- **Internationalization:** Multi-language state architecture (English, Hindi, Konkani)
- **Design System:** Custom Goa-inspired palette (Deep Ocean Turquoise, Sand Amber, Western Ghats Emerald)
- **Deployment & Dev:** Fast HMR with Vite, PostCSS, Autoprefixer

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
│   │   ├── Hero.jsx                    # Hero banner with quick search & trending vibes
│   │   ├── CrowdStatusTicker.jsx       # Real-time scrolling crowd radar
│   │   ├── TouristDashboard.jsx        # Destination explorer, filters, region tabs & sorting
│   │   ├── DestinationCard.jsx         # Card with crowd meters, badges, and quick actions
│   │   ├── DestinationModal.jsx        # Deep-dive modal with hourly crowd curves & alternative suggestions
│   │   ├── FavoritesDrawer.jsx         # Saved trip itinerary with overall crowd health score
│   │   ├── WhyGoaSmart.jsx             # Problem vs solution impact overview
│   │   ├── BusinessPortalPreview.jsx   # Phase 3 local business preview
│   │   ├── AuthorityDashboardPreview.jsx # Phase 4 authority analytics & simulation preview
│   │   └── Footer.jsx                  # Comprehensive footer with portal switchers
│   ├── data/
│   │   ├── destinations.js             # Realistic 16+ destination dataset with coordinates, crowd scores & hours
│   │   └── translations.js             # English, Hindi, and Konkani localizations
│   ├── App.jsx                         # Main app state & routing logic
│   ├── index.css                       # Tailwind CSS directives & custom styling
│   └── main.jsx                        # React root entrypoint
├── index.html                          # HTML shell with Google Fonts
├── package.json
├── tailwind.config.js                  # Custom Goa-themed styling tokens
├── vite.config.js                      # Vite config on port 3000
└── .env.example                        # Environment variables template
```

---

## 🏆 Current Status: Phase 1 Complete
- [x] Responsive Landing Page with Goa Hero Banner & Impact Stats
- [x] Multi-Role Navigation (Tourist, Business Portal, Authority Dashboard)
- [x] Real-time Crowd Status Marquee Ticker
- [x] Multilingual Support (English, Hindi, Konkani)
- [x] Goa Destination Explorer with 16+ realistic curated hotspots and quiet alternatives
- [x] Filter by Region (North, South, Central), Category, and "Peaceful Only"
- [x] Sorting by Crowd Score (Low to High), Rating, and Name
- [x] Destination Detail Modal with Hourly Crowd Profile Graphs & Smart Alternative Suggestions
- [x] Saved Places Itinerary Drawer with Trip Crowd Health Score
- [x] Production build tested and verified with zero errors
