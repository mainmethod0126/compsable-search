import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'))
}

function resolveWorkspaceRoot(baseDir, workspacePattern) {
  const trimmedPattern = workspacePattern.replaceAll('\\', '/')
  assert.ok(
    trimmedPattern.endsWith('/*'),
    `지원하지 않는 workspace 패턴입니다: ${workspacePattern}`,
  )

  return path.resolve(baseDir, trimmedPattern.slice(0, -2))
}

export async function listWorkspaces() {
  const rootPackageJson = await readJson(path.join(rootDir, 'package.json'))
  const workspacePatterns =
    Array.isArray(rootPackageJson.workspaces)
      ? rootPackageJson.workspaces
      : rootPackageJson.workspaces?.packages ?? []

  const workspaces = []

  for (const pattern of workspacePatterns) {
    const workspaceRoot = resolveWorkspaceRoot(rootDir, pattern)
    const entries = await readdir(workspaceRoot, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue
      }

      const dir = path.join(workspaceRoot, entry.name)
      const manifestPath = path.join(dir, 'package.json')

      try {
        const manifest = await readJson(manifestPath)
        workspaces.push({
          dir,
          manifest,
          manifestPath,
          name: manifest.name,
          private: manifest.private === true,
          pattern,
        })
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
          continue
        }

        throw error
      }
    }
  }

  return workspaces.sort((left, right) => {
    if (left.pattern === right.pattern) {
      return left.name.localeCompare(right.name)
    }

    return workspacePatterns.indexOf(left.pattern) - workspacePatterns.indexOf(right.pattern)
  })
}

export async function listPublishableWorkspaces() {
  const workspaces = await listWorkspaces()
  return workspaces.filter((workspace) => workspace.private !== true)
}

function collectExportTargetsRecursive(exportValue, targets) {
  if (typeof exportValue === 'string') {
    targets.add(exportValue)
    return
  }

  if (exportValue && typeof exportValue === 'object') {
    for (const nestedValue of Object.values(exportValue)) {
      collectExportTargetsRecursive(nestedValue, targets)
    }
  }
}

export function collectExportTargets(manifest) {
  const targets = new Set()

  if (typeof manifest.main === 'string') {
    targets.add(manifest.main)
  }

  if (typeof manifest.module === 'string') {
    targets.add(manifest.module)
  }

  if (typeof manifest.types === 'string') {
    targets.add(manifest.types)
  }

  collectExportTargetsRecursive(manifest.exports, targets)
  return [...targets]
}

export function normalizeRelativePath(relativePath) {
  return relativePath.replace(/^\.\//, '').replaceAll('\\', '/')
}

export function collectExportKinds(manifest) {
  const esm = new Set()
  const cjs = new Set()
  const types = new Set()
  const styles = new Set()

  if (typeof manifest.module === 'string') {
    esm.add(manifest.module)
  }

  if (typeof manifest.main === 'string') {
    cjs.add(manifest.main)
  }

  if (typeof manifest.types === 'string') {
    types.add(manifest.types)
  }

  const visit = (value, keyHint = '') => {
    if (typeof value === 'string') {
      if (keyHint === 'import' || keyHint === 'default') {
        esm.add(value)
      } else if (keyHint === 'require') {
        cjs.add(value)
      } else if (keyHint === 'types') {
        types.add(value)
      } else if (value.endsWith('.css')) {
        styles.add(value)
      }

      return
    }

    if (value && typeof value === 'object') {
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        visit(nestedValue, nestedKey)
      }
    }
  }

  visit(manifest.exports)

  return {
    esm: [...esm],
    cjs: [...cjs],
    styles: [...styles],
    types: [...types],
  }
}
