import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Volume2, VolumeX, Square } from 'lucide-react';

export const VoiceCaptionBanner: React.FC = () => {
  const { currentCaption, isSpeaking, stopSpeaking } = useAccessibility();

  if (!currentCaption && !isSpeaking) return null;

  return (
    <div 
      aria-label="Voice guidance captions"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-xl z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border-2 border-blue-400 flex items-center gap-4 animate-slide-up"
    >
      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 animate-pulse">
        <Volume2 className="w-6 h-6 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wider text-blue-300 font-bold mb-0.5">
          🎙️ AI Voice Guidance Speaking
        </p>
        <p className="text-base font-semibold leading-snug line-clamp-2 text-white">
          "{currentCaption}"
        </p>
      </div>

      <button
        onClick={stopSpeaking}
        aria-label="Stop Voice Guidance"
        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors focus:ring-4 focus:ring-red-300 focus:outline-none shrink-0"
      >
        <Square className="w-4 h-4 fill-current" />
        Stop
      </button>
    </div>
  );
};
