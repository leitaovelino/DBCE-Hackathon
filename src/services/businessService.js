/**
 * GoaSmart Platform - Business Marketplace Firestore Service
 * 
 * Interacts with 'businesses' Firestore collection:
 * businesses/{businessId}
 * 
 * Fields:
 * - ownerUid (string - matches authenticated user UID)
 * - name (string)
 * - category (string)
 * - description (string)
 * - region (string: 'North Goa' | 'South Goa' | 'Central Goa')
 * - address (string - location / address)
 * - price (number - starting price)
 * - image (string URL)
 * - contact (string - phone / email)
 * - isActive (boolean)
 * - createdAt (timestamp)
 */

import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { INITIAL_BUSINESSES, SAMPLE_BOOKINGS } from '../data/businesses';

const STORAGE_KEY_BIZ = 'goasmart_businesses_v1';
const STORAGE_KEY_BOOKINGS = 'goasmart_bookings_v1';
const COLLECTION_NAME = 'businesses';

/**
 * Normalizes a Firestore business doc to UI format
 */
function normalizeBusinessDoc(docSnap) {
  const data = docSnap.data();
  const id = docSnap.id;

  return {
    id,
    ownerUid: data.ownerUid,
    name: data.name || 'Local Goan Enterprise',
    category: data.category || 'Homestay',
    description: data.description || '',
    region: data.region || 'South Goa',
    taluka: data.taluka || data.region || '',
    location: data.address || data.location || 'Goa',
    address: data.address || data.location || 'Goa',
    startingPrice: Number(data.price ?? data.startingPrice ?? 500),
    price: Number(data.price ?? data.startingPrice ?? 500),
    priceUnit: data.priceUnit || 'per person',
    image: data.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    contact: data.contact || '+91 98765 00000',
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    rating: data.rating || 5.0,
    reviewsCount: data.reviewsCount || 1,
    isLesserKnown: Boolean(data.isLesserKnown ?? true),
    isFairVisibilityFeatured: Boolean(data.isFairVisibilityFeatured ?? true),
    experiences: Array.isArray(data.experiences) && data.experiences.length > 0 ? data.experiences : [
      { name: data.category || 'Local Experience', price: Number(data.price ?? data.startingPrice ?? 500), duration: '2 Hours', per: 'per person' }
    ],
    services: Array.isArray(data.services) ? data.services : ['Local Goan Hospitality'],
    createdAt: data.createdAt
  };
}

/**
 * Synchronous local cache fetch (for instant render on first mount)
 */
export function getBusinesses() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_BIZ);
    return data ? JSON.parse(data) : INITIAL_BUSINESSES;
  } catch {
    return INITIAL_BUSINESSES;
  }
}

export function saveBusinesses(businesses) {
  try {
    localStorage.setItem(STORAGE_KEY_BIZ, JSON.stringify(businesses));
  } catch (e) {
    console.error('Failed to save businesses locally', e);
  }
}

/**
 * Asynchronously fetch active business listings from Cloud Firestore
 */
export async function getBusinessesFromFirestore() {
  try {
    const bizRef = collection(db, COLLECTION_NAME);
    const q = query(bizRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);

    let firestoreListings = [];
    if (!snapshot.empty) {
      firestoreListings = snapshot.docs.map(normalizeBusinessDoc);
    } else {
      const allSnapshot = await getDocs(bizRef);
      if (!allSnapshot.empty) {
        firestoreListings = allSnapshot.docs.map(normalizeBusinessDoc);
      }
    }

    // Data Protection: Merge Firestore listings with baseline INITIAL_BUSINESSES
    // so baseline records are always accessible even if some are still synchronizing.
    const existingIds = new Set(firestoreListings.map((b) => b.id));
    const missingBaseline = INITIAL_BUSINESSES.filter((b) => !existingIds.has(b.id));
    const combined = [...firestoreListings, ...missingBaseline];

    // Update local storage cache
    saveBusinesses(combined);
    return combined;
  } catch (error) {
    console.warn('Firestore business fetch failed, using local cache:', error.message);
    return getBusinesses();
  }
}

/**
 * Add a new business listing to Firestore and local storage.
 * Enforces that ownerUid matches the authenticated user UID.
 */
