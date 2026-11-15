import { createRng } from './rng';

/** Utilidades para generar imágenes en el navegador (Parte 14.8). Nada se sube a ningún servidor. */
export function makeCanvas(
  w: number,
  h: number,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  return ctx ? { canvas, ctx } : null;
}

/** Fondo --void con estrellas de semilla fija (la misma persona siempre obtiene el mismo cielo). */
export function paintStars(ctx: CanvasRenderingContext2D, w: number, h: number, seed = 1966): void {
  ctx.fillStyle = '#05060a';
  ctx.fillRect(0, 0, w, h);
  const r = createRng(seed);
  for (let i = 0; i < (w * h) / 900; i++) {
    const s = r() ** 4 * 1.8 + 0.3;
    ctx.globalAlpha = 0.25 + r() * 0.7;
    ctx.fillStyle = r() > 0.85 ? '#ffd9a0' : '#e8eef7';
    ctx.beginPath();
    ctx.arc(r() * w, r() * h, s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Carga un SVG del DOM como imagen (data URI); las fuentes del documento no se ven dentro. */
export function svgToImage(svg: SVGSVGElement): Promise<HTMLImageElement> {
  const xml = new XMLSerializer().serializeToString(svg);
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  return loadImage(src);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image'));
    img.src = src;
  });
}

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** canvas.toBlob → URL temporal → descarga; libera la URL después. */
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve();
    }, 'image/png');
  });
}
