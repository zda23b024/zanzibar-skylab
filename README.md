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