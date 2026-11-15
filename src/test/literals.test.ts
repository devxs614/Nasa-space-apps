import { describe, expect, it } from 'vitest';
import ts from 'typescript';

// Parte 19.4: ningún texto visible escrito a mano en JSX dentro de componentes y rutas; todo pasa por i18n.
const files = import.meta.glob<string>(['../components/**/*.tsx', '../routes/**/*.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** Unidades y símbolos que no se traducen. */
const ALLOWED = new Set(['UTC', 'rpm', 'km/h', 'km', 'm', 's', 'Hz', 'W', '%']);
const ATTRS = new Set(['aria-label', 'aria-description', 'title', 'alt', 'placeholder', 'label']);

function literals(name: string, source: string): string[] {
  const sf = ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found: string[] = [];
  const visit = (n: ts.Node) => {
    if (ts.isJsxText(n)) {
      const text = n.text.trim();
      const bare = text.replace(/^[\s()·,.:]+|[\s()·,.:]+$/g, '');
      if (/\p{L}/u.test(text) && !ALLOWED.has(bare)) found.push(text);
    } else if (
      ts.isJsxAttribute(n) &&
      ATTRS.has(n.name.getText(sf)) &&
      n.initializer &&
      ts.isStringLiteral(n.initializer) &&
      /\p{L}/u.test(n.initializer.text)
    ) {
      found.push(`${n.name.getText(sf)}="${n.initializer.text}"`);
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return found;
}

describe('cadenas literales en JSX', () => {
  it('hay archivos que revisar', () => {
    expect(Object.keys(files).length).toBeGreaterThan(40);
  });

  it('componentes y rutas no escriben texto visible sin traducir', () => {
    const hits = Object.entries(files).flatMap(([name, src]) =>
      literals(name, src).map((t) => `${name.replace('../', 'src/')}: ${t}`),
    );
    expect(hits).toEqual([]);
  });
});
