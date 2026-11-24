/**
 * GoaSmart Platform - Firestore Destination Service
 * 
 * Interacts with the 'destinations' Firestore collection:
 * destinations/{destinationId}
 * 
 * Fields:
 * - name (string)
 * - description (string)
 * - region (string: 'North Goa' | 'South Goa' | 'Central Goa')
 * - category (string)
 * - latitude (number)
 * - longitude (number)
 * - image (string URL)
 * - estimatedCost (string / number)
 * - averageVisitDuration (string)
 * - crowdLevel (string: 'Low' | 'Moderate' | 'High' | 'Very High')
 * - isActive (boolean)
 */

import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { DESTINATIONS as FALLBACK_DESTINATIONS } from '../data/destinations';

const COLLECTION_NAME = 'destinations';

/**
 * Normalizes a Firestore destination document to ensure full compatibility
 * with all existing Phase 1–5 components.
 */
function normalizeDestinationDoc(docSnap) {
  const data = docSnap.data();
  const id = docSnap.id;

  // Normalize coordinates: support either flat latitude/longitude or nested coordinates
  const lat = data.latitude !== undefined ? Number(data.latitude) : (data.coordinates?.lat || 15.35);
  const lng = data.longitude !== undefined ? Number(data.longitude) : (data.coordinates?.lng || 73.95);

  return {
    id,
    name: data.name || 'Goa Destination',
    description: data.description || '',
    region: data.region || 'North Goa',
    taluka: data.taluka || '',
    category: data.category || 'Beach & Nature',
    mapCategory: data.mapCategory || (data.category?.includes('Beach') ? 'Beaches' : 'Popular attractions'),
    recCategories: data.recCategories || [data.category || 'General'],
    crowdLevel: data.crowdLevel || 'Moderate',
    crowdScore: data.crowdScore !== undefined ? Number(data.crowdScore) : (data.crowdLevel === 'Very High' ? 90 : data.crowdLevel === 'High' ? 75 : data.crowdLevel === 'Low' ? 30 : 50),
    crowdStatusColor: data.crowdStatusColor || (data.crowdLevel === 'Very High' || data.crowdLevel === 'High' ? 'red' : data.crowdLevel === 'Low' ? 'emerald' : 'amber'),
    isHotspot: Boolean(data.isHotspot ?? (data.crowdLevel === 'Very High' || data.crowdLevel === 'High')),
    estimatedVisitorsNow: data.estimatedVisitorsNow || 1200,
    peakHours: data.peakHours || '4:00 PM - 8:00 PM',
    bestTimeToVisit: data.bestTimeToVisit || 'Early Morning',
    rating: data.rating ? Number(data.rating) : 4.5,
    reviewsCount: data.reviewsCount ? Number(data.reviewsCount) : 1500,
    image: data.image || '/images/destinations/north-goa/baga-beach.jpg',
    highlights: Array.isArray(data.highlights) ? data.highlights : ['Scenic views', 'Cultural significance'],
    entryFee: data.estimatedCost || data.entryFee || 'Free',
    estimatedCost: data.estimatedCost || data.entryFee || 'Free',
    averageVisitDuration: data.averageVisitDuration || '2 - 3 Hours',
    openingHours: data.openingHours || 'Open 24 Hours',
    coordinates: { lat, lng },
    latitude: lat,
    longitude: lng,
    activities: Array.isArray(data.activities) ? data.activities : ['Sightseeing', 'Photography'],
    tags: Array.isArray(data.tags) ? data.tags : [data.region || 'Goa', data.category || 'Tour'],
    recommendedAlternatives: Array.isArray(data.recommendedAlternatives) ? data.recommendedAlternatives : [],
    weather: data.weather || { temp: 30, condition: 'Sunny & Warm', uvIndex: 7 },
    hourlyCrowdTrend: Array.isArray(data.hourlyCrowdTrend) ? data.hourlyCrowdTrend : [
      { hour: '06:00', crowd: 20 },
      { hour: '09:00', crowd: 40 },
      { hour: '12:00', crowd: 65 },
      { hour: '15:00', crowd: 80 },
      { hour: '18:00', crowd: 85 },
      { hour: '21:00', crowd: 60 }
    ],
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
  };
}

/**
 * Fetch all active destinations from Firestore.
 * If the collection is not yet populated or offline, falls back to the high-quality
 * built-in dataset to maintain 100% app reliability.
 */
