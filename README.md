# Zanzibar SkyLab

Zanzibar SkyLab is a static React application built with Vite. Astronomical calculations run in the browser using `astronomy-engine`; the site does not require a database, backend service, Gemini API, or deployment environment variables.

## Local development

Requirements: Node.js 20.19+ (or 22.12+) and npm.

```sh
npm install
npm run dev
```

## Verification

```sh
npm run lint
npm test
npm run build
```

## Deploy to Vercel

Import the repository into Vercel. Vercel detects Vite automatically; use these project settings if prompted:

- Framework preset: Vite
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: none

The production build is entirely static and can also be hosted by any static web server that serves the generated `dist/` directory.

## Astronomy data

The bright-star catalog records identify Yale Bright Star Catalog (BSC5) and Hipparcos as their sources. Catalog right ascension and declination are J2000.0; star positions are transformed to the observation epoch and local horizon using Astronomy Engine. The catalog values are rounded and do not include per-star proper-motion updates, so they are appropriate for this bright-star sky explorer but are not a substitute for a precision astrometric catalog.
## Automated competition recording (optional)

The header's **Start Demo Recording** opens a preflight dialog. The presentation lasts
175 seconds with no recorded countdown. The audio master is exactly 2:55; browser
encoding and timer latency may add a small amount to the downloaded container.
The six scenes use the existing Observatory components and astronomy engine, with
Stone Town and a fixed initial date of 2026-01-15 21:00 EAT. Scheduled actions select
a star, advance simulation time, select a planner target, change the observing day,
and search the directory. The original Observatory stays mounted and paused so its
navigation, date, observer, selections, appearance, local filters, and sky controls
survive cancellation and completion. It resumes after the result dialog closes.

### English narration and recording audio

The original "Voice unavailable" status was literal UI text: no audio asset, audio
loader, speech synthesis, or Web Audio mixer existed. The recorder received only
the screen-capture stream, so the previous implementation could not supply narration.

The real bundled asset is `public/audio/competition-narration.en.wav`, served at
`/audio/competition-narration.en.wav` on localhost and Vercel (Vite's base URL is
respected). It was generated locally with the installed Microsoft Hazel Desktop
English voice, using `scripts/generate-demo-narration.ps1`. It is synthesized speech,
not a human recording. The original script lives in
`src/components/demo/narrationScript.json`, also used for the scene subtitles.
The current WAV is a **basic system-voice timing draft**, not a professional or
human-like voice upgrade. It is mono 22,050 Hz, 16-bit PCM, exactly 175 seconds,
approximately 7.72 MB. Each spoken section begins at its scene boundary. The authoring
script rejects speech that exceeds its slot; no playback-rate change or time-stretch
is used. The revised script reduces the longest detected silence from 10.12 to 1.42
seconds (-50 dBFS RMS, 20 ms windows). The system voice still has sentence pauses
around 0.7?0.9 seconds, beyond the preferred professional target of 0.2?0.5 seconds.
The final professional performance is awaiting the user-supplied audio.

See [NARRATION-BRIEF.md](NARRATION-BRIEF.md) for the full timed script, delivery brief,
pronunciation review list, replacement instructions, and acceptance checks. The file
picker in preflight accepts a private local MP3/WAV; it is never uploaded. To deploy
a replacement, put it in `public/audio/`, set `VITE_DEMO_NARRATION_PATH` to its relative
path and `VITE_DEMO_NARRATION_LABEL` to its accurate description, then rebuild.
Both settings are public build-time strings, not secret keys.
No speech service, backend, secrets, or Windows dependency is needed at runtime.

Preflight fully downloads the file, checks HTTP status/content type, and waits for
browser decoding readiness. **Test Voice** plays the first 12 seconds of narration.
**Start Recording** requests screen permission directly from the click and activates
Web Audio in the same gesture. Before MediaRecorder starts, the decoded file is
checked for 175-second duration (50 ms decoder tolerance), non-silent samples in all
six scenes, and no silent gap over 1.5 seconds. Stereo channels are checked together. Its output track
must be live. Audio activation failures block final recording with an error message.

