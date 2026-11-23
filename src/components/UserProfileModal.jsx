import React, { useState } from 'react';
import { X, User, Mail, ShieldCheck, Calendar, LogOut, Check, Edit2, Building2, Compass, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UserProfileModal({ isOpen, onClose, onLogoutSuccess }) {
  const { currentUser, userProfile, updateUserName, logout, refreshAuthorityToken, hasAuthorityClaim } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(userProfile?.name || currentUser?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [refreshingToken, setRefreshingToken] = useState(false);
  const [msg, setMsg] = useState('');

  if (!isOpen || !currentUser) return null;

  const roleLabels = {
    tourist: { label: 'Conscious Tourist', bg: 'bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800', icon: Compass },
    business_owner: { label: 'Local Business Partner', bg: 'bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800', icon: Building2 },
    authority: { label: 'Tourism Authority Officer', bg: 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800', icon: ShieldCheck }
  };

  const currentRoleInfo = roleLabels[userProfile?.role] || roleLabels.tourist;
  const RoleIcon = currentRoleInfo.icon;

  const handleRefreshClaims = async () => {
    setRefreshingToken(true);
    try {
      const isClaimed = await refreshAuthorityToken();
      if (isClaimed) {
        setMsg('Verified Authority Custom Claim loaded successfully.');
      } else {
        setMsg('Token refreshed: Standard user privileges confirmed.');
      }
      setTimeout(() => setMsg(''), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshingToken(false);
    }
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await updateUserName(newName.trim());
      setIsEditing(false);
      setMsg('Profile name updated successfully.');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    if (onLogoutSuccess) onLogoutSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col my-auto transition-colors">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-md">
              {(userProfile?.name || currentUser.displayName || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">{userProfile?.name || currentUser.displayName || 'Traveler'}</h3>
              <p className="text-xs text-slate-300">{currentUser.email}</p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          
          {msg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{msg}</span>
            </div>
          )}

          {/* Account Role Badge */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
              Assigned Security Role
            </span>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${currentRoleInfo.bg}`}>
                <RoleIcon className="w-3.5 h-3.5" />
                <span>{currentRoleInfo.label}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">UID: {currentUser.uid.slice(0, 8)}...</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 flex items-center justify-between">
              <span>*Roles are enforced server-side via Firebase Custom Claims & security rules.</span>
              <button
                type="button"
                onClick={handleRefreshClaims}
                disabled={refreshingToken}
                className="text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 font-bold inline-flex items-center gap-1 cursor-pointer ml-2 not-italic"
                title="Force refresh token claims from Firebase Auth"
              >
                <RefreshCw className={`w-3 h-3 ${refreshingToken ? 'animate-spin' : ''}`} />
                <span>{refreshingToken ? 'Refreshing...' : 'Sync Claims'}</span>
              </button>
            </p>
          </div>

          {/* User Details Form */}
          <div className="space-y-3.5 text-xs">
            
            {/* Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-600 dark:text-slate-300">Full Name</span>
                {!isEditing && (
                  <button
                    onClick={() => {
                      setNewName(userProfile?.name || currentUser.displayName || '');
                      setIsEditing(true);
                    }}
                    className="text-cyan-700 dark:text-cyan-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveName} className="flex gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-3 py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200">
                  {userProfile?.name || currentUser.displayName || 'Not provided'}
                </div>
              )}
            </div>

            {/* Email (Readonly) */}
            <div>
              <span className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Registered Email</span>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-mono">
                {currentUser.email}
              </div>
            </div>

            {/* Created At */}
            <div>
              <span className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Member Since</span>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {currentUser.metadata?.creationTime
                    ? new Date(currentUser.metadata.creationTime).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Active Member'}
                </span>
              </div>
            </div>

          </div>

          {/* Logout Button */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
