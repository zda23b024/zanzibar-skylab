import * as Astronomy from 'astronomy-engine';
import { BRIGHT_STAR_CATALOG } from '../data/stars';
import {
  CalculatedBody,
  ObserverLocation,
  TwilightTimes,
  ObservationTarget,
  AltitudeTimePoint,
  EphemerisTransitEvents,
  LocationStationComparison,
  ObservableWindow,
  SkyCondition
} from '../data/types';

export interface SkyState {
  time: Astronomy.AstroTime;
  date: Date;
  observer: ObserverLocation;
  gastHours: number;
  lstHours: number;
  sun: CalculatedBody;
  moon: CalculatedBody;
  planets: CalculatedBody[];
  stars: CalculatedBody[];
  twilight: TwilightTimes;
  visibleCount: number;
  totalCatalogStars: number;
}

/**
 * Zanzibar Standard Time (East Africa Time / EAT): UTC+03:00.
 * Constant offset with zero Daylight Saving Time.
 */
export const ZANZIBAR_TZ_OFFSET_HOURS = 3;
export const ZANZIBAR_TZ_OFFSET_MS = 3 * 3600 * 1000;

/**
 * Derives the exact UTC start and end bounds of the local Zanzibar calendar day for a given date.
 */
export function getZanzibarCalendarDayBounds(date: Date): {
  localDateString: string;
  startOfLocalDayUtc: Date;
  endOfLocalDayUtc: Date;
  localYear: number;
  localMonth: number;
  localDay: number;
} {
  const localMs = date.getTime() + ZANZIBAR_TZ_OFFSET_MS;
  const zDate = new Date(localMs);
  const localYear = zDate.getUTCFullYear();
  const localMonth = zDate.getUTCMonth();
  const localDay = zDate.getUTCDate();

  // Local midnight (00:00:00.000 EAT) converted to UTC
  const startOfLocalDayUtc = new Date(Date.UTC(localYear, localMonth, localDay, 0, 0, 0) - ZANZIBAR_TZ_OFFSET_MS);
  // Next local midnight (exactly 24 hours later)
  const endOfLocalDayUtc = new Date(startOfLocalDayUtc.getTime() + 24 * 3600 * 1000);
  const localDateString = `${localYear}-${String(localMonth + 1).padStart(2, '0')}-${String(localDay).padStart(2, '0')}`;

  return { localDateString, startOfLocalDayUtc, endOfLocalDayUtc, localYear, localMonth, localDay };
}

function calculateObservationNight(date: Date, loc: ObserverLocation): { sunset: Date; sunrise: Date } | null {
  const { startOfLocalDayUtc, endOfLocalDayUtc } = getZanzibarCalendarDayBounds(date);
  const nextDayBounds = getZanzibarCalendarDayBounds(endOfLocalDayUtc);
  const observer = getAstroObserver(loc);
  let sunset: Date | null = null;
  let sunrise: Date | null = null;

  try {
    const event = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, Astronomy.MakeTime(startOfLocalDayUtc), 1.05);
    if (event && event.date >= startOfLocalDayUtc && event.date < endOfLocalDayUtc) sunset = event.date;
  } catch {
    sunset = null;
  }

  try {
    const event = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, Astronomy.MakeTime(nextDayBounds.startOfLocalDayUtc), 1.05);
    if (event && event.date >= nextDayBounds.startOfLocalDayUtc && event.date < nextDayBounds.endOfLocalDayUtc) sunrise = event.date;
  } catch {
    sunrise = null;
  }

  if (!sunset || !sunrise || sunset >= sunrise) return null;
  return { sunset, sunrise };
}

/**
 * Creates an Astronomy.Observer object from an ObserverLocation configuration.
 */
export function getAstroObserver(loc: ObserverLocation): Astronomy.Observer {
  return new Astronomy.Observer(loc.latitude, loc.longitude, loc.elevation);
}

/**
 * Compute Local Sidereal Time in decimal hours [0, 24).
 */
export function calculateLST(date: Date, longitudeDeg: number): number {
  const time = Astronomy.MakeTime(date);
  const gastHours = Astronomy.SiderealTime(time);
  const lst = (gastHours + longitudeDeg / 15.0) % 24.0;
  return lst < 0 ? lst + 24.0 : lst;
}

/**
 * Determine human-readable lunar phase names in English and Kiswahili.
 */
export function getLunarPhaseNames(phaseAngleDeg: number): { nameEn: string; nameSw: string } {
  const normalized = ((phaseAngleDeg % 360) + 360) % 360;
  if (normalized < 22.5 || normalized >= 337.5) {
    return { nameEn: 'New Moon', nameSw: 'Mwezi Mwandamo (Conjunction)' };
  } else if (normalized < 67.5) {
    return { nameEn: 'Waxing Crescent', nameSw: 'Mwezi Hilali (Robo ya Kwanza Changa)' };
  } else if (normalized < 112.5) {
    return { nameEn: 'First Quarter', nameSw: 'Mwezi Robo ya Kwanza' };
  } else if (normalized < 157.5) {
    return { nameEn: 'Waxing Gibbous', nameSw: 'Mwezi Mkubwa Unaokua' };
  } else if (normalized < 202.5) {
    return { nameEn: 'Full Moon', nameSw: 'Mwezi Mpevu (Mwezi Kamili)' };
  } else if (normalized < 247.5) {
    return { nameEn: 'Waning Gibbous', nameSw: 'Mwezi Mkubwa Unaopungua' };
  } else if (normalized < 292.5) {
    return { nameEn: 'Last Quarter', nameSw: 'Mwezi Robo ya Mwisho' };
  } else {
    return { nameEn: 'Waning Crescent', nameSw: 'Mwezi Mkongwe (Hilali ya Alfajiri)' };
  }
}

