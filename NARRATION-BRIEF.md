# Zanzibar SkyLab ? professional narration handoff

Status: awaiting the user-supplied professional performance. The bundled Hazel file is only a timing draft.

## Delivery brief

Warm, confident documentary delivery, as the maker presenting a scientific tool to non-specialist judges. Use natural emphasis and varied rhythm; do not imitate a named individual. Aim for 140?155 words per minute where appropriate, allowing technical explanations to breathe. Short sentence pauses: 0.2?0.5 seconds. Section transitions: 0.5?1 second. No silence longer than 1.5 seconds. Do not speed up the entire master to force a fit.

Review these terms aloud: Zanzibar, Stone Town, SkyLab, astronomical, celestial, azimuth, altitude, Jupiter, Sirius, sidereal. Check every occurrence in the final listening review; a duration check cannot certify pronunciation.

## Master requirements

- Deliver a 175.000-second WAV (preferred: PCM, 16/24-bit, 44.1/48 kHz) or MP3. No countdown, music, or added introduction.
- Follow the six start times below. Finish each section just before its boundary with a short natural transition.
- Prefer editing the script or rerecording a sentence to time-stretching speech. If wording changes, return the final transcript so the subtitles can be updated.
- Keep scientific claims unchanged: calculated positions, not telescope images or guaranteed observations.
- Listen for clipping, awkward edits, excessive pauses, and scientific pronunciation.
- The browser accepts decoded duration within 50 ms of 175 seconds to allow MP3 padding; the authoritative master should be exactly 175 seconds. The recording container may add small encoder/timer latency.

## Timed script

### 00:00?00:20 ? Introduction

Welcome to Zanzibar SkyLab, our digital observatory from Stone Town, here in East Africa. We built it to help people understand the sky and plan what to observe. In the next three minutes, I'll show you five connected tools, powered by astronomy calculated right here in your browser.

### 00:20?00:55 ? Sky Explorer

Let's begin with the sky above Zanzibar. This map uses a fixed observing date, so we can return to the same calculated view. When we select a star, the inspector tells us where to look. Altitude measures its angle above the horizon; azimuth gives its compass direction. Change the time or the observing location, and those directions change too. We're exploring a calculated sky, rather than a live telescope image. That makes the map a useful starting point for learning and observation outdoors.

### 00:55?01:30 ? Astronomical Time Lab

Now let's explore time. Here, the same observing clock drives every module. Watch it advance in ten minute steps as the calculated positions respond. Earth's rotation makes stars appear to move across our local sky. The Time Lab also shows sidereal time, which follows a reference direction among the stars, rather than the Sun. Comparing these clocks helps explain why a star returns to the same place a little earlier each night. It's a practical, hands-on way to explore celestial motion for yourself.

### 01:30?02:05 ? Observation Planner

When should we look? Our Observation Planner plots a target's altitude through the night. We begin with Jupiter, then select Sirius and compare another observing date. A higher target is often easier to observe because its light travels through less atmosphere. Twilight times help us find darker periods. These calculations cannot promise clear skies. Clouds, local terrain, and light pollution still matter. The planner helps us make informed choices before heading outside with our equipment.

### 02:05?02:35 ? Moon Explorer and Object Directory

The Moon Explorer brings lunar geometry into view. The illuminated fraction tells us how much of the Moon's visible face is sunlit. But that number alone cannot guarantee a thin crescent sighting; conditions and the Moon's position matter too. Next, our Object Directory brings familiar names and calculated positions together. Search for Sirius, and its entry gives us a starting point for exploring that bright star in our night sky.

### 02:35?02:55 ? Innovation and conclusion

What connects these tools is one shared observing time and location. Zanzibar SkyLab brings sky exploration, lunar science, and observation planning into one working interface. Our aim: make astronomy easier to understand and use. Thank you for joining us here in Zanzibar.

## Using the supplied file

For a private listening test, open **Start Demo Recording**, choose your MP3/WAV using **Use your professional MP3 or WAV**, and click **Test Voice**. This file stays on your device and is reset when the dialog closes. Start Recording uses the selected track through the existing Web Audio recording route. A missing or invalid track cannot fall back silently to TTS.

For the shared site, place the approved track in `public/audio/` and set `VITE_DEMO_NARRATION_PATH=audio/your-file.mp3` and `VITE_DEMO_NARRATION_LABEL=Approved English narration` in your local/Vercel build environment. These are public strings, not credentials. Rebuild and redeploy. The default bundled path remains `audio/competition-narration.en.wav`.

## Acceptance review still required

1. Play the entire approved performance and check all terms and section transitions.
2. Run Test Voice locally and on the HTTPS deployment.
3. Make a short recording with tab audio disabled; stop after 12 seconds, download it, and verify audible speech in the actual file.
4. Make a full recording and check all scene boundaries and the end.
5. Verify cancel, replay, denied capture, and audio interruption.

The current environment exposes no browser or listening tool. Audible playback and a real test recording have not been verified here.
