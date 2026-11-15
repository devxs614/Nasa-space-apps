# Submission text — NASA Space Apps Challenge 2026

Copy each block into the matching field of the submission form. Replace the bracketed items before sending.

## Project Name

```text
LAST SIGNAL
```

## High-Level Project Summary

```text
LAST SIGNAL is an interactive 3D web experience that brings back to life 15 pieces of NASA hardware that stayed
behind on the Moon, on Mars and beyond: from Surveyor 3 and the Apollo descent stages to Opportunity, Ingenuity,
Dawn, Kepler and the Pioneer probes. Visitors scroll through each machine's life in seven moments, from wake-up to
last signal, guided by LUMI, a fictional signal companion. They dig, drive, fly and listen in hands-on
mini-experiences, then send a signal home and see how long light really takes to reach each machine, calculated
from JPL orbital elements. Fiction is always labeled and every fact links to its NASA source. It works in English
and Spanish, targets WCAG 2.2 AA, and still tells the whole story without WebGL. Abandoned, but not forgotten.
```

## Link to Project Demo

```text
[Public link to the 30-second video (YouTube "Unlisted" is fine) or to the 7-slide PDF]
```

The video subtitles are in [`docs/video/last-signal-30s.srt`](docs/video/last-signal-30s.srt). Record the site at
`https://devxs614.github.io/Nasa-space-apps/?demo=1&lang=en` at 1920×1080.

## Link to Final Project

```text
https://devxs614.github.io/Nasa-space-apps/
Repository: https://github.com/devxs614/Nasa-space-apps
```

## Detailed Project Description

```text
What it does
LAST SIGNAL is a scroll-driven museum in four acts: the Moon, Mars, small bodies and deep space. Each of the 15
chapters follows one machine through seven moments: wake-up, identity, journey, arrival, work, last signal and legacy.
The machine tells its story in a labeled fictional voice, while a "Mission log" voice gives verified facts with links
to their sources.

How it works
The site is a single-page app built with React, TypeScript and Vite. One persistent three.js canvas (React Three Fiber)
sits behind accessible DOM content; GSAP ScrollTrigger and Lenis drive the camera through procedurally generated
worlds and machines. In every chapter, visitors can try the machine's job in a mini-experience (Surveyor's trench,
Apollo 12's moonquake, Sojourner's delayed commands, Kepler's transit hunt...). The "Send a signal" moment computes the
one-way light time from Earth to the machine today, using JPL's approximate Keplerian elements for Mars, the JPL
Small-Body Database for 433 Eros and published reference distances for the Pioneers, and shows it with an honest
time-compression badge. Original patches, a passport, ranks and a quiz reward attention, not speed. Lunar and Martian
atlases, a timeline and a catalog let visitors explore the sites and dates on their own.

Benefits
It turns a list of abandoned objects into stories people remember, and it teaches real physics (light time, gravity,
solar vs. nuclear power, thin air) without lectures. A classroom mode adds discussion prompts for teachers, and a
30-second automatic demo shows the five key moments.

Accessibility and reach
English and Spanish with full parity, keyboard and screen-reader support, scene descriptions, reduced motion,
high contrast, legible font, lite mode for low-end devices, a reading mode without WebGL and static reading pages
that need no JavaScript at all.

Goals
Preserve the memory of these machines, show that exploration leaves a trail, and invite the next generation to send
the next signal.

Tools
React, TypeScript, Vite, three.js, React Three Fiber, drei, postprocessing, GSAP, Lenis, Zustand, i18next, Tailwind CSS,
Web Audio API, Web Speech API, Vitest, Playwright and axe. Hosted on GitHub Pages.
Repository: https://github.com/devxs614/Nasa-space-apps
```

## NASA Data

```text
- NASA Space Science Data Coordinated Archive (NSSDCA): mission facts, dates and lunar landing-site coordinates.
- NASA mission pages (NASA Science, JPL, nasa.gov): timelines, discoveries and end-of-mission dates for all 15 machines.
- JPL Solar System Dynamics, "Approximate Positions of the Planets": Earth–Moon barycenter and Mars positions for
  live Earth–Mars light-time estimates.
- JPL Small-Body Database: orbital elements of 433 Eros for the NEAR Shoemaker chapter.
- NASA Image and Video Library (images-api.nasa.gov): photographs shown with credit and NASA ID.
How we used it: every date and number in the experience comes from these sources and links back to them
(full list with access dates in SOURCES.md). Light times are labeled as calculated estimates.
```

## Space Agency Partner & Other Data

```text
No partner-agency datasets were required. A few facts are cross-checked with ESA, university and observatory pages
(for example LROC at Arizona State University, HiRISE at the University of Arizona, IPGP, the Max Planck Institute for
Solar System Research and The Planetary Society); each one is listed with its access date in SOURCES.md.
Open-source libraries and fonts are listed with their licenses in CREDITS.md (MIT, SIL Open Font License and the GSAP
standard license). No copyrighted material is used without permission.
```

## Use of Artificial Intelligence

```text
Yes. An AI coding agent (Claude Code) generated most of the code from a detailed specification written by our team;
we reviewed, tested and edited it. AI also helped draft chapter scripts and interface text, which we edited and
fact-checked against the sources in SOURCES.md. Optional narration uses the browser's built-in synthetic voice and is
labeled as such. No AI-generated images, audio files or data are used; sound is synthesized live with the Web Audio API
by our code. No NASA logos, insignia, flags or mission identifiers are used as branding. Details: AI_DISCLOSURE.md.
```

## Before you press "Submit for Judging"

- [ ] Website, repository and demo open in a private window without signing in.
- [ ] Everything linked from the form is in English.
- [ ] The video is 30 s or shorter with English subtitles, or the deck has 7 slides or fewer.
- [ ] "NASA Data" and "Use of Artificial Intelligence" match the website and `AI_DISCLOSURE.md`.
- [ ] No NASA logos or insignia, no recognizable minors, no personal data.
- [ ] Team name and members added to `README.md` and `CREDITS.md`, and the demo link added to `README.md`.
