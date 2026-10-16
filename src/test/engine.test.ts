import { describe, it, expect } from 'vitest';
import * as Astronomy from 'astronomy-engine';

describe('Astronomy Engine Verification', () => {
  it('loads astronomy-engine and calculates Sun position', () => {
    const date = new Date(Date.UTC(2026, 2, 21, 10, 0, 0)); // Vernal equinox approx, 13:00 local time
    const time = Astronomy.MakeTime(date);
    const observer = new Astronomy.Observer(-6.1659, 39.2026, 0); // Stone Town, Zanzibar
    
    const sunEquator = Astronomy.Equator(Astronomy.Body.Sun, time, observer, true, true);
    expect(sunEquator.ra).toBeDefined();
    expect(sunEquator.dec).toBeDefined();
    
    const sunHorizon = Astronomy.Horizon(time, observer, sunEquator.ra, sunEquator.dec, 'normal');
    expect(sunHorizon.altitude).toBeGreaterThan(0); // Sun should be above horizon at local noon (15:00 EAT)
    expect(sunHorizon.azimuth).toBeGreaterThanOrEqual(0);
    expect(sunHorizon.azimuth).toBeLessThanOrEqual(360);
  });

  it('calculates Moon phase and illumination', () => {
    const date = new Date(Date.UTC(2026, 2, 21, 18, 0, 0));
    const time = Astronomy.MakeTime(date);
    const phase = Astronomy.MoonPhase(time);
    expect(phase).toBeGreaterThanOrEqual(0);
    expect(phase).toBeLessThan(360);

    const illum = Astronomy.Illumination(Astronomy.Body.Moon, time);
    expect(illum.phase_fraction).toBeGreaterThanOrEqual(0);
    expect(illum.phase_fraction).toBeLessThanOrEqual(1);
  });
});
