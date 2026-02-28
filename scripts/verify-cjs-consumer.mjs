import { spawnSync } from 'node:child_process'
import { access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const fixturePackagePath = path.join(rootDir, 'fixtures/cjs-consumer/package.json')
const fixtureEntryPath = path.join(rootDir, 'fixtures/cjs-consumer/index.cjs')

await Promise.all([access(fixturePackagePath), access(fixtureEntryPath)])

const result = spawnSync(process.execPath, [fixtureEntryPath], {
  cwd: rootDir,
  encoding: 'utf8',
})

if (result.status !== 0) {
  const details = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
  throw new Error(`CJS 소비자 smoke 실패\n${details}`)
}

console.log('CJS 소비자 smoke 통과')
