import script from './swahiliNarrationScript.json';
import { DemoFrame, DemoTab } from './demoScenes';

export const SWAHILI_DURATION = 180;
export const swahiliScenes = script;

export function swahiliFrameAt(seconds: number): DemoFrame {
  const elapsed = Math.max(0, Math.min(SWAHILI_DURATION, seconds));
  const scene = [...swahiliScenes].reverse().find(candidate => elapsed >= candidate.start)!;
  const tab: DemoTab = elapsed < 55 ? 'sky' : elapsed < 90 ? 'timelab' : elapsed < 125 ? 'planner' : elapsed < 140 ? 'moon' : elapsed < 155 ? 'objects' : 'sky';
  const advance = elapsed >= 65 && elapsed < 85 ? Math.floor(elapsed - 65) * 600 : elapsed >= 85 ? 12000 : 0;

  return {
    elapsed,
    appLanguage: 'sw',
    scene: { start: scene.start, end: scene.end, title: scene.title, text: scene.subtitle },
    tab,
    date: new Date(Date.UTC(2026, 0, 15, 18) + advance * 1000 + (elapsed >= 110 ? 86400000 : 0)),
    selectStar: elapsed >= 30 && elapsed < 55,
    closing: elapsed >= 168
  };
}