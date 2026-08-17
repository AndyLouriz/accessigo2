import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
  Home, 
  Navigation as RouteIcon, 
  MapPin, 
  Map, 
  Bookmark, 
  Settings, 
  AlertTriangle, 
  Mic, 
  Volume2, 
  Type, 
  Eye, 
  PhoneCall, 
  FileText 
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeSection, setActiveSection, settings, updateSettings, speak, announceToScreenReader } = useAccessibility();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    speak('Logging out of AccessiGo.');
    await logout();
  };

  const handleNavClick = (sectionId: string, sectionLabel: string) => {
    setActiveSection(sectionId);
    announceToScreenReader(`Navigated to ${sectionLabel}`);
    speak(`${sectionLabel} section active.`);
  };

  const cycleTextSize = () => {
    const sizes: ('small' | 'medium' | 'large' | 'xlarge')[] = ['small', 'medium', 'large', 'xlarge'];
    const currentIndex = sizes.indexOf(settings.textSize);
    const nextSize = sizes[(currentIndex + 1) % sizes.length];
    updateSettings({ textSize: nextSize });
    speak(`Text size set to ${nextSize}.`);
  };

  const toggleContrast = () => {
    const modes: ('standard' | 'high_contrast' | 'yellow_black')[] = ['standard', 'high_contrast', 'yellow_black'];
    const currentIndex = modes.indexOf(settings.contrastMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    updateSettings({ contrastMode: nextMode });

    let label = 'Standard Accessible Light';
    if (nextMode === 'high_contrast') label = 'High Contrast Dark Mode';
    if (nextMode === 'yellow_black') label = 'Yellow and Black High Visibility Mode';

    speak(`Contrast mode set to ${label}.`);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'plan_route', label: 'Plan Route', icon: RouteIcon },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'nearby', label: 'Nearby Places', icon: MapPin },
    { id: 'saved_routes', label: 'Saved Routes', icon: Bookmark },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'emergency', label: 'Help & Emergency', icon: PhoneCall },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white text-[#111827] border-b-4 border-[#1E3A8A] shadow-sm">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          
          {/* Brand Logo & Barangay Identifier */}
          <button
            onClick={() => handleNavClick('home', 'Home')}
            className="flex items-center gap-3 group text-left focus:ring-4 focus:ring-blue-300 focus:outline-none rounded-xl p-1.5 transition-all"
            aria-label="AccessiGo - Go to Home Page"
          >
            <div className="w-10 h-10 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-[#1E3A8A]">
                  Accessi<span className="text-[#F59E0B]">Go</span>
                </span>
                <span className="bg-[#1E3A8A]/10 text-[#1E3A8A] text-xs px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider hidden sm:inline-block">
                  Sta. Rita
                </span>
              </div>
              <p className="text-xs text-[#4B5563] font-medium hidden sm:block">
                Accessible Route Planning · Olongapo City
              </p>
            </div>
          </button>

          {/* Desktop Main Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.label)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-2.5 py-2 xl:px-3.5 xl:py-2.5 2xl:px-5 rounded-xl font-bold text-xs xl:text-sm 2xl:text-base transition-all border-2 whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md' 
                      : 'bg-[#F3F4F6] text-[#111827] border-transparent hover:border-[#1E3A8A]'
                  }`}
                >
                  <Icon className={`w-4 h-4 xl:w-5 xl:h-5 ${isActive ? 'text-white' : 'text-[#1E3A8A]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Accessibility Quick Tools in Header */}
          <div className="flex items-center gap-2">
            
            {/* Quick Text Size Toggle Button */}
            <button
              onClick={cycleTextSize}
              title="Cycle Text Size (Small, Medium, Large, Extra Large)"
              aria-label={`Change text size. Current size: ${settings.textSize}`}
              className="px-3.5 py-2.5 bg-[#F3F4F6] hover:bg-gray-200 text-[#111827] rounded-xl border-2 border-transparent hover:border-[#1E3A8A] flex items-center gap-1.5 font-bold text-sm focus:ring-4 focus:ring-blue-300 focus:outline-none transition-colors"
            >
              <Type className="w-4 h-4 text-[#1E3A8A]" />
              <span className="hidden sm:inline">Text:</span>
              <span className="uppercase text-[#1E3A8A] font-extrabold">{settings.textSize}</span>
            </button>

            {/* Quick High Contrast Toggle */}
            <button
              onClick={toggleContrast}
              title={`Cycle Color Contrast Mode (Current: ${settings.contrastMode.replace('_', ' ')})`}
              aria-label={`Cycle Color Contrast Mode. Current: ${settings.contrastMode.replace('_', ' ')}`}
              className={`p-2.5 rounded-xl border-2 font-bold flex items-center justify-center transition-colors focus:ring-4 focus:ring-amber-400 focus:outline-none ${
                settings.contrastMode !== 'standard'
                  ? 'bg-[#F59E0B] text-slate-950 border-amber-300 shadow-lg'
                  : 'bg-[#F3F4F6] hover:bg-gray-200 text-slate-800 border-transparent hover:border-[#1E3A8A]'
              }`}
            >
              <Eye className="w-5 h-5" />
            </button>

            {/* AI Voice Assistant Activation Button */}
            <button
              onClick={() => handleNavClick('live_voice', 'AI Voice Guidance')}
              className="px-4 py-2.5 bg-[#F59E0B] hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-md border-2 border-amber-300 flex items-center gap-2 transition-all focus:ring-4 focus:ring-amber-300 focus:outline-none text-sm shrink-0"
            >
              <Mic className="w-5 h-5 fill-current" />
              <span className="hidden sm:inline">Voice</span>
            </button>

            {/* User Name + Logout */}
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 pl-1 border-l-2 border-slate-200 ml-1">
                <span className="text-xs font-bold text-slate-600 max-w-[90px] truncate" title={currentUser.fullName}>
                  {currentUser.fullName.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  title="Log out of AccessiGo"
                  aria-label="Log out"
                  className="px-3 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border-2 border-slate-200 hover:border-red-300 rounded-xl font-bold text-xs transition-all focus:ring-4 focus:ring-red-200 focus:outline-none"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Accessible Navigation Bar (Bottom Sticky) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 px-2 py-2 shadow-2xl">
        <div className="flex items-center justify-around">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'plan_route', label: 'Plan Route', icon: RouteIcon },
            { id: 'map', label: 'Map', icon: Map },
            { id: 'nearby', label: 'Places', icon: MapPin },
            { id: 'emergency', label: 'Emergency', icon: PhoneCall },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.label)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all focus:ring-4 focus:ring-blue-300 focus:outline-none min-w-[60px] ${
                  isActive ? 'bg-[#1E3A8A] text-white font-extrabold' : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[11px] leading-none font-bold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
