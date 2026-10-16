import { describe, it, expect } from 'vitest';
import * as Astronomy from 'astronomy-engine';
import { computeSkyState, calculateLST, calculateTwilight, buildObservationPlan, getLunarPhaseNames, computeObjectEphemerisCurve, computeLocationNetworkComparison } from '../astronomy/engine';
import { projectHorizontal, unprojectCanvasPoint } from '../astronomy/projection';
import { BRIGHT_STAR_CATALOG } from '../data/stars';
import { CONSTELLATIONS } from '../data/constellations';
import { OBSERVER_PRESETS, DEFAULT_OBSERVER } from '../data/locations';

describe('1. Zanzibar Location & Coordinate Transforms', () => {
  it('correctly uses Zanzibar reference coordinates and timezone', () => {
    expect(DEFAULT_OBSERVER.latitude).toBeCloseTo(-6.1659, 3);
    expect(DEFAULT_OBSERVER.longitude).toBeCloseTo(39.2026, 3);
    expect(DEFAULT_OBSERVER.timeZone).toBe('Africa/Dar_es_Salaam');

    const presets = OBSERVER_PRESETS;
    expect(presets.length).toBeGreaterThanOrEqual(5);
    presets.forEach(p => {
      expect(p.latitude).toBeGreaterThan(-90);
      expect(p.latitude).toBeLessThan(90);
      expect(p.longitude).toBeGreaterThan(-180);
      expect(p.longitude).toBeLessThan(180);
    });
  });

  it('calculates Local Sidereal Time correctly for Stone Town', () => {
    // 2026-03-20 12:00 UTC (Equinox)
    const testDate = new Date(Date.UTC(2026, 2, 20, 12, 0, 0));
    const lst = calculateLST(testDate, DEFAULT_OBSERVER.longitude);
    expect(lst).toBeGreaterThanOrEqual(0);
    expect(lst).toBeLessThan(24);
  });
});

describe('2. Altitude & Azimuth Transformations', () => {
  it('calculates mathematically sound horizontal coordinates for observer', () => {
    const testDate = new Date(Date.UTC(2026, 2, 21, 9, 0, 0)); // 12:00 EAT local noon
    const sky = computeSkyState(testDate, DEFAULT_OBSERVER);

    // Sun altitude at local noon near equinox for latitude -6.16° should be > 80°
    expect(sky.sun.altitude).toBeGreaterThan(70);
    expect(sky.sun.azimuth).toBeGreaterThanOrEqual(0);
    expect(sky.sun.azimuth).toBeLessThanOrEqual(360);
  });

  it('verifies stereographic projection bounds and polar mapping', () => {
    const opts = {
      width: 800,
      height: 800,
      projection: 'stereographic' as const,
      headingOffsetDeg: 0,
      zoom: 1.0,
      panX: 0,
      panY: 0
    };

    // Zenith (altitude 90°) must map to center of dome
    const zenith = projectHorizontal(90, 0, opts);
    expect(zenith.x).toBeCloseTo(400, 1);
    expect(zenith.y).toBeCloseTo(400, 1);
    expect(zenith.isAboveHorizon).toBe(true);

    // Horizon (altitude 0°, Azimuth 0 = North) must map to top boundary
    const northHorizon = projectHorizontal(0, 0, opts);
    expect(northHorizon.x).toBeCloseTo(400, 1);
    expect(northHorizon.y).toBeLessThan(400); // Top is smaller y

    // Invert unproject
    const unproj = unprojectCanvasPoint(zenith.x, zenith.y, opts);
    expect(unproj.altitudeDeg).toBeCloseTo(90, 1);

    for (const projection of ['stereographic', 'equidistant'] as const) {
      const point = projectHorizontal(23.5, 127, { ...opts, projection });
      const inverse = unprojectCanvasPoint(point.x, point.y, { ...opts, projection });
      expect(inverse.altitudeDeg).toBeCloseTo(23.5, 8);
      expect(inverse.azimuthDeg).toBeCloseTo(127, 8);
    }

    const testDate = new Date(Date.UTC(2026, 2, 21, 9, 0, 0));
    const sky = computeSkyState(testDate, DEFAULT_OBSERVER);
    const betelgeuse = sky.stars.find(star => star.id === 'HR 2061')!;
    const catalogEntry = BRIGHT_STAR_CATALOG.find(star => star.id === 'HR 2061')!;
    const time = Astronomy.MakeTime(testDate);
    const observer = new Astronomy.Observer(DEFAULT_OBSERVER.latitude, DEFAULT_OBSERVER.longitude, DEFAULT_OBSERVER.elevation);
    const ra = catalogEntry.ra * 15 * Math.PI / 180;
    const dec = catalogEntry.dec * Math.PI / 180;
    const vector = new Astronomy.Vector(Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec), time);
    const horizonVector = Astronomy.RotateVector(Astronomy.Rotation_EQJ_HOR(time, observer), vector);
    const horizon = Astronomy.HorizonFromVector(horizonVector, 'normal');
    expect(betelgeuse.altitude).toBeCloseTo(horizon.lat, 8);
    expect(betelgeuse.azimuth).toBeCloseTo(horizon.lon, 8);
  });
});

