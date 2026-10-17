export const DEMO_ENABLED = import.meta.env.VITE_COMPETITION_DEMO !== 'false';
export const DURATION = 175;
export const COUNTDOWN = 3;
export type DemoTab = 'sky' | 'timelab' | 'planner' | 'moon' | 'objects';
export const scenes = [
  { start: 0, title: 'Introduction', text: 'Zanzibar SkyLab · Explore the sky from Stone Town, 6° south of the equator. A fixed observing date makes this demonstration reproducible.' },
  { start: 20, title: 'Sky Explorer', text: 'Select a catalogued star to inspect calculated altitude and azimuth. These coordinates depend on the observer’s location and observing time.' },
  { start: 55, title: 'Astronomical Time Lab', text: 'Advance the observing time to follow Earth’s rotation. Solar time and sidereal time describe different reference directions.' },
  { start: 90, title: 'Observation Planner', text: 'Calculated altitude curves and twilight times help plan an observing session. Weather, terrain and light pollution still affect visibility.' },
  { start: 125, title: 'Moon Explorer and Object Directory', text: 'Lunar illumination describes geometry, not a guarantee of crescent visibility. The directory connects catalogued objects to their calculated sky positions.' },
  { start: 155, title: 'Innovation and conclusion', text: 'Five connected observatory tools, with astronomy calculated in your browser. Zanzibar SkyLab brings observation planning and scientific exploration together.' },
] as const;
export function frameAt(seconds: number) {
  const elapsed = Math.max(0, Math.min(DURATION, seconds));
  const scene = [...scenes].reverse().find(s => elapsed >= s.start)!;
  const tab: DemoTab = elapsed < 55 ? 'sky' : elapsed < 90 ? 'timelab' : elapsed < 125 ? 'planner' : elapsed < 140 ? 'moon' : elapsed < 155 ? 'objects' : 'sky';
  const advance = elapsed >= 65 && elapsed < 85 ? Math.floor(elapsed - 65) * 600 : elapsed >= 85 ? 12000 : 0;
  return { elapsed, scene, tab, date: new Date(Date.UTC(2026, 0, 15, 18) + advance * 1000 + (elapsed >= 110 ? 86400000 : 0)), selectStar: elapsed >= 30 && elapsed < 55, closing: elapsed >= 165 };
}
export type DemoFrame = ReturnType<typeof frameAt>;
/** One deadline, monotonic elapsed time, and an idempotent cancellation function. */
export function runTimeline(tick: (seconds: number) => void, complete: () => void) {
  const start = performance.now();
  let stopped = false;
  const interval = setInterval(() => tick(Math.min(DURATION, (performance.now() - start) / 1000 - COUNTDOWN)), 100);
  const deadline = setTimeout(() => { cancel(); complete(); }, (DURATION + COUNTDOWN) * 1000);
  function cancel() { if (stopped) return; stopped = true; clearInterval(interval); clearTimeout(deadline); }
  tick(-COUNTDOWN);
  return cancel;
}
