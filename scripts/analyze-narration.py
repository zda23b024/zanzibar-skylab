"""Measure a PCM WAV without judging voice quality. No third-party dependencies."""
import argparse
import array
import json
import math
import sys
import wave
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('file', nargs='?', default='public/audio/competition-narration.en.wav')
parser.add_argument('--output', help='Optional JSON report path')
args = parser.parse_args()
with wave.open(args.file) as wav:
    if wav.getsampwidth() != 2:
        raise SystemExit('This authoring check supports 16-bit PCM WAV. Browser validation also supports MP3.')
    rate, channels, frames = wav.getframerate(), wav.getnchannels(), wav.getnframes()
    samples = array.array('h', wav.readframes(frames))
    if sys.byteorder != 'little':
        samples.byteswap()
duration = frames / rate
step = round(rate * 0.02)
gaps = []
start = None
for frame in range(0, frames, step):
    end = min(frames, frame + step)
    loudest = max(math.sqrt(sum(x*x for x in samples[frame*channels+c:end*channels:channels]) / (end-frame)) / 32768 for c in range(channels))
    if loudest < 10 ** (-50 / 20) and start is None:
        start = frame / rate
    if loudest >= 10 ** (-50 / 20) and start is not None:
        gaps.append({'start': round(start, 3), 'end': round(frame / rate, 3), 'duration': round(frame / rate - start, 3)})
        start = None
if start is not None:
    gaps.append({'start': round(start, 3), 'end': duration, 'duration': round(duration-start, 3)})
manifest = json.loads(Path('src/components/demo/narrationScript.json').read_text(encoding='utf-8'))
report = {
    'file': args.file, 'duration_seconds': duration, 'sample_rate': rate,
    'channels': channels, 'threshold_dbfs': -50, 'window_ms': 20,
    'longest_silence_seconds': max((g['duration'] for g in gaps), default=0),
    'gaps_over_1_5_seconds': [g for g in gaps if g['duration'] > 1.5],
    'pauses_over_0_5_seconds': [g for g in gaps if g['duration'] > 0.5],
    'scenes': [{'title': s['title'], 'start': s['start'], 'end': s['end'], 'words': len(s['text'].split()), 'words_per_minute_including_pauses': round(len(s['text'].split()) * 60 / (s['end'] - s['start']), 1)} for s in manifest],
    'listening_review': 'Pending. Signal analysis cannot establish pronunciation or human-like delivery.',
}
text = json.dumps(report, indent=2)
print(text)
if args.output:
    Path(args.output).write_text(text + '\n', encoding='utf-8')
if abs(duration - 175) > 0.05 or report['gaps_over_1_5_seconds']:
    raise SystemExit(1)
