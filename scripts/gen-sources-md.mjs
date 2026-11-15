// Genera SOURCES.md a partir de src/data/sources.ts (Node 22.6+ con eliminación de tipos).
import { writeFile } from 'node:fs/promises';
const { SOURCES } = await import('../src/data/sources.ts');
const rows = SOURCES.map((s) => `| \`${s.id}\` | ${s.title} | ${s.publisher} | ${s.url} | ${s.accessed} |`);
const md = `# Sources

Every number, date, name and coordinate shown in LAST SIGNAL comes from \`src/data/\` and links to one of these sources.
This file is generated from \`src/data/sources.ts\` (\`node scripts/gen-sources-md.mjs\`); a data test checks that both stay in sync.
Light times and Pioneer distances are calculated estimates made by this website from the orbital data listed here.

| id | Title | Publisher | URL | Accessed |
| --- | --- | --- | --- | --- |
${rows.join('\n')}
`;
await writeFile(new URL('../SOURCES.md', import.meta.url), md);
console.log(`SOURCES.md: ${SOURCES.length} fuentes`);
