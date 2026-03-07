import { spawnSync } from 'node:child_process'
import { listWorkspaces, rootDir } from './workspace-utils.mjs'

const scriptName = process.argv[2]

if (!scriptName) {
  throw new Error('사용법: node ./scripts/run-workspaces.mjs <script-name>')
}

const workspaces = await listWorkspaces()

for (const workspace of workspaces) {
  const hasScript =
    workspace.manifest.scripts &&
    typeof workspace.manifest.scripts === 'object' &&
    typeof workspace.manifest.scripts[scriptName] === 'string'

  if (!hasScript) {
    continue
  }

  const result = spawnSync(
    'npm',
    ['run', scriptName, '--workspace', workspace.name, '--if-present'],
    {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: 'inherit',
      shell: true,
    },
  )

  if (result.status !== 0) {
    throw new Error(
      `workspace script 실패: ${workspace.name} -> ${scriptName} (exit ${result.status ?? 'unknown'})`,
    )
  }
}

console.log(`workspace script 통과: ${scriptName}`)