An HTMLAudioElement feeds `AudioContext.createMediaElementSource`, then a gain node
routes to both speakers and `MediaStreamAudioDestinationNode`. MediaRecorder receives
the selected video track plus a clone of this explicit narration track. Captured tab
or system audio is excluded to prevent echo; the recording does not depend on the
browser's Share tab audio option. Narration playback time drives scenes/subtitles,
so stalled or interrupted audio fails the run instead of producing a successful
silent recording. Completion follows the end of the 175-second audio timeline.
The browser may introduce a small recording lead-in and timer/encoder latency;
this is not a frame-exact video editor.

If the file cannot load, final recording is disabled. **Test Voice** and **Play Demo
Without Recording** can use browser SpeechSynthesis with an English voice selector.
The voice list refreshes on `voiceschanged`; missing voices, blocked playback,
synthesis errors, and failure to start have explicit messages. You can also choose
TTS preview while the asset is available. TTS preview starts immediately without the
recording countdown to keep its first scene aligned; later utterances start at scene
boundaries. Voice-dependent pacing may vary. TTS is never treated as recordable audio.

Capture requires permission each run on localhost or HTTPS. Use a supporting desktop
browser such as Chrome or Edge, keep the tab visible, and select this site's tab.
Completion requests an automatic WebM or MP4 download using the supported MIME type.
**Download Recording** remains available if automatic saving is blocked. **Stop**
saves a partial recording; **Cancel** discards it. Original observatory state is
preserved. Timers, speech, media tracks, audio nodes, contexts, and object URLs are
cleaned up when the dialog unmounts; reusable narration resources are retained for
replay while the dialog remains open. Nothing is uploaded.

### Exact local checks

1. Run `npm run lint`, `npm test`, and `npm run build`.
2. Run `npm run dev`; open `http://localhost:3000` in desktop Chrome or Edge.
3. Change the observer/date, select an object, and adjust a module filter. Open
   **Start Demo Recording**, wait for the audio-file status, then click **Test Voice**.
   Confirm audible English speech. Check the English TTS preview option and voice
   selector separately, then turn it off to test the bundled narration.
4. Click **Start Recording**, share this tab, and wait through all six
   scenes. Verify the actual app modules, changing calculated values, subtitles,
   progress, closing card, and automatic download request. Play the downloaded file
   and confirm its extension, approximately 2:55 duration, spoken English in every scene,
   and alignment with the visible subtitles. Repeat with Share tab audio disabled;
   narration should still be present because it is mixed directly.
5. Close the result dialog and verify your original state. Repeat using **Stop**,
   **Cancel**, **Replay**, denied permission, and the browser's native stop-sharing
   control. Canceled/failed runs must not offer a successful completed recording.
6. Run `npm run preview -- --host 127.0.0.1 --port 4173` and repeat at
   `http://localhost:4173` to check the production bundle.
7. Temporarily rename the public WAV and reload preflight: verify the explicit error,
   disabled final recording, and working English TTS preview. Restore the WAV.
8. Set `VITE_COMPETITION_DEMO=false` in `.env.local`, rebuild, and verify the demo
   entry point disappears while all five modules still work. Remove the override
   to re-enable it.

Run `python scripts/analyze-narration.py` to measure the current WAV; the saved report
is `public/audio/narration-quality-report.json`. This is signal analysis, not listening
review. It cannot certify natural delivery or pronunciation.

Automated coverage includes the real WAV's duration and signal in every scene,
audio-clock scheduling, timer cleanup, missing/HTML assets, silent or wrong-duration
tracks, explicit audio/video mixing, required audio gating, TTS errors, cancellation,
and recorder finalization. Browser APIs are mocked in unit tests. HTTP checks verified
that development and production-preview URLs return the exact WAV with HTTP 200 and
`audio/wav`. No browser was exposed in the coding session, so audible playback,
downloaded video playback, and deployed HTTPS capture require the manual checks above.

### Vercel recording deployment

Use the Vite settings above (`npm run build`, output `dist`). No backend or secrets
are needed. The optional build-time environment variable `VITE_COMPETITION_DEMO`
defaults to enabled; set it to `false` and redeploy to remove the entry point.
The committed public WAV is copied into `dist/audio` by Vite; no Vercel environment
variable or build-time speech generator is needed. After deployment, open
`https://YOUR-VERCEL-DOMAIN/audio/competition-narration.en.wav` and verify audio plays.
Deploy a preview and run the same permission/download checks on its HTTPS URL before
promoting to production. Do not embed it in an iframe that denies display capture.
See [MDN screen capture permissions and compatibility](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)
and [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder).
