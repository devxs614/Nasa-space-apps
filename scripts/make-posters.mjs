// Genera public/posters/*.svg: siluetas lineales originales de cada máquina sobre su mundo (Parte 7.8).
import { mkdir, writeFile } from 'node:fs/promises';

const W = 800;
const H = 500;
const CY = '#5ef2ff';

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function stars(seed, n = 90) {
  const r = rng(seed);
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = (r() * W).toFixed(1);
    const y = (r() * H * 0.75).toFixed(1);
    const rad = (r() ** 3 * 1.6 + 0.4).toFixed(2);
    const o = (0.3 + r() * 0.6).toFixed(2);
    s += `<circle cx="${x}" cy="${y}" r="${rad}" fill="#e8eef7" opacity="${o}"/>`;
  }
  return s;
}
const ground = {
  moon: '<path d="M0 410 Q400 360 800 410 L800 500 L0 500Z" fill="#1a1b20" stroke="#8e8f94" stroke-width="1.5"/><ellipse cx="160" cy="440" rx="40" ry="7" fill="none" stroke="#5a5b60"/><ellipse cx="640" cy="452" rx="58" ry="9" fill="none" stroke="#5a5b60"/><circle cx="680" cy="90" r="26" fill="none" stroke="#6fb6ff" stroke-width="1.5"/>',
  mars: '<rect width="800" height="500" fill="url(#marsSky)"/><path d="M0 405 Q200 380 400 400 T800 392 L800 500 L0 500Z" fill="#2a1410" stroke="#c7895b" stroke-width="1.5"/><path d="M80 452 l18 -10 l20 10z M600 440 l26 -14 l30 14z" fill="none" stroke="#b4552e"/>',
  'small-bodies':
    '<path d="M60 470 Q200 380 420 400 Q640 420 760 470 L760 500 L60 500Z" fill="#1d1712" stroke="#a3876b" stroke-width="1.5"/><circle cx="300" cy="455" r="10" fill="none" stroke="#6b5a48"/><circle cx="520" cy="440" r="16" fill="none" stroke="#6b5a48"/>',
  'deep-space':
    '<circle cx="110" cy="390" r="8" fill="#ffb547"/><circle cx="110" cy="390" r="22" fill="none" stroke="#ffb547" opacity="0.35"/><g fill="none" stroke="#a99bff" opacity="0.35"><ellipse cx="110" cy="390" rx="90" ry="34"/><ellipse cx="110" cy="390" rx="200" ry="74"/><ellipse cx="110" cy="390" rx="360" ry="130"/></g>',
};
const defs =
  '<defs><linearGradient id="marsSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05060a" stop-opacity="0"/><stop offset="0.8" stop-color="#3a1e16"/></linearGradient></defs>';

// Siluetas (coordenadas absolutas; base del suelo en y≈405)
const S = {
  surveyor:
    'M400 240 L400 290 M360 250 h80 v20 h-80z M330 300 L470 300 L400 260 Z M335 300 L300 395 M465 300 L500 395 M400 300 L400 398 M288 398 h24 M488 398 h24 M388 400 h24 M440 320 l40 30 l10 -6',
  'apollo-lm':
    'M320 290 L360 260 H440 L480 290 V330 L440 350 H360 L320 330 Z M330 330 L270 398 M470 330 L530 398 M360 350 L345 400 M440 350 L455 400 M255 400 h30 M515 400 h30 M332 402 h26 M442 402 h26 M380 350 L372 372 H428 L420 350 M470 330 L478 352 h14',
  alsep:
    'M250 360 h70 v22 h-70z M285 360 V330 M270 330 h30 M285 330 L300 300 M380 392 h60 M410 392 V355 M390 355 h40 v-6 h-40z M520 400 l40 -30 l40 30 z M530 392 l60 0 M545 380 l30 0 M330 396 Q380 380 410 392 M330 396 Q450 410 540 398',
  lrv: 'M270 360 H530 L520 344 H290 Z M300 376 m-24 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0 M500 376 m-24 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0 M360 344 V320 h40 v24 M420 344 V318 h30 v26 M500 344 V280 M480 280 q20 -24 40 0 z M300 352 l-20 20 M500 352 l20 20',
  viking:
    'M340 300 L370 285 H430 L460 300 V320 H340 Z M350 320 L310 398 M450 320 L490 398 M400 320 V400 M298 400 h24 M478 400 h24 M388 402 h24 M400 285 V255 M380 255 q20 -20 40 0 z M460 310 L540 345 l10 -4 M352 300 v-14 h12 v14 M436 300 v-14 h12 v14',
  sojourner:
    'M340 360 H460 V340 H340 Z M350 376 m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0 M400 376 m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0 M450 376 m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0 M350 360 L375 376 L400 360 M425 360 L450 376 M455 340 V300 M230 400 L280 340 L330 400 Z M560 404 q30 -40 60 0',
  spirit:
    'M300 330 H500 L520 340 H280 Z M330 340 V358 H470 V340 M330 384 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 M400 384 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 M470 384 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 M440 330 V270 h30 v14 h-30 M340 330 L330 300 h20 M486 398 Q560 404 640 400',
  opportunity:
    'M260 330 H540 L560 340 H240 Z M330 340 V358 H470 V340 M330 384 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 M400 384 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 M470 384 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 M440 330 V270 h30 v14 h-30 M600 404 Q680 360 760 404',
  phoenix:
    'M350 320 H450 V340 H350 Z M360 340 L330 398 M440 340 L470 398 M400 340 V400 M250 322 m-60 0 a60 14 0 1 0 120 0 a60 14 0 1 0 -120 0 M550 322 m-60 0 a60 14 0 1 0 120 0 a60 14 0 1 0 -120 0 M450 325 L520 290 L560 360 l14 4 M400 320 V285 M392 285 h16 M520 398 h40 v8 h-40z',
  insight:
    'M350 320 H450 V340 H350 Z M360 340 L330 398 M440 340 L470 398 M240 322 m-70 0 a70 16 0 1 0 140 0 a70 16 0 1 0 -140 0 M560 322 m-70 0 a70 16 0 1 0 140 0 a70 16 0 1 0 -140 0 M420 400 m-30 0 a30 22 0 0 1 60 0 z M450 325 L500 300 L520 330',
  ingenuity:
    'M385 330 h30 v30 h-30z M400 330 V280 M310 290 H490 M320 304 H480 M386 360 L362 400 M414 360 L438 400 M386 360 L376 402 M414 360 L424 402 M392 272 h16 v8 h-16z M540 404 q60 -26 120 0',
  near: 'M370 220 h60 l20 20 v40 l-20 20 h-60 l-20 -20 v-40z M350 240 L250 200 L230 250 L350 270 M450 240 L550 200 L570 250 L450 270 M400 300 v20 M370 326 q30 -20 60 0 z M400 330 L400 380',
  dawn: 'M380 240 h40 v40 h-40z M380 252 H160 v16 H380 M420 252 H640 v16 H420 M400 240 V222 M388 222 q12 -12 24 0 M392 280 l-10 30 M408 280 l10 30 M400 280 L400 330',
  kepler:
    'M360 200 h80 v170 h-80z M360 200 L450 170 L440 200 M440 220 q40 60 0 140 M400 370 v18 M380 390 h40',
  pioneer:
    'M330 250 q70 -70 140 0 z M400 250 V280 M380 280 h40 v24 h-40z M380 290 L300 320 l-6 10 M420 290 L500 320 l6 10 M400 304 L420 380 M462 262 h18 v12 h-18z',
};
const WORLD = {
  surveyor: 'moon',
  'apollo-lm': 'moon',
  alsep: 'moon',
  lrv: 'moon',
  viking: 'mars',
  sojourner: 'mars',
  spirit: 'mars',
  opportunity: 'mars',
  phoenix: 'mars',
  insight: 'mars',
  ingenuity: 'mars',
  near: 'small-bodies',
  dawn: 'small-bodies',
  kepler: 'deep-space',
  pioneer: 'deep-space',
};

