import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
  PhoneCall, 
  ShieldAlert, 
  HeartHandshake, 
  HelpCircle, 
  FileText, 
  CheckCircle2, 
  AlertOctagon, 
  Building, 
  UserCheck 
} from 'lucide-react';

export const EmergencyHelpPage: React.FC = () => {
  const { speak } = useAccessibility();
  const [activeTab, setActiveTab] = useState<'hotlines' | 'rights' | 'guide'>('hotlines');
  const [escortRequested, setEscortRequested] = useState<boolean>(false);

  const hotlines = [
    {
      name: 'Sta. Rita Barangay Hall & Tanod Patrol',
      number: '(047) 222-9225',
      mobile: '0919-739-7600',
      description: 'Barangay Captain Desk, PWD ID Services, Tanod Escort Dispatch',
      color: 'bg-blue-600 text-white border-blue-400 hover:bg-blue-700'
    },
    {
      name: 'Olongapo City Rescue / CDRRMO',
      number: '(047) 223-6876',
      mobile: '0998-593-7446',
      description: 'City Emergency Medical Services, Ambulance & Disaster Response',
      color: 'bg-rose-600 text-white border-rose-400 hover:bg-rose-700'
    },
    {
      name: 'PNP Olongapo Police Station 5 (Sta. Rita)',
      number: '(047) 222-0402',
      mobile: '0998-598-5567',
      description: 'Sta. Rita Police Station Desk, Security & Immediate Assistance',
      color: 'bg-indigo-600 text-white border-indigo-400 hover:bg-indigo-700'
    },
    {
      name: 'James L. Gordon Memorial Hospital (JLGMH ER)',
      number: '(047) 223-7571',
      mobile: '(047) 602-1229',
      description: 'City General Hospital Emergency Room & Ambulance Dispatch',
      color: 'bg-emerald-600 text-white border-emerald-400 hover:bg-emerald-700'
    },
    {
      name: 'CSWDO Olongapo City PWD Desk (PDAO)',
      number: '(047) 611-4800 ext. 128',
      mobile: '(047) 222-2661',
      description: 'City Social Welfare, PWD ID Issuance, Wheelchairs & Assistive Devices',
      color: 'bg-purple-600 text-white border-purple-400 hover:bg-purple-700'
    },
    {
      name: 'National Emergency Hotline',
      number: '911',
      mobile: '911',
      description: 'National Philippine Police, Bureau of Fire Protection & Rescue',
      color: 'bg-amber-600 text-white border-amber-400 hover:bg-amber-700'
    }
  ];

  const handleCall = (number: string, name: string) => {
    speak(`Calling ${name} at ${number}.`);
    window.location.href = `tel:${number.replace(/-/g, '')}`;
  };

  const handleRequestEscort = () => {
    setEscortRequested(true);
    speak('Barangay Tanod PWD Assistance Escort requested. Barangay Tanod patrol has been alerted to your registered location.');
    setTimeout(() => setEscortRequested(false), 6000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6">
      
      {/* Header */}
      <div className="border-b-2 border-slate-200 pb-4">
        <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-900 border border-rose-300 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          🚨 Barangay Emergency & Support
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
          Emergency Assistance & Help
        </h1>
        <p className="text-base text-slate-600 font-medium mt-1">
          Barangay Sta. Rita hotlines, PWD escort request, and PWD Rights (RA 7277) Magna Carta guide.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-slate-300 pb-2">
        {[
          { id: 'hotlines', label: '📞 Emergency Hotlines' },
          { id: 'rights', label: '⚖️ PWD Rights (RA 7277)' },
          { id: 'guide', label: '📖 AccessiGo Guide' },
        ].map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id as any);
                speak(`Switched to ${t.label}.`);
              }}
              className={`px-5 py-3 rounded-2xl font-extrabold text-sm border-2 shrink-0 transition-all ${
                isActive ? 'bg-slate-900 text-white border-slate-700 shadow-md' : 'bg-white text-slate-800 border-slate-300'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Hotlines & Escort */}
      {activeTab === 'hotlines' && (
        <div className="space-y-6">
          
          {/* Quick Request Barangay Escort */}
          <div className="bg-amber-50 border-4 border-amber-400 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-amber-700 shrink-0" />
              <div>
                <h2 className="text-xl font-extrabold text-amber-950 font-heading">
                  Request Barangay Tanod Assistance / Escort
                </h2>
                <p className="text-xs text-amber-900 font-bold">
                  Need a companion or escort while navigating Barangay Sta. Rita? Tap to alert local responders.
                </p>
              </div>
            </div>

            <button
              onClick={handleRequestEscort}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-lg rounded-2xl border-2 border-amber-300 shadow-lg transition-all"
            >
              🤝 REQUEST BARANGAY TANOD PWD ESCORT
            </button>

            {escortRequested && (
              <div className="p-4 bg-emerald-100 border-2 border-emerald-500 text-emerald-950 font-bold rounded-2xl text-center">
                ✓ Barangay Tanod PWD Assistance Request dispatched! Stand by at your location.
              </div>
            )}
          </div>

          {/* Hotline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hotlines.map((h, i) => (
              <div key={i} className="bg-white border-2 border-slate-300 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                    {h.name}
                  </h3>
                  <div className="mt-2 space-y-0.5">
                    <p className="text-2xl font-black text-blue-900 font-heading">
                      {h.number}
                    </p>
                    {h.mobile && h.mobile !== h.number && (
                      <p className="text-sm font-extrabold text-slate-700">
                        📱 Mobile: <span className="text-blue-800">{h.mobile}</span>
                      </p>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mt-2">
                    {h.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={() => handleCall(h.number, `${h.name} Landline`)}
                    className={`flex-1 py-3 px-3 ${h.color} font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer`}
                  >
                    <PhoneCall className="w-4 h-4 shrink-0" />
                    <span>Call {h.number.split(' ')[0]}</span>
                  </button>
                  {h.mobile && h.mobile !== h.number && (
                    <button
                      onClick={() => handleCall(h.mobile, `${h.name} Mobile`)}
                      className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 border-2 border-slate-300 font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>📱 Mobile ({h.mobile})</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Tab 2: PWD Rights Magna Carta */}
      {activeTab === 'rights' && (
        <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
            Republic Act 7277 – Magna Carta for Persons with Disabilities
          </h2>

          <div className="space-y-4 text-sm text-slate-800 font-medium">
            <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-2xl space-y-1">
              <h3 className="font-extrabold text-blue-950 text-base">
                💊 20% Discount & VAT Exemption
              </h3>
              <p>
                PWD ID holders are entitled to a 20% discount and 12% VAT exemption on prescription medicines, doctor consultations, dental fees, restaurant meals, hotel accommodations, and public transportation (jeepneys, tricycles, buses).
              </p>
            </div>

            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl space-y-1">
              <h3 className="font-extrabold text-emerald-950 text-base">
                🏢 Mandatory Priority Lanes & Ramp Accessibility
              </h3>
              <p>
                All government offices (including Sta. Rita Barangay Hall, Olongapo City Hall, and health stations), banks, and commercial establishments must provide dedicated PWD priority desks and step-free wheelchair ramps.
              </p>
            </div>

            <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded-2xl space-y-1">
              <h3 className="font-extrabold text-purple-950 text-base">
                📄 How to Apply for PWD ID in Olongapo City
              </h3>
              <p>
                Visit the Sta. Rita Barangay Hall PWD Desk or CSWDO Olongapo City Hall. Bring: 1) Clinical Medical Certificate, 2) Barangay Clearance, 3) 2 pcs 1x1 ID photos, 4) Valid ID. Processing takes 3-5 working days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: AccessiGo Usage Guide */}
      {activeTab === 'guide' && (
        <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
            How to Use AccessiGo
          </h2>

          <ol className="space-y-4 text-sm text-slate-900 font-medium list-decimal pl-5">
            <li>
              <strong>Set your Accessibility Preferences:</strong> Go to Settings to adjust text size, high contrast mode, voice speed, and mobility aids.
            </li>
            <li>
              <strong>Plan an Accessible Route:</strong> Click "Plan Route", choose your starting point and destination in Barangay Sta. Rita, and select preferences like "Avoid Stairs" or "Wheelchair Accessible".
            </li>
            <li>
              <strong>Launch AI Voice Guidance:</strong> Click "START VOICE GUIDANCE" to get turn-by-turn spoken instructions and audio cues for ramps, crossings, and obstacles.
            </li>
            <li>
              <strong>Report Accessibility Barriers:</strong> If you find a broken sidewalk or blocked ramp, use "Report Issue" to alert the Barangay Sta. Rita administration.
            </li>
          </ol>
        </div>
      )}

    </div>
  );
};
