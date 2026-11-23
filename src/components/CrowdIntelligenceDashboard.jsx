import React, { useState, useMemo } from 'react';
import { ShieldAlert, ShieldCheck, Clock, Users, Search, Filter, AlertTriangle, TrendingUp, Calendar, ArrowRight, Sun, MapPin, Info, Sparkles, CheckCircle2 } from 'lucide-react';
import { DESTINATIONS } from '../data/destinations';
import { getCrowdCategory, getCrowdDistribution, getDestinationForecast, SIMULATION_NOTICE } from '../services/crowdService';
import { SMART_NUDGES } from '../services/nudgeService';

export default function CrowdIntelligenceDashboard({
  onSelectDestinationModal,
  onNavigateToItinerary,
  t
}) {
  const [selectedDestId, setSelectedDestId] = useState('baga-beach');
  const [activeRegion, setActiveRegion] = useState('All');
  const [activeLevelFilter, setActiveLevelFilter] = useState('All'); // 'All', 'LOW', 'MODERATE', 'HIGH'
  const [searchQuery, setSearchQuery] = useState('');

  // Distribution stats
  const distribution = useMemo(() => getCrowdDistribution(DESTINATIONS), []);

  // Filtered destination list
  const filteredDestinations = useMemo(() => {
    return DESTINATIONS.filter((d) => {
      // Region filter
      if (activeRegion !== 'All' && d.region !== activeRegion) return false;

      // Crowd level filter
      const cat = getCrowdCategory(d.crowdScore).category;
      if (activeLevelFilter !== 'All' && cat !== activeLevelFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = d.name.toLowerCase().includes(q);
        const matchTaluka = d.taluka.toLowerCase().includes(q);
        const matchRegion = d.region.toLowerCase().includes(q);
        if (!matchName && !matchTaluka && !matchRegion) return false;
      }

      return true;
    }).sort((a, b) => b.crowdScore - a.crowdScore);
  }, [activeRegion, activeLevelFilter, searchQuery]);

  // Selected destination forecast details
  const forecastData = useMemo(() => getDestinationForecast(selectedDestId), [selectedDestId]);

  return (
    <div className="py-8 sm:py-12 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-80px)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top Disclaimer / Header Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-4 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 text-xs font-bold rounded-full mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>Crowd Analytics & Predictive Telemetry</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Crowd Intelligence Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
                Real-time estimated crowd indices, regional footfall dispersal, and hourly forecasts across all monitored tourist zones in Goa.
              </p>
            </div>

            {/* Sync Timestamp & Disclaimer Badge */}
            <div className="self-start md:self-auto flex flex-col items-start md:items-end gap-1.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Last updated: {forecastData.lastUpdated}</span>
              </div>
              <span className="text-[11px] text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900/60">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>{SIMULATION_NOTICE}</span>
              </span>
            </div>
          </div>

          {/* Crowd Distribution KPI Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">Monitored Zones</span>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{distribution.total} Destinations</div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">North, South & Central Goa</span>
            </div>

            <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50">
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold block flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>LOW CROWD (Serene)</span>
              </span>
              <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">
                {distribution.low.count} <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">({distribution.low.percentage}%)</span>
              </div>
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300">Ideal for peaceful visits</span>
            </div>

            <div className="bg-amber-50/70 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/50">
              <span className="text-xs text-amber-800 dark:text-amber-300 font-bold block flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>MODERATE CROWD</span>
              </span>
              <div className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-1">
                {distribution.moderate.count} <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">({distribution.moderate.percentage}%)</span>
              </div>
              <span className="text-[11px] text-amber-800 dark:text-amber-300">Manageable foot traffic</span>
            </div>

            <div className="bg-red-50/70 dark:bg-red-950/40 p-4 rounded-2xl border border-red-200/80 dark:border-red-900/50">
              <span className="text-xs text-red-800 dark:text-red-300 font-bold block flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span>HIGH CROWD (Congested)</span>
              </span>
              <div className="text-2xl font-black text-red-900 dark:text-red-200 mt-1">
                {distribution.high.count} <span className="text-sm font-semibold text-red-700 dark:text-red-400">({distribution.high.percentage}%)</span>
              </div>
              <span className="text-[11px] text-red-800 dark:text-red-300">Nudges active for diversion</span>
            </div>
          </div>

          {/* Visual Distribution Segment Bar */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1.5">
              <span>Overall State Crowd Distribution</span>
              <span>100% Simulated Capacity</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 flex overflow-hidden">
              <div
                style={{ width: `${distribution.low.percentage}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Low Crowd: ${distribution.low.percentage}%`}
              />
              <div
                style={{ width: `${distribution.moderate.percentage}%` }}
                className="bg-amber-400 h-full transition-all"
                title={`Moderate Crowd: ${distribution.moderate.percentage}%`}
              />
              <div
                style={{ width: `${distribution.high.percentage}%` }}
                className="bg-red-500 h-full transition-all"
                title={`High Crowd: ${distribution.high.percentage}%`}
              />
            </div>
          </div>

        </div>

        {/* Intelligent Tourist Nudges Showcase Banner */}
        <div className="bg-gradient-to-r from-amber-50 via-teal-50 to-emerald-50 dark:from-slate-900 dark:via-teal-950/30 dark:to-slate-900 border border-teal-200 dark:border-teal-800/60 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                  Active Intelligent Tourist Nudges
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Automated congestion diversion suggestions based on simulated peak crowd thresholds
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToItinerary}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
            >
              <span>Apply to Smart Itinerary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {SMART_NUDGES.slice(0, 3).map((nudge) => (
              <div
                key={nudge.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-teal-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[11px] font-extrabold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/50">
                      {nudge.originalName}: {nudge.originalCrowd}% HIGH
                    </span>
                    <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/50">
                      -{nudge.crowdSavedPercent}% Crowd
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">{nudge.headline}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    {nudge.reason}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Best: {nudge.suggestedTime.split('(')[0]}</span>
                  <button
                    onClick={() => setSelectedDestId(nudge.alternativeDestId)}
                    className="font-bold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View {nudge.alternativeName.split(' ')[0]}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive Forecast Section for Selected Destination */}
        {forecastData && (
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={forecastData.destination.image}
                  alt={forecastData.destination.name}
                  className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight">{forecastData.destination.name}</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white/10 text-cyan-300">
                      {forecastData.destination.region}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {forecastData.destination.taluka} Taluka • {forecastData.destination.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 border ${
                  forecastData.currentCategory.category === 'HIGH' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                  forecastData.currentCategory.category === 'MODERATE' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${forecastData.currentCategory.dot} animate-pulse`} />
                  <span>Current Status: {forecastData.currentCategory.category} ({forecastData.currentScore}% Density)</span>
                </div>

                <button
                  onClick={() => onSelectDestinationModal(forecastData.destination)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Full Details
                </button>
              </div>
            </div>

            {/* 3 Forecast Cards: Upcoming Hours, Tomorrow, Weekly */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 1. Next Few Hours */}
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Forecast: Next 6 Hours</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">Hourly Projection</span>
                  </div>

                  <div className="space-y-2.5">
                    {forecastData.nextHours.map((nh, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">{nh.time}</span>
                        <div className="flex items-center gap-2 flex-1 max-w-[140px] mx-3">
                          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                nh.crowd > 70 ? 'bg-red-500' : nh.crowd >= 40 ? 'bg-amber-400' : 'bg-emerald-400'
                              }`}
                              style={{ width: `${nh.crowd}%` }}
                            />
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-200 text-right w-12">{nh.crowd}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-700">
                  Peak expected between {forecastData.destination.peakHours.split('(')[0]}
                </p>
              </div>

              {/* 2. Tomorrow Forecast */}
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5" />
                      <span>Tomorrow's Outlook</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">Diurnal Profile</span>
                  </div>

                  <div className="space-y-3">
                    {forecastData.tomorrow.map((tm, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs">
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span className="text-slate-200">{tm.period}</span>
                          <span className={tm.crowd > 70 ? 'text-red-400 font-mono' : 'text-emerald-400 font-mono'}>
                            {tm.crowd}% Crowd
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{tm.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-700">
                  Recommended window: <strong>{forecastData.destination.bestTimeToVisit.split('(')[0]}</strong>
                </p>
              </div>

              {/* 3. Weekly Trend Curve */}
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Weekly Crowd Surge (Mon - Sun)</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">Synthetic Model</span>
                  </div>

                  {/* SVG Bar / Curve */}
                  <div className="grid grid-cols-7 gap-1.5 items-end h-36 pt-6 pb-2 px-1 bg-slate-900/80 rounded-xl border border-slate-700/60">
                    {forecastData.weekly.map((w, idx) => {
                      const barColor = w.weekend ? 'bg-red-500' : w.crowd >= 40 ? 'bg-amber-400' : 'bg-emerald-400';
                      return (
                        <div key={idx} className="flex flex-col items-center h-full justify-end group">
                          <span className="text-[9px] font-mono text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {w.crowd}%
                          </span>
                          <div
                            className={`w-full max-w-[24px] rounded-t-sm transition-all duration-300 ${barColor}`}
                            style={{ height: `${Math.max(w.crowd, 12)}%` }}
                          />
                          <span className={`text-[10px] font-bold mt-1.5 ${w.weekend ? 'text-amber-400' : 'text-slate-400'}`}>
                            {w.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-700">
                  <span className="flex items-center gap-1 text-amber-300">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Weekend surges +25%</span>
                  </span>
                  <span>Midweek offers highest tranquility</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Destination-Wise Crowd Overview Table / Grid */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6 transition-colors">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Destination-Wise Crowd Overview
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any row or card to update the predictive forecast graphs above
              </p>
            </div>

            {/* Region & Level Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Region Tabs */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                {['All', 'North Goa', 'South Goa', 'Central Goa'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setActiveRegion(r)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeRegion === r ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                {['All', 'LOW', 'MODERATE', 'HIGH'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setActiveLevelFilter(lvl)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeLevelFilter === lvl ? 'bg-cyan-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination by name or taluka..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-hidden transition-all"
            />
          </div>

          {/* Grid of All Destinations with Crowd Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredDestinations.map((dest) => {
              const cat = getCrowdCategory(dest.crowdScore);
              const isSelected = dest.id === selectedDestId;

              return (
                <div
                  key={dest.id}
                  onClick={() => setSelectedDestId(dest.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-50/70 dark:bg-cyan-950/40 border-cyan-400 dark:border-cyan-500 shadow-md ring-2 ring-cyan-400/20'
                      : 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${cat.bg}`}>
                        {cat.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                        {dest.crowdScore}%
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1 truncate">{dest.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-3">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{dest.region} • {dest.taluka}</span>
                    </p>

                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          dest.crowdScore > 70 ? 'bg-red-500' : dest.crowdScore >= 40 ? 'bg-amber-400' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${dest.crowdScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>Est. {dest.estimatedVisitorsNow.toLocaleString()} now</span>
                    <span className="font-semibold text-cyan-700 dark:text-cyan-400 hover:underline">Select & Forecast →</span>
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
