import React from 'react';
import { AlertTriangle, Sparkles, ShieldCheck, Compass, HeartHandshake, Trees, Map } from 'lucide-react';

export default function WhyGoaSmart() {
  return (
    <section className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 text-xs font-bold rounded-full border border-teal-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>The Goa Tourism Dilemma</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Goa Needs Intelligent Tourism Distribution
          </h2>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Over 9 million tourists concentrate on just 5% of Goa’s coastline, causing crippling gridlock, litter, and ecological distress—while interior villages and heritage homestays struggle for visibility.
          </p>
        </div>

        {/* Contrast Grid: Problem vs Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* Overcrowded Status Quo */}
          <div className="p-8 rounded-3xl bg-red-50/60 border border-red-200/80 space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <div className="p-2.5 rounded-xl bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold">The Problem: Concentrated Over-Tourism</h3>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>Baga & Calangute gridlock:</strong> Multi-hour traffic jams, severe parking shortages, and overcrowded sands degrading the visitor experience.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>Environmental & Beach Pressure:</strong> Plastic pollution, noise disturbance, and strain on fragile coastal ecosystems and turtle nesting zones.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>Economic Inequality:</strong> Big commercial strips hoard 85%+ of tourist spending while inland artisans, homestays, and local guides remain invisible.</span>
              </li>
            </ul>
          </div>

          {/* GoaSmart Solution */}
          <div className="p-8 rounded-3xl bg-emerald-50/60 border border-emerald-200/80 space-y-4">
            <div className="flex items-center gap-3 text-emerald-800">
              <div className="p-2.5 rounded-xl bg-emerald-100">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold">The Solution: GoaSmart Crowd Engine</h3>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Real-Time Crowd Estimation:</strong> Live indicators help tourists steer clear of peak congestion times and discover idyllic alternatives.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Fair Distribution to Villages:</strong> Promoting serene spots like Galgibaga, Divar Island, Netravali, and Tambdi Surla directly benefits local communities.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Data-Driven Authority Control:</strong> Empowers Goa Tourism Department with simulation forecasts and proactive crowd dispersal analytics.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* 3 Pillars of Impact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">For Tourists</h4>
            <p className="text-xs text-slate-600">
              Unforgettable peaceful vacations, transparent timings, and authentic Goan culture without fighting crowds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">For Local Businesses</h4>
            <p className="text-xs text-slate-600">
              Direct visibility for family homestays, pottery artisans, spice plantations, and village guides.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
              <Trees className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">For Goa & Ecology</h4>
            <p className="text-xs text-slate-600">
              Preserving fragile sand dunes, protecting Western Ghats forests, and sustaining Goa's heritage for future generations.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