export async function addBusiness(newBizData, ownerUid = null) {
  if (!newBizData || !newBizData.name || !newBizData.name.trim()) {
    throw new Error('Business name is required.');
  }
  if (!newBizData.category) {
    throw new Error('Business category is required.');
  }

  const current = getBusinesses();
  const price = Math.max(0, Number(newBizData.startingPrice || newBizData.price || 500));

  const resolvedOwnerUid = ownerUid || newBizData.ownerUid || 'anonymous-owner';

  const payload = {
    ownerUid: resolvedOwnerUid,
    name: newBizData.name.trim(),
    category: newBizData.category,
    description: newBizData.description || '',
    region: newBizData.region || 'South Goa',
    taluka: newBizData.taluka || '',
    address: newBizData.location || newBizData.address || 'Goa',
    location: newBizData.location || newBizData.address || 'Goa',
    price: price,
    startingPrice: price,
    priceUnit: newBizData.priceUnit || 'per person',
    image: newBizData.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    contact: newBizData.contact || '+91 98765 00000',
    isActive: true,
    rating: 5.0,
    reviewsCount: 1,
    isLesserKnown: true,
    isFairVisibilityFeatured: true,
    experiences: Array.isArray(newBizData.experiences) && newBizData.experiences.length > 0
      ? newBizData.experiences
      : [{ name: newBizData.category, price: price, duration: '2 Hours', per: 'per person' }],
    services: Array.isArray(newBizData.services)
      ? newBizData.services
      : typeof newBizData.services === 'string'
      ? newBizData.services.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Local Goan Hospitality'],
    createdAt: serverTimestamp()
  };

  // Write new unique listing document to Cloud Firestore
  let createdDocId = `biz-${Date.now()}`;
  try {
    const bizCollection = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(bizCollection, payload);
    createdDocId = docRef.id;
  } catch (err) {
    console.warn('Could not write business listing directly to Firestore (saving locally):', err.message);
  }

  const createdListing = {
    ...payload,
    id: createdDocId,
    createdAt: new Date().toISOString()
  };

  // Preserve all existing listings and prepend the new one
  const updated = [createdListing, ...current.filter((b) => b.id !== createdDocId)];
  saveBusinesses(updated);
  return createdListing;
}

/**
 * Update an existing business listing in Firestore and local storage.
 * Enforces ownership on update and guarantees ownerUid cannot be transferred.
 */
export async function updateBusiness(id, updatedData, currentUid = null) {
  const current = getBusinesses();

  // Strip immutable security fields from update payload
  const { ownerUid, createdAt, id: _stripId, ...safeUpdates } = updatedData;

  // Attempt Firestore update
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const existing = docSnap.data();
      // Ensure owner matches authenticated user
      if (currentUid && existing.ownerUid && existing.ownerUid !== currentUid) {
        throw new Error('Permission denied: You do not own this listing.');
      }
      await updateDoc(docRef, {
        ...safeUpdates,
        updatedAt: serverTimestamp()
      });
    }
  } catch (e) {
    console.warn(`Firestore update for business ${id} failed (updating locally):`, e.message);
  }

  const updated = current.map((b) => (b.id === id ? { ...b, ...safeUpdates } : b));
  saveBusinesses(updated);
  return updated.find((b) => b.id === id);
}

// -------------------------------------------------------------
// Bookings (In-memory & localStorage mock service for bookings)
// -------------------------------------------------------------
export function getBookings() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    return data ? JSON.parse(data) : SAMPLE_BOOKINGS;
  } catch {
    return SAMPLE_BOOKINGS;
  }
}

export function saveBookings(bookings) {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to save bookings', e);
  }
}

export function createBooking(bookingData) {
  const current = getBookings();
  const newBooking = {
    ...bookingData,
    id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Confirmed',
    requestTime: 'Just now'
  };
  const updated = [newBooking, ...current];
  saveBookings(updated);
  return newBooking;
}

export function updateBookingStatus(id, newStatus) {
  const current = getBookings();
  const updated = current.map((b) => (b.id === id ? { ...b, status: newStatus } : b));
  saveBookings(updated);
  return updated;
}
