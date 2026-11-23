import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, DollarSign, Users, Sparkles, Trash2, Plus, ArrowRight, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, Compass, Car, Navigation, Route } from 'lucide-react';
import { DESTINATIONS } from '../data/destinations';
import { generateSmartItinerary, calculateItineraryRoute, SAMPLE_START_LOCATIONS, EXPERIENCE_CATEGORIES } from '../services/itineraryService';
import { SMART_NUDGES } from '../services/nudgeService';

export default function SmartItineraryPlanner({
  onSelectDestinationModal,
  onOpenMap,
  onViewRouteOnMap,
  t
}) {
  // Input form state
  const [duration, setDuration] = useState(2);
  const [startLocation, setStartLocation] = useState(SAMPLE_START_LOCATIONS[0]);
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [budget, setBudget] = useState('moderate');
  const [travelers, setTravelers] = useState(2);
  const [selectedCategories, setSelectedCategories] = useState([
    'Beaches',
    'Nature and waterfalls',
    'Historical attractions'
  ]);
  const [avoidHotspots, setAvoidHotspots] = useState(true);

  // Active Itinerary state
  const [itinerary, setItinerary] = useState(() =>
    generateSmartItinerary({
      duration: 2,
      startLocation: SAMPLE_START_LOCATIONS[0],
      budget: 'moderate',
      travelers: 2,
      selectedCategories: ['Beaches', 'Nature and waterfalls', 'Historical attractions'],
      avoidHotspots: true
    })
  );

  const [activeDayTab, setActiveDayTab] = useState(1);
  const [addDestinationModalDay, setAddDestinationModalDay] = useState(null);

  // OpenRouteService Road Telemetry State
  const [routeData, setRouteData] = useState(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);

  const currentDay = itinerary.days.find((d) => d.dayNumber === activeDayTab) || itinerary.days[0];

  // Recalculate ORS road route whenever stops or day changes
  useEffect(() => {
    let isMounted = true;
    const currentDayStops = currentDay?.stops || [];

    if (currentDayStops.length >= 1) {
      setIsRoutingLoading(true);
      calculateItineraryRoute(currentDayStops, itinerary.startLocation)
        .then((result) => {
          if (isMounted) {
            setRouteData(result);
            setIsRoutingLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setRouteData({ available: false, error: err.message });
            setIsRoutingLoading(false);
          }
        });
    } else {
      setRouteData(null);
      setIsRoutingLoading(false);
    }

    return () => { isMounted = false; };
  }, [currentDay?.stops, itinerary.startLocation]);

  const handleGenerate = (e) => {
    if (e) e.preventDefault();
    const newItinerary = generateSmartItinerary({
      duration,
      startLocation,
      budget,
      travelers,
      selectedCategories,
      avoidHotspots
    });
    setItinerary(newItinerary);
    setActiveDayTab(1);
  };

  const handleToggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.length > 1
          ? prev.filter((c) => c !== cat)
          : prev
        : [...prev, cat]
    );
  };

  const handleRemoveStop = (dayNumber, stopId) => {
    setItinerary((prev) => {
      const updatedDays = prev.days.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        return {
          ...day,
          stops: day.stops.filter((s) => s.id !== stopId)
        };
      });

      const totalExpense = updatedDays.reduce(
        (acc, day) => acc + day.stops.reduce((dayAcc, stop) => dayAcc + stop.estimatedExpense, 0),
        0
      );
      const totalDestinations = updatedDays.reduce((acc, day) => acc + day.stops.length, 0);

      return {
        ...prev,
        days: updatedDays,
        totalExpense,
        totalDestinations
      };
    });
  };

  const handleAddStopToDay = (destination, dayNumber) => {
    setItinerary((prev) => {
      const updatedDays = prev.days.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        const newStop = {
          id: `${destination.id}-manual-${Date.now()}`,
          destinationId: destination.id,
          destination,
          suggestedTime: '02:00 PM - 04:30 PM',
          timeSlot: 'Afternoon',
          duration: '2.5 hrs',
          travelTimeToNext: '25 mins drive (Sample Estimate)',
          estimatedExpense: 450 * prev.travelers,
          expensePerPerson: 450,
          crowdCategory: destination.crowdScore > 70 ? 'HIGH' : destination.crowdScore >= 40 ? 'MODERATE' : 'LOW'
        };
        return {
          ...day,
          stops: [...day.stops, newStop]
        };
      });

      const totalExpense = updatedDays.reduce(
        (acc, day) => acc + day.stops.reduce((dayAcc, stop) => dayAcc + stop.estimatedExpense, 0),
        0
      );
      const totalDestinations = updatedDays.reduce((acc, day) => acc + day.stops.length, 0);

      return {
        ...prev,
        days: updatedDays,
        totalExpense,
        totalDestinations
      };
    });
    setAddDestinationModalDay(null);
  };

  // Switch destination with recommended nudge alternative
  const handleApplyNudge = (dayNumber, stopId, alternativeDestId) => {
    const alternative = DESTINATIONS.find((d) => d.id === alternativeDestId);
    if (!alternative) return;

    setItinerary((prev) => {
      const updatedDays = prev.days.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        return {
          ...day,
          stops: day.stops.map((stop) => {
            if (stop.id !== stopId) return stop;
            return {
              ...stop,
              destinationId: alternative.id,
              destination: alternative,
              crowdCategory: alternative.crowdScore > 70 ? 'HIGH' : alternative.crowdScore >= 40 ? 'MODERATE' : 'LOW'
            };
          })
        };
      });

      return {
        ...prev,
        days: updatedDays
      };
    });
  };

  return (
    <div className="py-8 sm:py-12 bg-slate-50 min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-100 text-cyan-800 text-xs font-bold rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>AI-Assisted Sustainable Itinerary Planner</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Smart Trip & Route Planner
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Generate realistic travel itineraries customized for your budget and pace. Our planner intelligently routes you away from gridlocked coastal roads to serene village and heritage locations.
          </p>
        </div>

        {/* Input Parameters Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-600" />
            <span>Configure Your Travel Preferences</span>
          </h3>

          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Trip Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value={1}>1 Day (Express Tour)</option>
                  <option value={2}>2 Days (Weekend Getaway)</option>
                  <option value={3}>3 Days (Complete Exploration)</option>
                  <option value={5}>5 Days (Deep Goan Heritage)</option>
                </select>
              </div>

              {/* Start Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Starting Location</label>
                <select
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                >
                  {SAMPLE_START_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Travel Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Preferred Date</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                />
              </div>

              {/* Budget Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Budget Range</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="budget">Budget (&lt; ₹1,500/day)</option>
                  <option value="moderate">Moderate (₹1,500 - ₹4,000/day)</option>
                  <option value="luxury">Comfort / Luxury (₹4,000+/day)</option>
                </select>
              </div>

            </div>

            {/* Travelers & Category Selection */}
            <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Number of Travelers */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Travelers:</span>
                {[1, 2, 4, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTravelers(num)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      travelers === num
                        ? 'bg-cyan-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {num === 1 ? 'Solo' : num === 2 ? 'Couple (2)' : `${num} People`}
                  </button>
                ))}
              </div>

              {/* Avoid Hotspots Nudge Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={avoidHotspots}
                  onChange={(e) => setAvoidHotspots(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-xs font-bold text-emerald-800">
                  Prioritize Low-Crowd Alternatives & Avoid Peak Choke-Points
                </span>
              </label>

            </div>

            {/* Experience Category Pills */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 block">Preferred Experience Categories:</span>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleToggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-cyan-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Smart Itinerary</span>
              </button>
            </div>
          </form>
        </div>

        {/* Itinerary Results Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                Optimized Travel Plan
              </span>
              <h3 className="text-2xl font-black tracking-tight mt-1">
                {itinerary.duration}-Day Goa Smart Itinerary
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Starting from <strong>{itinerary.startLocation}</strong> for {itinerary.travelers} {itinerary.travelers === 1 ? 'traveler' : 'travelers'}
              </p>
            </div>

            {/* Total Metric Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block font-semibold">Total Estimated Expenses</span>
                <span className="text-lg font-black text-emerald-400">₹{itinerary.totalExpense.toLocaleString()}</span>
              </div>

              <div className="bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block font-semibold">Total Stops</span>
                <span className="text-lg font-black text-cyan-400">{itinerary.totalDestinations} Places</span>
              </div>

              {/* Live OpenRouteService Driving Telemetry */}
              <div className="bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700 min-w-[140px]">
                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <Car className="w-3 h-3 text-cyan-400" />
                  <span>Road Driving Distance</span>
                </span>
                {isRoutingLoading ? (
                  <span className="text-xs text-cyan-300 font-semibold animate-pulse">Routing via ORS...</span>
                ) : routeData?.available ? (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-cyan-400">{routeData.distanceKm} km</span>
                    <span className="text-[10px] text-slate-400">({routeData.durationMinutes} mins)</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 font-mono">Telemetry offline</span>
                )}
              </div>

              {/* View Route on Interactive Map Button */}
              {routeData?.geometry && (
                <button
                  type="button"
                  onClick={() => onViewRouteOnMap && onViewRouteOnMap(routeData.geometry)}
                  className="px-3.5 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
                  title="View actual OpenRouteService driving road polyline on map"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Plot Road on Map</span>
                </button>
              )}

              <button
                onClick={handleGenerate}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl transition-colors cursor-pointer"
                title="Regenerate Itinerary"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Road Telemetry Status Banner */}
          <div className="pt-3 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-800/80">
            {routeData?.available ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified driving distance & travel times computed via OpenRouteService API (driving-car profile)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Road telemetry: {routeData?.error || 'Start backend on :5000 with ORS_API_KEY for live road routing'}</span>
              </span>
            )}
            <span className="text-slate-400">
              {routeData?.available
                ? `Day ${currentDay.dayNumber}: ${routeData.distanceKm} km • ~${routeData.durationMinutes} mins total on road`
                : itinerary.estimatedTotalTravelTime}
            </span>
          </div>

        </div>

        {/* Day-by-Day View & Stops */}
        <div className="space-y-6">
          
          {/* Day Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {itinerary.days.map((day) => (
              <button
                key={day.dayNumber}
                onClick={() => setActiveDayTab(day.dayNumber)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeDayTab === day.dayNumber
                    ? 'bg-cyan-700 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>Day {day.dayNumber}</span>
                <span className="text-[10px] opacity-75 font-normal">({day.stops.length} stops)</span>
              </button>
            ))}

            <button
              onClick={() => setAddDestinationModalDay(activeDayTab)}
              className="px-3.5 py-2 rounded-2xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stop</span>
            </button>
          </div>

          {/* Current Day Title */}
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-slate-900">
              Day {currentDay.dayNumber}: {currentDay.title}
            </h4>
            <span className="text-xs text-slate-500">
              {currentDay.stops.length} scheduled visits
            </span>
          </div>

          {/* Stops List */}
          <div className="space-y-4">
            {currentDay.stops.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <h5 className="font-bold text-slate-800">No stops scheduled for this day</h5>
                <button
                  onClick={() => setAddDestinationModalDay(currentDay.dayNumber)}
                  className="px-4 py-2 bg-cyan-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Add a Destination
                </button>
              </div>
            ) : (
              currentDay.stops.map((stop, idx) => {
                const dest = stop.destination;
                const isHighCrowd = dest.crowdScore > 70;
                const matchingNudge = SMART_NUDGES.find((n) => n.originalDestId === dest.id);

                return (
                  <div key={stop.id} className="space-y-2">
                    
                    {/* Destination Card Row */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-cyan-400 transition-all">
                      
                      {/* Left: Step number, Photo, Details */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 font-black text-xs flex items-center justify-center shrink-0 mt-1">
                          {idx + 1}
                        </div>

                        <img
                          src={dest.image}
                          alt={dest.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0"
                        />

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h5
                              onClick={() => onSelectDestinationModal(dest)}
                              className="font-extrabold text-sm sm:text-base text-slate-900 hover:text-cyan-700 transition-colors cursor-pointer"
                            >
                              {dest.name}
                            </h5>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                              stop.crowdCategory === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' :
                              stop.crowdCategory === 'MODERATE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}>
                              {stop.crowdCategory} CROWD ({dest.crowdScore}%)
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{dest.region} • {dest.category}</span>
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                            <span className="flex items-center gap-1 font-semibold text-cyan-800">
                              <Clock className="w-3.5 h-3.5 text-cyan-600" />
                              <span>{stop.suggestedTime}</span>
                            </span>
                            <span>Duration: {stop.duration}</span>
                            <span className="font-semibold text-slate-700">Est. ₹{stop.estimatedExpense} total</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                        <span className="text-[11px] text-slate-500 font-medium">
                          Next: {
                            routeData?.available && routeData.segments && routeData.segments[idx + 1]
                              ? `${routeData.segments[idx + 1].distanceKm} km drive (~${routeData.segments[idx + 1].durationMinutes} mins via ORS)`
                              : stop.travelTimeToNext
                          }
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onSelectDestinationModal(dest)}
                            className="p-2 text-cyan-700 hover:bg-cyan-50 rounded-xl transition-colors cursor-pointer text-xs font-bold"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleRemoveStop(currentDay.dayNumber, stop.id)}
                            className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Remove stop"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Proactive Tourist Nudge if stop has High Crowd */}
                    {isHighCrowd && matchingNudge && (
                      <div className="ml-6 sm:ml-12 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-start gap-2.5 text-amber-900">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">
                              Intelligent Nudge: High Crowd Anticipated at {dest.name}
                            </span>
                            <span className="text-slate-600 text-[11px]">
                              {matchingNudge.reason}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleApplyNudge(currentDay.dayNumber, stop.id, matchingNudge.alternativeDestId)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{matchingNudge.actionText} (-{matchingNudge.crowdSavedPercent}%)</span>
                        </button>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

      {/* Add Destination Modal */}
      {addDestinationModalDay !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[80vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h4 className="font-bold text-slate-900 text-base">
                  Add Destination to Day {addDestinationModalDay}
                </h4>
                <button
                  onClick={() => setAddDestinationModalDay(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto max-h-[50vh] space-y-2 pr-1">
                {DESTINATIONS.map((dest) => (
                  <div
                    key={dest.id}
                    onClick={() => handleAddStopToDay(dest, addDestinationModalDay)}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-cyan-300 hover:bg-cyan-50/50 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="truncate">
                        <h5 className="font-bold text-xs text-slate-800 group-hover:text-cyan-800 truncate">
                          {dest.name}
                        </h5>
                        <span className="text-[10px] text-slate-500">{dest.region} • {dest.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        dest.crowdScore > 70 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {dest.crowdScore}%
                      </span>
                      <Plus className="w-4 h-4 text-cyan-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setAddDestinationModalDay(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
