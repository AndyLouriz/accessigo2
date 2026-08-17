import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import {
  Navigation as RouteIcon, MapPin, Bookmark, Mic, Settings,
  PhoneCall, Flag, ShieldCheck, AlertOctagon, ChevronRight, Rss,
} from 'lucide-react';

const featureCards = [
  { id: 'nearby',       icon: MapPin,    label: 'Nearby Places',  desc: 'Clinics, ramps & facilities',    color: 'blue',   announce: 'Opening Nearby Places.' },
  { id: 'saved_routes', icon: Bookmark,  label: 'Saved Routes',   desc: 'Your favourite trips',           color: 'indigo', announce: 'Opening Saved Routes.' },
  { id: 'live_voice',   icon: Mic,       label: 'Voice Guidance', desc: 'AI-powered audio navigation',    color: 'amber',  badge: 'LIVE', announce: 'Opening Voice Guidance.' },
  { id: 'settings',     icon: Settings,  label: 'Settings',       desc: 'Text size, contrast & profile',  color: 'slate',  announce: 'Opening Accessibility Settings.' },
  { id: 'report_issue', icon: Flag,      label: 'Report Barrier', desc: 'Broken ramps or obstacles',      color: 'orange', announce: 'Opening Report Issue.' },
  { id: 'emergency',    icon: PhoneCall, label: 'Emergency Help', desc: 'Contact Barangay Hall',          color: 'red',    announce: 'Opening Emergency Help.' },
] as const;

type CardColor = 'blue' | 'indigo' | 'amber' | 'slate' | 'orange' | 'red';

const colorMap: Record<CardColor, { border: string; bg: string; iconBg: string; iconText: string; badge: string }> = {
  blue:   { border: 'border-blue-200 hover:border-blue-400',   bg: 'bg-white hover:bg-blue-50',    iconBg: 'bg-blue-100',   iconText: 'text-blue-700',   badge: 'bg-blue-600 text-white' },
  indigo: { border: 'border-indigo-200 hover:border-indigo-400', bg: 'bg-white hover:bg-indigo-50', iconBg: 'bg-indigo-100', iconText: 'text-indigo-700', badge: 'bg-indigo-600 text-white' },
  amber:  { border: 'border-amber-300 hover:border-amber-500',  bg: 'bg-amber-50 hover:bg-amber-100', iconBg: 'bg-amber-200', iconText: 'text-amber-800', badge: 'bg-amber-500 text-slate-900' },
  slate:  { border: 'border-slate-200 hover:border-slate-400', bg: 'bg-white hover:bg-slate-50',   iconBg: 'bg-slate-100',  iconText: 'text-slate-600',  badge: 'bg-slate-600 text-white' },
  orange: { border: 'border-orange-200 hover:border-orange-400', bg: 'bg-white hover:bg-orange-50', iconBg: 'bg-orange-100', iconText: 'text-orange-700', badge: 'bg-orange-500 text-white' },
  red:    { border: 'border-red-300 hover:border-red-500',      bg: 'bg-red-50 hover:bg-red-100',  iconBg: 'bg-red-100',    iconText: 'text-red-700',    badge: 'bg-red-600 text-white' },
};

export const HomeDashboard: React.FC = () => {
  const { setActiveSection, speak } = useAccessibility();
  const { currentUser } = useAuth();

  const go = (id: string, announce: string) => {
    setActiveSection(id);
    speak(announce);
  };

  const firstName = currentUser?.fullName?.split(' ')[0] ?? 'there';

  return (
    <div className="max-w-screen-xl mx-auto px-5 lg:px-8 py-5 space-y-5">

      {/* ── Hero + CTA ───────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] rounded-2xl p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-5 shadow-md">
        <div className="text-white space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
            <Rss className="w-3 h-3" /> Barangay Sta. Rita · Olongapo City
          </div>
          <h1 className="text-2xl lg:text-3xl font-black leading-tight">
            {currentUser ? <>Hello, {firstName}!</> : <>Welcome to AccessiGo</>}
          </h1>
          <p className="text-blue-100 text-sm font-medium leading-snug max-w-md">
            Find safer, wheelchair-friendly routes around Barangay Sta. Rita. Powered by accessibility data.
          </p>
        </div>

        <button
          onClick={() => go('plan_route', 'Opening Plan Accessible Route page.')}
          aria-label="Plan an accessible route"
          className="shrink-0 flex items-center gap-2 bg-[#F59E0B] hover:bg-amber-400 active:scale-[0.98] text-slate-900 font-black text-base px-6 py-3.5 rounded-xl shadow-lg transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 whitespace-nowrap"
        >
          <RouteIcon className="w-5 h-5 shrink-0" />
          Plan Accessible Route
          <ChevronRight className="w-4 h-4 shrink-0" />
        </button>
      </section>

      {/* ── Feature Cards ────────────────────────────────────────────────── */}
      <section aria-label="Application Features">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Access</p>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {featureCards.map(({ id, icon: Icon, label, desc, color, badge, announce }) => {
            const c = colorMap[color as CardColor];
            return (
              <button
                key={id}
                onClick={() => go(id, announce)}
                className={`card-hover relative flex flex-col items-start gap-2.5 p-4 rounded-xl border-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${c.border} ${c.bg}`}
              >
                {badge && (
                  <span className={`absolute top-2.5 right-2.5 text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none ${c.badge}`}>
                    {badge}
                  </span>
                )}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c.iconBg}`}>
                  <Icon className={`w-4 h-4 ${c.iconText}`} />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800 leading-tight">{label}</p>
                  <p className={`text-[11px] font-medium mt-0.5 leading-snug ${color === 'red' ? 'text-red-700' : 'text-slate-500'}`}>
                    {desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Status + Report Row ──────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Status card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#1E3A8A]" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800">Sta. Rita Accessibility Status</p>
                <p className="text-xs text-slate-400">Live infrastructure monitoring</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Live
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              { value: '12',   label: 'Verified Ramps',    color: 'text-[#1E3A8A]' },
              { value: '100%', label: 'Step-Free Routes',  color: 'text-emerald-700' },
              { value: '3',    label: 'Active Reports',    color: 'text-amber-600' },
              { value: '24/7', label: 'Voice Guidance',    color: 'text-purple-700' },
            ].map(({ value, label, color }) => (
              <div key={label} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <p className={`text-xl font-black ${color}`}>{value}</p>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5 uppercase tracking-wide leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Report barrier card */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-start gap-2.5 mb-4">
            <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-slate-800 leading-snug">Spotted a barrier?</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                Report broken ramps, blocked pathways, or accessibility issues in Sta. Rita.
              </p>
            </div>
          </div>
          <button
            onClick={() => go('report_issue', 'Opening Report Accessibility Issue form.')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold rounded-lg text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <Flag className="w-4 h-4" />
            Report Issue
          </button>
        </div>

      </section>
    </div>
  );
};
