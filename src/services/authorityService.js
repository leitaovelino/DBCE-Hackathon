/**
 * Tourism Authority Analytics & Nudge Impact Service
 * Provides state-wide telemetry, regional comparisons, and simulated intervention analytics.
 */

export const AUTHORITY_KPIS = {
  totalMonitoredDestinations: 20,
  lowCrowdDestinations: 10,
  moderateCrowdDestinations: 5,
  highCrowdDestinations: 5,
  totalSimulatedVisitors: 48650,
  nudgesIssuedToday: 14280,
  touristsRedirected: 4820,
  diversionSuccessRate: 33.7,
  lastSync: 'Today at 11:20 AM (Simulated State Sync)'
};

export const REGIONAL_VISITOR_FLOW = [
  { region: 'North Goa', sharePercent: 52, visitorCount: 25300, status: 'Over-concentrated', color: '#ef4444' },
  { region: 'Central Goa', sharePercent: 22, visitorCount: 10700, status: 'Balanced', color: '#06b6d4' },
  { region: 'South Goa', sharePercent: 26, visitorCount: 12650, status: 'High Green Capacity', color: '#10b981' }
];

export const DAILY_VISITOR_TREND = [
  { hour: '08:00 AM', north: 1200, central: 600, south: 750 },
  { hour: '10:00 AM', north: 2800, central: 1400, south: 1200 },
  { hour: '12:00 PM', north: 3600, central: 1800, south: 1600 },
  { hour: '02:00 PM', north: 3200, central: 1500, south: 1400 },
  { hour: '04:00 PM', north: 5100, central: 2100, south: 2400 },
  { hour: '06:00 PM', north: 5600, central: 2200, south: 2900 },
  { hour: '08:00 PM', north: 4200, central: 1300, south: 1800 }
];

export const CATEGORY_DISTRIBUTION = [
  { category: 'Beaches', count: 6, avgCrowd: 71, status: 'High' },
  { category: 'Historical places', count: 5, avgCrowd: 58, status: 'Moderate' },
  { category: 'Religious places', count: 3, avgCrowd: 49, status: 'Moderate' },
  { category: 'Nature & waterfalls', count: 4, avgCrowd: 38, status: 'Low' },
  { category: 'Adventure & sports', count: 2, avgCrowd: 36, status: 'Low' }
];

export const NUDGE_IMPACT_COMPARISONS = [
  {
    hotspotName: 'Baga Beach',
    alternativeName: 'Cola Beach Lagoon',
    beforeHotspot: 92,
    afterHotspot: 64,
    beforeAlt: 24,
    afterAlt: 52,
    hotspotReduction: '-28%',
    altGain: '+116%',
    businessBoost: '+190%'
  },
  {
    hotspotName: 'Calangute Beach',
    alternativeName: 'Galgibaga Beach',
    beforeHotspot: 89,
    afterHotspot: 62,
    beforeAlt: 18,
    afterAlt: 46,
    hotspotReduction: '-27%',
    altGain: '+155%',
    businessBoost: '+260%'
  },
  {
    hotspotName: 'Fort Aguada',
    alternativeName: 'Reis Magos Fort',
    beforeHotspot: 91,
    afterHotspot: 65,
    beforeAlt: 22,
    afterAlt: 54,
    hotspotReduction: '-26%',
    altGain: '+145%',
    businessBoost: '+210%'
  },
  {
    hotspotName: 'Dudhsagar Waterfalls',
    alternativeName: 'Tambdi Surla Temple',
    beforeHotspot: 94,
    afterHotspot: 68,
    beforeAlt: 19,
    afterAlt: 48,
    hotspotReduction: '-26%',
    altGain: '+152%',
    businessBoost: '+220%'
  }
];

export const AUTHORITY_INSIGHTS = [
  {
    type: 'critical',
    title: 'North Coastal Satiation Alert',
    description: 'Baga-Calangute-Candolim coastal strip currently absorbs 52% of all tourist vehicles in Goa, leading to 2.4-hour entry delays. Dynamic roadside VMS (Variable Message Signs) nudges are activated.',
    action: 'Divert Northward traffic toward Reis Magos & Morjim'
  },
  {
    type: 'success',
    title: 'Canacona Eco-Corridor Growth',
    description: 'Nudges recommending Galgibaga and Cola Beach have increased direct tourist spend at Canacona family restaurants by +260% without compromising Olive Ridley nesting sanctuaries.',
    action: 'Maintain strict protected zone visitor caps'
  },
  {
    type: 'opportunity',
    title: 'Central Heritage Island Opportunity',
    description: 'Divar and Chorao islands are running at only 18% visitor capacity. Introducing subsidized river ferry cycling tours can balance mid-day Old Goa cathedral crowds.',
    action: 'Activate promotional badge on Tourist Portal'
  }
];
