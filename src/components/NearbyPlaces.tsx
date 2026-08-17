import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { STA_RITA_LOCATIONS } from '../data/staRitaData';
import { LocationSpot, LocationCategory } from '../types';
import { 
  MapPin, 
  Search, 
  CheckCircle2, 
  Volume2, 
  Navigation as RouteIcon, 
  Phone, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

interface NearbyPlacesProps {
  onSelectPlaceForRoute?: (place: LocationSpot) => void;
}

export const NearbyPlaces: React.FC<NearbyPlacesProps> = ({ onSelectPlaceForRoute }) => {
  const { speak } = useAccessibility();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Places' },
    { id: 'facility', label: 'Barangay Facilities' },
    { id: 'health', label: 'Health Centers' },
    { id: 'school', label: 'Schools' },
    { id: 'restroom', label: 'Accessible WC' },
    { id: 'rest_spot', label: 'Rest Areas' },
    { id: 'establishment', label: 'Establishments' },
  ];

  const filteredPlaces = STA_RITA_LOCATIONS.filter(place => {
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6">
      
      {/* Header */}
      <div className="border-b-2 border-slate-200 pb-4">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          📍 Barangay Sta. Rita Directory
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
          Nearby Accessible Places
        </h1>
        <p className="text-base text-slate-600 font-medium mt-1">
          Discover verified PWD-friendly facilities, health centers, restrooms, and rest spots in Sta. Rita.
        </p>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search places in Sta. Rita (e.g. 'Health Center', 'Ramp', 'Restroom')..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-300 rounded-2xl text-base font-bold text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all shadow-sm"
          />
        </div>

        {/* Category Tabs */}
        <div aria-label="Location Categories" className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  speak(`Filtering by ${cat.label}.`);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold shrink-0 border-2 transition-all focus:ring-4 focus:ring-blue-300 focus:outline-none ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Places Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPlaces.map((place) => (
          <div
            key={place.id}
            className="bg-white border-2 border-slate-300 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              
              {/* Header Badges */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                  place.rating === 'highly_accessible'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {place.rating === 'highly_accessible' ? '♿ Wheelchair Accessible' : '🟡 Partial Access'}
                </span>

                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  📍 {place.distanceMeters || 250}m away
                </span>
              </div>

              {/* Title & Address */}
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                  {place.name}
                </h2>
                <p className="text-xs text-slate-600 font-bold mt-0.5">
                  {place.address}
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-1.5 pt-2">
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Available Accessibility Features:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {place.features.map((feat, idx) => (
                    <span key={idx} className="bg-slate-100 border border-slate-300 text-slate-800 text-xs px-2.5 py-1 rounded-lg font-bold">
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact / Operating Hours if present */}
              {(place.contactNumber || place.operatingHours) && (
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
                  {place.contactNumber && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-blue-600" /> {place.contactNumber}
                    </span>
                  )}
                  {place.operatingHours && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" /> {place.operatingHours}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
              <button
                onClick={() => speak(place.audioCueText)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl border-2 border-amber-300 flex items-center gap-1.5 transition-colors focus:ring-4 focus:ring-amber-300 focus:outline-none"
              >
                <Volume2 className="w-4 h-4 fill-current" />
                <span>Hear Description</span>
              </button>

              {onSelectPlaceForRoute && (
                <button
                  onClick={() => onSelectPlaceForRoute(place)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl border-2 border-blue-300 flex items-center gap-1.5 transition-colors focus:ring-4 focus:ring-blue-300 focus:outline-none ml-auto"
                >
                  <RouteIcon className="w-4 h-4" />
                  <span>Plan Route</span>
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
