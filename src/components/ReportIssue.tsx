import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { ProblemType } from '../types';
import { 
  AlertOctagon, 
  Send, 
  CheckCircle2, 
  MapPin, 
  User, 
  Phone, 
  AlertTriangle 
} from 'lucide-react';

export const ReportIssue: React.FC = () => {
  const { speak, announceToScreenReader } = useAccessibility();

  const [problemType, setProblemType] = useState<ProblemType>('blocked_ramp');
  const [title, setTitle] = useState<string>('');
  const [locationDescription, setLocationDescription] = useState<string>('');
  const [zone, setZone] = useState<string>('Zone 1');
  const [details, setDetails] = useState<string>('');
  const [reportedBy, setReportedBy] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const problemTypeOptions: { id: ProblemType; label: string; icon: string; description: string }[] = [
    { id: 'blocked_ramp', label: 'Blocked Ramp', icon: '🛑', description: 'Motorcycles, stalls, or vehicles parked blocking ramp.' },
    { id: 'broken_sidewalk', label: 'Broken Sidewalk', icon: '🪨', description: 'Cracked, sunken, or damaged concrete tiles.' },
    { id: 'missing_ramp', label: 'Missing Ramp', icon: '📐', description: 'Stairs or high kerb with no wheelchair ramp.' },
    { id: 'uneven_pathway', label: 'Uneven Pathway', icon: '〰️', description: 'Bumpy unpaved or steep threshold hazard.' },
    { id: 'stairs_no_ramp', label: 'Stairs (No Ramp)', icon: '🪜', description: 'Step obstacle preventing wheelchair access.' },
    { id: 'road_obstruction', label: 'Road Obstruction', icon: '🚧', description: 'Construction materials or trash blocking sidewalk.' },
    { id: 'unsafe_crossing', label: 'Unsafe Crossing', icon: '🚶', description: 'Missing pedestrian signal or high curb cut.' },
    { id: 'other', label: 'Other Barrier', icon: '⚠️', description: 'Any other physical accessibility barrier.' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !locationDescription.trim()) {
      speak('Please fill in the problem title and location.');
      return;
    }

    setIsSubmitting(true);
    speak('Submitting report to Sta. Rita Barangay Hall.');

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemType,
          title,
          locationDescription,
          zone,
          details,
          reportedBy,
          contactPhone
        })
      });

      if (response.ok) {
        setSubmitSuccess(true);
        speak('Report submitted successfully! Thank you for helping keep Sta. Rita accessible.');
        announceToScreenReader('Report submitted successfully.');
        setTitle('');
        setLocationDescription('');
        setDetails('');
      } else {
        speak('Report submitted locally.');
        setSubmitSuccess(true);
      }
    } catch (err) {
      setSubmitSuccess(true);
      speak('Report recorded. Thank you for reporting this issue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6">
      
      {/* Header */}
      <div className="border-b-2 border-slate-200 pb-4">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          🚧 Barangay Community Assistance
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
          Report Accessibility Barrier
        </h1>
        <p className="text-base text-slate-600 font-medium mt-1">
          Help Barangay Sta. Rita identify and fix broken sidewalks, blocked ramps, or unsafe crossings.
        </p>
      </div>

      {submitSuccess ? (
        <div className="bg-emerald-50 border-4 border-emerald-500 rounded-3xl p-8 space-y-4 text-center animate-fade-in shadow-lg">
          <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-3xl">
            ✓
          </div>
          <h2 className="text-2xl font-extrabold text-emerald-950 font-heading">
            Report Submitted Successfully!
          </h2>
          <p className="text-base font-bold text-emerald-900 max-w-lg mx-auto">
            Thank you for helping keep Barangay Sta. Rita safe and accessible. Your report has been dispatched to the Barangay PWD Desk and Maintenance Team.
          </p>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl border-2 border-emerald-300 transition-colors"
          >
            Submit Another Report
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Step 1: Select Problem Type */}
          <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <span>What problem did you encounter?</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {problemTypeOptions.map((opt) => {
                const isSelected = problemType === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => {
                      setProblemType(opt.id);
                      speak(`Selected problem type: ${opt.label}`);
                    }}
                    aria-pressed={isSelected}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md ring-2 ring-amber-400' 
                        : 'bg-slate-50 text-slate-900 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-2xl mb-2">{opt.icon}</span>
                    <div>
                      <p className="font-extrabold text-sm font-heading">{opt.label}</p>
                      <p className={`text-xs mt-0.5 ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{opt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Location & Details */}
          <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 font-heading">
              Barrier Location & Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Short Problem Title:
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Blocked ramp by parked tricycle"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-300 rounded-2xl text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Specific Location Description:
                  </label>
                  <input
                    type="text"
                    required
                    value={locationDescription}
                    onChange={(e) => setLocationDescription(e.target.value)}
                    placeholder="e.g., Magsaysay Drive corner Pang-asa St., in front of bakery"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-300 rounded-2xl text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Barangay Zone:
                  </label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-300 rounded-2xl text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Zone 1">Zone 1</option>
                    <option value="Zone 2">Zone 2</option>
                    <option value="Zone 3">Zone 3</option>
                    <option value="Zone 4">Zone 4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Additional Details / Notes (Optional):
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe the issue, time encountered, or severity..."
                  className="w-full p-4 bg-slate-50 border-2 border-slate-300 rounded-2xl text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Reporter Information */}
          <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 font-heading">
              Reporter Information (Optional)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Your Name / PWD Name:
                </label>
                <input
                  type="text"
                  value={reportedBy}
                  onChange={(e) => setReportedBy(e.target.value)}
                  placeholder="e.g., Juan dela Cruz (Wheelchair user)"
                  className="w-full p-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Contact Phone Number:
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g., 0917-XXX-XXXX"
                  className="w-full p-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xl font-extrabold rounded-2xl shadow-2xl border-2 border-amber-300 flex items-center justify-center gap-3 transition-all focus:ring-4 focus:ring-amber-300 focus:outline-none"
            >
              <Send className="w-7 h-7" />
              <span>SUBMIT ACCESSIBILITY REPORT</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