export async function getDestinations() {
  try {
    const destsRef = collection(db, COLLECTION_NAME);
    const q = query(destsRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const records = snapshot.docs.map(normalizeDestinationDoc);
      return records;
    }

    // If query by isActive returns empty, try fetching all
    const allSnapshot = await getDocs(destsRef);
    if (!allSnapshot.empty) {
      return allSnapshot.docs.map(normalizeDestinationDoc);
    }

    // Fallback if empty in Firestore
    console.info('Firestore destinations empty. Using initial local dataset fallback.');
    return FALLBACK_DESTINATIONS;
  } catch (error) {
    console.warn('Firestore destination fetch warning, falling back to local data:', error.message);
    return FALLBACK_DESTINATIONS;
  }
}

/**
 * Fetch a single destination by its ID from Firestore.
 */
export async function getDestinationById(destinationId) {
  if (!destinationId) return null;
  try {
    const destRef = doc(db, COLLECTION_NAME, destinationId);
    const docSnap = await getDoc(destRef);
    if (docSnap.exists()) {
      return normalizeDestinationDoc(docSnap);
    }
  } catch (error) {
    console.warn(`Error fetching destination ${destinationId} from Firestore:`, error.message);
  }

  // Fallback lookup from static dataset
  return FALLBACK_DESTINATIONS.find((d) => d.id === destinationId) || null;
}

/**
 * Helper to filter destinations by region, category, search query, and peaceful status.
 */
export function filterDestinations(destinations, {
  region = 'All',
  category = 'All',
  searchQuery = '',
  onlyPeaceful = false
} = {}) {
  if (!Array.isArray(destinations)) return [];

  return destinations.filter((d) => {
    // Region
    if (region !== 'All' && d.region !== region) {
      return false;
    }

    // Category
    if (category !== 'All') {
      if (category === 'Peaceful & Quiet') {
        if ((d.crowdScore || 0) >= 50) return false;
      } else if (d.category !== category && !d.tags?.includes(category)) {
        return false;
      }
    }

    // Peaceful flag
    if (onlyPeaceful && (d.crowdScore || 0) >= 45) {
      return false;
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = d.name?.toLowerCase().includes(q);
      const matchRegion = d.region?.toLowerCase().includes(q);
      const matchDesc = d.description?.toLowerCase().includes(q);
      const matchTaluka = d.taluka?.toLowerCase().includes(q);
      const matchTags = d.tags?.some((t) => t.toLowerCase().includes(q));
      const matchActivities = d.activities?.some((a) => a.toLowerCase().includes(q));
      if (!matchName && !matchRegion && !matchDesc && !matchTaluka && !matchTags && !matchActivities) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Development utility: Seeds the standard Goa destinations dataset into Firestore.
 * Uses deterministic document IDs to prevent duplicates.
 */
export async function seedDestinationsToFirestore(destinations = FALLBACK_DESTINATIONS) {
  const results = { added: 0, failed: 0, errors: [] };

  for (const dest of destinations) {
    try {
      const destRef = doc(db, COLLECTION_NAME, dest.id);
      const payload = {
        name: dest.name,
        description: dest.description,
        region: dest.region,
        taluka: dest.taluka || '',
        category: dest.category,
        mapCategory: dest.mapCategory || 'Beaches',
        recCategories: dest.recCategories || [dest.category],
        latitude: dest.coordinates?.lat || 15.35,
        longitude: dest.coordinates?.lng || 73.95,
        image: dest.image,
        estimatedCost: dest.entryFee || 'Free',
        averageVisitDuration: '2 - 3 Hours',
        crowdLevel: dest.crowdLevel || 'Moderate',
        crowdScore: dest.crowdScore || 50,
        crowdStatusColor: dest.crowdStatusColor || 'amber',
        isHotspot: Boolean(dest.isHotspot),
        estimatedVisitorsNow: dest.estimatedVisitorsNow || 1000,
        peakHours: dest.peakHours || '4:00 PM - 8:00 PM',
        bestTimeToVisit: dest.bestTimeToVisit || 'Morning',
        rating: dest.rating || 4.5,
        reviewsCount: dest.reviewsCount || 1000,
        highlights: dest.highlights || [],
        activities: dest.activities || [],
        tags: dest.tags || [],
        recommendedAlternatives: dest.recommendedAlternatives || [],
        weather: dest.weather || { temp: 30, condition: 'Sunny' },
        hourlyCrowdTrend: dest.hourlyCrowdTrend || [],
        isActive: true,
        updatedAt: serverTimestamp()
      };

      await setDoc(destRef, payload, { merge: true });
      results.added++;
    } catch (err) {
      results.failed++;
      results.errors.push({ id: dest.id, error: err.message });
    }
  }

  return results;
}
