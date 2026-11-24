import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  Clock3,
  XCircle,
  Ban,
  Filter,
  Eye,
  Store,
  Compass,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeTouristBookings, cancelBookingByTourist, getLocalBookings } from '../services/bookingService';
import { getCategoryFallbackImage } from '../services/storageService';

export default function TouristMyBookings({ onBackToMarketplace, onExplore }) {
  const { currentUser, userProfile } = useAuth();
  const [bookings, setBookings] = useState(() => {
    if (!currentUser?.uid) return [];
    return getLocalBookings().filter((b) => b.touristUid === currentUser.uid);
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'pending', 'accepted', 'rejected', 'cancelled', 'upcoming', 'past'
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null); // Booking object to cancel
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Subscribe to live Firestore bookings for this tourist
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeTouristBookings(
      currentUser.uid,
      (liveBookings) => {
        setBookings(liveBookings);
        setLoading(false);
      },
      (err) => {
        console.warn('Real-time listener notice:', err);
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [currentUser?.uid]);

  // Handle Cancellation confirmation
  const handleConfirmCancel = async () => {
    if (!cancellingBooking || !currentUser?.uid) return;
    setActionError('');
    setActionSuccess('');

    try {
      await cancelBookingByTourist(cancellingBooking.id || cancellingBooking.bookingId, currentUser.uid);
      setActionSuccess(`Booking ${cancellingBooking.bookingId || cancellingBooking.id} has been cancelled.`);
      setCancellingBooking(null);
      if (selectedBookingForDetails?.id === cancellingBooking.id) {
        setSelectedBookingForDetails(null);
      }
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError('Failed to cancel reservation: ' + err.message);
    }
  };

  // Filter Bookings
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const status = (b.bookingStatus || b.status || 'pending').toLowerCase();
      const visitDate = b.requestedDate || b.date || '';

      if (activeFilter === 'pending') return status === 'pending';
      if (activeFilter === 'accepted') return status === 'accepted' || status === 'confirmed';
      if (activeFilter === 'rejected') return status === 'rejected' || status === 'declined';
      if (activeFilter === 'cancelled') return status === 'cancelled';
      if (activeFilter === 'upcoming') {
        // Return upcoming dates or pending requests
        return visitDate >= todayStr || status === 'pending';
      }
      if (activeFilter === 'past') {
        return visitDate < todayStr && status !== 'pending';
      }
      return true; // 'all'
    });
  }, [bookings, activeFilter, todayStr]);

  // Counts for Badges
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => (b.bookingStatus || b.status) === 'pending').length;
    const accepted = bookings.filter((b) => ['accepted', 'confirmed'].includes(b.bookingStatus || b.status)).length;
    const cancelled = bookings.filter((b) => (b.bookingStatus || b.status) === 'cancelled').length;
    return { total, pending, accepted, cancelled };
  }, [bookings]);

  return (
    <div className="py-8 sm:py-12 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-80px)] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 text-xs font-bold mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Tourist Reservation Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              My Bookings & Experiences
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Track real-time confirmations, manage your Goan homestay dates, guided tours, and village experiences.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onBackToMarketplace}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>Explore Marketplace</span>
            </button>
            <button
              onClick={onExplore}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Goa</span>
            </button>
          </div>
        </div>

        {/* Action Alerts */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <span className="text-xs text-slate-400 dark:text-slate-400 font-bold block">Total Bookings</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{stats.total}</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">All reservations</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold block flex items-center gap-1">
              <Clock3 className="w-3.5 h-3.5" />
              <span>Pending</span>
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.pending}</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Awaiting Host Reply</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Accepted</span>
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.accepted}</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Confirmed by Host</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block flex items-center gap-1">
              <Ban className="w-3.5 h-3.5" />
              <span>Cancelled</span>
            </span>
            <div className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">{stats.cancelled}</div>
            <span className="text-[10px] text-slate-400 font-medium">Withdrawn Requests</span>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          {[
            { id: 'all', label: 'All Bookings', count: stats.total },
            { id: 'pending', label: 'Pending', count: stats.pending },
            { id: 'accepted', label: 'Accepted', count: stats.accepted },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'past', label: 'Past' },
            { id: 'cancelled', label: 'Cancelled', count: stats.cancelled }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === tab.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeFilter === tab.id ? 'bg-teal-900/60 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bookings List / Cards */}
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-teal-600" />
            <p className="text-xs font-bold">Synchronizing with live reservation records...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center space-y-4 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">
              No reservations found in "{activeFilter}"
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {bookings.length === 0
                ? "You haven't booked any village homestays, kayak adventures, or food tours yet. Browse the Local Business Marketplace to book direct with Goan families!"
                : "No bookings match this filter criterion. Switch filters or browse new listings."}
            </p>
            <button
              onClick={onBackToMarketplace}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>Discover Local Experiences</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredBookings.map((b) => {
              const status = (b.bookingStatus || b.status || 'pending').toLowerCase();
              return (
                <div
                  key={b.id || b.bookingId}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between transition-colors hover:border-teal-500/40"
                >
                  <div className="space-y-3">
                    {/* Top Row: Ref & Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {b.bookingId || b.id}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        status === 'accepted' || status === 'confirmed'
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : status === 'pending'
                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : status === 'rejected' || status === 'declined'
                          ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {status === 'accepted' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {status === 'pending' && <Clock3 className="w-3 h-3 text-amber-600" />}
                        {status === 'rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                        {status === 'cancelled' && <Ban className="w-3 h-3 text-slate-500" />}
                        <span>{status}</span>
                      </span>
                    </div>

                    {/* Middle: Business & Service */}
                    <div className="flex gap-3.5">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                        <img
                          src={b.businessImage || getCategoryFallbackImage('Homestay')}
                          alt={b.businessName}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getCategoryFallbackImage('Homestay');
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {b.businessName}
                        </h4>
                        <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 truncate">
                          {b.serviceName}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{b.businessLocation}</span>
                          {b.ownerName && (
                            <>
                              <span>•</span>
                              <span className="truncate">Host: {b.ownerName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Details Row */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Visit Date</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{b.requestedDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Party Size</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{b.numberOfGuests} Guests</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Estimated Cost</span>
                        <span className="font-black text-emerald-700 dark:text-emerald-400">
                          {b.totalAmount > 0 ? `₹${b.totalAmount.toLocaleString()}` : 'Free / Inquiry'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedBookingForDetails(b)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Voucher</span>
                    </button>

                    {status === 'pending' && (
                      <button
                        onClick={() => setCancellingBooking(b)}
                        className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancel Request</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Booking Details Modal */}
      {selectedBookingForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-teal-600 dark:text-teal-400">
                  Official Reservation Voucher
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  {selectedBookingForDetails.businessName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBookingForDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reference ID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {selectedBookingForDetails.bookingId || selectedBookingForDetails.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Experience / Service:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{selectedBookingForDetails.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Visit Date:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{selectedBookingForDetails.requestedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Party Size:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{selectedBookingForDetails.numberOfGuests} Guests</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Host Contact:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{selectedBookingForDetails.ownerName || 'Verified Host'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    {selectedBookingForDetails.bookingStatus || selectedBookingForDetails.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Total:</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    ₹{selectedBookingForDetails.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedBookingForDetails.notes && (
                <div>
                  <span className="text-slate-400 font-bold block mb-1">Guest Notes:</span>
                  <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {selectedBookingForDetails.notes}
                  </p>
                </div>
              )}

              <div className="text-[10px] text-slate-400 space-y-1">
                <div>Created: {new Date(selectedBookingForDetails.createdAt).toLocaleString()}</div>
                <div>Last Updated: {new Date(selectedBookingForDetails.updatedAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedBookingForDetails(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <Ban className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Cancel Booking Request?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to cancel your reservation for <strong>{cancellingBooking.businessName}</strong> on <strong>{cancellingBooking.requestedDate}</strong>? This action updates your booking to Cancelled and notifies the host.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setCancellingBooking(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
