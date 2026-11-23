import React from 'react';
import { ShieldCheck, BarChart3, PieChart, Activity, Map, ArrowRight, TrendingDown } from 'lucide-react';

export default function AuthorityDashboardPreview({ onBackToExplore }) {
  return (
    <div className="py-16 bg-slate-900 text-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-4 border border-blue-400/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Tourism Authority Dashboard & Simulation Engine (Phase 4 Architecture)</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Goa Tourism Department Analytics
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Central command system providing real-time crowd heatmap telemetry, predictive visitor load forecasting, and multi-agent tourist simulations.
          </p>
        </div>

        {/* Simulated Telemetry Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Active Monitored Zones</span>
            <div className="text-2xl font-black text-cyan-400 mt-1">28 Zones</div>
            <span className="text-[10px] text-emerald-400 font-semibold">100% sensors online</span>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Estimated Live Tourists</span>
            <div className="text-2xl font-black text-white mt-1">42,850</div>
            <span className="text-[10px] text-cyan-400 font-semibold">Peak weekend flow</span>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Peak Congestion Drop</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">-34.8%</div>
            <span className="text-[10px] text-emerald-300 font-semibold">With GoaSmart routing</span>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Village Footfall Growth</span>
            <div className="text-2xl font-black text-teal-400 mt-1">+185%</div>
            <span className="text-[10px] text-teal-300 font-semibold">Decentralized spend</span>
          </div>
        </div>

        {/* What Will Be Available in Phase 4 */}
        <div className="bg-slate-800/60 p-8 rounded-3xl border border-slate-700 mb-12 space-y-6">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Key Modules Ready for Implementation in Phase 4</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-2">
              <h4 className="font-bold text-white text-sm">1. Multi-Agent Simulation Engine</h4>
              <p>
                Simulate 5,000 to 50,000 autonomous tourist agents traveling across Goa. Compares Scenario A (unregulated hotspot clustering) vs Scenario B (GoaSmart AI distributed recommendations).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-2">
              <h4 className="font-bold text-white text-sm">2. Interactive Leaflet GIS Map</h4>
              <p>
                Color-coded markers (Green, Yellow, Orange, Red) showing live crowd saturation, route congestion lines, and recommended alternative diversion corridors.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-2">
              <h4 className="font-bold text-white text-sm">3. Historical & Predictive Forecasting</h4>
              <p>
                Time-series forecasting models (using pandas and statsmodels) accounting for seasonal festivals (Sunburn, Carnival, Christmas/New Year) and weather conditions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-2">
              <h4 className="font-bold text-white text-sm">4. Multi-Tenant Regional Expansion</h4>
              <p>
                Clean modular architecture allowing the same intelligent platform to be adopted by other Indian states (Kerala, Himachal, Rajasthan) in the future.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={onBackToExplore}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Back to Destination Explorer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
