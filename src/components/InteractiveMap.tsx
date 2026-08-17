import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import LineString from 'ol/geom/LineString';
import { fromLonLat } from 'ol/proj';
import { Style, Stroke, Fill, Icon, Text } from 'ol/style';
import Overlay from 'ol/Overlay';

import { useAccessibility } from '../context/AccessibilityContext';
import { STA_RITA_CENTER, STA_RITA_LOCATIONS, STA_RITA_KEY_ROADS, KeyRoadInfo } from '../data/staRitaData';
import { LocationSpot, LocationCategory } from '../types';
import { BARANGAY_STA_RITA_POLYGON, isPointInStaRita } from '../utils/geofencing';
import { 
  Filter, 
  Volume2, 
  Navigation as RouteIcon, 
  MapPin, 
  Compass, 
  CheckCircle2, 
  ShieldCheck,
  ShieldAlert,
  Locate,
  X,
  ExternalLink,
  Info
} from 'lucide-react';

interface InteractiveMapProps {
  onSelectLocationForRoute?: (loc: LocationSpot) => void;
}

// OpenLayers SVG Data URL Marker Generator
function createSpotSvgDataUrl(spot: LocationSpot): string {
  let iconChar = '♿';
  let bgColor = '#059669'; // Emerald
  let borderColor = '#ffffff';

  if (spot.category === 'facility') {
    iconChar = '🏛️';
    bgColor = '#1e3a8a'; // Navy
  } else if (spot.category === 'health') {
    iconChar = '🏥';
    bgColor = '#0284c7'; // Sky Blue
  } else if (spot.category === 'restroom') {
    iconChar = '🚻';
    bgColor = '#2563eb'; // Blue
  } else if (spot.category === 'rest_spot') {
    iconChar = '💺';
    bgColor = '#7c3aed'; // Purple
  } else if (spot.rating === 'partially_accessible') {
    iconChar = '🟡';
    bgColor = '#d97706'; // Amber
  } else if (spot.rating === 'limited_access' || spot.rating === 'inaccessible') {
    iconChar = '⛔';
    bgColor = '#dc2626'; // Red
  }

  const size = 38;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${bgColor}" stroke="${borderColor}" stroke-width="2.5"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="18">${iconChar}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// User GPS Pin Data URL
function createGpsSvgDataUrl(inside: boolean): string {
  const size = 32;
  const color = inside ? '#2563eb' : '#dc2626';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 3}" fill="${color}" stroke="#ffffff" stroke-width="3"/>
    <circle cx="${size/2}" cy="${size/2}" r="5" fill="#ffffff"/>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ onSelectLocationForRoute }) => {
  const { speak, announceToScreenReader } = useAccessibility();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const popupContainerRef = useRef<HTMLDivElement>(null);

  const mapInstanceRef = useRef<Map | null>(null);
  const spotsVectorSourceRef = useRef<VectorSource | null>(null);
  const gpsVectorSourceRef = useRef<VectorSource | null>(null);
  const overlayRef = useRef<Overlay | null>(null);

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedSpot, setSelectedSpot] = useState<LocationSpot | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isOutsideServiceArea, setIsOutsideServiceArea] = useState<boolean>(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  // Watch User Live Location
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          const accuracy = pos.coords.accuracy;
          setGpsAccuracy(Math.round(accuracy));
          setUserLocation(coords);

          // Check if user is inside Barangay Santa Rita boundary
          const inside = isPointInStaRita(coords[0], coords[1]);
          if (!inside && !isOutsideServiceArea) {
            setIsOutsideServiceArea(true);
            speak("You have left the AccessiGo service area.");
          } else if (inside && isOutsideServiceArea) {
            setIsOutsideServiceArea(false);
            speak("Welcome back inside Barangay Santa Rita service area.");
          }
        },
        (err) => {
          console.warn("GPS tracking warning:", err);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isOutsideServiceArea]);

  // Initialize OpenLayers Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Vector sources
      const boundarySource = new VectorSource();
      const roadsSource = new VectorSource();
      const spotsSource = new VectorSource();
      const gpsSource = new VectorSource();

      spotsVectorSourceRef.current = spotsSource;
      gpsVectorSourceRef.current = gpsSource;

      // 0. Boundary Polygon Feature
      const polyCoords = BARANGAY_STA_RITA_POLYGON.map(([lat, lng]) => fromLonLat([lng, lat]));
      const boundaryFeature = new Feature({
        geometry: new Polygon([polyCoords])
      });
      boundaryFeature.setStyle(new Style({
        stroke: new Stroke({
          color: '#1E3A8A',
          width: 3.5,
          lineDash: [8, 8]
        }),
        fill: new Fill({
          color: 'rgba(37, 99, 235, 0.08)'
        })
      }));
      boundarySource.addFeature(boundaryFeature);

      // Add Key Roads Features (Tabacuhan Road, Santa Rita Road, Balic-Balic Road, Filtration Road, Del Rosario Street)
      STA_RITA_KEY_ROADS.forEach(road => {
        const lineCoords = road.coordinates.map(([lat, lng]) => fromLonLat([lng, lat]));
        const roadFeature = new Feature({
          geometry: new LineString(lineCoords),
          roadData: road
        });

        roadFeature.setStyle(new Style({
          stroke: new Stroke({
            color: road.id === 'tabacuhan_rd' ? '#D97706' : '#2563EB',
            width: 6
          }),
          text: new Text({
            text: road.name,
            font: 'bold 12px sans-serif',
            fill: new Fill({ color: '#1E3A8A' }),
            stroke: new Stroke({ color: '#FFFFFF', width: 3 }),
            placement: 'line',
            repeat: 300
          })
        }));

        roadsSource.addFeature(roadFeature);
      });

      // Layers
      const tileLayer = new TileLayer({
        source: new XYZ({
          url: 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          attributions: '© OpenStreetMap contributors, © CARTO'
        })
      });

      const boundaryLayer = new VectorLayer({ source: boundarySource });
      const roadsLayer = new VectorLayer({ source: roadsSource });
      const spotsLayer = new VectorLayer({ source: spotsSource });
      const gpsLayer = new VectorLayer({ source: gpsSource });

      // OpenLayers Popup Overlay
      const popupOverlay = new Overlay({
        element: popupContainerRef.current!,
        autoPan: { animation: { duration: 250 } },
        positioning: 'bottom-center',
        offset: [0, -20]
      });
      overlayRef.current = popupOverlay;

      const map = new Map({
        target: mapContainerRef.current,
        layers: [tileLayer, boundaryLayer, roadsLayer, spotsLayer, gpsLayer],
        overlays: [popupOverlay],
        view: new View({
          center: fromLonLat([STA_RITA_CENTER[1], STA_RITA_CENTER[0]]),
          zoom: 16.5,
          maxZoom: 19
        })
      });

      // Click Event Listener for Location Spots, Key Roads & GPS Pin
      map.on('singleclick', (evt) => {
        let featureFound = false;
        map.forEachFeatureAtPixel(evt.pixel, (feature) => {
          const spot: LocationSpot = feature.get('spotData');
          const road: KeyRoadInfo = feature.get('roadData');
          const isGps = feature.get('isGps');

          if (spot) {
            featureFound = true;
            setSelectedSpot(spot);
            speak(`${spot.name}. ${spot.audioCueText}`);
            announceToScreenReader(`Selected map location: ${spot.name}`);

            const coords = (feature.getGeometry() as Point).getCoordinates();
            overlayRef.current?.setPosition(coords);

            map.getView().animate({
              center: coords,
              duration: 300
            });
          } else if (road) {
            featureFound = true;
            speak(`${road.name}: ${road.type}. ${road.description}`);
            overlayRef.current?.setPosition(evt.coordinate);
            setSelectedSpot({
              id: road.id,
              name: road.name,
              category: 'transport',
              address: `${road.name}, Sta. Rita, Olongapo City`,
              zone: 'Sta. Rita',
              coordinates: road.coordinates[1],
              rating: road.id === 'tabacuhan_rd' ? 'partially_accessible' : 'highly_accessible',
              ratingScore: 5,
              features: [road.type, road.accessibilityStatus],
              hasRamp: true,
              hasAccessibleRestroom: false,
              hasElevatorOrGroundFloor: true,
              hasPriorityWindow: false,
              hasTactilePavingOrAudio: true,
              hasShadedSeating: true,
              audioCueText: `${road.name}: ${road.description}`,
              notes: road.trafficWarning || road.accessibilityStatus
            });
          } else if (isGps) {
            featureFound = true;
            speak("Your current GPS location in Barangay Santa Rita.");
            const coords = (feature.getGeometry() as Point).getCoordinates();
            overlayRef.current?.setPosition(coords);
          }
        });

        if (!featureFound) {
          overlayRef.current?.setPosition(undefined);
        }
      });

      mapInstanceRef.current = map;
    }

    renderSpotMarkers();

  }, [activeFilter]);

  // Update Live GPS Pin in OpenLayers
  useEffect(() => {
    if (!gpsVectorSourceRef.current || !userLocation) return;
    const gpsSource = gpsVectorSourceRef.current;
    gpsSource.clear();

    const inside = isPointInStaRita(userLocation[0], userLocation[1]);
    const olCoord = fromLonLat([userLocation[1], userLocation[0]]);

    const gpsFeature = new Feature({
      geometry: new Point(olCoord),
      isGps: true
    });

    gpsFeature.setStyle(new Style({
      image: new Icon({
        src: createGpsSvgDataUrl(inside),
        anchor: [0.5, 0.5]
      })
    }));

    gpsSource.addFeature(gpsFeature);
  }, [userLocation]);

  const renderSpotMarkers = () => {
    if (!spotsVectorSourceRef.current) return;
    const source = spotsVectorSourceRef.current;
    source.clear();

    const filteredSpots = STA_RITA_LOCATIONS.filter(spot => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'accessible') return spot.rating === 'highly_accessible';
      if (activeFilter === 'partial') return spot.rating === 'partially_accessible';
      if (activeFilter === 'barriers') return spot.rating === 'limited_access' || spot.rating === 'inaccessible';
      if (activeFilter === 'restroom') return spot.hasAccessibleRestroom;
      if (activeFilter === 'ramps') return spot.hasRamp;
      if (activeFilter === 'rest_spot') return spot.category === 'rest_spot';
      return true;
    });

    filteredSpots.forEach(spot => {
      const olCoord = fromLonLat([spot.coordinates[1], spot.coordinates[0]]);
      const feature = new Feature({
        geometry: new Point(olCoord),
        spotData: spot
      });

      feature.setStyle(new Style({
        image: new Icon({
          src: createSpotSvgDataUrl(spot),
          anchor: [0.5, 0.5]
        })
      }));

      source.addFeature(feature);
    });
  };

  const handleFilterChange = (filterId: string, label: string) => {
    setActiveFilter(filterId);
    speak(`Map filter set to ${label}.`);
  };

  const centerOnUser = () => {
    if (userLocation && mapInstanceRef.current) {
      const olCoord = fromLonLat([userLocation[1], userLocation[0]]);
      mapInstanceRef.current.getView().animate({
        center: olCoord,
        zoom: 18,
        duration: 500
      });
      speak("Map centered on your current location.");
    } else {
      speak("Obtaining live GPS coordinates.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-4">
      
      {/* Title */}
      <div className="border-b-2 border-slate-200 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Boundary: Barangay Santa Rita, Olongapo City</span>
          </div>

          <span className="text-xs font-extrabold bg-blue-50 text-blue-900 border border-blue-300 px-3 py-1 rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>OpenLayers 10 Spatial Data API</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mt-2">
          Interactive Live Spatial Map
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563] font-medium mt-1">
          OpenLayers spatial map with verified step-free routes, ramps, restrooms, and PWD accessibility barriers.
        </p>
      </div>

      {/* Map Filter Controls Bar */}
      <div aria-label="Map Filters" className="flex flex-wrap items-center gap-2 bg-white p-3.5 rounded-2xl border-2 border-slate-200 shadow-sm">
        <span className="text-xs font-extrabold uppercase text-[#111827] px-2 flex items-center gap-1">
          <Filter className="w-4 h-4 text-[#1E3A8A]" /> Filters:
        </span>

        {[
          { id: 'all', label: '🗺️ All Locations' },
          { id: 'accessible', label: '♿ Highly Accessible' },
          { id: 'partial', label: '🟡 Partial Access' },
          { id: 'barriers', label: '⛔ Barriers / Obstacles' },
          { id: 'ramps', label: '🛗 Ramps' },
          { id: 'restroom', label: '🚻 Accessible WC' },
          { id: 'rest_spot', label: '💺 Rest Benches' },
        ].map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => handleFilterChange(f.id, f.label)}
              aria-pressed={isActive}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 focus:ring-4 focus:ring-blue-300 focus:outline-none cursor-pointer ${
                isActive
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md'
                  : 'bg-[#F3F4F6] text-[#111827] border-transparent hover:border-[#1E3A8A]'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Outside Service Area Alert Banner */}
      {isOutsideServiceArea && (
        <div role="alert" className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-3 text-red-950 shadow-md">
          <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-red-900">
              Outside Service Area Warning
            </h3>
            <p className="text-xs font-semibold leading-relaxed">
              You have left the AccessiGo service area. AccessiGo currently provides accessible route planning only within Barangay Santa Rita, Olongapo City.
            </p>
          </div>
        </div>
      )}

      {/* Map Canvas Container */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 shadow-lg bg-slate-100 min-h-[500px]">
        <div ref={mapContainerRef} className="w-full h-[520px] lg:h-[calc(100vh-270px)] min-h-[500px] max-h-[750px] z-10" />

        {/* OpenLayers Popup Overlay Container */}
        <div ref={popupContainerRef} className="z-30 pointer-events-auto">
          {selectedSpot && (
            <div className="bg-white p-4 rounded-2xl shadow-2xl border-2 border-slate-300 max-w-sm text-slate-900 font-sans">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                <div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    selectedSpot.rating === 'highly_accessible' ? 'bg-emerald-100 text-emerald-800' :
                    selectedSpot.rating === 'partially_accessible' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedSpot.rating.replace('_', ' ')}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">{selectedSpot.name}</h3>
                </div>
                <button 
                  onClick={() => {
                    setSelectedSpot(null);
                    overlayRef.current?.setPosition(undefined);
                  }}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 mt-2 leading-snug">{selectedSpot.description}</p>

              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-bold">
                {selectedSpot.hasRamp && <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">✓ Ramp</span>}
                {selectedSpot.hasAccessibleRestroom && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">✓ Restroom</span>}
                {selectedSpot.tactilePaving && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">✓ Tactile Paving</span>}
              </div>

              {onSelectLocationForRoute && (
                <button
                  onClick={() => onSelectLocationForRoute(selectedSpot)}
                  className="mt-3 w-full py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <RouteIcon className="w-4 h-4" />
                  <span>Plan Route To Here</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Floating Map Action Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={centerOnUser}
            title="Center on My GPS Location"
            className="p-3 bg-white hover:bg-slate-50 text-[#1E3A8A] rounded-2xl shadow-xl border-2 border-slate-200 flex items-center justify-center transition-all cursor-pointer focus:ring-4 focus:ring-blue-300"
          >
            <Locate className="w-6 h-6" />
          </button>
        </div>

        {/* Map Overlay Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none max-w-xs">
          <div className="bg-[#1E3A8A] text-white px-4 py-2 rounded-2xl shadow-xl border border-blue-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider">AccessiGo Coverage</p>
              <p className="text-[11px] text-blue-200 font-semibold">Barangay Santa Rita, Olongapo</p>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>OpenLayers Spatial Engine Active</span>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl border-2 border-slate-200 shadow-lg text-xs font-bold text-[#111827] hidden sm:flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#059669] flex items-center justify-center text-[8px]">♿</span>
            <span>Highly Accessible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#D97706] flex items-center justify-center text-[8px]">🟡</span>
            <span>Partial Access</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#DC2626] flex items-center justify-center text-[8px]">⛔</span>
            <span>Barrier / Barrier Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#2563eb] flex items-center justify-center text-[8px]">🔵</span>
            <span>Your GPS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
