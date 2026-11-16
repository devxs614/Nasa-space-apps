# Credits

## Team

fsociety7337 — Danny Barahona and Dorian González. No personal contact details are published here.

## Data

Every fact in the experience links to its source. The full list, with access dates, is in [SOURCES.md](SOURCES.md).
NASA content is used for informational purposes under the NASA Images and Media Usage Guidelines; this project is not
affiliated with or endorsed by NASA.

## Images

Photographs are loaded at runtime from the NASA Image and Video Library (images.nasa.gov). Each one is shown with its
title, date, credit and `nasa_id`, as returned by the API. Items whose metadata credits a third-party copyright holder
are discarded.

Optional textures and models (Annex C of the specification) are not bundled. If the team adds them, credit them here:

| File | Origin | Credit |
| --- | --- | --- |
| `public/textures/moon_color_2k.jpg` | NASA SVS, CGI Moon Kit (svs.gsfc.nasa.gov/4720) | NASA's Scientific Visualization Studio |
| `public/textures/mars_color_2k.jpg` | NASA 3D Resources | NASA/JPL-Caltech |
| `public/textures/earth_night_2k.jpg` | NASA Earth Observatory, Earth at Night | NASA Earth Observatory images by Joshua Stevens, using Suomi NPP VIIRS data from Miguel Román, NASA GSFC |
| `public/textures/starmap_4k.jpg` | NASA SVS, Deep Star Maps 2020 (svs.gsfc.nasa.gov/4851) | NASA/Goddard Space Flight Center Scientific Visualization Studio; Gaia DR2: ESA/Gaia/DPAC |
| `public/models/<id>.glb` | NASA 3D Resources | NASA |

Without those files, every globe, texture and spacecraft is generated procedurally by our code.

## Sound

All sound is synthesized live with the Web Audio API by our own code. No recordings or real voices are used.

The optional background music is original generative music created live by this site (`src/audio/music/`): one theme
per act, with its own volume in the audio mixer. No music library, film score or recorded track is used.
Optional narration uses the browser's built-in speech synthesis.

## Libraries

| Library | License |
| --- | --- |
| React, React DOM | MIT |
| three.js | MIT |
| @react-three/fiber, @react-three/drei, @react-three/postprocessing | MIT |
| postprocessing | Zlib |
| GSAP, @gsap/react | GSAP Standard "No Charge" License (free, including commercial use; not MIT) |
| Lenis | MIT |
| Zustand | MIT |
| i18next, react-i18next, i18next-browser-languagedetector | MIT |
| React Router | MIT |
| maath | MIT |
| Tailwind CSS | MIT |
| lucide-react | ISC |
| Vite, Vitest | MIT |
| Testing Library | MIT |
| Playwright | Apache 2.0 |
| axe-core / @axe-core/playwright | MPL 2.0 |
| ESLint, typescript-eslint, Prettier | MIT |
| TypeScript | Apache 2.0 |
| Simplex noise GLSL (Ashima Arts, Stefan Gustavson) | MIT |

## Fonts

All fonts are self-hosted through Fontsource and licensed under the SIL Open Font License 1.1:
Unbounded, Fraunces, Atkinson Hyperlegible Next and JetBrains Mono.
