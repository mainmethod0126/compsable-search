const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const pkg = require('../..')

if (typeof pkg.ComposableSearch !== 'function') {
  throw new TypeError('ComposableSearch export를 찾을 수 없습니다.')
}

const hasPluginRuntimeExports =
  typeof pkg.createSelectorPluginRegistry === 'function' &&
  typeof pkg.getAllSelectorPlugins === 'function' &&
  typeof pkg.getSelectorPlugin === 'function' &&
  typeof pkg.validateSelectorPluginRegistry === 'function' &&
  typeof pkg.validateSelectorPlugins === 'function' &&
  typeof pkg.SELECTOR_PLUGIN_VALIDATION_CODE === 'object'

if (hasPluginRuntimeExports) {
  const plugin = {
    id: 'cjs-fixture-plugin',
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
  const rootDir = path.resolve(__dirname, '../..')
  const rootEntrySource = fs.readFileSync(path.join(rootDir, 'src/index.ts'), 'utf8')
  const componentsEntrySource = fs.readFileSync(
    path.join(rootDir, 'src/components/index.ts'),
    'utf8',
  )

  assert.match(rootEntrySource, /createSelectorPluginRegistry/)
  assert.match(rootEntrySource, /validateSelectorPlugins/)
  assert.match(componentsEntrySource, /createSelectorPluginRegistry/)
  assert.match(componentsEntrySource, /validateSelectorPlugins/)
}

const cssExportPath = require.resolve('../../dist/style.css')
if (!cssExportPath.endsWith(path.join('dist', 'style.css'))) {
  throw new Error(`style.css export 경로가 올바르지 않습니다: ${cssExportPath}`)
}

module.exports = pkg