/**
 * Calculates complete twilight, solar rise/set, and lunar events for a given local Zanzibar calendar day.
 * Strictly anchors searches to Zanzibar local midnight (UTC+03:00) and ensures all returned events
 * fall within [startOfLocalDay, endOfLocalDay). Returns null when an event does not occur on that calendar day.
 */
export function calculateTwilight(date: Date, loc: ObserverLocation): TwilightTimes {
  const astroObserver = getAstroObserver(loc);
  const { startOfLocalDayUtc, endOfLocalDayUtc } = getZanzibarCalendarDayBounds(date);
  const startTime = Astronomy.MakeTime(startOfLocalDayUtc);

  // Filters event to ensure it strictly occurred within the local Zanzibar calendar day
  const filterLocalDayEvent = (eventTime: Astronomy.AstroTime | null): Date | null => {
    if (!eventTime) return null;
    const t = eventTime.date.getTime();
    if (t >= startOfLocalDayUtc.getTime() && t < endOfLocalDayUtc.getTime()) {
      return eventTime.date;
    }
    return null;
  };

  // 1. Sunrise and Sunset (search limit 1.05 days from local midnight)
  let sunriseDate: Date | null = null;
  let sunsetDate: Date | null = null;
  try {
    const rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, astroObserver, 1, startTime, 1.05);
    sunriseDate = filterLocalDayEvent(rise);
  } catch {
    sunriseDate = null;
  }
  try {
    const set = Astronomy.SearchRiseSet(Astronomy.Body.Sun, astroObserver, -1, startTime, 1.05);
    sunsetDate = filterLocalDayEvent(set);
  } catch {
    sunsetDate = null;
  }

  // 2. Civil Twilight (Sun at -6 degrees)
  let civilDawn: Date | null = null;
  let civilDusk: Date | null = null;
  try {
    const cDawn = Astronomy.SearchAltitude(Astronomy.Body.Sun, astroObserver, 1, startTime, 1.05, -6);
    civilDawn = filterLocalDayEvent(cDawn);
  } catch {
    civilDawn = null;
  }
  try {
    const cDusk = Astronomy.SearchAltitude(Astronomy.Body.Sun, astroObserver, -1, startTime, 1.05, -6);
    civilDusk = filterLocalDayEvent(cDusk);
  } catch {
    civilDusk = null;
  }

  // 3. Nautical Twilight (Sun at -12 degrees)
  let nauticalDawn: Date | null = null;
  let nauticalDusk: Date | null = null;
  try {
    const nDawn = Astronomy.SearchAltitude(Astronomy.Body.Sun, astroObserver, 1, startTime, 1.05, -12);
    nauticalDawn = filterLocalDayEvent(nDawn);
  } catch {
    nauticalDawn = null;
  }
  try {
    const nDusk = Astronomy.SearchAltitude(Astronomy.Body.Sun, astroObserver, -1, startTime, 1.05, -12);
    nauticalDusk = filterLocalDayEvent(nDusk);
  } catch {
    nauticalDusk = null;
  }

  // 4. Astronomical Twilight (Sun at -18 degrees - true dark sky boundary)
  let astronomicalDawn: Date | null = null;
  let astronomicalDusk: Date | null = null;
  try {
    const aDawn = Astronomy.SearchAltitude(Astronomy.Body.Sun, astroObserver, 1, startTime, 1.05, -18);
    astronomicalDawn = filterLocalDayEvent(aDawn);
  } catch {
    astronomicalDawn = null;
  }
  try {
    const aDusk = Astronomy.SearchAltitude(Astronomy.Body.Sun, astroObserver, -1, startTime, 1.05, -18);
    astronomicalDusk = filterLocalDayEvent(aDusk);
  } catch {
    astronomicalDusk = null;
  }

  // 5. Moonrise and Moonset
  let moonrise: Date | null = null;
  let moonset: Date | null = null;
  try {
    const mRise = Astronomy.SearchRiseSet(Astronomy.Body.Moon, astroObserver, 1, startTime, 1.05);
    moonrise = filterLocalDayEvent(mRise);
  } catch {
    moonrise = null;
  }
  try {
    const mSet = Astronomy.SearchRiseSet(Astronomy.Body.Moon, astroObserver, -1, startTime, 1.05);
    moonset = filterLocalDayEvent(mSet);
  } catch {
    moonset = null;
  }

  // 6. Lunar phase and illumination at the instant of requested date
  const evalTime = Astronomy.MakeTime(date);
  const moonPhaseDeg = Astronomy.MoonPhase(evalTime);
  const moonIllum = Astronomy.Illumination(Astronomy.Body.Moon, evalTime);
  const phaseNames = getLunarPhaseNames(moonPhaseDeg);

  // Synodic lunar age
  const synodicMonthDays = 29.53058867;
  const moonAgeDays = (moonPhaseDeg / 360.0) * synodicMonthDays;

  return {
    date,
    sunrise: sunriseDate,
    sunset: sunsetDate,
    civilDawn,
    civilDusk,
    nauticalDawn,
    nauticalDusk,
    astronomicalDawn,
    astronomicalDusk,
    moonrise,
    moonset,
    moonPhaseName: phaseNames.nameEn,
    moonPhaseSw: phaseNames.nameSw,
    moonIllumination: moonIllum.phase_fraction,
    moonAgeDays: Math.round(moonAgeDays * 10) / 10
  };
}

/**
 * Calculates current positions of all celestial objects (Sun, Moon, Planets, Stars).
 * Applies exact IAU precession and nutation transformations from J2000 to epoch of date.
 */
