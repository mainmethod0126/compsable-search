import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const fixturePackagePath = path.join(rootDir, 'fixtures/esm-consumer/package.json')
const fixtureEntryPath = path.join(rootDir, 'fixtures/esm-consumer/src/main.tsx')
const reactConsumerFixtures = [
  {
    name: 'react18-consumer',
    major: '18',
    packagePath: path.join(rootDir, 'fixtures/react18-consumer/package.json'),
    entryPath: path.join(rootDir, 'fixtures/react18-consumer/src/main.tsx'),
  },
  {
    name: 'react19-consumer',
    major: '19',
    packagePath: path.join(rootDir, 'fixtures/react19-consumer/package.json'),
    entryPath: path.join(rootDir, 'fixtures/react19-consumer/src/main.tsx'),
  },
]

await Promise.all([
  access(fixturePackagePath),
  access(fixtureEntryPath),
  ...reactConsumerFixtures.flatMap((fixture) => [
    access(fixture.packagePath),
    access(fixture.entryPath),
  ]),
])

const hasExpectedMajor = (range, major) =>
  typeof range === 'string' && new RegExp(`^(?:\\^|~)?${major}(?:\\.|$)`).test(range.trim())

for (const fixture of reactConsumerFixtures) {
  const fixturePackage = JSON.parse(await readFile(fixture.packagePath, 'utf8'))
  const reactRange = fixturePackage.dependencies?.react ?? fixturePackage.devDependencies?.react
  const reactDomRange =
    fixturePackage.dependencies?.['react-dom'] ?? fixturePackage.devDependencies?.['react-dom']
  assert.ok(reactRange, `${fixture.name} fixture에 react 버전이 정의되어야 합니다.`)
  assert.ok(reactDomRange, `${fixture.name} fixture에 react-dom 버전이 정의되어야 합니다.`)
  assert.ok(
    hasExpectedMajor(reactRange, fixture.major),
    `${fixture.name} fixture react 버전은 ${fixture.major} 메이저여야 합니다: ${reactRange}`,
  )
  assert.ok(
    hasExpectedMajor(reactDomRange, fixture.major),
    `${fixture.name} fixture react-dom 버전은 ${fixture.major} 메이저여야 합니다: ${reactDomRange}`,
  )

  const entrySource = await readFile(fixture.entryPath, 'utf8')
  assert.match(entrySource, /from ['"]compsable-search['"]/)
  assert.match(entrySource, /['"]compsable-search\/style\.css['"]/)
}

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

console.log('ESM 소비자 smoke 통과 (React 18/19 fixture 계약 포함)')
