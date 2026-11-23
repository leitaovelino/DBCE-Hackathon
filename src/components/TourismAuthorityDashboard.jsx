import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldAlert, ShieldCheck, Activity, BarChart3, TrendingDown, TrendingUp, Users, MapPin, AlertTriangle, ArrowRight, CheckCircle2, Filter, Info, Compass, Layers } from 'lucide-react';
import { DESTINATIONS } from '../data/destinations';
import {
  AUTHORITY_KPIS,
  REGIONAL_VISITOR_FLOW,
  DAILY_VISITOR_TREND,
  CATEGORY_DISTRIBUTION,
  NUDGE_IMPACT_COMPARISONS,
  AUTHORITY_INSIGHTS
} from '../services/authorityService';

export default function TourismAuthorityDashboard({
  onSelectDestinationModal,
  onNavigateToMarketplace
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  const [selectedDestId, setSelectedDestId] = useState('baga-beach');
  const [activeRegionFilter, setActiveRegionFilter] = useState('All');
  const [activeCrowdFilter, setActiveCrowdFilter] = useState('All'); // 'All', 'LOW', 'MODERATE', 'HIGH'
  const [dateRange, setDateRange] = useState('Today (Peak Weekend)');

  // Filtered destinations for the authority
  const filteredDestinations = DESTINATIONS.filter((d) => {
    if (activeRegionFilter !== 'All' && d.region !== activeRegionFilter) return false;
    if (activeCrowdFilter === 'LOW' && d.crowdScore >= 40) return false;
    if (activeCrowdFilter === 'MODERATE' && (d.crowdScore < 40 || d.crowdScore > 70)) return false;
    if (activeCrowdFilter === 'HIGH' && d.crowdScore <= 70) return false;
    return true;
  });

  const selectedDestination =
    DESTINATIONS.find((d) => d.id === selectedDestId) || filteredDestinations[0] || DESTINATIONS[0];

  // Leaflet Authority GIS Map Setup
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [15.35, 73.95],
        zoom: 10,
        minZoom: 9,
        maxZoom: 18,
        scrollWheelZoom: true
      });

      // Standard OpenStreetMap tiles (100% free, no API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Authority Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    filteredDestinations.forEach((dest) => {
      const isSelected = dest.id === selectedDestId;
      const pinColor =
        dest.crowdScore > 70 ? '#ef4444' :
        dest.crowdScore >= 40 ? '#f59e0b' : '#10b981';

      const customIcon = L.divIcon({
        className: 'authority-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="
              width: ${isSelected ? '38px' : '28px'};
              height: ${isSelected ? '38px' : '28px'};
              border-radius: 50%;
              background: ${pinColor};
              border: 3px solid #0f172a;
              box-shadow: 0 0 14px ${pinColor};
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.25s ease-out;
            ">
              <span style="font-size: 10px; font-weight: 900; color: #ffffff;">${dest.crowdScore}</span>
            </div>
            ${isSelected ? `
              <div style="
                position: absolute;
                top: -26px;
                background: #0f172a;
                color: #38bdf8;
                border: 1px solid #0284c7;
                font-size: 11px;
                font-weight: 800;
                padding: 2px 8px;
                border-radius: 9999px;
                white-space: nowrap;
                pointer-events: none;
              ">
                ${dest.name}
              </div>
            ` : ''}
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker([dest.coordinates.lat, dest.coordinates.lng], { icon: customIcon })
        .addTo(map)
        .on('click', () => {
          setSelectedDestId(dest.id);
          map.flyTo([dest.coordinates.lat, dest.coordinates.lng], 13, { duration: 1.2 });
        });

      markersRef.current[dest.id] = marker;
    });
  }, [filteredDestinations, selectedDestId]);

  return (
    <div className="py-8 sm:py-12 bg-slate-950 text-white min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Bar */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-2 border border-blue-400/30">
              <ShieldCheck className="w-4 h-4" />
              <span>Goa State Tourism Department Command Center</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Tourism Authority Crowd Analytics & Nudge Telemetry
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              State-wide visitor density radar, regional congestion monitoring, and algorithmic diversion impact metrics.
            </p>
          </div>

          <div className="self-start md:self-auto flex flex-col items-start md:items-end gap-1.5">
            <span className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Telemetry: {AUTHORITY_KPIS.lastSync}</span>
            </span>
            <span className="text-[11px] text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800">
              *All telemetry data generated by GoaSmart Synthetic Simulation Engine v1.2
            </span>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          
          {/* Region Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">Region:</span>
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
              {['All', 'North Goa', 'South Goa', 'Central Goa'].map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRegionFilter(r)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeRegionFilter === r ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Crowd Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">Density Tier:</span>
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
              {['All', 'LOW', 'MODERATE', 'HIGH'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setActiveCrowdFilter(lvl)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeCrowdFilter === lvl ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">Evaluation Window:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-hidden font-semibold cursor-pointer"
            >
              <option value="Today (Peak Weekend)">Today (Peak Weekend)</option>
              <option value="Past 7 Days Aggregated">Past 7 Days Aggregated</option>
              <option value="Festival Season Surge (Carnival/Sunburn)">Festival Surge (Carnival/Sunburn)</option>
            </select>
          </div>

        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
            <span className="text-xs text-slate-400 font-medium">State-Wide Active Monitored Spots</span>
            <div className="text-3xl font-black text-cyan-400 mt-1">{AUTHORITY_KPIS.totalMonitoredDestinations} Zones</div>
            <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">100% Sensors Online & Calibrated</span>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
            <span className="text-xs text-slate-400 font-medium">Estimated State Tourist Load</span>
            <div className="text-3xl font-black text-white mt-1">{AUTHORITY_KPIS.totalSimulatedVisitors.toLocaleString()}</div>
            <span className="text-[11px] text-slate-400 font-medium mt-1 block">Peak weekend saturation flow</span>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
            <span className="text-xs text-slate-400 font-medium">Automated Tourist Nudges Issued</span>
            <div className="text-3xl font-black text-amber-400 mt-1">{AUTHORITY_KPIS.nudgesIssuedToday.toLocaleString()}</div>
            <span className="text-[11px] text-amber-300 font-semibold mt-1 block">{AUTHORITY_KPIS.touristsRedirected.toLocaleString()} tourists successfully rerouted</span>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
            <span className="text-xs text-slate-400 font-medium">Algorithmic Diversion Success</span>
            <div className="text-3xl font-black text-emerald-400 mt-1">{AUTHORITY_KPIS.diversionSuccessRate}%</div>
            <span className="text-[11px] text-emerald-300 font-semibold mt-1 block">-28% choke reduction at Baga/Calangute</span>
          </div>
        </div>

        {/* Goa Crowd Monitoring Map & Selected Zone Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Map */}
          <div className="lg:col-span-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[520px] relative">
            <div className="absolute top-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 text-[11px] text-slate-300 space-y-1 hidden sm:block">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Heatmap Density</span>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span>Low Density (&lt;40%)</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span>Moderate Density (40-70%)</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /><span>Critical Congestion (&gt;70%)</span></div>
            </div>

            <div ref={mapContainerRef} className="w-full h-full z-0" />
          </div>

          {/* Selected Zone Telemetry Card */}
          <div className="lg:col-span-4 bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
            {selectedDestination && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                      Selected Telemetry Node
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">{selectedDestination.name}</h3>
                    <p className="text-xs text-slate-400">
                      {selectedDestination.region} • {selectedDestination.taluka} Taluka
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                    selectedDestination.crowdScore > 70 ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                    selectedDestination.crowdScore >= 40 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {selectedDestination.crowdScore}% Density
                  </span>
                </div>

                <img
                  src={selectedDestination.image}
                  alt={selectedDestination.name}
                  className="w-full h-36 rounded-2xl object-cover border border-slate-800"
                />

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Simulated Active Visitors</span>
                    <span className="text-sm font-bold text-white">{selectedDestination.estimatedVisitorsNow.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Peak Congestion Hours</span>
                    <span className="text-xs font-semibold text-amber-400">{selectedDestination.peakHours.split('(')[0]}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {selectedDestination.description}
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => onSelectDestinationModal(selectedDestination)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    View Destination Forecasting Curve
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Visitor Flow Analytics: Regional Comparison & Daily Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Regional Flow Comparison */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <span>Regional Visitor Distribution (North vs South vs Central)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Footfall share across Goan administrative sectors</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">100% Total</span>
            </div>

            <div className="space-y-4 pt-2">
              {REGIONAL_VISITOR_FLOW.map((reg) => (
                <div key={reg.region} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{reg.region}</span>
                    <span className="text-slate-400">
                      <strong>{reg.visitorCount.toLocaleString()}</strong> ({reg.sharePercent}%) • <span style={{ color: reg.color }}>{reg.status}</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      style={{ width: `${reg.sharePercent}%`, backgroundColor: reg.color }}
                      className="h-full rounded-full transition-all duration-700"
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              Insight: North Goa absorbs over 52% of visitors. Strategic nudges to Canacona and Sanguem have increased South Goa capture by +8% this quarter.
            </p>
          </div>

          {/* Daily Visitor Trends Chart */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span>Diurnal Visitor Progression by Hour</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">08:00 to 20:00</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">Simulated hourly inflow comparing North (Red), Central (Cyan) and South (Green)</p>

              {/* Multi-series Bar Chart */}
              <div className="grid grid-cols-7 gap-2 items-end h-40 pt-6 pb-2 px-2 bg-slate-950 rounded-2xl border border-slate-800">
                {DAILY_VISITOR_TREND.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <div className="flex items-end gap-1 h-full w-full justify-center">
                      <div
                        className="w-2 sm:w-2.5 bg-red-500 rounded-t-sm"
                        style={{ height: `${(item.north / 5600) * 100}%` }}
                        title={`North: ${item.north}`}
                      />
                      <div
                        className="w-2 sm:w-2.5 bg-cyan-400 rounded-t-sm"
                        style={{ height: `${(item.central / 5600) * 100}%` }}
                        title={`Central: ${item.central}`}
                      />
                      <div
                        className="w-2 sm:w-2.5 bg-emerald-500 rounded-t-sm"
                        style={{ height: `${(item.south / 5600) * 100}%` }}
                        title={`South: ${item.south}`}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-2 whitespace-nowrap">
                      {item.hour.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs pt-2 text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /><span>North Goa (Hotspots)</span></span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /><span>Central Goa (Heritage)</span></span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span>South Goa (Eco-Peaceful)</span></span>
            </div>
          </div>

        </div>

        {/* Tourist Nudge Impact: Before vs After Comparison */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-1 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulated Intervention Assessment</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Tourist Nudge Dispersal Impact (Before vs. After Comparison)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulated outcomes demonstrating how proactive AI recommendations reduce peak congestion at hotspots while channeling footfall into quiet local destinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NUDGE_IMPACT_COMPARISONS.map((comp, idx) => (
              <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-slate-300">{comp.hotspotName}</span>
                    <span className="text-[10px] text-slate-500 block">vs. Alternative: {comp.alternativeName}</span>
                  </div>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-800">
                    {comp.hotspotReduction} Peak Drop
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Hotspot comparison */}
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block">{comp.hotspotName}</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-slate-400 line-through text-xs font-mono">{comp.beforeHotspot}%</span>
                      <ArrowRight className="w-3 h-3 text-emerald-400" />
                      <span className="text-base font-black text-emerald-400 font-mono">{comp.afterHotspot}%</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Hotspot congestion relieved</span>
                  </div>

                  {/* Alternative destination gain */}
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block">{comp.alternativeName}</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-slate-400 line-through text-xs font-mono">{comp.beforeAlt}%</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                      <span className="text-base font-black text-cyan-400 font-mono">{comp.afterAlt}%</span>
                    </div>
                    <span className="text-[10px] text-teal-300 font-bold mt-1 block">Local revenue: {comp.businessBoost}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 italic">
            *Values represent simulated outcome projections generated by GoaSmart heuristic distribution algorithms to illustrate capacity balancing.
          </p>
        </div>

        {/* Rule-Based Authority Proactive Insights */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-4 shadow-xl">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            <span>Automated Authority Recommendations & Strategic Insights</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AUTHORITY_INSIGHTS.map((insight, idx) => (
              <div
                key={idx}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className={`w-2 h-2 rounded-full ${
                      insight.type === 'critical' ? 'bg-red-500' :
                      insight.type === 'success' ? 'bg-emerald-500' : 'bg-cyan-400'
                    }`} />
                    <h4 className="text-xs font-bold text-white">{insight.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {insight.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[10px] text-cyan-300 font-semibold">
                  Action: {insight.action}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
