import React from 'react';
import { Building2, Sparkles, PlusCircle, CheckCircle, Store, TrendingUp, Users, ArrowRight } from 'lucide-react';

export default function BusinessPortalPreview({ onBackToExplore }) {
  const sampleCategories = [
    { name: 'Family-Run Seafood Outlets', count: '48 verified' },
    { name: 'Heritage Homestays & Villas', count: '32 verified' },
    { name: 'River & Mangrove Kayak Guides', count: '18 verified' },
    { name: 'Spice Farms & Cooking Classes', count: '12 verified' },
    { name: 'Village Cycling & Walking Tours', count: '24 verified' },
    { name: 'Handicraft & Goan Clay Pottery', count: '15 verified' },
  ];

  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold mb-4">
            <Building2 className="w-4 h-4" />
            <span>Local Business Marketplace Preview (Phase 3 Architecture)</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Fair Visibility for Goan Local Businesses
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            GoaSmart guarantees that smaller family-run restaurants, homestays, and eco-guides receive equal promotional spotlight alongside major luxury resorts.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="p-3 bg-teal-50 text-teal-700 rounded-xl w-fit">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Direct Booking Management</h3>
            <p className="text-xs text-slate-600">
              List authentic Goan experiences, set seasonal prices, and accept booking requests directly from conscious travelers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="p-3 bg-cyan-50 text-cyan-700 rounded-xl w-fit">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Fair Recommendation Algorithm</h3>
            <p className="text-xs text-slate-600">
              No pay-to-win banner ads. Our AI distributes tourists fairly based on destination proximity and user preferences.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl w-fit">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Village Economy Uplift</h3>
            <p className="text-xs text-slate-600">
              Channel tourist dollars into authentic village craft workshops, inland agro-tourism, and traditional bakery experiences.
            </p>
          </div>
        </div>

        {/* Sample Categories in Pipeline */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-12">
          <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Eligible Local Enterprise Categories (Phase 3 Onboarding)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sampleCategories.map((c, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{c.name}</span>
                <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-bold">
                  {c.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={onBackToExplore}
            className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
          >
            <span>Back to Destination Explorer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
