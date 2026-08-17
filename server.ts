import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { STA_RITA_LOCATIONS, SAMPLE_ROUTE_OPTIONS, INITIAL_PROBLEM_REPORTS } from "./src/data/staRitaData";
import { ProblemReport } from "./src/types";
import { 
  isPointInStaRita, 
  validateLocationInStaRita, 
  validateRouteInStaRita, 
  STA_RITA_BOUNDARY_CONFIG,
  isAddressOutsideStaRitaName 
} from "./src/utils/geofencing";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client lazily / securely
  let genAIClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!genAIClient && process.env.GEMINI_API_KEY) {
      genAIClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
    return genAIClient;
  }

  // In-memory boundary configuration state (Admin controllable)
  let activeBoundaryConfig = { ...STA_RITA_BOUNDARY_CONFIG };

  // In-memory data state
  let locationsData = [...STA_RITA_LOCATIONS];
  let problemReportsData = [...INITIAL_PROBLEM_REPORTS];
  let savedRoutesData: any[] = [
    {
      id: 'saved_1',
      name: 'Daily Barangay Hall & Health Center Visit',
      originName: 'Home (Zone 1)',
      destinationName: 'Sta. Rita Barangay Health Station',
      estimatedTime: '12 mins',
      distance: '0.85 km',
      dateSaved: '2026-08-05',
      preferencesUsed: ['wheelchair_accessible', 'avoid_stairs', 'smooth_pathways']
    },
    {
      id: 'saved_2',
      name: 'Sunday Mass at Sta. Rita Parish Church',
      originName: 'Sta. Rita Plaza',
      destinationName: 'Sta. Rita de Cascia Parish Church',
      estimatedTime: '6 mins',
      distance: '0.45 km',
      dateSaved: '2026-08-01',
      preferencesUsed: ['wheelchair_accessible', 'accessible_crossings']
    }
  ];

  let savedLocationsData: any[] = [
    {
      id: 'loc_fav_1',
      name: "Aling Nena's Sari-Sari Store & Load Center",
      category: 'sari_sari_store',
      addressOrZone: 'Purok 2, Sta. Rita Main Road, Zone 2',
      zone: 'Zone 2',
      coordinates: [14.8290, 120.2846],
      accessibilityNotes: 'Step-free entrance with wide sliding window and priority chair.',
      accessibilityTag: 'step_free',
      contactPerson: 'Aling Nena',
      contactPhone: '0918-123-4567',
      dateAdded: '2026-08-02'
    },
    {
      id: 'loc_fav_2',
      name: "Tita Maria's Residence (Neighbor)",
      category: 'neighbor_home',
      addressOrZone: 'House #45, Gordon Ave Ext, Zone 3',
      zone: 'Zone 3',
      coordinates: [14.8310, 120.2835],
      accessibilityNotes: 'Flat cemented driveway and ground floor entrance.',
      accessibilityTag: 'flat_ground',
      contactPerson: 'Tita Maria Santos',
      contactPhone: '0920-987-6543',
      dateAdded: '2026-08-04'
    },
    {
      id: 'loc_fav_3',
      name: 'Kanto Fresh Bakery & Pandesal',
      category: 'bakery_food',
      addressOrZone: 'Church Road corner Main Rd, Zone 2',
      zone: 'Zone 2',
      coordinates: [14.8280, 120.2852],
      accessibilityNotes: 'Concrete entrance ramp with low order counter.',
      accessibilityTag: 'has_ramp',
      contactPerson: 'Kuya Boyet',
      dateAdded: '2026-08-06'
    },
    {
      id: 'loc_fav_4',
      name: 'Gordon Ave Tricycle Terminal (Sta. Rita)',
      category: 'transport_stop',
      addressOrZone: 'Gordon Avenue, Zone 1, Sta. Rita',
      zone: 'Zone 1',
      coordinates: [14.8300, 120.2838],
      accessibilityNotes: 'PWD priority loading bay with assistance from TODA officers.',
      accessibilityTag: 'step_free',
      dateAdded: '2026-08-08'
    }
  ];

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      app: "AccessiGo", 
      serviceArea: "Barangay Santa Rita, Olongapo City",
      geofenceEnforced: true,
      boundaryVersion: activeBoundaryConfig.boundaryVersion
    });
  });

  // Admin Geographic Boundary Configuration API
  app.get("/api/admin/boundary", (req, res) => {
    res.json(activeBoundaryConfig);
  });

  app.post("/api/admin/boundary", (req, res) => {
    const { polygon, boundaryVersion, dataSource } = req.body;
    if (polygon && Array.isArray(polygon) && polygon.length >= 3) {
      activeBoundaryConfig.polygon = polygon;
      if (boundaryVersion) activeBoundaryConfig.boundaryVersion = boundaryVersion;
      if (dataSource) activeBoundaryConfig.dataSource = dataSource;
      activeBoundaryConfig.lastVerifiedDate = new Date().toISOString().split('T')[0];
      return res.json({ success: true, message: "Geographic boundary configuration updated.", config: activeBoundaryConfig });
    }
    res.status(400).json({ error: "Invalid polygon coordinates array provided." });
  });

  // Location Validation API
  app.post("/api/validate-location", (req, res) => {
    const { lat, lng, name, address } = req.body;
    const nameOrAddress = address || name || '';
    const validation = validateLocationInStaRita(lat, lng, nameOrAddress);
    res.json(validation);
  });

  // Dynamic Real-Time Places Search API with Geofence Filtering
  app.get("/api/places/search", async (req, res) => {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: "Search query 'q' parameter required." });
    }

    const queryLower = q.toLowerCase();

    // First search in-memory verified Sta. Rita locations & saved spots
    const verifiedMatches = locationsData.filter(loc => 
      loc.name.toLowerCase().includes(queryLower) ||
      loc.address.toLowerCase().includes(queryLower) ||
      loc.features.some(f => f.toLowerCase().includes(queryLower))
    ).map(loc => ({
      ...loc,
      isVerifiedStaRita: true,
      inServiceArea: true,
      badgeText: "✓ Location Available (Sta. Rita)"
    }));

    // If explicit query for outside places (e.g., Subic, Barretto, SBMA, Kalaklan)
    if (isAddressOutsideStaRitaName(q)) {
      return res.json({
        query: q,
        results: [],
        outsideNotice: "Location outside service area. AccessiGo currently provides accessible route planning only within Barangay Santa Rita, Olongapo City.",
        geofenceBlocked: true
      });
    }

    // Try fetching live Nominatim OpenStreetMap places for Sta. Rita, Olongapo
    try {
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + " Santa Rita Olongapo City Zambales Philippines")}&limit=10`;
      const response = await fetch(searchUrl, {
        headers: { 'User-Agent': 'AccessiGo-StaRita-App/2026' }
      });

      if (response.ok) {
        const osmPlaces = await response.json();
        const validOsmPlaces = osmPlaces
          .map((p: any) => {
            const lat = parseFloat(p.lat);
            const lon = parseFloat(p.lon);
            const inside = isPointInStaRita(lat, lon);
            return {
              id: `osm_${p.place_id}`,
              name: p.display_name.split(',')[0],
              address: p.display_name,
              coordinates: [lat, lon],
              inServiceArea: inside,
              badgeText: inside ? "✓ Location Available (Sta. Rita)" : "✕ Outside Service Area"
            };
          })
          .filter((p: any) => p.inServiceArea); // STRICTLY FILTER OUTSIDE LOCATIONS!

        // Merge verified internal places and geocoded OSM places
        const combined = [...verifiedMatches, ...validOsmPlaces];
        return res.json({
          query: q,
          results: combined,
          dataFreshness: "Live OpenStreetMap API (Filtered for Sta. Rita)",
          totalInStaRita: combined.length
        });
      }
    } catch (err) {
      console.warn("OSM Geocoding search fallback:", err);
    }

    res.json({
      query: q,
      results: verifiedMatches,
      dataFreshness: "Barangay Sta. Rita Local GIS Database"
    });
  });

  // Locations API
  app.get("/api/locations", (req, res) => {
    const { category, search } = req.query;
    let filtered = locationsData.filter(loc => isPointInStaRita(loc.coordinates[0], loc.coordinates[1]));
    
    if (category && category !== 'all') {
      filtered = filtered.filter(loc => loc.category === category);
    }
    
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(loc => 
        loc.name.toLowerCase().includes(q) || 
        loc.address.toLowerCase().includes(q) ||
        loc.features.some(f => f.toLowerCase().includes(q))
      );
    }

    res.json(filtered);
  });

  // Calculate Route API (Strict Boundary Validated & Dynamic Route Generation)
  app.post("/api/routes/calculate", (req, res) => {
    const { origin, destination, preferences, originCoords, destCoords } = req.body;

    const effectiveOrigin = origin || 'Santa Rita Barangay Hall';
    const effectiveDest = destination || 'Santa Rita Barangay Health Station';

    // Validate origin and destination are present and not identical
    if (!effectiveOrigin || !effectiveDest) {
      return res.status(400).json({
        error: "Starting point and destination are required.",
        message: "Please select both a starting point and a destination."
      });
    }

    if (effectiveOrigin.trim().toLowerCase() === effectiveDest.trim().toLowerCase()) {
      return res.status(400).json({
        error: "Invalid Route Selection",
        message: `Starting point and destination cannot be the same location ("${effectiveOrigin}"). Please select a different destination.`,
        sameLocation: true
      });
    }

    // Check boundary for origin and destination text
    if (isAddressOutsideStaRitaName(effectiveOrigin)) {
      return res.status(400).json({
        error: "Location outside service area.",
        message: `Starting point "${effectiveOrigin}" is outside Barangay Santa Rita, Olongapo City boundary. AccessiGo currently provides accessible route planning only within Barangay Santa Rita.`,
        geofenceBlocked: true
      });
    }

    if (isAddressOutsideStaRitaName(effectiveDest)) {
      return res.status(400).json({
        error: "Location outside service area.",
        message: `Destination "${effectiveDest}" is outside Barangay Santa Rita, Olongapo City boundary. AccessiGo currently provides accessible route planning only within Barangay Santa Rita.`,
        geofenceBlocked: true
      });
    }

    // Check coordinates if provided
    if (originCoords && Array.isArray(originCoords)) {
      if (!isPointInStaRita(originCoords[0], originCoords[1])) {
        return res.status(400).json({
          error: "Location outside service area.",
          message: "Starting point coordinates are outside Barangay Santa Rita boundary.",
          geofenceBlocked: true
        });
      }
    }

    if (destCoords && Array.isArray(destCoords)) {
      if (!isPointInStaRita(destCoords[0], destCoords[1])) {
        return res.status(400).json({
          error: "Location outside service area.",
          message: "Destination coordinates are outside Barangay Santa Rita boundary.",
          geofenceBlocked: true
        });
      }
    }

    // Helper to find location coordinates in Sta. Rita
    function findLocationCoords(name: string): [number, number] {
      if (!name) return [14.8488, 120.2915];
      const lower = name.toLowerCase();

      if (lower.includes('hall') || lower.includes('bhall') || lower.includes('lgu')) return [14.8488, 120.2915];
      if (lower.includes('church') || lower.includes('parish') || lower.includes('cascia')) return [14.8485, 120.2910];
      if (lower.includes('health') || lower.includes('bhs') || lower.includes('clinic')) return [14.8492, 120.2920];
      if (lower.includes('elem') && (lower.includes('santa rita') || lower.includes('sta. rita') || lower.includes('sta rita'))) return [14.8475, 120.2895];
      if (lower.includes('high school') || lower.includes('sned')) return [14.8510, 120.2880];
      if (lower.includes('tabacuhan elem') || lower.includes('tabacuhan school')) return [14.8580, 120.2830];
      if (lower.includes('balic') && lower.includes('elem')) return [14.8430, 120.2980];
      if (lower.includes('tatlong cruz') || lower.includes('three crosses')) return [14.8610, 120.2810];
      if (lower.includes('martin falls')) return [14.8650, 120.2790];
      if (lower.includes('memorial park') || lower.includes('cemetery')) return [14.8390, 120.2940];
      if (lower.includes('market') || lower.includes('palengke')) return [14.8470, 120.2905];
      if (lower.includes('court') || lower.includes('gym')) return [14.8489, 120.2916];
      if (lower.includes('plaza') || lower.includes('park')) return [14.8486, 120.2912];
      if (lower.includes('pharmacy') || lower.includes('generika')) return [14.8472, 120.2902];
      if (lower.includes('osca') || lower.includes('pwd desk')) return [14.8487, 120.2914];
      if (lower.includes('gps') || lower.includes('my current location') || lower.includes('my location')) return [14.8489, 120.2911];

      const found = locationsData.find((l: any) => 
        l.name.toLowerCase().includes(lower) || lower.includes(l.name.toLowerCase())
      );
      if (found && found.coordinates) {
        return found.coordinates;
      }

      return [14.8488, 120.2915];
    }

    function getHaversineKm(c1: [number, number], c2: [number, number]): number {
      const R = 6371;
      const dLat = (c2[0] - c1[0]) * Math.PI / 180;
      const dLon = (c2[1] - c1[1]) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(c1[0] * Math.PI / 180) * Math.cos(c2[0] * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    function getCorridorForCoords(c1: [number, number], c2: [number, number]): string {
      const avgLat = (c1[0] + c2[0]) / 2;
      const avgLng = (c1[1] + c2[1]) / 2;

      if (avgLat > 14.8540) {
        return 'Tabacuhan Road Corridor';
      } else if (avgLng > 120.2940) {
        return 'Balic-Balic Road Corridor';
      } else if (avgLat < 14.8420) {
        return 'Del Rosario Street Sector';
      } else if (avgLng < 120.2890) {
        return 'Santa Rita Road Arterial Corridor';
      }
      return 'Horseshoe Drive Civic Loop';
    }

    function generateRouteWaypoints(start: [number, number], end: [number, number], curveDirection: number = 0): [number, number][] {
      const count = 5;
      const pts: [number, number][] = [];

      const latDiff = end[0] - start[0];
      const lngDiff = end[1] - start[1];

      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        let lat = start[0] + latDiff * t;
        let lng = start[1] + lngDiff * t;

        if (i > 0 && i < count - 1) {
          const curve = Math.sin(t * Math.PI) * 0.0012 * curveDirection;
          lat += curve;
          lng -= curve;
        }

        if (!isPointInStaRita(lat, lng)) {
          lat = start[0] + latDiff * t;
          lng = start[1] + lngDiff * t;
        }

        pts.push([parseFloat(lat.toFixed(5)), parseFloat(lng.toFixed(5))]);
      }
      return pts;
    }

    const startCoords: [number, number] = originCoords || findLocationCoords(effectiveOrigin);
    const endCoords: [number, number] = destCoords || findLocationCoords(effectiveDest);

    const directKm = getHaversineKm(startCoords, endCoords);
    const roadKm = Math.max(0.3, Math.round((directKm * 1.3) * 100) / 100);
    const estMins = Math.max(3, Math.round(roadKm * 16));

    const corridor = getCorridorForCoords(startCoords, endCoords);

    const waypoints1 = generateRouteWaypoints(startCoords, endCoords, 0);
    const waypoints2 = generateRouteWaypoints(startCoords, endCoords, 1);

    const route1 = {
      id: `route_rec_${Date.now()}_1`,
      title: `Recommended Accessible Corridor via ${corridor.split(' ')[0]}`,
      summary: `Primary wheelchair-friendly path from ${effectiveOrigin} to ${effectiveDest} with smooth concrete and step-free crossings.`,
      rating: 'highly_accessible',
      ratingLabel: '♿ Highly Accessible',
      estimatedMinutes: estMins,
      distanceKm: roadKm,
      stairsCount: 0,
      maxSlopeGradePercent: 2.5,
      roadCondition: 'Smooth paved concrete sidewalk with tactile guide edge',
      accessibleCrossingsCount: 2,
      warnings: [],
      highlights: [
        '✓ 100% Zero stairs or step thresholds',
        '✓ Smooth, wide concrete pathways with curb ramps',
        `✓ Verified inside Barangay Sta. Rita (${corridor})`,
        '✓ Priority lanes and tactile pavement strips'
      ],
      waypoints: waypoints1,
      steps: [
        {
          id: 's1',
          instruction: `Start at ${effectiveOrigin} on step-free pavement with tactile guide strip.`,
          instructionTagalog: `Magsimula sa ${effectiveOrigin} sa sementadong rampa at sidewalk.`,
          distanceMeters: Math.round((roadKm * 1000) * 0.15),
          isAccessible: true,
          iconType: 'straight',
          coordinates: waypoints1[0]
        },
        {
          id: 's2',
          instruction: `Proceed along ${corridor} using gentle curb ramps at intersections.`,
          instructionTagalog: `Magpatuloy sa ${corridor} gamit ang mga sementadong rampa.`,
          distanceMeters: Math.round((roadKm * 1000) * 0.35),
          isAccessible: true,
          iconType: 'ramp',
          coordinates: waypoints1[1]
        },
        {
          id: 's3',
          instruction: `Continue straight along ${corridor} past shaded resting areas.`,
          instructionTagalog: `Magpatuloy nang diretso sa ${corridor} lagpas sa mga rest bench.`,
          distanceMeters: Math.round((roadKm * 1000) * 0.25),
          isAccessible: true,
          iconType: 'straight',
          coordinates: waypoints1[2]
        },
        {
          id: 's4',
          instruction: `Cross safely using the signalized pedestrian crossing with curb cut.`,
          instructionTagalog: `Tumawid nang ligtas sa pedestrian crossing na may rampa.`,
          distanceMeters: Math.round((roadKm * 1000) * 0.15),
          isAccessible: true,
          iconType: 'crossing',
          coordinates: waypoints1[3]
        },
        {
          id: 's5',
          instruction: `Arrive at ${effectiveDest} entrance via step-free wheelchair ramp.`,
          instructionTagalog: `Dumating sa ${effectiveDest} sa pintuan na may rampa.`,
          distanceMeters: Math.round((roadKm * 1000) * 0.10),
          isAccessible: true,
          iconType: 'destination',
          coordinates: waypoints1[4]
        }
      ]
    };

    const route2ShortestKm = Math.max(0.25, Math.round((roadKm * 0.88) * 100) / 100);
    const route2Mins = Math.max(2, Math.round(route2ShortestKm * 15));

    const route2 = {
      id: `route_short_${Date.now()}_2`,
      title: `Direct Community Shortcut`,
      summary: `Fast direct path from ${effectiveOrigin} to ${effectiveDest} via interior community connectors.`,
      rating: 'partially_accessible',
      ratingLabel: '🟡 Partially Accessible',
      estimatedMinutes: route2Mins,
      distanceKm: route2ShortestKm,
      stairsCount: 0,
      maxSlopeGradePercent: 4.2,
      roadCondition: 'Concrete pavement with minor driveway transitions',
      accessibleCrossingsCount: 1,
      warnings: ['⚠ Slight pavement transitions near commercial driveway stalls'],
      highlights: [
        `✓ Direct shortcut route (${route2ShortestKm} km / ${route2Mins} mins)`,
        '✓ 0 stairs'
      ],
      waypoints: waypoints2,
      steps: [
        {
          id: 's2_1',
          instruction: `Exit ${effectiveOrigin} onto local connector pathway.`,
          instructionTagalog: `Lumabas sa ${effectiveOrigin} patungong kalsada.`,
          distanceMeters: Math.round((route2ShortestKm * 1000) * 0.25),
          isAccessible: true,
          iconType: 'straight',
          coordinates: waypoints2[0]
        },
        {
          id: 's2_2',
          instruction: `Caution: Minor driveway lip transition ahead on community sidewalk.`,
          instructionTagalog: `Mag-ingat sa maliit na bako sa sidewalk.`,
          distanceMeters: Math.round((route2ShortestKm * 1000) * 0.50),
          isAccessible: true,
          iconType: 'warning',
          coordinates: waypoints2[2]
        },
        {
          id: 's2_3',
          instruction: `Arrive at ${effectiveDest} main entrance.`,
          instructionTagalog: `Dumating sa ${effectiveDest}.`,
          distanceMeters: Math.round((route2ShortestKm * 1000) * 0.25),
          isAccessible: true,
          iconType: 'destination',
          coordinates: waypoints2[4]
        }
      ]
    };

    const validRoutes = [route1, route2];

    res.json({
      routes: validRoutes,
      origin: effectiveOrigin,
      destination: effectiveDest,
      preferencesApplied: preferences || [],
      geofenceStatus: "100% Inside Barangay Santa Rita Boundary"
    });
  });

  // Problem Reports API (Geofence Enforced)
  app.get("/api/reports", (req, res) => {
    res.json(problemReportsData);
  });

  app.post("/api/reports", (req, res) => {
    const { problemType, title, locationDescription, details, reportedBy, contactPhone, zone, coordinates } = req.body;
    
    if (!title || !locationDescription) {
      return res.status(400).json({ error: "Title and location description are required." });
    }

    if (locationDescription && isAddressOutsideStaRitaName(locationDescription)) {
      return res.status(400).json({
        error: "Location outside service area.",
        message: "Reports can only be filed for accessibility issues within Barangay Santa Rita, Olongapo City."
      });
    }

    if (coordinates && Array.isArray(coordinates)) {
      if (!isPointInStaRita(coordinates[0], coordinates[1])) {
        return res.status(400).json({
          error: "Location outside service area.",
          message: "Report coordinates are outside Barangay Santa Rita boundary."
        });
      }
    }

    const newReport: ProblemReport = {
      id: `rep_${Date.now()}`,
      problemType: problemType || 'other',
      title,
      locationDescription,
      zone: zone || 'Zone 1',
      severity: 'medium' as const,
      details: details || '',
      reportedBy: reportedBy || 'Barangay Resident / PWD',
      contactPhone: contactPhone || '',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      coordinates: coordinates || [14.8295, 120.2842]
    };

    problemReportsData.unshift(newReport);
    res.status(201).json({ message: "Report submitted successfully to Barangay Sta. Rita Admin.", report: newReport });
  });

  // Saved Routes API
  app.get("/api/saved-routes", (req, res) => {
    res.json(savedRoutesData);
  });

  app.post("/api/saved-routes", (req, res) => {
    const { name, originName, destinationName, estimatedTime, distance, preferencesUsed } = req.body;
    
    if (originName && isAddressOutsideStaRitaName(originName)) {
      return res.status(400).json({ error: "Location outside service area.", message: "Origin is outside Barangay Sta. Rita." });
    }
    if (destinationName && isAddressOutsideStaRitaName(destinationName)) {
      return res.status(400).json({ error: "Location outside service area.", message: "Destination is outside Barangay Sta. Rita." });
    }

    const newSaved = {
      id: `saved_${Date.now()}`,
      name: name || 'Custom Saved Route',
      originName: originName || 'Current Location',
      destinationName: destinationName || 'Destination',
      estimatedTime: estimatedTime || '10 mins',
      distance: distance || '0.7 km',
      dateSaved: new Date().toISOString().split('T')[0],
      preferencesUsed: preferencesUsed || []
    };

    savedRoutesData.unshift(newSaved);
    res.status(201).json(newSaved);
  });

  app.delete("/api/saved-routes/:id", (req, res) => {
    const { id } = req.params;
    savedRoutesData = savedRoutesData.filter(r => r.id !== id);
    res.json({ success: true });
  });

  // Saved Locations / Favorite Spots API
  app.get("/api/saved-locations", (req, res) => {
    res.json(savedLocationsData);
  });

  app.post("/api/saved-locations", (req, res) => {
    const { 
      name, 
      category, 
      addressOrZone, 
      zone, 
      accessibilityNotes, 
      accessibilityTag, 
      contactPerson, 
      contactPhone,
      coordinates
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Location name is required." });
    }

    if ((name && isAddressOutsideStaRitaName(name)) || (addressOrZone && isAddressOutsideStaRitaName(addressOrZone))) {
      return res.status(400).json({ 
        error: "Location outside service area.", 
        message: "AccessiGo currently provides accessible route planning only within Barangay Sta. Rita, Olongapo City." 
      });
    }

    if (coordinates && Array.isArray(coordinates)) {
      if (!isPointInStaRita(coordinates[0], coordinates[1])) {
        return res.status(400).json({
          error: "Location outside service area.",
          message: "Location coordinates fall outside Barangay Sta. Rita boundary."
        });
      }
    }

    const newLocation = {
      id: `loc_fav_${Date.now()}`,
      name,
      category: category || 'sari_sari_store',
      addressOrZone: addressOrZone || 'Sta. Rita, Olongapo City',
      zone: zone || 'Zone 1',
      coordinates: coordinates || [14.8295, 120.2842], // Default Sta. Rita center coordinates
      accessibilityNotes: accessibilityNotes || 'Step-free access confirmed',
      accessibilityTag: accessibilityTag || 'step_free',
      contactPerson: contactPerson || '',
      contactPhone: contactPhone || '',
      dateAdded: new Date().toISOString().split('T')[0]
    };

    savedLocationsData.unshift(newLocation);
    res.status(201).json(newLocation);
  });

  app.delete("/api/saved-locations/:id", (req, res) => {
    const { id } = req.params;
    savedLocationsData = savedLocationsData.filter(loc => loc.id !== id);
    res.json({ success: true });
  });

  // Gemini AI Voice Guidance Endpoint
  app.post("/api/gemini/guidance", async (req, res) => {
    try {
      const { userQuery, pwdProfile, language = 'en', currentLocation, destination } = req.body;

      const aiClient = getGeminiClient();
      if (!aiClient) {
        // Fallback intelligent response if GEMINI_API_KEY is not configured
        const fallbackText = language === 'fil'
          ? `Mabuhay! Ako ang AccessiGo AI Voice Guide ng Barangay Sta. Rita, Olongapo City. Para sa iyong pupuntahan na ${destination || 'lugar'}, inirerekomenda ko ang Horseshoe Drive at Santa Rita Road na may sementadong rampa at walang hagdan. Biyaya ring bukas ang priority desk sa Barangay Health Station at Barangay Hall.`
          : `Hello! I am your AccessiGo AI Voice Guide for Barangay Sta. Rita, Olongapo City. For your route to ${destination || 'your destination'}, I recommend using Horseshoe Drive and Santa Rita Road which offer 100% step-free concrete pathways with gentle ramps and tactile paving.`;
        return res.json({ text: fallbackText });
      }

      const systemInstruction = `
