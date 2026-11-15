export const HOLOGRAM_VERT = /* glsl */ `
#include <clipping_planes_pars_vertex>
uniform float uTime;
uniform float uGlitch;
varying vec3 vNormalW;
varying vec3 vViewDirW;
varying vec3 vPosW;
void main() {
  vec3 p = position;
  float tick = floor(uTime * 12.0);
  float r = fract(sin(tick * 12.9898) * 43758.5453);
  p.x += step(0.97, r) * uGlitch * 0.02 * sin(position.y * 40.0 + uTime * 30.0);
  vec4 w = modelMatrix * vec4(p, 1.0);
  vPosW = w.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewDirW = normalize(cameraPosition - w.xyz);
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <clipping_planes_vertex>
}
`;
export const HOLOGRAM_FRAG = /* glsl */ `
#include <clipping_planes_pars_fragment>
uniform vec3 uColor;
uniform float uTime;
uniform float uOpacity;
uniform float uRevealY;
uniform float uFlicker;
uniform float uScan;
varying vec3 vNormalW;
varying vec3 vViewDirW;
varying vec3 vPosW;
void main() {
  #include <clipping_planes_fragment>
  float fres = pow(1.0 - clamp(abs(dot(normalize(vNormalW), normalize(vViewDirW))), 0.0, 1.0), 2.2);
  float scan = 0.5 + 0.5 * sin(vPosW.y * 140.0 - uTime * 5.0);
  scan = smoothstep(0.35, 1.0, scan) * 0.28 * uScan;
  float flick = mix(1.0, 0.86 + 0.14 * sin(uTime * 23.0 + vPosW.y * 3.0), uFlicker);
  float edge = 1.0 - smoothstep(0.0, 0.03, abs(vPosW.y - uRevealY));
  float a = (fres * 0.85 + scan + 0.07) * flick * uOpacity + edge * 0.9 * step(0.001, uOpacity);
  vec3 col = uColor * (0.55 + fres * 1.7) + vec3(1.0) * edge;
  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
}
`;
