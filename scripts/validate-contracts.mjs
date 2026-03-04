import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rootPackagePath = path.join(rootDir, 'package.json')
const distTypePath = path.join(rootDir, 'dist/index.d.ts')

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

const expectedPeerRange = '^18.3 || ^19'

const formatHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: () => rootDir,
  getNewLine: () => '\n',
}

const hasExpectedMajor = (range, major) =>
  typeof range === 'string' && new RegExp(`^(?:\\^|~)?${major}(?:\\.|$)`).test(range.trim())

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))

const formatDiagnostics = (diagnostics) =>
  ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost)

const validateFixtureTypeContract = (entryPath, fixtureName) => {
  const relativeEntryPath = path.relative(rootDir, entryPath).replaceAll('\\', '/')
  const parsedConfig = ts.parseJsonConfigFileContent(
    {
      compilerOptions: {
        noEmit: true,
        strict: true,
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        jsx: 'react-jsx',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        skipLibCheck: true,
        types: ['react', 'react-dom', 'vite/client', 'node'],
        baseUrl: '.',
        paths: {
          'compsable-search': ['./dist/index.d.ts'],
        },
      },
      files: [relativeEntryPath],
    },
    ts.sys,
    rootDir,
  )

  const configErrors = parsedConfig.errors.filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  )

  if (configErrors.length > 0) {
    throw new Error(
      `${fixtureName} tsconfig 파싱 실패\n${formatDiagnostics(configErrors).trim()}`,
    )
  }

  const program = ts.createProgram({
    rootNames: parsedConfig.fileNames,
    options: parsedConfig.options,
  })
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)

  if (diagnostics.length > 0) {
    throw new Error(
      `${fixtureName} 타입 계약 검증 실패\n${formatDiagnostics(diagnostics).trim()}`,
    )
  }
}

await access(distTypePath)

const packageJson = await readJson(rootPackagePath)
assert.equal(
  packageJson.peerDependencies?.react,
  expectedPeerRange,
  `peerDependencies.react는 "${expectedPeerRange}"여야 합니다.`,
)
assert.equal(
  packageJson.peerDependencies?.['react-dom'],
  expectedPeerRange,
  `peerDependencies.react-dom은 "${expectedPeerRange}"여야 합니다.`,
)

for (const fixture of reactConsumerFixtures) {
  await Promise.all([access(fixture.packagePath), access(fixture.entryPath)])

  const fixturePackageJson = await readJson(fixture.packagePath)
  const reactRange =
    fixturePackageJson.dependencies?.react ?? fixturePackageJson.devDependencies?.react
  const reactDomRange =
    fixturePackageJson.dependencies?.['react-dom'] ??
    fixturePackageJson.devDependencies?.['react-dom']

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

  const fixtureEntrySource = await readFile(fixture.entryPath, 'utf8')
  assert.match(fixtureEntrySource, /from ['"]compsable-search['"]/)
  assert.match(fixtureEntrySource, /['"]compsable-search\/style\.css['"]/)
  assert.match(fixtureEntrySource, /import type\s+\{[^}]*SelectorPlugin[^}]*\}/s)

  validateFixtureTypeContract(fixture.entryPath, fixture.name)
}

console.log('계약 검증 통과: peerDependencies + React 18/19 fixture + d.ts 소비')
