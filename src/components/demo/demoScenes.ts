import narrationScript from './narrationScript.json';
export const DEMO_ENABLED = import.meta.env.VITE_COMPETITION_DEMO !== 'false';

export const DURATION = 175;

// The complete presentation is 175 seconds; no recorded countdown or lead-in.
export const COUNTDOWN = 0;

export type DemoTab = 'sky' | 'timelab' | 'planner' | 'moon' | 'objects';

export const scenes = narrationScript;

export function frameAt(seconds: number) {

  const elapsed = Math.max(0, Math.min(DURATION, seconds));

  const scene = [...scenes].reverse().find(s => elapsed >= s.start)!;

  const tab: DemoTab = elapsed < 55 ? 'sky' : elapsed < 90 ? 'timelab' : elapsed < 125 ? 'planner' : elapsed < 140 ? 'moon' : elapsed < 155 ? 'objects' : 'sky';

  const advance = elapsed >= 65 && elapsed < 85 ? Math.floor(elapsed - 65) * 600 : elapsed >= 85 ? 12000 : 0;

  return { elapsed, scene, tab, date: new Date(Date.UTC(2026, 0, 15, 18) + advance * 1000 + (elapsed >= 110 ? 86400000 : 0)), selectStar: elapsed >= 30 && elapsed < 55, closing: elapsed >= 165 };

}

export type DemoFrame = ReturnType<typeof frameAt>;

/** One deadline, monotonic elapsed time, and an idempotent cancellation function. */

export function runTimeline(tick: (seconds: number) => void, complete: () => void, countdown = COUNTDOWN) {

  const start = performance.now();

  let stopped = false;

  const interval = setInterval(() => tick(Math.min(DURATION, (performance.now() - start) / 1000 - countdown)), 100);

  const deadline = setTimeout(() => { cancel(); complete(); }, (DURATION + countdown) * 1000);

  function cancel() { if (stopped) return; stopped = true; clearInterval(interval); clearTimeout(deadline); }

  tick(-countdown);

  return cancel;

}
