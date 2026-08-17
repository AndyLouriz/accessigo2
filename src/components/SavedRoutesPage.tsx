import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { SavedRoute, SavedLocation, CustomLocationCategory } from '../types';
import { SAMPLE_ROUTE_OPTIONS } from '../data/staRitaData';
import { 
  Bookmark, 
  Play, 
  Trash2, 
  Share2, 
  Clock, 
  Ruler, 
  Navigation as RouteIcon,
  MapPin,
  Plus,
  Heart,
  Phone,
  User,
  ShieldCheck,
  Store,
  Home,
  Utensils,
  Car,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface SavedRoutesPageProps {
  onStartRoute: (route: any) => void;
  onPlanRouteToLocation?: (locationName: string) => void;
}

export const SavedRoutesPage: React.FC<SavedRoutesPageProps> = ({ 
  onStartRoute,
  onPlanRouteToLocation 
}) => {
  const { speak } = useAccessibility();

  const [activeTab, setActiveTab] = useState<'locations' | 'routes'>('locations');
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [loadingRouteId, setLoadingRouteId] = useState<string | null>(null);


  // Saved Locations state
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Location Form State
  const [newName, setNewName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<CustomLocationCategory>('sari_sari_store');
  const [newZone, setNewZone] = useState<string>('Zone 2');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newTag, setNewTag] = useState<'step_free' | 'has_ramp' | 'flat_ground' | 'needs_assistance'>('step_free');
  const [newContactPerson, setNewContactPerson] = useState<string>('');
  const [newContactPhone, setNewContactPhone] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');

  // Saved Routes State
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [sharedNotice, setSharedNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedLocations();
    fetchSavedRoutes();
  }, []);

  const fetchSavedLocations = async () => {
    try {
      const response = await fetch('/api/saved-locations');
      if (response.ok) {
        const data = await response.json();
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
          contactPerson: 'Aling Nena',
          contactPhone: '0918-123-4567',
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
          contactPerson: 'Tita Maria Santos',
          contactPhone: '0920-987-6543',
          dateAdded: '2026-08-04'
        },
        {
          id: 'loc_fav_3',
          name: 'Kanto Fresh Bakery & Pandesal',
          category: 'bakery_food',
          addressOrZone: 'Church Road corner Main Rd, Zone 2',
          zone: 'Zone 2',
          accessibilityNotes: 'Concrete entrance ramp with low order counter.',
          accessibilityTag: 'has_ramp',
          contactPerson: 'Kuya Boyet',
          dateAdded: '2026-08-06'
        }
      ]);
    }
  };

  const fetchSavedRoutes = async () => {
    try {
      const response = await fetch('/api/saved-routes');
      if (response.ok) {
        const data = await response.json();
        setSavedRoutes(data);
      }
    } catch (err) {
      setSavedRoutes([
        {
          id: 'saved_1',
          name: 'Daily Barangay Hall & Health Center Visit',
          originName: 'Sta. Rita Barangay Hall',
          destinationName: 'Sta. Rita Barangay Health Station',
          estimatedTime: '12 mins',
          distance: '0.85 km',
          dateSaved: '2026-08-05',
          preferencesUsed: ['Wheelchair Accessible', 'Avoid Stairs', 'Smooth Pathways']
        },
        {
          id: 'saved_2',
          name: 'Sunday Mass at Sta. Rita Parish Church',
          originName: 'Sta. Rita Plaza',
          destinationName: 'Sta. Rita de Cascia Parish Church',
          estimatedTime: '6 mins',
          distance: '0.45 km',
          dateSaved: '2026-08-01',
          preferencesUsed: ['Wheelchair Accessible', 'Accessible Crossings']
        }
      ]);
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) {
      speak('Please enter a location name.');
      return;
    }

    const payload = {
      name: newName,
      category: newCategory,
      zone: newZone,
      addressOrZone: newAddress || `${newZone}, Sta. Rita, Olongapo City`,
      accessibilityTag: newTag,
      contactPerson: newContactPerson,
      contactPhone: newContactPhone,
      accessibilityNotes: newNotes
    };

    try {
      const res = await fetch('/api/saved-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        setSavedLocations(prev => [created, ...prev]);
      } else {
        // Fallback local add
        const fallback = {
          ...payload,
          id: `loc_fav_${Date.now()}`,
          dateAdded: new Date().toISOString().split('T')[0]
        };
        setSavedLocations(prev => [fallback, ...prev]);
      }
    } catch (err) {
      const fallback = {
        ...payload,
        id: `loc_fav_${Date.now()}`,
        dateAdded: new Date().toISOString().split('T')[0]
      };
      setSavedLocations(prev => [fallback, ...prev]);
    }

    speak(`Added ${newName} to your saved favorite locations!`);
    setShowAddModal(false);

    // Reset form
    setNewName('');
    setNewAddress('');
    setNewContactPerson('');
    setNewContactPhone('');
    setNewNotes('');
  };

  const handleDeleteLocation = async (id: string, name: string) => {
    try {
      await fetch(`/api/saved-locations/${id}`, { method: 'DELETE' });
    } catch (err) {}
    setSavedLocations(prev => prev.filter(l => l.id !== id));
    speak(`Deleted ${name} from saved locations.`);
  };

  const handleDeleteRoute = async (id: string, name: string) => {
    try {
      await fetch(`/api/saved-routes/${id}`, { method: 'DELETE' });
    } catch (err) {}
    setSavedRoutes(prev => prev.filter(r => r.id !== id));
    speak(`Deleted ${name} from saved routes.`);
  };

  const handleShare = (name: string) => {
    const text = `AccessiGo Share: Check out this accessible destination in Barangay Sta. Rita: "${name}". Created with AccessiGo PWD Route Planner.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setSharedNotice(`Copied share link for "${name}" to clipboard!`);
      speak(`Share link copied to clipboard.`);
      setTimeout(() => setSharedNotice(null), 4000);
    }
  };

  const getCategoryIcon = (category: CustomLocationCategory) => {
    switch (category) {
      case 'sari_sari_store':
        return <Store className="w-5 h-5 text-amber-600" />;
      case 'neighbor_home':
        return <Home className="w-5 h-5 text-blue-600" />;
      case 'bakery_food':
        return <Utensils className="w-5 h-5 text-orange-600" />;
      case 'transport_stop':
        return <Car className="w-5 h-5 text-emerald-600" />;
      default:
        return <MapPin className="w-5 h-5 text-purple-600" />;
    }
  };

  const getTagBadge = (tag: string) => {
    switch (tag) {
      case 'step_free':
        return <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs px-2.5 py-1 rounded-full font-black flex items-center gap-1">♿ 100% Step-Free</span>;
      case 'has_ramp':
        return <span className="bg-blue-100 text-blue-900 border border-blue-300 text-xs px-2.5 py-1 rounded-full font-black flex items-center gap-1">📐 Wheelchair Ramp</span>;
      case 'flat_ground':
        return <span className="bg-purple-100 text-purple-900 border border-purple-300 text-xs px-2.5 py-1 rounded-full font-black flex items-center gap-1">🟢 Flat Cement Pathway</span>;
      case 'needs_assistance':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs px-2.5 py-1 rounded-full font-black flex items-center gap-1">⚠️ Minor Threshold / Call Ahead</span>;
      default:
        return <span className="bg-slate-100 text-slate-900 border border-slate-300 text-xs px-2.5 py-1 rounded-full font-black">📍 Verified Accessible</span>;
    }
  };

  const filteredLocations = filterCategory === 'all' 
    ? savedLocations 
    : savedLocations.filter(l => l.category === filterCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6">
      
      {/* Header */}
      <div className="border-b-2 border-slate-200 pb-4">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-900 border border-purple-300 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2">
          ⭐ Saved Frequent Destinations & Itineraries
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827]">
          Saved Spots & Routes
        </h1>
        <p className="text-base text-[#4B5563] font-medium mt-1">
          Barangay Sta. Rita, Olongapo City · Save your favorite sari-sari stores, neighbors' houses, and frequent routes for instant navigation.
        </p>
      </div>

      {sharedNotice && (
        <div className="p-4 bg-emerald-100 border-2 border-emerald-400 text-emerald-950 font-bold rounded-2xl text-center">
          ✓ {sharedNotice}
        </div>
      )}

      {/* Main Tab Switcher */}
      <div className="flex border-b-2 border-slate-200 gap-2">
        <button
          onClick={() => {
            setActiveTab('locations');
            speak('Viewing saved favorite locations.');
          }}
          className={`pb-3 px-5 text-sm sm:text-base font-extrabold transition-all flex items-center gap-2 border-b-4 -mb-[2px] cursor-pointer ${
            activeTab === 'locations'
              ? 'border-[#1E3A8A] text-[#1E3A8A]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          <span>Favorite Locations ({savedLocations.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('routes');
            speak('Viewing saved routes.');
          }}
          className={`pb-3 px-5 text-sm sm:text-base font-extrabold transition-all flex items-center gap-2 border-b-4 -mb-[2px] cursor-pointer ${
            activeTab === 'routes'
              ? 'border-[#1E3A8A] text-[#1E3A8A]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-5 h-5 text-purple-600" />
          <span>Saved Routes ({savedRoutes.length})</span>
        </button>
      </div>

      {/* TAB 1: SAVED FREQUENT LOCATIONS */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-sm">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase text-slate-700 mr-1">
                Category:
              </span>
              {[
                { id: 'all', label: 'All Places' },
                { id: 'sari_sari_store', label: '🏪 Stores' },
                { id: 'neighbor_home', label: '🏠 Neighbors' },
                { id: 'bakery_food', label: '🥖 Bakery' },
                { id: 'transport_stop', label: '🛺 Tricycle' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterCategory(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterCategory === f.id
                      ? 'bg-[#1E3A8A] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Add New Location Button */}
            <button
              onClick={() => {
                setShowAddModal(true);
                speak('Opening form to save new location.');
              }}
              className="px-5 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Add Frequent Location</span>
            </button>
          </div>

          {/* Locations Grid */}
          {filteredLocations.length === 0 ? (
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-10 text-center space-y-4">
              <Store className="w-14 h-14 text-slate-400 mx-auto" />
              <h3 className="text-xl font-extrabold text-slate-900">
                No Favorite Spots Saved in this Category
              </h3>
              <p className="text-sm text-slate-600 font-medium max-w-md mx-auto">
                Save your frequently visited sari-sari store, neighbor's house, or bakery in Sta. Rita for 1-tap route planning!
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-[#1E3A8A] text-white font-extrabold rounded-xl text-xs inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Save First Location
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="bg-white border-2 border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          {getCategoryIcon(loc.category)}
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-[#1E3A8A] tracking-wider block">
                            {loc.zone} · Barangay Sta. Rita
                          </span>
                          <h3 className="text-lg font-extrabold text-[#111827] leading-snug">
                            {loc.name}
                          </h3>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteLocation(loc.id, loc.name)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete saved spot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{loc.addressOrZone}</span>
                    </p>

                    {/* Accessibility Badge */}
                    <div>
                      {getTagBadge(loc.accessibilityTag)}
                    </div>

                    {/* Notes & Contact */}
                    {loc.accessibilityNotes && (
                      <p className="text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 font-medium italic">
                        "{loc.accessibilityNotes}"
                      </p>
                    )}

                    {(loc.contactPerson || loc.contactPhone) && (
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-700 pt-1">
                        {loc.contactPerson && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-500" /> {loc.contactPerson}
                          </span>
                        )}
                        {loc.contactPhone && (
                          <a href={`tel:${loc.contactPhone}`} className="flex items-center gap-1 text-[#1E3A8A] underline">
                            <Phone className="w-3.5 h-3.5" /> {loc.contactPhone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick Action Button */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        if (onPlanRouteToLocation) {
                          onPlanRouteToLocation(loc.name);
                        }
                      }}
                      className="w-full py-3 bg-[#1E3A8A] hover:bg-blue-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md transition-all cursor-pointer"
                    >
                      <RouteIcon className="w-4 h-4" />
                      <span>PLAN ACCESSIBLE ROUTE HERE</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: SAVED ROUTE ITINERARIES */}
      {activeTab === 'routes' && (
        <div className="space-y-4">
          {savedRoutes.length === 0 ? (
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-12 text-center space-y-4">
              <Bookmark className="w-16 h-16 text-slate-400 mx-auto" />
              <h2 className="text-2xl font-extrabold text-slate-800 font-heading">
                No Saved Routes Yet
              </h2>
              <p className="text-slate-600 font-medium max-w-md mx-auto">
                When you search for routes in the Accessible Route Planner, click "Save Route" to keep them here for quick 1-tap access!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedRoutes.map((saved) => (
                <div
                  key={saved.id}
                  className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                        {saved.name}
                      </h2>
                      <p className="text-sm font-extrabold text-[#1E3A8A] mt-0.5">
                        {saved.originName} ➔ {saved.destinationName}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-[#1E3A8A]" /> {saved.estimatedTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Ruler className="w-4 h-4 text-emerald-600" /> {saved.distance}
                      </span>
                    </div>
                  </div>

                  {/* Preferences Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {saved.preferencesUsed.map((pref, idx) => (
                      <span key={idx} className="bg-purple-50 text-purple-900 border border-purple-200 text-xs px-2.5 py-1 rounded-lg font-bold">
                        ♿ {pref}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                    <button
                      onClick={async () => {
                        speak(`Calculating route for ${saved.name}.`);
                        setIsLoadingRoute(true);
                        setLoadingRouteId(saved.id);
                        try {
                          const response = await fetch('/api/routes/calculate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              origin: saved.originName,
                              destination: saved.destinationName,
                              preferences: saved.preferencesUsed || []
                            })
                          });
                          if (response.ok) {
                            const data = await response.json();
                            const route = data.routes?.[0] || SAMPLE_ROUTE_OPTIONS[0];
                            speak(`Launching voice guidance for ${saved.name}.`);
                            onStartRoute(route);
                          } else {
                            // Fallback to sample route with correct metadata
                            const fallback = {
                              ...SAMPLE_ROUTE_OPTIONS[0],
                              title: saved.name,
                            };
                            speak(`Launching voice guidance for ${saved.name}.`);
                            onStartRoute(fallback);
                          }
                        } catch {
                          speak(`Launching voice guidance for ${saved.name}.`);
                          onStartRoute(SAMPLE_ROUTE_OPTIONS[0]);
                        } finally {
                          setIsLoadingRoute(false);
                          setLoadingRouteId(null);
                        }
                      }}
                      disabled={isLoadingRoute && loadingRouteId === saved.id}
                      aria-label={`Start voice navigation for ${saved.name}: from ${saved.originName} to ${saved.destinationName}`}
                      className="px-6 py-3 bg-[#1E3A8A] hover:bg-blue-900 text-white font-extrabold rounded-2xl flex items-center gap-2 text-sm transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      <span>START VOICE NAVIGATION</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShare(saved.name)}
                        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 flex items-center gap-1 text-xs cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>

                      <button
                        onClick={() => handleDeleteRoute(saved.id, saved.name)}
                        className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-300 flex items-center gap-1 text-xs cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD NEW FREQUENT LOCATION */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-8 w-full max-w-lg space-y-6 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2 text-[#1E3A8A]">
                <Store className="w-6 h-6" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#111827]">
                  Save Frequent Location
                </h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="space-y-4">
              
              <div>
                <label className="block text-xs font-extrabold uppercase text-[#111827] mb-1">
                  Location Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Aling Rosa's Sari-Sari Store or Tita Maria's House"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-3.5 bg-[#F3F4F6] border-2 border-slate-300 rounded-2xl text-sm font-bold text-[#111827] focus:border-[#1E3A8A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-[#111827] mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CustomLocationCategory)}
                    className="w-full p-3 bg-[#F3F4F6] border-2 border-slate-300 rounded-2xl text-sm font-bold text-[#111827] focus:border-[#1E3A8A] focus:outline-none"
                  >
                    <option value="sari_sari_store">🏪 Sari-Sari Store</option>
                    <option value="neighbor_home">🏠 Neighbor / Family</option>
                    <option value="bakery_food">🥖 Bakery / Eatery</option>
                    <option value="transport_stop">🛺 Tricycle Terminal</option>
                    <option value="landmark">📍 Local Landmark</option>
                    <option value="other">📌 Other Place</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-[#111827] mb-1">
                    Barangay Zone
                  </label>
                  <select
                    value={newZone}
                    onChange={(e) => setNewZone(e.target.value)}
                    className="w-full p-3 bg-[#F3F4F6] border-2 border-slate-300 rounded-2xl text-sm font-bold text-[#111827] focus:border-[#1E3A8A] focus:outline-none"
                  >
                    <option value="Zone 1">Zone 1 (Barangay Hall area)</option>
                    <option value="Zone 2">Zone 2 (Health Center / Church)</option>
                    <option value="Zone 3">Zone 3 (Elementary School / Gordon Ext)</option>
                    <option value="Zone 4">Zone 4 (Public Market area)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-[#111827] mb-1">
                  Purok / Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g., Purok 2, Gordon Avenue Extension"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full p-3 bg-[#F3F4F6] border-2 border-slate-300 rounded-2xl text-sm font-bold text-[#111827] focus:border-[#1E3A8A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-[#111827] mb-1">
                  Accessibility Entrance Feature
                </label>
                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value as any)}
                  className="w-full p-3 bg-[#F3F4F6] border-2 border-slate-300 rounded-2xl text-sm font-bold text-[#111827] focus:border-[#1E3A8A] focus:outline-none"
                >
                  <option value="step_free">♿ 100% Step-Free Entrance</option>
                  <option value="has_ramp">📐 Wheelchair Ramp Available</option>
                  <option value="flat_ground">🟢 Flat Cement Pathway</option>
                  <option value="needs_assistance">⚠️ Minor Threshold / Call Ahead</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-[#111827] mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Aling Nena"
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    className="w-full p-3 bg-[#F3F4F6] border-2 border-slate-300 rounded-2xl text-sm font-bold text-[#111827] focus:border-[#1E3A8A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-[#111827] mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 0918-123-4567"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full p-3 bg-[#F3F4F6] border-2 border-slate-300 rounded-2xl text-sm font-bold text-[#111827] focus:border-[#1E3A8A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-[#111827] mb-1">
                  Accessibility & Arrival Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Wide sliding store window, shady seating chair available."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-3 bg-[#F3F4F6] border-2 border-slate-300 rounded-2xl text-sm font-bold text-[#111827] focus:border-[#1E3A8A] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 bg-slate-200 text-slate-800 font-bold rounded-xl text-xs hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#1E3A8A] hover:bg-blue-900 text-white font-extrabold rounded-xl text-xs shadow-md"
                >
                  Save Location
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
