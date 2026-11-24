import React, { useState, useEffect, useMemo } from 'react';
import { Store, Search, Filter, MapPin, Star, Heart, ArrowUpRight, DollarSign, Calendar, Users, ShieldCheck, CheckCircle2, Clock, Phone, Sparkles, X, ChevronRight, Camera, AlertCircle, Clock3 } from 'lucide-react';
import { getBusinesses, getBusinessesFromFirestore } from '../services/businessService';
import { createBooking } from '../services/bookingService';
import { MARKETPLACE_CATEGORIES } from '../data/businesses';
import { getCategoryFallbackImage } from '../services/storageService';
import { useAuth } from '../context/AuthContext';

export default function LocalBusinessMarketplace({
  onSelectBusinessOwnerPortal,
  onOpenAuthModal,
  onNavigateToMyBookings,
  t
}) {
  const { currentUser, userProfile, isAuthenticated } = useAuth();
  const [businesses, setBusinesses] = useState(() => getBusinesses());
  const [loadingListings, setLoadingListings] = useState(false);

  // Sync with Firestore business listings
  useEffect(() => {
    let isMounted = true;
    async function loadLiveBusinesses() {
      setLoadingListings(true);
      try {
        const liveListings = await getBusinessesFromFirestore();
        if (isMounted && liveListings && liveListings.length > 0) {
          setBusinesses(liveListings);
        }
      } catch (e) {
        console.warn('Using local business listings cache:', e);
      } finally {
        if (isMounted) setLoadingListings(false);
      }
    }
    loadLiveBusinesses();
    return () => { isMounted = false; };
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [activeRegion, setActiveRegion] = useState('All');
  const [priceRange, setPriceRange] = useState('all'); // 'all', 'under500', '500-1500', 'above1500'

  // Booking Modal State
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [bookingGuests, setBookingGuests] = useState(2);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Auto-populate tourist details if signed in
  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(userProfile?.name || currentUser.displayName || '');
      if (!customerEmail) setCustomerEmail(currentUser.email || '');
    }
  }, [currentUser, userProfile]);

  // Filter businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      // Region
      if (activeRegion !== 'All' && b.region !== activeRegion) return false;

      // Category
      if (activeCategory !== 'All Categories' && b.category !== activeCategory) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = b.name.toLowerCase().includes(q);
        const matchDesc = b.description.toLowerCase().includes(q);
        const matchLoc = b.location.toLowerCase().includes(q);
        const matchTaluka = b.taluka.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchLoc && !matchTaluka) return false;
      }

      // Price Range
      if (priceRange === 'under500' && b.startingPrice >= 500) return false;
      if (priceRange === '500-1500' && (b.startingPrice < 500 || b.startingPrice > 1500)) return false;
      if (priceRange === 'above1500' && b.startingPrice <= 1500) return false;

      return true;
    });
  }, [businesses, searchQuery, activeCategory, activeRegion, priceRange]);

  const handleOpenBookingModal = (business) => {
    setSelectedBusiness(business);
    setSelectedExperience(business.experiences ? business.experiences[0] : null);
    setConfirmedBooking(null);
    setBookingError('');
    if (currentUser) {
      setCustomerName(userProfile?.name || currentUser.displayName || '');
      setCustomerEmail(currentUser.email || '');
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!selectedBusiness || !selectedExperience) return;
    setBookingError('');

    // Ensure tourist is authenticated
    if (!currentUser?.uid) {
      setBookingError('Please sign in as a Tourist to complete your booking.');
      if (onOpenAuthModal) onOpenAuthModal('login');
      return;
    }

    setBookingSubmitting(true);
    try {
      const totalAmount = (selectedExperience.price || 0) * bookingGuests;
      const newBooking = await createBooking({
        businessId: selectedBusiness.id,
        businessName: selectedBusiness.name,
        businessLocation: selectedBusiness.location || selectedBusiness.address,
        businessImage: selectedBusiness.imageUrl || selectedBusiness.image,
        ownerUid: selectedBusiness.ownerUid,
        ownerName: selectedBusiness.ownerName,
        touristUid: currentUser.uid,
        touristName: customerName.trim() || userProfile?.name || currentUser.displayName || 'Tourist Guest',
        touristEmail: customerEmail.trim() || currentUser.email || '',
        touristPhone: customerPhone.trim(),
        serviceName: selectedExperience.name,
        requestedDate: bookingDate,
        numberOfGuests: bookingGuests,
        notes: bookingNotes.trim(),
        totalAmount,
        bookingStatus: 'pending'
      }, currentUser);

      setConfirmedBooking(newBooking);
    } catch (err) {
      setBookingError(err.message || 'Failed to submit booking request.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-80px)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Marketplace Header Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-cyan-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-teal-800/40 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold mb-3 border border-teal-400/30">
              <Store className="w-4 h-4" />
              <span>Goa Local Enterprise Marketplace</span>
            </div>
            <h2 className="text-2xl sm:4xl font-black tracking-tight">
              Authentic Goan Experiences, Homestays & Flavours
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Support traditional Goan families, artisans, and river kayak guides. GoaSmart guarantees fair discoverability for local village enterprises away from commercial tourist strips.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs text-teal-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Fair Recommendation Guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-teal-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Corporate Advertising Monopolies</span>
              </div>
              <button
                onClick={onSelectBusinessOwnerPortal}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
              >
                <span>Are you a business owner? Go to Portal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4 transition-colors">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search homestays, seafood, kayak tours, workshops..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-hidden transition-all"
              />
            </div>

            {/* Region Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold self-start md:self-auto">
              {['All', 'North Goa', 'South Goa', 'Central Goa'].map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRegion(r)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeRegion === r ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Price Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-bold">Price:</span>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Any Price</option>
                <option value="under500">Under ₹500</option>
                <option value="500-1500">₹500 - ₹1,500</option>
                <option value="above1500">₹1,500+</option>
              </select>
            </div>

          </div>

          {/* Category Chips Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 dark:border-slate-800">
            {MARKETPLACE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Listings Counter */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
          <span>Showing {filteredBusinesses.length} local Goan businesses</span>
          {(activeCategory !== 'All Categories' || activeRegion !== 'All' || priceRange !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setActiveCategory('All Categories');
                setActiveRegion('All');
                setPriceRange('all');
                setSearchQuery('');
              }}
              className="text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Business Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((biz) => (
            <div
              key={biz.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              {/* Image & Tags */}
              <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={biz.imageUrl || biz.image || getCategoryFallbackImage(biz.category)}
                  alt={biz.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getCategoryFallbackImage(biz.category);
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

                {/* Category Pill */}
                <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-100 text-[11px] font-bold rounded-full shadow-xs">
                  {biz.category}
                </span>

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  {biz.hasOwnerPhoto && (
                    <span className="px-2 py-0.5 bg-teal-600/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-xs" title="Verified Host Photograph">
                      <Camera className="w-3 h-3" />
                      <span>Host Photo</span>
                    </span>
                  )}
                  {biz.isFairVisibilityFeatured && (
                    <span className="px-2 py-0.5 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      <span>Village Pick</span>
                    </span>
                  )}
                </div>

                {/* Location & Rating */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <span className="flex items-center gap-1 font-semibold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{biz.region} ({biz.taluka})</span>
                  </span>

                  <span className="flex items-center gap-1 font-bold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{biz.rating}</span>
                    <span className="text-slate-300 font-normal">({biz.reviewsCount})</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4
                    onClick={() => handleOpenBookingModal(biz)}
                    className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors text-base cursor-pointer mb-1 leading-snug"
                  >
                    {biz.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
                    Host: <strong className="text-slate-700 dark:text-slate-300">{biz.ownerName}</strong> • {biz.location}
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                    {biz.description}
                  </p>

                  {/* Highlights/Services */}
                  <div className="space-y-1 mb-4">
                    {biz.services?.slice(0, 2).map((srv, i) => (
                      <div key={i} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="truncate">{srv}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price & Book Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-semibold">Starting from</span>
                    <span className="text-base font-black text-slate-900 dark:text-slate-100">
                      ₹{biz.startingPrice.toLocaleString()}
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">/{biz.priceUnit}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenBookingModal(biz)}
                    className="py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>View & Book</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fair Visibility Story Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center gap-2.5 text-teal-800 dark:text-teal-300">
            <ShieldCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
              How GoaSmart Ensures Fair Visibility for Local Businesses
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Conventional travel aggregators heavily prioritize major hotel chains and commercial tour operators with huge advertising budgets. GoaSmart levels the playing field: our algorithm weights cultural authenticity, low ecological footprint, and geographic dispersion. Family homestays in Divar Island, clay potters in Bicholim, and canoe fishermen in Chorao receive equal prominence, channeling tourism revenue directly into Goan village households.
          </p>
        </div>

      </div>

      {/* Business Detail & Booking Modal */}
      {selectedBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setSelectedBusiness(null)} />

          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 max-h-[92vh] flex flex-col my-auto transition-colors">
            
            {/* Header Image */}
            <div className="relative h-48 sm:h-56 w-full bg-slate-900 shrink-0">
              <img
                src={selectedBusiness.imageUrl || selectedBusiness.image || getCategoryFallbackImage(selectedBusiness.category)}
                alt={selectedBusiness.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getCategoryFallbackImage(selectedBusiness.category);
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <button
                onClick={() => setSelectedBusiness(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-md transition-all cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/80 backdrop-blur-md">
                  {selectedBusiness.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-1">{selectedBusiness.name}</h3>
                <p className="text-xs text-slate-300">
                  {selectedBusiness.location} • Host: {selectedBusiness.ownerName}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
              
              {confirmedBooking ? (
                /* Booking Confirmation State */
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-emerald-950 dark:text-emerald-200">
                      Booking Request Submitted!
                    </h4>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-md mx-auto mt-1">
                      Your reservation request has been delivered to <strong>{selectedBusiness.ownerName || 'the host'}</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 text-left text-xs space-y-2 max-w-sm mx-auto shadow-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Booking Reference:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {confirmedBooking.bookingId || confirmedBooking.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Enterprise:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{selectedBusiness.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Service:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{confirmedBooking.serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Visit Date:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {confirmedBooking.requestedDate || confirmedBooking.date}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Guests:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{confirmedBooking.numberOfGuests || confirmedBooking.guests}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Initial Status:</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Clock3 className="w-3 h-3 text-amber-600" />
                        <span>Pending Host Confirmation</span>
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Estimated Cost:</span>
                      <span className="font-black text-emerald-700 dark:text-emerald-400">₹{confirmedBooking.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    This reservation has been recorded in your <strong>My Bookings</strong> section and forwarded directly to the business owner.
                  </p>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    {onNavigateToMyBookings && (
                      <button
                        onClick={() => {
                          setSelectedBusiness(null);
                          onNavigateToMyBookings();
                        }}
                        className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>View in My Bookings</span>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedBusiness(null)}
                      className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Done & Return
                    </button>
                  </div>
                </div>
              ) : (
                /* Booking Form State */
                <>
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      About This Enterprise
                    </h5>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {selectedBusiness.description}
                    </p>
                  </div>

                  {/* Contact & Hours */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <div>
                        <span className="text-slate-400 block text-[10px]">Operating Hours</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedBusiness.operatingHours}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <div>
                        <span className="text-slate-400 block text-[10px]">Contact Host</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedBusiness.contact}</span>
                      </div>
                    </div>
                  </div>

                  {bookingError && (
                    <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  {/* Booking Form */}
                  <form onSubmit={handleSubmitBooking} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                      <span>Reserve Your Experience</span>
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-900/60">
                        Direct Reservation
                      </span>
                    </h5>

                    {/* Experience Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Choose Service</label>
                      <div className="space-y-2">
                        {selectedBusiness.experiences?.map((exp, idx) => (
                          <label
                            key={idx}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              selectedExperience?.name === exp.name
                                ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-400 dark:border-teal-500 ring-2 ring-teal-400/20'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="selectedExp"
                                checked={selectedExperience?.name === exp.name}
                                onChange={() => setSelectedExperience(exp)}
                                className="text-teal-600 focus:ring-teal-500"
                              />
                              <div>
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{exp.name}</span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">{exp.duration} • {exp.per}</span>
                              </div>
                            </div>
                            <span className="text-xs font-black text-teal-800 dark:text-teal-300">₹{exp.price}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Preferred Date</label>
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          required
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-2.5 font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Guests</label>
                        <select
                          value={bookingGuests}
                          onChange={(e) => setBookingGuests(Number(e.target.value))}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-2.5 font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
                        >
                          {[1, 2, 3, 4, 6, 8, 10].map((n) => (
                            <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Your Full Name"
                        required
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-2.5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Your Email"
                        required
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-2.5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Phone Number"
                        required
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-2.5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Special Notes or Dietary Preferences (Optional)</label>
                      <input
                        type="text"
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        placeholder="e.g. Vegetarian diet, arriving by ferry, need airport taxi advice..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-2.5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </div>

                    {/* Total & Submit */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Total Estimated Cost</span>
                        <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                          ₹{((selectedExperience?.price || 0) * bookingGuests).toLocaleString()}
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={bookingSubmitting}
                        className="py-3 px-6 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        {bookingSubmitting ? (
                          <>
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <span>Submit Booking Request</span>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
