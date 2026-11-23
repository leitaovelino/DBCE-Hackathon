import React from 'react';
import { Search, Sparkles, MapPin, Compass, ArrowRight, ShieldCheck, Users, TreePine, Waves, Bot } from 'lucide-react';

export default function Hero({ t, searchQuery, setSearchQuery, onExploreClick, onAiClick, onFilterVibe }) {
  const quickVibes = [
    { label: '🌊 Serene Beaches', tag: 'Eco-Tourism & Quiet Beach' },
    { label: '🚣 Lagoons & Kayaking', tag: 'Kayaking' },
    { label: '🏛️ Portuguese Heritage', tag: 'Heritage & Culture' },
    { label: '🌿 Waterfalls & Ghats', tag: 'Waterfall & Nature' },
    { label: '🐢 Turtle Conservation', tag: 'Eco-Tourism' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cyan-950 via-slate-900 to-slate-900 text-white pt-16 pb-24 lg:pt-20 lg:pb-32">
      {/* Background Glows & Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[130px]" />
        <div className="absolute top-36 right-1/4 w-80 h-80 bg-emerald-500 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Highlight Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md">
            <span>{t.hero.badge}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none mb-6">
            <span className="block">{t.hero.title}</span>
            <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Smart Crowd Distribution Platform
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>

          {/* Direct Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={onExploreClick}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <span>{t.hero.exploreButton}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onAiClick}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm rounded-xl backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>{t.hero.aiButton}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-900 font-extrabold">
                Live
              </span>
            </button>
          </div>
        </div>

        {/* Live Search & Filter Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white/10 p-2 sm:p-2.5 rounded-2xl backdrop-blur-lg border border-white/20 shadow-2xl flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-300 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.hero.searchPlaceholder}
                className="w-full pl-11 pr-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder-slate-300 text-sm rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-400 transition-all border border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-xs text-slate-300 hover:text-white bg-white/20 px-2 py-1 rounded-md cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              onClick={onExploreClick}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Vibes Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-xs text-slate-400 font-medium mr-1">Trending Vibes:</span>
            {quickVibes.map((vibe, idx) => (
              <button
                key={idx}
                onClick={() => onFilterVibe(vibe.tag)}
                className="px-3 py-1 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-cyan-400/50 rounded-full text-xs text-slate-200 transition-all cursor-pointer"
              >
                {vibe.label}
              </button>
            ))}
          </div>
        </div>

        {/* Impact Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">20+</div>
              <div className="text-xs text-slate-300 font-medium">{t.hero.statDestinations}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-400">-42%</div>
              <div className="text-xs text-slate-300 font-medium">{t.hero.statCrowdSaved}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-teal-300">100% Fair</div>
              <div className="text-xs text-slate-300 font-medium">{t.hero.statBusinesses}</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
