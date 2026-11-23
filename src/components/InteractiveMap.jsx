import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Layers, Filter, Compass, Heart, ArrowUpRight, ShieldCheck, Sun, Clock, Users, X } from 'lucide-react';
import { DESTINATIONS, MAP_CATEGORIES } from '../data/destinations';

export default function InteractiveMap({
  destinations: propDestinations,
  routeGeometry = null,
  onClearRoute,
  onSelectDestinationModal,
  savedFavorites,
  onToggleFavorite,
  t
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const routeLayerRef = useRef(null);

  const destinations = (propDestinations && propDestinations.length > 0) ? propDestinations : DESTINATIONS;
  const [selectedDestId, setSelectedDestId] = useState(() => (destinations[0]?.id || 'baga-beach'));
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileList, setShowMobileList] = useState(false);

  // Filter destinations by map category and search query
  const filteredDestinations = destinations.filter((d) => {
    const matchesCategory =
      activeCategory === 'All' || d.mapCategory === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.taluka && d.taluka.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.tags && d.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const selectedDestination =
    destinations.find((d) => d.id === selectedDestId) || filteredDestinations[0] || destinations[0];

  // Render ORS Route Polyline if routeGeometry is provided
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (routeGeometry) {
      const geoLayer = L.geoJSON(routeGeometry, {
        style: {
          color: '#0891b2',
          weight: 5,
          opacity: 0.85
        }
      }).addTo(map);

      routeLayerRef.current = geoLayer;
      try {
        const bounds = geoLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (err) {
        console.warn('Could not fit bounds to route:', err);
      }
    }
  }, [routeGeometry]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center of Goa: ~ 15.35° N, 73.95° E
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
      // Clean up when unmounting
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers whenever filteredDestinations changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    filteredDestinations.forEach((dest) => {
      const isSelected = dest.id === selectedDestId;
      const pinColor =
        dest.crowdScore >= 80 ? '#dc2626' :
        dest.crowdScore >= 60 ? '#ea580c' :
        dest.crowdScore >= 40 ? '#f59e0b' : '#059669';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="
              width: ${isSelected ? '36px' : '26px'};
              height: ${isSelected ? '36px' : '26px'};
              border-radius: 50%;
              background: ${pinColor};
              border: 3px solid #ffffff;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.25s ease-out;
            ">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>
            </div>
            ${isSelected ? `
              <div style="
                position: absolute;
                top: -24px;
                background: #0f172a;
                color: #ffffff;
                font-size: 11px;
                font-weight: 700;
                padding: 2px 8px;
                border-radius: 9999px;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.25);
                pointer-events: none;
              ">
                ${dest.name}
              </div>
            ` : ''}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
      });

      const lat = dest.latitude !== undefined ? Number(dest.latitude) : (dest.coordinates?.lat || 15.35);
      const lng = dest.longitude !== undefined ? Number(dest.longitude) : (dest.coordinates?.lng || 73.95);

      const marker = L.marker([lat, lng], { icon: customIcon })
        .addTo(map)
        .on('click', () => {
          setSelectedDestId(dest.id);
          setShowMobileList(false);
          map.flyTo([lat, lng], 13, { duration: 1.2 });
        });

      // Bind informative popup
      marker.bindPopup(`
        <div style="font-family: inherit; padding: 4px; max-width: 200px;">
          <h4 style="font-weight: 800; font-size: 13px; margin: 0 0 4px 0; color: #0f172a;">${dest.name}</h4>
          <span style="font-size: 10px; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: 700;">
            ${dest.mapCategory || dest.category || 'Attraction'}
          </span>
          <div style="margin-top: 6px; font-size: 11px; color: ${pinColor}; font-weight: 700;">
            ● ${dest.crowdLevel} (${dest.crowdScore || 50}%)
          </div>
        </div>
      `);

      markersRef.current[dest.id] = marker;
    });
  }, [filteredDestinations, selectedDestId]);

  // Center on destination when clicked from sidebar list
  const handleSelectFromList = (dest) => {
    setSelectedDestId(dest.id);
    setShowMobileList(false);
    const map = mapInstanceRef.current;
    if (map) {
      const lat = dest.latitude !== undefined ? Number(dest.latitude) : (dest.coordinates?.lat || 15.35);
      const lng = dest.longitude !== undefined ? Number(dest.longitude) : (dest.coordinates?.lng || 73.95);
      map.flyTo([lat, lng], 13, { duration: 1.2 });
      if (markersRef.current[dest.id]) {
        markersRef.current[dest.id].openPopup();
      }
    }
  };

  return (
    <div className="py-6 sm:py-8 bg-slate-100 dark:bg-slate-950 min-h-[calc(100vh-80px)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Control Bar: Title, Search, Category Chips */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm mb-6 space-y-4 transition-colors">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 text-xs font-bold rounded-full mb-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Goa GIS & OpenStreetMap Explorer</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Interactive Goa Tourism Map
              </h2>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search beach, fort, church, temple..."
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span>Map Layer:</span>
            </span>
            {MAP_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === category
                    ? 'bg-cyan-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

        </div>

        {/* Map & Side Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
          
          {/* Main Leaflet Map View Container */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-md overflow-hidden flex flex-col h-[520px] sm:h-[620px] relative transition-colors">
            
            {/* Map Legend (Floating Top Left) */}
            <div className="absolute top-4 left-4 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 shadow-md text-[11px] font-bold text-slate-700 dark:text-slate-200 space-y-1 hidden sm:block">
              <div className="text-[10px] uppercase text-slate-400 dark:text-slate-400 font-extrabold tracking-wider">Crowd Intensity</div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>Low / Serene (&lt;40%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Moderate (40-60%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>High (60-80%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span>Very High / Congested (&gt;80%)</span>
              </div>
            </div>

            {/* Mobile List Toggle Button */}
            <div className="lg:hidden absolute bottom-4 right-4 z-[400]">
              <button
                onClick={() => setShowMobileList(!showMobileList)}
                className="px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>{showMobileList ? 'Show Map' : `View ${filteredDestinations.length} Places`}</span>
              </button>
            </div>

            {/* The Actual Leaflet Map Canvas */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

          </div>

          {/* Sidebar Panel: Selected Destination Details & List */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Selected Destination Card */}
            {selectedDestination && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-md overflow-hidden flex flex-col justify-between transition-colors">
                
                {/* Image & Header */}
                <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-900">
                  <img
                    src={selectedDestination.image}
                    alt={selectedDestination.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Category & Region Pill */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-[11px] font-bold text-slate-800 dark:text-slate-100">
                      {selectedDestination.mapCategory}
                    </span>
                    <span className="px-2.5 py-0.5 bg-black/50 backdrop-blur-md rounded-full text-[11px] font-semibold text-white">
                      {selectedDestination.region}
                    </span>
                  </div>

                  {/* Favorite Toggle */}
                  <button
                    onClick={() => onToggleFavorite(selectedDestination.id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-red-500 rounded-full backdrop-blur-md shadow-xs transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        savedFavorites.includes(selectedDestination.id) ? 'fill-red-500 text-red-500' : ''
                      }`}
                    />
                  </button>

                  {/* Name on image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-lg font-black tracking-tight">{selectedDestination.name}</h3>
                    <p className="text-[11px] text-slate-300">
                      {selectedDestination.taluka} Taluka • {selectedDestination.coordinates.lat}° N, {selectedDestination.coordinates.lng}° E
                    </p>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  
                  {/* Crowd Meter */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>Live Crowd Status</span>
                      </span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                          selectedDestination.crowdScore >= 80 ? 'bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300' :
                          selectedDestination.crowdScore >= 60 ? 'bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300' :
                          selectedDestination.crowdScore >= 40 ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300' :
                          'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {selectedDestination.crowdLevel} ({selectedDestination.crowdScore}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          selectedDestination.crowdScore >= 80 ? 'bg-red-500' :
                          selectedDestination.crowdScore >= 60 ? 'bg-orange-500' :
                          selectedDestination.crowdScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${selectedDestination.crowdScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {selectedDestination.description}
                  </p>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div>
                      <span className="text-slate-400 dark:text-slate-400 block">Best Visit Time:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDestination.bestTimeToVisit.split('(')[0]}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-400 block">Est. Cost / Fee:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{selectedDestination.entryFee.split('(')[0]}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => onSelectDestinationModal(selectedDestination)}
                      className="flex-1 py-2.5 px-3 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Full Details & Charts</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleFavorite(selectedDestination.id)}
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        savedFavorites.includes(selectedDestination.id)
                          ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                      }`}
                      title="Save destination"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          savedFavorites.includes(selectedDestination.id) ? 'fill-red-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* List of Other Filtered Destinations */}
            <div className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-md p-4 flex-1 flex flex-col max-h-[300px] overflow-hidden transition-colors ${
              showMobileList ? 'block' : 'hidden lg:flex'
            }`}>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  Visible Locations ({filteredDestinations.length})
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-400">Click to locate on map</span>
              </div>

              <div className="overflow-y-auto space-y-1.5 pr-1 flex-1">
                {filteredDestinations.map((dest) => {
                  const isSelected = dest.id === selectedDestId;
                  return (
                    <div
                      key={dest.id}
                      onClick={() => handleSelectFromList(dest)}
                      className={`p-2 rounded-xl flex items-center justify-between gap-2.5 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-cyan-50/80 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-700 shadow-xs'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            dest.crowdScore >= 80 ? 'bg-red-500' :
                            dest.crowdScore >= 60 ? 'bg-orange-500' :
                            dest.crowdScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                        />
                        <div className="truncate">
                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{dest.name}</h5>
                          <span className="text-[10px] text-slate-400 dark:text-slate-400">{dest.region} • {dest.mapCategory}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 shrink-0">
                        {dest.crowdScore}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