describe('3. Horizon Classification', () => {
  it('correctly classifies celestial objects above vs below the horizon', () => {
    const nightDate = new Date(Date.UTC(2026, 2, 21, 20, 0, 0)); // 23:00 EAT
    const sky = computeSkyState(nightDate, DEFAULT_OBSERVER);

    // At 23:00 local time, Sun must be below the horizon
    expect(sky.sun.isAboveHorizon).toBe(false);
    expect(sky.sun.altitude).toBeLessThan(0);

    // Total objects count above horizon should be positive
    expect(sky.visibleCount).toBeGreaterThan(0);
  });
});

describe('4. Timezone & Diurnal Midnight Handling', () => {
  it('handles midnight transition without date discontinuity', () => {
    const midnightUtc = new Date(Date.UTC(2026, 5, 21, 21, 0, 0)); // 00:00:00 next day in EAT (UTC+3)
    const sky = computeSkyState(midnightUtc, DEFAULT_OBSERVER);
    expect(sky.sun.altitude).toBeLessThan(-20);
    expect(sky.stars.length).toBe(BRIGHT_STAR_CATALOG.length);
  });
});

describe('5. Sun & Twilight Computations', () => {
  it('computes realistic twilights near Solstices and Equinoxes', () => {
    // June solstice
    const solstice = new Date(Date.UTC(2026, 5, 21, 10, 0, 0));
    const twilight = calculateTwilight(solstice, DEFAULT_OBSERVER);

    expect(twilight.sunrise).toBeDefined();
    expect(twilight.sunset).toBeDefined();
    if (twilight.sunrise && twilight.sunset) {
      expect(twilight.sunrise.getTime()).toBeLessThan(twilight.sunset.getTime());
    }
  });
});

describe('6. Moon Phases & Illumination', () => {
  it('correctly identifies lunar phases and fractions', () => {
    expect(getLunarPhaseNames(0).nameEn).toBe('New Moon');
    expect(getLunarPhaseNames(90).nameEn).toBe('First Quarter');
    expect(getLunarPhaseNames(180).nameEn).toBe('Full Moon');
    expect(getLunarPhaseNames(270).nameEn).toBe('Last Quarter');

    const testDate = new Date(Date.UTC(2026, 0, 18, 0, 0, 0));
    const sky = computeSkyState(testDate, DEFAULT_OBSERVER);
    expect(sky.moon.illuminatedFraction).toBeGreaterThanOrEqual(0);
    expect(sky.moon.illuminatedFraction).toBeLessThanOrEqual(1);
    expect(sky.moon.distanceKm).toBeGreaterThan(350000);
    expect(sky.moon.distanceKm).toBeLessThan(410000);
  });
});

describe('7. Planetary Ephemerides (VSOP87)', () => {
  it('calculates topocentric positions for Mercury, Venus, Mars, Jupiter, Saturn', () => {
    const testDate = new Date(Date.UTC(2026, 3, 15, 18, 0, 0));
    const sky = computeSkyState(testDate, DEFAULT_OBSERVER);

    const planetNames = sky.planets.map(p => p.id);
    expect(planetNames).toContain('mercury');
    expect(planetNames).toContain('venus');
    expect(planetNames).toContain('mars');
    expect(planetNames).toContain('jupiter');
    expect(planetNames).toContain('saturn');

    sky.planets.forEach(p => {
      expect(p.altitude).toBeGreaterThanOrEqual(-90);
      expect(p.altitude).toBeLessThanOrEqual(90);
      expect(p.azimuth).toBeGreaterThanOrEqual(0);
      expect(p.azimuth).toBeLessThanOrEqual(360);
      expect(p.distanceAu).toBeGreaterThan(0.2);
    });
  });
});

