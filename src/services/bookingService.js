/**
 * GoaSmart Platform - Marketplace Booking Firestore Service
 * 
 * Interacts with 'bookings' Firestore collection:
 * bookings/{bookingId}
 * 
 * Fields:
 * - bookingId (string - unique reference)
 * - businessId (string - target business ID)
 * - businessName (string - name of the enterprise)
 * - businessLocation (string - taluka / village)
 * - businessImage (string - photo / category fallback)
 * - ownerUid (string - UID of business host)
 * - ownerName (string - name of host)
 * - touristUid (string - UID of tourist)
 * - touristName (string - name of tourist)
 * - touristEmail (string - email of tourist)
 * - touristPhone (string - phone of tourist)
 * - serviceName (string - chosen experience or service)
 * - requestedDate (string YYYY-MM-DD - separate from creation timestamp)
 * - requestedTime (string - e.g. '10:00 AM')
 * - numberOfGuests (number - party size)
 * - notes (string - guest preferences or dietary requests)
 * - totalAmount (number - total cost in INR)
 * - bookingStatus (string: 'pending' | 'accepted' | 'rejected' | 'cancelled')
 * - createdAt (serverTimestamp)
 * - updatedAt (serverTimestamp)
 */

import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { SAMPLE_BOOKINGS } from '../data/businesses';

const COLLECTION_NAME = 'bookings';
const STORAGE_KEY_BOOKINGS = 'goasmart_bookings_v2';

/**
 * Normalizes a Firestore document snapshot or cached object into a canonical booking object
 */
export function normalizeBookingDoc(docSnapOrData, explicitId = null) {
  const data = typeof docSnapOrData.data === 'function' ? docSnapOrData.data() : docSnapOrData;
  const id = explicitId || (docSnapOrData.id ? docSnapOrData.id : data.id || data.bookingId);

  // Canonicalize status: map legacy statuses to canonical lowercase
  let status = (data.bookingStatus || data.status || 'pending').toLowerCase();
  if (status === 'confirmed') status = 'accepted';
  if (status === 'declined') status = 'rejected';

  // Extract date string
  const requestedDate = data.requestedDate || data.date || new Date().toISOString().split('T')[0];

  return {
    id,
    bookingId: data.bookingId || id,
    businessId: data.businessId || 'biz-1',
    businessName: data.businessName || 'Goan Enterprise',
    businessLocation: data.businessLocation || data.location || 'Goa',
    businessImage: data.businessImage || data.image || '',
    ownerUid: data.ownerUid || '',
    ownerName: data.ownerName || data.hostName || 'Local Host',
    touristUid: data.touristUid || '',
    touristName: data.touristName || data.customerName || 'Tourist Guest',
    touristEmail: data.touristEmail || data.customerEmail || '',
    touristPhone: data.touristPhone || data.customerPhone || '',
    serviceName: data.serviceName || 'Authentic Experience',
    requestedDate,
    date: requestedDate, // legacy alias
    requestedTime: data.requestedTime || '10:00 AM',
    numberOfGuests: Number(data.numberOfGuests || data.guests || 2),
    guests: Number(data.numberOfGuests || data.guests || 2), // legacy alias
    notes: data.notes || '',
    totalAmount: Number(data.totalAmount || 0),
    bookingStatus: status,
    status, // legacy alias for existing UI components
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || new Date().toISOString())
  };
}

/**
 * Local cache getters & setters for resilience
 */
export function getLocalBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (!raw) return SAMPLE_BOOKINGS.map((b) => normalizeBookingDoc(b));
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((b) => normalizeBookingDoc(b)) : [];
  } catch {
    return SAMPLE_BOOKINGS.map((b) => normalizeBookingDoc(b));
  }
}

export function saveLocalBookings(bookings) {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to save bookings locally:', e);
  }
}

/**
 * Create ONE persistent Firestore booking document
 * Used by Tourist when booking an experience
 */
