import { COUNTDOWN, DURATION, scenes } from './demoScenes';

// A public path only: never put credentials or a paid speech API in the client.
export const NARRATION_URL = `${import.meta.env.BASE_URL}${(import.meta.env.VITE_DEMO_NARRATION_PATH || 'audio/competition-narration.en.wav').replace(/^\/+/, '')}`;
export const NARRATION_LABEL = import.meta.env.VITE_DEMO_NARRATION_LABEL || 'System voice timing draft (Microsoft Hazel); professional track pending';

export function silenceGaps(buffer: AudioBuffer, threshold = 0.0031623) {
  // 20 ms RMS windows, -50 dBFS threshold; all channels count, not just the left.
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, channel) => buffer.getChannelData(channel));
  const step = Math.max(1, Math.round(buffer.sampleRate * 0.02));
  const samples = channels[0]?.length ?? 0;
  const gaps: { start: number; end: number; duration: number }[] = [];
  let start: number | undefined;
  for (let offset = 0; offset < samples; offset += step) {
    const end = Math.min(samples, offset + step);
    let loudest = 0;
    for (const channel of channels) {
      let energy = 0;
      for (let i = offset; i < end; i++) energy += channel[i] ** 2;
      loudest = Math.max(loudest, Math.sqrt(energy / (end - offset)));
    }
    if (loudest < threshold && start === undefined) start = offset / buffer.sampleRate;
    if (loudest >= threshold && start !== undefined) {
      const end = offset / buffer.sampleRate;
      gaps.push({ start, end, duration: end - start }); start = undefined;
    }
  }
  if (start !== undefined) gaps.push({ start, end: buffer.duration, duration: buffer.duration - start });
  return gaps;
}
export function validateNarration(buffer: AudioBuffer) {
  if (Math.abs(buffer.duration - DURATION) > 0.05) throw new Error('Narration must be 175 seconds (2:55), without a countdown. Export a 175-second master; WAV avoids MP3 encoder padding.');
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, channel) => buffer.getChannelData(channel));
  for (const scene of scenes) {
    let energy = 0;
    const begin = Math.floor(scene.start * buffer.sampleRate);
    const end = Math.min(channels[0]?.length ?? 0, Math.floor(scene.end * buffer.sampleRate));
    for (const samples of channels) for (let i = begin; i < end; i++) energy += samples[i] * samples[i];
    if (!channels.length || end <= begin || Math.sqrt(energy / ((end - begin) * channels.length)) < 0.001) throw new Error(`Narration is silent in scene: ${scene.title}.`);
  }
  const gap = silenceGaps(buffer).find(gap => gap.duration > 1.5);
  if (gap) throw new Error(`Narration contains ${gap.duration.toFixed(2)} seconds of silence at ${gap.start.toFixed(2)}s. Keep pauses under 1.5 seconds and preserve scene boundaries.`);
}

