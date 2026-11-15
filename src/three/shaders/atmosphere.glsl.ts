export const ATMOSPHERE_VERT = /* glsl */ `
varying vec3 vNormalV;
varying vec3 vPosV;
void main() {
  vNormalV = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vPosV = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;
export const ATMOSPHERE_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uPower;
uniform float uIntensity;
varying vec3 vNormalV;
varying vec3 vPosV;
void main() {
  float rim = pow(1.0 - abs(dot(normalize(vNormalV), normalize(-vPosV))), uPower);
  gl_FragColor = vec4(uColor * rim * uIntensity, rim * uIntensity);
}
`;
