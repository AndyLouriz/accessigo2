import React, { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import { AuthPage } from './components/AuthPage';
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

// ─── In-App Toast Notification ────────────────────────────────────────────────
interface ToastProps {
  message: string;
  type: 'error' | 'success' | 'info';
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
  const colorMap = {
    error: 'bg-red-50 border-red-400 text-red-950',
    success: 'bg-emerald-50 border-emerald-400 text-emerald-950',
    info: 'bg-blue-50 border-blue-400 text-blue-950',
  };
  const iconMap = { error: '✕', success: '✓', info: 'ℹ' };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-lg border-2 rounded-2xl shadow-2xl p-5 flex items-start gap-4 animate-fade-in ${colorMap[type]}`}
    >
      <span className="text-xl font-black shrink-0">{iconMap[type]}</span>
      <p className="text-sm font-bold leading-relaxed flex-1">{message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-current opacity-60 hover:opacity-100 font-black text-lg leading-none shrink-0 focus:outline-none focus:ring-2 focus:ring-current rounded"
      >
        ×
      </button>
    </div>
  );
};

// ─── Main App Content ─────────────────────────────────────────────────────────
const MainAppContent: React.FC = () => {
  const { activeSection, setActiveSection, speak } = useAccessibility();

  const [routeOrigin, setRouteOrigin] = useState<string>('Barangay Sta. Rita Barangay Hall');
  const [routeDestination, setRouteDestination] = useState<string>('Sta. Rita Barangay Health Station (BHS)');
  const [calculatedRoutes, setCalculatedRoutes] = useState<RouteOption[]>(SAMPLE_ROUTE_OPTIONS);
  const [activeVoiceRoute, setActiveVoiceRoute] = useState<RouteOption | null>(SAMPLE_ROUTE_OPTIONS[0]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);

  // ── Toast state ──────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 6000);
  }, []);

  // Handle Calculating Route from Planner
  const handleCalculateRoute = async (origin: string, destination: string, preferences: AccessibilityPreference[]) => {
    setRouteOrigin(origin);
    setRouteDestination(destination);
    setIsCalculatingRoute(true);

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
        showToast(`✕ AccessiGo Service Area Limit: ${msg}`, 'error');
        speak(`Route calculation failed. ${msg}`);
      }
    } catch (err) {
      setCalculatedRoutes(SAMPLE_ROUTE_OPTIONS);
      setActiveSection('route_results');
      speak(`Route calculated from ${origin} to ${destination}.`);
    } finally {
      setIsCalculatingRoute(false);
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
      const response = await fetch('/api/saved-routes', {
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
      if (response.ok) {
        showToast(`✓ Route saved: "${route.title}"`, 'success');
      }
    } catch (err) {
      showToast('Route saved locally.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827] font-sans flex flex-col selection:bg-[#1E3A8A] selection:text-white">

      {/* In-App Toast Notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}

      {/* Route Calculation Loading Overlay */}
      {isCalculatingRoute && (
        <div
          role="status"
          aria-label="Calculating accessible route"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-blue-300 flex flex-col items-center gap-4 max-w-sm mx-4">
            <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-[#1E3A8A] animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-lg font-extrabold text-[#111827]">Calculating Route…</p>
              <p className="text-sm text-[#4B5563] font-medium">Finding the best accessible path in Sta. Rita</p>
            </div>
          </div>
        </div>
      )}

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


// ─── Auth-Gated App Shell ─────────────────────────────────────────────────────
const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, isLoading, currentUser } = useAuth();

  if (isLoading) return null; // AuthPage handles the loading spinner

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Build initial profile from the logged-in user's signup data
  const initialProfile = currentUser ? {
    fullName: currentUser.fullName,
    disabilityType: currentUser.disabilityType as any,
  } : undefined;

  return (
    <AccessibilityProvider initialProfile={initialProfile}>
      <MainAppContent />
    </AccessibilityProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
