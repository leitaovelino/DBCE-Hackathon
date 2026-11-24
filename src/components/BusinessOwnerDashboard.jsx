import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Building2, Plus, Edit3, Trash2, Check, X, Users, DollarSign, Eye, MessageSquare, ShieldCheck, ArrowRight, Sparkles, LogOut, Store, UploadCloud, Camera, AlertCircle, Calendar, Clock, Phone, Mail, Ban, CheckCircle2, XCircle, Clock3 } from 'lucide-react';
import { getBusinesses, getBusinessesFromFirestore, addBusiness, updateBusiness, deleteBusiness } from '../services/businessService';
import { subscribeOwnerBookings, updateBookingStatusByOwner, getLocalBookings } from '../services/bookingService';
import { MARKETPLACE_CATEGORIES } from '../data/businesses';
import { useAuth } from '../context/AuthContext';
import { uploadBusinessPhoto, validateImageFile, fileToDataUrl, getCategoryFallbackImage } from '../services/storageService';

export default function BusinessOwnerDashboard({ onBackToMarketplace }) {
  const { currentUser, userProfile, logout } = useAuth();
  const [businesses, setBusinesses] = useState(() => getBusinesses());
  const [bookings, setBookings] = useState(() => {
    if (!currentUser?.uid) return [];
    return getLocalBookings().filter((b) => b.ownerUid === currentUser.uid);
  });
  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'bookings', 'new-listing'
  const [bookingFilter, setBookingFilter] = useState('all'); // 'all', 'pending', 'accepted', 'rejected', 'cancelled'
  const [deletingBiz, setDeletingBiz] = useState(null); // business object pending delete
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);

  // Owner's listings: strictly filter by the authenticated user UID
  const ownerListings = useMemo(() => {
    if (!currentUser?.uid) return [];
    return businesses.filter((b) => b.ownerUid === currentUser.uid);
  }, [businesses, currentUser?.uid]);

  const handleLogout = async () => {
    await logout();
    if (onBackToMarketplace) onBackToMarketplace();
  };

  // Load businesses from Firestore and subscribe to live Owner Bookings
  useEffect(() => {
    let isMounted = true;
    async function refreshListings() {
      try {
        const live = await getBusinessesFromFirestore();
        if (isMounted && live && live.length > 0) {
          setBusinesses(live);
        }
      } catch (e) {
        console.warn('Fallback to local listings:', e);
      }
    }
    refreshListings();

    // Live subscription to incoming bookings for this owner
    let unsubscribeBookings = () => {};
    if (currentUser?.uid) {
      unsubscribeBookings = subscribeOwnerBookings(
        currentUser.uid,
        (liveBookings) => {
          if (isMounted) setBookings(liveBookings);
        },
        (err) => console.warn('Owner bookings listener notice:', err.message)
      );
    }

    return () => {
      isMounted = false;
      if (typeof unsubscribeBookings === 'function') unsubscribeBookings();
    };
  }, [currentUser?.uid]);

  // New Listing Form State
  const initialFormState = {
    name: '',
    ownerName: '',
    category: MARKETPLACE_CATEGORIES[1],
    region: 'South Goa',
    taluka: 'Canacona',
    location: '',
    startingPrice: 500,
    priceUnit: 'per person',
    image: '',
    storagePath: null,
    hasOwnerPhoto: false,
    description: '',
    services: 'Organic Home Dining, Guided Heritage Walk',
    contact: '+91 98765 00000',
    operatingHours: '10:00 AM - 06:00 PM'
  };

  const [newBiz, setNewBiz] = useState(initialFormState);
  const [editingBizId, setEditingBizId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Image Upload & Preview State
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setImageError(validation.error);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setSelectedFile(file);
      const dataUrl = await fileToDataUrl(file);
      setImagePreview(dataUrl);
    } catch (err) {
      setImageError('Failed to read image preview: ' + err.message);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setImageError('');
    setNewBiz((prev) => ({ ...prev, image: '', storagePath: null, hasOwnerPhoto: false }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateOrUpdateListing = async (e) => {
    e.preventDefault();
    setImageError('');

    if (!newBiz.name.trim()) {
      setImageError('Please enter a business or experience name.');
      return;
    }
    if (!newBiz.ownerName.trim()) {
      setImageError('Please enter the host or owner name.');
      return;
    }

    // Starting Price validation: finite, non-negative number
    const rawPrice = newBiz.startingPrice;
    const parsedPrice = typeof rawPrice === 'string'
      ? (rawPrice.trim() === '' ? 500 : parseFloat(rawPrice.trim()))
      : Number(rawPrice);

    if (isNaN(parsedPrice) || !isFinite(parsedPrice) || parsedPrice < 0) {
      setImageError('Please enter a valid, non-negative starting price.');
      return;
    }

    const servicesArray = typeof newBiz.services === 'string'
      ? newBiz.services.split(',').map((s) => s.trim()).filter(Boolean)
      : newBiz.services;

    const ownerUid = currentUser?.uid || 'verified-owner-uid';
    const targetListingId = editingBizId || `biz-${Date.now()}`;

    let resolvedImageUrl = newBiz.image || newBiz.imageUrl;
    let resolvedStoragePath = newBiz.storagePath;
    let hasOwnerPhoto = Boolean(newBiz.hasOwnerPhoto);

    // If the business owner selected a new photo file, upload it
    if (selectedFile) {
      setUploadingImage(true);
      try {
        const uploadResult = await uploadBusinessPhoto(selectedFile, ownerUid, targetListingId);
        if (uploadResult.downloadUrl) {
          resolvedImageUrl = uploadResult.downloadUrl;
          resolvedStoragePath = uploadResult.storagePath;
          hasOwnerPhoto = true;
        } else if (uploadResult.isFallback) {
          // Cloud Storage unprovisioned in Firebase Console (Spark Plan limitation)
          if (!resolvedImageUrl) {
            resolvedImageUrl = getCategoryFallbackImage(newBiz.category);
          }
          console.info('Storage Notice:', uploadResult.notice);
          hasOwnerPhoto = false;
        }
      } catch (uploadErr) {
        setUploadingImage(false);
        setImageError('Photo upload failed: ' + uploadErr.message);
        return;
      }
      setUploadingImage(false);
    } else if (!resolvedImageUrl) {
      // If no photo was selected and none exists, apply category-specific fallback
      resolvedImageUrl = getCategoryFallbackImage(newBiz.category);
      hasOwnerPhoto = false;
    }

    const payload = {
      ...newBiz,
      ownerName: newBiz.ownerName.trim(),
      startingPrice: parsedPrice,
      price: parsedPrice,
      image: resolvedImageUrl,
      imageUrl: resolvedImageUrl,
      storagePath: resolvedStoragePath,
      hasOwnerPhoto,
      services: servicesArray
    };

    if (editingBizId) {
      await updateBusiness(editingBizId, payload, ownerUid);
      setSuccessMessage('Listing updated successfully!');
    } else {
      await addBusiness(payload, ownerUid);
      setSuccessMessage('New local business published to the marketplace!');
    }

    const refreshed = await getBusinessesFromFirestore();
    setBusinesses(refreshed);
    setEditingBizId(null);
    setSelectedFile(null);
    setImagePreview(null);
    setNewBiz(initialFormState);
    setActiveTab('listings');

    setTimeout(() => setSuccessMessage(''), 3500);
  };

  const handleStartEdit = (biz) => {
    setEditingBizId(biz.id);
    setSelectedFile(null);
    setImageError('');
    const currentImg = biz.imageUrl || biz.image || getCategoryFallbackImage(biz.category);
    setImagePreview(currentImg);

    const resolvedPrice = biz.startingPrice !== undefined && biz.startingPrice !== null
      ? biz.startingPrice
      : (biz.price ?? 500);

    setNewBiz({
      name: biz.name || '',
      ownerName: biz.ownerName || biz.hostName || biz.contactName || '',
      category: biz.category || MARKETPLACE_CATEGORIES[1],
      region: biz.region || 'South Goa',
      taluka: biz.taluka || '',
      location: biz.location || biz.address || '',
      startingPrice: resolvedPrice,
      price: resolvedPrice,
      priceUnit: biz.priceUnit || 'per person',
      image: biz.image || biz.imageUrl || '',
      imageUrl: biz.imageUrl || biz.image || '',
      storagePath: biz.storagePath || null,
      hasOwnerPhoto: Boolean(biz.hasOwnerPhoto),
      description: biz.description || '',
      services: biz.services ? (Array.isArray(biz.services) ? biz.services.join(', ') : biz.services) : '',
      contact: biz.contact || '',
      operatingHours: biz.operatingHours || '10:00 AM - 06:00 PM'
    });
    setActiveTab('new-listing');
  };

  const handleUpdateBooking = async (id, newStatus) => {
    if (!currentUser?.uid) return;
    try {
      await updateBookingStatusByOwner(id, newStatus, currentUser.uid);
      setSuccessMessage(`Booking status updated to ${newStatus}.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setImageError('Failed to update booking: ' + err.message);
    }
  };

  const handleConfirmDeleteListing = async () => {
    if (!deletingBiz || !currentUser?.uid) return;
    try {
      await deleteBusiness(deletingBiz.id, currentUser.uid);
      setSuccessMessage(`Listing "${deletingBiz.name}" has been removed from the public marketplace.`);
      setDeletingBiz(null);
      const refreshed = await getBusinessesFromFirestore();
      setBusinesses(refreshed);
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      setImageError('Failed to delete listing: ' + err.message);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-80px)] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 text-xs font-bold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>GoaSmart Business Partner Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Local Enterprise Management Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your experience listings, incoming tourist bookings, and view fair algorithmic visibility metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                {userProfile?.name || currentUser?.displayName || currentUser?.email || 'Partner'}
              </span>
            </div>
            <button
              onClick={() => {
                setEditingBizId(null);
                setActiveTab('new-listing');
              }}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Listing</span>
            </button>
            <button
              onClick={onBackToMarketplace}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Marketplace</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title="Sign Out of Business Partner Account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Business Performance KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <span className="text-xs text-slate-400 dark:text-slate-400 font-bold block flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Total Listing Views</span>
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">1,840</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">+28% this week via AI Nudges</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <span className="text-xs text-slate-400 dark:text-slate-400 font-bold block flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Inquiries & Chats</span>
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">142</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">From AI Travel Companion</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <span className="text-xs text-slate-400 dark:text-slate-400 font-bold block flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Active Bookings</span>
            </span>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{bookings.length}</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">100% Direct Village Revenue</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <span className="text-xs text-slate-400 dark:text-slate-400 font-bold block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Fair Exposure Rank</span>
            </span>
            <div className="text-2xl font-black text-teal-800 dark:text-teal-300 mt-1">Top Tier (96%)</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Zero pay-to-win bias</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'listings'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            My Listings ({ownerListings.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Booking Requests ({bookings.length})
          </button>
          <button
            onClick={() => {
              setEditingBizId(null);
              setActiveTab('new-listing');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'new-listing'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {editingBizId ? 'Edit Listing' : '+ Create New Listing'}
          </button>
        </div>

        {/* Tab 1: My Listings View */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {ownerListings.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center space-y-3 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">No active listings under your account</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  You have not published any business listings yet. Click below to add your homestay, local restaurant, kayak tour, or cultural experience.
                </p>
                <button
                  onClick={() => {
                    setEditingBizId(null);
                    setActiveTab('new-listing');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Listing</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ownerListings.map((biz) => (
                  <div
                    key={biz.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors"
                  >
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                        <img
                          src={biz.imageUrl || biz.image || getCategoryFallbackImage(biz.category)}
                          alt={biz.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getCategoryFallbackImage(biz.category);
                          }}
                          className="w-full h-full object-cover"
                        />
                        {biz.hasOwnerPhoto && (
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-teal-600/90 text-white text-[9px] font-bold rounded">
                            Photo
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 px-2 py-0.5 rounded-full">
                            {biz.category}
                          </span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                            ₹{biz.startingPrice} <span className="text-[10px] text-slate-400 font-normal">/{biz.priceUnit}</span>
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-1 truncate">{biz.name}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{biz.location} ({biz.region})</p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 mt-1">{biz.description}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 dark:text-slate-400">
                        Host: <strong>{biz.ownerName || 'Verified'}</strong>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(biz)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeletingBiz(biz)}
                          className="px-2.5 py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Incoming Bookings Management */}
        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden transition-colors space-y-4 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">Incoming Tourist Reservations</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Review and update customer booking requests</p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'pending', label: 'Pending' },
                  { id: 'accepted', label: 'Accepted' },
                  { id: 'rejected', label: 'Rejected' },
                  { id: 'cancelled', label: 'Cancelled' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setBookingFilter(f.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      bookingFilter === f.id
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">No reservations received yet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  When tourists reserve your experiences or homestay from the marketplace, their requests will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3.5">Ref ID</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Enterprise & Service</th>
                      <th className="p-3.5">Date & Guests</th>
                      <th className="p-3.5">Total Amount</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {bookings
                      .filter((bk) => {
                        const status = (bk.bookingStatus || bk.status || 'pending').toLowerCase();
                        if (bookingFilter === 'pending') return status === 'pending';
                        if (bookingFilter === 'accepted') return status === 'accepted' || status === 'confirmed';
                        if (bookingFilter === 'rejected') return status === 'rejected' || status === 'declined';
                        if (bookingFilter === 'cancelled') return status === 'cancelled';
                        return true;
                      })
                      .map((bk) => {
                        const status = (bk.bookingStatus || bk.status || 'pending').toLowerCase();
                        return (
                          <tr key={bk.id || bk.bookingId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                              {bk.bookingId || bk.id}
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-slate-900 dark:text-slate-100 block">{bk.touristName || bk.customerName}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-400 block">{bk.touristPhone || bk.customerPhone || bk.touristEmail}</span>
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-slate-900 dark:text-slate-100 block">{bk.businessName}</span>
                              <span className="text-[11px] text-teal-700 dark:text-teal-400">{bk.serviceName}</span>
                            </td>
                            <td className="p-3.5">
                              <span className="block font-semibold text-slate-800 dark:text-slate-200">{bk.requestedDate || bk.date}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-400">{bk.numberOfGuests || bk.guests} Guests</span>
                            </td>
                            <td className="p-3.5 font-black text-slate-900 dark:text-slate-100">₹{bk.totalAmount.toLocaleString()}</td>
                            <td className="p-3.5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                status === 'accepted' || status === 'confirmed'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : status === 'pending'
                                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                  : status === 'rejected' || status === 'declined'
                                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}>
                                {status === 'accepted' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                {status === 'pending' && <Clock3 className="w-3 h-3 text-amber-600" />}
                                {status === 'rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                                {status === 'cancelled' && <Ban className="w-3 h-3 text-slate-500" />}
                                <span>{status}</span>
                              </span>
                            </td>
                            <td className="p-3.5 text-right space-x-1">
                              <button
                                onClick={() => setSelectedBookingDetails(bk)}
                                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                                title="View Details / Notes"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateBooking(bk.id || bk.bookingId, 'accepted')}
                                    className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-lg transition-colors cursor-pointer"
                                    title="Accept Request"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateBooking(bk.id || bk.bookingId, 'rejected')}
                                    className="p-1.5 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                                    title="Decline Request"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Create or Edit Listing Form */}
        {activeTab === 'new-listing' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6 transition-colors">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                {editingBizId ? 'Edit Business Listing' : 'Register a New Local Experience or Homestay'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Fill in the details below. Once saved, your enterprise will be indexed in the GoaSmart marketplace.
              </p>
            </div>

            <form onSubmit={handleCreateOrUpdateListing} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Business / Experience Name</label>
                  <input
                    type="text"
                    value={newBiz.name}
                    onChange={(e) => setNewBiz({ ...newBiz, name: e.target.value })}
                    required
                    placeholder="e.g. Canacona River Kayak Guides"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Host / Owner Name</label>
                  <input
                    type="text"
                    value={newBiz.ownerName}
                    onChange={(e) => setNewBiz({ ...newBiz, ownerName: e.target.value })}
                    required
                    placeholder="e.g. Anthony & Maria Fernandes"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={newBiz.category}
                    onChange={(e) => setNewBiz({ ...newBiz, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    {MARKETPLACE_CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Region</label>
                  <select
                    value={newBiz.region}
                    onChange={(e) => setNewBiz({ ...newBiz, region: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="South Goa">South Goa</option>
                    <option value="North Goa">North Goa</option>
                    <option value="Central Goa">Central Goa</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Taluka / Village</label>
                  <input
                    type="text"
                    value={newBiz.taluka}
                    onChange={(e) => setNewBiz({ ...newBiz, taluka: e.target.value })}
                    placeholder="e.g. Canacona, Tiswadi, Sanguem"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Starting Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={newBiz.startingPrice}
                    onChange={(e) => setNewBiz({ ...newBiz, startingPrice: e.target.value })}
                    required
                    placeholder="e.g. 500"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Detailed Description</label>
                <textarea
                  rows={3}
                  value={newBiz.description}
                  onChange={(e) => setNewBiz({ ...newBiz, description: e.target.value })}
                  required
                  placeholder="Describe the experience, authentic Goan heritage, farm produce, or lodging details..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Key Services / Offerings (comma separated)</label>
                <input
                  type="text"
                  value={newBiz.services}
                  onChange={(e) => setNewBiz({ ...newBiz, services: e.target.value })}
                  placeholder="e.g. Organic Dinner Included, Mangrove Life Vest Provided, Free Bicycles"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contact Number</label>
                  <input
                    type="text"
                    value={newBiz.contact}
                    onChange={(e) => setNewBiz({ ...newBiz, contact: e.target.value })}
                    placeholder="+91 98221 XXXXX"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Operating Hours</label>
                  <input
                    type="text"
                    value={newBiz.operatingHours}
                    onChange={(e) => setNewBiz({ ...newBiz, operatingHours: e.target.value })}
                    placeholder="09:00 AM - 06:00 PM"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Dedicated Business Photos Section */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Business Photos</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Upload an authentic photograph of your experience, homestay, or dishes (JPG, PNG, WEBP • Max 5 MB).
                  </p>
                </div>

                {imageError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{imageError}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Photo Preview / Placeholder */}
                  <div className="relative w-36 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Business Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer shadow-xs"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-2 text-slate-400 dark:text-slate-500">
                        <Camera className="w-6 h-6 mx-auto mb-1 opacity-60" />
                        <span className="text-[10px] block leading-tight">No photo selected</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                      >
                        <UploadCloud className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span>{imagePreview ? 'Replace Photo' : 'Upload Business Photo'}</span>
                      </button>

                      {imagePreview && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-400">
                      {selectedFile ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                        </span>
                      ) : imagePreview ? (
                        <span>Currently using saved photo. Click Replace to upload a new one.</span>
                      ) : (
                        <span>If no photo is uploaded, a verified category fallback will be applied automatically.</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('listings')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  {editingBizId ? 'Save Changes' : 'Publish Listing to Marketplace'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* Delete Listing Confirmation Modal */}
      {deletingBiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Delete Business Listing?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to delete this listing? It will no longer appear in the public marketplace.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-xs font-bold text-left">
                <div>Enterprise: {deletingBiz.name}</div>
                <div className="text-[11px] text-slate-400 font-normal mt-0.5">Category: {deletingBiz.category} • Location: {deletingBiz.location}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBiz(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteListing}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal for Business Owner */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-teal-600 dark:text-teal-400">
                  Customer Reservation Details
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  {selectedBookingDetails.bookingId || selectedBookingDetails.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBookingDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tourist Name:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {selectedBookingDetails.touristName || selectedBookingDetails.customerName}
                  </span>
                </div>
                {selectedBookingDetails.touristEmail && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{selectedBookingDetails.touristEmail}</span>
                  </div>
                )}
                {selectedBookingDetails.touristPhone && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedBookingDetails.touristPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Enterprise:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{selectedBookingDetails.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Experience / Service:</span>
                  <span className="font-bold text-teal-700 dark:text-teal-400">{selectedBookingDetails.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Scheduled Date:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {selectedBookingDetails.requestedDate || selectedBookingDetails.date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Guests:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {selectedBookingDetails.numberOfGuests || selectedBookingDetails.guests} Guests
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400">Total Booking Value:</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    ₹{selectedBookingDetails.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedBookingDetails.notes && (
                <div>
                  <span className="text-slate-400 font-bold block mb-1">Customer Notes:</span>
                  <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {selectedBookingDetails.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedBookingDetails(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
