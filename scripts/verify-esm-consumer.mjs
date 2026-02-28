import assert from 'node:assert/strict'
import { access } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const fixturePackagePath = path.join(rootDir, 'fixtures/esm-consumer/package.json')
const fixtureEntryPath = path.join(rootDir, 'fixtures/esm-consumer/src/main.tsx')

await Promise.all([access(fixturePackagePath), access(fixtureEntryPath)])

const pkg = await import('compsable-search')
assert.equal(typeof pkg.ComposableSearch, 'function')
assert.equal(typeof pkg.createRegionSelector, 'function')
assert.equal(typeof pkg.createKeywordSelector, 'function')

const require = createRequire(import.meta.url)
const cssExportPath = require.resolve('compsable-search/style.css')
assert.ok(cssExportPath.endsWith(path.join('dist', 'style.css')))

console.log('ESM 소비자 smoke 통과')