function svg(body, seed, world, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}">${defs}<rect width="${W}" height="${H}" fill="#05060a"/>${world === 'mars' ? '' : ''}${ground[world] ? '' : ''}${stars(seed)}${ground[world] ?? ''}${body}</svg>\n`;
}

await mkdir('public/posters', { recursive: true });
let i = 1;
for (const [id, d] of Object.entries(S)) {
  const body = `<path d="${d}" fill="none" stroke="${CY}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  await writeFile(`public/posters/${id}.svg`, svg(body, i++ * 7919, WORLD[id], id));
}
const scenes = {
  prologue:
    '<circle cx="400" cy="560" r="300" fill="#070b14" stroke="#6fb6ff" stroke-width="2"/><g fill="#ffb547"><circle cx="300" cy="300" r="2"/><circle cx="340" cy="285" r="1.6"/><circle cx="460" cy="290" r="2"/><circle cx="520" cy="310" r="1.6"/><circle cx="410" cy="275" r="2.2"/></g>',
  moon: '<circle cx="400" cy="250" r="150" fill="#1a1b20" stroke="#c9ccd3" stroke-width="2"/><circle cx="350" cy="210" r="34" fill="#141519"/><circle cx="450" cy="300" r="22" fill="#141519"/>',
  mars: '<circle cx="400" cy="250" r="150" fill="#3a1a10" stroke="#e2683c" stroke-width="2"/><circle cx="400" cy="250" r="160" fill="none" stroke="#e8a27c" opacity="0.4"/><path d="M290 300 q60 -20 120 6" stroke="#7a3a22" fill="none" stroke-width="10" opacity="0.6"/>',
  'small-bodies':
    '<path d="M250 260 q40 -90 160 -70 q120 20 150 70 q20 70 -90 80 q-160 10 -220 -80z" fill="#1d1712" stroke="#a3876b" stroke-width="2"/>',
  'deep-space': ground['deep-space'].replaceAll('110', '400').replace('cy="390"', 'cy="250"'),
  epilogue:
    '<path d="M120 300 Q400 120 680 300" fill="none" stroke="#5ef2ff" stroke-width="2" stroke-dasharray="4 10"/><g fill="#5ef2ff">' +
    Array.from(
      { length: 15 },
      (_, k) =>
        `<circle cx="${120 + k * 40}" cy="${300 - Math.sin((k / 14) * Math.PI) * 180 * 0.5}" r="4"/>`,
    ).join('') +
    '</g>',
  idle: '',
};
for (const [id, body] of Object.entries(scenes)) {
  await writeFile(`public/posters/scene-${id}.svg`, svg(body, i++ * 104729, 'none', id));
}
console.log(`pósters: ${Object.keys(S).length} máquinas y ${Object.keys(scenes).length} escenas`);
