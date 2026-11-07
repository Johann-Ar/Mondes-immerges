// Vérifie que chaque fichier local référencé par les pages du build existe dans dist/.
// Usage : npm run build && node scripts/check-links.mjs
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const BASE = '/Mondes-immerges/';
const pages = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p); else if (/\.(html|css|js)$/.test(e.name)) pages.push(p);
});
walk(DIST);

const REF = /(?:src|href|data-src|poster)="([^"#?]+)"|url\(['"]?([^'")#?]+)['"]?\)|['"`]((?:\.\.\/|\.\/)?(?:images|videos|js|css|fonts)\/[^'"`$]+\.[a-z0-9]{2,5})['"`]/g;
let missing = 0;
for (const file of pages) {
  const text = fs.readFileSync(file, 'utf8');
  // Les JS partagés de dist/assets sont résolus depuis la page qui les charge : on les ignore.
  if (file.includes(`${path.sep}assets${path.sep}`) && file.endsWith('.js')) continue;
  const dir = path.dirname(file);
  for (const m of text.matchAll(REF)) {
    const ref = m[1] || m[2] || m[3];
    if (/^(https?:|data:|mailto:|javascript:|\/\/)/.test(ref) || ref.includes('${')) continue;
    let target;
    if (ref.startsWith(BASE)) target = path.join(DIST, ref.slice(BASE.length));
    else if (ref.startsWith('/')) { console.log(`✗ ${path.relative(DIST, file)} : chemin absolu sans base ${ref}`); missing++; continue; }
    else {
      // Les JS des récits résolvent leurs chemins depuis la page HTML, pas depuis js/
      const from = file.endsWith('.js') ? path.dirname(dir) : file.endsWith('.css') && dir === path.join(DIST, 'assets') ? DIST : dir;
      target = path.join(from, ref);
    }
    if (fs.existsSync(target) && fs.statSync(target).isFile()) continue;
    if (fs.existsSync(path.join(target, 'index.html'))) continue;
    console.log(`✗ ${path.relative(DIST, file)} → ${ref}`);
    missing++;
  }
}
console.log(missing ? `\n${missing} référence(s) cassée(s)` : '✓ Toutes les références locales existent');
process.exit(missing ? 1 : 0);
