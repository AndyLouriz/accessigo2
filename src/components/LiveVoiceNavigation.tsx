import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { RouteOption, RouteStep } from '../types';
import { RouteMap } from './RouteMap';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  Sparkles, 
  Send,
  Navigation
} from 'lucide-react';

interface LiveVoiceNavigationProps {
  activeRoute?: RouteOption | null;
  onExit: () => void;
}

export const LiveVoiceNavigation: React.FC<LiveVoiceNavigationProps> = ({ activeRoute, onExit }) => {
  const { settings, updateSettings, speak, stopSpeaking, isSpeaking, currentCaption } = useAccessibility();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isNavPaused, setIsNavPaused] = useState<boolean>(false);
  const [userQuery, setUserQuery] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  const steps: RouteStep[] = activeRoute?.steps || [
    {
      id: 'step_demo_1',
      instruction: 'Start at Sta. Rita Barangay Hall main entrance.',
      instructionTagalog: 'Magsimula sa entrance ng Barangay Hall.',
      distanceMeters: 50,
      isAccessible: true,
      iconType: 'straight'
    },
    {
      id: 'step_demo_2',
      instruction: 'Continue straight on Magsaysay Drive for 100 meters on the smooth paved sidewalk.',
      instructionTagalog: 'Magpatuloy nang diretso sa Magsaysay Drive nang 100 metro.',
      distanceMeters: 100,
      isAccessible: true,
      iconType: 'straight'
    },
    {
      id: 'step_demo_3',
      instruction: 'Turn left at the next accessible crossing with signalized curb ramps.',
      instructionTagalog: 'Lumingon pakaliwa sa susunod na tawiran na may rampa.',
      distanceMeters: 80,
      isAccessible: true,
      iconType: 'turn_left'
    },
    {
      id: 'step_demo_4',
      instruction: 'Warning: Uneven sidewalk tiles ahead for 10 meters. Proceed slowly.',
      instructionTagalog: 'Babala: May bako-bakong sidewalk sa susunod na 10 metro.',
      distanceMeters: 10,
      isAccessible: false,
      hazardWarning: 'Uneven tiles — slow down',
      iconType: 'warning'
    },
    {
      id: 'step_demo_5',
      instruction: 'You have arrived at your destination: Sta. Rita Barangay Health Station.',
      instructionTagalog: 'Nakarating ka na sa Sta. Rita Health Station.',
      distanceMeters: 0,
      isAccessible: true,
      iconType: 'destination'
    }
  ];

  const currentStep = steps[currentStepIndex] || steps[0];

  // Speak step instruction when step index changes or pause state changes
  useEffect(() => {
    if (!isNavPaused) {
      const textToSpeak = settings.language === 'fil'
        ? currentStep.instructionTagalog
        : currentStep.instruction;
      speak(textToSpeak);
    }
    // speak is now memoized with useCallback, safe to include in deps
  }, [currentStepIndex, isNavPaused, settings.language, speak]);

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      speak('You have arrived at your destination.');
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleRepeatStep = () => {
    const textToSpeak = settings.language === 'fil' 
      ? currentStep.instructionTagalog 
      : currentStep.instruction;
    speak(textToSpeak);
  };

  const togglePause = () => {
    if (isNavPaused) {
      // Resume: first update state, then speak the confirmation
      setIsNavPaused(false);
      speak('Resuming voice guidance navigation.');
    } else {
      // Pause: stop any current speech FIRST, then announce pause
      stopSpeaking();
      setIsNavPaused(true);
      // Use a tiny delay so stopSpeaking clears the queue before new utterance
      setTimeout(() => speak('Voice guidance paused.'), 100);
    }
  };

  const handleAskGemini = async (queryText?: string) => {
    const query = queryText || userQuery;
    if (!query.trim()) return;

    setIsLoadingAi(true);
    speak('Asking AccessiGo AI assistant.');

    try {
      const response = await fetch('/api/gemini/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: query,
          language: settings.language,
          currentLocation: 'Sta. Rita Magsaysay Drive',
          destination: activeRoute ? activeRoute.title : 'Sta. Rita Landmark'
        })
      });

      const data = await response.json();
      const reply = data.text || data.fallbackText || 'Stay on accessible paths in Sta. Rita.';
      setAiResponse(reply);
      setUserQuery('');
      speak(reply);
    } catch (err) {
      const fallback = 'I am your AccessiGo AI guide. Continue on Magsaysay Drive for gentle wheelchair ramps.';
      setAiResponse(fallback);
      speak(fallback);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-5">
      
      {/* Top Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-900 text-white p-6 rounded-3xl border-2 border-slate-700 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center text-2xl animate-pulse">
            🎙️
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white">
              AI Voice Guidance Navigation
            </h1>
            <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">
              {activeRoute ? activeRoute.title : 'Sta. Rita Live Accessible Guidance'}
            </p>
          </div>
        </div>

        {/* Exit Button */}
        <button
          onClick={() => {
            stopSpeaking();
            onExit();
          }}
          className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-2xl border-2 border-red-400 flex items-center gap-2 text-sm transition-colors focus:ring-4 focus:ring-red-300 focus:outline-none"
        >
          <X className="w-5 h-5" />
          <span>Exit Navigation</span>
        </button>
      </div>

      {/* Main Step Visual Instruction Card */}
      <div className="bg-white border-4 border-blue-600 rounded-3xl p-8 sm:p-10 space-y-8 shadow-2xl relative">
        
        {/* Step Counter */}
        <div className="flex items-center justify-between">
          <span className="px-4 py-1.5 bg-blue-100 text-blue-900 border-2 border-blue-300 rounded-full text-xs font-extrabold uppercase tracking-wider">
            Step {currentStepIndex + 1} of {steps.length}
          </span>

          <span className="text-sm font-extrabold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
            {currentStep.distanceMeters > 0 ? `${currentStep.distanceMeters} meters remaining` : 'Destination'}
          </span>
        </div>

        {/* Big Visual Instruction Text */}
        <div className="space-y-3">
          <p className="text-2xl sm:text-4xl font-extrabold text-slate-950 leading-tight font-heading">
            "{currentStep.instruction}"
          </p>

          <p className="text-lg font-bold text-slate-600 italic">
            Filipino: "{currentStep.instructionTagalog}"
          </p>

          {currentStep.hazardWarning && (
            <div className="p-4 bg-amber-100 border-2 border-amber-500 rounded-2xl flex items-center gap-3 text-amber-950 font-extrabold text-base">
              <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0" />
              <span>⚠ {currentStep.hazardWarning}</span>
            </div>
          )}
        </div>

        {/* Live Route Leaflet Map */}
        {activeRoute && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-black uppercase text-[#1E3A8A] tracking-wider flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-[#1E3A8A]" /> Live Directions Map (Sta. Rita)
            </p>
            <RouteMap
              activeRoute={activeRoute}
              selectedStepIndex={currentStepIndex}
              onStepSelect={(idx) => setCurrentStepIndex(idx)}
              height="300px"
            />
          </div>
        )}

        {/* Navigation Step Progress Bar */}
        <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden border border-slate-300">
          <div 
            className="bg-blue-600 h-full transition-all duration-500"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step Switch Buttons */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="px-6 py-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-extrabold text-slate-900 rounded-2xl border-2 border-slate-300 flex items-center gap-2 transition-all focus:ring-4 focus:ring-blue-300 focus:outline-none"
          >
            <ChevronLeft className="w-6 h-6" />
            <span>Previous Step</span>
          </button>

          <button
            onClick={handleNextStep}
            disabled={currentStepIndex === steps.length - 1}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 font-extrabold text-white rounded-2xl shadow-xl border-2 border-blue-300 flex items-center gap-2 text-lg transition-all focus:ring-4 focus:ring-blue-300 focus:outline-none"
          >
            <span>Next Step</span>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Voice Controls Toolbar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border-2 border-slate-700 space-y-6 shadow-xl">
        <h2 className="text-base font-extrabold text-amber-300 uppercase tracking-wider">
          🎙️ Voice Controls & Settings
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          {/* Pause / Resume */}
          <button
            onClick={togglePause}
            className={`p-4 rounded-2xl border-2 font-extrabold flex flex-col items-center justify-center gap-2 transition-all focus:ring-4 focus:ring-blue-300 focus:outline-none ${
              isNavPaused 
                ? 'bg-amber-500 text-slate-950 border-amber-300' 
                : 'bg-slate-800 text-white border-slate-600 hover:bg-slate-700'
            }`}
          >
            {isNavPaused ? <Play className="w-7 h-7 fill-current" /> : <Pause className="w-7 h-7" />}
            <span className="text-xs uppercase">{isNavPaused ? 'Resume' : 'Pause Voice'}</span>
          </button>

          {/* Repeat Instruction */}
          <button
            onClick={handleRepeatStep}
            className="p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border-2 border-slate-600 font-extrabold flex flex-col items-center justify-center gap-2 transition-all focus:ring-4 focus:ring-blue-300 focus:outline-none"
          >
            <RotateCcw className="w-7 h-7 text-blue-400" />
            <span className="text-xs uppercase">Repeat Step</span>
          </button>

          {/* Voice Speed Toggle */}
          <button
            onClick={() => {
              const speeds: ('slow' | 'normal' | 'fast')[] = ['slow', 'normal', 'fast'];
              const nextSpeed = speeds[(speeds.indexOf(settings.voiceSpeed) + 1) % speeds.length];
              updateSettings({ voiceSpeed: nextSpeed });
              speak(`Voice speed set to ${nextSpeed}.`);
            }}
            className="p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border-2 border-slate-600 font-extrabold flex flex-col items-center justify-center gap-2 transition-all focus:ring-4 focus:ring-blue-300 focus:outline-none"
          >
            <Compass className="w-7 h-7 text-emerald-400" />
            <span className="text-xs uppercase">Speed: {settings.voiceSpeed}</span>
          </button>

          {/* Mute Toggle */}
          <button
            onClick={() => {
              const nextEnabled = !settings.voiceGuidanceEnabled;
              updateSettings({ voiceGuidanceEnabled: nextEnabled });
              if (!nextEnabled) {
                stopSpeaking();
              } else {
                // Use a short delay to let the state update propagate before speaking
                setTimeout(() => speak('Voice guidance enabled.'), 150);
              }
            }}
            className={`p-4 rounded-2xl border-2 font-extrabold flex flex-col items-center justify-center gap-2 transition-all focus:ring-4 focus:ring-blue-300 focus:outline-none ${
              !settings.voiceGuidanceEnabled
                ? 'bg-red-600 text-white border-red-400'
                : 'bg-slate-800 text-white border-slate-600 hover:bg-slate-700'
            }`}
          >
            {!settings.voiceGuidanceEnabled ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7 text-amber-400" />}
            <span className="text-xs uppercase">{!settings.voiceGuidanceEnabled ? 'Unmute' : 'Mute Voice'}</span>
          </button>
        </div>
      </div>

      {/* AI Assistant Spoken Assistant Box */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 text-blue-950">
          <Sparkles className="w-7 h-7 text-blue-600 shrink-0" />
          <div>
            <h3 className="text-lg font-extrabold font-heading">
              Ask AccessiGo AI Voice Assistant
            </h3>
            <p className="text-xs text-blue-800 font-medium">
              Ask questions about nearby ramps, restrooms, or PWD assistance in Barangay Sta. Rita.
            </p>
          </div>
        </div>

        {/* Quick Question Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            'Where is the nearest accessible restroom?',
            'Is there a ramp at Sta. Rita Barangay Hall?',
            'Are there accessible tricycles available?',
            'Ano ang mga PWD rights sa Olongapo?'
          ].map((q, i) => (
            <button
              key={i}
              onClick={() => handleAskGemini(q)}
              className="px-3.5 py-2 bg-white hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-xl text-xs font-bold transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              💬 "{q}"
            </button>
          ))}
        </div>

        {/* Input Row */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskGemini()}
            placeholder="Type or speak a question..."
            className="flex-1 p-4 bg-white border-2 border-blue-300 rounded-2xl text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
          />

          <button
            onClick={() => handleAskGemini()}
            disabled={isLoadingAi}
            className="px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl border-2 border-blue-300 flex items-center justify-center transition-colors focus:ring-4 focus:ring-blue-300 focus:outline-none shrink-0"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>

        {/* AI Response Display */}
        {aiResponse && (
          <div className="p-5 bg-white border-2 border-blue-400 rounded-2xl space-y-1 animate-fade-in">
            <p className="text-xs font-extrabold uppercase text-blue-600 tracking-wider">
              🤖 AccessiGo AI Guidance:
            </p>
            <p className="text-base font-extrabold text-slate-900 leading-relaxed">
              "{aiResponse}"
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
