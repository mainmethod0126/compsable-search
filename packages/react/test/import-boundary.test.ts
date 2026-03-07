import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const packageRoot = process.cwd()
const sourceRoot = path.resolve(packageRoot, 'src')

async function collectSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const nextPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        return collectSourceFiles(nextPath)
      }

      return /\.(ts|tsx|css)$/.test(entry.name) ? [nextPath] : []
    }),
  )

  return nestedFiles.flat()
}

describe('@compsable-search/react import boundary', () => {
  it('legacy root src와 selector package 직접 import를 포함하지 않는다', async () => {
    const files = await collectSourceFiles(sourceRoot)
    const forbiddenPatterns = [
      /@compsable-search\/selector-region/,
      /@compsable-search\/selector-keyword/,
      /\.\.\/\.\.\/\.\.\/src\//,
      /\.\.\/\.\.\/src\//,
      /RegionDetailPanel/,
      /KeywordDetailPanel/,
      /createRegionSelector/,
      /createKeywordSelector/,
      /regionSearchModel/,
      /keywordInputModel/,
    ]

    for (const filePath of files) {
      const content = await readFile(filePath, 'utf8')

      expect(forbiddenPatterns.some((pattern) => pattern.test(content))).toBe(false)
    }
  })
})
