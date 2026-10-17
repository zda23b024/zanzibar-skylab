import React, { useEffect, useRef, useState } from 'react';
import { COUNTDOWN, DemoFrame, frameAt, runTimeline, scenes } from './demoScenes';
import { extensionFor, RecordingSession, recordingSupported, stopTracks } from './recordingService';
import { DemoOverlay } from './DemoOverlay';
import { englishVoices, NarrationAudio, NARRATION_URL, NARRATION_LABEL, narrationStream, runNarratedTimeline, SpeechPreview } from './narrationService';

type Phase = 'preflight' | 'permission' | 'running' | 'finalizing' | 'finished' | 'error';
export function DemoController({ onClose, onActive, renderObservatory }: { onClose: () => void; onActive: (active: boolean) => void; renderObservatory: (frame: DemoFrame) => React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>('preflight');
  const [elapsed, setElapsed] = useState(-COUNTDOWN);
  const [message, setMessage] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [audioStatus, setAudioStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceUri, setVoiceUri] = useState('');
  const [previewTts, setPreviewTts] = useState(false);
  const [voiceLabel, setVoiceLabel] = useState('');
  const [narrationFile, setNarrationFile] = useState<File | undefined>();
  const [download, setDownload] = useState<{ url: string; name: string } | null>(null);
  const session = useRef<RecordingSession | null>(null);
  const narration = useRef<NarrationAudio | null>(null);
  const speech = useRef<SpeechPreview | null>(null);
  if (!speech.current) speech.current = new SpeechPreview();
  const cancelTimer = useRef<(() => void) | null>(null);
  const generation = useRef(0);
  const url = useRef<string | null>(null);
  const busy = useRef(false);
  const testBusy = useRef(false);
  const activeCallback = useRef(onActive);
  const failureCallback = useRef<(message: string) => void>(() => {});
  activeCallback.current = onActive;
  const selectedVoice = voices.find(voice => voice.voiceURI === voiceUri) || voices.find(voice => voice.default) || voices[0];
  const trackLabel = narrationFile ? `Local narration: ${narrationFile.name}` : NARRATION_LABEL;
  const clearDownload = () => { if (url.current) URL.revokeObjectURL(url.current); url.current = null; setDownload(null); };
  useEffect(() => {
    let disposed = false;
    setAudioStatus('loading'); setVoiceError('');
    const audio = new NarrationAudio(text => {
      if (disposed) return;
      setVoiceError(text); setAudioStatus('error');
      if (busy.current) failureCallback.current(text);
    }, narrationFile);
    narration.current = audio;
    void audio.load().then(() => { if (!disposed) setAudioStatus('ready'); }).catch(error => {
      if (!disposed) { setAudioStatus('error'); setVoiceError(`${error instanceof Error ? error.message : 'Audio load failed.'} Final recording is disabled. Use English TTS preview or reload to retry.`); }
    });
    const updateVoices = () => setVoices(englishVoices(window.speechSynthesis.getVoices()));
    if ('speechSynthesis' in window) { updateVoices(); window.speechSynthesis.addEventListener('voiceschanged', updateVoices); }
    return () => {
      disposed = true; generation.current++; cancelTimer.current?.();
      void session.current?.finish(false); audio.dispose(); speech.current?.stop();
      if ('speechSynthesis' in window) window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
      if (url.current) URL.revokeObjectURL(url.current);
      activeCallback.current(false);
    };
  }, [narrationFile]);
  function stopVoice() { narration.current?.stop(); speech.current?.stop(); }
  function fail(text: string) {
    generation.current++; cancelTimer.current?.(); stopVoice();
    void session.current?.finish(false); session.current = null;
    busy.current = false; onActive(false); setMessage(text); setPhase('error');
  }
  failureCallback.current = fail;
  async function finish(keep: boolean, completed = false) {
    const token = ++generation.current;
    cancelTimer.current?.();
    const pending = session.current?.finish(keep);
    session.current = null; stopVoice();
    setPhase('finalizing'); onActive(false);
    const blob = await pending;
    if (token !== generation.current) return;
    busy.current = false;
    if (blob?.size) {
      const nextUrl = URL.createObjectURL(blob); url.current = nextUrl;
      const name = `zanzibar-skylab${completed ? '' : '-partial'}.${extensionFor(blob.type)}`;
      setDownload({ url: nextUrl, name });
      const anchor = document.createElement('a'); anchor.href = nextUrl; anchor.download = name; anchor.click();
      setMessage(`${completed ? 'Presentation complete.' : 'Stopped early; partial recording.'} English narration was routed into the recording audio track. Download requested. Use Download Recording if automatic saving was blocked, and check playback before submission.`);
    } else setMessage(keep && pending ? 'No usable video was produced. Please try again.' : completed ? 'Narrated preview complete. No recording was made.' : 'Canceled. No recording was saved.');
    setPhase('finished');
  }
  function playWithAudio() {
    setVoiceLabel(`${trackLabel} - audio track connected`);
    onActive(true); setPhase('running');
    cancelTimer.current = runNarratedTimeline(narration.current!, setElapsed, () => { void finish(true, true); }, fail);
  }
  // Capture is requested directly from the click, before awaiting audio or permissions.
  async function startRecording() {
    if (busy.current || audioStatus !== 'ready') return;
    busy.current = true; const token = ++generation.current;
    let capture: MediaStream | undefined;
    let mixed: MediaStream | undefined;
    try {
      const permission = navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      // Unlock audio in the SAME gesture; settle immediately to avoid unhandled rejections.
      const prepared = narration.current!.prepare().then(() => null, error => error);
      speech.current?.stop(); clearDownload(); setVoiceError(''); setPhase('permission');
      capture = await permission;
      if (token !== generation.current) { stopTracks(capture); return; }
      const audioError = await prepared;
      if (token !== generation.current) { stopTracks(capture); return; }
      if (audioError) throw audioError;
      if (!capture.getVideoTracks().some(track => track.readyState === 'live')) throw new Error('No live video track was shared.');
      mixed = narrationStream(capture, narration.current!.track!);
      session.current = new RecordingSession(mixed, fail, true);
      session.current.start();
      await narration.current!.start();
      if (token !== generation.current) { stopTracks(capture); stopTracks(mixed); return; }
      playWithAudio();
    } catch (error) {
      if (capture) stopTracks(capture);
      if (mixed) stopTracks(mixed);
      if (token !== generation.current) return;
      fail(`Recording could not start: ${error instanceof Error ? error.message : 'capture or narration unavailable'}. No final recording was saved. Allow tab sharing and audio playback, or use the narrated preview.`);
    }
  }
  async function testVoice() {
    if (testBusy.current || busy.current) return;
    testBusy.current = true; setVoiceError('');
    try {
      if (audioStatus === 'ready' && !previewTts) { speech.current?.stop(); await narration.current!.test(); }
      else { narration.current?.stop(); speech.current!.speak(scenes[0].text, selectedVoice, setVoiceError); }
    } catch (error) { setVoiceError(`Test Voice failed: ${error instanceof Error ? error.message : 'audio blocked'}. Check audio permissions or choose TTS preview.`); }
    finally { testBusy.current = false; }
  }
  async function playPreview() {
    if (busy.current) return;
    busy.current = true; const token = ++generation.current;
    clearDownload(); setVoiceError('');
    if (audioStatus === 'ready' && !previewTts) {
      try {
        speech.current?.stop(); await narration.current!.prepare();
        if (token !== generation.current) return;
        await narration.current!.start();
        if (token !== generation.current) return;
        playWithAudio();
      } catch (error) { if (token === generation.current) fail(`Narration preview failed: ${error instanceof Error ? error.message : 'audio unavailable'}. Try English TTS preview.`); }
      return;
    }
    if (!selectedVoice) { fail('No English TTS voice is available. Install an English system voice and reload, or restore the narration file.'); return; }
    narration.current?.stop();
    // First utterance is queued in the user gesture. Later scenes replace it on their boundary.
    speech.current!.speak(scenes[0].text, selectedVoice, fail);
    setVoiceLabel(`English TTS preview: ${selectedVoice.name} - not recordable`);
    onActive(true); setPhase('running');
    let sceneStart = 0;
    cancelTimer.current = runTimeline(time => {
      setElapsed(time);
      const scene = frameAt(time).scene;
      if (scene.start !== sceneStart) { sceneStart = scene.start; speech.current!.speak(scene.text, selectedVoice, fail); }
    }, () => { void finish(false, true); }, 0);
  }
  function replay() { clearDownload(); setElapsed(-COUNTDOWN); setMessage(''); setPhase('preflight'); }
  function cancel() { generation.current++; cancelTimer.current?.(); stopVoice(); void session.current?.finish(false); session.current = null; onActive(false); onClose(); }
  const frame = frameAt(elapsed);
  if (phase === 'running') return <div className="demo-stage">
    <div inert className="demo-observatory">{renderObservatory(frame)}</div>
    <DemoOverlay frame={frame} countdown={elapsed < 0 ? Math.ceil(-elapsed) : 0} recording={!!session.current} voiceLabel={voiceLabel} onStop={() => void finish(true)} onCancel={cancel} />
  </div>;
  return <div className="demo-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="demo-title" className="demo-dialog">
    <h2 id="demo-title">Zanzibar SkyLab</h2><h3>Automated Competition Recording</h3>
    {(phase === 'preflight' || phase === 'error') && <>
      <p><strong>2:55 presentation</strong>, including introduction and conclusion, with no recorded countdown. Recommended: a 16:9 browser window at 1920 x 1080.</p>
      <p>In the sharing picker, select <strong>This Tab</strong> (or this site under Chrome Tab). Narration is mixed directly into the recording; sharing tab audio is optional. Keep this tab visible.</p>
      <p role="status">English narration: <strong>{audioStatus === 'loading' ? 'loading audio file...' : audioStatus === 'ready' ? 'file loaded; timing, silence and audio activation checked on start' : 'audio file unavailable'}</strong>. {!narrationFile && <a href={NARRATION_URL} target="_blank" rel="noreferrer">Open narration file</a>}</p>
      <p>{trackLabel}. Voice quality and pronunciation must be reviewed by listening; technical checks do not certify a professional performance.</p>
      <label className="block">Use your professional MP3 or WAV (175 seconds)
        <input className="block mt-2" type="file" accept=".mp3,.wav,audio/mpeg,audio/wav" disabled={busy.current} onChange={event => {
          const file = event.target.files?.[0]; if (!file) return;
          stopVoice(); clearDownload(); setPreviewTts(false); setNarrationFile(file);
        }} />
      </label>
      {narrationFile && <button onClick={() => { stopVoice(); clearDownload(); setNarrationFile(undefined); }}>Restore bundled track</button>}
      <p>Your selected file stays on this device. Match the six scene starts: 0:00, 0:20, 0:55, 1:30, 2:05, 2:35. Final recording requires ready prerecorded audio. Browser TTS is preview only.</p>
      <label><input type="checkbox" checked={previewTts} onChange={event => { stopVoice(); setPreviewTts(event.target.checked); }} /> Use browser English TTS for preview / Test Voice</label>
      <label className="block mt-3">Preview voice <select className="bg-slate-800 p-2 rounded max-w-full" value={selectedVoice?.voiceURI || ''} onChange={event => { speech.current?.stop(); setVoiceUri(event.target.value); }}><option value="" disabled>No English voice loaded</option>{voices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}</select></label>
      {!selectedVoice && <p>No English browser voice is loaded. Install an English system voice and reload to use TTS preview. The bundled recording voice does not depend on browser voices.</p>}
      {voiceError && <p role="alert">{voiceError}</p>}
      <div className="demo-actions"><button onClick={testVoice} disabled={audioStatus !== 'ready' && !selectedVoice}>Test Voice</button><button onClick={stopVoice}>Stop Voice Test</button></div>
      <p>Recording: {recordingSupported() ? 'browser support detected; screen permission and ready narration are required.' : 'unsupported here. Try desktop Chrome or Edge on localhost or HTTPS. You can also record the preview externally.'}</p>
      {message && <p role="alert">{message}</p>}
      <div className="demo-actions"><button autoFocus disabled={!recordingSupported() || audioStatus !== 'ready'} onClick={startRecording}>Start Recording</button><button onClick={playPreview} disabled={audioStatus !== 'ready' && !selectedVoice}>Play Demo Without Recording</button></div>
    </>}
    {phase === 'permission' && <p role="status">Choose this tab in the browser sharing dialog. Narration will be activated before recording starts. Cancel releases any capture granted afterward.</p>}
    {phase === 'finalizing' && <p role="status">Finalizing recording...</p>}
    {phase === 'finished' && <><p role="status">{message}</p><div className="demo-actions">{download && <a href={download.url} download={download.name}>Download Recording</a>}<button autoFocus onClick={replay}>Replay</button></div></>}
    <button className="demo-cancel" onClick={cancel}>{phase === 'finished' ? 'Close' : 'Cancel'}</button>
  </section></div>;
}
