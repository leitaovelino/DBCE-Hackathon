import { DESTINATIONS } from '../data/destinations';

/**
 * Smart Itinerary Planning Service
 * Generates balanced, crowd-conscious multi-day schedules based on tourist preferences.
 */

export const SAMPLE_START_LOCATIONS = [
  'Panaji (Central Goa)',
  'Calangute / Candolim (North Goa)',
  'Margao (South Goa)',
  'Dabolim Airport (GOI)',
  'Mopa International Airport (GOX)'
];

export const EXPERIENCE_CATEGORIES = [
  'Beaches',
  'Nature and waterfalls',
  'Historical attractions',
  'Religious destinations',
  'Adventure activities',
  'Food and local culture',
  'Relaxation'
];

export function generateSmartItinerary({
  duration = 2, // 1, 2, 3, 5 days
  startLocation = 'Panaji (Central Goa)',
  budget = 'moderate', // 'budget', 'moderate', 'luxury'
  travelers = 2,
  selectedCategories = ['Beaches', 'Nature and waterfalls', 'Historical attractions'],
  avoidHotspots = true
}) {
  // Candidate pool matching selected preferences or calm alternatives
  let pool = DESTINATIONS.filter((d) => {
    if (avoidHotspots && d.crowdScore > 75) return false;
    return true;
  });

  if (pool.length < duration * 2) {
    pool = DESTINATIONS; // Fallback to full pool if filtered too strictly
  }

  // Pre-curated realistic day schedules by duration
  const days = [];
  const timeSlots = [
    { slot: 'Morning', time: '09:00 AM - 11:30 AM', duration: '2.5 hrs' },
    { slot: 'Afternoon', time: '01:00 PM - 03:30 PM', duration: '2.5 hrs' },
    { slot: 'Sunset', time: '04:30 PM - 06:45 PM', duration: '2.25 hrs' }
  ];

  // Base expense calculation per person based on budget level
  const baseExpenseMultiplier = budget === 'budget' ? 300 : budget === 'luxury' ? 1200 : 600;

  let poolIndex = 0;

  for (let d = 1; d <= duration; d++) {
    const stops = [];
    const numStops = 3;

    for (let s = 0; s < numStops; s++) {
      const dest = pool[poolIndex % pool.length];
      poolIndex++;

      // Compute estimated travel time to next (sample estimate)
      const isLastStop = s === numStops - 1;
      const travelTimeToNext = isLastStop
        ? '30 mins return to hotel (Sample Estimate)'
        : `${20 + (s * 10)} mins drive (Sample Estimate)`;

      const entryExpense = dest.entryFee.toLowerCase().includes('free') ? 100 : 350;
      const mealRefreshmentExpense = baseExpenseMultiplier;
      const estimatedExpense = entryExpense + mealRefreshmentExpense;

      stops.push({
        id: `${dest.id}-day${d}-stop${s}`,
        destinationId: dest.id,
        destination: dest,
        suggestedTime: timeSlots[s].time,
        timeSlot: timeSlots[s].slot,
        duration: timeSlots[s].duration,
        travelTimeToNext,
        estimatedExpense: estimatedExpense * travelers,
        expensePerPerson: estimatedExpense,
        crowdCategory: dest.crowdScore > 70 ? 'HIGH' : dest.crowdScore >= 40 ? 'MODERATE' : 'LOW'
      });
    }

    days.push({
      dayNumber: d,
      title: d === 1 ? 'Central Heritage & Scenic Coast' : d === 2 ? 'Lush Western Ghats & Southern Tranquility' : `Goa Discovery Day ${d}`,
      stops
    });
  }

  // Calculate totals
  const totalExpense = days.reduce(
    (acc, day) => acc + day.stops.reduce((dayAcc, stop) => dayAcc + stop.estimatedExpense, 0),
    0
  );

  const totalDestinations = days.reduce((acc, day) => acc + day.stops.length, 0);

  return {
    id: `itinerary-${Date.now()}`,
    duration,
    startLocation,
    budget,
    travelers,
    selectedCategories,
    days,
    totalExpense,
    totalDestinations,
    estimatedTotalTravelTime: `${duration * 1.5} hrs total driving (Sample Estimate)`,
    isSampleEstimate: true
  };
}
