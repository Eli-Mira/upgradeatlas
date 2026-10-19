import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => readFileSync(join(root, relative), 'utf8');

test('the document entry mounts the React application', () => {
  const html = read('index.html');
  assert.match(html, /<div id="root">/);
  assert.match(html, /src="\/src\/main\.tsx"/);
});

test('the mounted entry chain is intact', () => {
  const main = read('src/main.tsx');
  assert.match(main, /createRoot\(document\.getElementById\('root'\)/);
  assert.match(main, /from '\.\/App'/);
  assert.match(main, /import '\.\/index\.css'/);
  assert.ok(existsSync(join(root, 'src/App.tsx')));
  assert.ok(existsSync(join(root, 'src/index.css')));
});

test('the retired legacy frontend is not referenced anywhere', () => {
  // The retired tree was the pre-archive React app: App.jsx / main.jsx / lib/.
  // The current app owns src/index.css, src/pages/ and src/components/, so
  // only the legacy shapes are forbidden here.
  const retired = ['src/App.jsx', 'src/main.jsx', 'src/lib/'];
  for (const file of retired) {
    assert.equal(existsSync(join(root, file)), false, `${file} must not be back`);
  }
  const sources = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(tsx?|jsx?)$/.test(entry.name)) sources.push(full);
    }
  };
  walk(join(root, 'src'));
  for (const file of sources) {
    const text = readFileSync(file, 'utf8');
    assert.doesNotMatch(text, /from '\.\/lib\//, `${file} imports a retired lib tree`);
  }
});

test('the design system tokens are present in the stylesheet', () => {
  const css = read('src/index.css');
  for (const token of [
    '--atlas-bg',
    '--atlas-surface',
    '--atlas-raised',
    '--atlas-ink',
    '--atlas-line',
    '--atlas-red',
    '--atlas-mono',
    '--atlas-display',
  ]) {
    assert.ok(css.includes(`${token}:`), `missing token ${token}`);
  }
});

test('the research profiles are unique and complete', async () => {
  const { profiles } = await import('../src/data/profiles.ts').catch(() => ({
    profiles: null,
  }));
  if (!profiles) {
    // TypeScript source: read the literals instead of importing them.
    const source = read('src/data/profiles.ts');
    const slugs = [...source.matchAll(/slug: '([^']+)'/g)].map((m) => m[1]);
    assert.equal(slugs.length, 4);
    assert.equal(new Set(slugs).size, slugs.length, 'profile slugs must be unique');
    return;
  }
  assert.equal(new Set(profiles.map((p) => p.slug)).size, profiles.length);
  for (const profile of profiles) {
    assert.ok(profile.name && profile.processor && profile.graphics);
    assert.ok(['exact', 'family'].includes(profile.confidence));
  }
});
