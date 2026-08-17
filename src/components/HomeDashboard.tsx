import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
  Navigation as RouteIcon, 
  MapPin, 
  Bookmark, 
  Mic, 
  Settings, 
  HelpCircle, 
  CheckCircle2, 
  AlertOctagon, 
  ShieldCheck, 
  PhoneCall, 
  PlusCircle, 
  ChevronRight 
} from 'lucide-react';

export const HomeDashboard: React.FC = () => {
  const { setActiveSection, speak } = useAccessibility();

  const handleAction = (sectionId: string, announceText: string) => {
    setActiveSection(sectionId);
    speak(announceText);
  };

  const shortcutCards = [
    {
      id: 'nearby',
      title: 'Nearby Places',
      description: 'Accessible clinics & facilities',
      emoji: '📍',
      cardStyle: 'bg-white border-4 border-white hover:border-[#F59E0B] text-[#111827]',
      announce: 'Opening Nearby Accessible Places directory.'
    },
    {
      id: 'saved_routes',
      title: 'Saved Routes',
      description: 'Quick access to your trips',
      emoji: '⭐',
      cardStyle: 'bg-white border-4 border-white hover:border-[#F59E0B] text-[#111827]',
      announce: 'Opening Saved Routes.'
    },
    {
      id: 'live_voice',
      title: 'Voice Guidance',
      description: 'AI Audio Navigation Active',
      emoji: '🎙️',
      cardStyle: 'bg-white border-4 border-[#F59E0B] text-[#111827] relative',
      hasPing: true,
      announce: 'Opening AI Voice Guidance.'
    },
    {
      id: 'settings',
      title: 'Preferences',
      description: 'Adjust text & contrast',
      emoji: '⚙️',
      cardStyle: 'bg-white border-4 border-white hover:border-[#F59E0B] text-[#111827]',
      announce: 'Opening Accessibility Settings.'
    },
    {
      id: 'report_issue',
      title: 'Report Barrier',
      description: 'Report broken ramps or roads',
      emoji: '🚧',
      cardStyle: 'bg-white border-4 border-white hover:border-[#F59E0B] text-[#111827]',
      announce: 'Opening Report Issue.'
    },
    {
      id: 'emergency',
      title: 'Emergency',
      description: 'Contact Barangay Hall',
      emoji: '🆘',
      cardStyle: 'bg-[#FEE2E2] border-4 border-[#EF4444] text-[#991B1B]',
      announce: 'Opening Help and Barangay Emergency Assistance.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-6 lg:space-y-8">
      
      {/* Hero Welcome Banner */}
      <section 
        aria-label="Welcome Banner" 
        className="text-center space-y-3 lg:space-y-4 max-w-4xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 text-[#1E3A8A] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          📍 Barangay Sta. Rita · Olongapo City
        </div>

        <h1 className="text-3xl sm:text-5xl font-black leading-tight text-[#111827]">
          Welcome to <span className="text-[#1E3A8A]">AccessiGo</span>
        </h1>

        <p className="text-base sm:text-xl text-[#4B5563] font-medium leading-relaxed max-w-3xl mx-auto">
          Find safer and more accessible routes around Barangay Sta. Rita, Olongapo City.
        </p>

        {/* Core Prominent Primary Button */}
        <div className="pt-2 max-w-2xl mx-auto">
          <button
            onClick={() => handleAction('plan_route', 'Opening Plan Accessible Route page.')}
            className="w-full py-4 lg:py-5 px-6 lg:px-8 bg-[#1E3A8A] text-white rounded-2xl text-xl sm:text-2xl font-black shadow-lg ring-4 ring-blue-100 hover:bg-blue-900 transition-all active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer focus:outline-none"
          >
            <span>PLAN AN ACCESSIBLE ROUTE</span>
            <span className="text-2xl sm:text-3xl">→</span>
          </button>
        </div>
      </section>

      {/* Primary Shortcut Cards Grid */}
      <section aria-label="Main Application Features" className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {shortcutCards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleAction(card.id, card.announce)}
              className={`p-4 rounded-2xl shadow-md transition-all cursor-pointer flex flex-col items-center text-center gap-2 active:scale-[0.98] focus:outline-none ${card.cardStyle}`}
            >
              {card.hasPing && (
                <div className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </div>
              )}
              <span className="text-3xl sm:text-4xl">{card.emoji}</span>
              <h3 className="text-sm sm:text-base font-extrabold leading-tight">{card.title}</h3>
              <p className={`text-[11px] font-semibold leading-tight ${card.id === 'emergency' ? 'text-[#B91C1C] font-bold uppercase' : 'text-gray-600'}`}>
                {card.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* System Accessibility & Barangay Status Section */}
      <section 
        aria-label="System Information and Status"
        className="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-6 space-y-4 max-w-6xl mx-auto shadow-sm"
      >
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-[#1E3A8A] shrink-0" />
            <div>
              <h3 className="text-lg font-extrabold text-[#111827]">
                Barangay Sta. Rita Accessibility Status
              </h3>
              <p className="text-xs text-[#4B5563] font-medium">
                Live Community Infrastructure & Route Condition Monitoring
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-extrabold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            System Live & Verified
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 bg-[#F3F4F6] rounded-2xl border border-slate-200">
            <p className="text-2xl font-black text-[#1E3A8A]">12</p>
            <p className="text-[11px] font-bold text-[#4B5563] mt-0.5 uppercase">Verified Ramps</p>
          </div>
          <div className="p-3.5 bg-[#F3F4F6] rounded-2xl border border-slate-200">
            <p className="text-2xl font-black text-emerald-700">100%</p>
            <p className="text-[11px] font-bold text-[#4B5563] mt-0.5 uppercase">Step-Free Routes</p>
          </div>
          <div className="p-3.5 bg-[#F3F4F6] rounded-2xl border border-slate-200">
            <p className="text-2xl font-black text-[#F59E0B]">3</p>
            <p className="text-[11px] font-bold text-[#4B5563] mt-0.5 uppercase">Reported Obstacles</p>
          </div>
          <div className="p-3.5 bg-[#F3F4F6] rounded-2xl border border-slate-200">
            <p className="text-2xl font-black text-purple-700">24/7</p>
            <p className="text-[11px] font-bold text-[#4B5563] mt-0.5 uppercase">AI Voice Guidance</p>
          </div>
        </div>

        {/* Quick Report Barrier Trigger */}
        <div className="bg-[#F3F4F6] border-2 border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[#111827]">
            <AlertOctagon className="w-5 h-5 text-[#F59E0B] shrink-0" />
            <p className="text-xs sm:text-sm font-semibold">
              Encountered a broken sidewalk, blocked ramp, or obstacle in Sta. Rita?
            </p>
          </div>
          <button
            onClick={() => handleAction('report_issue', 'Opening Report Accessibility Issue form.')}
            className="px-5 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider shrink-0 transition-colors focus:ring-4 focus:ring-blue-300 focus:outline-none cursor-pointer"
          >
            Report Issue
          </button>
        </div>
      </section>

    </div>
  );
};
