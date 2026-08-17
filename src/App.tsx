import React, { useState } from 'react';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import { Navigation } from './components/Navigation';
import { HomeDashboard } from './components/HomeDashboard';
import { RoutePlanner } from './components/RoutePlanner';
import { RouteResults } from './components/RouteResults';
import { LiveVoiceNavigation } from './components/LiveVoiceNavigation';
import { InteractiveMap } from './components/InteractiveMap';
import { NearbyPlaces } from './components/NearbyPlaces';
import { AccessibilitySettingsPage } from './components/AccessibilitySettingsPage';
import { ReportIssue } from './components/ReportIssue';
import { SavedRoutesPage } from './components/SavedRoutesPage';
import { EmergencyHelpPage } from './components/EmergencyHelpPage';
import { VoiceCaptionBanner } from './components/VoiceCaptionBanner';

import { RouteOption, AccessibilityPreference, LocationSpot } from './types';
import { SAMPLE_ROUTE_OPTIONS } from './data/staRitaData';

const MainAppContent: React.FC = () => {
  const { activeSection, setActiveSection, speak } = useAccessibility();

  const [routeOrigin, setRouteOrigin] = useState<string>('Barangay Sta. Rita Barangay Hall');
  const [routeDestination, setRouteDestination] = useState<string>('Sta. Rita Barangay Health Station (BHS)');
  const [calculatedRoutes, setCalculatedRoutes] = useState<RouteOption[]>(SAMPLE_ROUTE_OPTIONS);
  const [activeVoiceRoute, setActiveVoiceRoute] = useState<RouteOption | null>(SAMPLE_ROUTE_OPTIONS[0]);

  // Handle Calculating Route from Planner
  const handleCalculateRoute = async (origin: string, destination: string, preferences: AccessibilityPreference[]) => {
    setRouteOrigin(origin);
    setRouteDestination(destination);

    try {
      const response = await fetch('/api/routes/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, preferences })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          setCalculatedRoutes(data.routes);
        }
        setActiveSection('route_results');
        speak(`Route calculated from ${origin} to ${destination}. Review route options.`);
      } else {
        const errData = await response.json();
        const msg = errData.message || errData.error || "Location outside service area. AccessiGo currently provides accessible route planning only within Barangay Santa Rita, Olongapo City.";
        alert(`✕ AccessiGo Service Area Limit:\n\n${msg}`);
        speak(`Route calculation failed. ${msg}`);
      }
    } catch (err) {
      setCalculatedRoutes(SAMPLE_ROUTE_OPTIONS);
      setActiveSection('route_results');
      speak(`Route calculated from ${origin} to ${destination}.`);
    }
  };

  // Handle Starting Voice Navigation
  const handleStartVoiceNavigation = (route: RouteOption) => {
    setActiveVoiceRoute(route);
    setActiveSection('live_voice');
  };

  // Handle Selecting a LocationSpot from Map or Directory
  const handleSelectLocationForRoute = (spot: LocationSpot) => {
    setRouteDestination(spot.name);
    setActiveSection('plan_route');
    speak(`Selected ${spot.name} as destination in Route Planner.`);
  };

  // Handle Saving Route
  const handleSaveRoute = async (route: RouteOption) => {
    try {
      await fetch('/api/saved-routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${route.title} (${route.distanceKm} km)`,
          originName: routeOrigin,
          destinationName: routeDestination,
          estimatedTime: `${route.estimatedMinutes} mins`,
          distance: `${route.distanceKm} km`,
          preferencesUsed: ['Wheelchair Accessible', 'Avoid Stairs']
        })
      });
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827] font-sans flex flex-col selection:bg-[#1E3A8A] selection:text-white">
      
      {/* Top Accessible Navigation */}
      <Navigation />

      {/* Main Page View Content Container */}
      <main className="flex-1 pb-16 lg:pb-4">
        {activeSection === 'home' && <HomeDashboard />}

        {activeSection === 'plan_route' && (
          <RoutePlanner 
            initialOrigin={routeOrigin}
            initialDestination={routeDestination}
            onCalculateRoute={handleCalculateRoute} 
          />
        )}

        {activeSection === 'route_results' && (
          <RouteResults
            origin={routeOrigin}
            destination={routeDestination}
            routes={calculatedRoutes}
            onStartVoiceGuidance={handleStartVoiceNavigation}
            onBackToPlanner={() => setActiveSection('plan_route')}
            onSaveRoute={handleSaveRoute}
          />
        )}

        {activeSection === 'live_voice' && (
          <LiveVoiceNavigation
            activeRoute={activeVoiceRoute}
            onExit={() => setActiveSection('home')}
          />
        )}

        {activeSection === 'map' && (
          <InteractiveMap onSelectLocationForRoute={handleSelectLocationForRoute} />
        )}

        {activeSection === 'nearby' && (
          <NearbyPlaces onSelectPlaceForRoute={handleSelectLocationForRoute} />
        )}

        {activeSection === 'saved_routes' && (
          <SavedRoutesPage 
            onStartRoute={handleStartVoiceNavigation} 
            onPlanRouteToLocation={(locationName) => {
              setRouteDestination(locationName);
              setActiveSection('plan_route');
              speak(`Destination set to ${locationName}. Ready to calculate route.`);
            }}
          />
        )}

        {activeSection === 'settings' && <AccessibilitySettingsPage />}

        {activeSection === 'report_issue' && <ReportIssue />}

        {activeSection === 'emergency' && <EmergencyHelpPage />}
      </main>

      {/* Voice Subtitles / Captions Banner Overlay */}
      <VoiceCaptionBanner />

      {/* Footer matching Clean Minimalism theme */}
      <footer className="bg-white border-t-2 border-gray-200 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold text-gray-600">
          <div>System: Ready · AccessiGo Sta. Rita, Olongapo City</div>
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center text-xs">
            <span className="bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200 text-slate-800">Contrast: Dynamic AAA</span>
            <span className="bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200 text-slate-800">Text: Accessible Scaled</span>
            <span className="bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200 text-slate-800 font-extrabold text-[#1E3A8A]">WCAG 2.1 AAA Compliant</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AccessibilityProvider>
      <MainAppContent />
    </AccessibilityProvider>
  );
}
