import { NOISE_GLSL } from './noise.glsl';

/** Planetas procedurales (Parte 9.8). uKind: 0 Luna, 1 Marte, 2 Ceres, 3 Vesta, 4 Tierra nocturna, 5 asteroide. */
export const PLANET_VERT = /* glsl */ `
varying vec3 vObjN;
varying vec3 vWorldN;
varying vec2 vUv;
void main() {
  vObjN = normalize(position);
  vWorldN = normalize(mat3(modelMatrix) * normal);
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const PLANET_FRAG = /* glsl */ `
uniform int uKind;
uniform vec3 uSunDir;
uniform float uOctaves;
uniform sampler2D uMap;
uniform float uHasMap;
uniform float uStorm;
uniform float uTime;
varying vec3 vObjN;
varying vec3 vWorldN;
varying vec2 vUv;
${NOISE_GLSL}
float crater(vec3 p, float freq) {
  vec3 q = p * freq;
  vec3 c = floor(q) + 0.5;
  float r = 0.18 + 0.22 * (snoise(c * 0.91) * 0.5 + 0.5);
  float d = length(q - c - (vec3(snoise(c * 1.7), snoise(c * 2.3), snoise(c * 3.1)) * 0.3));
  float rim = smoothstep(r + 0.08, r, d) - smoothstep(r, r * 0.4, d) * 0.8;
  return rim * step(0.62, snoise(c * 0.7) * 0.5 + 0.5);
}
void main() {
  vec3 n = normalize(vObjN);
  int oct = int(uOctaves);
  vec3 col;
  float lit = 1.0;
  if (uKind == 0) {
    float relief = fbm(n * 3.0, oct);
    float maria = smoothstep(0.05, 0.35, snoise(n * 1.3 + vec3(2.0)) * 0.6 + n.x * 0.35);
    float c = crater(n, 9.0) + crater(n, 22.0) * 0.5;
    vec3 hi = vec3(0.62, 0.62, 0.64);
    vec3 lo = vec3(0.22, 0.225, 0.24);
    col = mix(hi, lo, maria * 0.8);
    col *= 0.85 + relief * 0.25 + c * 0.12;
  } else if (uKind == 1) {
    float f = fbm(n * 2.4, oct) * 0.5 + 0.5;
    vec3 a = vec3(0.478, 0.227, 0.133);
    vec3 b = vec3(0.706, 0.333, 0.18);
    vec3 c3 = vec3(0.851, 0.541, 0.353);
    col = mix(a, b, smoothstep(0.2, 0.55, f));
    col = mix(col, c3, smoothstep(0.55, 0.9, f));
    float dark = smoothstep(0.15, 0.45, snoise(n * 1.1 + vec3(5.0)));
    col *= 1.0 - dark * 0.35;
    float lat = asin(clamp(n.y, -1.0, 1.0)) * 57.2958;
    float cap = smoothstep(78.0, 82.0, abs(lat) + snoise(n * 8.0) * 3.0);
    col = mix(col, vec3(0.95, 0.94, 0.92), cap);
    col = mix(col, vec3(0.78, 0.54, 0.36), uStorm * 0.85);
  } else if (uKind == 2) {
    float f = fbm(n * 3.0, oct);
    col = vec3(0.235, 0.227, 0.216) * (0.85 + f * 0.25) * (0.9 + crater(n, 12.0) * 0.3);
    float spot = smoothstep(0.06, 0.0, length(n - normalize(vec3(0.55, 0.35, 0.76))));
    spot += smoothstep(0.035, 0.0, length(n - normalize(vec3(0.6, 0.33, 0.73))));
    col += vec3(1.0, 0.98, 0.92) * spot * 1.6;
  } else if (uKind == 3) {
    float f = fbm(n * 2.6, oct);
    col = vec3(0.45, 0.4, 0.34) * (0.85 + f * 0.3);
    float basin = smoothstep(0.55, 0.85, -n.y);
    col *= 1.0 - basin * 0.3;
    col += vec3(0.08) * smoothstep(0.985, 1.0, -n.y);
    col *= 0.9 + crater(n, 10.0) * 0.3;
  } else if (uKind == 4) {
    float land = smoothstep(0.02, 0.12, fbm(n * 1.6 + vec3(1.3), oct));
    col = mix(vec3(0.008, 0.016, 0.035), vec3(0.03, 0.035, 0.04), land);
    float cities = smoothstep(0.8, 0.97, snoise(n * 52.0) * 0.5 + 0.5) * land;
    cities *= smoothstep(0.45, 0.8, snoise(n * 5.0 + vec3(3.0)) * 0.5 + 0.5);
    float glowc = smoothstep(0.55, 0.9, snoise(n * 5.0 + vec3(3.0)) * 0.5 + 0.5) * land * 0.12;
    col += vec3(1.0, 0.71, 0.28) * (cities * 1.8 + glowc);
    lit = 0.0;
  } else {
    float f = fbm(n * 3.4, oct);
    col = vec3(0.42, 0.35, 0.28) * (0.75 + f * 0.35) * (0.85 + crater(n, 8.0) * 0.4);
  }
  if (uHasMap > 0.5) col = texture2D(uMap, vUv).rgb;
  float d = dot(normalize(vWorldN), normalize(uSunDir));
  float light = smoothstep(-0.08, 0.25, d) * 0.95 + 0.05;
  vec3 outc = mix(col, col * light, lit);
  if (uKind == 4) outc += vec3(0.02, 0.05, 0.1) * smoothstep(0.0, 0.4, d);
  gl_FragColor = vec4(outc, 1.0);
}
`;
