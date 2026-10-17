import React, { useEffect, useRef, useState } from 'react';
import { COUNTDOWN, DemoFrame, frameAt, runTimeline, scenes } from './demoScenes';
import { assertBrowserTabCapture, displayCaptureOptions, extensionFor, hasExactDuration, measureMediaDuration, RecordingSession, recordingSupported, stopTracks } from './recordingService';
import { DemoOverlay } from './DemoOverlay';
import { englishVoices, NarrationAudio, NarrationOptions, NARRATION_URL, NARRATION_LABEL, narrationStream, runNarratedTimeline, SpeechPreview } from './narrationService';
import { DEMO_CONFIG, DemoLanguage } from './demoConfig';

type Phase = 'preflight' | 'permission' | 'running' | 'finalizing' | 'finished' | 'error';
interface RecordingDownload {
  url: string;
  name: string;
  bytes: number;
  chunks: number;
  mimeType: string;
  duration: number | null;
  automaticDownloadRequested: boolean;
}
function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
}
export function DemoController({ onClose, onActive, renderObservatory, isDedicatedWindow, onOpenDedicatedWindow, mode = 'english' }: { onClose: () => void; onActive: (active: boolean) => void; renderObservatory: (frame: DemoFrame) => React.ReactNode; isDedicatedWindow: boolean; onOpenDedicatedWindow: () => boolean; mode?: DemoLanguage }) {
  const configuration = DEMO_CONFIG[mode];
  const duration = configuration.duration;
  const narrationOptions: NarrationOptions = configuration.narration;
  const frameForTime = configuration.frameAt;
  const [phase, setPhase] = useState<Phase>('preflight');
  const [elapsed, setElapsed] = useState(-COUNTDOWN);
  const [message, setMessage] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [audioStatus, setAudioStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceUri, setVoiceUri] = useState('');
  const [previewTts, setPreviewTts] = useState(false);
  const [voiceLabel, setVoiceLabel] = useState('');
  const [recordingStatus, setRecordingStatus] = useState('Ready');
  const [narrationFile, setNarrationFile] = useState<File | undefined>();
  const [download, setDownload] = useState<RecordingDownload | null>(null);
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
  const trackLabel = mode === 'swahili'
    ? narrationFile ? `Faili ya sauti ya Kiswahili: ${narrationFile.name}` : configuration.narration.sourceUrl ? 'Faili ya sauti ya Kiswahili iliyosanidiwa' : 'Hakuna faili la sauti ya Kiswahili lililochaguliwa'
    : narrationFile ? `Local narration: ${narrationFile.name}` : NARRATION_LABEL;
  const clearDownload = () => { if (url.current) URL.revokeObjectURL(url.current); url.current = null; setDownload(null); };
  useEffect(() => {
    let disposed = false;
    setAudioStatus('loading'); setVoiceError('');
    const audio = new NarrationAudio(text => {
      if (disposed) return;
      setVoiceError(text); setAudioStatus('error');
      if (busy.current) failureCallback.current(text);
    }, narrationFile, narrationOptions);
    narration.current = audio;
    void audio.load().then(() => { if (!disposed) setAudioStatus('ready'); }).catch(error => {
      if (!disposed) {
        setAudioStatus('error');
        setVoiceError(mode === 'swahili'
          ? 'Faili ya sauti haikupita ukaguzi. Chagua MP3/WAV ya Kiswahili cha Tanzania yenye sekunde 180, sauti katika kila sehemu, na mapumziko yasiyozidi sekunde 1.5.'
          : `${error instanceof Error ? error.message : 'Audio load failed.'} Final recording is disabled. Use English TTS preview or reload to retry.`);
      }
    });
    const updateVoices = () => setVoices(englishVoices(window.speechSynthesis.getVoices()));
    if (mode === 'english' && 'speechSynthesis' in window) { updateVoices(); window.speechSynthesis.addEventListener('voiceschanged', updateVoices); }
    return () => {
      disposed = true; generation.current++; cancelTimer.current?.();
      void session.current?.finish(false); audio.dispose(); speech.current?.stop();
      if (mode === 'english' && 'speechSynthesis' in window) window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
      if (url.current) URL.revokeObjectURL(url.current);
      activeCallback.current(false);
    };
  }, [narrationFile, mode]);
  function stopVoice() { narration.current?.stop(); speech.current?.stop(); }
  function fail(text: string) {
    generation.current++; cancelTimer.current?.(); stopVoice();
    void session.current?.finish(false); session.current = null;
    busy.current = false; onActive(false);
    setMessage(mode === 'swahili' ? 'Urekodi umeshindwa au umekatizwa. Hakuna video iliyohifadhiwa. Hakikisha sauti imekaguliwa na tabo hii inaonekana, kisha ujaribu tena.' : text);
    setRecordingStatus(mode === 'swahili' ? 'Urekodi umeshindwa; hakuna video iliyohifadhiwa' : 'Recording failed; no video saved');
    setPhase('error');
  }
  failureCallback.current = fail;
  async function finish(keep: boolean, completed = false) {
    const token = ++generation.current;
    cancelTimer.current?.();
    const activeRecording = session.current;
    const pending = activeRecording?.finish(keep);
    session.current = null; stopVoice();
    setPhase('finalizing'); setRecordingStatus('Finalizing video data'); onActive(false);
    const blob = await pending;
    if (token !== generation.current) return;
    busy.current = false;
    if (blob?.size) {
      if (!blob.type.startsWith('video/')) {
        setMessage(mode === 'swahili' ? 'Rekodi haikutoa faili la video. Hakuna faili la kupakua.' : `The recorder produced ${blob.type || 'an unknown media type'}, not a video. No download is offered.`);
        setRecordingStatus(mode === 'swahili' ? 'Faili la video halipo' : 'Invalid video output');
        setPhase('finished');
        return;
      }
      let actualDuration: number | null = null;
      let durationError = '';
      let exactDurationPassed = true;
      try { actualDuration = await measureMediaDuration(blob); }
      catch (error) { durationError = error instanceof Error ? error.message : 'media metadata unavailable'; }
      if (mode === 'swahili' && completed) {
        if (actualDuration === null) {
          exactDurationPassed = false;
        } else exactDurationPassed = hasExactDuration(actualDuration, configuration.duration);
      }
      const nextUrl = URL.createObjectURL(blob); url.current = nextUrl;
      const languageName = configuration.filenameLanguage;
      const durationFailureSuffix = mode === 'swahili' && completed && !exactDurationPassed ? '_Duration_Check_Failed' : '';
      const name = `Zanzibar_SkyLab_${languageName}_Demo${completed ? '' : '_Partial'}${durationFailureSuffix}.${extensionFor(blob.type)}`;
      let automaticDownloadRequested = false;
      try {
        const anchor = document.createElement('a');
        anchor.href = nextUrl; anchor.download = name; anchor.style.display = 'none';
        document.body.appendChild(anchor); anchor.click(); anchor.remove(); automaticDownloadRequested = true;
      } catch { automaticDownloadRequested = false; }
      const chunks = activeRecording?.chunkCount ?? 0;
      setDownload({ url: nextUrl, name, bytes: blob.size, chunks, mimeType: blob.type, duration: actualDuration, automaticDownloadRequested });
      setRecordingStatus(mode === 'swahili' && completed && !exactDurationPassed
        ? 'Video imerekodiwa, lakini sharti la sekunde 180.000 halijathibitishwa'
        : 'Video ready to preview and download');
      setMessage(mode === 'swahili'
        ? completed && !exactDurationPassed
          ? `Video imehifadhiwa kwa ukaguzi, lakini muda wake si sekunde 180.000 zilizothibitishwa${actualDuration === null ? '' : `; umepimwa kuwa sekunde ${actualDuration.toFixed(3)}`}. Unaweza kuisikiliza au kuipakua, lakini usiwasilishe kama rekodi ya dakika tatu kamili.`
          : `${completed ? 'Uwasilishaji wa Kiswahili umekamilika; muda wa video umethibitishwa kuwa sekunde 180.000.' : 'Urekodi umesimamishwa mapema; hii ni sehemu tu.'} Sauti ya Kiswahili imeunganishwa. Sikiliza faili kabla ya kuwasilisha.`
        : `${completed ? 'Presentation complete.' : 'Stopped early; partial recording.'} ${chunks} video/audio data chunk${chunks === 1 ? '' : 's'} (${formatBytes(blob.size)}) produced a ${blob.type} video${actualDuration === null ? '' : ` (${actualDuration.toFixed(3)} seconds)`}. ${automaticDownloadRequested ? 'Automatic download requested; use Download Video if Chrome blocked it.' : 'Automatic download was unavailable; use Download Video below.'}${durationError ? ` Duration metadata could not be read: ${durationError}.` : ''}`);
    } else {
      setRecordingStatus(mode === 'swahili' ? 'Hakuna data ya video iliyorekodiwa' : 'No video data captured');
      setMessage(mode === 'swahili'
        ? keep && pending ? 'Hakuna data ya video iliyorekodiwa. Jaribu tena.' : completed ? 'Onyesho la sauti limekamilika; hakuna video iliyorekodiwa.' : 'Urekodi umeghairiwa. Hakuna video iliyohifadhiwa.'
        : keep && pending ? 'No video data was captured. Please try again.' : completed ? 'Narrated preview complete. No recording was made.' : 'Canceled. No recording was saved.');
    }
    setPhase('finished');
  }
  function playWithAudio() {
    setVoiceLabel(mode === 'swahili' ? `${trackLabel} · sauti imeunganishwa` : `${trackLabel} - audio track connected`);
    onActive(true); setPhase('running');
    cancelTimer.current = runNarratedTimeline(narration.current!, setElapsed, () => { void finish(true, true); }, fail, duration);
  }
  // Capture is requested directly from the click, before awaiting audio or permissions.
  async function startRecording() {
    if (busy.current || audioStatus !== 'ready') return;
    busy.current = true; const token = ++generation.current;
    let capture: MediaStream | undefined;
    let mixed: MediaStream | undefined;
    try {
      const permission = navigator.mediaDevices.getDisplayMedia(displayCaptureOptions());
      // Unlock audio in the SAME gesture; settle immediately to avoid unhandled rejections.
      const prepared = narration.current!.prepare().then(() => null, error => error);
      speech.current?.stop(); clearDownload(); setVoiceError(''); setPhase('permission');
      capture = await permission;
      if (token !== generation.current) { stopTracks(capture); return; }
      assertBrowserTabCapture(capture);
      const audioError = await prepared;
      if (token !== generation.current) { stopTracks(capture); return; }
      if (audioError) throw audioError;
      if (!capture.getVideoTracks().some(track => track.readyState === 'live')) throw new Error('No live video track was shared.');
      mixed = narrationStream(capture, narration.current!.track!);
      session.current = new RecordingSession(mixed, fail, true);
      await session.current.start();
      setRecordingStatus(`Recording started (${session.current.mimeType})`);
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
      if (audioStatus === 'ready' && (mode === 'swahili' || !previewTts)) { speech.current?.stop(); await narration.current!.test(); }
      else { narration.current?.stop(); speech.current!.speak(scenes[0].text, selectedVoice, setVoiceError); }
    } catch (error) { setVoiceError(`Test Voice failed: ${error instanceof Error ? error.message : 'audio blocked'}. Check audio permissions or choose TTS preview.`); }
    finally { testBusy.current = false; }
  }
  async function playPreview() {
    if (busy.current || (mode === 'swahili' && audioStatus !== 'ready')) return;
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
    if (mode === 'swahili') { busy.current = false; setPhase('preflight'); return; }
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
  const frame = frameForTime(elapsed);
  if (phase === 'running') return <div className="demo-stage">
    <div inert className="demo-observatory">{renderObservatory(frame)}</div>
    <DemoOverlay frame={frame} duration={duration} language={mode} countdown={elapsed < 0 ? Math.ceil(-elapsed) : 0} recording={!!session.current} voiceLabel={voiceLabel} onStop={() => void finish(true)} onCancel={cancel} />
  </div>;
  return <div className="demo-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="demo-title" className="demo-dialog">
    <h2 id="demo-title">Zanzibar SkyLab</h2><h3>{mode === 'swahili' ? 'Rekodi ya Mashindano kwa Kiswahili' : 'Automated Competition Recording'}</h3>
    {(phase === 'preflight' || phase === 'error') && <>
      <p><strong>{mode === 'swahili' ? 'Uwasilishaji wa dakika 03:00 (sekunde 180)' : '2:55 presentation'}</strong>{mode === 'swahili' ? ', ukijumuisha utangulizi na hitimisho. Tunapendekeza dirisha la 16:9, pikseli 1920 × 1080.' : ', including introduction and conclusion, with no recorded countdown. Recommended: a 16:9 browser window at 1920 x 1080.'}</p>
      <p><strong>{mode === 'swahili' ? 'Rekodi ya Kiswahili' : 'Tab-only capture:'}</strong>{mode === 'swahili' ? ' Chagua “This Tab” kwenye dirisha la Chrome. Skrini na madirisha mengine hukataliwa. Sauti ya Kiswahili huunganishwa moja kwa moja; sauti ya tabo au mfumo hairekodiwi.' : ' select This Tab in Chrome. Screen and window selections are rejected. Narration is mixed directly into the recording; captured tab/system audio is not requested.'}</p>
      <p role="note"><strong>{mode === 'swahili' ? 'Tahadhari ya kubadili tabo:' : 'Background-tab warning:'}</strong>{mode === 'swahili' ? ' Tabo iliyofichwa inaweza kupunguza kasi ya michoro. Ukibadili tabo kwenye dirisha hili au kulificha, rekodi itafutwa ili kuepuka video iliyoganda au sauti isiyolingana. Kwa kazi nyingine, fungua dirisha maalumu la kurekodi na uliache wazi, ikiwezekana kwenye skrini nyingine. Urekodi wa nyuma haujahakikishwa.' : ' browsers may throttle hidden-tab rendering. Switching to another tab in this window or minimizing it stops and discards the recording to prevent a frozen or unsynchronized video. For other work, open a dedicated recording window and keep it visible, preferably on another monitor. If it becomes hidden or obscured, recording is discarded. Background recording is not guaranteed.'}</p>
      {!isDedicatedWindow && <div className="demo-actions"><button onClick={() => { if (!onOpenDedicatedWindow()) setMessage(mode === 'swahili' ? 'Dirisha limezuiwa. Ruhusu madirisha ibukizi kwa tovuti hii kisha ujaribu tena.' : 'The dedicated recording window was blocked. Allow pop-ups for this site, then try again.'); }}>{mode === 'swahili' ? 'Fungua Dirisha Maalumu la Kurekodi' : 'Open Dedicated Recording Window'}</button></div>}
      {isDedicatedWindow && <p role="status">{mode === 'swahili' ? 'Dirisha maalumu la kurekodi. Liache wazi; tumia dirisha tofauti kwa kazi nyingine.' : 'Dedicated recording window. Keep this window open and its tab visible; switch to a separate window for other work.'}</p>}
      {mode === 'swahili' ? <p role="status">Sauti ya Kiswahili: <strong>{audioStatus === 'loading' ? 'inaandaliwa...' : audioStatus === 'ready' ? 'faili limekaguliwa; lisikilize kabla ya kuwasilisha' : 'hakuna sauti inayokidhi ukaguzi'}</strong></p> : <p role="status">English narration: <strong>{audioStatus === 'loading' ? 'loading audio file...' : audioStatus === 'ready' ? 'audio loaded; duration, scene speech, silence, and decoding checks passed' : 'audio file unavailable'}</strong>. {!narrationFile && <a href={NARRATION_URL} target="_blank" rel="noreferrer">Open narration file</a>}</p>}
      <p>{mode === 'swahili'
        ? configuration.narration.sourceUrl
          ? 'Sauti iliyosanidiwa itapakiwa kutoka public/audio na kuhakikiwa. Unaweza pia kuchagua faili ya eneo lako hapa chini. Hakuna sauti ya Kiingereza wala TTS itakayotumika.'
          : 'Hakuna sauti ya Kiswahili iliyotolewa pamoja na programu. Chagua rekodi ya binadamu kwa Kiswahili cha Tanzania/Zanzibar; au weka faili katika public/audio na usanidi VITE_DEMO_SWAHILI_NARRATION_PATH. Mfumo hautatumia sauti ya Kiingereza wala TTS.'
        : `${trackLabel}. Voice quality and pronunciation must be reviewed by listening; technical checks do not certify a professional performance.`}</p>
      <p>{mode === 'swahili'
        ? 'Sauti itakaguliwa kwa muda halisi wa sekunde 180, kila sehemu ya simulizi na ukimya. Video itatolewa tu ikiwa metadata ya faili iliyokamilika inathibitisha sekunde 180.000.'
        : 'Match the six scene starts: 0:00, 0:20, 0:55, 1:30, 2:05, 2:35. Final recording requires ready prerecorded audio. Browser TTS is preview only.'}</p>
      <label className="block">{mode === 'swahili' ? 'Chagua sauti ya Kiswahili MP3/WAV (sekunde 180)' : 'Use your professional MP3 or WAV (175 seconds)'}
        <input className="block mt-2" type="file" accept=".mp3,.wav,audio/mpeg,audio/wav" disabled={busy.current} onChange={event => {
          const file = event.target.files?.[0]; if (!file) return;
          stopVoice(); clearDownload(); setPreviewTts(false); setNarrationFile(file);
        }} />
      </label>
      {mode === 'english' && narrationFile && <button onClick={() => { stopVoice(); clearDownload(); setNarrationFile(undefined); }}>Restore bundled track</button>}
      {mode === 'english' && <>
        <label><input type="checkbox" checked={previewTts} onChange={event => { stopVoice(); setPreviewTts(event.target.checked); }} /> Use browser English TTS for preview / Test Voice</label>
        <label className="block mt-3">Preview voice <select className="bg-slate-800 p-2 rounded max-w-full" value={selectedVoice?.voiceURI || ''} onChange={event => { speech.current?.stop(); setVoiceUri(event.target.value); }}><option value="" disabled>No English voice loaded</option>{voices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}</select></label>
        {!selectedVoice && <p>No English browser voice is loaded. Install an English system voice and reload to use TTS preview. The bundled recording voice does not depend on browser voices.</p>}
      </>}
      {voiceError && <p role="alert">{voiceError}</p>}
      <div className="demo-actions"><button onClick={testVoice} disabled={mode === 'swahili' ? audioStatus !== 'ready' : audioStatus !== 'ready' && !selectedVoice}>{mode === 'swahili' ? 'Sikiliza Sauti' : 'Test Voice'}</button><button onClick={stopVoice}>{mode === 'swahili' ? 'Simamisha Sauti' : 'Stop Voice Test'}</button></div>
      <p>{mode === 'swahili' ? 'Rekodi ya tabo: ' : 'Recording: '}{recordingSupported() ? (mode === 'swahili' ? 'uthibitishaji wa tabo na sauti upo; ruhusa na faili sahihi vinahitajika.' : 'tab capture and exact-tab verification are available; permission and ready narration are still required.') : (mode === 'swahili' ? 'inahitaji localhost/HTTPS na Chrome/Edge ya kompyuta inayounga mkono Capture Handle.' : 'requires localhost or HTTPS plus desktop Chrome/Edge with Capture Handle support. You can still preview or use an external recorder.')}</p>
      {message && <p role="alert">{message}</p>}
      <div className="demo-actions"><button autoFocus disabled={!recordingSupported() || audioStatus !== 'ready'} onClick={startRecording}>{mode === 'swahili' ? 'Anza Kurekodi' : 'Start Recording'}</button><button onClick={playPreview} disabled={mode === 'swahili' ? audioStatus !== 'ready' : audioStatus !== 'ready' && !selectedVoice}>{mode === 'swahili' ? 'Cheza Onyesho Bila Kurekodi' : 'Play Demo Without Recording'}</button></div>
    </>}
    {phase === 'permission' && <p role="status">{mode === 'swahili' ? 'Chagua “This Tab” kwenye dirisha la kushiriki la kivinjari. Skrini na madirisha mengine yatakataliwa. Sauti itaanzishwa kabla ya kurekodi.' : 'Choose “This Tab” in the browser sharing dialog. Other surfaces will be rejected. Narration will be activated before recording starts. Cancel releases any capture granted afterward.'}</p>}
    {phase === 'finalizing' && <p role="status"><strong>{recordingStatus}</strong>...</p>}
    {phase === 'finished' && <>
      <p role="status"><strong>{recordingStatus}</strong><br />{message}</p>
      {download && <section className="recording-result" aria-label="Recorded video result">
        <h3>Recorded video</h3>
        <dl>
          <dt>{mode === 'swahili' ? 'Faili' : 'File'}</dt><dd>{download.name}</dd>
          <dt>{mode === 'swahili' ? 'Ukubwa' : 'Size'}</dt><dd>{formatBytes(download.bytes)}</dd>
          <dt>{mode === 'swahili' ? 'Vipande vya data' : 'Data chunks'}</dt><dd>{download.chunks}</dd>
          <dt>{mode === 'swahili' ? 'Sauti' : 'Narration'}</dt><dd>{mode === 'swahili' ? 'Sauti iliyochaguliwa imeunganishwa' : 'Embedded audio track required and mixed'}</dd>
          <dt>{mode === 'swahili' ? 'Muda' : 'Duration'}</dt><dd>{download.duration === null ? (mode === 'swahili' ? 'Haikuweza kupimwa' : 'Not available from media metadata') : mode === 'swahili' ? `${download.duration.toFixed(3)} sekunde` : `${download.duration.toFixed(3)} seconds`}</dd>
          <dt>{mode === 'swahili' ? 'Umbizo' : 'Format'}</dt><dd>{download.mimeType}</dd>
          <dt>{mode === 'swahili' ? 'Hali ya kuhifadhi' : 'Save status'}</dt><dd>{download.automaticDownloadRequested ? (mode === 'swahili' ? 'Ombi la kupakua limetumwa; thibitisha kwenye vipakuliwa vya Chrome.' : 'Automatic download requested; confirm it appears in Chrome Downloads.') : (mode === 'swahili' ? 'Tumia kitufe cha kupakua hapa chini.' : 'Automatic download unavailable; use Download Video below.')}</dd>
        </dl>
        <video className="recording-preview" controls preload="metadata" src={download.url} aria-label="Preview recorded Zanzibar SkyLab video" />
        <div className="demo-actions"><a className="download-video" href={download.url} download={download.name}>{mode === 'swahili' ? 'Pakua Video' : 'Download Video'}</a></div>
      </section>}
      <div className="demo-actions"><button autoFocus onClick={replay}>Replay</button></div>
    </>}
    <button className="demo-cancel" onClick={cancel}>{mode === 'swahili' ? phase === 'finished' ? 'Funga' : 'Ghairi' : phase === 'finished' ? 'Close' : 'Cancel'}</button>
  </section></div>;
}
