import assert from 'node:assert/strict'
import { access, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import {
  collectExportTargets,
  listPublishableWorkspaces,
  normalizeRelativePath,
  rootDir,
} from './workspace-utils.mjs'

const packOutputDir = path.join(rootDir, 'node_modules', '.tmp', 'workspace-packs')

const publishableWorkspaces = await listPublishableWorkspaces()
assert.ok(publishableWorkspaces.length > 0, 'pack 대상 publishable workspace가 필요합니다.')

await rm(packOutputDir, { force: true, recursive: true })
await mkdir(packOutputDir, { recursive: true })

for (const workspace of publishableWorkspaces) {
  const packResult = spawnSync(
    'npm',
    [
      'pack',
      '--workspace',
      workspace.name,
      '--pack-destination',
      packOutputDir,
      '--json',
    ],
    {
      cwd: rootDir,
      encoding: 'utf8',
      shell: true,
    },
  )

  if (packResult.status !== 0) {
    const details = [packResult.stdout, packResult.stderr].filter(Boolean).join('\n').trim()
    throw new Error(`npm pack 실패: ${workspace.name}\n${details}`)
  }

  const packReport = JSON.parse(packResult.stdout)
  const tarball = Array.isArray(packReport) ? packReport[0] : packReport
  assert.ok(tarball?.filename, `${workspace.name}: pack 결과에 filename이 필요합니다.`)

  const tarballPath = path.join(packOutputDir, tarball.filename)
  await access(tarballPath)

  const packedFiles = new Set(
    (tarball.files ?? []).map((file) => normalizeRelativePath(file.path)),
  )
  const exportTargets = collectExportTargets(workspace.manifest).map(normalizeRelativePath)

  for (const target of exportTargets) {
    assert.ok(
      packedFiles.has(target),
      `${workspace.name}: tarball에 export target이 누락되었습니다 -> ${target}`,
    )
  }
}

console.log(
  `workspace pack smoke 통과: ${publishableWorkspaces.length}개 package -> ${packOutputDir}`,
)
