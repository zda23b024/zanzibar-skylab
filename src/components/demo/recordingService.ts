export const MIME_TYPES = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
export function selectMime(supported: (type: string) => boolean) { return MIME_TYPES.find(supported); }
export function extensionFor(mime: string) { return mime.startsWith('video/mp4') ? 'mp4' : 'webm'; }
export function measureMediaDuration(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const video = document.createElement('video');
    const cleanup = () => {
      video.onloadedmetadata = null;
      video.onerror = null;
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(objectUrl);
    };
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();
      Number.isFinite(duration) ? resolve(duration) : reject(new Error('The recording container did not expose a finite media duration.'));
    };
    video.onerror = () => { cleanup(); reject(new Error('The browser could not read the finalized recording duration.')); };
    video.src = objectUrl;
    video.load();
  });
}
export function hasExactDuration(actualSeconds: number, expectedSeconds: number) {
  return Number.isFinite(actualSeconds) && Math.round(actualSeconds * 1000) === expectedSeconds * 1000;
}
const captureNonce = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const APP_CAPTURE_HANDLE = `zanzibar-skylab-${captureNonce}`;
export const APP_CAPTURE_ORIGIN = typeof location === 'undefined' ? '' : location.origin;
type CaptureHandleMediaDevices = MediaDevices & {
  setCaptureHandleConfig?: (config: { handle: string; permittedOrigins: string[]; exposeOrigin: boolean }) => void;
};
type CaptureHandleTrack = MediaStreamTrack & {
  getCaptureHandle?: () => { handle: string; origin?: string } | null;
};
let captureHandleConfigured = false;
if (typeof navigator !== 'undefined' && navigator.mediaDevices && typeof location !== 'undefined') {
  const devices = navigator.mediaDevices as CaptureHandleMediaDevices;
  try {
    if (typeof devices.setCaptureHandleConfig === 'function' &&
        typeof (MediaStreamTrack.prototype as CaptureHandleTrack).getCaptureHandle === 'function') {
      devices.setCaptureHandleConfig({ handle: APP_CAPTURE_HANDLE, permittedOrigins: [APP_CAPTURE_ORIGIN], exposeOrigin: true });
      captureHandleConfigured = true;
    }
  } catch {
    captureHandleConfigured = false;
  }
}
export function exactTabCaptureSupported() { return captureHandleConfigured; }
type ChromiumDisplayMediaOptions = DisplayMediaStreamOptions & {
  preferCurrentTab: boolean;
  selfBrowserSurface: 'include' | 'exclude';
  monitorTypeSurfaces: 'include' | 'exclude';
  surfaceSwitching: 'include' | 'exclude';
};
export function displayCaptureOptions(): ChromiumDisplayMediaOptions {
  return {
    video: true,
    audio: false,
    preferCurrentTab: true,
    selfBrowserSurface: 'include',
    monitorTypeSurfaces: 'exclude',
    surfaceSwitching: 'exclude'
  };
}
export function assertBrowserTabCapture(stream: MediaStream) {
  const videoTrack = stream.getVideoTracks()[0] as CaptureHandleTrack | undefined;
  const surface = videoTrack?.getSettings().displaySurface;
  if (!videoTrack || surface !== 'browser') throw new Error(`Only a verified browser tab can be recorded; the selected surface is ${surface || 'unknown'}. Choose “This Tab” in the sharing picker.`);
  const captureHandle = videoTrack.getCaptureHandle?.();
  if (captureHandle?.handle !== APP_CAPTURE_HANDLE || captureHandle.origin !== APP_CAPTURE_ORIGIN) {
    throw new Error('The selected tab could not be verified as this Zanzibar SkyLab page. Select this exact tab in the sharing picker.');
  }
  return videoTrack;
}
export function recordingSupported() {
  return window.isSecureContext && captureHandleConfigured && !!navigator.mediaDevices?.getDisplayMedia && typeof MediaRecorder !== 'undefined' && !!selectMime(type => MediaRecorder.isTypeSupported(type));
}
export function stopTracks(stream: MediaStream) { stream.getTracks().forEach(track => track.stop()); }
export class RecordingSession {
  private recorder: MediaRecorder;
  private chunks: Blob[] = [];
  private finishing = false;
  private failed = false;
  private started = false;
  private totalBytes = 0;
  private totalChunks = 0;
  private lastDataAt = 0;
  private watchdog?: ReturnType<typeof setInterval>;
  private resolveStarted!: () => void;
  private rejectStarted!: (error: Error) => void;
  private startedPromise: Promise<void>;
  private resolve!: (blob: Blob | null) => void;
  private result: Promise<Blob | null>;
  private ended = () => { if (!this.finishing) this.onFailure('Screen sharing or narration ended. No completed recording was saved.'); };
  private muted = () => this.interrupt('The captured tab or narration track was interrupted. The recording was discarded.');
  private visibilityChanged = () => {
    if (document.visibilityState !== 'visible') this.interrupt('The recording tab became hidden. Background-tab rendering is not reliable, so this recording was discarded. Keep the dedicated recording window visible and work in a separate window.');
  };
  constructor(private stream: MediaStream, private onFailure: (message: string) => void, requireNarration = false) {
    if (requireNarration && !stream.getAudioTracks().some(track => track.readyState === 'live')) throw new Error('Recording requires a live narration audio track.');
    assertBrowserTabCapture(stream);
    const mimeType = selectMime(type => MediaRecorder.isTypeSupported(type));
    if (!mimeType) throw new Error('No supported video recording format.');
    this.startedPromise = new Promise((resolve, reject) => { this.resolveStarted = resolve; this.rejectStarted = reject; });
    this.recorder = new MediaRecorder(stream, { mimeType });
    this.result = new Promise(resolve => { this.resolve = resolve; });
    this.recorder.ondataavailable = event => {
      if (event.data.size) { this.chunks.push(event.data); this.totalBytes += event.data.size; this.totalChunks++; this.lastDataAt = performance.now(); }
    };
    this.recorder.onstart = () => { this.started = true; this.resolveStarted(); };
    this.recorder.onerror = () => {
      this.failed = true;
      this.rejectStarted(new Error('MediaRecorder reported a recording error.'));
      this.onFailure('Recording failed. No completed recording was saved.');
      void this.finish(false);
    };
    this.recorder.onstop = () => {
      const unexpected = !this.finishing;
      if (unexpected) { this.failed = true; this.onFailure('Recording stopped unexpectedly. No completed recording was saved.'); }
      const blob = !this.failed && this.chunks.length && this.totalBytes > 0
        ? new Blob(this.chunks, { type: this.recorder.mimeType })
        : null;
      this.chunks = [];
      this.release();
      this.resolve(blob);
    };
    stream.getTracks().forEach(track => {
      track.addEventListener('ended', this.ended);
      track.addEventListener('mute', this.muted);
    });
  }
  get isRecording() { return this.started && this.recorder.state === 'recording'; }
  get chunkCount() { return this.totalChunks; }
  get bytesCaptured() { return this.totalBytes; }
  get mimeType() { return this.recorder.mimeType; }
  async start() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.visibilityChanged);
      this.visibilityChanged();
    }
    if (this.finishing) throw new Error('Recording was interrupted before it could start.');
    this.lastDataAt = performance.now();
    this.recorder.start(1000);
    if (this.recorder.state !== 'recording') throw new Error('MediaRecorder did not enter the recording state.');
    let startTimeout: ReturnType<typeof setTimeout> | undefined;
    const startDeadline = new Promise<never>((_, reject) => {
      startTimeout = setTimeout(() => reject(new Error('MediaRecorder did not confirm its start event.')), 3000);
    });
    try { await Promise.race([this.startedPromise, startDeadline]); }
    catch (error) { this.failed = true; void this.finish(false); throw error; }
    finally { if (startTimeout) clearTimeout(startTimeout); }
    this.watchdog = setInterval(() => {
      if (!this.finishing && performance.now() - this.lastDataAt > 5000) {
        this.interrupt('The recorder stopped receiving video data. The recording was discarded; keep the tab visible and try a dedicated recording window.');
      }
    }, 2000);
  }
  finish(keep: boolean): Promise<Blob | null> {
    if (!keep) this.failed = true;
    if (!this.finishing) {
      this.finishing = true;
      if (this.recorder.state !== 'inactive') this.recorder.stop();
      else { this.release(); this.resolve(null); }
    }
    return this.result;
  }
  private release() {
    clearInterval(this.watchdog);
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', this.visibilityChanged);
    this.stream.getTracks().forEach(track => {
      track.removeEventListener('ended', this.ended);
      track.removeEventListener('mute', this.muted);
    });
    stopTracks(this.stream);
  }
  private interrupt(message: string) {
    if (this.finishing || this.failed) return;
    this.failed = true;
    this.onFailure(message);
    void this.finish(false);
  }
}
