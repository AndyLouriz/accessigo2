import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  Home, Navigation as RouteIcon, MapPin, Map, Bookmark,
  Settings, Mic, Type, Eye, PhoneCall, LogOut, User, Menu, X,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeSection, setActiveSection, settings, updateSettings, speak, announceToScreenReader } = useAccessibility();
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string, label: string) => {
    setActiveSection(sectionId);
    announceToScreenReader(`Navigated to ${label}`);
    speak(`${label} section active.`);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    speak('Logging out.');
    await logout();
  };

  const cycleTextSize = () => {
    const sizes: ('small' | 'medium' | 'large' | 'xlarge')[] = ['small', 'medium', 'large', 'xlarge'];
    const next = sizes[(sizes.indexOf(settings.textSize) + 1) % sizes.length];
    updateSettings({ textSize: next });
    speak(`Text size: ${next}.`);
  };

  const toggleContrast = () => {
    const modes: ('standard' | 'high_contrast' | 'yellow_black')[] = ['standard', 'high_contrast', 'yellow_black'];
    const next = modes[(modes.indexOf(settings.contrastMode) + 1) % modes.length];
    updateSettings({ contrastMode: next });
    const labels: Record<string, string> = { standard: 'Standard', high_contrast: 'High Contrast', yellow_black: 'Yellow & Black' };
    speak(`Contrast: ${labels[next]}.`);
  };

  const navItems = [
    { id: 'home',         label: 'Home',         icon: Home },
    { id: 'plan_route',   label: 'Plan Route',   icon: RouteIcon },
    { id: 'map',          label: 'Map',          icon: Map },
    { id: 'nearby',       label: 'Nearby',       icon: MapPin },
    { id: 'saved_routes', label: 'Saved',        icon: Bookmark },
    { id: 'settings',     label: 'Settings',     icon: Settings },
    { id: 'emergency',    label: 'Emergency',    icon: PhoneCall },
  ];

  const textLabel: Record<string, string> = { small: 'S', medium: 'M', large: 'L', xlarge: 'XL' };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b-2 border-slate-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6 flex items-center h-14 gap-3">

          {/* Brand */}
          <button
            onClick={() => handleNavClick('home', 'Home')}
            className="flex items-center gap-2 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg"
            aria-label="AccessiGo — Home"
          >
            <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
              A
            </div>
            <div className="leading-none">
              <div className="text-lg font-black tracking-tight text-[#1E3A8A]">
                Accessi<span className="text-[#F59E0B]">Go</span>
              </div>
              <div className="text-[9px] text-slate-400 font-semibold tracking-wide hidden sm:block">
                Sta. Rita · Olongapo City
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="w-px h-7 bg-slate-200 mx-1 shrink-0" />

          {/* Desktop Nav */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-0.5 flex-1">
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;
              const isEmergency = id === 'emergency';
              return (
                <button
                  key={id}
                  onClick={() => handleNavClick(id, label)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                    isEmergency
                      ? isActive
                        ? 'bg-red-600 text-white'
                        : 'text-red-600 hover:bg-red-50'
                      : isActive
                        ? 'bg-[#1E3A8A] text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Spacer for mobile */}
          <div className="flex-1 lg:hidden" />

          {/* Right tools */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* Text Size */}
            <button
              onClick={cycleTextSize}
              aria-label={`Text size: ${settings.textSize}`}
              title="Change text size"
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 font-semibold text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <Type className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span className="text-[#1E3A8A] font-black">{textLabel[settings.textSize]}</span>
            </button>

            {/* Contrast */}
            <button
              onClick={toggleContrast}
              aria-label={`Contrast: ${settings.contrastMode}`}
              title="Cycle contrast mode"
              className={`flex items-center justify-center w-8 h-8 rounded-lg border font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                settings.contrastMode !== 'standard'
                  ? 'bg-[#F59E0B] text-slate-900 border-amber-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {/* Voice */}
            <button
              onClick={() => handleNavClick('live_voice', 'Voice Guidance')}
              aria-label="Open voice guidance"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F59E0B] hover:bg-amber-400 text-slate-900 font-bold rounded-lg border border-amber-300 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <Mic className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Voice</span>
            </button>

            {/* User + Logout */}
            {currentUser && (
              <div className="hidden md:flex items-center gap-1 border-l border-slate-200 pl-2 ml-0.5">
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-[#1E3A8A] rounded-lg">
                  <User className="w-3 h-3" />
                  <span className="text-xs font-bold max-w-[72px] truncate" title={currentUser.fullName}>
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  aria-label="Log out"
                  title="Log out"
                  className="flex items-center gap-1 px-2 py-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden xl:inline">Logout</span>
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 focus:outline-none"
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;
              const isEmergency = id === 'emergency';
              return (
                <button
                  key={id}
                  onClick={() => handleNavClick(id, label)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg font-semibold text-sm text-left transition-colors ${
                    isEmergency
                      ? isActive ? 'bg-red-600 text-white' : 'text-red-600 bg-red-50'
                      : isActive ? 'bg-[#1E3A8A] text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              );
            })}
            {currentUser && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> {currentUser.fullName}
                </span>
                <button onClick={handleLogout} className="text-xs text-red-600 font-bold flex items-center gap-1">
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};
