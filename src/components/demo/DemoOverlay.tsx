import React from 'react';
import { DemoFrame, DURATION } from './demoScenes';
export function DemoOverlay({ frame, countdown, recording, onStop, onCancel }: { frame: DemoFrame; countdown: number; recording: boolean; onStop: () => void; onCancel: () => void }) {
  const remaining = Math.ceil(DURATION - frame.elapsed);
  return <>
    <aside className="demo-caption" aria-label="Demo presentation controls">
      <div className="demo-caption-heading"><strong>Zanzibar SkyLab</strong><span>{recording ? '? Recording' : 'Demo preview'} · Subtitles · Voice unavailable</span><span>{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')} remaining</span><button autoFocus onClick={onStop}>Stop</button><button onClick={onCancel}>Cancel</button></div>
      <progress aria-label="Presentation progress" value={frame.elapsed} max={DURATION} />
      <h2>{frame.scene.title}</h2><p>{frame.scene.text}</p>
    </aside>
    {countdown > 0 && <div className="demo-countdown" role="status"><strong>{countdown}</strong><span>Presentation starts shortly</span></div>}
    {frame.closing && <div className="demo-closing"><span>SCIENCE FROM STONE TOWN</span><h1>Zanzibar SkyLab</h1><p>Explore. Calculate. Plan. Observe.</p><small>Real astronomy · Five connected tools · Calculated locally</small></div>}
  </>;
}
