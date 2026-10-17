import React, { useEffect, useRef, useState } from 'react';
import { COUNTDOWN, DURATION, DemoFrame, frameAt, runTimeline } from './demoScenes';
import { extensionFor, RecordingSession, recordingSupported, stopTracks } from './recordingService';
import { DemoOverlay } from './DemoOverlay';

type Phase = 'preflight' | 'permission' | 'running' | 'finalizing' | 'finished' | 'error';
export function DemoController({ onClose, onActive, renderObservatory }: { onClose: () => void; onActive: (active: boolean) => void; renderObservatory: (frame: DemoFrame) => React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>('preflight');
  const [elapsed, setElapsed] = useState(-COUNTDOWN);
  const [message, setMessage] = useState('');
  const [download, setDownload] = useState<{ url: string; name: string } | null>(null);
  const session = useRef<RecordingSession | null>(null);
  const cancelTimer = useRef<(() => void) | null>(null);
  const generation = useRef(0);
  const url = useRef<string | null>(null);
  const busy = useRef(false);
  const activeCallback = useRef(onActive);
  activeCallback.current = onActive;
  const clearDownload = () => { if (url.current) URL.revokeObjectURL(url.current); url.current = null; setDownload(null); };
  useEffect(() => () => {
    generation.current++;
    cancelTimer.current?.();
    void session.current?.finish(false);
    if (url.current) URL.revokeObjectURL(url.current);
    activeCallback.current(false);
  }, []);
  function fail(text: string) {
    generation.current++;
    cancelTimer.current?.();
    void session.current?.finish(false);
    session.current = null;
    busy.current = false;
    onActive(false);
    setMessage(text);
    setPhase('error');
  }
  async function finish(keep: boolean, completed = false) {
    const token = ++generation.current;
    cancelTimer.current?.();
    setPhase('finalizing');
    // Stop the recorder at the deadline, before restoring the normal observatory.
    const pending = session.current?.finish(keep);
    session.current = null;
    onActive(false);
    const blob = await pending;
    if (token !== generation.current) return;
    busy.current = false;
    if (blob?.size) {
      const nextUrl = URL.createObjectURL(blob);
      url.current = nextUrl;
      const name = `zanzibar-skylab${completed ? '' : '-partial'}.${extensionFor(blob.type)}`;
      setDownload({ url: nextUrl, name });
      const anchor = document.createElement('a');
      anchor.href = nextUrl; anchor.download = name; anchor.click();
      setMessage(`${completed ? 'Presentation complete.' : 'Stopped early; partial recording.'} Download requested. If your browser did not save it, use Download Recording. Voice narration unavailable.`);
    } else setMessage(keep && pending ? 'No usable video was produced. Please use an external screen recorder.' : completed ? 'Demo complete. No recording was made.' : 'Canceled. No recording was saved.');
    setPhase('finished');
  }
  function play() {
    onActive(true);
    setPhase('running');
    cancelTimer.current = runTimeline(setElapsed, () => { void finish(true, true); });
  }
  // getDisplayMedia is the first asynchronous operation, directly in the click handler.
  async function startRecording() {
    if (busy.current) return;
    busy.current = true;
    const token = ++generation.current;
    try {
      const permission = navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      clearDownload(); setPhase('permission');
      const stream = await permission;
      if (token !== generation.current) { stopTracks(stream); return; }
      if (!stream.getVideoTracks().some(track => track.readyState === 'live')) { stopTracks(stream); throw new Error('No live video track was shared.'); }
      try {
        session.current = new RecordingSession(stream, fail);
        session.current.start();
      } catch (error) { stopTracks(stream); throw error; }
      play();
    } catch (error) {
      if (token !== generation.current) return;
      fail(error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'Screen sharing was denied. Allow tab capture to record, or play the demo without recording.'
        : `Unable to start recording: ${error instanceof Error ? error.message : 'browser capture unavailable'}. Try an external screen recorder.`);
    }
  }
  function replay() { clearDownload(); setElapsed(-COUNTDOWN); setMessage(''); setPhase('preflight'); }
  function cancel() { generation.current++; cancelTimer.current?.(); void session.current?.finish(false); session.current = null; onActive(false); onClose(); }
  const frame = frameAt(elapsed);
  if (phase === 'running') return <div className="demo-stage">
    <div inert className="demo-observatory">{renderObservatory(frame)}</div>
    <DemoOverlay frame={frame} countdown={elapsed < 0 ? Math.ceil(-elapsed) : 0} recording={!!session.current} onStop={() => void finish(true)} onCancel={cancel} />
  </div>;
  return <div className="demo-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="demo-title" className="demo-dialog">
    <h2 id="demo-title">Zanzibar SkyLab</h2>
    <h3>Automated Competition Recording</h3>
    {(phase === 'preflight' || phase === 'error') && <>
      <p><strong>2:55 presentation</strong> + {COUNTDOWN}-second recorded countdown. Recommended: a 16:9 browser window at 1920 × 1080.</p>
      <p>In Chrome’s sharing picker, select <strong>This Tab</strong> (or this site under Chrome Tab) and enable <strong>Share tab audio</strong> if available. Keep this tab visible throughout.</p>
      <p>Voice: <strong>unavailable</strong> — no bundled narration track. This demo uses synchronized subtitles. Browser speech synthesis is not reliably captured and is not included.</p>
      <p>Recording: {recordingSupported() ? 'available in this browser; permission is required each time.' : 'unsupported here. Use a desktop browser on localhost or HTTPS, or record externally while playing the demo.'}</p>
      {message && <p role="alert">{message}</p>}
      <div className="demo-actions"><button autoFocus disabled={!recordingSupported()} onClick={startRecording}>Start Recording</button><button onClick={() => { if (busy.current) return; busy.current = true; clearDownload(); play(); }}>Play Demo Without Recording</button></div>
    </>}
    {phase === 'permission' && <p role="status">Choose this tab in the browser sharing dialog. You can cancel here; any stream granted afterward will be released.</p>}
    {phase === 'finalizing' && <p role="status">Finalizing recording…</p>}
    {phase === 'finished' && <><p role="status">{message}</p><div className="demo-actions">{download && <a href={download.url} download={download.name}>Download Recording</a>}<button autoFocus onClick={replay}>Replay</button></div></>}
    <button className="demo-cancel" onClick={cancel}>{phase === 'finished' ? 'Close' : 'Cancel'}</button>
  </section></div>;
}
