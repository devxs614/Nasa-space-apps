import {
  Box3,
  Matrix4,
  Vector3,
  type BufferGeometry,
  type Mesh,
  type Object3D,
  type PerspectiveCamera,
} from 'three';

/**
 * Caja de las mallas de `root` en el espacio local de `root`: no depende de su escala, de su
 * posición ni del giro de sus padres. Quedan fuera los contornos de la pieza clave y lo que se
 * marque con `userData.excludeFromBounds` (piezas auxiliares).
 */
export function localBounds(root: Object3D): Box3 {
  const box = new Box3();
  const tmp = new Box3();
  const toLocal = new Matrix4();
  const m = new Matrix4();
  root.updateWorldMatrix(true, true);
  toLocal.copy(root.matrixWorld).invert();
  root.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh || mesh.userData.outline || mesh.userData.excludeFromBounds) return;
    const g = mesh.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    if (!g.boundingBox || g.boundingBox.isEmpty()) return;
    m.multiplyMatrices(toLocal, mesh.matrixWorld);
    box.union(tmp.copy(g.boundingBox).applyMatrix4(m));
  });
  return box;
}

/**
 * Radio de la esfera más grande que cabe entera en pantalla a `distance` de una cámara con campo
 * vertical `fovDeg`. Mira también el campo horizontal: en pantallas estrechas manda el ancho.
 */
export function fitRadius(aspect: number, fovDeg: number, distance: number, margin = 0.88): number {
  const v = (fovDeg * Math.PI) / 360;
  const h = Math.atan(Math.tan(v) * aspect);
  return distance * Math.sin(Math.min(v, h) * margin);
}

/** Mayor |x| o |y| en pantalla (NDC) de las 8 esquinas de una caja: 1 o menos significa que cabe. */
export function maxNdc(box: Box3, matrixWorld: Matrix4, camera: PerspectiveCamera): number {
  const p = new Vector3();
  let max = 0;
  for (let i = 0; i < 8; i++) {
    p.set(
      i & 1 ? box.max.x : box.min.x,
      i & 2 ? box.max.y : box.min.y,
      i & 4 ? box.max.z : box.min.z,
    )
      .applyMatrix4(matrixWorld)
      .project(camera);
    max = Math.max(max, Math.abs(p.x), Math.abs(p.y));
  }
  return max;
}

/**
 * Copia de una geometría con las caras mirando al otro lado. Una superficie abierta (un plato de
 * antena, un parasol) solo se dibuja por una cara: con esta copia se ve también por detrás sin
 * tocar el material, que comparten todas las piezas.
 */
export function flippedFaces(source: BufferGeometry): BufferGeometry {
  const g = source.clone();
  const index = g.getIndex();
  if (index) {
    const a = index.array;
    for (let i = 0; i + 2 < a.length; i += 3) {
      const first = a[i]!;
      a[i] = a[i + 2]!;
      a[i + 2] = first;
    }
    index.needsUpdate = true;
  }
  const n = g.getAttribute('normal');
  if (n) {
    for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i));
    n.needsUpdate = true;
  }
  return g;
}
