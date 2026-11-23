import React from 'react';
import { X, Heart, MapPin, Clock, Calendar, Sun, ShieldAlert, ShieldCheck, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';

export default function DestinationModal({
  destination,
  allDestinations,
  isFavorite,
  onToggleFavorite,
  onClose,
  onSelectAlternative,
  t
}) {
  if (!destination) return null;

  // Find recommended alternative objects if any
  const alternatives = (destination.recommendedAlternatives || [])
    .map((altId) => allDestinations.find((d) => d.id === altId))
    .filter(Boolean);

  const isHighCrowd = destination.crowdScore >= 70;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Click outside to close backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 max-h-[92vh] flex flex-col my-auto transition-colors">
        
        {/* Header Image & Overlays */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900 shrink-0">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-md transition-all cursor-pointer z-10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category & Region Pill */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-slate-800 rounded-full text-xs font-bold shadow-xs">
              {destination.category}
            </span>
            <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-white rounded-full text-xs font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{destination.region} ({destination.taluka} Taluka)</span>
            </span>
          </div>

          {/* Title & Crowd Badge (Overlaid on Bottom of Image) */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{destination.name}</h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                Coordinates: {destination.coordinates.lat}° N, {destination.coordinates.lng}° E
              </p>
            </div>

            <div className={`self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-2 border shadow-lg ${
              destination.crowdScore >= 80 ? 'bg-red-500/90 text-white border-red-400' :
              destination.crowdScore >= 60 ? 'bg-orange-500/90 text-white border-orange-400' :
              destination.crowdScore >= 40 ? 'bg-amber-500/90 text-white border-amber-400' :
              'bg-emerald-600/95 text-white border-emerald-400'
            }`}>
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>{destination.crowdLevel} Density ({destination.crowdScore}%)</span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          
          {/* Realtime Crowd Analysis Banner */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isHighCrowd
              ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
          }`}>
            <div className="flex items-start gap-3">
              {isHighCrowd ? (
                <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-sm font-bold">
                  {isHighCrowd ? 'High Footfall & Congestion Alert' : 'Pristine & Sustainable Tourism Pick'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {isHighCrowd
                    ? `Estimated ${destination.estimatedVisitorsNow.toLocaleString()} active visitors. Expect heavy beach/road queues.`
                    : `Currently only ~${destination.estimatedVisitorsNow} visitors. Low noise, crystal waters, and minimal environmental footprint.`}
                </p>
              </div>
            </div>

            <button
              onClick={() => onToggleFavorite(destination.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                isFavorite
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
              <span>{isFavorite ? 'Saved to Trip' : 'Save to Trip'}</span>
            </button>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
              {t.detail.about}
            </h4>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              {destination.description}
            </p>
          </div>

          {/* Hourly Crowd Curve Visualization */}
          {destination.hourlyCrowdTrend && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Estimated Hourly Crowd Profile (GoaSmart Predictive Model)</span>
                </h4>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">06:00 to 23:00</span>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 items-end h-28 pt-4 pb-1 px-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                {destination.hourlyCrowdTrend.map((point, idx) => {
                  const barColor = 
                    point.crowd >= 80 ? 'bg-red-500' :
                    point.crowd >= 60 ? 'bg-orange-500' :
                    point.crowd >= 40 ? 'bg-amber-400' : 'bg-emerald-500';

                  return (
                    <div key={idx} className="flex flex-col items-center h-full justify-end group">
                      <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {point.crowd}%
                      </span>
                      <div
                        className={`w-full max-w-[20px] rounded-t-sm transition-all duration-300 ${barColor}`}
                        style={{ height: `${Math.max(point.crowd, 8)}%` }}
                      />
                      <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
                        {point.hour}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Highlights & Quick Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Highlights */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2.5">
                {t.detail.highlights}
              </h4>
              <ul className="space-y-2">
                {destination.highlights.map((h, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Essential Visiting Info */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2.5">
                {t.detail.visitingInfo}
              </h4>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Peak Congestion:</span>
                <span className="font-semibold text-amber-700 dark:text-amber-400">{destination.peakHours}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Best Tranquil Window:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">{destination.bestTimeToVisit}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Fees / Costs:</span>
                <span className="font-semibold dark:text-slate-200">{destination.entryFee}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Live Weather:</span>
                <span className="font-semibold flex items-center gap-1 text-cyan-800 dark:text-cyan-300">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  {destination.weather.temp}°C, {destination.weather.condition}
                </span>
              </div>
            </div>

          </div>

          {/* Smart Alternative Recommendation Box (If Hotspot) */}
          {alternatives.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 dark:from-teal-950/40 dark:via-emerald-950/40 dark:to-cyan-950/40 border border-teal-200 dark:border-teal-800/60">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                <h4 className="text-sm font-bold text-teal-950 dark:text-teal-200">
                  GoaSmart Intelligent Alternative Recommendations
                </h4>
              </div>
              <p className="text-xs text-teal-900 dark:text-teal-300 mb-3">
                To prevent overcrowding at {destination.name}, consider these stunning, low-crowd destinations with comparable vibes:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {alternatives.map((alt) => (
                  <div
                    key={alt.id}
                    onClick={() => onSelectAlternative(alt)}
                    className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-teal-200/80 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{alt.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                          {alt.crowdScore}% Crowd
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{alt.description}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-teal-700 dark:text-teal-400 font-bold">
                      <span>Switch Location</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {t.detail.close}
          </button>
          <button
            onClick={() => {
              onToggleFavorite(destination.id);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-2 ${
              isFavorite ? 'bg-slate-800 hover:bg-slate-900' : 'bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/20'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-400 text-red-400' : ''}`} />
            <span>{isFavorite ? 'Saved in Itinerary' : t.detail.saveToItinerary}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
