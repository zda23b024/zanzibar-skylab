import { afterEach, describe, expect, it, vi } from 'vitest';
import { COUNTDOWN, DURATION, frameAt, runTimeline, scenes } from '../components/demo/demoScenes';
import { APP_CAPTURE_HANDLE, APP_CAPTURE_ORIGIN, assertBrowserTabCapture, displayCaptureOptions, extensionFor, hasExactDuration, measureMediaDuration, RecordingSession, selectMime } from '../components/demo/recordingService';
import { runNarratedTimeline } from '../components/demo/narrationService';
import swahiliScript from '../components/demo/swahiliNarrationScript.json';
import { SWAHILI_DURATION, swahiliFrameAt } from '../components/demo/swahiliDemoScenes';
import { DEMO_CONFIG } from '../components/demo/demoConfig';
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('competition timeline', () => {
  it('uses all six boundaries and the real five modules', () => {
    expect(scenes.map(s => s.start)).toEqual([0, 20, 55, 90, 125, 155]);
    expect([0,55,90,125,140].map(t => frameAt(t).tab)).toEqual(['sky','timelab','planner','moon','objects']);
    expect(frameAt(30).selectStar).toBe(true);
    expect(frameAt(165).closing).toBe(true);
    expect(frameAt(65).date.getTime()).toBeLessThan(frameAt(80).date.getTime());
  });
  it('completes once at 175 seconds after countdown and clears every timer', () => {
    vi.useFakeTimers(); const done = vi.fn(); const tick = vi.fn();
    runTimeline(tick, done);
    expect(tick).toHaveBeenCalledWith(-COUNTDOWN);
    vi.advanceTimersByTime((DURATION + COUNTDOWN) * 1000 - 1);
    expect(done).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1); expect(done).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('cancellation is idempotent and prevents late completion', () => {
    vi.useFakeTimers(); const done = vi.fn(); const cancel = runTimeline(vi.fn(), done);
    cancel(); cancel(); vi.advanceTimersByTime(200000);
    expect(done).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });
  it('defines the exact 180-second Kiswahili scenes and local-language subtitles', () => {
    expect(SWAHILI_DURATION).toBe(180);
    expect(swahiliScript.map(scene => [scene.start, scene.end])).toEqual([[0,20],[20,55],[55,90],[90,125],[125,155],[155,180]]);
    const sceneOpenings = ['Karibuni Zanzibar', 'Tunaanza na Kichunguzi', 'Sasa tuangalie muda', 'Ni wakati gani mzuri', 'Katika Kichunguzi cha Mwezi', 'Zanzibar SkyLab inaunganisha'];
    expect(swahiliScript.every((scene, index) => scene.text.startsWith(sceneOpenings[index]))).toBe(true);
    expect(swahiliScript.every(scene => scene.subtitle.length > 0 && scene.text.length > scene.subtitle.length)).toBe(true);
    expect([0,20,55,90,125,140,155].map(time => swahiliFrameAt(time).tab)).toEqual(['sky','sky','timelab','planner','moon','objects','sky']);
    expect(swahiliFrameAt(168).closing).toBe(true);
  });
  it('keeps duration, narration source, scene schedule, navigation and filename language together', () => {
    expect(DEMO_CONFIG.english).toMatchObject({ duration: 175, filenameLanguage: 'English' });
    expect(DEMO_CONFIG.english.narration.sourceUrl).toContain('competition-narration.en.wav');
    expect(DEMO_CONFIG.english.scenes).toBe(scenes);
    expect(DEMO_CONFIG.english.frameAt(55).tab).toBe('timelab');
    expect(DEMO_CONFIG.swahili).toMatchObject({ duration: 180, filenameLanguage: 'Kiswahili' });
    expect(DEMO_CONFIG.swahili.narration.sourceUrl).toBe('/audio/competition-narration.sw.wav');
    expect(DEMO_CONFIG.swahili.scenes).toBe(swahiliScript);
    expect(DEMO_CONFIG.swahili.frameAt(55).tab).toBe('timelab');
    expect(DEMO_CONFIG.swahili.frameAt(55).appLanguage).toBe('sw');
  });
});
class FakeRecorder {
  static isTypeSupported = (mime: string) => mime === 'video/webm';
  static instance: FakeRecorder;
  static includeData = true;
  static dataDelayMs = 0;
  state = 'inactive'; mimeType = 'video/webm';
  ondataavailable?: (event: { data: Blob }) => void;
  onstart?: () => void; onstop?: () => void; onerror?: () => void;
  constructor() { FakeRecorder.instance = this; }
  start() { this.state = 'recording'; this.onstart?.(); }
  stop() {
    this.state = 'inactive';
    setTimeout(() => {
      if (FakeRecorder.includeData) this.ondataavailable?.({ data: new Blob(['video']) });
      this.onstop?.();
    }, FakeRecorder.dataDelayMs);
  }
}
function setup() {
  vi.stubGlobal('MediaRecorder', FakeRecorder);
  const track = { stop: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), getSettings: () => ({ displaySurface: 'browser' }), getCaptureHandle: () => ({ handle: APP_CAPTURE_HANDLE, origin: APP_CAPTURE_ORIGIN }) };
  const stream = { getTracks: () => [track], getVideoTracks: () => [track] } as unknown as MediaStream;
  const failure = vi.fn(); const session = new RecordingSession(stream, failure);
  return { session, track, failure };
}
describe('recording lifecycle', () => {
  afterEach(() => { FakeRecorder.includeData = true; FakeRecorder.dataDelayMs = 0; });
  it('accepts only exported media whose measured duration is 180.000 seconds', () => {
    expect(hasExactDuration(180, 180)).toBe(true);
    expect(hasExactDuration(180.0004, 180)).toBe(true);
    expect(hasExactDuration(179.999, 180)).toBe(false);
    expect(hasExactDuration(180.001, 180)).toBe(false);
    expect(hasExactDuration(Number.NaN, 180)).toBe(false);
  });
  it('measures finalized media metadata and revokes the temporary object URL', async () => {
    let loadCount = 0;
    const video = {
      duration: 180,
      preload: '',
      onloadedmetadata: null as (() => void) | null,
      onerror: null as (() => void) | null,
      removeAttribute: vi.fn(),
      load: () => { if (loadCount++ === 0) video.onloadedmetadata?.(); }
    };
    class FakeURL {
      static createObjectURL = vi.fn(() => 'blob:final-video');
      static revokeObjectURL = vi.fn();
    }
    vi.stubGlobal('URL', FakeURL);
    vi.stubGlobal('document', { createElement: vi.fn(() => video) });
    await expect(measureMediaDuration(new Blob(['final'] as BlobPart[]))).resolves.toBe(180);
    expect(FakeURL.createObjectURL).toHaveBeenCalledOnce();
    expect(FakeURL.revokeObjectURL).toHaveBeenCalledWith('blob:final-video');
  });
  it('prefers the current browser tab and does not request captured audio', () => {
    expect(displayCaptureOptions()).toMatchObject({
      video: true,
      audio: false,
      preferCurrentTab: true,
      selfBrowserSurface: 'include',
      monitorTypeSurfaces: 'exclude'
    });
  });
  it('rejects a screen or window instead of recording unrelated content', () => {
    const stream = { getVideoTracks: () => [{ getSettings: () => ({ displaySurface: 'monitor' }) }] } as unknown as MediaStream;
    expect(() => assertBrowserTabCapture(stream)).toThrow(/Only a verified browser tab/);
  });
  it('rejects a different browser tab, including another app tab', () => {
    const stream = { getVideoTracks: () => [{ getSettings: () => ({ displaySurface: 'browser' }), getCaptureHandle: () => ({ handle: 'other-tab-handle', origin: APP_CAPTURE_ORIGIN }) }] } as unknown as MediaStream;
    expect(() => assertBrowserTabCapture(stream)).toThrow(/this exact tab/);
  });
  it('negotiates MIME without assuming MP4', () => {
    expect(selectMime(m => m === 'video/mp4')).toBe('video/mp4');
    expect(selectMime(() => false)).toBeUndefined();
    expect(extensionFor('video/mp4;codecs=avc1')).toBe('mp4');
    expect(extensionFor('video/webm')).toBe('webm');
  });
  it('confirms recorder start and waits for delayed final chunks before producing the actual MIME Blob', async () => {
    FakeRecorder.dataDelayMs = 10;
    const { session, track } = setup();
    await session.start();
    expect(session.isRecording).toBe(true);
    const blob = await session.finish(true);
    expect(blob?.type).toBe('video/webm'); expect(blob?.size).toBe(5);
    expect(session.bytesCaptured).toBe(5); expect(session.chunkCount).toBe(1);
    expect(track.stop).toHaveBeenCalledOnce(); expect(track.removeEventListener).toHaveBeenCalledTimes(2);
  });
  it('does not produce a download Blob when no video chunks were captured', async () => {
    FakeRecorder.includeData = false;
    const { session } = setup();
    await session.start();
    expect(await session.finish(true)).toBeNull();
  });
  it('discards canceled recordings and releases the stream', async () => {
    const { session, track } = setup(); await session.start(); expect(await session.finish(false)).toBeNull();
    expect(track.stop).toHaveBeenCalledOnce();
  });
  it('does not produce a successful recording after recorder failure', async () => {
    const { session, failure } = setup(); await session.start(); FakeRecorder.instance.onerror?.();
    expect(await session.finish(true)).toBeNull(); expect(failure).toHaveBeenCalledOnce();
  });
  it('reports native sharing termination', async () => {
    const { track, failure, session } = setup(); await session.start(); track.addEventListener.mock.calls[0][1]();
    expect(failure).toHaveBeenCalledOnce(); await session.finish(false);
  });
  it('discards capture when the recording page becomes hidden', async () => {
    let visibilityHandler = () => {};
    const testDocument = {
      visibilityState: 'visible',
      addEventListener: vi.fn((_name: string, listener: () => void) => { visibilityHandler = listener; }),
      removeEventListener: vi.fn()
    };
    vi.stubGlobal('document', testDocument);
    const { session, failure, track } = setup();
    await session.start();
    testDocument.visibilityState = 'hidden';
    visibilityHandler();
    expect(failure).toHaveBeenCalledWith(expect.stringContaining('became hidden'));
    expect(await session.finish(true)).toBeNull();
    expect(track.stop).toHaveBeenCalledOnce();
  });
  it('drives presentation updates from narration time and rejects a stalled render clock', () => {
    vi.useFakeTimers();
    let audioTime = 0;
    const audio = { get time() { return audioTime; }, healthy: true };
    const tick = vi.fn(); const fail = vi.fn();
    const cancel = runNarratedTimeline(audio, tick, vi.fn(), fail);
    audioTime = 1;
    vi.advanceTimersByTime(50);
    expect(tick).toHaveBeenLastCalledWith(1 - COUNTDOWN);
    audioTime = 4;
    vi.advanceTimersByTime(50);
    expect(fail).toHaveBeenCalledWith(expect.stringContaining('fell behind'));
    cancel();
  });
});
