import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const requiredDistFiles = [
  'dist/index.js',
  'dist/index.cjs',
  'dist/index.d.ts',
  'dist/style.css',
]

await Promise.all(
  requiredDistFiles.map(async (relativePath) => {
    const absolutePath = path.join(rootDir, relativePath)
    await access(absolutePath)
  }),
)

const verifyScripts = [
  'scripts/validate-contracts.mjs',
  'scripts/verify-esm-consumer.mjs',
  'scripts/verify-cjs-consumer.mjs',
]

for (const relativeScriptPath of verifyScripts) {
  const scriptPath = path.join(rootDir, relativeScriptPath)
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: rootDir,
    encoding: 'utf8',
  })

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
    throw new Error(`검증 실패: ${relativeScriptPath}\n${details}`)
  }
}

assert.equal(requiredDistFiles.length, 4)
console.log('패키지 검증 통과: dist 산출물 + 계약 검증 + ESM/CJS smoke')
