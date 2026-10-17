import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { englishVoices, narrationStream, NARRATION_URL, runNarratedTimeline, SpeechPreview, validateNarration, NarrationAudio } from '../components/demo/narrationService';
import { RecordingSession } from '../components/demo/recordingService';
import { scenes } from '../components/demo/demoScenes';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('bundled English narration', () => {
  it('ships real PCM speech in every synchronized scene and a silent countdown', () => {
    const bytes = readFileSync(new URL('../../public/audio/competition-narration.en.wav', import.meta.url));
    expect(bytes.toString('ascii', 0, 4)).toBe('RIFF');
    expect(bytes.toString('ascii', 8, 12)).toBe('WAVE');
    expect(bytes.readUInt16LE(20)).toBe(1); // PCM
    expect(bytes.readUInt16LE(22)).toBe(1); // mono
    expect(bytes.readUInt16LE(34)).toBe(16);
    const rate = bytes.readUInt32LE(24);
    const samples = Float32Array.from({ length: (bytes.length - 44) / 2 }, (_, i) => bytes.readInt16LE(44 + i * 2) / 32768);
    expect(samples.length / rate).toBe(178);
    expect(samples.slice(0, rate * 3).every(value => value === 0)).toBe(true);
    expect(() => validateNarration({ duration: 178, sampleRate: rate, getChannelData: () => samples } as unknown as AudioBuffer)).not.toThrow();
    expect(scenes.map(scene => scene.end)).toEqual([20, 55, 90, 125, 155, 175]);
    expect(NARRATION_URL).toBe('/audio/competition-narration.en.wav');
  });
  it('rejects silence and a mismatched duration before recording', () => {
    expect(() => validateNarration({ duration: 10 } as AudioBuffer)).toThrow('duration');
    expect(() => validateNarration({ duration: 178, sampleRate: 1, getChannelData: () => new Float32Array(178) } as unknown as AudioBuffer)).toThrow('silent');
  });
});
describe('audio-clock scene scheduling', () => {
  it('follows audio position, completes at the actual end, and clears timers', () => {
    vi.useFakeTimers(); const audio = { time: 0, healthy: true }; const tick = vi.fn(); const done = vi.fn(); const fail = vi.fn();
    runNarratedTimeline(audio, tick, done, fail);
    expect(tick).toHaveBeenLastCalledWith(-3);
    audio.time = 58; vi.advanceTimersByTime(50); expect(tick).toHaveBeenLastCalledWith(55);
    audio.time = 177.99; vi.advanceTimersByTime(50); expect(done).not.toHaveBeenCalled();
    audio.time = 178; vi.advanceTimersByTime(50); expect(done).toHaveBeenCalledOnce();
    expect(fail).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });
  it('fails on stalled or suspended audio instead of saving silent video', () => {
    vi.useFakeTimers(); const fail = vi.fn(); const done = vi.fn();
    runNarratedTimeline({ time: 3, healthy: true }, vi.fn(), done, fail);
    vi.advanceTimersByTime(4100); expect(fail).toHaveBeenCalledOnce(); expect(done).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
    runNarratedTimeline({ time: 3, healthy: false }, vi.fn(), done, fail);
    vi.advanceTimersByTime(50); expect(fail).toHaveBeenCalledTimes(2); expect(vi.getTimerCount()).toBe(0);
  });
  it('cancels without completing or leaking timers', () => {
    vi.useFakeTimers(); const done = vi.fn(); const fail = vi.fn();
    const stop = runNarratedTimeline({ time: 0, healthy: true }, vi.fn(), done, fail);
    stop(); stop(); vi.advanceTimersByTime(180000);
    expect(done).not.toHaveBeenCalled(); expect(fail).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });
});
describe('explicit recording audio', () => {
  it('combines video with narration and excludes duplicate captured audio', () => {
    const capturedAudio = { stop: vi.fn() }; const video = { kind: 'video' }; const clone = { kind: 'audio' };
    const voice = { kind: 'audio', readyState: 'live', clone: () => clone } as unknown as MediaStreamTrack;
    const capture = { getVideoTracks: () => [video], getAudioTracks: () => [capturedAudio] } as unknown as MediaStream;
    class Stream { constructor(public tracks: unknown[]) {} }
    vi.stubGlobal('MediaStream', Stream);
    expect(narrationStream(capture, voice)).toEqual(new Stream([video, clone]));
    expect(capturedAudio.stop).toHaveBeenCalledOnce();
    expect(() => narrationStream(capture, { kind: 'audio', readyState: 'ended' } as MediaStreamTrack)).toThrow('live narration');
  });
  it('refuses final recording without ready audio before constructing MediaRecorder', () => {
    const recorder = vi.fn(); vi.stubGlobal('MediaRecorder', recorder);
    expect(() => new RecordingSession({ getAudioTracks: () => [] } as unknown as MediaStream, vi.fn(), true)).toThrow('live narration');
    expect(recorder).not.toHaveBeenCalled();
  });
});
describe('voice failures and browser TTS preview', () => {
  it('reports missing asset and HTML fallback instead of claiming voice is ready', async () => {
    class FakeAudio { preload = ''; onerror = null; pause() {} removeAttribute() {} load() {} }
    vi.stubGlobal('Audio', FakeAudio);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    const first = new NarrationAudio(vi.fn()); await expect(first.load()).rejects.toThrow('HTTP 404'); first.dispose();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['<html>'], { type: 'text/html' }) }));
    const second = new NarrationAudio(vi.fn()); await expect(second.load()).rejects.toThrow('Expected audio'); second.dispose();
  });
  it('selects only English voices and reports synthesis errors', () => {
    vi.useFakeTimers(); const voice = { lang: 'en-GB', name: 'English' } as SpeechSynthesisVoice;
    expect(englishVoices([voice, { lang: 'fr-FR' } as SpeechSynthesisVoice])).toEqual([voice]);
    const synthesis = { cancel: vi.fn(), speak: vi.fn() };
    vi.stubGlobal('window', { speechSynthesis: synthesis });
    vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(public text: string) {} });
    const preview = new SpeechPreview(); const error = vi.fn();
    preview.speak('Hello', voice, error);
    const utterance = synthesis.speak.mock.calls[0][0];
    expect(utterance.voice).toBe(voice); utterance.onerror({ error: 'not-allowed' });
    expect(error).toHaveBeenCalledWith(expect.stringContaining('not-allowed'));
    preview.stop(); expect(vi.getTimerCount()).toBe(0);
    preview.speak('Hello', undefined, error); expect(error).toHaveBeenLastCalledWith(expect.stringContaining('No English'));
  });
  it('reports voices that never start and cancels the watchdog', () => {
    vi.useFakeTimers(); vi.stubGlobal('window', { speechSynthesis: { cancel: vi.fn(), speak: vi.fn() } });
    vi.stubGlobal('SpeechSynthesisUtterance', class {});
    const preview = new SpeechPreview(); const error = vi.fn();
    preview.speak('Hello', { lang: 'en-US' } as SpeechSynthesisVoice, error);
    vi.advanceTimersByTime(8000); expect(error).toHaveBeenCalledWith(expect.stringContaining('did not start'));
    expect(vi.getTimerCount()).toBe(0);
  });
});
