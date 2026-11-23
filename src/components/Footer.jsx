import React from 'react';
import { Compass, Heart, ShieldCheck, MapPin, Sparkles, Navigation } from 'lucide-react';

export default function Footer({ onSelectRole, t }) {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Brand Info & Mission */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white font-bold shadow-xs">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">GoaSmart</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Intelligent Tourism & Crowd Distribution Platform engineered for the ACM Hackathon (ME Track – Mobility & Environment). Balances visitor footfalls away from congested coastal hotspots while empowering interior Goan communities.
            </p>
            <div className="pt-1 text-[11px] text-cyan-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Designed for Sustainable Goa Tourism</span>
            </div>
          </div>

          {/* Column 2: Portal Navigation (Without Outdated Phase Numbers) */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Platform Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onSelectRole('tourist')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left block"
                >
                  Tourist Portal & Destination Explorer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectRole('map')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left block"
                >
                  Interactive Goa Tourism Map
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectRole('itinerary')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left block"
                >
                  Smart Itinerary Planner & Routes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectRole('crowd')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left block"
                >
                  Crowd Intelligence Radar
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectRole('companion')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left block"
                >
                  AI Travel Companion
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectRole('marketplace')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left block"
                >
                  Local Business Marketplace
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectRole('business')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left block"
                >
                  Business Owner Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectRole('authority')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left block"
                >
                  Tourism Authority Command Center
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Featured Pristine Alternatives */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Pristine Alternatives
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Galgibaga Turtle Beach, Canacona</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Cola Beach & Emerald Freshwater Lagoon</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Cabo de Rama Fort & Cliffside Bay</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Divar Island & Heritage River Estuary</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Tambdi Surla 12th-C Basalt Temple</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Dr. Salim Ali Bird Sanctuary, Chorao</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Netravali Bubbling Lake & Spice Plantations</span>
              </li>
            </ul>
          </div>

          {/* Column 4: ACM Hackathon Submission Info & Status */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              ACM Hackathon Submission
            </h4>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-[11px]">
              <p className="text-slate-200 font-bold">
                Track: ME (Mobility & Environment)
              </p>
              <p className="text-slate-400 leading-relaxed">
                Full-stack intelligent tourism ecosystem powered by React, Node.js, Express, Firebase, Google Gemini AI & OpenRouteService.
              </p>
              <div className="pt-1.5 border-t border-slate-800 flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hackathon Demo Ready</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} GoaSmart – Intelligent Tourism & Crowd Distribution Platform. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Built with care for a greener, sustainable Goa</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </p>
        </div>

      </div>
    </footer>
  );
}
