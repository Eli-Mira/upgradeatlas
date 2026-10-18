import test from 'node:test'
import assert from 'node:assert/strict'
import {existsSync, readFileSync, readdirSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const sourceFiles = [
  'prototype-calc.js', 'prototype-calculator.jsx', 'prototype-catalog.jsx',
  'prototype-data.js', 'prototype-home.jsx', 'prototype-ui.jsx', 'prototype.css', 'prototype.jsx',
]

test('HTML mounts the sole authoritative prototype source tree', () => {
  const html = readFileSync(path.join(root, 'index.html'), 'utf8')
  const entries = [...html.matchAll(/<script\b[^>]*type="module"[^>]*src="([^"]+)"/g)].map(match => match[1])
  assert.deepEqual(entries, ['/src/prototype.jsx'])
  assert.deepEqual(readdirSync(path.join(root, 'src')).sort(), sourceFiles.sort())
})

test('retired frontend source and misleading self-report stay out of the working tree', () => {
  for (const retired of ['src/App.jsx', 'src/main.jsx', 'src/index.css', 'src/pages', 'src/components', 'src/lib', 'evidence/implementation.md']) {
    assert.equal(existsSync(path.join(root, retired)), false, `${retired} must remain Git-only`)
  }
})

test('the mounted static/dynamic import graph and local asset URLs resolve without retired files', () => {
  const seen = new Set()
  const pending = [path.join(root, 'src/prototype.jsx')]
  // shortcut: handles the current literal import syntax, use an AST parser if computed imports are introduced.
  const imports = /(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)(['"])([^'"]+)\1/g
  const assets = /new URL\(\s*(['"])([^'"]+)\1\s*,\s*import\.meta\.url\s*\)/g
  while (pending.length) {
    const file = pending.pop()
    if (seen.has(file)) continue
    seen.add(file)
    assert.ok(existsSync(file), `Missing import: ${file}`)
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(imports)) {
      const specifier = match[2]
      if (!specifier.startsWith('.')) continue
      const resolved = path.resolve(path.dirname(file), specifier)
      assert.ok(existsSync(resolved), `${file} imports missing ${specifier}`)
      if (resolved.startsWith(path.join(root, 'src') + path.sep)) {
        assert.ok(sourceFiles.includes(path.basename(resolved)), `Non-authoritative source: ${resolved}`)
      }
      if (/\.(js|jsx|css)$/.test(resolved)) pending.push(resolved)
    }
    for (const match of text.matchAll(assets)) {
      assert.ok(existsSync(path.resolve(path.dirname(file), match[2])), `Missing asset: ${match[2]}`)
    }
  }
  assert.ok(seen.has(path.join(root, 'motion/studio.js')), 'Include the on-demand studio import')
  assert.ok(seen.has(path.resolve(root, '../../apps/web/src/costValidation.js')), 'Keep the shared validator dependency')
})
