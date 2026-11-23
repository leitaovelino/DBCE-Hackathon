import React, { useState } from 'react';
import { Compass, Heart, Globe, Menu, X, MapPin, Sparkles, Building2, ShieldCheck, Map, Star, Bot, Users, Calendar, Store } from 'lucide-react';

export default function Navbar({
  currentLang,
  setLang,
  t,
  savedCount,
  onOpenFavorites,
  activeView,
  setActiveView
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिन्दी (Hindi)', short: 'HI' },
    { code: 'kok', label: 'कोंकणी (Konkani)', short: 'KOK' }
  ];

  const handleNavClick = (view) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
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
                <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-cyan-700 via-teal-700 to-emerald-700 bg-clip-text text-transparent">
                  GoaSmart
                </span>
                <span className="text-[10px] px-2 py-0.5 font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
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
                  ? 'bg-cyan-50 text-cyan-800 border border-cyan-200/60' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {t.nav.explore}
            </button>

            {/* Crowd Radar */}
            <button
              onClick={() => handleNavClick('crowd')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                activeView === 'crowd' 
                  ? 'bg-cyan-50 text-cyan-800 border border-cyan-200/60' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-cyan-600" />
              <span>{t.nav.crowd}</span>
            </button>

            {/* Smart Itinerary */}
            <button
              onClick={() => handleNavClick('itinerary')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                activeView === 'itinerary' 
                  ? 'bg-cyan-50 text-cyan-800 border border-cyan-200/60' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.nav.itinerary}</span>
            </button>

            {/* Interactive Map */}
            <button
              onClick={() => handleNavClick('map')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                activeView === 'map' 
                  ? 'bg-cyan-50 text-cyan-800 border border-cyan-200/60' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Map className="w-3.5 h-3.5 text-cyan-600" />
              <span>{t.nav.map}</span>
            </button>

            {/* Recommendations */}
            <button
              onClick={() => handleNavClick('recommendations')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                activeView === 'recommendations' 
                  ? 'bg-cyan-50 text-cyan-800 border border-cyan-200/60' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
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
                  ? 'bg-teal-50 text-teal-800 border border-teal-200/60' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.nav.marketplace}</span>
            </button>

            {/* AI Tourism Chatbot */}
            <button
              onClick={() => handleNavClick('companion')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                activeView === 'companion'
                  ? 'bg-teal-50 text-teal-800 border border-teal-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.nav.companion}</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-extrabold">
                AI
              </span>
            </button>

            {/* Local Business Owner Dashboard */}
            <button
              onClick={() => handleNavClick('business')}
              className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                activeView === 'business'
                  ? 'bg-teal-50 text-teal-800 border border-teal-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.nav.business}</span>
            </button>

            {/* Tourism Authority */}
            <button
              onClick={() => handleNavClick('authority')}
              className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                activeView === 'authority'
                  ? 'bg-blue-900 text-blue-200 border border-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.nav.authority}</span>
            </button>
          </nav>

          {/* Right Action Icons: Language, Favorites, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span className="uppercase">{currentLang}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Language
                  </div>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        currentLang === l.code ? 'text-teal-700 font-bold bg-teal-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span>{l.label}</span>
                      {currentLang === l.code && <span className="text-teal-600">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Places / Favorites Drawer Button */}
            <button
              onClick={onOpenFavorites}
              className="relative p-2 text-slate-600 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Saved Places"
            >
              <Heart className={`w-5 h-5 ${savedCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 xl:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          <button
            onClick={() => handleNavClick('tourist')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold ${
              activeView === 'tourist' ? 'bg-cyan-50 text-cyan-800' : 'text-slate-700'
            }`}
          >
            {t.nav.explore}
          </button>
          <button
            onClick={() => handleNavClick('crowd')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${
              activeView === 'crowd' ? 'bg-cyan-50 text-cyan-800' : 'text-slate-700'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-600" />
            <span>{t.nav.crowd}</span>
          </button>
          <button
            onClick={() => handleNavClick('itinerary')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${
              activeView === 'itinerary' ? 'bg-cyan-50 text-cyan-800' : 'text-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>{t.nav.itinerary}</span>
          </button>
          <button
            onClick={() => handleNavClick('map')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${
              activeView === 'map' ? 'bg-cyan-50 text-cyan-800' : 'text-slate-700'
            }`}
          >
            <Map className="w-4 h-4 text-cyan-600" />
            <span>{t.nav.map}</span>
          </button>
          <button
            onClick={() => handleNavClick('recommendations')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${
              activeView === 'recommendations' ? 'bg-cyan-50 text-cyan-800' : 'text-slate-700'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500" />
            <span>{t.nav.recommendations}</span>
          </button>
          <button
            onClick={() => handleNavClick('marketplace')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${
              activeView === 'marketplace' ? 'bg-teal-50 text-teal-800' : 'text-slate-700'
            }`}
          >
            <Store className="w-4 h-4 text-teal-600" />
            <span>{t.nav.marketplace}</span>
          </button>
          <button
            onClick={() => handleNavClick('companion')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between ${
              activeView === 'companion' ? 'bg-teal-50 text-teal-800' : 'text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-teal-600" />
              {t.nav.companion}
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
              AI
            </span>
          </button>
          <button
            onClick={() => handleNavClick('business')}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>{t.nav.business}</span>
          </button>
          <button
            onClick={() => handleNavClick('authority')}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>{t.nav.authority}</span>
          </button>
        </div>
      )}
    </header>
  );
}
