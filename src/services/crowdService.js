import { DESTINATIONS } from '../data/destinations';

/**
 * Crowd Intelligence Service
 * Provides synthetic crowd indicators, distribution statistics, and predictive curves.
 * Explicitly labeled as simulated estimates.
 */

export const SIMULATION_NOTICE = "Simulated Crowd Estimate (For hackathon prototype demonstration)";

export function getCrowdCategory(score) {
  if (score > 70) return { category: 'HIGH', label: 'High', color: 'red', bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' };
  if (score >= 40) return { category: 'MODERATE', label: 'Moderate', color: 'yellow', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
  return { category: 'LOW', label: 'Low', color: 'green', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
}

export function getCrowdDistribution(destinations = DESTINATIONS) {
  let lowCount = 0;
  let modCount = 0;
  let highCount = 0;

  destinations.forEach((d) => {
    if (d.crowdScore > 70) highCount++;
    else if (d.crowdScore >= 40) modCount++;
    else lowCount++;
  });

  const total = destinations.length;
  return {
    total,
    low: { count: lowCount, percentage: Math.round((lowCount / total) * 100) },
    moderate: { count: modCount, percentage: Math.round((modCount / total) * 100) },
    high: { count: highCount, percentage: Math.round((highCount / total) * 100) },
  };
}

export function getDestinationForecast(destinationId) {
  const dest = DESTINATIONS.find((d) => d.id === destinationId) || DESTINATIONS[0];

  // Base current crowd score
  const current = dest.crowdScore;

  // Next few hours forecast
  const nextHours = [
    { time: 'In 1 hr', crowd: Math.min(100, Math.max(5, current + 4)), status: getCrowdCategory(current + 4).category },
    { time: 'In 2 hrs', crowd: Math.min(100, Math.max(5, current + 8)), status: getCrowdCategory(current + 8).category },
    { time: 'In 3 hrs', crowd: Math.min(100, Math.max(5, current + 3)), status: getCrowdCategory(current + 3).category },
    { time: 'In 4 hrs', crowd: Math.min(100, Math.max(5, current - 6)), status: getCrowdCategory(current - 6).category },
    { time: 'In 6 hrs', crowd: Math.min(100, Math.max(5, current - 18)), status: getCrowdCategory(current - 18).category },
  ];

  // Tomorrow forecast by time period
  const tomorrow = [
    { period: 'Morning (07:00 - 10:00)', crowd: Math.round(current * 0.4), note: 'Calmest window with light sea breeze' },
    { period: 'Noon (11:00 - 14:00)', crowd: Math.round(current * 0.85), note: 'Moderate sun & steady tourist arrivals' },
    { period: 'Afternoon (15:00 - 18:00)', crowd: Math.min(98, Math.round(current * 1.05)), note: 'Peak sunset rush & traffic' },
    { period: 'Night (19:00 - 22:00)', crowd: Math.round(current * 0.75), note: 'Dinner shacks and night markets active' },
  ];

  // Weekly Trend (Monday to Sunday)
  const weekly = [
    { day: 'Mon', crowd: Math.max(10, Math.round(current * 0.65)), weekend: false },
    { day: 'Tue', crowd: Math.max(8, Math.round(current * 0.55)), weekend: false },
    { day: 'Wed', crowd: Math.max(12, Math.round(current * 0.7)), weekend: false },
    { day: 'Thu', crowd: Math.max(10, Math.round(current * 0.65)), weekend: false },
    { day: 'Fri', crowd: Math.min(95, Math.round(current * 1.0)), weekend: false },
    { day: 'Sat', crowd: Math.min(99, Math.round(current * 1.25)), weekend: true },
    { day: 'Sun', crowd: Math.min(98, Math.round(current * 1.2)), weekend: true },
  ];

  return {
    destination: dest,
    currentScore: current,
    currentCategory: getCrowdCategory(current),
    lastUpdated: 'Today at 10:45 AM (Simulated Sync)',
    nextHours,
    tomorrow,
    weekly,
    isSimulated: true
  };
}
