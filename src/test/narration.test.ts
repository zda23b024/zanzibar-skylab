import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { englishVoices, narrationStream, NARRATION_URL, runNarratedTimeline, SpeechPreview, validateNarration, silenceGaps, NarrationAudio } from '../components/demo/narrationService';
import { RecordingSession } from '../components/demo/recordingService';
import { swahiliScenes } from '../components/demo/swahiliDemoScenes';
import { scenes } from '../components/demo/demoScenes';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('bundled Kiswahili narration', () => {
  it('validates the supplied 180-second WAV against the Kiswahili scenes', () => {
    const bytes = readFileSync(new URL('../../public/audio/competition-narration.sw.wav', import.meta.url));
    let rate = 0;
    let samples = new Float32Array();
    for (let offset = 12; offset + 8 <= bytes.length;) {
      const kind = bytes.toString('ascii', offset, offset + 4);
      const size = bytes.readUInt32LE(offset + 4);
      if (kind === 'fmt ') {
        expect(bytes.readUInt16LE(offset + 8)).toBe(1);
        expect(bytes.readUInt16LE(offset + 10)).toBe(1);
        expect(bytes.readUInt16LE(offset + 22)).toBe(16);
        rate = bytes.readUInt32LE(offset + 12);
      }
      if (kind === 'data') samples = Float32Array.from({ length: size / 2 }, (_, i) => bytes.readInt16LE(offset + 8 + i * 2) / 32768);
      offset += 8 + size + size % 2;
    }
    expect(samples.length / rate).toBe(180);
    expect(() => validateNarration({ duration: 180, numberOfChannels: 1, sampleRate: rate, getChannelData: () => samples } as unknown as AudioBuffer, 180, swahiliScenes)).not.toThrow();
  });
});
describe('bundled English narration', () => {
  it('ships a 175-second timing draft with speech in every scene and no long gaps', () => {
    const bytes = readFileSync(new URL('../../public/audio/competition-narration.en.wav', import.meta.url));
    expect(bytes.toString('ascii', 0, 4)).toBe('RIFF');
    expect(bytes.toString('ascii', 8, 12)).toBe('WAVE');
    expect(bytes.readUInt16LE(20)).toBe(1); // PCM
    expect(bytes.readUInt16LE(22)).toBe(1); // mono
    expect(bytes.readUInt16LE(34)).toBe(16);
    const rate = bytes.readUInt32LE(24);
    const samples = Float32Array.from({ length: (bytes.length - 44) / 2 }, (_, i) => bytes.readInt16LE(44 + i * 2) / 32768);
    expect(samples.length / rate).toBe(175);
    expect(() => validateNarration({ duration: 175, numberOfChannels: 1, sampleRate: rate, getChannelData: () => samples } as unknown as AudioBuffer)).not.toThrow();
    expect(scenes.map(scene => scene.end)).toEqual([20, 55, 90, 125, 155, 175]);
    expect(NARRATION_URL).toBe('/audio/competition-narration.en.wav');
  });
  it('rejects silence and a mismatched duration before recording', () => {
    expect(() => validateNarration({ duration: 10 } as AudioBuffer)).toThrow('175 seconds');
    expect(() => validateNarration({ duration: 175, numberOfChannels: 1, sampleRate: 1, getChannelData: () => new Float32Array(175) } as unknown as AudioBuffer)).toThrow('silent');
  });
  it('rejects long silent gaps and handles right-channel-only narration', () => {
    const right = new Float32Array(17500).fill(0.1);
    const left = new Float32Array(17500);
    const buffer = { duration: 175, numberOfChannels: 2, sampleRate: 100, getChannelData: (channel: number) => channel ? right : left } as unknown as AudioBuffer;
    expect(() => validateNarration(buffer)).not.toThrow();
    right.fill(0, 1000, 1200);
    expect(silenceGaps(buffer)).toEqual([{ start: 10, end: 12, duration: 2 }]);
    expect(() => validateNarration(buffer)).toThrow('2.00 seconds of silence');
  });
});
describe('audio-clock scene scheduling', () => {
  it('follows audio position, completes at the actual end, and clears timers', () => {
    vi.useFakeTimers(); const audio = { time: 0, healthy: true }; const tick = vi.fn(); const done = vi.fn(); const fail = vi.fn();
    runNarratedTimeline(audio, tick, done, fail);
    expect(tick).toHaveBeenLastCalledWith(0);
    const advanceAudioTo = (target: number) => {
      while (audio.time + 1 < target) { audio.time += 1; vi.advanceTimersByTime(1000); }
      audio.time = target; vi.advanceTimersByTime(50);
    };
    advanceAudioTo(55); expect(tick).toHaveBeenLastCalledWith(55);
    advanceAudioTo(174.99); expect(done).not.toHaveBeenCalled();
    advanceAudioTo(175); expect(done).toHaveBeenCalledOnce();
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
