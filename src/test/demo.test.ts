import { afterEach, describe, expect, it, vi } from 'vitest';
import { COUNTDOWN, DURATION, frameAt, runTimeline, scenes } from '../components/demo/demoScenes';
import { extensionFor, RecordingSession, selectMime } from '../components/demo/recordingService';
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
});
class FakeRecorder {
  static isTypeSupported = (mime: string) => mime === 'video/webm';
  static instance: FakeRecorder;
  state = 'inactive'; mimeType = 'video/webm';
  ondataavailable?: (event: { data: Blob }) => void;
  onstop?: () => void; onerror?: () => void;
  constructor() { FakeRecorder.instance = this; }
  start() { this.state = 'recording'; }
  stop() { this.state = 'inactive'; queueMicrotask(() => { this.ondataavailable?.({ data: new Blob(['video']) }); this.onstop?.(); }); }
}
function setup() {
  vi.stubGlobal('MediaRecorder', FakeRecorder);
  const track = { stop: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const stream = { getTracks: () => [track], getVideoTracks: () => [track] } as unknown as MediaStream;
  const failure = vi.fn(); const session = new RecordingSession(stream, failure); session.start();
  return { session, track, failure };
}
describe('recording lifecycle', () => {
  it('negotiates MIME without assuming MP4', () => {
    expect(selectMime(m => m === 'video/mp4')).toBe('video/mp4');
    expect(selectMime(() => false)).toBeUndefined();
    expect(extensionFor('video/mp4;codecs=avc1')).toBe('mp4');
    expect(extensionFor('video/webm')).toBe('webm');
  });
  it('waits for final chunks and uses the actual recorder MIME', async () => {
    const { session, track } = setup(); const blob = await session.finish(true);
    expect(blob?.type).toBe('video/webm'); expect(blob?.size).toBe(5);
    expect(track.stop).toHaveBeenCalledOnce(); expect(track.removeEventListener).toHaveBeenCalledOnce();
  });
  it('discards canceled recordings and releases the stream', async () => {
    const { session, track } = setup(); expect(await session.finish(false)).toBeNull();
    expect(track.stop).toHaveBeenCalledOnce();
  });
  it('does not produce a successful recording after recorder failure', async () => {
    const { session, failure } = setup(); FakeRecorder.instance.onerror?.();
    expect(await session.finish(true)).toBeNull(); expect(failure).toHaveBeenCalledOnce();
  });
  it('reports native sharing termination', () => {
    const { track, failure, session } = setup(); track.addEventListener.mock.calls[0][1]();
    expect(failure).toHaveBeenCalledOnce(); void session.finish(false);
  });
});
