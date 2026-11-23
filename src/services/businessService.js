import { INITIAL_BUSINESSES, SAMPLE_BOOKINGS } from '../data/businesses';

const STORAGE_KEY_BIZ = 'goasmart_businesses_v1';
const STORAGE_KEY_BOOKINGS = 'goasmart_bookings_v1';

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
    console.error('Failed to save businesses', e);
  }
}

export function addBusiness(newBizData) {
  const current = getBusinesses();
  const created = {
    ...newBizData,
    id: `biz-${Date.now()}`,
    rating: 5.0,
    reviewsCount: 1,
    isLesserKnown: true,
    isFairVisibilityFeatured: true,
    experiences: newBizData.experiences || [
      { name: newBizData.category, price: newBizData.startingPrice, duration: '2 Hours', per: 'per person' }
    ]
  };
  const updated = [created, ...current];
  saveBusinesses(updated);
  return created;
}

export function updateBusiness(id, updatedData) {
  const current = getBusinesses();
  const updated = current.map((b) => (b.id === id ? { ...b, ...updatedData } : b));
  saveBusinesses(updated);
  return updated.find((b) => b.id === id);
}

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