export function computeSkyState(date: Date, observerLoc: ObserverLocation): SkyState {
  const time = Astronomy.MakeTime(date);
  const astroObserver = getAstroObserver(observerLoc);

  const gastHours = Astronomy.SiderealTime(time);
  const lstHours = calculateLST(date, observerLoc.longitude);

  // 1. Sun
  const sunEquator = Astronomy.Equator(Astronomy.Body.Sun, time, astroObserver, true, true);
  const sunHorizon = Astronomy.Horizon(time, astroObserver, sunEquator.ra, sunEquator.dec, 'normal');
  const sunBody: CalculatedBody = {
    id: 'sun',
    name: 'Sun',
    swahiliName: 'Jua',
    type: 'sun',
    ra: sunEquator.ra,
    dec: sunEquator.dec,
    altitude: sunHorizon.altitude,
    azimuth: sunHorizon.azimuth,
    vmag: -26.74,
    distanceAu: sunEquator.dist,
    color: '#fff3b0',
    isNakedEye: true,
    isAboveHorizon: sunHorizon.altitude > 0
  };

  // 2. Moon
  const moonEquator = Astronomy.Equator(Astronomy.Body.Moon, time, astroObserver, true, true);
  const moonHorizon = Astronomy.Horizon(time, astroObserver, moonEquator.ra, moonEquator.dec, 'normal');
  const moonIllum = Astronomy.Illumination(Astronomy.Body.Moon, time);
  const moonDistKm = moonEquator.dist * 149597870.7; // AU to km
  const moonBody: CalculatedBody = {
    id: 'moon',
    name: 'Moon',
    swahiliName: 'Mwezi',
    type: 'moon',
    ra: moonEquator.ra,
    dec: moonEquator.dec,
    altitude: moonHorizon.altitude,
    azimuth: moonHorizon.azimuth,
    vmag: moonIllum.mag,
    distanceKm: Math.round(moonDistKm),
    distanceAu: moonEquator.dist,
    illuminatedFraction: moonIllum.phase_fraction,
    phaseAngle: moonIllum.phase_angle,
    color: '#e2e8f0',
    isNakedEye: true,
    isAboveHorizon: moonHorizon.altitude > 0
  };

  // 3. Planets
  const planetDefs: Array<{ id: string; name: string; nameSw: string; body: Astronomy.Body; color: string; isNakedEye: boolean }> = [
    { id: 'mercury', name: 'Mercury', nameSw: 'Utaridi', body: Astronomy.Body.Mercury, color: '#d1d5db', isNakedEye: true },
    { id: 'venus', name: 'Venus', nameSw: 'Zuhura', body: Astronomy.Body.Venus, color: '#fef08a', isNakedEye: true },
    { id: 'mars', name: 'Mars', nameSw: 'Mirihi', body: Astronomy.Body.Mars, color: '#f87171', isNakedEye: true },
    { id: 'jupiter', name: 'Jupiter', nameSw: 'Mushtari', body: Astronomy.Body.Jupiter, color: '#fed7aa', isNakedEye: true },
    { id: 'saturn', name: 'Saturn', nameSw: 'Zohali', body: Astronomy.Body.Saturn, color: '#fef3c7', isNakedEye: true },
    { id: 'uranus', name: 'Uranus', nameSw: 'Uranus', body: Astronomy.Body.Uranus, color: '#67e8f9', isNakedEye: false },
    { id: 'neptune', name: 'Neptune', nameSw: 'Neptune', body: Astronomy.Body.Neptune, color: '#93c5fd', isNakedEye: false }
  ];

  const calculatedPlanets: CalculatedBody[] = planetDefs.map(p => {
    const eq = Astronomy.Equator(p.body, time, astroObserver, true, true);
    const hor = Astronomy.Horizon(time, astroObserver, eq.ra, eq.dec, 'normal');
    let mag = 0;
    try {
      const illum = Astronomy.Illumination(p.body, time);
      mag = illum.mag;
    } catch {
      mag = 5.0;
    }
    return {
      id: p.id,
      name: p.name,
      swahiliName: p.nameSw,
      type: 'planet',
      ra: eq.ra,
      dec: eq.dec,
      altitude: hor.altitude,
      azimuth: hor.azimuth,
      vmag: mag,
      distanceAu: eq.dist,
      color: p.color,
      isNakedEye: p.isNakedEye,
      isAboveHorizon: hor.altitude > 0
    };
  });

  // 4. Catalog Stars - Rigorous J2000 to Epoch-of-Date Precession and Topocentric Horizon Transformation
  const rotHor = Astronomy.Rotation_EQJ_HOR(time, astroObserver);
  const rotEqd = Astronomy.Rotation_EQJ_EQD(time);

  const calculatedStars: CalculatedBody[] = BRIGHT_STAR_CATALOG.map(star => {
    const radDec = star.dec * (Math.PI / 180);
    const radRa = star.ra * (15 * Math.PI / 180);
    const cosDec = Math.cos(radDec);
    const j2000Vec = new Astronomy.Vector(cosDec * Math.cos(radRa), cosDec * Math.sin(radRa), Math.sin(radDec), time);

    const horVec = Astronomy.RotateVector(rotHor, j2000Vec);
    const hor = Astronomy.HorizonFromVector(horVec, 'normal');

    const eqdVec = Astronomy.RotateVector(rotEqd, j2000Vec);
    const sphereEqd = Astronomy.SphereFromVector(eqdVec);
    let ofDateRa = sphereEqd.lon / 15;
    if (ofDateRa < 0) ofDateRa += 24;
    if (ofDateRa >= 24) ofDateRa -= 24;
    const ofDateDec = sphereEqd.lat;

    return {
      id: star.id,
      name: star.name || star.bayer || star.id,
      swahiliName: star.name || star.bayer || star.id,
      type: 'star',
      ra: ofDateRa,
      dec: ofDateDec,
      altitude: hor.lat,
      azimuth: hor.lon,
      vmag: star.vmag,
      constellation: star.constellation,
      spectral: star.spectral,
      color: star.color,
      bayer: star.bayer,
      isNakedEye: star.vmag < 6.0,
      isAboveHorizon: hor.lat > 0
    };
  });

  let visibleCount = 0;
  if (sunBody.isAboveHorizon) visibleCount++;
  if (moonBody.isAboveHorizon) visibleCount++;
  calculatedPlanets.forEach(p => { if (p.isAboveHorizon) visibleCount++; });
  calculatedStars.forEach(s => { if (s.isAboveHorizon) visibleCount++; });

  const twilight = calculateTwilight(date, observerLoc);

  return {
    time,
    date,
    observer: observerLoc,
    gastHours,
    lstHours,
    sun: sunBody,
    moon: moonBody,
    planets: calculatedPlanets,
    stars: calculatedStars,
    twilight,
    visibleCount,
    totalCatalogStars: BRIGHT_STAR_CATALOG.length
  };
}

