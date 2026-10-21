import { DURATION, DemoFrame, frameAt, scenes } from './demoScenes';
import { NarrationOptions, NARRATION_URL } from './narrationService';
import { SWAHILI_DURATION, swahiliFrameAt, swahiliScenes } from './swahiliDemoScenes';

export type DemoLanguage = 'english' | 'swahili';

export interface DemoConfiguration {
  language: DemoLanguage;
  duration: number;
  scenes: NarrationOptions['scenes'];
  narration: NarrationOptions;
  frameAt: (seconds: number) => DemoFrame;
  filenameLanguage: string;
}

const swahiliAudioPath = import.meta.env.VITE_DEMO_SWAHILI_NARRATION_PATH || 'audio/competition-narration.sw.wav';
const swahiliAudioUrl = swahiliAudioPath
  ? `${import.meta.env.BASE_URL}${swahiliAudioPath.replace(/^\/+/, '')}`
  : null;

export const DEMO_CONFIG: Record<DemoLanguage, DemoConfiguration> = {
  english: {
    language: 'english',
    duration: DURATION,
    scenes,
    narration: { duration: DURATION, scenes, sourceUrl: NARRATION_URL },
    frameAt,
    filenameLanguage: 'English'
  },
  swahili: {
    language: 'swahili',
    duration: SWAHILI_DURATION,
    scenes: swahiliScenes,
    narration: { duration: SWAHILI_DURATION, scenes: swahiliScenes, sourceUrl: swahiliAudioUrl },
    frameAt: swahiliFrameAt,
    filenameLanguage: 'Kiswahili'
  }
};