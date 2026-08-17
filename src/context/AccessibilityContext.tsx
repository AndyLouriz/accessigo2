import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccessibilitySettings, PWDProfile, TextSizeOption, ContrastModeOption, LanguageOption, VoiceSpeedOption } from '../types';

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  profile: PWDProfile | null;
  updateProfile: (profile: PWDProfile) => void;
  speak: (text: string, onEnd?: () => void) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  currentCaption: string | null;
  activeSection: string;
  setActiveSection: (section: string) => void;
  announceToScreenReader: (message: string) => void;
  srAnnouncement: string | null;
}

const defaultSettings: AccessibilitySettings = {
  textSize: 'medium',
  contrastMode: 'standard',
  voiceGuidanceEnabled: true,
  voiceSpeed: 'normal',
  voiceVolume: 1.0,
  reducedMotion: false,
  language: 'en',
  screenReaderOptimized: true,
  highFocusVisibility: true,
};

const defaultProfile: PWDProfile = {
  fullName: 'Juan dela Cruz',
  pwdIdNumber: 'OCPWD-2024-08912',
  disabilityType: 'wheelchair',
  mobilityAids: ['manual_wheelchair'],
  preferences: ['wheelchair_accessible', 'avoid_stairs', 'smooth_pathways'],
  emergencyContactName: 'Maria dela Cruz',
  emergencyContactPhone: '0917-123-4567',
  barangayZone: 'Zone 1, Sta. Rita',
  medicalNotes: 'Requires step-free ramp access and frequent resting stops.'
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessigo_settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const [profile, setProfile] = useState<PWDProfile | null>(() => {
    const saved = localStorage.getItem('accessigo_pwd_profile');
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentCaption, setCurrentCaption] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [srAnnouncement, setSrAnnouncement] = useState<string | null>(null);

  // Apply settings to HTML document root (Root Font Size, High Contrast, Reduced Motion)
  useEffect(() => {
    localStorage.setItem('accessigo_settings', JSON.stringify(settings));

    const root = document.documentElement;

    // Font size scaling
    root.classList.remove('text-small', 'text-medium', 'text-large', 'text-xlarge');
    root.classList.add(`text-${settings.textSize}`);

    switch (settings.textSize) {
      case 'small':
        root.style.fontSize = '14px';
        break;
      case 'medium':
        root.style.fontSize = '16px';
        break;
      case 'large':
        root.style.fontSize = '19px';
        break;
      case 'xlarge':
        root.style.fontSize = '22px';
        break;
    }

    // Contrast modes
    root.classList.remove(
      'contrast-standard',
      'contrast-high_contrast',
      'contrast-high-contrast',
      'contrast-yellow_black',
      'contrast-yellow-black',
      'high-contrast',
      'yellow-black'
    );
    root.classList.add(`contrast-${settings.contrastMode}`);

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // High focus visibility
    if (settings.highFocusVisibility) {
      root.classList.add('high-focus');
    } else {
      root.classList.remove('high-focus');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateProfile = (newProfile: PWDProfile) => {
    setProfile(newProfile);
    localStorage.setItem('accessigo_pwd_profile', JSON.stringify(newProfile));
    announceToScreenReader('PWD Profile updated successfully.');
  };

  const announceToScreenReader = (message: string) => {
    setSrAnnouncement(message);
    setTimeout(() => setSrAnnouncement(null), 3000);
  };

  // Speech Synthesis Engine
  const speak = (text: string, onEnd?: () => void) => {
    if (!settings.voiceGuidanceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();
    setCurrentCaption(text);
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);

    // Voice Speed
    let rate = 1.0;
    if (settings.voiceSpeed === 'slow') rate = 0.75;
    if (settings.voiceSpeed === 'fast') rate = 1.25;
    utterance.rate = rate;

    // Volume
    utterance.volume = settings.voiceVolume;

    // Language selection
    utterance.lang = settings.language === 'fil' ? 'fil-PH' : 'en-PH';

    // Pick best natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.includes(settings.language === 'fil' ? 'fil' : 'en') ||
      v.lang.includes('PH') ||
      v.lang.includes('US')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentCaption(null);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentCaption(null);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentCaption(null);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSettings,
        profile,
        updateProfile,
        speak,
        stopSpeaking,
        isSpeaking,
        currentCaption,
        activeSection,
        setActiveSection,
        announceToScreenReader,
        srAnnouncement
      }}
    >
      {children}

      {/* Screen Reader Live Region for ARIA Announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}
      >
        {srAnnouncement}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
