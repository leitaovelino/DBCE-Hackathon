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

// Phase 5 Auth & RBAC
import { useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import ProtectedAccessGuard from './components/ProtectedAccessGuard';

import { DESTINATIONS } from './data/destinations';
import { translations } from './data/translations';
import { getDestinations } from './services/destinationService';

export default function App() {
  const [currentLang, setLang] = useState('en');
  const [activeView, setActiveView] = useState('tourist'); // 'tourist', 'crowd', 'itinerary', 'map', 'recommendations', 'marketplace', 'companion', 'business', 'authority'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeRegion, setActiveRegion] = useState('All');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Firestore Destinations State (with immediate local fallback)
  const [destinations, setDestinations] = useState(DESTINATIONS);
  const [destinationsLoading, setDestinationsLoading] = useState(true);

  // Active Route Geometry for Map Plotting (from OpenRouteService)
  const [activeRouteGeometry, setActiveRouteGeometry] = useState(null);

  // Load live destinations from Cloud Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadLiveDestinations() {
      setDestinationsLoading(true);
      try {
        const liveData = await getDestinations();
        if (isMounted && liveData && liveData.length > 0) {
          setDestinations(liveData);
        }
      } catch (err) {
        console.warn('Using local destinations fallback:', err);
      } finally {
        if (isMounted) setDestinationsLoading(false);
      }
    }
    loadLiveDestinations();
    return () => { isMounted = false; };
  }, []);

  // Auth & Profile Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const { user, userProfile, role, isAuthenticated } = useAuth();

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
    const found = destinations.find((d) => d.id === id);
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white transition-colors duration-200">
      
      {/* Navigation Bar */}
      <Navbar
        currentLang={currentLang}
        setLang={setLang}
        t={t}
        savedCount={savedFavorites.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAuthModal={(mode = 'login') => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
        onOpenProfileModal={() => setProfileModalOpen(true)}
      />

      {/* Realtime Crowd Status Marquee Ticker */}
      <CrowdStatusTicker
        destinations={destinations}
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
              destinations={destinations}
              loading={destinationsLoading}
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
            onViewRouteOnMap={(geometry) => {
              setActiveRouteGeometry(geometry);
              setActiveView('map');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            t={t}
          />
        )}

        {/* View 4: Phase 2 Interactive Goa Map */}
        {activeView === 'map' && (
          <InteractiveMap
            destinations={destinations}
            routeGeometry={activeRouteGeometry}
            onClearRoute={() => setActiveRouteGeometry(null)}
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

        {/* View 8: Phase 4 Local Business Owner Portal (Protected: Business Owner or Authority) */}
        {activeView === 'business' && (
          (role === 'business_owner' || role === 'authority') ? (
            <BusinessOwnerDashboard
              onBackToMarketplace={() => {
                setActiveView('marketplace');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : (
            <ProtectedAccessGuard
              requiredRole="business_owner"
              onOpenAuth={(mode) => {
                setAuthModalMode(mode || 'login');
                setAuthModalOpen(true);
              }}
              onBackToExplore={() => setActiveView('tourist')}
            />
          )
        )}

        {/* View 9: Phase 4 Tourism Authority Analytics Dashboard (Protected: Authority Only) */}
        {activeView === 'authority' && (
          (role === 'authority') ? (
            <TourismAuthorityDashboard
              onSelectDestinationModal={(dest) => setSelectedDestination(dest)}
              onNavigateToMarketplace={() => {
                setActiveView('marketplace');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : (
            <ProtectedAccessGuard
              requiredRole="authority"
              onOpenAuth={(mode) => {
                setAuthModalMode(mode || 'login');
                setAuthModalOpen(true);
              }}
              onBackToExplore={() => setActiveView('tourist')}
            />
          )
        )}
      </main>

      {/* Destination Deep-Dive Modal (Universally available across all views) */}
      {selectedDestination && (
        <DestinationModal
          destination={selectedDestination}
          allDestinations={destinations}
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
        allDestinations={destinations}
        onRemoveFavorite={handleToggleFavorite}
        onClearFavorites={handleClearFavorites}
        onSelectDestination={(dest) => setSelectedDestination(dest)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onLogoutSuccess={() => {
          setActiveView('tourist');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSwitchAccount={() => {
          setProfileModalOpen(false);
          setAuthModalMode('login');
          setAuthModalOpen(true);
        }}
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