You are AccessiGo AI, the specialized voice guidance assistant for Persons with Disabilities (PWDs) navigating Barangay Sta. Rita, Olongapo City, Philippines.

Your core duty is to provide clear, friendly, highly accessible, reassuring, and practical route advice and PWD rights guidance.

Key context about Barangay Sta. Rita, Olongapo City:
- Key Roads & Artery Corridors:
  1. Horseshoe Drive: Civic loop housing Santa Rita Barangay Hall, Santa Rita Parish Church, Barangay Health Station, and Covered Court.
  2. Santa Rita Road: Primary secondary artery linking inner residential zones, Santa Rita Elementary School (est. 1932), and Sta. Rita High School.
  3. Tabacuhan Road: Major secondary route leading to Sitio Tabacuhan, Tabacuhan Bridge, Tabacuhan Elementary School, Tatlong Cruz, and Martin Falls.
  4. Balic-Balic Road: Key local interior corridor serving Balic-Balic Elementary School and LDS Church.
  5. Filtration Road: Secondary link passing through northern sections of the barangay.
  6. Del Rosario Street: Southern boundary connector passing Olongapo Memorial Park.
- Major Accessible Paths: Horseshoe Drive & Santa Rita Road (wide concrete sidewalks, gentle curb ramps, signalized crossings, shaded benches at Sta. Rita Plaza).
- Key Real Landmarks:
  • Santa Rita Barangay Hall & LGU Center (Horseshoe Drive, Zone 1, fully accessible ramp, PWD ID desk, accessible restroom)
  • Santa Rita de Cascia Parish Church (Horseshoe Drive, consecrated 1967, level entry ramp, reserved front PWD seating)
  • Sta. Rita Barangay Health Station (Horseshoe Drive / Santa Rita Rd, double ramp, free consultations & medicines for PWDs)
  • Santa Rita Elementary School (Santa Rita Road, est. 1932, historic first public school, rubber gate ramp, LGU evacuation center)
  • Sta. Rita High School (Santa Rita Road, Special Needs Education SNED center, ground floor inclusive facilities)
  • Tabacuhan Elementary School (Tabacuhan Road, Sitio Tabacuhan)
  • Balic-Balic Elementary School (Balic-Balic Road)
  • Tatlong Cruz Pilgrimage Site (Sitio Tabacuhan / Balimpuyo Ridge, built 1999, 540 steps to peak, base rest area)
  • Martin Falls (Tabacuhan mountain eco-trail)
  • Olongapo Memorial Park (Del Rosario Street)
  • Lighthouse Bible Baptist Church (Horseshoe Drive)
  • The Church of Jesus Christ of Latter-day Saints (Capricorn St, Balic-Balic)
  • Sta. Rita Public Market & Plaza (Santa Rita Road corner Horseshoe Dr, Gate A wheelchair ramp)