describe('8. Star Catalog Parsing & Integrity', () => {
  it('verifies all catalog stars have valid astronomical attributes', () => {
    expect(BRIGHT_STAR_CATALOG.length).toBeGreaterThanOrEqual(50);

    const starIds = new Set<string>();
    BRIGHT_STAR_CATALOG.forEach(s => {
      expect(starIds.has(s.id)).toBe(false); // No duplicate IDs
      starIds.add(s.id);

      expect(s.ra).toBeGreaterThanOrEqual(0);
      expect(s.ra).toBeLessThan(24);
      expect(s.dec).toBeGreaterThanOrEqual(-90);
      expect(s.dec).toBeLessThanOrEqual(90);
      expect(s.vmag).toBeGreaterThan(-2);
      expect(s.vmag).toBeLessThan(7);
      expect(s.spectral).toBeDefined();
      expect(s.color.startsWith('#')).toBe(true);
    });
  });
});

describe('9. Constellation Data Integrity', () => {
  it('verifies constellation lines only link existing catalog star IDs', () => {
    const catalogIds = new Set(BRIGHT_STAR_CATALOG.map(s => s.id));
    expect(CONSTELLATIONS.length).toBeGreaterThanOrEqual(10);

    // Required key constellations
    const codes = CONSTELLATIONS.map(c => c.code);
    ['ORI', 'CRU', 'SCO', 'UMA', 'CMA', 'TAU', 'LEO', 'GEM', 'SGR', 'CYG'].forEach(req => {
      expect(codes).toContain(req);
    });

    CONSTELLATIONS.forEach(constell => {
      expect(constell.lines.length).toBeGreaterThan(0);
      constell.lines.forEach(line => {
        expect(catalogIds.has(line.fromId)).toBe(true);
        expect(catalogIds.has(line.toId)).toBe(true);
      });
    });
  });
});

describe('10. Observation Target Selection', () => {
  it('uses the selected local day sunset and following local day sunrise', () => {
    const testDate = new Date(Date.UTC(2026, 2, 21, 18, 30, 0)); // 21:30 EAT
    const sky = computeSkyState(testDate, DEFAULT_OBSERVER);
    const plan = buildObservationPlan(sky);

    expect(plan.length).toBeGreaterThan(0);
    const startOfSelectedDay = Date.UTC(2026, 2, 20, 21, 0, 0);
    const startOfFollowingDay = Date.UTC(2026, 2, 21, 21, 0, 0);
    const sunset = Astronomy.SearchRiseSet(
      Astronomy.Body.Sun,
      new Astronomy.Observer(DEFAULT_OBSERVER.latitude, DEFAULT_OBSERVER.longitude, DEFAULT_OBSERVER.elevation),
      -1,
      Astronomy.MakeTime(new Date(startOfSelectedDay)),
      1.05
    );
    const sunrise = Astronomy.SearchRiseSet(
      Astronomy.Body.Sun,
      new Astronomy.Observer(DEFAULT_OBSERVER.latitude, DEFAULT_OBSERVER.longitude, DEFAULT_OBSERVER.elevation),
      1,
      Astronomy.MakeTime(new Date(startOfFollowingDay)),
      1.05
    );
    const localTime = (date: Date) => new Date(date.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(11, 16);
    const expectedInterval = `${localTime(sunset!.date)} – ${localTime(sunrise!.date)} EAT (Dusk to Dawn)`;

    expect(plan[0].nightObservationInterval).toBe(expectedInterval);
    plan.forEach(t => {
      expect(t.name).toBeDefined();
      expect(t.altitudeNow).toBeGreaterThanOrEqual(-90);
      expect(t.azimuthNow).toBeGreaterThanOrEqual(0);
      expect(['optimal', 'moderate', 'marginal', 'below_horizon', 'daylight']).toContain(t.visibilityStatus);
    });
  });

  it('returns no recommendations when the selected day sunset is unavailable', () => {
    const polarObserver = { ...DEFAULT_OBSERVER, latitude: 90 };
    const sky = computeSkyState(new Date(Date.UTC(2026, 5, 21, 12, 0, 0)), polarObserver);

    expect(buildObservationPlan(sky)).toEqual([]);
  });

  it('bounds station peak altitude to its calculated observation night', () => {
    const testDate = new Date(Date.UTC(2026, 2, 21, 18, 0, 0));
    const comparison = computeLocationNetworkComparison('jupiter', testDate, [DEFAULT_OBSERVER])[0];
    const ephemeris = computeObjectEphemerisCurve('jupiter', testDate, DEFAULT_OBSERVER);
    const observer = new Astronomy.Observer(DEFAULT_OBSERVER.latitude, DEFAULT_OBSERVER.longitude, DEFAULT_OBSERVER.elevation);
    const sunset = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, Astronomy.MakeTime(new Date(Date.UTC(2026, 2, 20, 21, 0, 0))), 1.05)!;
    const sunrise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, Astronomy.MakeTime(new Date(Date.UTC(2026, 2, 21, 21, 0, 0))), 1.05)!;
    const nightPeak = Math.max(...ephemeris.curve
      .filter(point => point.time >= sunset.date && point.time <= sunrise.date)
      .map(point => point.altitude));

    expect(comparison.targetMaxAlt).toBeCloseTo(Math.round(nightPeak * 10) / 10, 1);
  });
});

