import React from 'react';
import { DemoFrame, DURATION } from './demoScenes';
export function DemoOverlay({ frame, duration = DURATION, language = 'english', countdown, voiceLabel, onStop, onCancel }: { frame: DemoFrame; duration?: number; language?: 'english' | 'swahili'; countdown: number; voiceLabel: string; onStop: () => void; onCancel: () => void }) {
  const isSwahili = language === 'swahili';
  const remaining = Math.ceil(duration - frame.elapsed);
  return <>
    <aside className="demo-caption" aria-label="Demo presentation controls">
      <div className="demo-caption-heading"><strong>Zanzibar SkyLab</strong><span>{isSwahili ? 'Mwongozo wa programu' : 'Guided tour'} · {voiceLabel}</span><span>{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')} {isSwahili ? 'imesalia' : 'remaining'}</span><button autoFocus onClick={onStop}>{isSwahili ? 'Simamisha' : 'Stop'}</button><button onClick={onCancel}>{isSwahili ? 'Ghairi' : 'Cancel'}</button></div>
      <progress aria-label={isSwahili ? 'Maendeleo ya uwasilishaji' : 'Presentation progress'} value={frame.elapsed} max={duration} />
      <h2>{frame.scene.title}</h2><p>{frame.scene.text}</p>
    </aside>
    {countdown > 0 && <div className="demo-countdown" role="status"><strong>{countdown}</strong><span>{isSwahili ? 'Uwasilishaji unaanza hivi punde' : 'Presentation starts shortly'}</span></div>}
    {frame.closing && <div className="demo-closing"><span>{isSwahili ? 'SAYANSI KUTOKA MJIMKONGWE, ZANZIBAR' : 'SCIENCE FROM STONE TOWN'}</span><h1>Zanzibar SkyLab</h1><p>{isSwahili ? 'Chunguza. Kokotoa. Panga. Tazama.' : 'Explore. Calculate. Plan. Observe.'}</p><small>{isSwahili ? 'Unajimu halisi · Zana tano · Hesabu ndani ya kivinjari' : 'Real astronomy · Five connected tools · Calculated locally'}</small></div>}
  </>;
}
