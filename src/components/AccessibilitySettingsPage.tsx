import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import { PWDProfile, MobilityAid, AccessibilityPreference } from '../types';
import {
  Type, Eye, Mic, Globe, Save, UserCheck,
  Check, ShieldCheck,
} from 'lucide-react';

/* ─────────────────────────────────────────────── helpers ── */
const Pill: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
      active
        ? 'bg-[#1E3A8A] text-white border-blue-700'
        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
    }`}
  >
    {active && <Check className="w-3 h-3 shrink-0" />}
    {children}
  </button>
);

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50">
      <span className="text-[#1E3A8A]">{icon}</span>
      <h2 className="text-sm font-bold text-slate-800">{title}</h2>
    </div>
    <div className="p-5 space-y-4">{children}</div>
  </div>
);

const FieldLabel: React.FC<{ htmlFor?: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
    {children}
  </label>
);

const TextInput: React.FC<{
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}> = ({ id, value, onChange, placeholder, type = 'text' }) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1E3A8A] hover:border-slate-300 transition-colors"
  />
);

const ToggleRow: React.FC<{
  label: string;
  description?: string;
  active: boolean;
  onClick: () => void;
  activeColor?: string;
}> = ({ label, description, active, onClick, activeColor = 'bg-[#1E3A8A] text-white border-blue-700' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 text-left ${
      active ? activeColor : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
    }`}
  >
    <span className="flex flex-col gap-0.5">
      <span>{label}</span>
      {description && <span className={`text-xs font-normal ${active ? 'text-blue-200' : 'text-slate-400'}`}>{description}</span>}
    </span>
    <span className={`text-xs font-black px-2 py-0.5 rounded ${active ? 'bg-white/20' : 'bg-slate-200 text-slate-600'}`}>
      {active ? 'ON' : 'OFF'}
    </span>
  </button>
);
/* ──────────────────────────────────────────────────────────── */

