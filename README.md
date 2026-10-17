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
175 seconds, preceded by a recorded 3-second countdown (approximately 2:58 of video).
The six scenes use the existing Observatory components and astronomy engine, with
Stone Town and a fixed initial date of 2026-01-15 21:00 EAT. Scheduled actions select
a star, advance simulation time, select a planner target, change the observing day,
and search the directory. The original Observatory stays mounted and paused so its
navigation, date, observer, selections, appearance, local filters, and sky controls
survive cancellation and completion. It resumes after the result dialog closes.

There is no narration asset in this repository. Recordings therefore have subtitles
and **no supplied voice narration**; shared tab/system audio may still be captured.
Speech synthesis is intentionally not used because it is not reliably captured.
No fabricated audio asset, network voice service, or API key is involved.

Capture requires permission on every run and a supporting desktop browser on
localhost or HTTPS. Chrome/Edge desktop are recommended; actual support is checked
at runtime. Browser/OS combinations differ in tab and audio capture support.
Select **This Tab** (or this site's entry under Chrome Tab) and **Share tab audio**
if offered. Use a 16:9 browser window, keep the tab foregrounded, and do not let the
computer sleep. JavaScript deadlines cannot guarantee frame-exact duration under
OS suspension or browser throttling. The scheduler requests stop at 175 seconds
following the countdown, independently of rendering updates.

MediaRecorder selects a supported WebM or MP4 format. Completion requests an automatic
download, with **Download Recording** retained if the browser blocks automatic saving.
**Stop** produces a partial recording; **Cancel** discards it. Denial, capture ending,
or recorder failure offers playback without recording. External recording software
can capture that playback when browser capture is unavailable. URLs and streams are
released on cancellation, replay, and unmount. Nothing is uploaded.

### Exact local checks

1. Run `npm run lint`, `npm test`, and `npm run build`.
2. Run `npm run dev`; open `http://localhost:3000` in desktop Chrome or Edge.
3. Change the observer/date, select an object, and adjust a module filter. Open
   **Start Demo Recording** and verify duration, voice status, and support status.
4. Click **Start Recording**, share this tab, and wait through countdown and all six
   scenes. Verify the actual app modules, changing calculated values, subtitles,
   progress, closing card, and automatic download request. Play the downloaded file
   and confirm its extension and approximate 2:58 duration. Do not expect narration.
5. Close the result dialog and verify your original state. Repeat using **Stop**,
   **Cancel**, **Replay**, denied permission, and the browser's native stop-sharing
   control. Canceled/failed runs must not offer a successful completed recording.
6. Run `npm run preview -- --host 127.0.0.1 --port 4173` and repeat at
   `http://localhost:4173` to check the production bundle.
7. Set `VITE_COMPETITION_DEMO=false` in `.env.local`, rebuild, and verify the demo
   entry point disappears while all five modules still work. Remove the override
   to re-enable it.

Automated coverage includes scene boundaries, deadline completion, timer cleanup,
cancellation, MIME selection, final chunk assembly, recorder failure, and native
track-end notification. MediaRecorder is mocked in unit tests: these do not verify
real browser capture or playback. Browser UI testing was unavailable in the coding
session, so local capture, production-preview interaction, and HTTPS capture still
require the manual checks above.

### Vercel recording deployment

Use the Vite settings above (`npm run build`, output `dist`). No backend or secrets
are needed. The optional build-time environment variable `VITE_COMPETITION_DEMO`
defaults to enabled; set it to `false` and redeploy to remove the entry point.
Deploy a preview and run the same permission/download checks on its HTTPS URL before
promoting to production. Do not embed it in an iframe that denies display capture.
See [MDN screen capture permissions and compatibility](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)
and [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder).
