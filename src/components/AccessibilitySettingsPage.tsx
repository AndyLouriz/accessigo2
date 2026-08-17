import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { PWDProfile, DisabilityType, MobilityAid, AccessibilityPreference } from '../types';
import { 
  Settings, 
  Type, 
  Eye, 
  Mic, 
  Compass, 
  Globe, 
  Sparkles, 
  Save, 
  UserCheck, 
  HeartHandshake, 
  Check 
} from 'lucide-react';

export const AccessibilitySettingsPage: React.FC = () => {
  const { settings, updateSettings, profile, updateProfile, speak, announceToScreenReader } = useAccessibility();

  const [profileForm, setProfileForm] = useState<PWDProfile>(profile);

  // Keep form in sync if context profile changes (e.g. loaded from localStorage after mount)
  useEffect(() => {
    setProfileForm(profile);
  }, [profile]);

  const [profileSavedSuccess, setProfileSavedSuccess] = useState<boolean>(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
    setProfileSavedSuccess(true);
    speak('PWD Profile saved successfully.');
    setTimeout(() => setProfileSavedSuccess(false), 4000);
  };

  const togglePreference = (pref: AccessibilityPreference) => {
    setProfileForm(prev => {
      const exists = prev.preferences.includes(pref);
      return {
        ...prev,
        preferences: exists
          ? prev.preferences.filter(p => p !== pref)
          : [...prev.preferences, pref]
      };
    });
  };

  const toggleMobilityAid = (aid: MobilityAid) => {
    setProfileForm(prev => {
      const exists = prev.mobilityAids.includes(aid);
      return {
        ...prev,
        mobilityAids: exists ? prev.mobilityAids.filter(a => a !== aid) : [...prev.mobilityAids, aid]
      };
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-6 lg:space-y-8">
      
      {/* Header */}
      <div className="border-b-2 border-slate-200 pb-4">
        <div className="inline-flex items-center gap-2 bg-slate-800 text-white px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          ⚙️ Personalization
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
          Accessibility Settings
        </h1>
        <p className="text-base text-slate-600 font-medium mt-1">
          Customize font text scaling, high-contrast themes, voice guidance, and your PWD Profile declaration.
        </p>
      </div>

      {/* 1. Display & Visual Accessibility Controls */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
          <Type className="w-6 h-6 text-blue-600" />
          <span>Text Size & Display Scaling</span>
        </h2>

        {/* Text Size Selectors */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">
            Text Size (Scales entire web app interface):
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'small', label: 'Small (14px)' },
              { id: 'medium', label: 'Medium (16px)' },
              { id: 'large', label: 'Large (19px)' },
              { id: 'xlarge', label: 'Extra Large (22px)' },
            ].map(ts => {
              const isSelected = settings.textSize === ts.id;
              return (
                <button
                  key={ts.id}
                  type="button"
                  onClick={() => {
                    updateSettings({ textSize: ts.id as any });
                    speak(`Text size changed to ${ts.label}.`);
                  }}
                  className={`p-4 rounded-2xl border-2 font-extrabold text-sm transition-all focus:ring-4 focus:ring-blue-300 focus:outline-none ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                      : 'bg-slate-50 text-slate-900 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {ts.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* High Contrast Mode */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <label className="block text-sm font-bold text-slate-700">
            Color Contrast Mode:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'standard', label: 'Standard Accessible Light', desc: 'High WCAG AA contrast' },
              { id: 'high_contrast', label: 'High Contrast Mode', desc: 'Maximum dark & light contrast' },
              { id: 'yellow_black', label: 'Yellow & Black', desc: 'High visibility for visual impairments' },
            ].map(cm => {
              const isSelected = settings.contrastMode === cm.id;
              return (
                <button
                  key={cm.id}
                  type="button"
                  onClick={() => {
                    updateSettings({ contrastMode: cm.id as any });
                    speak(`Contrast mode set to ${cm.label}.`);
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all focus:ring-4 focus:ring-blue-300 focus:outline-none ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                      : 'bg-slate-50 text-slate-900 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <p className="font-extrabold text-sm font-heading">{cm.label}</p>
                  <p className={`text-xs mt-1 ${isSelected ? 'text-blue-100' : 'text-slate-600'}`}>{cm.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reduced Motion & Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-200">
          
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              Language Preference:
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  updateSettings({ language: 'en' });
                  speak('Language set to English.');
                }}
                className={`flex-1 p-3 rounded-xl border-2 font-bold text-sm ${
                  settings.language === 'en' ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-50 text-slate-900 border-slate-300'
                }`}
              >
                English
              </button>

              <button
                type="button"
                onClick={() => {
                  updateSettings({ language: 'fil' });
                  speak('Wika nakaset sa Filipino Tagalog.');
                }}
                className={`flex-1 p-3 rounded-xl border-2 font-bold text-sm ${
                  settings.language === 'fil' ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-50 text-slate-900 border-slate-300'
                }`}
              >
                Filipino (Tagalog)
              </button>
            </div>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              Animation & Reduced Motion:
            </label>

            <button
              type="button"
              onClick={() => {
                const nextMotion = !settings.reducedMotion;
                updateSettings({ reducedMotion: nextMotion });
                speak(`Reduced motion ${nextMotion ? 'enabled' : 'disabled'}.`);
              }}
              className={`w-full p-3 rounded-xl border-2 font-bold text-sm flex items-center justify-between ${
                settings.reducedMotion ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-50 text-slate-900 border-slate-300'
              }`}
            >
              <span>Reduce Interface Motion & Animations</span>
              <span>{settings.reducedMotion ? 'ON' : 'OFF'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Voice Guidance Settings */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
          <Mic className="w-6 h-6 text-amber-600" />
          <span>AI Voice Guidance & Audio Settings</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Voice Guidance On/Off */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              Voice Guidance System:
            </label>

            <button
              type="button"
              onClick={() => {
                const nextVoice = !settings.voiceGuidanceEnabled;
                updateSettings({ voiceGuidanceEnabled: nextVoice });
                speak(`Voice guidance ${nextVoice ? 'enabled' : 'disabled'}.`);
              }}
              className={`w-full p-4 rounded-2xl border-2 font-bold text-base flex items-center justify-between ${
                settings.voiceGuidanceEnabled ? 'bg-amber-500 text-slate-950 border-amber-300' : 'bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              <span>Enable Spoken Voice Instructions</span>
              <span className="font-extrabold">{settings.voiceGuidanceEnabled ? 'ENABLED' : 'DISABLED'}</span>
            </button>
          </div>

          {/* Voice Speed */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              Spoken Voice Speed:
            </label>

            <div className="flex gap-2">
              {[
                { id: 'slow', label: 'Slow (0.7x)' },
                { id: 'normal', label: 'Normal (1.0x)' },
                { id: 'fast', label: 'Fast (1.2x)' },
              ].map(sp => {
                const isSelected = settings.voiceSpeed === sp.id;
                return (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => {
                      updateSettings({ voiceSpeed: sp.id as any });
                      speak(`Voice speed set to ${sp.label}.`);
                    }}
                    className={`flex-1 p-3 rounded-xl border-2 font-bold text-xs ${
                      isSelected ? 'bg-amber-500 text-slate-950 border-amber-300' : 'bg-slate-50 text-slate-900 border-slate-300'
                    }`}
                  >
                    {sp.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* 3. PWD Profile Declaration Form */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <UserCheck className="w-7 h-7 text-blue-600 shrink-0" />
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-heading">
              PWD Profile Declaration
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Information is stored locally on your device to tailor route planning and emergency contacts.
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Full Name:
              </label>
              <input
                type="text"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                className="w-full p-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Olongapo City PWD ID Number:
              </label>
              <input
                type="text"
                value={profileForm.pwdIdNumber}
                onChange={(e) => setProfileForm({ ...profileForm, pwdIdNumber: e.target.value })}
                placeholder="OCPWD-XXXX-XXXX"
                className="w-full p-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Primary Disability Type:
              </label>
              <select
                value={profileForm.disabilityType}
                onChange={(e) => setProfileForm({ ...profileForm, disabilityType: e.target.value as DisabilityType })}
                className="w-full p-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="wheelchair">Wheelchair User / Mobility Impaired</option>
                <option value="mobility">Physical / Mobility Impairment</option>
                <option value="visual">Visual Impairment / Blindness</option>
                <option value="hearing">Hearing Impairment / Deafness</option>
                <option value="cognitive">Cognitive / Learning Difficulty</option>
                <option value="senior">Senior Citizen with Mobility Needs</option>
                <option value="multiple">Multiple Disabilities</option>
                <option value="caregiver">Caregiver / Family Member</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Barangay Sta. Rita Zone:
              </label>
              <input
                type="text"
                value={profileForm.barangayZone}
                onChange={(e) => setProfileForm({ ...profileForm, barangayZone: e.target.value })}
                className="w-full p-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Mobility Aids Checklist */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Mobility Aids Used:
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'manual_wheelchair', label: '🦽 Manual Wheelchair' },
                { id: 'power_wheelchair', label: '⚡ Power Wheelchair' },
                { id: 'crutches', label: '🩼 Crutches' },
                { id: 'white_cane', label: '🦯 White Cane' },
                { id: 'walker', label: '🚶 Walker' },
                { id: 'guide_dog', label: '🦮 Guide Dog' },
              ].map(aid => {
                const isChecked = profileForm.mobilityAids.includes(aid.id as MobilityAid);
                return (
                  <button
                    key={aid.id}
                    type="button"
                    onClick={() => toggleMobilityAid(aid.id as MobilityAid)}
                    className={`px-3.5 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                      isChecked ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-50 text-slate-900 border-slate-300'
                    }`}
                  >
                    {aid.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accessibility Preferences */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Route Accessibility Preferences:
            </label>
            <div className="flex flex-wrap gap-2">
              {([
                { id: 'wheelchair_accessible', label: '♿ Wheelchair Accessible' },
                { id: 'avoid_stairs', label: '🚫 Avoid Stairs' },
                { id: 'avoid_steep_slopes', label: '⛰️ Avoid Steep Slopes' },
                { id: 'smooth_pathways', label: '🛤️ Smooth Pathways' },
                { id: 'accessible_crossings', label: '🚦 Accessible Crossings' },
                { id: 'rest_stops_frequent', label: '🪑 Frequent Rest Stops' },
                { id: 'shaded_paths', label: '🌳 Shaded Paths' },
                { id: 'shortest', label: '📏 Shortest Route' },
                { id: 'safest', label: '🛡️ Safest Route' },
                { id: 'least_difficult', label: '✅ Least Difficult' },
              ] as { id: AccessibilityPreference; label: string }[]).map(pref => {
                const isChecked = profileForm.preferences.includes(pref.id);
                return (
                  <button
                    key={pref.id}
                    type="button"
                    onClick={() => togglePreference(pref.id)}
                    className={`px-3.5 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                      isChecked ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-50 text-slate-900 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {pref.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Emergency Contact Person Name:
              </label>
              <input
                type="text"
                value={profileForm.emergencyContactName}
                onChange={(e) => setProfileForm({ ...profileForm, emergencyContactName: e.target.value })}
                className="w-full p-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Emergency Contact Phone Number:
              </label>
              <input
                type="text"
                value={profileForm.emergencyContactPhone}
                onChange={(e) => setProfileForm({ ...profileForm, emergencyContactPhone: e.target.value })}
                className="w-full p-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Save Profile Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-lg rounded-2xl border-2 border-blue-300 flex items-center justify-center gap-2 shadow-lg transition-all focus:ring-4 focus:ring-blue-300 focus:outline-none"
            >
              <Save className="w-5 h-5" />
              <span>SAVE PWD PROFILE DECLARATION</span>
            </button>
          </div>

          {profileSavedSuccess && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-400 text-emerald-950 font-bold rounded-2xl text-center">
              ✓ PWD Profile Declaration saved successfully!
            </div>
          )}

        </form>
      </div>

    </div>
  );
};