export const AccessibilitySettingsPage: React.FC = () => {
  const { settings, updateSettings, profile, updateProfile, speak } = useAccessibility();
  const { currentUser } = useAuth();

  const [form, setForm] = useState<PWDProfile>(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setForm(profile); }, [profile]);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    setSaved(true);
    speak('Profile saved.');
    setTimeout(() => setSaved(false), 3500);
  };

  const toggleMobilityAid = (aid: MobilityAid) =>
    setForm(p => ({
      ...p,
      mobilityAids: p.mobilityAids.includes(aid)
        ? p.mobilityAids.filter(a => a !== aid)
        : [...p.mobilityAids, aid],
    }));

  const togglePref = (pref: AccessibilityPreference) =>
    setForm(p => ({
      ...p,
      preferences: p.preferences.includes(pref)
        ? p.preferences.filter(x => x !== pref)
        : [...p.preferences, pref],
    }));

  return (
    <div className="max-w-screen-xl mx-auto px-5 lg:px-8 py-5">

      {/* Page header — tight */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#1E3A8A]" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-900">Accessibility Settings</h1>
          <p className="text-xs text-slate-500">Display, voice & PWD profile preferences</p>
        </div>
      </div>

      {/* Two-column desktop layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* ── Left column (settings controls) ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Text Size */}
          <SectionCard title="Text Size" icon={<Type className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'small',  label: 'Small',      sub: '14px' },
                { id: 'medium', label: 'Medium',     sub: '16px' },
                { id: 'large',  label: 'Large',      sub: '19px' },
                { id: 'xlarge', label: 'Extra Large', sub: '22px' },
              ] as const).map(ts => {
                const isActive = settings.textSize === ts.id;
                return (
                  <button
                    key={ts.id}
                    onClick={() => { updateSettings({ textSize: ts.id }); speak(`Text size: ${ts.label}.`); }}
                    className={`p-2.5 rounded-lg border text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                      isActive ? 'bg-[#1E3A8A] text-white border-blue-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <p className="font-bold text-sm">{ts.label}</p>
                    <p className={`text-xs ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>{ts.sub}</p>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* Contrast Mode */}
          <SectionCard title="Colour Contrast" icon={<Eye className="w-4 h-4" />}>
            <div className="space-y-2">
              {([
                { id: 'standard',      label: 'Standard Light',      desc: 'WCAG AA — default' },
                { id: 'high_contrast', label: 'High Contrast Dark',  desc: 'Maximum contrast' },
                { id: 'yellow_black',  label: 'Yellow & Black',      desc: 'For low vision users' },
              ] as const).map(cm => {
                const isActive = settings.contrastMode === cm.id;
                return (
                  <button
                    key={cm.id}
                    onClick={() => { updateSettings({ contrastMode: cm.id }); speak(`Contrast: ${cm.label}.`); }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                      isActive ? 'bg-[#1E3A8A] text-white border-blue-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{cm.label}</p>
                      <p className={`text-xs ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>{cm.desc}</p>
                    </div>
                    {isActive && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* Voice & Misc */}
          <SectionCard title="Voice & Display" icon={<Mic className="w-4 h-4" />}>
            <div className="space-y-2">
              <ToggleRow
                label="Voice Guidance"
                description="Spoken turn-by-turn instructions"
                active={settings.voiceGuidanceEnabled}
                onClick={() => {
                  const next = !settings.voiceGuidanceEnabled;
                  updateSettings({ voiceGuidanceEnabled: next });
                  speak(`Voice guidance ${next ? 'on' : 'off'}.`);
                }}
                activeColor="bg-amber-500 text-slate-900 border-amber-400"
              />
              <ToggleRow
                label="Reduce Animations"
                description="Less motion for sensitive users"
                active={settings.reducedMotion}
                onClick={() => {
                  const next = !settings.reducedMotion;
                  updateSettings({ reducedMotion: next });
                  speak(`Reduced motion ${next ? 'on' : 'off'}.`);
                }}
              />

              <div className="pt-1">
                <FieldLabel>Voice Speed</FieldLabel>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'slow', label: 'Slow' },
                    { id: 'normal', label: 'Normal' },
                    { id: 'fast', label: 'Fast' },
                  ] as const).map(sp => (
                    <button
                      key={sp.id}
                      onClick={() => { updateSettings({ voiceSpeed: sp.id }); speak(`Speed: ${sp.label}.`); }}
                      className={`py-2 rounded-lg border text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                        settings.voiceSpeed === sp.id
                          ? 'bg-amber-500 text-slate-900 border-amber-400'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Language */}
          <SectionCard title="Language" icon={<Globe className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-2">
              {(['en', 'fil'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => {
                    updateSettings({ language: lang });
                    speak(lang === 'en' ? 'Language: English.' : 'Wika: Filipino.');
                  }}
                  className={`py-2.5 rounded-lg border text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                    settings.language === lang
                      ? 'bg-[#1E3A8A] text-white border-blue-700'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {lang === 'en' ? '🇺🇸 English' : '🇵🇭 Filipino'}
                </button>
              ))}
            </div>
          </SectionCard>

        </div>

        {/* ── Right column (PWD Profile) ── */}
        <div className="lg:col-span-3">
          <form onSubmit={saveProfile}>
            <SectionCard title="PWD Profile Declaration" icon={<UserCheck className="w-4 h-4" />}>

              {/* Success banner */}
              {saved && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-semibold">
                  <Check className="w-4 h-4 shrink-0" />
                  Profile saved successfully!
                </div>
              )}

              {/* Account info row (read-only from auth) */}
              {currentUser && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-black text-sm shrink-0">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{currentUser.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                  <span className="ml-auto shrink-0 text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 uppercase tracking-wide">
                    Logged in
                  </span>
                </div>
              )}

              {/* Grid fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <FieldLabel htmlFor="pf-name">Full Name</FieldLabel>
                  <TextInput id="pf-name" value={form.fullName} onChange={v => setForm(p => ({ ...p, fullName: v }))} placeholder="Juan dela Cruz" />
                </div>
                <div>
                  <FieldLabel htmlFor="pf-ec-name">Emergency Contact Name</FieldLabel>
                  <TextInput id="pf-ec-name" value={form.emergencyContactName} onChange={v => setForm(p => ({ ...p, emergencyContactName: v }))} placeholder="Contact name" />
                </div>
                <div>
                  <FieldLabel htmlFor="pf-ec-phone">Emergency Contact Phone</FieldLabel>
                  <TextInput id="pf-ec-phone" value={form.emergencyContactPhone} onChange={v => setForm(p => ({ ...p, emergencyContactPhone: v }))} placeholder="09XX-XXX-XXXX" type="tel" />
                </div>
              </div>

              {/* Mobility Aids */}
              <div>
                <FieldLabel>Mobility Aids Used</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: 'manual_wheelchair', label: '🦽 Manual Wheelchair' },
                    { id: 'power_wheelchair',  label: '⚡ Power Wheelchair' },
                    { id: 'crutches',          label: '🩼 Crutches' },
                    { id: 'white_cane',        label: '🦯 White Cane' },
                    { id: 'walker',            label: '🚶 Walker' },
                    { id: 'guide_dog',         label: '🦮 Guide Dog' },
                  ] as { id: MobilityAid; label: string }[]).map(a => (
                    <Pill key={a.id} active={form.mobilityAids.includes(a.id)} onClick={() => toggleMobilityAid(a.id)}>
                      {a.label}
                    </Pill>
                  ))}
                </div>
              </div>

              {/* Accessibility Preferences */}
              <div>
                <FieldLabel>Route Preferences</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: 'wheelchair_accessible', label: '♿ Wheelchair Accessible' },
                    { id: 'avoid_stairs',          label: '🚫 Avoid Stairs' },
                    { id: 'avoid_steep_slopes',    label: '⛰️ Avoid Steep Slopes' },
                    { id: 'smooth_pathways',       label: '🛤️ Smooth Pathways' },
                    { id: 'accessible_crossings',  label: '🚦 Accessible Crossings' },
                    { id: 'rest_stops_frequent',   label: '🪑 Frequent Rest Stops' },
                    { id: 'shaded_paths',          label: '🌳 Shaded Paths' },
                    { id: 'shortest',              label: '📏 Shortest Route' },
                    { id: 'safest',                label: '🛡️ Safest Route' },
                    { id: 'least_difficult',       label: '✅ Least Difficult' },
                  ] as { id: AccessibilityPreference; label: string }[]).map(p => (
                    <Pill key={p.id} active={form.preferences.includes(p.id)} onClick={() => togglePref(p.id)}>
                      {p.label}
                    </Pill>
                  ))}
                </div>
              </div>

              {/* Save button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold text-sm rounded-lg transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 shadow-sm"
              >
                <Save className="w-4 h-4" />
                Save PWD Profile
              </button>

            </SectionCard>
          </form>
        </div>

      </div>
    </div>
  );
};
