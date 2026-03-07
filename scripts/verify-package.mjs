import { access } from 'node:fs/promises'
import assert from 'node:assert/strict'
import path from 'node:path'
import {
  collectExportKinds,
  listPublishableWorkspaces,
  normalizeRelativePath,
} from './workspace-utils.mjs'

const publishableWorkspaces = await listPublishableWorkspaces()

assert.ok(publishableWorkspaces.length > 0, '검증할 publishable workspace가 필요합니다.')

for (const workspace of publishableWorkspaces) {
  const { dir, manifest, name } = workspace
  const exportKinds = collectExportKinds(manifest)

  assert.ok(exportKinds.esm.length > 0, `${name}: ESM export가 필요합니다.`)
  assert.ok(exportKinds.cjs.length > 0, `${name}: CJS export가 필요합니다.`)
  assert.ok(exportKinds.types.length > 0, `${name}: d.ts export가 필요합니다.`)

  if (name === '@compsable-search/react') {
    assert.ok(exportKinds.styles.length > 0, `${name}: style.css export가 필요합니다.`)
  }

  const requiredFiles = [
    ...exportKinds.esm,
    ...exportKinds.cjs,
    ...exportKinds.types,
    ...exportKinds.styles,
  ]

  await Promise.all(
    requiredFiles.map(async (relativePath) => {
      const normalizedPath = normalizeRelativePath(relativePath)
      await access(path.join(dir, normalizedPath))
    }),
  )
}

console.log(`workspace export smoke 통과: ${publishableWorkspaces.length}개 package`)
