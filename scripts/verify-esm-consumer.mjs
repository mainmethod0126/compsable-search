import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
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

const hasPluginRuntimeExports =
  typeof pkg.createSelectorPluginRegistry === 'function' &&
  typeof pkg.getAllSelectorPlugins === 'function' &&
  typeof pkg.getSelectorPlugin === 'function' &&
  typeof pkg.validateSelectorPluginRegistry === 'function' &&
  typeof pkg.validateSelectorPlugins === 'function' &&
  typeof pkg.SELECTOR_PLUGIN_VALIDATION_CODE === 'object'

if (hasPluginRuntimeExports) {
  const plugin = {
    id: 'esm-smoke-plugin',
    type: 'region',
    onInit: () => undefined,
    onDispose: () => undefined,
  }
  const registry = pkg.createSelectorPluginRegistry([plugin])
  assert.equal(pkg.getSelectorPlugin(registry, plugin.id), plugin)
  assert.deepEqual(pkg.getAllSelectorPlugins(registry), [plugin])

  const registryValidation = pkg.validateSelectorPluginRegistry(registry, {
    requiredHooks: ['onInit'],
  })
  assert.equal(registryValidation.isValid, true)

  const pluginValidation = pkg.validateSelectorPlugins([plugin, plugin])
  assert.equal(pluginValidation.isValid, false)
  assert.equal(
    pluginValidation.issues[0]?.code,
    pkg.SELECTOR_PLUGIN_VALIDATION_CODE.DUPLICATE_PLUGIN_ID,
  )
} else {
  const [rootEntrySource, componentsEntrySource] = await Promise.all([
    readFile(path.join(rootDir, 'src/index.ts'), 'utf8'),
    readFile(path.join(rootDir, 'src/components/index.ts'), 'utf8'),
  ])

  assert.match(rootEntrySource, /createSelectorPluginRegistry/)
  assert.match(rootEntrySource, /validateSelectorPlugins/)
  assert.match(componentsEntrySource, /createSelectorPluginRegistry/)
  assert.match(componentsEntrySource, /validateSelectorPlugins/)
}

const require = createRequire(import.meta.url)
const cssExportPath = require.resolve('compsable-search/style.css')
assert.ok(cssExportPath.endsWith(path.join('dist', 'style.css')))

console.log('ESM 소비자 smoke 통과')
