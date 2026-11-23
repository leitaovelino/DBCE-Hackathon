import React from 'react';
import { X, Heart, Trash2, MapPin, ArrowRight, Compass, ShieldCheck } from 'lucide-react';

export default function FavoritesDrawer({
  isOpen,
  onClose,
  favorites,
  allDestinations,
  onRemoveFavorite,
  onClearFavorites,
  onSelectDestination
}) {
  if (!isOpen) return null;

  const savedList = favorites
    .map((id) => allDestinations.find((d) => d.id === id))
    .filter(Boolean);

  const avgCrowd = savedList.length > 0
    ? Math.round(savedList.reduce((acc, curr) => acc + curr.crowdScore, 0) / savedList.length)
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 transition-colors">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                <Heart className="w-5 h-5 fill-red-500 dark:fill-red-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">My Saved Itinerary</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{savedList.length} destinations selected</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            {savedList.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
                  <Compass className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No destinations saved yet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Click the heart icon on any destination card to save your dream Goan getaway and check combined crowd metrics.
                </p>
              </div>
            ) : (
              <>
                {/* Trip Crowd Health Score */}
                <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-800/60">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-cyan-900 dark:text-cyan-200">Itinerary Crowd Score</span>
                    <span className="font-bold text-cyan-800 dark:text-cyan-300">{avgCrowd}% Average</span>
                  </div>
                  <div className="w-full bg-cyan-200 dark:bg-cyan-900/60 rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        avgCrowd > 60 ? 'bg-orange-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${avgCrowd}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-cyan-950 dark:text-cyan-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {avgCrowd < 40
                        ? 'Great choice! Your trip favors serene, sustainable destinations.'
                        : 'Tip: Consider swapping high-crowd hotspots with our green-tagged alternatives.'}
                    </span>
                  </p>
                </div>

                {/* List of Destinations */}
                <div className="space-y-3">
                  {savedList.map((dest) => (
                    <div
                      key={dest.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all flex items-center justify-between gap-3 bg-white dark:bg-slate-800/80"
                    >
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="w-14 h-14 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4
                          onClick={() => {
                            onClose();
                            onSelectDestination(dest);
                          }}
                          className="text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-cyan-700 dark:hover:text-cyan-400 cursor-pointer truncate"
                        >
                          {dest.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{dest.region}</span>
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              dest.crowdScore >= 70 ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                          />
                          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
                            {dest.crowdLevel} ({dest.crowdScore}%)
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveFavorite(dest.id)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer Controls */}
          {savedList.length > 0 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3">
              <button
                onClick={onClearFavorites}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Continue Exploring</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
