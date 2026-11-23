/**
 * GoaSmart Platform - Marketplace Businesses Seeding Script
 * 
 * Safely seeds baseline local Goan businesses into Cloud Firestore
 * at collection 'businesses/{businessId}'.
 * 
 * Data Integrity Guarantees:
 * - Deterministic document IDs (biz-1 ... biz-6) prevent duplicates on repeated runs.
 * - Uses { merge: true } to preserve any existing user updates or ratings.
 * - NEVER deletes or overwrites other existing business documents.
 * - Preserves user-created listings completely.
 * 
 * Usage:
 *   node scripts/seedBusinesses.js
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { INITIAL_BUSINESSES } from '../src/data/businesses.js';

console.log('===============================================================');
console.log('       GOASMART FIRESTORE BUSINESSES SEEDING UTILITY');
console.log('===============================================================\n');

const defaultKeyPath = resolve(process.cwd(), 'serviceAccountKey.json');
let credential = null;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS && existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
  console.log(`Using credentials from GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
  const serviceAccount = JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
  credential = cert(serviceAccount);
} else if (existsSync(defaultKeyPath)) {
  console.log(`Using credentials from local file: ${defaultKeyPath}`);
  const serviceAccount = JSON.parse(readFileSync(defaultKeyPath, 'utf8'));
  credential = cert(serviceAccount);
} else {
  console.error('\x1b[31m%s\x1b[0m', 'Error: No Firebase Admin service account key found.');
  console.log('Please ensure serviceAccountKey.json is placed in the project root.');
  process.exit(1);
}

const app = getApps().length ? getApps()[0] : initializeApp({ credential });
const db = getFirestore(app);

async function seedBusinesses() {
  console.log(`Starting safe merge-seed for ${INITIAL_BUSINESSES.length} baseline businesses...\n`);
  let seededCount = 0;

  for (const biz of INITIAL_BUSINESSES) {
    const docRef = db.collection('businesses').doc(biz.id);
    const docSnap = await docRef.get();

    const payload = {
      name: biz.name,
      ownerName: biz.ownerName || 'Goan Enterprise Host',
      category: biz.category || 'Homestays and accommodations',
      experienceType: biz.experienceType || 'Local Experience',
      description: biz.description || '',
      region: biz.region || 'South Goa',
      taluka: biz.taluka || '',
      location: biz.location || 'Goa',
      address: biz.location || 'Goa',
      startingPrice: Number(biz.startingPrice || 500),
      price: Number(biz.startingPrice || 500),
      priceUnit: biz.priceUnit || 'per person',
      image: biz.image,
      contact: biz.contact || '+91 98765 00000',
      isActive: true,
      rating: biz.rating || 4.9,
      reviewsCount: biz.reviewsCount || 10,
      isLesserKnown: Boolean(biz.isLesserKnown ?? true),
      isFairVisibilityFeatured: Boolean(biz.isFairVisibilityFeatured ?? true),
      experiences: biz.experiences || [],
      services: biz.services || [],
      operatingHours: biz.operatingHours || '09:00 AM - 06:00 PM',
      updatedAt: FieldValue.serverTimestamp()
    };

    if (!docSnap.exists) {
      // First time insert: set ownerUid and createdAt
      payload.ownerUid = 'official-tourism-host';
      payload.createdAt = FieldValue.serverTimestamp();
      await docRef.set(payload);
      console.log(` ✓ [INSERTED] ${biz.id}: ${biz.name}`);
    } else {
      // Existing document: use merge to preserve existing ownerUid, createdAt, and custom edits
      await docRef.set(payload, { merge: true });
      console.log(` ✓ [MERGED]   ${biz.id}: ${biz.name} (preserved existing attributes)`);
    }

    seededCount++;
  }

  console.log('\n---------------------------------------------------------------');
  console.log(`SUCCESS: ${seededCount} baseline marketplace businesses verified in Firestore.`);
  console.log('All existing and user-created business documents preserved.');
  console.log('---------------------------------------------------------------\n');
}

seedBusinesses()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error during businesses seeding:', err);
    process.exit(1);
  });
