import { DESTINATIONS } from '../data/destinations';

/**
 * Intelligent Tourist Nudge Service
 * Proactively diverts tourists from crowded hotspots to serene alternatives.
 */

export const SMART_NUDGES = [
  {
    id: 'nudge-baga',
    originalDestId: 'baga-beach',
    originalName: 'Baga Beach',
    originalCrowd: 92,
    originalCategory: 'HIGH',
    alternativeDestId: 'cola-beach',
    alternativeName: 'Cola Beach & Emerald Lagoon',
    alternativeCrowd: 24,
    alternativeCategory: 'LOW',
    crowdSavedPercent: 74,
    headline: 'High Congestion Warning for Baga Beach',
    reason: 'Baga Beach is currently experiencing extreme footfall (92% crowd) and over 45 minutes of vehicular entry gridlock around Tito’s lane. Cola Beach offers a peaceful emerald sweetwater lagoon and quiet sea kayaking with virtually no commercial noise.',
    suggestedTime: 'Morning (08:30 AM - 11:30 AM) for tranquil kayaking',
    actionText: 'Switch to Cola Lagoon',
    isSimulated: true
  },
  {
    id: 'nudge-calangute',
    originalDestId: 'calangute-beach',
    originalName: 'Calangute Beach',
    originalCrowd: 89,
    originalCategory: 'HIGH',
    alternativeDestId: 'galgibaga-beach',
    alternativeName: 'Galgibaga Turtle Beach',
    alternativeCrowd: 18,
    crowdSavedPercent: 80,
    headline: 'Heavy Afternoon Peak at Calangute',
    reason: 'Calangute is currently packed with over 5,400 estimated visitors with crowded shores. Galgibaga Beach in South Goa is a protected Olive Ridley sanctuary with silver sands, pine breezes, and authentic family-run seafood shacks nearby.',
    suggestedTime: 'Late Afternoon (04:00 PM - 06:30 PM) for sunset walks',
    actionText: 'Switch to Galgibaga Beach',
    isSimulated: true
  },
  {
    id: 'nudge-aguada',
    originalDestId: 'fort-aguada',
    originalName: 'Fort Aguada & Lighthouse',
    originalCrowd: 91,
    originalCategory: 'HIGH',
    alternativeDestId: 'reis-magos-fort',
    alternativeName: 'Reis Magos Fort & Cultural Centre',
    alternativeCrowd: 22,
    crowdSavedPercent: 76,
    headline: 'Parking Bottleneck at Fort Aguada',
    reason: 'Fort Aguada has long ticket queues and full parking bays. Reis Magos Fort was built in 1551 (predating Aguada by 50 years), features intact cannons, Mario Miranda artwork, and panoramic views of Mandovi with zero wait time.',
    suggestedTime: 'Morning (10:00 AM - 12:30 PM)',
    actionText: 'Switch to Reis Magos Fort',
    isSimulated: true
  },
  {
    id: 'nudge-dudhsagar',
    originalDestId: 'dudhsagar-falls',
    originalName: 'Dudhsagar Waterfalls',
    originalCrowd: 94,
    originalCategory: 'HIGH',
    alternativeDestId: 'tambdi-surla',
    alternativeName: 'Tambdi Surla Mahadev Temple & Waterfall',
    alternativeCrowd: 19,
    crowdSavedPercent: 80,
    headline: '2+ Hour Safari Queues at Dudhsagar',
    reason: 'Dudhsagar jeep safari registration counters have reached peak queue limits. Tambdi Surla, located in the same Bhagwan Mahavir Wildlife Sanctuary, lets you explore a 12th-century Kadamba black basalt temple and a scenic jungle waterfall trek without lines.',
    suggestedTime: 'Early Morning (08:30 AM - 11:30 AM)',
    actionText: 'Switch to Tambdi Surla',
    isSimulated: true
  },
  {
    id: 'nudge-chapora',
    originalDestId: 'chapora-fort',
    originalName: 'Chapora Fort',
    originalCrowd: 82,
    originalCategory: 'HIGH',
    alternativeDestId: 'cabo-de-rama',
    alternativeName: 'Cabo de Rama Fort & Cliff Bay',
    alternativeCrowd: 26,
    crowdSavedPercent: 68,
    headline: 'Sunset Stampede at Chapora Fort',
    reason: 'Chapora ramparts become heavily congested during the 5 PM sunset window. Cabo de Rama Fort offers grander, 360-degree clifftop views of the Arabian Sea, historical canons, and a quiet scenic bay below.',
    suggestedTime: 'Golden Hour (04:30 PM - 06:15 PM)',
    actionText: 'Switch to Cabo de Rama',
    isSimulated: true
  }
];

export function getNudgesForDestinations(destIds = []) {
  if (!destIds || destIds.length === 0) {
    return SMART_NUDGES;
  }
  return SMART_NUDGES.filter((nudge) => destIds.includes(nudge.originalDestId));
}