/**
 * Compute Complete 24-Hour Altitude-versus-Time Ephemeris Curve and Transit Events for a Selected Object.
 * Validates object ID against supported planetary bodies and catalog stars (does NOT silently default to Jupiter).
 * Samples 49 points at 30-minute intervals covering an exact 24.0-hour cycle anchored at local noon (12:00 EAT).
 * Evaluates dark-sky observation quality based strictly on nighttime dark-sky intervals (Sun altitude <= -12°).
 */
export function computeObjectEphemerisCurve(
  objectId: string,
  baseDate: Date,
  observerLoc: ObserverLocation
): EphemerisTransitEvents {
  const astroObserver = getAstroObserver(observerLoc);

  const planetBodyMap: Record<string, { body: Astronomy.Body; name: string }> = {
    sun: { body: Astronomy.Body.Sun, name: 'Sun' },
    moon: { body: Astronomy.Body.Moon, name: 'Moon' },
    mercury: { body: Astronomy.Body.Mercury, name: 'Mercury' },
    venus: { body: Astronomy.Body.Venus, name: 'Venus' },
    mars: { body: Astronomy.Body.Mars, name: 'Mars' },
    jupiter: { body: Astronomy.Body.Jupiter, name: 'Jupiter' },
    saturn: { body: Astronomy.Body.Saturn, name: 'Saturn' },
    uranus: { body: Astronomy.Body.Uranus, name: 'Uranus' },
    neptune: { body: Astronomy.Body.Neptune, name: 'Neptune' }
  };

  const lowerId = (objectId || '').trim().toLowerCase();
  const planetEntry = planetBodyMap[lowerId];
  const starRef = BRIGHT_STAR_CATALOG.find(s =>
    s.id.toLowerCase() === lowerId ||
    s.name?.toLowerCase() === lowerId ||
    s.bayer?.toLowerCase() === lowerId
  );

  // PRIORITY 3: Return clear invalid-object error if object identifier is not recognized
  if (!planetEntry && !starRef) {
    return {
      objectId,
      objectName: objectId || 'Unknown Object',
      isValid: false,
      errorMessage: `Unrecognized celestial object identifier '${objectId}'. Target was not found in supported solar system bodies or the verified Yale Bright Star Catalog.`,
      riseTime: null,
      transitTime: null,
      transitAltitude: 0,
      peakAltitudeDarkSky: null,
      peakAltitude24h: 0,
      setTime: null,
      curve: [],
      observationWindow: {
        start: null,
        end: null,
        quality: 'unfavorable',
        summary: `Invalid target '${objectId}'. Please select a valid planet, Moon, or catalog star.`
      },
      observableWindows: []
    };
  }

  let targetBody: Astronomy.Body;
  let objectDisplayName = '';
  let isCustomStar = false;

  if (planetEntry) {
    targetBody = planetEntry.body;
    objectDisplayName = planetEntry.name;
  } else if (starRef) {
    isCustomStar = true;
    targetBody = Astronomy.Body.Star1;
    objectDisplayName = starRef.name ? `${starRef.name} (${starRef.bayer || starRef.id})` : (starRef.bayer || starRef.id);
    Astronomy.DefineStar(targetBody, starRef.ra, starRef.dec, 1000);
  } else {
    // Unreachable safeguard
    targetBody = Astronomy.Body.Jupiter;
  }

  // PRIORITY 5: Exact 24-Hour Interval anchored from 12:00 EAT (local noon) of the selected date
  const { localYear, localMonth, localDay } = getZanzibarCalendarDayBounds(baseDate);
  const startLocalNoonUtc = new Date(Date.UTC(localYear, localMonth, localDay, 12, 0, 0) - ZANZIBAR_TZ_OFFSET_MS);

  const curve: AltitudeTimePoint[] = [];
  const totalSteps = 49; // 48 intervals of 30 minutes = 24.0 hours (49 points inclusive)
  const stepMs = 30 * 60 * 1000;

  let peakAlt24h = -999;
  let peakAltDarkSky: number | null = null;
  let peakAltAstroDark: number | null = null;
  const nightWindow = calculateObservationNight(baseDate, observerLoc);

  for (let i = 0; i < totalSteps; i++) {
    const sampleDate = new Date(startLocalNoonUtc.getTime() + i * stepMs);
    const sampleAstroTime = Astronomy.MakeTime(sampleDate);

    // Calculate Sun altitude to determine twilight condition
    const sunEq = Astronomy.Equator(Astronomy.Body.Sun, sampleAstroTime, astroObserver, true, true);
    const sunHor = Astronomy.Horizon(sampleAstroTime, astroObserver, sunEq.ra, sunEq.dec, 'normal');

    let objAlt = 0;
    let objAz = 0;

    if (isCustomStar && starRef) {
      // Use precession vector rotation for exact star coordinates
      const radDec = starRef.dec * (Math.PI / 180);
      const radRa = starRef.ra * (15 * Math.PI / 180);
      const cosDec = Math.cos(radDec);
      const j2000Vec = new Astronomy.Vector(cosDec * Math.cos(radRa), cosDec * Math.sin(radRa), Math.sin(radDec), sampleAstroTime);
      const rot = Astronomy.Rotation_EQJ_HOR(sampleAstroTime, astroObserver);
      const horVec = Astronomy.RotateVector(rot, j2000Vec);
      const hor = Astronomy.HorizonFromVector(horVec, 'normal');
      objAlt = hor.lat;
      objAz = hor.lon;
    } else {
      const eq = Astronomy.Equator(targetBody, sampleAstroTime, astroObserver, true, true);
      const hor = Astronomy.Horizon(sampleAstroTime, astroObserver, eq.ra, eq.dec, 'normal');
      objAlt = hor.altitude;
      objAz = hor.azimuth;
    }

    if (objAlt > peakAlt24h) peakAlt24h = objAlt;

    // Distinguish lighting conditions
    let skyCondition: SkyCondition;
    if (sunHor.altitude > -0.833) {
      skyCondition = 'daylight';
    } else if (sunHor.altitude > -6) {
      skyCondition = 'civil_twilight';
    } else if (sunHor.altitude > -12) {
      skyCondition = 'nautical_twilight';
    } else {
      skyCondition = 'astronomical_darkness';
    }

    const isObservationNight = nightWindow !== null && sampleDate >= nightWindow.sunset && sampleDate <= nightWindow.sunrise;
    const isDarkSky = isObservationNight && sunHor.altitude <= -12;
    const isAstroDark = isObservationNight && sunHor.altitude <= -18;

    if (isDarkSky) {
      if (peakAltDarkSky === null || objAlt > peakAltDarkSky) {
        peakAltDarkSky = objAlt;
      }
    }

    if (isAstroDark) {
      if (peakAltAstroDark === null || objAlt > peakAltAstroDark) {
        peakAltAstroDark = objAlt;
      }
    }

    const localSample = new Date(sampleDate.getTime() + ZANZIBAR_TZ_OFFSET_MS);
    const timeLabel = `${localSample.getUTCHours().toString().padStart(2, '0')}:${localSample.getUTCMinutes().toString().padStart(2, '0')}`;

    curve.push({
      time: sampleDate,
      timeLabel,
      altitude: Math.round(objAlt * 10) / 10,
      azimuth: Math.round(objAz * 10) / 10,
      sunAltitude: Math.round(sunHor.altitude * 10) / 10,
      isDarkSky,
      isAstroDark,
      skyCondition
    });
  }

  // PRIORITY 4: Identify continuous observable dark-sky intervals (Object altitude >= 15° AND Sun altitude <= -12°)
  const observableWindows: ObservableWindow[] = [];
  let currentWin: { start: Date; end: Date; peakAlt: number; isAstro: boolean } | null = null;

  for (let i = 0; i < curve.length; i++) {
    const pt = curve[i];
    const isObservable = pt.isDarkSky && pt.altitude >= 15;
    if (isObservable) {
      if (!currentWin) {
        currentWin = { start: pt.time, end: pt.time, peakAlt: pt.altitude, isAstro: pt.isAstroDark };
      } else {
        currentWin.end = pt.time;
        if (pt.altitude > currentWin.peakAlt) currentWin.peakAlt = pt.altitude;
        if (pt.isAstroDark) currentWin.isAstro = true;
      }
    } else {
      if (currentWin) {
        const durationMins = Math.round((currentWin.end.getTime() - currentWin.start.getTime()) / (60 * 1000));
        observableWindows.push({
          start: currentWin.start,
          end: currentWin.end,
          peakAltitude: Math.round(currentWin.peakAlt * 10) / 10,
          durationMinutes: durationMins,
          condition: currentWin.isAstro ? 'astronomical_dark' : 'nautical_dark'
        });
        currentWin = null;
      }
    }
  }
  if (currentWin) {
    const durationMins = Math.round((currentWin.end.getTime() - currentWin.start.getTime()) / (60 * 1000));
    observableWindows.push({
      start: currentWin.start,
      end: currentWin.end,
      peakAltitude: Math.round(currentWin.peakAlt * 10) / 10,
      durationMinutes: durationMins,
      condition: currentWin.isAstro ? 'astronomical_dark' : 'nautical_dark'
    });
  }

  // Calculate Rise, Transit (Culmination), and Set times within search window
  let riseTime: Date | null = null;
  let setTime: Date | null = null;
  let transitTime: Date | null = null;
  let transitAlt = peakAlt24h;

  try {
    const riseEvt = Astronomy.SearchRiseSet(targetBody, astroObserver, 1, Astronomy.MakeTime(startLocalNoonUtc), 1.05);
    if (riseEvt) riseTime = riseEvt.date;
  } catch {
    riseTime = null;
  }

  try {
    const setEvt = Astronomy.SearchRiseSet(targetBody, astroObserver, -1, Astronomy.MakeTime(startLocalNoonUtc), 1.05);
    if (setEvt) setTime = setEvt.date;
  } catch {
    setTime = null;
  }

  try {
    const culminateEvt = Astronomy.SearchHourAngle(targetBody, astroObserver, 0, Astronomy.MakeTime(startLocalNoonUtc));
    if (culminateEvt) {
      transitTime = culminateEvt.time.date;
      transitAlt = Math.round(culminateEvt.hor.altitude * 10) / 10;
    }
  } catch {
    transitTime = null;
  }

  // Format local EAT time helper
  const fmtEAT = (d: Date) => {
    const z = new Date(d.getTime() + ZANZIBAR_TZ_OFFSET_MS);
    return `${z.getUTCHours().toString().padStart(2, '0')}:${z.getUTCMinutes().toString().padStart(2, '0')}`;
  };

  // Determine observation quality based STRICTLY on nighttime dark-sky intervals
  let quality: EphemerisTransitEvents['observationWindow']['quality'] = 'unfavorable';
  let summary = '';
  let criteria = '';

  const totalObservableMins = observableWindows.reduce((acc, w) => acc + w.durationMinutes, 0);

  if (peakAltDarkSky !== null && peakAltDarkSky >= 30 && totalObservableMins >= 60) {
    quality = 'optimal';
    const winStrs = observableWindows.map(w => `${fmtEAT(w.start)}–${fmtEAT(w.end)} EAT (peak +${w.peakAltitude.toFixed(1)}°)`).join(', ');
    summary = `Prime observation window: reaches +${peakAltDarkSky.toFixed(1)}° during dark skies. Window(s): ${winStrs}.`;
    criteria = 'Criteria: Dark-sky peak altitude ≥ 30° and duration ≥ 60 minutes above coastal extinction threshold (15°).';
  } else if (peakAltDarkSky !== null && peakAltDarkSky >= 15 && totalObservableMins >= 30) {
    quality = 'moderate';
    const winStrs = observableWindows.map(w => `${fmtEAT(w.start)}–${fmtEAT(w.end)} EAT (peak +${w.peakAltitude.toFixed(1)}°)`).join(', ');
    summary = `Moderate observation window: reaches +${peakAltDarkSky.toFixed(1)}° during dark skies. Window(s): ${winStrs}.`;
    criteria = 'Criteria: Dark-sky peak altitude 15°–30° and duration ≥ 30 minutes above 15°.';
  } else if (peakAltDarkSky !== null && peakAltDarkSky >= 5) {
    quality = 'marginal';
    summary = `Marginal observation: maximum dark-sky altitude is +${peakAltDarkSky.toFixed(1)}° (low on horizon; severe marine extinction).`;
    criteria = 'Criteria: Dark-sky peak altitude between 5° and 15°; high atmospheric attenuation near sea level.';
  } else {
    quality = 'unfavorable';
    if (!nightWindow) {
      summary = 'Night observation interval unavailable: sunset or the following local-day sunrise could not be calculated.';
      criteria = 'No observation-night recommendation is available without both calculated solar events.';
    } else if (peakAlt24h > 15) {
      summary = `Unfavorable for nighttime observation: object achieves +${peakAlt24h.toFixed(1)}° during daylight or civil twilight, but is below 15° or below horizon during dark skies.`;
      criteria = 'Criteria: Elevated only during daylight (Sun > -0.83°) or civil twilight (Sun > -6°). Not observable under dark skies.';
    } else {
      summary = `Unfavorable: object remains below 15° elevation throughout the entire 24-hour cycle.`;
      criteria = 'Criteria: 24-hour peak altitude < 15°.';
    }
  }

  const primaryWindow = observableWindows.length > 0 ? observableWindows[0] : null;

  return {
    objectId,
    objectName: objectDisplayName,
    isValid: true,
    riseTime,
    transitTime,
    transitAltitude: transitAlt,
    peakAltitudeDarkSky: peakAltDarkSky !== null ? Math.round(peakAltDarkSky * 10) / 10 : null,
    peakAltitude24h: Math.round(peakAlt24h * 10) / 10,
    setTime,
    curve,
    observationWindow: {
      start: primaryWindow ? primaryWindow.start : null,
      end: primaryWindow ? primaryWindow.end : null,
      quality,
      summary,
      criteria
    },
    observableWindows
  };
}

