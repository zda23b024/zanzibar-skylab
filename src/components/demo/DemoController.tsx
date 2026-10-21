import React, { useEffect, useRef, useState } from 'react';
import { DemoFrame } from './demoScenes';
import { DemoOverlay } from './DemoOverlay';
import { NarrationAudio, runNarratedTimeline } from './narrationService';
import { DEMO_CONFIG, DemoLanguage } from './demoConfig';

export function DemoController({ onClose, onActive, renderObservatory, mode = 'english' }: { onClose: () => void; onActive: (active: boolean) => void; renderObservatory: (frame: DemoFrame) => React.ReactNode; mode?: DemoLanguage }) {
  const configuration = DEMO_CONFIG[mode];
  const sw = mode === 'swahili';
  const [phase, setPhase] = useState<'ready' | 'starting' | 'running' | 'finished' | 'error'>('ready');
  const [loaded, setLoaded] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [message, setMessage] = useState('');
  const narration = useRef<NarrationAudio | null>(null);
  const cancelTimer = useRef<(() => void) | null>(null);
  const generation = useRef(0);
  const busy = useRef(false);
  const activeCallback = useRef(onActive);
  activeCallback.current = onActive;

  function stop() {
    generation.current++;
    cancelTimer.current?.();
    narration.current?.stop();
    busy.current = false;
    activeCallback.current(false);
  }
  function fail(text: string) {
    stop();
    setMessage(sw ? 'Sauti imeshindwa kucheza au mwongozo umekatizwa. Weka kichupo hiki wazi, ruhusu sauti na ujaribu tena.' : text);
    setPhase('error');
  }
  const failureCallback = useRef(fail);
  failureCallback.current = fail;

  useEffect(() => {
    let disposed = false;
    setLoaded(false);
    const audio = new NarrationAudio(text => { if (!disposed) failureCallback.current(text); }, undefined, configuration.narration);
    narration.current = audio;
    void audio.load().then(() => { if (!disposed) setLoaded(true); }).catch(() => {
      if (!disposed) failureCallback.current('The narration could not load. Check your connection and reopen the tour to retry.');
    });
    return () => {
      disposed = true;
      generation.current++;
      cancelTimer.current?.();
      audio.dispose();
      busy.current = false;
      activeCallback.current(false);
    };
  }, [configuration]);

  function finish() { stop(); setPhase('finished'); }
  async function play() {
    if (busy.current || !loaded) return;
    busy.current = true;
    const token = ++generation.current;
    setMessage(''); setElapsed(0); setPhase('starting');
    try {
      const audio = narration.current!;
      await audio.prepare();
      if (token !== generation.current) return;
      await audio.start();
      if (token !== generation.current) return;
      activeCallback.current(true); setPhase('running');
      cancelTimer.current = runNarratedTimeline(audio, setElapsed, finish, fail, configuration.duration);
    } catch (error) {
      if (token === generation.current) fail(error instanceof Error ? error.message : 'Allow sound for this site and try again.');
    }
  }
  function close() { stop(); onClose(); }
  if (phase === 'running') return <div className="demo-stage">
    <div inert className="demo-observatory">{renderObservatory(configuration.frameAt(elapsed))}</div>
    <DemoOverlay frame={configuration.frameAt(elapsed)} duration={configuration.duration} language={mode} countdown={0} voiceLabel={sw ? 'Kiswahili' : 'English'} onStop={finish} onCancel={close} />
  </div>;
  return <div className="demo-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="demo-title" className="demo-dialog">
    <h2 id="demo-title">{sw ? 'Jifunze Kutumia Zanzibar SkyLab' : 'Your Guide to Zanzibar SkyLab'}</h2>
    <p>{sw ? 'Sikiliza mwongozo wa dakika 3 na ujifunze kuchunguza anga, kupanga uchunguzi, na kutumia zana za Mwezi na wakati.' : 'Explore the sky, plan observations, and learn how to use the Moon and time tools in this narrated 2-minute 55-second tour.'}</p>
    <p>{sw ? 'Washa sauti na uweke kichupo hiki wazi wakati wa mwongozo.' : 'Turn on your sound and keep this tab visible during the tour.'}</p>
    {phase === 'finished' && <p role="status">{sw ? 'Mwongozo umeisha. Sasa unaweza kuchunguza programu mwenyewe au kuusikiliza tena.' : 'The tour has ended. Explore the app yourself or watch it again.'}</p>}
    {message && <p role="alert">{message}</p>}
    <div className="demo-actions">
      <button autoFocus disabled={!loaded || phase === 'starting'} onClick={play}>{!loaded ? (sw ? 'Sauti inapakiwa...' : 'Loading narration...') : phase === 'starting' ? (sw ? 'Inaanza...' : 'Starting...') : phase === 'finished' ? (sw ? 'Sikiliza Tena' : 'Watch Again') : (sw ? 'Anza Mwongozo' : 'Start Guided Tour')}</button>
      <button onClick={close}>{sw ? 'Rudi Kwenye Programu' : 'Back to the App'}</button>
    </div>
  </section></div>;
}
