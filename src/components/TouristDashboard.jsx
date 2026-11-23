import React, { useState, useMemo } from 'react';
import DestinationCard from './DestinationCard';
import { Filter, SlidersHorizontal, MapPin, Sparkles, AlertCircle, Compass } from 'lucide-react';

export default function TouristDashboard({
  destinations,
  savedFavorites,
  onToggleFavorite,
  onSelectDestination,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  activeRegion,
  setActiveRegion,
  loading = false,
  t
}) {
  const [onlyPeaceful, setOnlyPeaceful] = useState(false);
  const [sortBy, setSortBy] = useState('crowd-low'); // crowd-low, crowd-high, rating, name

  // Filter & Sort Logic
  const filteredDestinations = useMemo(() => {
    return destinations
      .filter((d) => {
        // Search query filter (matches name, region, taluka, tags, activities)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = d.name.toLowerCase().includes(q);
          const matchRegion = d.region.toLowerCase().includes(q);
          const matchDesc = d.description.toLowerCase().includes(q);
          const matchTags = d.tags.some((t) => t.toLowerCase().includes(q));
          const matchActivities = d.activities.some((a) => a.toLowerCase().includes(q));
          if (!matchName && !matchRegion && !matchDesc && !matchTags && !matchActivities) {
            return false;
          }
        }

        // Region filter
        if (activeRegion !== 'All' && d.region !== activeRegion) {
          return false;
        }

        // Category filter
        if (activeCategory !== 'All') {
          if (activeCategory === 'Peaceful & Quiet') {
            if (d.crowdScore >= 50) return false;
          } else if (d.category !== activeCategory && !d.tags.includes(activeCategory)) {
            return false;
          }
        }

        // Peaceful Only toggle
        if (onlyPeaceful && d.crowdScore >= 40) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'crowd-low') return a.crowdScore - b.crowdScore;
        if (sortBy === 'crowd-high') return b.crowdScore - a.crowdScore;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [destinations, searchQuery, activeRegion, activeCategory, onlyPeaceful, sortBy]);

  const regionTabs = ['All', 'North Goa', 'South Goa', 'Central Goa'];
  const categoryPills = [
    'All',
    'Peaceful & Quiet',
    'Beach & Nightlife',
    'Eco-Tourism & Quiet Beach',
    'Heritage & Culture',
    'Waterfall & Nature',
    'Village Experience & Heritage'
  ];

  return (
    <section id="explore-section" className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-100 text-cyan-800 text-xs font-bold rounded-full mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>{t.nav.explore}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Goa Destinations & Live Crowd Levels
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Real-time crowd estimates and quieter, sustainable alternatives across North, South and Central Goa.
            </p>
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl self-start md:self-auto">
            {regionTabs.map((r) => (
              <button
                key={r}
                onClick={() => setActiveRegion(r)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeRegion === r
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-8 space-y-3">
          
          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Category:
            </span>
            {categoryPills.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-cyan-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Secondary Controls: Peaceful toggle & Sort */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Peaceful Only Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyPeaceful}
                onChange={(e) => setOnlyPeaceful(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 border-slate-300"
              />
              <span className={`font-semibold ${onlyPeaceful ? 'text-emerald-700' : 'text-slate-700'}`}>
                {t.filters.peacefulOnly}
              </span>
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">{t.filters.sortBy}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1 font-semibold focus:outline-hidden focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="crowd-low">{t.filters.sortCrowdLow}</option>
                <option value="crowd-high">{t.filters.sortCrowdHigh}</option>
                <option value="rating">{t.filters.sortRating}</option>
                <option value="name">{t.filters.sortName}</option>
              </select>
            </div>

          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-bold text-slate-500">
            Showing <span className="text-slate-900">{filteredDestinations.length}</span> destinations
            {searchQuery && <span> matching "<strong className="text-cyan-700">{searchQuery}</strong>"</span>}
          </p>
          {(activeCategory !== 'All' || activeRegion !== 'All' || onlyPeaceful || searchQuery) && (
            <button
              onClick={() => {
                setActiveCategory('All');
                setActiveRegion('All');
                setOnlyPeaceful(false);
                setSearchQuery('');
              }}
              className="text-xs text-cyan-700 hover:text-cyan-900 font-bold underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Destinations Grid */}
        {loading && filteredDestinations.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl h-96 border border-slate-200 overflow-hidden p-4 space-y-4 shadow-xs">
                <div className="bg-slate-200 h-48 rounded-2xl w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-10 bg-slate-100 rounded-xl w-full mt-4"></div>
              </div>
            ))}
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No destinations found</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search keywords, region tabs, or clearing filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                isFavorite={savedFavorites.includes(destination.id)}
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelectDestination}
                t={t}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