/**
 * Location Comparison Engine: Compares ephemeris events and sky conditions across Zanzibar stations.
 */
export function computeLocationNetworkComparison(
  targetId: string,
  date: Date,
  stations: ObserverLocation[]
): LocationStationComparison[] {
  return stations.map(station => {
    const tw = calculateTwilight(date, station);
    const ephem = computeObjectEphemerisCurve(targetId, date, station);
    const nightWindow = calculateObservationNight(date, station);
    const astroObs = getAstroObserver(station);
    const time = Astronomy.MakeTime(date);

    let alt = 0;
    let az = 0;

    const planetBodyMap: Record<string, Astronomy.Body> = {
      sun: Astronomy.Body.Sun,
      moon: Astronomy.Body.Moon,
      mercury: Astronomy.Body.Mercury,
      venus: Astronomy.Body.Venus,
      mars: Astronomy.Body.Mars,
      jupiter: Astronomy.Body.Jupiter,
      saturn: Astronomy.Body.Saturn,
      uranus: Astronomy.Body.Uranus,
      neptune: Astronomy.Body.Neptune
    };

    const lowerId = (targetId || '').trim().toLowerCase();
    const starRef = BRIGHT_STAR_CATALOG.find(s => s.id.toLowerCase() === lowerId || s.name?.toLowerCase() === lowerId || s.bayer?.toLowerCase() === lowerId);

    if (planetBodyMap[lowerId]) {
      const eq = Astronomy.Equator(planetBodyMap[lowerId], time, astroObs, true, true);
      const hor = Astronomy.Horizon(time, astroObs, eq.ra, eq.dec, 'normal');
      alt = hor.altitude;
      az = hor.azimuth;
    } else if (starRef) {
      const radDec = starRef.dec * (Math.PI / 180);
      const radRa = starRef.ra * (15 * Math.PI / 180);
      const cosDec = Math.cos(radDec);
      const j2000Vec = new Astronomy.Vector(cosDec * Math.cos(radRa), cosDec * Math.sin(radRa), Math.sin(radDec), time);
      const rot = Astronomy.Rotation_EQJ_HOR(time, astroObs);
      const horVec = Astronomy.RotateVector(rot, j2000Vec);
      const hor = Astronomy.HorizonFromVector(horVec, 'normal');
      alt = hor.lat;
      az = hor.lon;
    }

    const nightAltitudes = nightWindow
      ? ephem.curve
          .filter(point => point.time >= nightWindow.sunset && point.time <= nightWindow.sunrise)
          .map(point => point.altitude)
      : [];
    const peakAlt = nightAltitudes.length > 0 ? Math.max(...nightAltitudes) : null;

    return {
      station,
      sunrise: tw.sunrise,
      sunset: tw.sunset,
      astronomicalDusk: tw.astronomicalDusk,
      astronomicalDawn: tw.astronomicalDawn,
      targetAltitude: Math.round(alt * 10) / 10,
      targetAzimuth: Math.round(az * 10) / 10,
      targetRise: ephem.riseTime,
      targetSet: ephem.setTime,
      targetMaxAlt: peakAlt !== null ? Math.round(peakAlt * 10) / 10 : null,
      isAboveHorizonNow: alt >= 0,
      notes: `${station.name} (lat ${station.latitude.toFixed(2)}°, elev ${station.elevation}m)`
    };
  });
}

