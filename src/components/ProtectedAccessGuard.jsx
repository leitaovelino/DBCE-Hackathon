import React from 'react';
import { ShieldAlert, Lock, ArrowRight, Compass, LogIn, AlertTriangle, Building2, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedAccessGuard({
  requiredRole, // 'business_owner' | 'authority'
  onOpenAuth,
  onBackToExplore
}) {
  const { user, userProfile, isAuthenticated, logout } = useAuth();

  const getRoleDetails = (role) => {
    switch (role) {
      case 'business_owner':
        return {
          title: 'Local Business Portal',
          requiredRoleLabel: 'Registered Business Owner',
          icon: <Building2 className="w-8 h-8 text-teal-600 dark:text-teal-400" />,
          bgColor: 'bg-teal-50 dark:bg-teal-950/30',
          borderColor: 'border-teal-200 dark:border-teal-900/50',
          badgeColor: 'bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
          description: 'This area is reserved for verified Goan homestays, tour guides, cafes, handicraft vendors, and heritage experience operators.'
        };
      case 'authority':
        return {
          title: 'Goa Tourism Authority Command Center',
          requiredRoleLabel: 'Verified Tourism Authority Official',
          icon: <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
          bgColor: 'bg-blue-50 dark:bg-blue-950/30',
          borderColor: 'border-blue-200 dark:border-blue-900/50',
          badgeColor: 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          description: 'This area is strictly restricted to authorized Goa Tourism Department officials and Department of Tourism telemetry administrators.'
        };
      default:
        return {
          title: 'Protected Area',
          requiredRoleLabel: 'Authorized User',
          icon: <Lock className="w-8 h-8 text-slate-600 dark:text-slate-400" />,
          bgColor: 'bg-slate-50 dark:bg-slate-800/60',
          borderColor: 'border-slate-200 dark:border-slate-700',
          badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
          description: 'You need higher authorization permissions to access this feature.'
        };
    }
  };

  const details = getRoleDetails(requiredRole);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50/50 dark:bg-slate-950/50 transition-colors">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-center p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-200 transition-colors">
        
        {/* Header Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-8 ring-slate-50 dark:ring-slate-800 bg-slate-100 dark:bg-slate-800">
          {!isAuthenticated ? (
            <Lock className="w-8 h-8 text-slate-700 dark:text-slate-300" />
          ) : (
            <ShieldAlert className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          )}
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider border bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Access Restricted &bull; RBAC Level Protected</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-3">
          {!isAuthenticated ? 'Sign In Required' : 'Insufficient Permissions'}
        </h2>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
          {!isAuthenticated ? (
            <>
              You must sign in with a verified account to view the{' '}
              <strong className="text-slate-900 dark:text-white">{details.title}</strong>.
            </>
          ) : (
            <>
              Your account is logged in as{' '}
              <span className="font-bold text-slate-900 dark:text-white uppercase">
                {userProfile?.role || 'Tourist'}
              </span>
              , which does not have permission to view the{' '}
              <strong className="text-slate-900 dark:text-white">{details.title}</strong>.
            </>
          )}
        </p>

        {/* Role Requirement Box */}
        <div className={`p-4 rounded-xl border text-left mb-6 ${details.bgColor} ${details.borderColor}`}>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-xs shrink-0">
              {details.icon}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Required Role
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {details.requiredRoleLabel}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {details.description}
              </p>
            </div>
          </div>
        </div>

        {/* Current Auth Status Info */}
        {isAuthenticated && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 mb-6 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-800 dark:text-slate-100">{user?.displayName || 'User'}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{user?.email}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {!isAuthenticated ? (
            <button
              onClick={() => onOpenAuth && onOpenAuth('login')}
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Continue</span>
            </button>
          ) : (
            <button
              onClick={() => {
                logout();
                if (onOpenAuth) onOpenAuth('login');
              }}
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Switch to Required Account</span>
            </button>
          )}

          <button
            onClick={onBackToExplore}
            className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Compass className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Back to Explorer</span>
          </button>
        </div>

      </div>
    </div>
  );
}
