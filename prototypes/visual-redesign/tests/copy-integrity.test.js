import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => readFileSync(join(root, relative), 'utf8');

/** Every `c.<group>.<key>` referenced in the source must exist in the copy file. */
function referencedKeys() {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(full);
    }
  };
  walk(join(root, 'src'));

  const keys = new Set();
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(/\bc\.([a-z]+)\.([a-zA-Z]+)/g)) {
      keys.add(`${match[1]}.${match[2]}`);
    }
  }
  return keys;
}

test('every referenced copy key exists in both locales', async () => {
  const source = read('src/data/copy.ts');
  const keys = referencedKeys();
  assert.ok(keys.size > 20, 'expected the source to reference a meaningful number of copy keys');

  // Split the copy object into its two locale sections.
  const arStart = source.indexOf('\n  ar: {');
  assert.ok(arStart > 0, 'could not find the ar locale section');
  const locales = {
    en: source.slice(0, arStart),
    ar: source.slice(arStart),
  };

  for (const key of keys) {
    const [group, name] = key.split('.');
    for (const [locale, blob] of Object.entries(locales)) {
      const groupStart = blob.search(new RegExp(`^\\s{4}${group}:\\s*\\{`, 'm'));
      assert.ok(groupStart >= 0, `copy group ${group} not found in the ${locale} locale`);
      const rest = blob.slice(groupStart);
      const nextGroup = rest.slice(1).search(/^\s{4}[a-zA-Z]+:\s*\{/m);
      const groupBlock = nextGroup >= 0 ? rest.slice(0, nextGroup + 1) : rest;
      assert.ok(
        new RegExp(`^\\s+${name}:`, 'm').test(groupBlock),
        `copy key ${key} is missing in the ${locale} locale`,
      );
    }
  }
});

test('the copy file has no leftover placeholder markers', () => {
  const source = read('src/data/copy.ts');
  for (const marker of ['TODO', 'FIXME', 'Lorem', 'undefined']) {
    assert.doesNotMatch(source, new RegExp(marker), `copy contains ${marker}`);
  }
});

test('the four research profiles expose every field the pages read', () => {
  const source = read('src/data/profiles.ts');
  for (const field of [
    'slug',
    'name',
    'brand',
    'brandName',
    'partNumber',
    'sku',
    'confidence',
    'processor',
    'graphics',
    'memory',
    'storage',
  ]) {
    assert.ok(new RegExp(`${field}:`).test(source), `profile field ${field} missing`);
  }
  assert.equal((source.match(/slug: '/g) || []).length, 4);
});

test('the mounted entry exposes the comparison provider', () => {
  const main = read('src/main.tsx');
  assert.match(main, /CompareProvider/);
  assert.match(main, /BrowserRouter/);
  assert.ok(existsSync(join(root, 'src/data/compare.tsx')));
});