/**
 * Build transparent observation planner recommendations based on genuine astronomical calculations.
 * PRIORITY 1: Calculates the actual maximum altitude achieved over the defined local observation night
 * (from local sunset to local sunrise) using astronomy-engine without fabricated minimums.
 */
export function buildObservationPlan(skyState: SkyState): ObservationTarget[] {
  const astroObserver = getAstroObserver(skyState.observer);
  const targets: ObservationTarget[] = [];

  const nightWindow = calculateObservationNight(skyState.date, skyState.observer);
  if (!nightWindow) return targets;
  const { sunset, sunrise } = nightWindow;

  const formatEAT = (d: Date) => {
    const z = new Date(d.getTime() + ZANZIBAR_TZ_OFFSET_MS);
    return `${z.getUTCHours().toString().padStart(2, '0')}:${z.getUTCMinutes().toString().padStart(2, '0')}`;
  };

  const nightIntervalLabel = `${formatEAT(sunset)} – ${formatEAT(sunrise)} EAT (Dusk to Dawn)`;

  // Sample the complete event-bounded night at intervals no longer than 30 minutes.
  const nightStepMs = 30 * 60 * 1000;
  const nightSteps = Math.ceil((sunrise.getTime() - sunset.getTime()) / nightStepMs) + 1;
  const nightSampleTimes: Astronomy.AstroTime[] = [];
  const nightSunAlts: number[] = [];

  for (let i = 0; i < nightSteps; i++) {
    const tDate = new Date(Math.min(sunset.getTime() + i * nightStepMs, sunrise.getTime()));
    const aTime = Astronomy.MakeTime(tDate);
    nightSampleTimes.push(aTime);

    const sEq = Astronomy.Equator(Astronomy.Body.Sun, aTime, astroObserver, true, true);
    const sHor = Astronomy.Horizon(aTime, astroObserver, sEq.ra, sEq.dec, 'normal');
    nightSunAlts.push(sHor.altitude);
  }

  // 1. Moon: Compute actual maximum altitude during the observation night
  let actualMoonNightPeak = -999;
  let moonDarkSkyPeak = -999;
  for (let i = 0; i < nightSampleTimes.length; i++) {
    const aTime = nightSampleTimes[i];
    const mEq = Astronomy.Equator(Astronomy.Body.Moon, aTime, astroObserver, true, true);
    const mHor = Astronomy.Horizon(aTime, astroObserver, mEq.ra, mEq.dec, 'normal');
    if (mHor.altitude > actualMoonNightPeak) actualMoonNightPeak = mHor.altitude;
    if (nightSunAlts[i] <= -12 && mHor.altitude > moonDarkSkyPeak) moonDarkSkyPeak = mHor.altitude;
  }

  const moonAlt = skyState.moon.altitude;
  let moonVis: ObservationTarget['visibilityStatus'] = 'below_horizon';
  const isNightNow = skyState.sun.altitude <= -6;

  if (moonAlt > 15 && isNightNow) {
    moonVis = 'optimal';
  } else if (moonAlt > 0) {
    moonVis = isNightNow ? 'moderate' : 'daylight';
  }

  targets.push({
    id: 'moon',
    name: 'Moon',
    swahiliName: 'Mwezi',
    type: 'moon',
    magnitude: skyState.moon.vmag,
    constellation: '—',
    altitudeNow: Math.round(moonAlt * 10) / 10,
    azimuthNow: Math.round(skyState.moon.azimuth * 10) / 10,
    bestTime: moonDarkSkyPeak >= 15 ? 'Evening / Night (Dark Sky)' : 'Twilight / Horizon',
    maxAltitudeTonight: Math.round(actualMoonNightPeak * 10) / 10,
    peakAltitudeDarkSky: moonDarkSkyPeak > -900 ? Math.round(moonDarkSkyPeak * 10) / 10 : null,
    nightObservationInterval: nightIntervalLabel,
    visibilityStatus: moonVis,
    notes: `${Math.round((skyState.moon.illuminatedFraction || 0) * 100)}% illuminated (${skyState.twilight.moonPhaseName})`,
    notesSw: `Mwangaza ${Math.round((skyState.moon.illuminatedFraction || 0) * 100)}% (${skyState.twilight.moonPhaseSw})`
  });

  // 2. Naked-eye planets: Compute actual maximum altitude during the observation night
  for (const p of skyState.planets) {
    if (!p.isNakedEye) continue;

    const planetBodyMap: Record<string, Astronomy.Body> = {
      mercury: Astronomy.Body.Mercury,
      venus: Astronomy.Body.Venus,
      mars: Astronomy.Body.Mars,
      jupiter: Astronomy.Body.Jupiter,
      saturn: Astronomy.Body.Saturn
    };

    const pBody = planetBodyMap[p.id];
    let actualPlanetNightPeak = -999;
    let planetDarkSkyPeak = -999;

    if (pBody) {
      for (let i = 0; i < nightSampleTimes.length; i++) {
        const aTime = nightSampleTimes[i];
        const pEq = Astronomy.Equator(pBody, aTime, astroObserver, true, true);
        const pHor = Astronomy.Horizon(aTime, astroObserver, pEq.ra, pEq.dec, 'normal');
        if (pHor.altitude > actualPlanetNightPeak) actualPlanetNightPeak = pHor.altitude;
        if (nightSunAlts[i] <= -12 && pHor.altitude > planetDarkSkyPeak) planetDarkSkyPeak = pHor.altitude;
      }
    }

    let status: ObservationTarget['visibilityStatus'] = 'below_horizon';
    let bestTime = 'Below horizon at present';

    if (p.altitude > 20 && skyState.sun.altitude < -12) {
      status = 'optimal';
      bestTime = 'Prime Dark Sky Window';
    } else if (p.altitude > 10 && skyState.sun.altitude < -6) {
      status = 'moderate';
      bestTime = 'Twilight / Low Altitude';
    } else if (p.altitude > 0 && skyState.sun.altitude >= 0) {
      status = 'daylight';
      bestTime = 'Daylight Solar Glare';
    } else if (p.altitude > 0) {
      status = 'marginal';
      bestTime = 'Low Horizon Extinction (<10°)';
    }

    targets.push({
      id: p.id,
      name: p.name,
      swahiliName: p.swahiliName,
      type: 'planet',
      magnitude: Math.round(p.vmag * 10) / 10,
      constellation: 'Ecliptic',
      altitudeNow: Math.round(p.altitude * 10) / 10,
      azimuthNow: Math.round(p.azimuth * 10) / 10,
      bestTime,
      maxAltitudeTonight: actualPlanetNightPeak > -900 ? Math.round(actualPlanetNightPeak * 10) / 10 : Math.round(p.altitude * 10) / 10,
      peakAltitudeDarkSky: planetDarkSkyPeak > -900 ? Math.round(planetDarkSkyPeak * 10) / 10 : null,
      nightObservationInterval: nightIntervalLabel,
      visibilityStatus: status,
      notes: `Vmag ${p.vmag.toFixed(1)}, distance ${(p.distanceAu || 1).toFixed(2)} AU`,
      notesSw: `Mwangaza Vmag ${p.vmag.toFixed(1)}, umbali wa AU ${(p.distanceAu || 1).toFixed(2)}`
    });
  }

  // 3. Bright stars: Compute actual maximum altitude during the observation night
  const candidateStars = skyState.stars
    .filter(s => s.vmag <= 2.5)
    .sort((a, b) => a.vmag - b.vmag)
    .slice(0, 8);

  for (const s of candidateStars) {
    let actualStarNightPeak = -999;
    let starDarkSkyPeak = -999;

    const radDec = s.dec * (Math.PI / 180);
    const radRa = s.ra * (15 * Math.PI / 180);
    const cosDec = Math.cos(radDec);

    for (let i = 0; i < nightSampleTimes.length; i++) {
      const aTime = nightSampleTimes[i];
      const j2000Vec = new Astronomy.Vector(cosDec * Math.cos(radRa), cosDec * Math.sin(radRa), Math.sin(radDec), aTime);
      const rot = Astronomy.Rotation_EQJ_HOR(aTime, astroObserver);
      const horVec = Astronomy.RotateVector(rot, j2000Vec);
      const hor = Astronomy.HorizonFromVector(horVec, 'normal');

      if (hor.lat > actualStarNightPeak) actualStarNightPeak = hor.lat;
      if (nightSunAlts[i] <= -12 && hor.lat > starDarkSkyPeak) starDarkSkyPeak = hor.lat;
    }

    let status: ObservationTarget['visibilityStatus'] = 'below_horizon';
    if (s.altitude > 25 && skyState.sun.altitude < -12) {
      status = 'optimal';
    } else if (s.altitude > 15 && skyState.sun.altitude < -6) {
      status = 'moderate';
    } else if (skyState.sun.altitude >= 0 && s.altitude > 0) {
      status = 'daylight';
    } else if (s.altitude > 0) {
      status = 'marginal';
    }

    targets.push({
      id: s.id,
      name: s.name,
      swahiliName: s.swahiliName,
      type: 'star',
      magnitude: s.vmag,
      constellation: s.constellation || '—',
      altitudeNow: Math.round(s.altitude * 10) / 10,
      azimuthNow: Math.round(s.azimuth * 10) / 10,
      bestTime: status === 'optimal' ? 'High Dark-Sky Elevation' : (status === 'daylight' ? 'Daylight (Wait for Night)' : 'Low Horizon'),
      maxAltitudeTonight: actualStarNightPeak > -900 ? Math.round(actualStarNightPeak * 10) / 10 : Math.round(s.altitude * 10) / 10,
      peakAltitudeDarkSky: starDarkSkyPeak > -900 ? Math.round(starDarkSkyPeak * 10) / 10 : null,
      nightObservationInterval: nightIntervalLabel,
      visibilityStatus: status,
      notes: `${s.bayer || s.id} in ${s.constellation}, Spectral ${s.spectral || '—'}`,
      notesSw: `${s.bayer || s.id} ndani ya ${s.constellation}, Tabaka la ${s.spectral || '—'}`
    });
  }

  return targets;
}
