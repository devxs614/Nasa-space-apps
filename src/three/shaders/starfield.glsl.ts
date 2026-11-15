export const STARFIELD_VERT = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute vec3 aColor;
uniform float uTime;
uniform float uPixelRatio;
varying vec3 vColor;
varying float vTwinkle;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  vTwinkle = 0.78 + 0.22 * sin(uTime * (0.4 + aPhase) + aPhase * 6.2831);
  gl_PointSize = aSize * uPixelRatio;
  vColor = aColor;
}
`;
export const STARFIELD_FRAG = /* glsl */ `
varying vec3 vColor;
varying float vTwinkle;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float core = smoothstep(0.5, 0.0, d);
  float glow = exp(-d * 9.0);
  float a = (core * 0.55 + glow * 0.45) * vTwinkle;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor * a, a);
}
`;
