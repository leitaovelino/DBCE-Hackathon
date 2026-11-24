/**
 * GoaSmart Platform - Update Destination Image References
 * 
 * Maps all 22 destinations to their local public image paths in:
 * 1. src/data/destinations.js
 * 2. Cloud Firestore destinations collection (targeted doc update of image field ONLY)
 */

import fs from 'fs';
import path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const LOCAL_IMAGE_MAP = {
  'baga-beach': '/images/destinations/north-goa/baga-beach.jpg',
  'calangute-beach': '/images/destinations/north-goa/calangute-beach.jpg',
  'galgibaga-beach': '/images/destinations/south-goa/galgibaga-beach.jpg',
  'cola-beach': '/images/destinations/south-goa/cola-beach.jpg',
  'anjuna-beach': '/images/destinations/north-goa/anjuna-beach.jpg',
  'vagator-beach': '/images/destinations/north-goa/vagator-beach.jpg',
  'fort-aguada': '/images/destinations/heritage/fort-aguada.jpg',
  'cabo-de-rama': '/images/destinations/heritage/cabo-de-rama.jpg',
  'dudhsagar-falls': '/images/destinations/waterfalls/dudhsagar-falls.jpg',
  'tambdi-surla': '/images/destinations/heritage/tambdi-surla.jpg',
  'basilica-bom-jesus': '/images/destinations/heritage/basilica-of-bom-jesus.jpg',
  'se-cathedral': '/images/destinations/heritage/se-cathedral.jpg',
  'mangeshi-temple': '/images/destinations/heritage/mangeshi-temple.jpg',
  'chapora-fort': '/images/destinations/heritage/chapora-fort.jpg',
  'reis-magos-fort': '/images/destinations/heritage/reis-magos-fort.jpg',
  'divar-island': '/images/destinations/central-goa/divar-island.jpg',
  'chorao-island': '/images/destinations/central-goa/chorao-island.jpg',
  'fontainhas-panaji': '/images/destinations/central-goa/fontainhas.jpg',
  'netravali-lake': '/images/destinations/south-goa/netravali-lake.jpg',
  'butterfly-beach': '/images/destinations/south-goa/butterfly-beach.jpg',
  'palolem-beach': '/images/destinations/south-goa/palolem-beach.jpg',
  'grand-island-scuba': '/images/destinations/south-goa/grand-island-scuba.jpg'
};

// 1. Update src/data/destinations.js
const destDataPath = path.resolve(process.cwd(), 'src', 'data', 'destinations.js');
let content = fs.readFileSync(destDataPath, 'utf8');

// Replace image URLs for each destination
for (const [id, localImg] of Object.entries(LOCAL_IMAGE_MAP)) {
  // Pattern matching: id: 'xxx', ... image: '...'
  const idRegex = new RegExp(`id:\\s*['"]${id}['"][\\s\\S]*?image:\\s*['"][^'"]+['"]`);
  content = content.replace(idRegex, (match) => {
    return match.replace(/image:\s*['"][^'"]+['"]/, `image: '${localImg}'`);
  });
}

fs.writeFileSync(destDataPath, content, 'utf8');
console.log('✓ Successfully updated src/data/destinations.js with local image references');

// 2. Targeted update of Firestore destinations collection (image field ONLY)
const defaultKeyPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
if (fs.existsSync(defaultKeyPath)) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(defaultKeyPath, 'utf8'));
    const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore(app);

    console.log('Performing targeted update of Firestore destinations collection...');
    const snapshot = await db.collection('destinations').get();
    let updatedDocs = 0;

    for (const docSnap of snapshot.docs) {
      const destId = docSnap.id;
      const localImage = LOCAL_IMAGE_MAP[destId];
      if (localImage) {
        // Safe targeted update: update ONLY the image field, preserving all other fields and document ID!
        await docSnap.ref.update({ image: localImage });
        updatedDocs++;
      }
    }
    console.log(`✓ Safely updated image field for ${updatedDocs} Firestore destination documents without data loss!`);
  } catch (err) {
    console.warn('Firestore update warning:', err.message);
  }
} else {
  console.log('No serviceAccountKey.json found, skipping remote Firestore update.');
}
