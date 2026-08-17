import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { AccessibilityPreference, SavedLocation } from '../types';
import { STA_RITA_LOCATIONS } from '../data/staRitaData';
import { isAddressOutsideStaRitaName, validateLocationInStaRita } from '../utils/geofencing';
import { 
  MapPin, 
  Navigation as RouteIcon, 
  Check, 
  Sparkles, 
  Compass, 
  ShieldCheck, 
  ArrowRight, 
  Locate,
  Heart,
  Store,
  Home,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';

interface RoutePlannerProps {
  initialOrigin?: string;
  initialDestination?: string;
  onCalculateRoute: (origin: string, destination: string, preferences: AccessibilityPreference[]) => void;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({ 
  initialOrigin, 
  initialDestination, 
  onCalculateRoute 
}) => {
  const { speak, announceToScreenReader } = useAccessibility();

  const [startingPoint, setStartingPoint] = useState<string>(
    initialOrigin || 'Santa Rita Barangay Hall & LGU Center'
  );
  const [destination, setDestination] = useState<string>(
    initialDestination || 'Sta. Rita Barangay Health Station (BHS)'
  );
  const [customOriginInput, setCustomOriginInput] = useState<string>('');
  const [customDestInput, setCustomDestInput] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedLocations();
  }, []);

  // Sync initial props if provided from Map or Saved Routes
  useEffect(() => {
    if (initialOrigin) {
      setStartingPoint(initialOrigin);
      setCustomOriginInput(initialOrigin);
    }
    if (initialDestination) {
      setDestination(initialDestination);
      setCustomDestInput(initialDestination);
    }
  }, [initialOrigin, initialDestination]);

  // Validate locations whenever starting point or destination changes
  useEffect(() => {
    const effectiveOrigin = isCustomMode && customOriginInput ? customOriginInput : startingPoint;
    const effectiveDest = isCustomMode && customDestInput ? customDestInput : destination;

    if (!effectiveOrigin || !effectiveDest) {
      setValidationError("Please select both a starting point and a destination.");
    } else if (effectiveOrigin.trim().toLowerCase() === effectiveDest.trim().toLowerCase()) {
      setValidationError(`Starting point and destination cannot be the same location ("${effectiveOrigin}"). Please select a different destination or swap locations.`);
    } else if (isAddressOutsideStaRitaName(effectiveOrigin)) {
      setValidationError(`Starting point "${effectiveOrigin}" is outside the service area. AccessiGo currently provides accessible route planning only within Barangay Santa Rita, Olongapo City.`);
    } else if (isAddressOutsideStaRitaName(effectiveDest)) {
      setValidationError(`Destination "${effectiveDest}" is outside the service area. AccessiGo currently provides accessible route planning only within Barangay Santa Rita, Olongapo City.`);
    } else {
      setValidationError(null);
    }
  }, [startingPoint, destination, customOriginInput, customDestInput, isCustomMode]);

  const handleSwapLocations = () => {
    if (isCustomMode) {
      const temp = customOriginInput;
      setCustomOriginInput(customDestInput);
      setCustomDestInput(temp);
    }
    const tempSp = startingPoint;
    setStartingPoint(destination);
    setDestination(tempSp);
    speak("Swapped starting point and destination.");
  };

  const fetchSavedLocations = async () => {
    try {
      const res = await fetch('/api/saved-locations');
      if (res.ok) {
        const data = await res.json();
        setSavedLocations(data);
      }
    } catch (err) {
      // Fallback
      setSavedLocations([
        {
          id: 'loc_fav_1',
          name: "Aling Nena's Sari-Sari Store & Load Center",
          category: 'sari_sari_store',
          addressOrZone: 'Purok 2, Sta. Rita Main Road, Zone 2',
          zone: 'Zone 2',
          accessibilityNotes: 'Step-free entrance with wide sliding window and priority chair.',
          accessibilityTag: 'step_free',
          dateAdded: '2026-08-02'
        },
        {
          id: 'loc_fav_2',
          name: "Tita Maria's Residence (Neighbor)",
          category: 'neighbor_home',
          addressOrZone: 'House #45, Gordon Ave Ext, Zone 3',
          zone: 'Zone 3',
          accessibilityNotes: 'Flat cemented driveway and ground floor entrance.',
          accessibilityTag: 'flat_ground',
          dateAdded: '2026-08-04'
        }
      ]);
    }
  };

  const [selectedPreferences, setSelectedPreferences] = useState<AccessibilityPreference[]>([
    'wheelchair_accessible',
    'avoid_stairs',
    'smooth_pathways'
  ]);

  const preferenceOptions: { id: AccessibilityPreference; label: string; icon: string; description: string }[] = [
    {
      id: 'wheelchair_accessible',
      label: 'Wheelchair Accessible',
      icon: '♿',
      description: 'Prioritizes 100% step-free pavement with ramp access.'
    },
    {
      id: 'avoid_stairs',
      label: 'Avoid Stairs',
      icon: '🚫',
      description: 'Strictly excludes routes with step thresholds or staircases.'
    },
    {
      id: 'avoid_steep_slopes',
      label: 'Avoid Steep Slopes',
      icon: '📉',
      description: 'Keeps path inclines under 5% grade for manual wheelchair ease.'
    },
    {
      id: 'smooth_pathways',
      label: 'Smooth Pathways',
      icon: '🛣️',
      description: 'Prefers smooth paved concrete and avoids broken tiles.'
    },
    {
      id: 'accessible_crossings',
      label: 'Accessible Crossings',
      icon: '🚶',
      description: 'Uses signalized pedestrian crossings with curb ramps.'
    },
    {
      id: 'shortest',
      label: 'Shortest Route',
      icon: '⚡',
      description: 'Minimizes travel distance for low-stamina users.'
    },
    {
      id: 'safest',
      label: 'Safest Route',
      icon: '🛡️',
      description: 'Uses wide, well-lit sidewalks away from heavy traffic.'
    },
    {
      id: 'least_difficult',
      label: 'Least Difficult Route',
      icon: '🟢',
      description: 'Easiest navigation path with frequent rest spots.'
    }
  ];

  const togglePreference = (prefId: AccessibilityPreference, label: string) => {
    setSelectedPreferences(prev => {
      const exists = prev.includes(prefId);
      const updated = exists ? prev.filter(p => p !== prefId) : [...prev, prefId];
      speak(`${label} ${exists ? 'removed' : 'selected'}.`);
      return updated;
    });
  };

  const handleUseMyLocation = () => {
    setStartingPoint('📍 My Current GPS Location (Sta. Rita)');
    speak('Starting point set to your current GPS location.');
    announceToScreenReader('Starting point set to My Current Location.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveOrigin = isCustomMode && customOriginInput ? customOriginInput : startingPoint;
    const effectiveDest = isCustomMode && customDestInput ? customDestInput : destination;

    if (!effectiveOrigin || !effectiveDest) {
      speak('Please select both a starting point and a destination.');
      return;
    }
    if (effectiveOrigin.trim().toLowerCase() === effectiveDest.trim().toLowerCase()) {
      speak('Starting point and destination cannot be the same location.');
      return;
    }
    speak(`Finding accessible route from ${effectiveOrigin} to ${effectiveDest}.`);
    onCalculateRoute(effectiveOrigin, effectiveDest, selectedPreferences);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-5 lg:space-y-6">
      
      {/* Header */}
      <div className="border-b-2 border-slate-200 pb-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Strict Boundary: Barangay Sta. Rita, Olongapo City</span>
          </div>

          <span className="text-xs font-extrabold text-slate-700 bg-emerald-50 text-emerald-950 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Live OSM Data + GPS Active</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
          Plan Your Accessible Route
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563] font-medium">
          Coverage strictly limited to Barangay Sta. Rita, Olongapo City. Select starting point, destination, and PWD accessibility preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Validation Error Banner if Location Outside Service Area or Same Location */}
        {validationError && (
          <div role="alert" className="p-5 bg-red-50 border-2 border-red-400 rounded-3xl flex items-start gap-4 text-red-950 shadow-md">
            <ShieldAlert className="w-7 h-7 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base font-extrabold uppercase tracking-wide text-red-900">
                Route Calculation Notice
              </h3>
              <p className="text-sm font-semibold leading-relaxed">
                {validationError}
              </p>
            </div>
          </div>
        )}

        {/* Mode Switcher Toggle */}
        <div className="bg-slate-100 p-3 rounded-2xl border border-slate-300 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-700">Location Selection Mode:</span>
          <button
            type="button"
            onClick={() => {
              setIsCustomMode(!isCustomMode);
              speak(`Switched to ${!isCustomMode ? 'custom address search' : 'preset landmarks dropdown'} mode.`);
            }}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-[#1E3A8A] border-2 border-blue-200 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>{isCustomMode ? 'Switch to Preset Dropdowns' : 'Type Custom Address in Sta. Rita'}</span>
          </button>
        </div>

        {/* Grid for Steps 1 & 2 on Desktop Laptops and Monitors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch relative">
          
          {/* Step 1: Starting Point */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white font-black flex items-center justify-center text-lg">
                    1
                  </div>
                  <h2 className="text-xl font-extrabold text-[#111827]">
                    Starting Point
                  </h2>
                </div>

                {/* GPS Location Button */}
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] border-2 border-blue-200 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-colors focus:ring-4 focus:ring-blue-300 focus:outline-none cursor-pointer"
                >
                  <Locate className="w-4 h-4 text-[#1E3A8A]" />
                  <span>Use My Location</span>
                </button>
              </div>

              <label htmlFor="start_point_select" className="block text-sm font-bold text-[#111827]">
                Where are you starting?
              </label>

              {isCustomMode ? (
                <input
                  type="text"
                  value={customOriginInput}
                  onChange={(e) => setCustomOriginInput(e.target.value)}
                  placeholder="e.g., Purok 3 Santa Rita, Gordon Ave Extension..."
                  className="w-full p-4 bg-[#F3F4F6] border-2 border-slate-300 rounded-2xl text-base font-bold text-[#111827] focus:border-[#1E3A8A] focus:ring-4 focus:ring-blue-200 focus:outline-none transition-all"
                />
              ) : (
                <select
                  id="start_point_select"
                  value={startingPoint}
                  onChange={(e) => setStartingPoint(e.target.value)}
                  className="w-full p-4 bg-[#F3F4F6] border-2 border-slate-300 rounded-2xl text-base font-bold text-[#111827] focus:border-[#1E3A8A] focus:ring-4 focus:ring-blue-200 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="📍 My Current GPS Location (Sta. Rita)">📍 My Current GPS Location (Sta. Rita)</option>
                  {savedLocations.length > 0 && (
                    <optgroup label="⭐ Saved Favorite Spots (Stores / Neighbors)">
                      {savedLocations.map(loc => (
                        <option key={loc.id} value={loc.name}>
                          ⭐ {loc.name} ({loc.zone})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="🏛️ Barangay Sta. Rita Key Facilities">
                    {STA_RITA_LOCATIONS.map(loc => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name} ({loc.zone})
                      </option>
                    ))}
                  </optgroup>
                </select>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSwapLocations}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-blue-50 text-[#1E3A8A] border-2 border-[#1E3A8A] rounded-2xl font-black text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-98 focus:ring-4 focus:ring-blue-300 focus:outline-none cursor-pointer"
              >
                <RouteIcon className="w-4 h-4 text-[#1E3A8A] rotate-90" />
                <span>Swap Starting Point ⇆ Destination</span>
              </button>
            </div>
          </div>

          {/* Step 2: Destination */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white font-black flex items-center justify-center text-lg">
                    2
                  </div>
                  <h2 className="text-xl font-extrabold text-[#111827]">
                    Destination
                  </h2>
                </div>
                {savedLocations.length > 0 && (
                  <span className="text-xs font-black text-purple-900 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                    ⭐ {savedLocations.length} Saved Frequent Spots
                  </span>
                )}
              </div>

              <label htmlFor="destination_select" className="block text-sm font-bold text-[#111827]">
                Where do you want to go?
              </label>

              {/* Quick Tap Popular Landmarks Strip */}
              <div className="space-y-1.5">
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Quick Select Popular Sta. Rita Spot:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Sta. Rita Barangay Health Station (BHS)', label: '🏥 Health Station (BHS)' },
                    { name: 'Santa Rita Barangay Hall & LGU Center', label: '🏛️ Barangay Hall' },
                    { name: 'Santa Rita de Cascia Parish Church', label: '⛪ Parish Church' },
                    { name: 'Santa Rita Elementary School', label: '🏫 Elementary School' },
                    { name: 'Sta. Rita High School', label: '🎓 High School & SNED' },
                    { name: 'Sta. Rita Public Market & Plaza', label: '🛒 Public Market' }
                  ].map(spot => {
                    const isSelected = (isCustomMode ? customDestInput : destination) === spot.name;
                    return (
                      <button
                        type="button"
                        key={spot.name}
                        onClick={() => {
                          setDestination(spot.name);
                          setCustomDestInput(spot.name);
                          speak(`Destination set to ${spot.name}.`);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm ring-2 ring-blue-300'
                            : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <span>{spot.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Tap Saved Favorites Strip */}
              {savedLocations.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Quick Select Saved Favorite:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {savedLocations.map(loc => (
                      <button
                        type="button"
                        key={loc.id}
                        onClick={() => {
                          setDestination(loc.name);
                          setCustomDestInput(loc.name);
                          speak(`Destination set to ${loc.name}.`);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                          (isCustomMode ? customDestInput : destination) === loc.name
                            ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm ring-2 ring-blue-300'
                            : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <span>⭐ {loc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isCustomMode ? (
                <input
                  type="text"
                  value={customDestInput}
                  onChange={(e) => setCustomDestInput(e.target.value)}
                  placeholder="e.g., Santa Rita High School, Tabacuhan Elementary..."
                  className="w-full p-4 bg-[#F3F4F6] border-2 border-slate-300 rounded-2xl text-base font-bold text-[#111827] focus:border-[#1E3A8A] focus:ring-4 focus:ring-blue-200 focus:outline-none transition-all"
                />
              ) : (
                <select
                  id="destination_select"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full p-4 bg-[#F3F4F6] border-2 border-slate-300 rounded-2xl text-base font-bold text-[#111827] focus:border-[#1E3A8A] focus:ring-4 focus:ring-blue-200 focus:outline-none transition-all cursor-pointer"
                >
                  {savedLocations.length > 0 && (
                    <optgroup label="⭐ Saved Favorite Spots (Stores / Neighbors)">
                      {savedLocations.map(loc => (
                        <option key={loc.id} value={loc.name}>
                          ⭐ {loc.name} ({loc.zone})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="🏛️ Barangay Sta. Rita Key Facilities">
                    {STA_RITA_LOCATIONS.map(loc => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name} ({loc.zone})
                      </option>
                    ))}
                  </optgroup>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Accessibility Preferences */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white font-black flex items-center justify-center text-lg">
              3
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#111827]">
                Accessibility Preferences
              </h2>
              <p className="text-xs text-[#4B5563] font-medium">
                Select options tailored to your mobility aids and needs.
              </p>
            </div>
          </div>

          {/* Large Selectable Preferences Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {preferenceOptions.map((opt) => {
              const isSelected = selectedPreferences.includes(opt.id);
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => togglePreference(opt.id, opt.label)}
                  aria-pressed={isSelected}
                  className={`p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-4 cursor-pointer focus:ring-4 focus:ring-blue-300 focus:outline-none ${
                    isSelected 
                      ? 'bg-blue-50 border-[#1E3A8A] shadow-md ring-2 ring-blue-500/20' 
                      : 'bg-[#F3F4F6] border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0 ${isSelected ? 'bg-[#1E3A8A] text-white' : 'bg-slate-200'}`}>
                    {isSelected ? <Check className="w-5 h-5 text-white stroke-[3]" /> : opt.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-base font-extrabold ${isSelected ? 'text-[#1E3A8A]' : 'text-[#111827]'}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-[#4B5563] mt-1 font-medium leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prominent Core Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!!validationError}
            className={`w-full py-6 text-2xl font-black rounded-3xl shadow-xl flex items-center justify-center gap-3 transition-all focus:outline-none ${
              validationError
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed ring-0 shadow-none'
                : 'bg-[#1E3A8A] hover:bg-blue-900 text-white ring-8 ring-blue-100 cursor-pointer'
            }`}
          >
            <Compass className={`w-8 h-8 ${validationError ? '' : 'animate-spin-slow'}`} />
            <span>{validationError ? 'LOCATION OUTSIDE SERVICE AREA' : 'FIND ACCESSIBLE ROUTE'}</span>
            <ArrowRight className="w-7 h-7" />
          </button>
        </div>

      </form>
    </div>
  );
};
