/**
 * Zanzibar SkyLab - Professional Astronomical Observatory Data Types
 */

export interface Star {
  id: string;            // e.g. "HR 2061", "HIP 27989"
  name?: string;         // Common name, e.g. "Betelgeuse", "Sirius"
  bayer?: string;        // Bayer/Flamsteed designation, e.g. "α Ori"
  ra: number;            // Right Ascension in decimal hours [0, 24) [J2000]
  dec: number;           // Declination in decimal degrees [-90, +90] [J2000]
  vmag: number;          // Johnson V-band visual magnitude
  spectral: string;      // Spectral classification (e.g. "M1-2Ia-ab")
  color: string;         // Realistic RGB hex color based on B-V index
  constellation: string; // 3-letter IAU constellation code (e.g. "ORI")
}

export interface ConstellationLine {
  fromId: string;
  toId: string;
}

export interface Constellation {
  code: string;          // e.g. "ORI"
  name: string;          // e.g. "Orion"
  swahiliName: string;   // e.g. "Kikosi cha Mwindaji"
  englishMeaning: string;// e.g. "The Hunter"
  centerRa: number;      // Center RA in hours
  centerDec: number;     // Center Dec in degrees
  lines: ConstellationLine[];
  description: string;
  descriptionSw: string;
}

export interface ObserverLocation {
  id: string;
  name: string;
  swahiliName: string;
  latitude: number;      // Degrees (-90 to +90)
  longitude: number;     // Degrees (-180 to +180)
  elevation: number;     // Metres above sea level
  timeZone: string;      // "Africa/Dar_es_Salaam"
  description: string;
  descriptionSw: string;
}

export interface CalculatedBody {
  id: string;
  name: string;
  swahiliName: string;
  type: 'star' | 'planet' | 'sun' | 'moon';
  ra: number;            // Right ascension in hours (of date)
  dec: number;           // Declination in degrees (of date)
  altitude: number;      // Altitude above horizon in degrees (-90 to +90)
  azimuth: number;       // Azimuth in degrees clockwise from North (0 = N, 90 = E, 180 = S, 270 = W)
  vmag: number;          // Visual magnitude
  distanceAu?: number;   // Distance in AU
  distanceKm?: number;   // Distance in km (Moon)
  illuminatedFraction?: number; // 0..1 for Moon / planets
  phaseAngle?: number;   // Phase angle in degrees
  constellation?: string;
  spectral?: string;
  color: string;
  isNakedEye: boolean;
  isAboveHorizon: boolean;
  bayer?: string;
}

export interface TwilightTimes {
  date: Date;
  sunrise: Date | null;
  sunset: Date | null;
  civilDawn: Date | null;
  civilDusk: Date | null;
  nauticalDawn: Date | null;
  nauticalDusk: Date | null;
  astronomicalDawn: Date | null;
  astronomicalDusk: Date | null;
  moonrise: Date | null;
  moonset: Date | null;
  moonPhaseName: string;
  moonPhaseSw: string;
  moonIllumination: number; // 0 to 1
  moonAgeDays: number;
}

export type SkyCondition = 'daylight' | 'civil_twilight' | 'nautical_twilight' | 'astronomical_darkness';

export interface AltitudeTimePoint {
  time: Date;
  timeLabel: string;
  altitude: number;
  azimuth: number;
  sunAltitude: number;
  isDarkSky: boolean;
  isAstroDark: boolean;
  skyCondition: SkyCondition;
}

export interface ObservableWindow {
  start: Date;
  end: Date;
  peakAltitude: number;
  durationMinutes: number;
  condition: 'astronomical_dark' | 'nautical_dark';
}

export interface EphemerisTransitEvents {
  objectId: string;
  objectName: string;
  isValid: boolean;
  errorMessage?: string;
  riseTime: Date | null;
  transitTime: Date | null;
  transitAltitude: number;
  peakAltitudeDarkSky: number | null;
  peakAltitude24h: number;
  setTime: Date | null;
  curve: AltitudeTimePoint[];
  observationWindow: {
    start: Date | null;
    end: Date | null;
    quality: 'optimal' | 'moderate' | 'marginal' | 'unfavorable';
    summary: string;
    criteria?: string;
  };
  observableWindows?: ObservableWindow[];
}

export interface ObservationTarget {
  id: string;
  name: string;
  swahiliName: string;
  type: 'planet' | 'star' | 'moon';
  magnitude: number;
  constellation: string;
  altitudeNow: number;
  azimuthNow: number;
  bestTime: string;
  maxAltitudeTonight: number;
  peakAltitudeDarkSky?: number | null;
  nightObservationInterval?: string;
  visibilityStatus: 'optimal' | 'moderate' | 'marginal' | 'below_horizon' | 'daylight';
  notes: string;
  notesSw: string;
}

export interface LocationStationComparison {
  station: ObserverLocation;
  sunrise: Date | null;
  sunset: Date | null;
  astronomicalDusk: Date | null;
  astronomicalDawn: Date | null;
  targetAltitude: number;
  targetAzimuth: number;
  targetRise: Date | null;
  targetSet: Date | null;
  targetMaxAlt: number | null;
  isAboveHorizonNow: boolean;
  notes: string;
}
