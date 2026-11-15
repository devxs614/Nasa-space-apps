import { Vector3 } from 'three';

const DEG = Math.PI / 180;

/** Latitud planetocéntrica y longitud este en grados (−180..180). Coincide con el UV de SphereGeometry. */
export function latLonToVector3(
  latDeg: number,
  lonDeg: number,
  radius: number,
  out = new Vector3(),
): Vector3 {
  const lat = latDeg * DEG;
  const lon = lonDeg * DEG;
  return out.set(
    radius * Math.cos(lat) * Math.cos(lon),
    radius * Math.sin(lat),
    -radius * Math.cos(lat) * Math.sin(lon),
  );
}

/** Inversa de latLonToVector3. */
export function vector3ToLatLon(v: Vector3): { lat: number; lon: number } {
  const r = v.length() || 1;
  return { lat: Math.asin(v.y / r) / DEG, lon: Math.atan2(-v.z, v.x) / DEG };
}

/** Convierte longitudes 0..360 E o "W" a este −180..180. */
export function normalizeLon(lon: number): number {
  const l = ((((lon + 180) % 360) + 360) % 360) - 180;
  return Object.is(l, -0) ? 0 : l;
}