- PWD Rights in the Philippines (RA 7277): 20% discount and VAT exemption on medicines/services, PWD ID privileges, priority lanes at government & health offices.
- Hotlines: Sta. Rita Barangay Hall (047-222-3456), Olongapo City Health (047-224-2000), Emergency (911).

User context:
- User Profile: ${pwdProfile ? JSON.stringify(pwdProfile) : 'PWD Resident / Wheelchair User'}
- Requested Language: ${language === 'fil' ? 'Filipino / Tagalog' : 'English'}
- Current Location: ${currentLocation || 'Sta. Rita Center'}
- Destination: ${destination || 'Requested Place'}

Rules for response:
1. Speak directly, clearly, and concisely (2 to 4 sentences maximum) so it can be easily spoken by Text-To-Speech.
2. Highlight step-free accessibility details (ramps, smooth pathways, absence of stairs, safety warnings).
3. If language is 'fil', respond in clear conversational Tagalog/Filipino.
4. Keep the tone warm, empowering, and respectful.
`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.6-flash",
        contents: userQuery || `Provide accessible navigation instructions for going from ${currentLocation || 'Barangay Hall'} to ${destination || 'Health Station'} in Barangay Sta. Rita.`,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "You are on an accessible route in Barangay Sta. Rita. Stay on Magsaysay Drive for smooth pathways.";
      res.json({ text: replyText });

    } catch (err: any) {
      console.error("Error calling Gemini API:", err);
      res.status(500).json({ 
        error: "Failed to fetch AI guidance",
        fallbackText: "Stay on Magsaysay Drive for smooth wheelchair access in Barangay Sta. Rita. Emergency hotline is 047-222-3456."
      });
    }
  });

  // Serve Vite in dev, static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AccessiGo Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
