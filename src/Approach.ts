// Keep in sync with `ApproachType` in https://github.com/ammaraskar/faa-instrument-approach-db/blob/master/plate_analyzer/schema.py
export const ApproachTypes = [
  "ILS",
  "LOC",
  "LOC/DME",
  "LOC/NDB",
  "LOC Backcourse",
  "LOC/DME Backcourse",

  "LDA",
  "LDA/DME",
  "SDF",

  "RNAV",
  "RNAV (GPS)",
  "RNAV (RNP)",
  "GPS",
  "GBAS",
  "TACAN",

  "NDB",
  "NDB/DME",
  "VOR",
  "VOR/DME",

  "High Altitude ILS",
  "High Altitude LOC",
  "High Altitude LOC/DME",
  "High Altitude LOC/DME Backcourse",
  "High Altitude RNAV (GPS)",
  "High Altitude VOR",
  "High Altitude VOR/DME",
  "High Altitude TACAN",
] as const;
export type ApproachTypeString = (typeof ApproachTypes)[number];

// Type used in the table and for filtering.
export type Approach = {
  airport: string;
  approach_name: string;
  plate_file: string;
  types: string[];

  has_procedure_turn: boolean;
  has_hold_in_lieu_of_procedure_turn: boolean;
  has_dme_arc: boolean;
};

interface AnalysisApproach {
  name: string;
  plate_file: string;
  types: ApproachTypeString[];

  approach_course?: number;
  runway?: string;
  runway_approach_offset_angle?: number;

  comments: {
    has_non_standard_takeoff_minimums: boolean;
    has_non_standard_alternative_requirements: boolean;
    text_comments: string;
  };
  missed_instructions: string;

  has_dme_arc: boolean;
  has_procedure_turn: boolean;
  has_hold_in_lieu_of_procedure_turn: boolean;
}

interface Runway {
  name: string;
  bearing: number;
  threshold_elevation: number;
}

interface Airport {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  runways: Runway[];
  approaches: AnalysisApproach[];
}

// Keep in sync with `AnalysisResult` form https://github.com/ammaraskar/faa-instrument-approach-db/blob/master/plate_analyzer/schema.py
interface AnalysisResult {
  dtpp_cycle_number: string;
  airports: { [key: string]: Airport };
}

/** Unfiltered approach data converted to the most convenient js formats for
 * the app. */
export interface AppApproachData {
  dtpp_cycle_number: string;
  approaches: Approach[];

  airports: { [key: string]: AppAirportData };
}

type LatLngType = { lat: number; lng: number };

interface AppAirportData {
  location: LatLngType;
  name: string;
}

export const convertAnalysisToInitialData = (
  results: AnalysisResult,
): AppApproachData => {
  const approaches: Approach[] = [];
  const airports: { [key: string]: AppAirportData } = {};

  for (const airport of Object.values(results.airports)) {
    for (const approach of airport.approaches) {
      approaches.push({
        airport: airport.id,
        approach_name: approach.name,
        plate_file: approach.plate_file,
        types: approach.types as ApproachTypeString[],
        has_procedure_turn: approach.has_procedure_turn,
        has_hold_in_lieu_of_procedure_turn:
          approach.has_hold_in_lieu_of_procedure_turn,
        has_dme_arc: approach.has_dme_arc,
      });
    }

    airports[airport.id] = {
      name: airport.name,
      location: convertLatitudeLongitude(airport),
    };
  }

  return {
    dtpp_cycle_number: results.dtpp_cycle_number,
    approaches,
    airports,
  };
};

/**
 * Convert latitude and longitude from arinc424 style to leaflet.js style
 * (lat, long) tuple.
 *
 * Example:
 *   {"latitude":"N32244080","longitude":"W099405480"} (KABI)
 *   to [32.41, -99.68]
 */
const convertLatitudeLongitude = (location: {
  latitude: string;
  longitude: string;
}): LatLngType => {
  return {
    lat: convertArinc424DegreeMinutesSeconds(location.latitude),
    lng: convertArinc424DegreeMinutesSeconds(location.longitude),
  };
};

/**
 * From https://github.com/andrewda/inthesoup/blob/99083df5504fa62b65306fa73ace4f491933a6de/data/load_cifp.py#L21
 */
const convertArinc424DegreeMinutesSeconds = (dms: string): number => {
  let sign = -1;
  if (dms.startsWith("N") || dms.startsWith("E")) {
    sign = 1;
  }
  dms = dms.substring(1);

  // Pad to 9 decimal digits, from the left.
  if (dms.length < 9) {
    dms = "0" + dms;
  }

  const degrees = parseFloat(dms.substring(0, 3));
  const minutes = parseFloat(dms.substring(3, 5));
  const seconds = parseFloat(dms.substring(5, 9)) / 100;

  return sign * (degrees + minutes / 60 + seconds / (60 * 60));
};
