import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Plus, Edit3, Trash2, Check, X, Users, DollarSign, Eye, MessageSquare, ShieldCheck, ArrowRight, Sparkles, LogOut, Store } from 'lucide-react';
import { getBusinesses, getBusinessesFromFirestore, addBusiness, updateBusiness, getBookings, updateBookingStatus } from '../services/businessService';
import { MARKETPLACE_CATEGORIES } from '../data/businesses';
import { useAuth } from '../context/AuthContext';

export default function BusinessOwnerDashboard({ onBackToMarketplace }) {
  const { currentUser, userProfile, logout } = useAuth();
  const [businesses, setBusinesses] = useState(() => getBusinesses());
  const [bookings, setBookings] = useState(() => getBookings());
  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'bookings', 'new-listing'

  // Owner's listings: strictly filter by the authenticated user UID
  const ownerListings = useMemo(() => {
    if (!currentUser?.uid) return [];
    return businesses.filter((b) => b.ownerUid === currentUser.uid);
  }, [businesses, currentUser?.uid]);

  const handleLogout = async () => {
    await logout();
    if (onBackToMarketplace) onBackToMarketplace();
  };

  // Load from Firestore
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
    return () => { isMounted = false; };
  }, []);

  // New Listing Form State
  const [newBiz, setNewBiz] = useState({
    name: '',
    ownerName: '',
    category: MARKETPLACE_CATEGORIES[1],
    region: 'South Goa',
    taluka: 'Canacona',
    location: '',
    startingPrice: 500,
    priceUnit: 'per person',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    description: '',
    services: 'Organic Home Dining, Guided Heritage Walk',
    contact: '+91 98765 00000',
    operatingHours: '10:00 AM - 06:00 PM'
  });

  const [editingBizId, setEditingBizId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleCreateOrUpdateListing = async (e) => {
    e.preventDefault();

    const servicesArray = typeof newBiz.services === 'string'
      ? newBiz.services.split(',').map((s) => s.trim()).filter(Boolean)
      : newBiz.services;

    const ownerUid = currentUser?.uid || 'verified-owner-uid';

    if (editingBizId) {
      await updateBusiness(editingBizId, {
        ...newBiz,
        services: servicesArray,
        startingPrice: Number(newBiz.startingPrice)
      }, ownerUid);
      setSuccessMessage('Listing updated successfully!');
    } else {
      await addBusiness({
        ...newBiz,
        services: servicesArray,
        startingPrice: Number(newBiz.startingPrice)
      }, ownerUid);
      setSuccessMessage('New local business published to the marketplace!');
    }

    const refreshed = await getBusinessesFromFirestore();
    setBusinesses(refreshed);
    setEditingBizId(null);
    setActiveTab('listings');

    setTimeout(() => setSuccessMessage(''), 3500);
  };

  const handleStartEdit = (biz) => {
    setEditingBizId(biz.id);
    setNewBiz({
      name: biz.name,
      ownerName: biz.ownerName || '',
      category: biz.category,
      region: biz.region,
      taluka: biz.taluka,
      location: biz.location,
      startingPrice: biz.startingPrice,
      priceUnit: biz.priceUnit || 'per person',
      image: biz.image,
      description: biz.description,
      services: biz.services ? biz.services.join(', ') : '',
      contact: biz.contact,
      operatingHours: biz.operatingHours
    });
    setActiveTab('new-listing');
  };

  const handleUpdateBooking = (id, newStatus) => {
    const updated = updateBookingStatus(id, newStatus);
    setBookings(updated);
  };

  return (
    <div className="py-8 sm:py-12 bg-slate-50 min-h-[calc(100vh-80px)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>GoaSmart Business Partner Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Local Enterprise Management Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your experience listings, incoming tourist bookings, and view fair algorithmic visibility metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold text-slate-700 truncate max-w-[140px]">
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
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Marketplace</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title="Sign Out of Business Partner Account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Business Performance KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs text-slate-400 font-bold block flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-600" />
              <span>Total Listing Views</span>
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">1,840</div>
            <span className="text-[10px] text-emerald-600 font-bold">+28% this week via AI Nudges</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs text-slate-400 font-bold block flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
              <span>Inquiries & Chats</span>
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">142</div>
            <span className="text-[10px] text-slate-500 font-medium">From AI Travel Companion</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs text-slate-400 font-bold block flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Active Bookings</span>
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{bookings.length}</div>
            <span className="text-[10px] text-emerald-600 font-bold">100% Direct Village Revenue</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs text-slate-400 font-bold block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Fair Exposure Rank</span>
            </span>
            <div className="text-2xl font-black text-teal-800 mt-1">Top Tier (96%)</div>
            <span className="text-[10px] text-slate-500 font-medium">Zero pay-to-win bias</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'listings'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            My Listings ({ownerListings.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {editingBizId ? 'Edit Listing' : '+ Create New Listing'}
          </button>
        </div>

        {/* Tab 1: My Listings View */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {ownerListings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-base">No active listings under your account</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
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
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between"
                  >
                    <div className="flex gap-4">
                      <img
                        src={biz.image}
                        alt={biz.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full">
                            {biz.category}
                          </span>
                          <span className="text-xs font-black text-slate-800">
                            ₹{biz.startingPrice} <span className="text-[10px] text-slate-400 font-normal">/{biz.priceUnit}</span>
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm mt-1 truncate">{biz.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{biz.location} ({biz.region})</p>
                        <p className="text-[11px] text-slate-600 line-clamp-1 mt-1">{biz.description}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        Rating: <strong>{biz.rating} ★</strong> ({biz.reviewsCount} reviews)
                      </span>
                      <button
                        onClick={() => handleStartEdit(biz)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Details</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Incoming Bookings Management */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Incoming Tourist Reservations</h3>
                <p className="text-xs text-slate-500">Review and update customer booking requests</p>
              </div>
              <span className="text-xs font-bold bg-teal-50 text-teal-800 px-3 py-1 rounded-full border border-teal-200">
                {bookings.filter((b) => b.status === 'Confirmed').length} Confirmed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-4">Ref ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Experience / Service</th>
                    <th className="p-4">Date & Guests</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((bk) => (
                    <tr key={bk.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">{bk.id}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{bk.customerName}</span>
                        <span className="text-[10px] text-slate-400">{bk.requestTime}</span>
                      </td>
                      <td className="p-4 font-semibold text-slate-800">{bk.serviceName}</td>
                      <td className="p-4">
                        <span className="block font-semibold">{bk.date}</span>
                        <span className="text-[10px] text-slate-400">{bk.guests} Guests</span>
                      </td>
                      <td className="p-4 font-black text-slate-900">₹{bk.totalAmount.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          bk.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          bk.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {bk.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        {bk.status !== 'Confirmed' && (
                          <button
                            onClick={() => handleUpdateBooking(bk.id, 'Confirmed')}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                            title="Confirm"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {bk.status !== 'Declined' && (
                          <button
                            onClick={() => handleUpdateBooking(bk.id, 'Declined')}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Decline"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Create or Edit Listing Form */}
        {activeTab === 'new-listing' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {editingBizId ? 'Edit Business Listing' : 'Register a New Local Experience or Homestay'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fill in the details below. Once saved, your enterprise will be indexed in the GoaSmart marketplace.
              </p>
            </div>

            <form onSubmit={handleCreateOrUpdateListing} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Business / Experience Name</label>
                  <input
                    type="text"
                    value={newBiz.name}
                    onChange={(e) => setNewBiz({ ...newBiz, name: e.target.value })}
                    required
                    placeholder="e.g. Canacona River Kayak Guides"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Host / Owner Name</label>
                  <input
                    type="text"
                    value={newBiz.ownerName}
                    onChange={(e) => setNewBiz({ ...newBiz, ownerName: e.target.value })}
                    required
                    placeholder="e.g. Anthony & Maria Fernandes"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={newBiz.category}
                    onChange={(e) => setNewBiz({ ...newBiz, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    {MARKETPLACE_CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Region</label>
                  <select
                    value={newBiz.region}
                    onChange={(e) => setNewBiz({ ...newBiz, region: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="South Goa">South Goa</option>
                    <option value="North Goa">North Goa</option>
                    <option value="Central Goa">Central Goa</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Taluka / Village</label>
                  <input
                    type="text"
                    value={newBiz.taluka}
                    onChange={(e) => setNewBiz({ ...newBiz, taluka: e.target.value })}
                    placeholder="e.g. Canacona, Tiswadi, Sanguem"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Starting Price (₹)</label>
                  <input
                    type="number"
                    value={newBiz.startingPrice}
                    onChange={(e) => setNewBiz({ ...newBiz, startingPrice: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>

              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Detailed Description</label>
                <textarea
                  rows={3}
                  value={newBiz.description}
                  onChange={(e) => setNewBiz({ ...newBiz, description: e.target.value })}
                  required
                  placeholder="Describe the experience, authentic Goan heritage, farm produce, or lodging details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Key Services / Offerings (comma separated)</label>
                <input
                  type="text"
                  value={newBiz.services}
                  onChange={(e) => setNewBiz({ ...newBiz, services: e.target.value })}
                  placeholder="e.g. Organic Dinner Included, Mangrove Life Vest Provided, Free Bicycles"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Contact Number</label>
                  <input
                    type="text"
                    value={newBiz.contact}
                    onChange={(e) => setNewBiz({ ...newBiz, contact: e.target.value })}
                    placeholder="+91 98221 XXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Operating Hours</label>
                  <input
                    type="text"
                    value={newBiz.operatingHours}
                    onChange={(e) => setNewBiz({ ...newBiz, operatingHours: e.target.value })}
                    placeholder="09:00 AM - 06:00 PM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('listings')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
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
    </div>
  );
}
