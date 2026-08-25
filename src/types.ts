export interface User {
  id: string;
  fullName: string;
  email: string;
  disabilityType: DisabilityType;
  createdAt: string;
}

export type DisabilityType = 
  | 'wheelchair' 
  | 'mobility' 
  | 'visual' 
  | 'hearing' 
  | 'cognitive' 
  | 'senior' 
  | 'multiple' 
  | 'caregiver';

export type MobilityAid = 
  | 'manual_wheelchair' 
  | 'power_wheelchair' 
  | 'crutches' 
  | 'white_cane' 
  | 'walker' 
  | 'hearing_aid' 
  | 'guide_dog' 
  | 'none';

export type AccessibilityPreference = 
  | 'wheelchair_accessible' 
  | 'avoid_stairs' 
  | 'avoid_steep_slopes' 
  | 'smooth_pathways' 
  | 'accessible_crossings' 
  | 'rest_stops_frequent' 
  | 'shaded_paths' 
  | 'shortest' 
  | 'safest' 
  | 'least_difficult';

export interface PWDProfile {
  fullName: string;
  mobilityAids: MobilityAid[];
  preferences: AccessibilityPreference[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalNotes?: string;
}

export type TextSizeOption = 'small' | 'medium' | 'large' | 'xlarge';
export type ContrastModeOption = 'standard' | 'high_contrast' | 'yellow_black';
export type LanguageOption = 'en' | 'fil';
export type VoiceSpeedOption = 'slow' | 'normal' | 'fast';

export interface AccessibilitySettings {
  textSize: TextSizeOption;
  contrastMode: ContrastModeOption;
  voiceGuidanceEnabled: boolean;
  voiceSpeed: VoiceSpeedOption;
  voiceVolume: number; // 0.1 to 1.0
  reducedMotion: boolean;
  language: LanguageOption;
  screenReaderOptimized: boolean;
  highFocusVisibility: boolean;
}

export type LocationCategory = 
  | 'facility' 
  | 'health' 
  | 'school' 
  | 'transport' 
  | 'restroom' 
  | 'establishment' 
  | 'rest_spot' 
  | 'barrier';

export type AccessRating = 'highly_accessible' | 'partially_accessible' | 'limited_access' | 'inaccessible';

export interface LocationSpot {
  id: string;
  name: string;
  category: LocationCategory;
  address: string;
  zone: string;
  coordinates: [number, number]; // [lat, lng]
  rating: AccessRating;
  ratingScore: number; // 1 to 5
  distanceMeters?: number;
  features: string[];
  hasRamp: boolean;
  hasAccessibleRestroom: boolean;
  hasElevatorOrGroundFloor: boolean;
  hasPriorityWindow: boolean;
  hasTactilePavingOrAudio: boolean;
  hasShadedSeating: boolean;
  audioCueText: string;
  contactNumber?: string;
  operatingHours?: string;
  notes?: string;
}

export interface RouteOption {
  id: string;
  title: string;
  summary: string;
  rating: AccessRating;
  ratingLabel: string;
  estimatedMinutes: number;
  distanceKm: number;
  stairsCount: number;
  maxSlopeGradePercent: number;
  roadCondition: string;
  accessibleCrossingsCount: number;
  warnings: string[];
  highlights: string[];
  waypoints: [number, number][]; // Array of lat, lng
  steps: RouteStep[];
}

export interface RouteStep {
  id: string;
  instruction: string;
  instructionTagalog: string;
  distanceMeters: number;
  isAccessible: boolean;
  hazardWarning?: string;
  iconType: 'straight' | 'turn_left' | 'turn_right' | 'ramp' | 'crossing' | 'destination' | 'warning';
  coordinates?: [number, number]; // [lat, lng]
}

export type ProblemType = 
  | 'broken_sidewalk' 
  | 'blocked_ramp' 
  | 'missing_ramp' 
  | 'uneven_pathway' 
  | 'stairs_no_ramp' 
  | 'road_obstruction' 
  | 'unsafe_crossing' 
  | 'other';

export interface ProblemReport {
  id: string;
  problemType: ProblemType;
  title: string;
  locationDescription: string;
  zone: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  reportedBy: string;
  contactPhone?: string;
  status: 'pending' | 'under_review' | 'resolved';
  createdAt: string;
  coordinates?: [number, number];
}

export interface SavedRoute {
  id: string;
  name: string;
  originName: string;
  destinationName: string;
  estimatedTime: string;
  distance: string;
  dateSaved: string;
  preferencesUsed: string[];
}

export type CustomLocationCategory = 
  | 'sari_sari_store' 
  | 'neighbor_home' 
  | 'bakery_food' 
  | 'transport_stop' 
  | 'landmark' 
  | 'other';

export interface SavedLocation {
  id: string;
  name: string;
  category: CustomLocationCategory;
  addressOrZone: string;
  zone: string;
  coordinates?: [number, number];
  accessibilityNotes?: string;
  accessibilityTag: 'step_free' | 'has_ramp' | 'flat_ground' | 'needs_assistance';
  contactPerson?: string;
  contactPhone?: string;
  dateAdded: string;
}
