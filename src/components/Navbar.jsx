import React, { useState } from 'react';
import { Compass, Heart, Globe, Menu, X, MapPin, Sparkles, Building2, ShieldCheck, Map, Star, Bot, Users, Calendar, Store, User, LogIn, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({
  currentLang,
  setLang,
  t,
  savedCount,
  onOpenFavorites,
  activeView,
  setActiveView,
  onOpenAuthModal,
  onOpenProfileModal
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, userProfile, isAuthenticated, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिन्दी (Hindi)', short: 'HI' },
    { code: 'kok', label: 'कोंकणी (Konkani)', short: 'KOK' }
  ];

  const handleNavClick = (view) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    setActiveView('tourist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('tourist')} 
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-cyan-600/20 group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-cyan-700 via-teal-700 to-emerald-700 dark:from-cyan-400 dark:via-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  GoaSmart
                </span>
                <span className="text-[10px] px-2 py-0.5 font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Intelligent Tourism & Crowd Balancer
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            
            {/* Explore / Home */}
            <button
              onClick={() => handleNavClick('tourist')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeView === 'tourist' 
                  ? 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              {t.nav.explore}
            </button>

            {/* Crowd Radar */}
            <button
              onClick={() => handleNavClick('crowd')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                activeView === 'crowd' 
                  ? 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>{t.nav.crowd}</span>
            </button>

            {/* Smart Itinerary */}
            <button
              onClick={() => handleNavClick('itinerary')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                activeView === 'itinerary' 
                  ? 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{t.nav.itinerary}</span>
            </button>

            {/* Interactive Map */}
            <button
              onClick={() => handleNavClick('map')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                activeView === 'map' 
                  ? 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              <Map className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>{t.nav.map}</span>
            </button>

            {/* Recommendations */}
            <button
              onClick={() => handleNavClick('recommendations')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                activeView === 'recommendations' 
                  ? 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.nav.recommendations}</span>
            </button>

            {/* Local Marketplace (Phase 4) */}
            <button
              onClick={() => handleNavClick('marketplace')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                activeView === 'marketplace' 
                  ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{t.nav.marketplace}</span>
            </button>

            {/* AI Tourism Chatbot */}
            <button
              onClick={() => handleNavClick('companion')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                activeView === 'companion'
                  ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{t.nav.companion}</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1 py-0.2 rounded font-extrabold">
                AI
              </span>
            </button>

            {/* Local Business Owner Dashboard */}
            <button
              onClick={() => handleNavClick('business')}
              className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                activeView === 'business'
                  ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{t.nav.business}</span>
            </button>

            {/* Tourism Authority */}
            <button
              onClick={() => handleNavClick('authority')}
              className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                activeView === 'authority'
                  ? 'bg-blue-900 text-blue-200 border border-blue-700'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t.nav.authority}</span>
            </button>
          </nav>

          {/* Right Action Icons: Theme Toggle, Language, Favorites, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Global Light / Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-transparent dark:border-slate-800"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400 animate-in spin-in-180 duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600 animate-in spin-in-180 duration-300" />
              )}
            </button>
            
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="uppercase">{currentLang}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Select Language
                  </div>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                        currentLang === l.code ? 'text-teal-700 dark:text-teal-400 font-bold bg-teal-50/60 dark:bg-teal-950/60' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{l.label}</span>
                      {currentLang === l.code && <span className="text-teal-600 dark:text-teal-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Places / Favorites Drawer Button */}
            <button
              onClick={onOpenFavorites}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Saved Places"
            >
              <Heart className={`w-5 h-5 ${savedCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Authentication Buttons / Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer group"
                  title="User Account Menu"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {(userProfile?.name || user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-teal-700 dark:group-hover:text-teal-300 truncate max-w-[100px]">
                      {userProfile?.name || user?.displayName || 'My Account'}
                    </div>
                    <div className="text-[9px] uppercase font-extrabold tracking-wider text-teal-600 dark:text-teal-400">
                      {userProfile?.role === 'authority' ? 'Gov Official' : userProfile?.role === 'business_owner' ? 'Business Host' : 'Tourist'}
                    </div>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in duration-150 space-y-2.5">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {userProfile?.name || user?.displayName || 'User'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
                        {user?.email}
                      </div>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800">
                        <span>Role:</span>
                        <span>{userProfile?.role === 'authority' ? 'Tourism Authority' : userProfile?.role === 'business_owner' ? 'Business Partner' : 'Tourist'}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenProfileModal && onOpenProfileModal();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        <span>Manage Profile</span>
                      </button>

                      {userProfile?.role === 'business_owner' && (
                        <button
                          onClick={() => handleNavClick('business')}
                          className="w-full text-left px-3 py-2 rounded-xl text-teal-800 dark:text-teal-200 bg-teal-50/60 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Building2 className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                          <span>Owner Portal Dashboard</span>
                        </button>
                      )}

                      {userProfile?.role === 'authority' && (
                        <button
                          onClick={() => handleNavClick('authority')}
                          className="w-full text-left px-3 py-2 rounded-xl text-blue-900 dark:text-blue-200 bg-blue-50/60 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                          <span>Authority Command Center</span>
                        </button>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-lg shadow-sm shadow-teal-600/20 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 xl:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          
          {/* Mobile Theme Toggle Pill */}
          <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <span className="flex items-center gap-2">
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
                <span>Theme: {isDark ? 'Dark Mode' : 'Light Mode'}</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-teal-700 dark:text-teal-400">
                {isDark ? 'Dark' : 'Light'}
              </span>
            </button>
          </div>

          <button
            onClick={() => handleNavClick('tourist')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold ${
              activeView === 'tourist' ? 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {t.nav.explore}
          </button>
          <button
            onClick={() => handleNavClick('crowd')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${
              activeView === 'crowd' ? 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>{t.nav.crowd}</span>
          </button>
          <button
            onClick={() => handleNavClick('itinerary')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${
              activeView === 'itinerary' ? 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{t.nav.itinerary}</span>
          </button>
          <button
            onClick={() => handleNavClick('map')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${
              activeView === 'map' ? 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <Map className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>{t.nav.map}</span>
          </button>
          <button
            onClick={() => handleNavClick('recommendations')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${
              activeView === 'recommendations' ? 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500" />
            <span>{t.nav.recommendations}</span>
          </button>
          <button
            onClick={() => handleNavClick('marketplace')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${
              activeView === 'marketplace' ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <Store className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{t.nav.marketplace}</span>
          </button>
          <button
            onClick={() => handleNavClick('companion')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between ${
              activeView === 'companion' ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              {t.nav.companion}
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">
              AI
            </span>
          </button>
          <button
            onClick={() => handleNavClick('business')}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{t.nav.business}</span>
          </button>
          <button
            onClick={() => handleNavClick('authority')}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{t.nav.authority}</span>
          </button>

          {/* Mobile Auth Status Bar */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            {isAuthenticated ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center">
                      {(userProfile?.name || user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{userProfile?.name || user?.displayName || 'User'}</div>
                      <div className="text-[10px] text-teal-600 dark:text-teal-400 font-extrabold uppercase">
                        {userProfile?.role === 'authority' ? 'Tourism Authority' : userProfile?.role === 'business_owner' ? 'Business Partner' : 'Tourist'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenProfileModal && onOpenProfileModal();
                    }}
                    className="text-xs text-cyan-700 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
                  >
                    Profile
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal && onOpenAuthModal('login');
                  }}
                  className="flex-1 py-2 rounded-lg bg-teal-600 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal && onOpenAuthModal('register');
                  }}
                  className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs text-center border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
