import assert from 'node:assert/strict'
import {
  collectExportKinds,
  collectExportTargets,
  listPublishableWorkspaces,
  listWorkspaces,
  normalizeRelativePath,
  readJson,
  rootDir,
} from './workspace-utils.mjs'

const rootPackageJson = await readJson(`${rootDir}/package.json`)

assert.equal(rootPackageJson.private, true, '루트 저장소는 private workspace여야 합니다.')
assert.deepEqual(
  rootPackageJson.workspaces,
  ['packages/*', 'apps/*'],
  '루트 workspace 패턴은 packages/*, apps/* 여야 합니다.',
)

const workspaces = await listWorkspaces()
assert.ok(workspaces.length > 0, 'workspace가 하나 이상 필요합니다.')

const demoWorkspace = workspaces.find((workspace) => workspace.name === '@compsable-search/demo')
assert.ok(demoWorkspace, 'apps/demo workspace가 필요합니다.')
assert.equal(demoWorkspace.private, true, '@compsable-search/demo는 private app이어야 합니다.')

for (const workspace of workspaces) {
  const { manifest, name } = workspace

  for (const scriptName of ['build', 'lint', 'test', 'typecheck']) {
    assert.equal(
      typeof manifest.scripts?.[scriptName],
      'string',
      `${name}: ${scriptName} script가 필요합니다.`,
    )
  }
}

const publishableWorkspaces = await listPublishableWorkspaces()

assert.ok(publishableWorkspaces.length > 0, 'publishable workspace가 하나 이상 필요합니다.')

for (const workspace of publishableWorkspaces) {
  const { manifest, name } = workspace

  assert.equal(typeof manifest.name, 'string', `${name}: package name이 필요합니다.`)
  assert.equal(typeof manifest.main, 'string', `${name}: main 필드가 필요합니다.`)
  assert.equal(typeof manifest.module, 'string', `${name}: module 필드가 필요합니다.`)
  assert.equal(typeof manifest.types, 'string', `${name}: types 필드가 필요합니다.`)
  const targets = collectExportTargets(manifest).map(normalizeRelativePath)
  assert.ok(targets.length > 0, `${name}: export target이 하나 이상 필요합니다.`)
  const buildTargets = targets.filter((target) => target !== 'package.json')
  assert.ok(
    buildTargets.every((target) => target.startsWith('dist/')),
    `${name}: 모든 export target은 dist/ 아래여야 합니다.`,
  )

  if (name === '@compsable-search/react') {
    const exportKinds = collectExportKinds(manifest)
    assert.ok(exportKinds.styles.length > 0, `${name}: style.css export가 필요합니다.`)
  }
}

console.log(
  `workspace 계약 검증 통과: 전체 ${workspaces.length}개 workspace / publishable ${publishableWorkspaces.length}개 package`,
)
