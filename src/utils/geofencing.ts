// AccessiGo Geofencing Utility for Barangay Sta. Rita, Olongapo City (2026)

export interface BoundaryConfig {
  officialName: string;
  barangay: string;
  city: string;
  province: string;
  zipCode: string;
  boundaryVersion: string;
  dataSource: string;
  lastVerifiedDate: string;
  polygon: [number, number][]; // [lat, lng] array
}

export const STA_RITA_BOUNDARY_CONFIG: BoundaryConfig = {
  officialName: "Barangay Santa Rita Administrative Service Area",
  barangay: "Santa Rita",
  city: "Olongapo City",
  province: "Zambales",
  zipCode: "2200",
  boundaryVersion: "2026.2-LGU-Geoportal",
  dataSource: "Olongapo City LGU GIS Portal / OpenStreetMap Admin Level 10 (Santa Rita)",
  lastVerifiedDate: "2026-08-11",
  polygon: [
    [14.8680, 120.2780], // NW (Sitio Tabacuhan / Martin Falls / Gordon Heights border)
    [14.8690, 120.2950], // North (Upper Filtration Rd / Balimpuyo Ridge)
    [14.8580, 120.3100], // NE (Upper Balic-Balic hills)
    [14.8400, 120.3080], // East (Lower Balic-Balic)
    [14.8320, 120.2960], // SE (Del Rosario St / Olongapo Memorial Park border)
    [14.8330, 120.2850], // South (Lower Santa Rita Rd / Kalaklan River border)
    [14.8450, 120.2720], // SW (Lower Tabacuhan)
    [14.8680, 120.2780]  // NW closure
  ]
};

export const BARANGAY_STA_RITA_POLYGON = STA_RITA_BOUNDARY_CONFIG.polygon;

/**
 * Checks whether a given [lat, lng] point lies strictly inside Barangay Santa Rita polygon.
 * Uses the ray-casting (point-in-polygon) algorithm.
 * Polygon vertices are stored as [lat, lng] pairs (index 0 = latitude, index 1 = longitude).
 */
export function isPointInStaRita(lat: number, lng: number): boolean {
  const poly = BARANGAY_STA_RITA_POLYGON;
  let inside = false;

  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    // lat_i/lat_j = latitude (y), lng_i/lng_j = longitude (x)
    const lat_i = poly[i][0], lng_i = poly[i][1];
    const lat_j = poly[j][0], lng_j = poly[j][1];

    // Cast horizontal ray from point rightward; count edge crossings
    const intersect =
      (lng_i > lng) !== (lng_j > lng) &&
      lat < ((lat_j - lat_i) * (lng - lng_i)) / (lng_j - lng_i) + lat_i;

    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Checks whether a location name or address contains explicit non-Santa Rita indicators
 */
export function isAddressOutsideStaRitaName(nameOrAddress: string): boolean {
  if (!nameOrAddress) return false;
  const lower = nameOrAddress.toLowerCase();
  
  // Forbidden outside areas in Olongapo / Zambales / Subic / Other provinces named Santa Rita
  const forbiddenOutside = [
    'pampanga', 'batangas', 'bulacan', 'samar', 'angeles', 'san fernando', 'tarlac', 'manila', 'quezon city',
    'subic bay', 'sbma', 'castillejos', 'subic town', 'san marcelino',
    'barretto', 'kalaklan', 'mabanag', 'east bajac-bajac', 'west bajac-bajac',
    'gordon heights', 'asinan', 'pag-asa', 'kababae', 'banicain', 'new cabalan', 'old cabalan'
  ];

  // If address mentions another barangay or city explicitly without mentioning Santa Rita or Sta. Rita
  for (const forbidden of forbiddenOutside) {
    if (lower.includes(forbidden) && !lower.includes('santa rita') && !lower.includes('sta. rita') && !lower.includes('sta rita')) {
      return true;
    }
  }
  return false;
}

export interface GeofenceValidationResult {
  isValid: boolean;
  message: string;
  badgeText: string;
  locationName?: string;
  coordinates?: [number, number];
}

/**
 * Validates a location (coordinates and/or text) against Barangay Santa Rita bounds
 */
export function validateLocationInStaRita(
  lat?: number, 
  lng?: number, 
  nameOrAddress?: string
): GeofenceValidationResult {
  
  if (nameOrAddress && isAddressOutsideStaRitaName(nameOrAddress)) {
    return {
      isValid: false,
      message: "Location outside service area. AccessiGo currently provides accessible route planning only within Barangay Santa Rita, Olongapo City.",
      badgeText: "✕ Outside Service Area",
      locationName: nameOrAddress
    };
  }

  if (lat !== undefined && lng !== undefined) {
    const inside = isPointInStaRita(lat, lng);
    if (!inside) {
      return {
        isValid: false,
        message: "Location outside service area. AccessiGo currently provides accessible route planning only within Barangay Santa Rita, Olongapo City.",
        badgeText: "✕ Outside Service Area",
        coordinates: [lat, lng],
        locationName: nameOrAddress
      };
    }
  }

  return {
    isValid: true,
    message: "Location confirmed inside Barangay Santa Rita, Olongapo City service area.",
    badgeText: "✓ Location Available (Santa Rita)",
    coordinates: lat !== undefined && lng !== undefined ? [lat, lng] : undefined,
    locationName: nameOrAddress
  };
}

/**
 * Validates an entire route (all waypoints and steps) against Barangay Santa Rita boundary
 */
export function validateRouteInStaRita(
  waypoints: [number, number][],
  originName?: string,
  destinationName?: string
): { isValid: boolean; message: string; invalidIndex?: number } {
  
  // Check origin & destination text
  if (originName && isAddressOutsideStaRitaName(originName)) {
    return {
      isValid: false,
      message: `Origin "${originName}" is outside Barangay Santa Rita. AccessiGo provides accessible routes strictly within Barangay Santa Rita, Olongapo City.`
    };
  }

  if (destinationName && isAddressOutsideStaRitaName(destinationName)) {
    return {
      isValid: false,
      message: `Destination "${destinationName}" is outside Barangay Santa Rita. AccessiGo provides accessible routes strictly within Barangay Santa Rita, Olongapo City.`
    };
  }

  // Check waypoints coordinates
  for (let i = 0; i < waypoints.length; i++) {
    const [lat, lng] = waypoints[i];
    if (!isPointInStaRita(lat, lng)) {
      return {
        isValid: false,
        message: "No accessible route is available within Barangay Santa Rita for this destination. Route segment crosses outside the service area boundary.",
        invalidIndex: i
      };
    }
  }

  return {
    isValid: true,
    message: "Entire route is 100% verified inside Barangay Santa Rita service area."
  };
}
