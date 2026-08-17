import { LocationSpot, RouteOption, ProblemReport } from '../types';

// Barangay Sta. Rita, Olongapo City center coordinates (Horseshoe Drive / Santa Rita Road area)
export const STA_RITA_CENTER: [number, number] = [14.8489, 120.2911];

// Key roads of Barangay Sta. Rita, Olongapo City
export interface KeyRoadInfo {
  id: string;
  name: string;
  type: string;
  description: string;
  accessibilityStatus: string;
  trafficWarning?: string;
  coordinates: [number, number][]; // Line coordinates [lat, lng]
}

export const STA_RITA_KEY_ROADS: KeyRoadInfo[] = [
  {
    id: 'tabacuhan_rd',
    name: 'Tabacuhan Road',
    type: 'Major Secondary Route',
    description: 'A major secondary route prone to localized heavy flows and traffic near the Tabacuhan bridge/river area.',
    accessibilityStatus: 'Elevated sidewalk available; caution required near bridge bottleneck.',
    trafficWarning: 'Localized heavy vehicle traffic and pedestrian flow near Tabacuhan Bridge.',
    coordinates: [
      [14.8480, 120.2890],
      [14.8550, 120.2840],
      [14.8620, 120.2810]
    ]
  },
  {
    id: 'sta_rita_rd',
    name: 'Santa Rita Road',
    type: 'Primary Secondary Artery',
    description: 'A primary secondary artery linking inner residential zones outward.',
    accessibilityStatus: 'Smooth concrete pavement with tactile guide lines and curb cuts at major intersections.',
    coordinates: [
      [14.8380, 120.2930],
      [14.8480, 120.2910],
      [14.8520, 120.2880]
    ]
  },
  {
    id: 'balic_balic_rd',
    name: 'Balic-Balic Road',
    type: 'Key Local Interior Corridor',
    description: 'A key local interior corridor serving Purok sections and community routes.',
    accessibilityStatus: 'Flat interior pavement with step-free access to residential puroks.',
    coordinates: [
      [14.8480, 120.2910],
      [14.8450, 120.2950],
      [14.8420, 120.2990]
    ]
  },
  {
    id: 'filtration_rd',
    name: 'Filtration Road',
    type: 'Secondary Link',
    description: 'A secondary link passing through sections of the barangay.',
    accessibilityStatus: 'Paved secondary road connecting northern residential sectors.',
    coordinates: [
      [14.8500, 120.2900],
      [14.8550, 120.2930],
      [14.8600, 120.2960]
    ]
  },
  {
    id: 'del_rosario_st',
    name: 'Del Rosario Street',
    type: 'Boundary Connector',
    description: 'Connects outer edges and neighboring commercial-residential boundaries.',
    accessibilityStatus: 'Level ground with commercial storefront access and wide pedestrian shoulders.',
    coordinates: [
      [14.8350, 120.2910],
      [14.8390, 120.2930],
      [14.8420, 120.2940]
    ]
  },
  {
    id: 'horseshoe_dr',
    name: 'Horseshoe Drive',
    type: 'LGU & Civic Loop Corridor',
    description: 'Main civic loop housing Santa Rita Barangay Hall, Parish Church, Health Station, and Covered Court.',
    accessibilityStatus: 'Wide step-free concrete sidewalks, tactile paving strips, and clear priority lanes.',
    coordinates: [
      [14.8475, 120.2905],
      [14.8488, 120.2915],
      [14.8495, 120.2925]
    ]
  }
];

