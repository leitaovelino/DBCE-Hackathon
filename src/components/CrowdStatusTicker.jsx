import React from 'react';
import { AlertCircle, CheckCircle2, TrendingUp, Info } from 'lucide-react';

export default function CrowdStatusTicker({ destinations, onSelectDestination }) {
  // Select a mix of heavy hotspots and serene alternatives to show the contrast
  const highlighted = [
    { id: 'baga-beach', name: 'Baga Beach', status: 'Very High', score: 92, color: 'red', type: 'Hotspot' },
    { id: 'galgibaga-beach', name: 'Galgibaga Beach', status: 'Serene & Low', score: 18, color: 'green', type: 'Alternative' },
    { id: 'fort-aguada', name: 'Fort Aguada', status: 'Very High', score: 91, color: 'red', type: 'Hotspot' },
    { id: 'cabo-de-rama', name: 'Cabo de Rama Fort', status: 'Low (Tranquil)', score: 26, color: 'green', type: 'Alternative' },
    { id: 'dudhsagar-falls', name: 'Dudhsagar Falls', status: 'Peak Safari Queue', score: 94, color: 'red', type: 'Hotspot' },
    { id: 'tambdi-surla', name: 'Tambdi Surla Temple', status: 'Low & Peaceful', score: 19, color: 'green', type: 'Alternative' },
    { id: 'cola-beach', name: 'Cola Beach Lagoon', status: 'Low & Quiet', score: 24, color: 'green', type: 'Alternative' },
    { id: 'calangute-beach', name: 'Calangute Beach', status: 'Very High', score: 89, color: 'red', type: 'Hotspot' },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs py-2.5 overflow-hidden shadow-inner">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
        
        {/* Ticker Title Badge */}
        <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 bg-cyan-950/80 border border-cyan-800/80 rounded-md text-cyan-300 font-bold">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="tracking-wider uppercase text-[10px]">Live Crowd Radar:</span>
        </div>

        {/* Horizontal Scrolling Items */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap py-0.5">
          {highlighted.map((item) => {
            const isRed = item.color === 'red';
            return (
              <button
                key={item.id}
                onClick={() => onSelectDestination && onSelectDestination(item.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all hover:scale-105 cursor-pointer ${
                  isRed
                    ? 'bg-red-950/50 border-red-800/60 text-red-300 hover:border-red-500'
                    : 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300 hover:border-emerald-500'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isRed ? 'bg-red-500' : 'bg-emerald-400'}`} />
                <span className="font-semibold text-slate-200">{item.name}:</span>
                <span className="font-mono font-bold">{item.score}%</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                  isRed ? 'bg-red-900/60 text-red-200' : 'bg-emerald-900/60 text-emerald-200'
                }`}>
                  {item.status}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
