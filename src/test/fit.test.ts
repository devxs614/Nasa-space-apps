import { describe, expect, it } from 'vitest';
import {
  BoxGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Sphere,
  Vector2,
  Vector3,
} from 'three';
import { fitRadius, flippedFaces, localBounds, maxNdc } from '../three/fitToView';

/** Normal geométrica del primer triángulo de una geometría indexada. */
function firstFaceNormal(g: LatheGeometry | ReturnType<typeof flippedFaces>): Vector3 {
  const index = g.getIndex()!;
  const pos = g.getAttribute('position');
  const [a, b, c] = [0, 1, 2].map((i) => new Vector3().fromBufferAttribute(pos, index.getX(i)));
  return b!.sub(a!).cross(c!.sub(a!)).normalize();
}

describe('encuadre del visor del catálogo', () => {
  it('la caja de un modelo no depende de su escala, de su posición ni del giro de sus padres', () => {
    const turntable = new Group();
    turntable.rotation.y = 1.1;
    const fit = new Group();
    fit.scale.setScalar(0.3);
    fit.position.set(4, 2, -1);
    turntable.add(fit);
    // Un "telescopio" de 3 × 5 × 3 apoyado en y = -0.5, como el modelo de Kepler.
    const body = new Mesh(new BoxGeometry(3, 5, 3), new MeshBasicMaterial());
    body.position.y = 2;
    const outline = new Mesh(new BoxGeometry(50, 50, 50), new MeshBasicMaterial());
    outline.userData.outline = true;
    const aux = new Mesh(new BoxGeometry(80, 1, 1), new MeshBasicMaterial());
    aux.userData.excludeFromBounds = true;
    fit.add(body, outline, aux);

    const box = localBounds(fit);
    expect(box.min.toArray().map((n) => +n.toFixed(4))).toEqual([-1.5, -0.5, -1.5]);
    expect(box.max.toArray().map((n) => +n.toFixed(4))).toEqual([1.5, 4.5, 1.5]);
  });

  it('una esfera con el radio calculado cabe en pantalla, también en vertical', () => {
    for (const [width, height] of [
      [1366, 768],
      [390, 844],
      [1024, 1024],
    ] as const) {
      const aspect = width / height;
      const camera = new PerspectiveCamera(38, aspect, 0.1, 100);
      camera.position.set(0, 0, 6.2);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
      camera.updateProjectionMatrix();
      const r = fitRadius(aspect, 38, 6.2);
      const model = new Group();
      model.add(new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial()));
      // Caja inscrita en la esfera de radio r: sus esquinas son los puntos más alejados.
      model.scale.setScalar((2 * r) / Math.sqrt(3));
      model.updateWorldMatrix(true, true);
      const box = localBounds(model);
      expect(box.getBoundingSphere(new Sphere()).radius * model.scale.x).toBeCloseTo(r, 5);
      const used = maxNdc(box, model.matrixWorld, camera);
      expect(used, `${width}×${height}`).toBeLessThanOrEqual(1);
      expect(used, `${width}×${height}`).toBeGreaterThan(0.5);
    }
    // En una pantalla estrecha manda el ancho: el radio es menor que en una apaisada.
    expect(fitRadius(390 / 844, 38, 6.2)).toBeLessThan(fitRadius(1366 / 768, 38, 6.2) * 0.6);
  });
});

describe('superficies abiertas de los modelos', () => {
  it('la copia girada de un plato mira hacia el otro lado', () => {
    const profile = Array.from({ length: 11 }, (_, i) => new Vector2(i * 0.04, i * i * 0.0007));
    const dish = new LatheGeometry(profile, 12);
    const back = flippedFaces(dish);
    expect(firstFaceNormal(back).dot(firstFaceNormal(dish))).toBeCloseTo(-1, 5);
    const n = dish.getAttribute('normal');
    const nb = back.getAttribute('normal');
    expect(nb.getY(7)).toBeCloseTo(-n.getY(7), 6);
    expect(nb.getX(7)).toBeCloseTo(-n.getX(7), 6);
    // La geometría original no se toca: la comparten otras piezas.
    expect(dish.getIndex()!.getX(0)).not.toBe(back.getIndex()!.getX(0));
  });
});