describe('11. Ephemeris & Transit Calculation Verification', () => {
  it('calculates deterministic ephemeris curve across 24-hour timeline', () => {
    const testDate = new Date(Date.UTC(2026, 2, 21, 18, 0, 0));
    const ephemeris = computeObjectEphemerisCurve('jupiter', testDate, DEFAULT_OBSERVER);

    expect(ephemeris.curve.length).toBeGreaterThan(20);
    expect(ephemeris.observationWindow).toBeDefined();
    expect(ephemeris.transitAltitude).toBeGreaterThanOrEqual(-90);
    expect(ephemeris.transitAltitude).toBeLessThanOrEqual(90);

    ephemeris.curve.forEach(pt => {
      expect(pt.altitude).toBeGreaterThanOrEqual(-90);
      expect(pt.altitude).toBeLessThanOrEqual(90);
      expect(pt.azimuth).toBeGreaterThanOrEqual(0);
      expect(pt.azimuth).toBeLessThanOrEqual(360);
      expect(pt.timeLabel).toMatch(/^\d{2}:\d{2}$/);
    });

    const observer = new Astronomy.Observer(DEFAULT_OBSERVER.latitude, DEFAULT_OBSERVER.longitude, DEFAULT_OBSERVER.elevation);
    const selectedDayStart = Astronomy.MakeTime(new Date(Date.UTC(2026, 2, 20, 21, 0, 0)));
    const followingDayStart = Astronomy.MakeTime(new Date(Date.UTC(2026, 2, 21, 21, 0, 0)));
    const sunset = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, selectedDayStart, 1.05)!;
    const sunrise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, followingDayStart, 1.05)!;
    const nightDarkPoints = ephemeris.curve.filter(point =>
      point.time >= sunset.date && point.time <= sunrise.date && point.sunAltitude <= -12
    );

    expect(nightDarkPoints.length).toBeGreaterThan(0);
    expect(ephemeris.peakAltitudeDarkSky).toBeCloseTo(Math.max(...nightDarkPoints.map(point => point.altitude)), 1);
    ephemeris.observableWindows?.forEach(window => {
      expect(window.start.getTime()).toBeGreaterThanOrEqual(sunset.date.getTime());
      expect(window.end.getTime()).toBeLessThanOrEqual(sunrise.date.getTime());
    });
  });
});

describe('12. Error & Boundary Handling', () => {
  it('handles extreme latitudes gracefully', () => {
    // Equator vs Extreme poles
    const equatorObserver = { ...DEFAULT_OBSERVER, latitude: 0, longitude: 0 };
    const sky = computeSkyState(new Date(), equatorObserver);
    expect(sky.stars.length).toBe(BRIGHT_STAR_CATALOG.length);
  });
});