export const STA_RITA_LOCATIONS: LocationSpot[] = [
  {
    id: 'bhall',
    name: 'Santa Rita Barangay Hall & LGU Center',
    category: 'facility',
    address: 'Horseshoe Drive, Sta. Rita, Olongapo City 2200',
    zone: 'Zone 1 (Horseshoe)',
    coordinates: [14.8488, 120.2915],
    rating: 'highly_accessible',
    ratingScore: 5,
    distanceMeters: 50,
    features: ['Gentle Concrete Ramp with Handrails', 'Accessible PWD Restroom', 'PWD & Senior Priority Desk', 'Sign Language Assistant on Call', 'Braille & High-Contrast Directory'],
    hasRamp: true,
    hasAccessibleRestroom: true,
    hasElevatorOrGroundFloor: true,
    hasPriorityWindow: true,
    hasTactilePavingOrAudio: true,
    hasShadedSeating: true,
    audioCueText: 'Santa Rita Barangay Hall main entrance on Horseshoe Drive. Gentle slope wheelchair ramp at main entrance with grab bars and PWD priority desk inside.',
    contactNumber: '(047) 222-3456',
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    notes: 'Main government office for PWD ID application, barangay clearance, and senior assistance.'
  },
  {
    id: 'church',
    name: 'Santa Rita de Cascia Parish Church',
    category: 'establishment',
    address: 'Horseshoe Drive, Sta. Rita, Olongapo City 2200',
    zone: 'Zone 1 (Horseshoe)',
    coordinates: [14.8485, 120.2910],
    rating: 'highly_accessible',
    ratingScore: 5,
    distanceMeters: 120,
    features: ['Level Entry Ramp', 'Designated Front PWD Seating Area', 'PWD Accessible Parking Bay', 'Accessible Restroom with Grab Bars'],
    hasRamp: true,
    hasAccessibleRestroom: true,
    hasElevatorOrGroundFloor: true,
    hasPriorityWindow: false,
    hasTactilePavingOrAudio: true,
    hasShadedSeating: true,
    audioCueText: 'Santa Rita Parish Church entrance on Horseshoe Drive. Flat wheelchair entry ramp with reserved seating in front pews.',
    operatingHours: 'Daily: 6:00 AM - 7:00 PM',
    notes: 'Historical Catholic parish church consecrated in 1967. Features audio amplification and designated front row space for wheelchairs.'
  },
  {
    id: 'bhs',
    name: 'Sta. Rita Barangay Health Station (BHS)',
    category: 'health',
    address: 'Horseshoe Drive / Santa Rita Rd, Sta. Rita, Olongapo City 2200',
    zone: 'Zone 1 (Horseshoe)',
    coordinates: [14.8492, 120.2920],
    rating: 'highly_accessible',
    ratingScore: 5,
    distanceMeters: 180,
    features: ['Double Entrance Ramp', 'Free PWD Consultations & Medicines', 'Accessible Restroom with Grab Bars', 'Senior & PWD Priority Window', 'Shaded Waiting Area with Wheelchair Parking'],
    hasRamp: true,
    hasAccessibleRestroom: true,
    hasElevatorOrGroundFloor: true,
    hasPriorityWindow: true,
    hasTactilePavingOrAudio: false,
    hasShadedSeating: true,
    audioCueText: 'Sta. Rita Barangay Health Station ahead. South ramp is open for wheelchairs. Free consultations and medical assistance available for PWDs.',
    contactNumber: '(047) 224-2000',
    operatingHours: 'Mon-Sat: 8:00 AM - 5:00 PM',
    notes: 'Free medical consultations, BP monitoring, and basic medicines for registered PWD residents.'
  },
  {
    id: 'elem_school',
    name: 'Santa Rita Elementary School',
    category: 'school',
    address: 'Santa Rita Road, Sta. Rita, Olongapo City 2200',
    zone: 'Zone 2 (Central)',
    coordinates: [14.8475, 120.2895],
    rating: 'highly_accessible',
    ratingScore: 5,
    distanceMeters: 250,
    features: ['Rubber Non-slip Ramp at Main Gate', 'AudioBeacon Speaker at Gate', 'Ground Floor Classrooms Step-Free', 'Accessible PWD Restroom'],
    hasRamp: true,
    hasAccessibleRestroom: true,
    hasElevatorOrGroundFloor: true,
    hasPriorityWindow: false,
    hasTactilePavingOrAudio: true,
    hasShadedSeating: true,
    audioCueText: 'Santa Rita Elementary School main gate along Santa Rita Road. Established in 1932 as the first public school in Santa Rita.',
    contactNumber: '(047) 223-1122',
    operatingHours: 'Mon-Fri: 7:00 AM - 5:00 PM',
    notes: 'Historic first public school in Santa Rita (est. 1932). Serves as designated LGU evacuation center during emergencies.'
  },
  {
    id: 'high_school',
    name: 'Sta. Rita High School',
    category: 'school',
    address: 'Santa Rita Road, Sta. Rita, Olongapo City 2200',
    zone: 'Zone 3 (North)',
    coordinates: [14.8510, 120.2880],
    rating: 'highly_accessible',
    ratingScore: 4,
    distanceMeters: 410,
    features: ['Wide Front Wheelchair Ramp', 'Inclusive Education (SNED) Center', 'Ground Floor Inclusive Restroom', 'Shaded Waiting Shed'],
    hasRamp: true,
    hasAccessibleRestroom: true,
    hasElevatorOrGroundFloor: true,
    hasPriorityWindow: true,
    hasTactilePavingOrAudio: true,
    hasShadedSeating: true,
    audioCueText: 'Sta. Rita High School entrance along Santa Rita Road. Features wide step-free ramp and ground floor Special Needs Education (SNED) center.',
    contactNumber: '(047) 223-4455',
    operatingHours: 'Mon-Fri: 7:00 AM - 5:00 PM',
    notes: 'Public high school hosting Special Needs Education programs in Olongapo City.'
  },
  {
    id: 'tabacuhan_elem',
    name: 'Tabacuhan Elementary School',
    category: 'school',
    address: 'Tabacuhan Road, Sitio Tabacuhan, Sta. Rita, Olongapo City',
    zone: 'Zone 5 (Tabacuhan)',
    coordinates: [14.8580, 120.2830],
    rating: 'partially_accessible',
    ratingScore: 4,
    distanceMeters: 850,
    features: ['Gate Wheelchair Ramp', 'Step-free Ground Floor Classrooms', 'Shaded Tree Canopy'],
    hasRamp: true,
    hasAccessibleRestroom: true,
    hasElevatorOrGroundFloor: true,
    hasPriorityWindow: false,
    hasTactilePavingOrAudio: false,
    hasShadedSeating: true,
    audioCueText: 'Tabacuhan Elementary School along Tabacuhan Road. Ground floor access available for Sitio Tabacuhan students.',
    notes: 'Public primary school serving Sitio Tabacuhan.'
  },
  {
    id: 'balicbalic_elem',
    name: 'Balic-Balic Elementary School',
    category: 'school',
    address: 'Balic-Balic Road, Sta. Rita, Olongapo City',
    zone: 'Zone 4 (Balic-Balic)',
    coordinates: [14.8430, 120.2980],
    rating: 'partially_accessible',
    ratingScore: 4,
    distanceMeters: 780,
    features: ['Level Entrance', 'Covered Walkway', 'Ground Floor Access'],
    hasRamp: true,
    hasAccessibleRestroom: false,
    hasElevatorOrGroundFloor: true,
    hasPriorityWindow: false,
    hasTactilePavingOrAudio: false,
    hasShadedSeating: true,
    audioCueText: 'Balic-Balic Elementary School along Balic-Balic Road.',
    notes: 'Public elementary school serving the Balic-Balic community.'
  },
  {
    id: 'tatlong_cruz',
    name: 'Tatlong Cruz (Three Crosses Pilgrimage Site)',
    category: 'establishment',
    address: 'Balimpuyo Ridge, Sitio Tabacuhan, Sta. Rita, Olongapo City',
    zone: 'Sitio Tabacuhan',
    coordinates: [14.8610, 120.2810],
    rating: 'limited_access',
    ratingScore: 2,
    distanceMeters: 1400,
    features: ['Scenic Mountain Viewpoint', 'Shaded Rest Benches at Ridge Base', 'Historical Pilgrimage Site'],
    hasRamp: false,
    hasAccessibleRestroom: false,
    hasElevatorOrGroundFloor: false,
    hasPriorityWindow: false,
    hasTactilePavingOrAudio: false,
    hasShadedSeating: true,
    audioCueText: 'Tatlong Cruz pilgrimage site atop Balimpuyo Ridge. Contains 540 steps to peak; base rest area is accessible.',
    notes: 'Famous local pilgrimage landmark built in 1999. Peak requires climbing 540 steps.'
  },
  {
    id: 'martin_falls',
    name: 'Martin Falls (Tabacuhan Natural Falls)',
    category: 'establishment',
    address: 'Tabacuhan Mountain Range, Sta. Rita, Olongapo City',
    zone: 'Sitio Tabacuhan',
    coordinates: [14.8650, 120.2790],
    rating: 'inaccessible',
    ratingScore: 1,
    distanceMeters: 1800,
    features: ['Natural Mountain Waterfall', 'River Eco-trail'],
    hasRamp: false,
    hasAccessibleRestroom: false,
    hasElevatorOrGroundFloor: false,
    hasPriorityWindow: false,
    hasTactilePavingOrAudio: false,
    hasShadedSeating: false,
    audioCueText: 'Martin Falls in Tabacuhan mountains. Natural eco-trail with unpaved rocks and river stepping stones.',
    notes: 'Natural waterfall landmark in upper Tabacuhan mountains.'
  },
  {
    id: 'memorial_park',
    name: 'Olongapo Memorial Park',
    category: 'facility',
    address: 'Del Rosario Street, Sta. Rita, Olongapo City',
    zone: 'Del Rosario Sector',
    coordinates: [14.8390, 120.2940],
    rating: 'highly_accessible',
    ratingScore: 4,
    distanceMeters: 920,
    features: ['Wide Asphalt Pathways', 'Step-Free Lawn Access', 'Shaded Tree Paths'],
    hasRamp: true,
    hasAccessibleRestroom: true,
    hasElevatorOrGroundFloor: true,
    hasPriorityWindow: false,
    hasTactilePavingOrAudio: false,
    hasShadedSeating: true,
    audioCueText: 'Olongapo Memorial Park along Del Rosario Street. Wide asphalt roadways and flat lawn access.',
    notes: 'Public memorial park in southern Sta. Rita.'
  },
  {
    id: 'baptist_church',
    name: 'Lighthouse Bible Baptist Church',
    category: 'establishment',
    address: 'Horseshoe Drive near Barangay Hall, Sta. Rita, Olongapo City',
    zone: 'Zone 1 (Horseshoe)',
    coordinates: [14.8482, 120.2918],
    rating: 'highly_accessible',
    ratingScore: 4,
    distanceMeters: 90,
    features: ['Ground Floor Sanctuary', 'Wheelchair Ramp', 'Assisted Seating'],
    hasRamp: true,
    hasAccessibleRestroom: true,
    hasElevatorOrGroundFloor: true,
    hasPriorityWindow: false,
    hasTactilePavingOrAudio: false,
    hasShadedSeating: true,
    audioCueText: 'Lighthouse Bible Baptist Church located on Horseshoe Drive near Barangay Hall.',
    notes: 'Community Baptist church situated on Horseshoe Drive.'
  },
  {
    id: 'lds_church',
    name: 'The Church of Jesus Christ of Latter-day Saints',
    category: 'establishment',
    address: 'Capricorn St, Family Subd, Balic-Balic, Sta. Rita, Olongapo City',
    zone: 'Zone 4 (Balic-Balic)',
    coordinates: [14.8425, 120.2970],
    rating: 'highly_accessible',
    ratingScore: 5,
    distanceMeters: 810,
    features: ['Double Entrance Ramp', 'Level Paved Parking', 'Accessible Restrooms'],
    hasRamp: true,
    hasAccessibleRestroom: true,
    hasElevatorOrGroundFloor: true,
    hasPriorityWindow: false,
    hasTactilePavingOrAudio: false,
    hasShadedSeating: true,
    audioCueText: 'LDS Church on Capricorn Street in Family Subdivision, Balic-Balic.',
    notes: 'LDS meetinghouse serving Balic-Balic and Sta. Rita.'
  },
  {
    id: 'market',
    name: 'Sta. Rita Public Market & Plaza',
    category: 'establishment',
    address: 'Santa Rita Road corner Horseshoe Drive, Sta. Rita, Olongapo City',
    zone: 'Zone 2 (Central)',
    coordinates: [14.8470, 120.2905],
    rating: 'partially_accessible',
    ratingScore: 3,
    distanceMeters: 210,
    features: ['Gate A Entrance Ramp', 'PWD Priority Lane at Main Grocery', 'Level Concrete Wet & Dry Market Floor'],
    hasRamp: true,
    hasAccessibleRestroom: false,
    hasElevatorOrGroundFloor: true,
    hasPriorityWindow: true,
    hasTactilePavingOrAudio: false,
    hasShadedSeating: false,
    audioCueText: 'Sta. Rita Public Market Gate A ahead. Gate A has a step-free concrete ramp. Best visited between 1 PM and 4 PM for off-peak comfort.',
    operatingHours: 'Daily: 5:00 AM - 7:00 PM',
    notes: 'Gate B has stairs — always enter via Gate A for smooth wheelchair and stroller ramp access.'
  },
  {
    id: 'court',
    name: 'Sta. Rita Covered Gymnasium & Community Center',
    category: 'facility',
    address: 'Horseshoe Drive beside Barangay Hall, Sta. Rita, Olongapo City',
    zone: 'Zone 1 (Horseshoe)',
    coordinates: [14.8489, 120.2916],
    rating: 'highly_accessible',
    ratingScore: 5,
    distanceMeters: 60,
    features: ['Flush Threshold Entry', 'Spacious Smooth Basketball Court', 'PWD Spectator Area', 'Accessible Restroom'],
    hasRamp: true,
    hasAccessibleRestroom: true,
    hasElevatorOrGroundFloor: true,
    hasPriorityWindow: true,
    hasTactilePavingOrAudio: true,
    hasShadedSeating: true,
    audioCueText: 'Sta. Rita Covered Gymnasium ahead on Horseshoe Drive. Completely flush ground floor entrance with wide double doors.',
    operatingHours: 'Daily: 6:00 AM - 9:00 PM',
    notes: 'Primary venue for Barangay Sta. Rita PWD assemblies, sports, and community health events.'
  },
  {
    id: 'plaza',
    name: 'Santa Rita Plaza & Mini Park',
    category: 'rest_spot',
    address: 'Horseshoe Drive, Sta. Rita, Olongapo City',
    zone: 'Zone 1 (Horseshoe)',
    coordinates: [14.8486, 120.2912],
    rating: 'highly_accessible',
    ratingScore: 5,
    distanceMeters: 80,
    features: ['Paved Wide Pathways', 'Shaded Rest Benches every 30m', 'Barangay Security Guard Post', 'Smooth Pavement'],
    hasRamp: true,
    hasAccessibleRestroom: true,
    hasElevatorOrGroundFloor: true,
    hasPriorityWindow: false,
    hasTactilePavingOrAudio: true,
    hasShadedSeating: true,
    audioCueText: 'Sta. Rita Plaza and Park ahead. Flat paved walkways with frequent shaded rest benches and nearby Tanod post.',
    operatingHours: '24 Hours Open',
    notes: 'Great resting point for wheelchair users, seniors, and families.'
  },
  {
    id: 'pharmacy',
    name: 'Generika Pharmacy & Health Depot',
    category: 'establishment',
    address: 'Santa Rita Road near Horseshoe Dr, Sta. Rita, Olongapo City',
    zone: 'Zone 2 (Central)',
    coordinates: [14.8472, 120.2902],
    rating: 'highly_accessible',
    ratingScore: 4,
    distanceMeters: 200,
    features: ['Entrance Ramp', '20% PWD Discount & VAT Exemption Verification', 'Low Counter Desk'],
    hasRamp: true,
    hasAccessibleRestroom: false,
    hasElevatorOrGroundFloor: true,
    hasPriorityWindow: true,
    hasTactilePavingOrAudio: false,
    hasShadedSeating: false,
    audioCueText: 'Generika Pharmacy along Santa Rita Road. Step-free ramp entry and PWD 20% discount desk.',
    operatingHours: 'Daily: 7:00 AM - 9:00 PM',
    notes: 'Provides 20% discount and VAT exemption processing for PWD ID holders.'
  },
  {
    id: 'osca',
    name: 'Office of Senior Citizens Affairs (OSCA) & PWD Desk',
    category: 'facility',
    address: 'Horseshoe Drive (Adjacent to Barangay Hall), Sta. Rita, Olongapo City',
    zone: 'Zone 1 (Horseshoe)',
    coordinates: [14.8487, 120.2914],
    rating: 'highly_accessible',
    ratingScore: 5,
    distanceMeters: 40,
    features: ['Ramp Access with Grab Bars', 'Assistive Device Distribution Desk', 'Priority Services Window'],
    hasRamp: true,
    hasAccessibleRestroom: true,
    hasElevatorOrGroundFloor: true,
    hasPriorityWindow: true,
    hasTactilePavingOrAudio: false,
    hasShadedSeating: true,
    audioCueText: 'OSCA and PWD Assistance Desk located right beside the Barangay Hall on Horseshoe Drive with ramp access.'
  }
];