/** One fully downloaded local asset, routed to speakers AND an explicit recorder track. */
export class NarrationAudio {
  readonly audio = new Audio();
  private abort = new AbortController();
  private objectUrl?: string;
  private bytes?: ArrayBuffer;
  private context?: AudioContext;
  private source?: MediaElementAudioSourceNode;
  private gain?: GainNode;
  private destination?: MediaStreamAudioDestinationNode;
  private disposed = false;
  private operation = 0;
  private loadCancel?: () => void;
  private verified = false;
  private testTimer?: ReturnType<typeof setTimeout>;
  private preparationCancel?: () => void;
  constructor(private onFailure: (message: string) => void, private file?: File) {
    this.audio.preload = 'auto';
    this.audio.onerror = () => onFailure(`Narration playback failed (media error ${this.audio.error?.code ?? 'unknown'}). Check ${NARRATION_URL}.`);
  }
  async load() {
    const timeout = setTimeout(() => this.abort.abort(), 30000);
    try {
      let blob: Blob;
      if (this.file) {
        if (!/\.(mp3|wav)$/i.test(this.file.name)) throw new Error('Choose an MP3 or WAV narration file.');
        blob = this.file;
      } else {
        const response = await fetch(NARRATION_URL, { signal: this.abort.signal });
        if (!response.ok) throw new Error(`Narration file ${NARRATION_URL} returned HTTP ${response.status}.`);
        blob = await response.blob();
        if (!blob.type.startsWith('audio/')) throw new Error(`Expected audio at ${NARRATION_URL}, received ${blob.type || 'no content type'}. Check the public asset and Vercel routing.`);
      }
      this.bytes = await blob.arrayBuffer();
      if (this.disposed) throw new Error('Narration loading canceled.');
      this.objectUrl = URL.createObjectURL(blob);
      await new Promise<void>((resolve, reject) => {
        const done = (error?: Error) => {
          this.audio.removeEventListener('canplaythrough', ready);
          this.audio.removeEventListener('error', failed);
          this.abort.signal.removeEventListener('abort', aborted);
          this.loadCancel = undefined;
          error ? reject(error) : resolve();
        };
        const ready = () => done();
        const failed = () => done(new Error('The browser cannot decode this narration file. Try a PCM WAV or standard MP3.'));
        const aborted = () => done(new Error('Narration loading timed out or was canceled.'));
        this.loadCancel = aborted;
        this.audio.addEventListener('canplaythrough', ready);
        this.audio.addEventListener('error', failed);
        this.abort.signal.addEventListener('abort', aborted);
        this.audio.src = this.objectUrl!;
        this.audio.load();
      });
    } finally { clearTimeout(timeout); }
  }
  /** Call synchronously from a click: unlock both autoplay and Web Audio before awaiting. */
  async prepare() {
    if (!this.bytes || this.disposed) throw new Error('Narration file is not ready.');
    this.preparationCancel?.();
    const operation = ++this.operation;
    this.stopPlayback();
    if (!this.context) {
      this.context = new AudioContext();
      this.source = this.context.createMediaElementSource(this.audio);
      this.gain = this.context.createGain();
      this.destination = this.context.createMediaStreamDestination();
      this.source.connect(this.gain);
      this.gain.connect(this.context.destination);
      this.gain.connect(this.destination);
    }
    this.gain!.gain.value = 0;
    this.audio.currentTime = 0;
    const activation = Promise.all([this.context.resume(), this.audio.play()]);
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const done = (error?: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout); this.preparationCancel = undefined;
        error ? reject(error) : resolve();
      };
      const timeout = setTimeout(() => done(new Error('Audio activation timed out. Allow sound for this site and click Test Voice.')), 10000);
      this.preparationCancel = () => done(new Error('Narration preparation canceled.'));
      activation.then(() => done(), error => done(error));
    });
    if (this.disposed || operation !== this.operation) throw new Error('Narration preparation canceled.');
    this.audio.pause(); this.audio.currentTime = 0;
    if (!this.verified) {
      validateNarration(await this.context.decodeAudioData(this.bytes.slice(0)));
      this.verified = true;
    }
    if (this.disposed || operation !== this.operation) throw new Error('Narration preparation canceled.');
    if (this.context.state !== 'running' || !this.track || this.track.readyState !== 'live') throw new Error('The browser did not activate the narration audio track. Click Test Voice and check audio permissions.');
  }
  get track() { return this.destination?.stream.getAudioTracks()[0]; }
  get time() { return Math.min(DURATION, this.audio.ended ? DURATION : this.audio.currentTime); }
  get healthy() { return this.context?.state === 'running' && this.track?.readyState === 'live' && !this.audio.error; }
  async start() {
    if (!this.healthy || !this.verified) throw new Error('Narration audio is not ready for recording.');
    this.gain!.gain.value = 1;
    this.audio.currentTime = 0;
    await this.audio.play();
  }
  async test() {
    await this.prepare();
    this.gain!.gain.value = 1;
    this.audio.currentTime = COUNTDOWN;
    await this.audio.play();
    this.testTimer = setTimeout(() => this.stop(), 12000);
  }
  private stopPlayback() { clearTimeout(this.testTimer); this.audio.pause(); }
  stop() { this.operation++; this.preparationCancel?.(); this.stopPlayback(); if (this.gain) this.gain.gain.value = 0; }
  dispose() {
    this.disposed = true; this.stop(); this.abort.abort(); this.loadCancel?.();
    this.audio.onerror = null; this.audio.removeAttribute('src'); this.audio.load();
    this.source?.disconnect(); this.gain?.disconnect(); this.destination?.disconnect();
    this.destination?.stream.getTracks().forEach(track => track.stop());
    void this.context?.close();
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
  }
}

