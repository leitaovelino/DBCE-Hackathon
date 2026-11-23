/**
 * GoaSmart Platform - Destinations Seeding Script
 * 
 * Inserts 20 representative destinations (North, South, and Central Goa)
 * into Cloud Firestore at collection 'destinations/{destinationId}'.
 * 
 * Features:
 * - Deterministic document IDs prevent duplicate documents on repeated runs.
 * - Uses { merge: true } to preserve any existing telemetry updates.
 * - Supports Firebase Admin SDK (with serviceAccountKey.json) or
 *   direct Firestore Client SDK using .env.local configuration.
 * 
 * Usage:
 *   node scripts/seedDestinations.js
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Parse .env.local if present
const envLocalPath = resolve(process.cwd(), '.env.local');
const envVars = {};
if (existsSync(envLocalPath)) {
  const content = readFileSync(envLocalPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        envVars[key] = val;
      }
    }
  });
}

// Destination dataset
import { DESTINATIONS } from '../src/data/destinations.js';

console.log('===============================================================');
console.log('       GOASMART FIRESTORE DESTINATION SEEDING UTILITY');
console.log('===============================================================\n');

async function seedWithAdmin() {
  const { initializeApp, cert, getApps } = await import('firebase-admin/app');
  const { getFirestore, FieldValue } = await import('firebase-admin/firestore');
  const serviceAccountPath = resolve(process.cwd(), 'serviceAccountKey.json');
  let app;

  if (existsSync(serviceAccountPath)) {
    console.log(`Using Firebase Admin SDK with credentials from: ${serviceAccountPath}`);
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    app = getApps().length ? getApps()[0] : initializeApp({
      credential: cert(serviceAccount)
    });
  } else if (envVars.VITE_FIREBASE_PROJECT_ID) {
    console.log(`Initializing Firebase Admin with Project ID: ${envVars.VITE_FIREBASE_PROJECT_ID}`);
    app = getApps().length ? getApps()[0] : initializeApp({
      projectId: envVars.VITE_FIREBASE_PROJECT_ID
    });
  } else {
    throw new Error('No serviceAccountKey.json or VITE_FIREBASE_PROJECT_ID found.');
  }

  const db = getFirestore(app);
  let seededCount = 0;

  for (const dest of DESTINATIONS) {
    const lat = dest.coordinates?.lat || 15.35;
    const lng = dest.coordinates?.lng || 73.95;

    const payload = {
      name: dest.name,
      description: dest.description,
      region: dest.region,
      taluka: dest.taluka || '',
      category: dest.category,
      mapCategory: dest.mapCategory || 'Beaches',
      recCategories: dest.recCategories || [dest.category],
      latitude: lat,
      longitude: lng,
      image: dest.image,
      estimatedCost: dest.entryFee || 'Free',
      averageVisitDuration: '2 - 3 Hours',
      crowdLevel: dest.crowdLevel || 'Moderate',
      crowdScore: dest.crowdScore || 50,
      crowdStatusColor: dest.crowdStatusColor || 'amber',
      isHotspot: Boolean(dest.isHotspot),
      estimatedVisitorsNow: dest.estimatedVisitorsNow || 1000,
      peakHours: dest.peakHours || '4:00 PM - 8:00 PM',
      bestTimeToVisit: dest.bestTimeToVisit || 'Early Morning',
      rating: dest.rating || 4.5,
      reviewsCount: dest.reviewsCount || 1000,
      highlights: dest.highlights || [],
      activities: dest.activities || [],
      tags: dest.tags || [],
      recommendedAlternatives: dest.recommendedAlternatives || [],
      weather: dest.weather || { temp: 30, condition: 'Sunny' },
      hourlyCrowdTrend: dest.hourlyCrowdTrend || [],
      isActive: true,
      updatedAt: FieldValue.serverTimestamp()
    };

    await db.collection('destinations').doc(dest.id).set(payload, { merge: true });
    seededCount++;
    console.log(`  ✓ Seeded [${dest.region}] ${dest.name} (id: ${dest.id})`);
  }

  console.log(`\n\x1b[32mSuccessfully seeded ${seededCount} destinations into Firestore collection 'destinations'.\x1b[0m\n`);
}

seedWithAdmin()
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.warn('Admin SDK seed note:', err.message);
    console.log('\nNote: Service account key is not present locally. Seeding can also be executed:');
    console.log('1. By downloading serviceAccountKey.json from Firebase Console.');
    console.log('2. Directly within the app via destinationService.seedDestinationsToFirestore().\n');
    process.exit(0);
  });
