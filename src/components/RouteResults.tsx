import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { RouteOption, AccessibilityPreference } from '../types';
import { RouteMap } from './RouteMap';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Mic, 
  Bookmark, 
  ListOrdered, 
  Map, 
  Share2, 
  Clock, 
  Ruler, 
  Layers, 
  ShieldAlert, 
  ArrowLeft,
  Navigation
} from 'lucide-react';

interface RouteResultsProps {
  origin: string;
  destination: string;
  routes: RouteOption[];
  onStartVoiceGuidance: (route: RouteOption) => void;
  onBackToPlanner: () => void;
  onSaveRoute: (route: RouteOption) => void;
}

export const RouteResults: React.FC<RouteResultsProps> = ({
  origin,
  destination,
  routes,
  onStartVoiceGuidance,
  onBackToPlanner,
  onSaveRoute
}) => {
  const { speak, announceToScreenReader } = useAccessibility();
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || '');
  const [showStepByStep, setShowStepByStep] = useState<boolean>(true);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (routes && routes.length > 0) {
      setSelectedRouteId(routes[0].id);
    }
  }, [routes]);

  const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  const handleStartNavigation = () => {
    speak(`Starting voice navigation for ${activeRoute.title}. Follow spoken instructions.`);
    announceToScreenReader('Voice guidance activated.');
    onStartVoiceGuidance(activeRoute);
  };

  const handleSave = () => {
    onSaveRoute(activeRoute);
    speak(`${activeRoute.title} saved to your routes.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6">
      
      {/* Navigation Top Action */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={onBackToPlanner}
          className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors focus:ring-4 focus:ring-blue-300 focus:outline-none"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Planner</span>
        </button>

        <div className="text-right">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Route Search Results
          </p>
          <p className="text-base font-extrabold text-slate-900 font-heading">
            {origin} ➔ {destination}
          </p>
        </div>
      </div>

      {/* Multiple Route Tabs if available */}
      {routes.length > 1 && (
        <div aria-label="Route Options" className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-300">
          {routes.map((route) => {
            const isSelected = route.id === selectedRouteId;
            return (
              <button
                key={route.id}
                onClick={() => {
                  setSelectedRouteId(route.id);
                  speak(`Selected ${route.title}`);
                }}
                className={`px-5 py-3 rounded-2xl font-bold text-sm shrink-0 border-2 transition-all focus:ring-4 focus:ring-blue-300 focus:outline-none ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {route.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Primary Route Summary Card */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
        
        {/* Rating & Header Summary */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b-2 border-slate-200 pb-6">
          <div>
            <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 border-2 border-emerald-400 px-4 py-1.5 rounded-full text-sm font-extrabold mb-3">
              {activeRoute.ratingLabel}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              {activeRoute.title}
            </h2>
            <p className="text-base text-slate-600 font-medium mt-1">
              {activeRoute.summary}
            </p>
          </div>

          <div className="flex items-center gap-6 bg-slate-100 p-4 rounded-2xl border border-slate-300">
            <div className="text-center">
              <div className="flex items-center justify-center text-blue-700 font-extrabold gap-1">
                <Clock className="w-5 h-5" />
                <span className="text-2xl font-heading">{activeRoute.estimatedMinutes}</span>
              </div>
              <span className="text-xs font-bold text-slate-600 uppercase">Minutes</span>
            </div>

            <div className="h-8 w-px bg-slate-300" />

            <div className="text-center">
              <div className="flex items-center justify-center text-emerald-700 font-extrabold gap-1">
                <Ruler className="w-5 h-5" />
                <span className="text-2xl font-heading">{activeRoute.distanceKm}</span>
              </div>
              <span className="text-xs font-bold text-slate-600 uppercase">KM Distance</span>
            </div>
          </div>
        </div>

        {/* Leaflet Interactive Route Map showing directions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#1E3A8A]" />
              <span>Route & Directions on Leaflet Map</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Click step markers on map to view directions
            </span>
          </div>

          <RouteMap
            activeRoute={activeRoute}
            originName={origin}
            destinationName={destination}
            selectedStepIndex={selectedStepIndex}
            onStepSelect={(index) => setSelectedStepIndex(index)}
            height="420px"
          />
        </div>

        {/* Clear Key Conditions Checklist */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Route Condition Overview
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-3 text-emerald-950 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Stairs: {activeRoute.stairsCount === 0 ? 'No stairs (100% Zero Steps)' : `${activeRoute.stairsCount} stairs`}</span>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-3 text-emerald-950 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Slope Grade: Max {activeRoute.maxSlopeGradePercent}% (Gentle Inclines)</span>
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-300 rounded-xl flex items-center gap-3 text-blue-950 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <span>Crossings: {activeRoute.accessibleCrossingsCount} Accessible Crossings</span>
            </div>

            <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-xl flex items-center gap-3 text-slate-900 font-bold text-sm">
              <Layers className="w-5 h-5 text-slate-700 shrink-0" />
              <span>Road: {activeRoute.roadCondition}</span>
            </div>
          </div>
        </div>

        {/* Highlights & Warnings List */}
        <div className="space-y-4">
          <div className="bg-emerald-50 border-2 border-emerald-300 p-5 rounded-2xl space-y-2">
            <h4 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>Verified Accessible Advantages</span>
            </h4>
            <ul className="space-y-1.5 text-sm text-emerald-900 font-semibold pl-2">
              {activeRoute.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>

          {activeRoute.warnings.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-2xl space-y-2">
              <h4 className="text-sm font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-700" />
                <span>Safety & Obstacle Warnings</span>
              </h4>
              <ul className="space-y-1.5 text-sm text-amber-900 font-bold pl-2">
                {activeRoute.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons Bar */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Button 1: START VOICE GUIDANCE */}
          <button
            onClick={handleStartNavigation}
            className="sm:col-span-2 py-4 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl shadow-xl border-2 border-amber-300 flex items-center justify-center gap-3 text-lg transition-all focus:ring-4 focus:ring-amber-300 focus:outline-none"
          >
            <Mic className="w-6 h-6 fill-current animate-pulse" />
            <span>START VOICE GUIDANCE</span>
          </button>

          {/* Button 2: SAVE ROUTE */}
          <button
            onClick={handleSave}
            className="py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl border-2 border-slate-700 flex items-center justify-center gap-2 text-base transition-colors focus:ring-4 focus:ring-slate-400 focus:outline-none"
          >
            <Bookmark className="w-5 h-5 text-blue-400" />
            <span>SAVE ROUTE</span>
          </button>
        </div>

        {/* Toggle Step-by-Step Details */}
        <div className="pt-2">
          <button
            onClick={() => {
              setShowStepByStep(!showStepByStep);
              speak(showStepByStep ? 'Hiding details.' : 'Showing step-by-step directions.');
            }}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold rounded-xl border border-slate-300 flex items-center justify-center gap-2 text-sm transition-colors focus:ring-4 focus:ring-blue-300 focus:outline-none"
          >
            <ListOrdered className="w-5 h-5 text-blue-600" />
            <span>{showStepByStep ? 'HIDE STEP-BY-STEP DETAILS' : 'VIEW STEP-BY-STEP DETAILS'}</span>
          </button>
        </div>

        {/* Step-By-Step Breakdown */}
        {showStepByStep && (
          <div className="mt-6 border-t-2 border-slate-200 pt-6 space-y-4 animate-fade-in">
            <h4 className="text-lg font-extrabold text-slate-900 font-heading">
              Step-by-Step Turn Directions
            </h4>

            <div className="space-y-3">
              {activeRoute.steps.map((step, index) => {
                const isSelected = selectedStepIndex === index;
                return (
                  <div 
                    key={step.id} 
                    onClick={() => {
                      setSelectedStepIndex(index);
                      speak(`Step ${index + 1}: ${step.instruction}`);
                    }}
                    className={`p-4 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-[#1E3A8A] ring-2 ring-[#1E3A8A]/30 shadow-md'
                        : step.isAccessible 
                          ? 'bg-slate-50 border-slate-300 hover:border-slate-400' 
                          : 'bg-amber-50 border-amber-400 hover:border-amber-500'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full font-extrabold flex items-center justify-center text-sm shrink-0 ${
                      isSelected ? 'bg-[#F59E0B] text-slate-950' : 'bg-[#1E3A8A] text-white'
                    }`}>
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-base font-bold text-slate-950 leading-snug">
                        {step.instruction}
                      </p>
                      <p className="text-xs text-slate-600 italic">
                        Filipino: {step.instructionTagalog}
                      </p>
                      {step.hazardWarning && (
                        <p className="text-xs font-bold text-amber-900 bg-amber-200 px-2.5 py-1 rounded-lg inline-block mt-1">
                          ⚠ {step.hazardWarning}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-lg inline-block mb-1">
                        {step.distanceMeters}m
                      </span>
                      {isSelected && (
                        <p className="text-[10px] font-extrabold text-[#1E3A8A] uppercase">Active On Map</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
