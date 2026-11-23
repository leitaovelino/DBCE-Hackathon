import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CrowdStatusTicker from './components/CrowdStatusTicker';
import TouristDashboard from './components/TouristDashboard';
import DestinationModal from './components/DestinationModal';
import FavoritesDrawer from './components/FavoritesDrawer';
import WhyGoaSmart from './components/WhyGoaSmart';
import BusinessPortalPreview from './components/BusinessPortalPreview';
import AuthorityDashboardPreview from './components/AuthorityDashboardPreview';
import Footer from './components/Footer';

import { DESTINATIONS } from './data/destinations';
import { translations } from './data/translations';

export default function App() {
  const [currentLang, setLang] = useState('en');
  const [activeView, setActiveView] = useState('tourist'); // 'tourist', 'business', 'authority'
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
      setActiveView('tourist');
    }
  };

  const handleScrollToExplore = () => {
    setActiveView('tourist');
    const elem = document.getElementById('explore-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFilterVibe = (tagOrCategory) => {
    setActiveView('tourist');
    if (tagOrCategory === 'Eco-Tourism & Quiet Beach' || tagOrCategory === 'Heritage & Culture' || tagOrCategory === 'Waterfall & Nature') {
      setActiveCategory(tagOrCategory);
    } else {
      setSearchQuery(tagOrCategory);
    }
    const elem = document.getElementById('explore-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
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
        {activeView === 'tourist' && (
          <>
            {/* Hero Section with Quick Search */}
            <Hero
              t={t}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onExploreClick={handleScrollToExplore}
              onFilterVibe={handleFilterVibe}
            />

            {/* Tourist Destination Explorer & Crowd Grid */}
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

            {/* Why GoaSmart Value Proposition */}
            <WhyGoaSmart />
          </>
        )}

        {activeView === 'business' && (
          <BusinessPortalPreview
            onBackToExplore={() => setActiveView('tourist')}
          />
        )}

        {activeView === 'authority' && (
          <AuthorityDashboardPreview
            onBackToExplore={() => setActiveView('tourist')}
          />
        )}
      </main>

      {/* Destination Deep-Dive Modal */}
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
