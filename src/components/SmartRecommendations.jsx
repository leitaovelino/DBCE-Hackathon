import React, { useState, useMemo } from 'react';
import { Sparkles, Heart, Star, MapPin, ArrowUpRight, Compass, ShieldCheck, CheckCircle2, Sliders, Filter } from 'lucide-react';
import { DESTINATIONS, RECOMMENDATION_CATEGORIES } from '../data/destinations';
import { generatePersonalizedRecommendations } from '../services/recommendationService';

export default function SmartRecommendations({
  savedFavorites,
  onToggleFavorite,
  onSelectDestinationModal,
  t
}) {
  const [activeCategory, setActiveCategory] = useState('All Recommendations');
  const [persona, setPersona] = useState('peaceful'); // 'peaceful', 'culture', 'adventure', 'budget'
  const [personaRegion, setPersonaRegion] = useState('All');

  // Filter recommendations by selected category tab
  const categoryRecommendations = useMemo(() => {
    if (activeCategory === 'All Recommendations') return DESTINATIONS;
    return DESTINATIONS.filter(
      (d) => d.recCategories && d.recCategories.includes(activeCategory)
    );
  }, [activeCategory]);

  // Compute personalized recommendations based on persona
  const personalizedPicks = useMemo(() => {
    return generatePersonalizedRecommendations({
      persona,
      region: personaRegion,
      maxCrowd: 45
    });
  }, [persona, personaRegion]);

  const personasList = [
    { id: 'peaceful', label: '🌿 Peaceful & Low-Crowd', desc: 'Avoid hotspots; seek pristine, tranquil nature' },
    { id: 'culture', label: '🏛️ Heritage & Culture', desc: 'UNESCO churches, ancient forts & Latin quarters' },
    { id: 'adventure', label: '🚣 Nature & Adventure', desc: 'Kayaking, trekking, birding & waterfalls' },
    { id: 'budget', label: '💰 Budget Conscious', desc: 'Zero entrance fees, fair local village dining' },
  ];

  return (
    <div className="py-8 sm:py-12 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-80px)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Title Banner */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300 text-xs font-bold mb-3">
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>AI-Powered Crowd Distribution Engine</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Smart Destination Recommendations
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Personalized, crowd-conscious suggestions that match your travel vibe while directing tourist footfalls away from saturated hotspots to preserve Goa’s ecosystem.
          </p>
        </div>

        {/* Personalized Recommendations Interactive Builder Box */}
        <div className="bg-gradient-to-br from-cyan-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-cyan-800/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">
                  Custom Recommendation Matcher
                </span>
                <h3 className="text-xl sm:text-2xl font-bold mt-1">
                  Tailored To Your Travel Style
                </h3>
              </div>

              {/* Region Pill Filter for Personalized */}
              <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl self-start sm:self-auto text-xs">
                {['All', 'North Goa', 'South Goa', 'Central Goa'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setPersonaRegion(r)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      personaRegion === r
                        ? 'bg-cyan-500 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Persona Selector Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {personasList.map((p) => {
                const isActive = persona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPersona(p.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'bg-white/15 border-cyan-400 text-white shadow-lg ring-2 ring-cyan-400/30'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="font-bold text-sm block mb-1">{p.label}</span>
                    <span className="text-[11px] text-slate-300 leading-snug">{p.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Personalized Recommendations Results Grid */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Matching Sustainable Picks ({personalizedPicks.length})</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Filtered by lowest current crowd index
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {personalizedPicks.map((dest) => (
                  <div
                    key={dest.id}
                    className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl p-3.5 transition-all flex flex-col justify-between group"
                  >
                    <div className="flex gap-3">
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 truncate">
                            {dest.name}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30 shrink-0">
                            {dest.crowdScore}% Crowd
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          <span>{dest.region} • {dest.category}</span>
                        </p>
                        <p className="text-[11px] text-slate-300 line-clamp-1 mt-1">
                          {dest.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                      <button
                        onClick={() => onSelectDestinationModal(dest)}
                        className="text-cyan-300 hover:text-white font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <span>View Details & Forecast</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onToggleFavorite(dest.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          savedFavorites.includes(dest.id)
                            ? 'text-red-400 bg-white/10'
                            : 'text-slate-300 hover:text-red-400 hover:bg-white/10'
                        }`}
                        title="Save to favorites"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            savedFavorites.includes(dest.id) ? 'fill-red-400' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Category-Based Recommendation Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Curated Recommendation Categories
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Browse destinations sorted by experiential categories
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {RECOMMENDATION_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-cyan-700 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryRecommendations.map((dest) => {
              const isFavorite = savedFavorites.includes(dest.id);
              return (
                <div
                  key={dest.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

                    {/* Category pill */}
                    <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200 text-[11px] font-bold rounded-full shadow-xs">
                      {dest.category}
                    </span>

                    {/* Favorite Button */}
                    <button
                      onClick={() => onToggleFavorite(dest.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 backdrop-blur-md shadow-xs transition-colors cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                      />
                    </button>

                    {/* Rating & Region */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="flex items-center gap-1 font-semibold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{dest.region}</span>
                      </span>

                      <span className="flex items-center gap-1 font-bold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{dest.rating}</span>
                        <span className="text-slate-300 font-normal">
                          ({(dest.reviewsCount / 1000).toFixed(1)}k)
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Name & Crowd Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4
                          onClick={() => onSelectDestinationModal(dest)}
                          className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors text-base cursor-pointer"
                        >
                          {dest.name}
                        </h4>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${
                            dest.crowdScore >= 80 ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900' :
                            dest.crowdScore >= 60 ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900' :
                            dest.crowdScore >= 40 ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900' :
                            'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                          }`}
                        >
                          {dest.crowdLevel} ({dest.crowdScore}%)
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {dest.description}
                      </p>

                      {/* Highlights Snapshot */}
                      {dest.highlights && (
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1 mb-4">
                          <div className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                            <span className="truncate">{dest.highlights[0]}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => onSelectDestinationModal(dest)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-700 dark:hover:bg-cyan-600 hover:text-white dark:hover:text-white text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>View Details</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