export function englishVoices(voices: SpeechSynthesisVoice[]) { return voices.filter(voice => /^en(?:-|_)/i.test(voice.lang) || voice.lang === 'en'); }
/** Preview only: SpeechSynthesis offers no PCM/MediaStream output for reliable embedding. */
export class SpeechPreview {
  private utterance?: SpeechSynthesisUtterance;
  private watchdog?: ReturnType<typeof setTimeout>;
  private revision = 0;
  stop() { this.revision++; clearTimeout(this.watchdog); if ('speechSynthesis' in window) window.speechSynthesis.cancel(); this.utterance = undefined; }
  speak(text: string, voice: SpeechSynthesisVoice | undefined, onError: (message: string) => void) {
    this.stop();
    if (!('speechSynthesis' in window)) { onError('Speech synthesis is unavailable in this browser.'); return; }
    if (!voice) { onError('No English speech voice is installed or loaded. Install an English system voice, then reload.'); return; }
    const revision = this.revision;
    const utterance = new SpeechSynthesisUtterance(text);
    this.utterance = utterance; utterance.voice = voice; utterance.lang = voice.lang; utterance.rate = 1;
    utterance.onstart = () => clearTimeout(this.watchdog);
    utterance.onerror = event => { if (revision === this.revision) { clearTimeout(this.watchdog); onError(`English speech preview failed: ${event.error}. Check browser audio permissions and the selected voice.`); } };
    utterance.onend = () => clearTimeout(this.watchdog);
    this.watchdog = setTimeout(() => { if (revision === this.revision) { this.stop(); onError('The English voice did not start. Try another voice or check browser audio permissions.'); } }, 8000);
    window.speechSynthesis.speak(utterance);
  }
}

export function narrationStream(capture: MediaStream, narration: MediaStreamTrack) {
  if (narration.kind !== 'audio' || narration.readyState !== 'live') throw new Error('A live narration track is required before recording.');
  // Exclude captured tab audio to prevent doubling the narration heard through speakers.
  capture.getAudioTracks().forEach(track => track.stop());
  return new MediaStream([...capture.getVideoTracks(), narration.clone()]);
}

/** Audio is the clock: scenes cannot drift away from the recorded words. */
export function runNarratedTimeline(audio: Pick<NarrationAudio, 'time' | 'healthy'>, tick: (time: number) => void, complete: () => void, fail: (message: string) => void) {
  let previous = audio.time;
  let progressedAt = performance.now();
  let stopped = false;
  const timer = setInterval(() => {
    if (!audio.healthy) { cancel(); fail('Narration audio was interrupted. The recording was discarded; check audio permissions and try again.'); return; }
    const time = audio.time;
    if (time >= DURATION + COUNTDOWN) { cancel(); complete(); return; }
    if (time > previous) { previous = time; progressedAt = performance.now(); }
    else if (performance.now() - progressedAt > 4000) { cancel(); fail('Narration playback stalled. The recording was discarded rather than saving a silent video.'); return; }
    tick(time - COUNTDOWN);
  }, 50);
  function cancel() { if (!stopped) { stopped = true; clearInterval(timer); } }
  tick(audio.time - COUNTDOWN);
  return cancel;
}