export const INITIAL_PROBLEM_REPORTS: ProblemReport[] = [
  {
    id: 'rep_1',
    problemType: 'blocked_ramp',
    title: 'Parked Vehicles Blocking Tabacuhan Bridge Sidewalk Ramp',
    locationDescription: 'Tabacuhan Road near Tabacuhan Bridge approach',
    zone: 'Zone 5 (Tabacuhan)',
    severity: 'high',
    details: 'Motorcycles and delivery tricycles parked directly across the wheelchair ramp onto Tabacuhan Bridge.',
    reportedBy: 'Pedro Santos (Wheelchair User)',
    status: 'under_review',
    createdAt: '2026-08-08',
    coordinates: [14.8520, 120.2860]
  },
  {
    id: 'rep_2',
    problemType: 'broken_sidewalk',
    title: 'Cracked & Sunken Sidewalk Tiles on Balic-Balic Road',
    locationDescription: 'Near Balic-Balic Elementary School pedestrian path',
    zone: 'Zone 4 (Balic-Balic)',
    severity: 'medium',
    details: 'Broken pavement creating a 4-inch lip obstacle that catches wheelchair wheels.',
    reportedBy: 'Maria Cruz',
    status: 'pending',
    createdAt: '2026-08-09',
    coordinates: [14.8440, 120.2965]
  },
  {
    id: 'rep_3',
    problemType: 'stairs_no_ramp',
    title: 'Lack of Ramp at Gate B of Sta. Rita Public Market',
    locationDescription: 'Santa Rita Road Gate B Entrance',
    zone: 'Zone 2 (Central)',
    severity: 'medium',
    details: 'Only 3 steep steps exist at Gate B. Requesting installation of a standard 1:12 incline ramp.',
    reportedBy: 'Juan Dela Cruz',
    status: 'pending',
    createdAt: '2026-08-10',
    coordinates: [14.8470, 120.2905]
  }
];

