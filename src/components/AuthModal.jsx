import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, ShieldCheck, Building2, Compass, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login', // 'login', 'register', 'forgot'
  onAuthSuccess
}) {
  const { login, register, resetPassword } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login', 'register', 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('tourist'); // 'tourist', 'business_owner'

  if (!isOpen) return null;

  const resetFormState = () => {
    setError('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
  };

  const switchMode = (newMode) => {
    resetFormState();
    setMode(newMode);
  };

  const parseFirebaseError = (err) => {
    const code = err.code || '';
    if (code === 'auth/email-already-in-use') {
      return 'An account with this email address already exists. Please log in.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    }
    if (code === 'auth/weak-password') {
      return 'Password should be at least 6 characters long.';
    }
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return 'Invalid email or password. Please verify your credentials.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many unsuccessful attempts. Access temporarily disabled. Please reset password or try again later.';
    }
    return err.message || 'Authentication error occurred. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Form Validations
    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      try {
        await resetPassword(email.trim());
        setSuccessMsg('Password reset instructions have been sent to your email.');
      } catch (err) {
        setError(parseFirebaseError(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }

      setLoading(true);
      try {
        const { profile } = await register(name.trim(), email.trim(), password, role);
        setSuccessMsg('Account registered successfully!');
        if (onAuthSuccess) onAuthSuccess(profile.role);
        onClose();
      } catch (err) {
        setError(parseFirebaseError(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'login') {
      setLoading(true);
      try {
        const { profile } = await login(email.trim(), password);
        if (onAuthSuccess) onAuthSuccess(profile.role);
        onClose();
      } catch (err) {
        setError(parseFirebaseError(err));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col my-auto">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-500 flex items-center justify-center text-white font-black shadow-md">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <span className="text-xl font-black tracking-tight">GoaSmart Auth</span>
          </div>

          <h3 className="text-lg font-bold">
            {mode === 'login' && 'Sign in to your account'}
            {mode === 'register' && 'Create your GoaSmart account'}
            {mode === 'forgot' && 'Reset your password'}
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            {mode === 'login' && 'Access personalized itineraries, saved destinations & local bookings.'}
            {mode === 'register' && 'Join GoaSmart as a conscious traveler or local business host.'}
            {mode === 'forgot' && 'Enter your email to receive a password recovery link.'}
          </p>
        </div>

        {/* Tab Switcher (Login vs Register) */}
        {mode !== 'forgot' && (
          <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-bold">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-cyan-800 border-b-2 border-cyan-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-teal-800 border-b-2 border-teal-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-4">
          
          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Register: Full Name */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Password Field (for Login & Register) */}
            {mode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[11px] text-cyan-700 hover:underline font-semibold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Register: Confirm Password */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Register: Role Selection Radio Cards */}
            {mode === 'register' && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-700">Select Account Role</label>
                <div className="grid grid-cols-2 gap-2.5">
                  
                  {/* Tourist */}
                  <label
                    className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                      role === 'tourist'
                        ? 'bg-cyan-50 border-cyan-400 ring-2 ring-cyan-400/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Tourist</span>
                      </span>
                      <input
                        type="radio"
                        name="accountRole"
                        value="tourist"
                        checked={role === 'tourist'}
                        onChange={() => setRole('tourist')}
                        className="text-cyan-600 focus:ring-cyan-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 leading-snug">
                      Explore places, plan itineraries & book local stays
                    </span>
                  </label>

                  {/* Local Business Owner */}
                  <label
                    className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                      role === 'business_owner'
                        ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-400/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Business</span>
                      </span>
                      <input
                        type="radio"
                        name="accountRole"
                        value="business_owner"
                        checked={role === 'business_owner'}
                        onChange={() => setRole('business_owner')}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 leading-snug">
                      List homestays, food & tours; manage bookings
                    </span>
                  </label>

                </div>
                <p className="text-[10px] text-slate-400 italic">
                  *Tourism Authority roles are provisioned exclusively by government administrators.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-600 hover:to-emerald-500 shadow-teal-700/20'
                  : 'bg-gradient-to-r from-cyan-700 to-teal-700 hover:from-cyan-600 hover:to-teal-600 shadow-cyan-700/20'
              }`}
            >
              {loading ? (
                <span>Processing with Firebase...</span>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'register' && 'Register Account'}
                    {mode === 'forgot' && 'Send Password Reset Email'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Footer Back/Switch Links */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            {mode === 'forgot' ? (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-cyan-700 hover:underline font-bold cursor-pointer"
              >
                ← Back to Sign In
              </button>
            ) : mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-teal-700 hover:underline font-bold cursor-pointer"
                >
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-cyan-700 hover:underline font-bold cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
