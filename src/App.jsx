import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CrowdStatusTicker from './components/CrowdStatusTicker';
import TouristDashboard from './components/TouristDashboard';
import DestinationModal from './components/DestinationModal';
import FavoritesDrawer from './components/FavoritesDrawer';
import WhyGoaSmart from './components/WhyGoaSmart';
import Footer from './components/Footer';

// Phase 2 Modules
import AIChatbot from './components/AIChatbot';
import InteractiveMap from './components/InteractiveMap';
import SmartRecommendations from './components/SmartRecommendations';

// Phase 3 Modules
import CrowdIntelligenceDashboard from './components/CrowdIntelligenceDashboard';
import SmartItineraryPlanner from './components/SmartItineraryPlanner';

// Phase 4 Modules
import LocalBusinessMarketplace from './components/LocalBusinessMarketplace';
import BusinessOwnerDashboard from './components/BusinessOwnerDashboard';
import TourismAuthorityDashboard from './components/TourismAuthorityDashboard';

import { DESTINATIONS } from './data/destinations';
import { translations } from './data/translations';

export default function App() {
  const [currentLang, setLang] = useState('en');
  const [activeView, setActiveView] = useState('tourist'); // 'tourist', 'crowd', 'itinerary', 'map', 'recommendations', 'marketplace', 'companion', 'business', 'authority'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeRegion, setActiveRegion] = useState('All');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Persistent Favorites in localStorage
  const [savedFavorites, setSavedFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('goasmart_favorites');
      return stored ? JSON.parse(stored) : ['galgibaga-beach', 'cola-beach'];
    } catch {
      return ['galgibaga-beach', 'cola-beach'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('goasmart_favorites', JSON.stringify(savedFavorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }, [savedFavorites]);

  const t = translations[currentLang] || translations.en;

  const handleToggleFavorite = (id) => {
    setSavedFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearFavorites = () => {
    setSavedFavorites([]);
  };

  const handleSelectAlternative = (alternativeDest) => {
    setSelectedDestination(alternativeDest);
  };

  const handleSelectDestinationById = (id) => {
    const found = DESTINATIONS.find((d) => d.id === id);
    if (found) {
      setSelectedDestination(found);
    }
  };

  const handleScrollToExplore = () => {
    setActiveView('tourist');
    setTimeout(() => {
      const elem = document.getElementById('explore-section');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleFilterVibe = (tagOrCategory) => {
    setActiveView('tourist');
    if (
      tagOrCategory === 'Eco-Tourism & Quiet Beach' ||
      tagOrCategory === 'Heritage & Culture' ||
      tagOrCategory === 'Waterfall & Nature'
    ) {
      setActiveCategory(tagOrCategory);
    } else {
      setSearchQuery(tagOrCategory);
    }
    setTimeout(() => {
      const elem = document.getElementById('explore-section');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      
      {/* Navigation Bar */}
      <Navbar
        currentLang={currentLang}
        setLang={setLang}
        t={t}
        savedCount={savedFavorites.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Realtime Crowd Status Marquee Ticker */}
      <CrowdStatusTicker
        destinations={DESTINATIONS}
        onSelectDestination={handleSelectDestinationById}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {/* View 1: Phase 1 Tourist Home & Explorer */}
        {activeView === 'tourist' && (
          <>
            <Hero
              t={t}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onExploreClick={handleScrollToExplore}
              onAiClick={() => {
                setActiveView('companion');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onFilterVibe={handleFilterVibe}
            />

            <TouristDashboard
              destinations={DESTINATIONS}
              savedFavorites={savedFavorites}
              onToggleFavorite={handleToggleFavorite}
              onSelectDestination={(dest) => setSelectedDestination(dest)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              activeRegion={activeRegion}
              setActiveRegion={setActiveRegion}
              t={t}
            />

            <WhyGoaSmart />
          </>
        )}

        {/* View 2: Phase 3 Crowd Intelligence Dashboard */}
        {activeView === 'crowd' && (
          <CrowdIntelligenceDashboard
            onSelectDestinationModal={(dest) => setSelectedDestination(dest)}
            onNavigateToItinerary={() => {
              setActiveView('itinerary');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            t={t}
          />
        )}

        {/* View 3: Phase 3 Smart Itinerary Planner */}
        {activeView === 'itinerary' && (
          <SmartItineraryPlanner
            onSelectDestinationModal={(dest) => setSelectedDestination(dest)}
            onOpenMap={() => {
              setActiveView('map');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            t={t}
          />
        )}

        {/* View 4: Phase 2 Interactive Goa Map */}
        {activeView === 'map' && (
          <InteractiveMap
            onSelectDestinationModal={(dest) => setSelectedDestination(dest)}
            savedFavorites={savedFavorites}
            onToggleFavorite={handleToggleFavorite}
            t={t}
          />
        )}

        {/* View 5: Phase 2 Smart Destination Recommendations */}
        {activeView === 'recommendations' && (
          <SmartRecommendations
            savedFavorites={savedFavorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectDestinationModal={(dest) => setSelectedDestination(dest)}
            t={t}
          />
        )}

        {/* View 6: Phase 4 Local Business Marketplace */}
        {activeView === 'marketplace' && (
          <LocalBusinessMarketplace
            onSelectBusinessOwnerPortal={() => {
              setActiveView('business');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            t={t}
          />
        )}

        {/* View 7: Phase 2 AI Tourism Companion Chatbot */}
        {activeView === 'companion' && (
          <AIChatbot
            onSelectDestination={(dest) => setSelectedDestination(dest)}
            onBackToExplore={() => setActiveView('tourist')}
          />
        )}

        {/* View 8: Phase 4 Local Business Owner Portal */}
        {activeView === 'business' && (
          <BusinessOwnerDashboard
            onBackToMarketplace={() => {
              setActiveView('marketplace');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* View 9: Phase 4 Tourism Authority Analytics Dashboard */}
        {activeView === 'authority' && (
          <TourismAuthorityDashboard
            onSelectDestinationModal={(dest) => setSelectedDestination(dest)}
            onNavigateToMarketplace={() => {
              setActiveView('marketplace');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Destination Deep-Dive Modal (Universally available across all views) */}
      {selectedDestination && (
        <DestinationModal
          destination={selectedDestination}
          allDestinations={DESTINATIONS}
          isFavorite={savedFavorites.includes(selectedDestination.id)}
          onToggleFavorite={handleToggleFavorite}
          onClose={() => setSelectedDestination(null)}
          onSelectAlternative={handleSelectAlternative}
          t={t}
        />
      )}

      {/* Saved Places / Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={savedFavorites}
        allDestinations={DESTINATIONS}
        onRemoveFavorite={handleToggleFavorite}
        onClearFavorites={handleClearFavorites}
        onSelectDestination={(dest) => setSelectedDestination(dest)}
      />

      {/* Comprehensive Footer */}
      <Footer
        onSelectRole={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        t={t}
      />

    </div>
  );
}
