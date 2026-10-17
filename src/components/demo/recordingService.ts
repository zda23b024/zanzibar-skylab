export const MIME_TYPES = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
export function selectMime(supported: (type: string) => boolean) { return MIME_TYPES.find(supported); }
export function extensionFor(mime: string) { return mime.startsWith('video/mp4') ? 'mp4' : 'webm'; }
export function recordingSupported() {
  return window.isSecureContext && !!navigator.mediaDevices?.getDisplayMedia && typeof MediaRecorder !== 'undefined' && !!selectMime(type => MediaRecorder.isTypeSupported(type));
}
export function stopTracks(stream: MediaStream) { stream.getTracks().forEach(track => track.stop()); }
export class RecordingSession {
  private recorder: MediaRecorder;
  private chunks: Blob[] = [];
  private finishing = false;
  private failed = false;
  private resolve!: (blob: Blob | null) => void;
  private result: Promise<Blob | null>;
  private ended = () => { if (!this.finishing) this.onFailure('Screen sharing or narration ended. No completed recording was saved.'); };
  constructor(private stream: MediaStream, private onFailure: (message: string) => void, requireNarration = false) {
    if (requireNarration && !stream.getAudioTracks().some(track => track.readyState === 'live')) throw new Error('Recording requires a live narration audio track.');
    const mimeType = selectMime(type => MediaRecorder.isTypeSupported(type));
    if (!mimeType) throw new Error('No supported video recording format.');
    this.recorder = new MediaRecorder(stream, { mimeType });
    this.result = new Promise(resolve => { this.resolve = resolve; });
    this.recorder.ondataavailable = event => { if (event.data.size) this.chunks.push(event.data); };
    this.recorder.onerror = () => { this.failed = true; this.onFailure('Recording failed. No completed recording was saved.'); this.finish(false); };
    this.recorder.onstop = () => {
      const unexpected = !this.finishing;
      if (unexpected) { this.failed = true; this.onFailure('Recording stopped unexpectedly. No completed recording was saved.'); }
      const blob = !this.failed && this.chunks.length ? new Blob(this.chunks, { type: this.recorder.mimeType }) : null;
      this.chunks = [];
      this.release();
      this.resolve(blob);
    };
    stream.getTracks().forEach(track => track.addEventListener('ended', this.ended));
  }
  start() { this.recorder.start(1000); }
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
    this.stream.getTracks().forEach(track => track.removeEventListener('ended', this.ended));
    stopTracks(this.stream);
  }
}