export const SAMPLE_ROUTE_OPTIONS: RouteOption[] = [
  {
    id: 'route_recommended',
    title: 'Recommended Accessible Route (Horseshoe Drive Loop)',
    summary: 'Wheelchair-friendly path via Horseshoe Drive with smooth concrete, gentle curb cuts, and no stairs.',
    rating: 'highly_accessible',
    ratingLabel: '♿ Highly Accessible',
    estimatedMinutes: 8,
    distanceKm: 0.45,
    stairsCount: 0,
    maxSlopeGradePercent: 2.5,
    roadCondition: 'Smooth paved concrete sidewalk with tactile edge guide',
    accessibleCrossingsCount: 2,
    warnings: ['Slightly busy during school dismissal hours (11:30 AM & 4:30 PM)'],
    highlights: [
      '✓ 100% Zero stairs or step thresholds',
      '✓ Smooth, wide concrete pathways',
      '✓ Accessible crossings with curb ramps',
      '✓ Shaded resting bench at Sta. Rita Plaza'
    ],
    waypoints: [
      [14.8488, 120.2915],
      [14.8486, 120.2912],
      [14.8485, 120.2910],
      [14.8492, 120.2920]
    ],
    steps: [
      {
        id: 's1',
        instruction: 'Start at Santa Rita Barangay Hall main entrance on Horseshoe Drive.',
        instructionTagalog: 'Magsimula sa pangunahing pintuan ng Santa Rita Barangay Hall sa Horseshoe Drive.',
        distanceMeters: 40,
        isAccessible: true,
        iconType: 'straight',
        coordinates: [14.8488, 120.2915]
      },
      {
        id: 's2',
        instruction: 'Use the gentle concrete ramp to descend onto Horseshoe Drive sidewalk.',
        instructionTagalog: 'Gamitin ang sementadong rampa patungo sa bangketa ng Horseshoe Drive.',
        distanceMeters: 80,
        isAccessible: true,
        iconType: 'ramp',
        coordinates: [14.8487, 120.2913]
      },
      {
        id: 's3',
        instruction: 'Pass Sta. Rita Plaza rest area and Santa Rita Parish Church entrance.',
        instructionTagalog: 'Magpatuloy sa Horseshoe Drive lagpas sa Sta. Rita Plaza at Parish Church.',
        distanceMeters: 120,
        isAccessible: true,
        iconType: 'straight',
        coordinates: [14.8485, 120.2910]
      },
      {
        id: 's4',
        instruction: 'Cross safely using the accessible signalized pedestrian crossing with curb cut.',
        instructionTagalog: 'Lumingon at tumawid gamit ang pedestrian crossing na may rampa.',
        distanceMeters: 110,
        isAccessible: true,
        iconType: 'crossing',
        coordinates: [14.8489, 120.2917]
      },
      {
        id: 's5',
        instruction: 'Arrive at Sta. Rita Barangay Health Station via the south wheelchair ramp on your right.',
        instructionTagalog: 'Dumating sa Sta. Rita Health Station gamit ang rampa sa iyong kanan.',
        distanceMeters: 100,
        isAccessible: true,
        iconType: 'destination',
        coordinates: [14.8492, 120.2920]
      }
    ]
  },
  {
    id: 'route_shortest',
    title: 'Santa Rita Road Cut-Through',
    summary: 'Direct 5-minute path along Santa Rita Road connecting to Horseshoe Drive.',
    rating: 'partially_accessible',
    ratingLabel: '🟡 Partially Accessible',
    estimatedMinutes: 5,
    distanceKm: 0.35,
    stairsCount: 0,
    maxSlopeGradePercent: 4.0,
    roadCondition: 'Concrete sidewalk with minor commercial driveway crossovers',
    accessibleCrossingsCount: 1,
    warnings: [
      '⚠ Minor commercial driveway drop-offs near store front'
    ],
    highlights: [
      '✓ Shorter walking distance (350 meters)',
      '✓ No stairs'
    ],
    waypoints: [
      [14.8488, 120.2915],
      [14.8475, 120.2895],
      [14.8492, 120.2920]
    ],
    steps: [
      {
        id: 's1',
        instruction: 'Head west from Barangay Hall towards Santa Rita Road.',
        instructionTagalog: 'Pumunta sa pa-kanluran mula Barangay Hall patungong Santa Rita Road.',
        distanceMeters: 100,
        isAccessible: true,
        iconType: 'straight',
        coordinates: [14.8488, 120.2915]
      },
      {
        id: 's2',
        instruction: 'Pass Santa Rita Elementary School (established 1932) on your left.',
        instructionTagalog: 'Magpatuloy lagpas sa Santa Rita Elementary School sa iyong kaliwa.',
        distanceMeters: 150,
        isAccessible: true,
        iconType: 'straight',
        coordinates: [14.8475, 120.2895]
      },
      {
        id: 's3',
        instruction: 'Turn right onto Horseshoe Drive towards Health Station entrance.',
        instructionTagalog: 'Lumingon pakanan sa Horseshoe Drive patungong Health Station.',
        distanceMeters: 100,
        isAccessible: true,
        iconType: 'destination',
        coordinates: [14.8492, 120.2920]
      }
    ]
  }
];