export async function createBooking(bookingPayload, touristUser = null) {
  if (!bookingPayload.businessId) {
    throw new Error('Business ID is required to book.');
  }
  if (!bookingPayload.requestedDate) {
    throw new Error('A valid visit date is required.');
  }

  const touristUid = touristUser?.uid || bookingPayload.touristUid;
  if (!touristUid) {
    throw new Error('You must be signed in as a Tourist to make a reservation.');
  }

  // Generate unique booking reference
  const randomRef = Math.floor(1000 + Math.random() * 9000);
  const bookingReference = `BK-${Date.now().toString().slice(-4)}${randomRef}`;

  const payload = {
    bookingId: bookingReference,
    businessId: bookingPayload.businessId,
    businessName: bookingPayload.businessName || 'Local Enterprise',
    businessLocation: bookingPayload.businessLocation || bookingPayload.location || 'Goa',
    businessImage: bookingPayload.businessImage || bookingPayload.image || '',
    ownerUid: bookingPayload.ownerUid || 'verified-owner-uid',
    ownerName: bookingPayload.ownerName || 'Host',
    touristUid,
    touristName: (bookingPayload.touristName || touristUser?.displayName || 'Tourist Guest').trim(),
    touristEmail: bookingPayload.touristEmail || touristUser?.email || '',
    touristPhone: bookingPayload.touristPhone || '+91 98765 00000',
    serviceName: bookingPayload.serviceName || 'Local Goan Experience',
    requestedDate: bookingPayload.requestedDate,
    requestedTime: bookingPayload.requestedTime || '10:00 AM',
    numberOfGuests: Math.max(1, Number(bookingPayload.numberOfGuests || bookingPayload.guests || 1)),
    notes: (bookingPayload.notes || '').trim(),
    totalAmount: Math.max(0, Number(bookingPayload.totalAmount || 0)),
    bookingStatus: 'pending', // Canonical starting status
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  let docId = bookingReference;
  try {
    const bookingsCol = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(bookingsCol, payload);
    docId = docRef.id;
  } catch (err) {
    console.warn('Could not write booking directly to Firestore (saving locally):', err.message);
  }

  const createdRecord = normalizeBookingDoc({
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, docId);

  // Update local cache
  const existingLocal = getLocalBookings();
  saveLocalBookings([createdRecord, ...existingLocal.filter((b) => b.id !== docId)]);

  return createdRecord;
}

/**
 * Subscribes to live bookings for a specific Tourist (real-time synchronisation)
 */
export function subscribeTouristBookings(touristUid, onUpdate, onError) {
  if (!touristUid) {
    onUpdate([]);
    return () => {};
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('touristUid', '==', touristUid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const liveList = snapshot.docs.map((docSnap) => normalizeBookingDoc(docSnap));
        // Sort newest first
        liveList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Merge with local cache
        const allCached = getLocalBookings().filter((b) => b.touristUid !== touristUid);
        saveLocalBookings([...liveList, ...allCached]);

        onUpdate(liveList);
      },
      (err) => {
        console.warn('Tourist booking listener error (using cache):', err.message);
        if (onError) onError(err);
        // Fallback to local cache filtered for this tourist
        const cached = getLocalBookings().filter((b) => b.touristUid === touristUid);
        onUpdate(cached);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to attach tourist bookings listener:', err.message);
    const cached = getLocalBookings().filter((b) => b.touristUid === touristUid);
    onUpdate(cached);
    return () => {};
  }
}

/**
 * Subscribes to live bookings for a specific Business Owner (real-time synchronisation)
 */
export function subscribeOwnerBookings(ownerUid, onUpdate, onError) {
  if (!ownerUid) {
    onUpdate([]);
    return () => {};
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('ownerUid', '==', ownerUid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const liveList = snapshot.docs.map((docSnap) => normalizeBookingDoc(docSnap));
        // Sort newest first
        liveList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Merge with local cache
        const allCached = getLocalBookings().filter((b) => b.ownerUid !== ownerUid);
        saveLocalBookings([...liveList, ...allCached]);

        onUpdate(liveList);
      },
      (err) => {
        console.warn('Owner booking listener error (using cache):', err.message);
        if (onError) onError(err);
        // Fallback to local cache filtered for this owner
        const cached = getLocalBookings().filter((b) => b.ownerUid === ownerUid);
        onUpdate(cached);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to attach owner bookings listener:', err.message);
    const cached = getLocalBookings().filter((b) => b.ownerUid === ownerUid);
    onUpdate(cached);
    return () => {};
  }
}

/**
 * Business Owner updates a booking status (accept / reject)
 * Updates the SAME Firestore document
 */
export async function updateBookingStatusByOwner(bookingId, targetStatus, ownerUid) {
  const validStatuses = ['accepted', 'rejected', 'pending'];
  const canonicalStatus = targetStatus.toLowerCase() === 'confirmed' ? 'accepted' :
                          targetStatus.toLowerCase() === 'declined' ? 'rejected' :
                          targetStatus.toLowerCase();

  if (!validStatuses.includes(canonicalStatus)) {
    throw new Error(`Invalid status transition: ${targetStatus}`);
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, bookingId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const currentData = snap.data();
      if (ownerUid && currentData.ownerUid !== ownerUid) {
        throw new Error('Permission denied: You do not own the business associated with this booking.');
      }
      await updateDoc(docRef, {
        bookingStatus: canonicalStatus,
        status: canonicalStatus,
        updatedAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.warn(`Firestore booking status update failed for ${bookingId} (updating local cache):`, err.message);
  }

  // Update local cache
  const localList = getLocalBookings();
  const updated = localList.map((b) => {
    if (b.id === bookingId || b.bookingId === bookingId) {
      return {
        ...b,
        bookingStatus: canonicalStatus,
        status: canonicalStatus,
        updatedAt: new Date().toISOString()
      };
    }
    return b;
  });
  saveLocalBookings(updated);
  return updated.find((b) => b.id === bookingId || b.bookingId === bookingId);
}

/**
 * Tourist cancels their own eligible pending booking request
 * Updates the SAME Firestore document
 */
export async function cancelBookingByTourist(bookingId, touristUid) {
  try {
    const docRef = doc(db, COLLECTION_NAME, bookingId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const currentData = snap.data();
      if (touristUid && currentData.touristUid !== touristUid) {
        throw new Error('Permission denied: You can only cancel your own bookings.');
      }
      const curStatus = (currentData.bookingStatus || currentData.status || '').toLowerCase();
      if (curStatus !== 'pending') {
        throw new Error(`Cannot cancel a booking with status "${curStatus}". Only pending bookings can be cancelled.`);
      }
      await updateDoc(docRef, {
        bookingStatus: 'cancelled',
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.warn(`Firestore tourist cancellation failed for ${bookingId} (updating local cache):`, err.message);
  }

  // Update local cache
  const localList = getLocalBookings();
  const updated = localList.map((b) => {
    if (b.id === bookingId || b.bookingId === bookingId) {
      return {
        ...b,
        bookingStatus: 'cancelled',
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      };
    }
    return b;
  });
  saveLocalBookings(updated);
  return updated.find((b) => b.id === bookingId || b.bookingId === bookingId);
}
