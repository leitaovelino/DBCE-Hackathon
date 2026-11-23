import React from 'react';
import { Compass, Heart, ShieldCheck, MapPin, ExternalLink } from 'lucide-react';

export default function Footer({ onSelectRole, t }) {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">GoaSmart</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Intelligent Tourism & Crowd Distribution Platform engineered for the ACM Hackathon (ME Track). Balancing tourism footfalls and uplifting local Goan communities.
            </p>
            <div className="pt-1 text-[11px] text-cyan-400 font-mono">
              Designed for Goa State Tourism Sustainability
            </div>
          </div>

          {/* Quick Portal Switcher */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Portal Navigation</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onSelectRole('tourist')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  Tourist Portal & Destination Explorer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectRole('business')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  Local Business Marketplace (Phase 3)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectRole('authority')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  Tourism Authority Analytics (Phase 4)
                </button>
              </li>
            </ul>
          </div>

          {/* Featured Quiter Alternatives */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Pristine Alternatives</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>Galgibaga Turtle Beach (Canacona)</li>
              <li>Cola Beach & Emerald Lagoon</li>
              <li>Cabo de Rama Fort & Cliff Bay</li>
              <li>Divar Island & Old Goa Heritage</li>
              <li>Tambdi Surla 12th-C Basalt Temple</li>
              <li>Chorao Dr. Salim Ali Bird Sanctuary</li>
            </ul>
          </div>

          {/* Hackathon Meta */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">ACM Hackathon Submission</h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-[11px]">
              <p className="text-slate-300 font-semibold">Track: ME (Mobility & Environment / Smart Tourism)</p>
              <p className="text-slate-400">Developed with React, Vite & Tailwind CSS.</p>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Phase 1 Verified & Active</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} GoaSmart – Intelligent Tourism & Crowd Distribution Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Built with care for a greener, sustainable Goa</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </p>
        </div>

      </div>
    </footer>
  );
}
