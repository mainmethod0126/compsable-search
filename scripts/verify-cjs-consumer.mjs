import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { access, readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const fixturePackagePath = path.join(rootDir, 'fixtures/cjs-consumer/package.json')
const fixtureEntryPath = path.join(rootDir, 'fixtures/cjs-consumer/index.cjs')
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

const require = createRequire(import.meta.url)
const pkg = require('compsable-search')

const hasPluginRuntimeExports =
  typeof pkg.createSelectorPluginRegistry === 'function' &&
  typeof pkg.getAllSelectorPlugins === 'function' &&
  typeof pkg.getSelectorPlugin === 'function' &&
  typeof pkg.validateSelectorPluginRegistry === 'function' &&
  typeof pkg.validateSelectorPlugins === 'function' &&
  typeof pkg.SELECTOR_PLUGIN_VALIDATION_CODE === 'object'

if (hasPluginRuntimeExports) {
  const plugin = {
    id: 'cjs-smoke-plugin',
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

const result = spawnSync(process.execPath, [fixtureEntryPath], {
  cwd: rootDir,
  encoding: 'utf8',
})

if (result.status !== 0) {
  const details = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
  throw new Error(`CJS 소비자 smoke 실패\n${details}`)
}

console.log('CJS 소비자 smoke 통과 (React 18/19 fixture 계약 포함)')
