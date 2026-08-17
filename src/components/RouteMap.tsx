import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';
import { fromLonLat } from 'ol/proj';
import { Style, Stroke, Fill, Icon } from 'ol/style';
import Overlay from 'ol/Overlay';

import { RouteOption, RouteStep } from '../types';
import { useAccessibility } from '../context/AccessibilityContext';
import { BARANGAY_STA_RITA_POLYGON } from '../utils/geofencing';
import { CheckCircle2, ShieldCheck, MapPin, X } from 'lucide-react';

interface RouteMapProps {
  activeRoute: RouteOption;
  originName?: string;
  destinationName?: string;
  selectedStepIndex?: number;
  onStepSelect?: (index: number) => void;
  height?: string;
}

// SVG Icon Generator for OpenLayers Markers
function createSvgDataUrl(text: string, bgColor: string, textColor = '#ffffff', size = 36): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${bgColor}" stroke="#ffffff" stroke-width="2.5"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="${Math.round(size * 0.42)}">${text}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export const RouteMap: React.FC<RouteMapProps> = ({
  activeRoute,
  originName,
  destinationName,
  selectedStepIndex,
  onStepSelect,
  height = '480px'
}) => {
  const { speak } = useAccessibility();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const popupContainerRef = useRef<HTMLDivElement>(null);

  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const overlayRef = useRef<Overlay | null>(null);

  const [activePopupContent, setActivePopupContent] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create vector source for route, boundary & markers
      const vectorSource = new VectorSource();
      vectorSourceRef.current = vectorSource;

      const vectorLayer = new VectorLayer({
        source: vectorSource
      });

      // CartoDB Positron High Accuracy Basemap
      const tileLayer = new TileLayer({
        source: new XYZ({
          url: 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          attributions: '© OpenStreetMap contributors, © CARTO'
        })
      });

      // OpenLayers Popup Overlay
      const popupOverlay = new Overlay({
        element: popupContainerRef.current!,
        autoPan: { animation: { duration: 250 } },
        positioning: 'bottom-center',
        offset: [0, -18]
      });
      overlayRef.current = popupOverlay;

      const map = new Map({
        target: mapContainerRef.current,
        layers: [tileLayer, vectorLayer],
        overlays: [popupOverlay],
        view: new View({
          center: fromLonLat([120.2842, 14.8295]),
          zoom: 16.5,
          maxZoom: 19
        })
      });

      // OpenLayers Feature Click Listener for Step Markers
      map.on('singleclick', (event) => {
        let featureFound = false;
        map.forEachFeatureAtPixel(event.pixel, (feature) => {
          const stepIndex = feature.get('stepIndex');
          const stepData: RouteStep = feature.get('stepData');
          const markerType = feature.get('markerType');

          if (stepIndex !== undefined && stepData) {
            featureFound = true;
            if (onStepSelect) onStepSelect(stepIndex);
            speak(`Step ${stepIndex + 1}: ${stepData.instruction}`);

            const coords = (feature.getGeometry() as Point).getCoordinates();
            overlayRef.current?.setPosition(coords);
            setActivePopupContent(
              <div className="p-3 bg-white rounded-xl shadow-xl border-2 border-slate-200 max-w-xs text-slate-900 font-sans">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="bg-[#1E3A8A] text-white px-2 py-0.5 rounded text-[11px] font-black uppercase">
                    Step {stepIndex + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{stepData.distanceMeters}m</span>
                </div>
                <p className="text-sm font-extrabold text-slate-900 leading-snug">{stepData.instruction}</p>
                <p className="text-xs italic text-slate-600 mt-1">{stepData.instructionTagalog}</p>
                {stepData.hazardWarning && (
                  <div className="mt-2 bg-amber-100 text-amber-900 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                    ⚠️ {stepData.hazardWarning}
                  </div>
                )}
              </div>
            );
          } else if (markerType === 'start') {
            featureFound = true;
            const coords = (feature.getGeometry() as Point).getCoordinates();
            overlayRef.current?.setPosition(coords);
            setActivePopupContent(
              <div className="p-3 bg-white rounded-xl shadow-xl border-2 border-emerald-500 max-w-xs text-slate-900 font-sans">
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-black uppercase">Starting Point</span>
                <h4 className="text-sm font-extrabold text-slate-900 mt-1">{originName || 'Origin'}</h4>
                <p className="text-xs text-slate-600">Accessible Route Departure Point</p>
              </div>
            );
          } else if (markerType === 'end') {
            featureFound = true;
            const coords = (feature.getGeometry() as Point).getCoordinates();
            overlayRef.current?.setPosition(coords);
            setActivePopupContent(
              <div className="p-3 bg-white rounded-xl shadow-xl border-2 border-red-500 max-w-xs text-slate-900 font-sans">
                <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[11px] font-black uppercase">Destination</span>
                <h4 className="text-sm font-extrabold text-slate-900 mt-1">{destinationName || 'Destination'}</h4>
                <p className="text-xs text-slate-600">Accessible Destination Entrance</p>
              </div>
            );
          }
        });

        if (!featureFound) {
          overlayRef.current?.setPosition(undefined);
          setActivePopupContent(null);
        }
      });

      mapInstanceRef.current = map;
    }

    renderRouteOnOpenLayersMap();

  }, [activeRoute, selectedStepIndex]);

  const renderRouteOnOpenLayersMap = () => {
    if (!vectorSourceRef.current || !mapInstanceRef.current) return;
    const vectorSource = vectorSourceRef.current;
    vectorSource.clear();

    // 0. Add Official Barangay Santa Rita Boundary Polygon
    const polyCoords = BARANGAY_STA_RITA_POLYGON.map(([lat, lng]) => fromLonLat([lng, lat]));
    const boundaryPolygon = new Polygon([polyCoords]);
    const boundaryFeature = new Feature({ geometry: boundaryPolygon });
    boundaryFeature.setStyle(new Style({
      stroke: new Stroke({
        color: '#1E3A8A',
        width: 3,
        lineDash: [6, 6]
      }),
      fill: new Fill({
        color: 'rgba(59, 130, 246, 0.08)'
      })
    }));
    vectorSource.addFeature(boundaryFeature);

    if (!activeRoute || !activeRoute.waypoints || activeRoute.waypoints.length === 0) return;

    // Convert route waypoints [lat, lng] -> [lng, lat] for OpenLayers
    const routeCoords = activeRoute.waypoints.map(([lat, lng]) => fromLonLat([lng, lat]));
    const lineString = new LineString(routeCoords);

    // 1. Route Outline Glow Feature
    const glowFeature = new Feature({ geometry: lineString });
    glowFeature.setStyle(new Style({
      stroke: new Stroke({
        color: 'rgba(59, 130, 246, 0.4)',
        width: 10
      })
    }));
    vectorSource.addFeature(glowFeature);

    // 2. Route Main Feature
    const mainFeature = new Feature({ geometry: lineString });
    mainFeature.setStyle(new Style({
      stroke: new Stroke({
        color: '#1E3A8A',
        width: 5,
        lineDash: activeRoute.rating === 'partially_accessible' ? [8, 8] : undefined
      })
    }));
    vectorSource.addFeature(mainFeature);

    // 3. Start Pin Marker (Origin 'A')
    const startCoord = routeCoords[0];
    const startFeature = new Feature({
      geometry: new Point(startCoord),
      markerType: 'start'
    });
    startFeature.setStyle(new Style({
      image: new Icon({
        src: createSvgDataUrl('A', '#059669', '#ffffff', 38),
        anchor: [0.5, 0.5]
      })
    }));
    vectorSource.addFeature(startFeature);

    // 4. End Pin Marker (Destination 'B')
    const endCoord = routeCoords[routeCoords.length - 1];
    const endFeature = new Feature({
      geometry: new Point(endCoord),
      markerType: 'end'
    });
    endFeature.setStyle(new Style({
      image: new Icon({
        src: createSvgDataUrl('B', '#DC2626', '#ffffff', 38),
        anchor: [0.5, 0.5]
      })
    }));
    vectorSource.addFeature(endFeature);

    // 5. Step Direction Markers
    if (activeRoute.steps && activeRoute.steps.length > 0) {
      activeRoute.steps.forEach((step, index) => {
        const rawCoord: [number, number] = step.coordinates || activeRoute.waypoints[Math.min(index, activeRoute.waypoints.length - 1)];
        const stepOlCoord = fromLonLat([rawCoord[1], rawCoord[0]]);

        const isSelected = selectedStepIndex === index;

        let symbol = (index + 1).toString();
        if (step.iconType === 'turn_left') symbol = '⬅';
        if (step.iconType === 'turn_right') symbol = '➡️';
        if (step.iconType === 'ramp') symbol = '♿';
        if (step.iconType === 'warning') symbol = '⚠️';

        const stepBg = isSelected 
          ? '#F59E0B' 
          : step.isAccessible 
            ? '#1E3A8A' 
            : '#D97706';

        const stepFeature = new Feature({
          geometry: new Point(stepOlCoord),
          stepIndex: index,
          stepData: step
        });

        stepFeature.setStyle(new Style({
          image: new Icon({
            src: createSvgDataUrl(symbol, stepBg, '#ffffff', isSelected ? 34 : 28),
            anchor: [0.5, 0.5]
          })
        }));

        vectorSource.addFeature(stepFeature);

        // Highlight selected step in overlay
        if (isSelected) {
          overlayRef.current?.setPosition(stepOlCoord);
          setActivePopupContent(
            <div className="p-3 bg-white rounded-xl shadow-xl border-2 border-amber-500 max-w-xs text-slate-900 font-sans">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-[11px] font-black uppercase">
                  Selected Step {index + 1}
                </span>
                <span className="text-xs font-bold text-slate-500">{step.distanceMeters}m</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 leading-snug">{step.instruction}</p>
              <p className="text-xs italic text-slate-600 mt-1">{step.instructionTagalog}</p>
              {step.hazardWarning && (
                <div className="mt-2 bg-amber-100 text-amber-900 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                  ⚠️ {step.hazardWarning}
                </div>
              )}
            </div>
          );
        }
      });
    }

    // Auto-fit OpenLayers view extent to route with smooth padding
    const extent = vectorSource.getExtent();
    if (extent && extent[0] !== Infinity) {
      mapInstanceRef.current.getView().fit(extent, {
        padding: [60, 60, 60, 60],
        duration: 500
      });
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md bg-slate-100" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      
      {/* OpenLayers Popup Overlay Container */}
      <div ref={popupContainerRef} className="z-30 pointer-events-auto">
        {activePopupContent}
      </div>

      {/* Service Area Boundary Overlay Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 max-w-xs">
        <div className="bg-[#1E3A8A] text-white px-3.5 py-1.5 rounded-xl border border-blue-900 shadow-md flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-black uppercase tracking-wider">
            Barangay Santa Rita Service Area
          </span>
        </div>
        <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-200 text-[11px] font-bold text-emerald-950 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>OpenLayers 10 Live Spatial Engine (100% In-Bounds)</span>
        </div>
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-20 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-xs font-bold text-[#111827] flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#059669] text-white flex items-center justify-center text-[9px] font-black">A</span>
          <span>Start</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#DC2626] text-white flex items-center justify-center text-[9px] font-black">B</span>
          <span>Finish</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-[#1E3A8A] rounded-full"></span>
          <span>OpenLayers Route Path</span>
        </div>
      </div>
    </div>
  );
};
