import React from 'react';
import { Heart, MapPin, Clock, Star, Users, ArrowUpRight, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function DestinationCard({
  destination,
  isFavorite,
  onToggleFavorite,
  onSelect,
  t
}) {
  const getCrowdBadge = (score, level) => {
    if (score >= 80) {
      return {
        bg: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
        dot: 'bg-red-500',
        label: level || 'Very High'
      };
    } else if (score >= 60) {
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        dot: 'bg-orange-500',
        label: level || 'High'
      };
    } else if (score >= 40) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
        label: level || 'Moderate'
      };
    } else {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        label: level || 'Low (Quiet)'
      };
    }
  };

  const crowdBadge = getCrowdBadge(destination.crowdScore, destination.crowdLevel);

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300 flex flex-col">
      
      {/* Image Container with Badges */}
      <div className="relative h-52 sm:h-56 overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        
        {/* Subtle Dark Gradient Overlay for Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/30 pointer-events-none" />

        {/* Category Pill (Top Left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-xs font-bold text-slate-800 dark:text-slate-100 shadow-xs border border-transparent dark:border-slate-700">
            {destination.category}
          </span>
          {destination.alternativeFor && (
            <span className="px-2.5 py-0.5 bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold rounded-full shadow-xs flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Quiet Alternative</span>
            </span>
          )}
        </div>

        {/* Favorite Heart Button (Top Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(destination.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-red-500 backdrop-blur-md shadow-xs transition-colors cursor-pointer border border-transparent dark:border-slate-700"
          title={isFavorite ? 'Remove from saved' : 'Save destination'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Rating and Region (Bottom Bar on Image) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1 font-semibold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>{destination.region}</span>
          </div>

          <div className="flex items-center gap-1 font-bold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{destination.rating}</span>
            <span className="text-slate-300 font-normal">({(destination.reviewsCount / 1000).toFixed(1)}k)</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header & Crowd Badge */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 
              onClick={() => onSelect(destination)}
              className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors cursor-pointer leading-snug"
            >
              {destination.name}
            </h3>
            
            <div className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${crowdBadge.bg}`}>
              <span className={`w-2 h-2 rounded-full ${crowdBadge.dot} animate-pulse-subtle`} />
              <span>{crowdBadge.label}</span>
            </div>
          </div>

          {/* Short Description */}
          <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2 leading-relaxed mb-4">
            {destination.description}
          </p>

          {/* Crowd Intensity Progress Meter */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Crowd Density</span>
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {destination.crowdScore}% ({destination.estimatedVisitorsNow.toLocaleString()} {t.card.visitorsNow})
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  destination.crowdScore >= 80 ? 'bg-red-500' :
                  destination.crowdScore >= 60 ? 'bg-orange-500' :
                  destination.crowdScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${destination.crowdScore}%` }}
              />
            </div>
          </div>

          {/* Timings Snapshot */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 mb-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                <strong className="text-slate-700 dark:text-slate-300">{t.card.bestTime}:</strong> {destination.bestTimeToVisit.split('(')[0]}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">
                <strong className="text-slate-700 dark:text-slate-300">{t.card.peakHours}:</strong> {destination.peakHours.split('(')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onSelect(destination)}
          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-600 dark:hover:bg-cyan-600 hover:text-white dark:hover:text-white text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:bg-cyan-50 dark:group-hover:bg-cyan-950/60 group-hover:text-cyan-800 dark:group-hover:text-cyan-300"
        >
          <span>{t.card.viewDetails}</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
