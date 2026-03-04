#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SUPPORTED_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
  '.mts',
  '.cts',
])

const IGNORED_DIRECTORIES = new Set([
  '.git',
  '.hg',
  '.svn',
  '.next',
  '.nuxt',
  '.turbo',
  '.yarn',
  'node_modules',
  'dist',
  'build',
  'coverage',
  'out',
])

const IDENTIFIER_REPLACEMENTS = {
  selectorsProps: 'selectors',
  placeHolder: 'placeholder',
}

const COMPOSABLE_SEARCH_OPEN_TAG = '<ComposableSearch'
const THIS_SCRIPT_PATH = path.resolve(fileURLToPath(import.meta.url))

function parseArguments(rawArgs) {
  const options = {
    dryRun: true,
    help: false,
    targets: [],
  }

  for (const arg of rawArgs) {
    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }

    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }

    if (arg === '--write') {
      options.dryRun = false
      continue
    }

    if (arg.startsWith('--')) {
      throw new Error(`알 수 없는 옵션: ${arg}`)
    }

    options.targets.push(arg)
  }

  return options
}

function printHelp() {
  console.log(
    [
      'Usage:',
      '  node scripts/migrate-to-0.5.mjs [--dry-run|--write] [target ...]',
      '',
      'Options:',
      '  --dry-run   변경 내용을 미리보기만 수행 (기본값)',
      '  --write     실제 파일에 변경 사항을 기록',
      '  -h, --help  도움말 출력',
      '',
      'Examples:',
      '  node scripts/migrate-to-0.5.mjs --dry-run',
      '  node scripts/migrate-to-0.5.mjs --write src apps/web',
    ].join('\n'),
  )
}

function isIdentifierStart(char) {
  return (
    (char >= 'a' && char <= 'z') ||
    (char >= 'A' && char <= 'Z') ||
    char === '_' ||
    char === '$'
  )
}

function isIdentifierPart(char) {
  return isIdentifierStart(char) || (char >= '0' && char <= '9')
}

function isWhitespace(char) {
  return char === ' ' || char === '\n' || char === '\r' || char === '\t'
}

function skipWhitespace(text, startIndex) {
  let index = startIndex

  while (index < text.length && isWhitespace(text[index])) {
    index += 1
  }

  return index
}

function isComposableSearchOpenTagAt(source, index) {
  if (!source.startsWith(COMPOSABLE_SEARCH_OPEN_TAG, index)) {
    return false
  }

  const next = source[index + COMPOSABLE_SEARCH_OPEN_TAG.length]
  return next === undefined || isWhitespace(next) || next === '>' || next === '/'
}

function replaceIdentifierTokens(source, replacements) {
  const counts = Object.fromEntries(
    Object.keys(replacements).map((key) => [key, 0]),
  )

  const output = []
  let index = 0
  let state = 'code'

  while (index < source.length) {
    const char = source[index]
    const next = source[index + 1]

    if (state === 'code') {
      if (char === '/' && next === '/') {
        output.push('//')
        index += 2
        state = 'line-comment'
        continue
      }

      if (char === '/' && next === '*') {
        output.push('/*')
        index += 2
        state = 'block-comment'
        continue
      }

      if (char === "'") {
        output.push(char)
        index += 1
        state = 'single-quote'
        continue
      }

      if (char === '"') {
        output.push(char)
        index += 1
        state = 'double-quote'
        continue
      }

      if (char === '`') {
        output.push(char)
        index += 1
        state = 'template'
        continue
      }

      if (isIdentifierStart(char)) {
        const start = index
        index += 1

        while (index < source.length && isIdentifierPart(source[index])) {
          index += 1
        }

        const token = source.slice(start, index)
        const replacement = Object.hasOwn(replacements, token)
          ? replacements[token]
          : undefined

        if (replacement) {
          output.push(replacement)
          counts[token] += 1
          continue
        }

        output.push(token)
        continue
      }

      output.push(char)
      index += 1
      continue
    }

    if (state === 'line-comment') {
      output.push(char)
      index += 1

      if (char === '\n') {
        state = 'code'
      }

      continue
    }

    if (state === 'block-comment') {
      if (char === '*' && next === '/') {
        output.push('*/')
        index += 2
        state = 'code'
        continue
      }

      output.push(char)
      index += 1
      continue
    }

    if (state === 'single-quote') {
      if (char === '\\') {
        output.push(char)
        index += 1

        if (index < source.length) {
          output.push(source[index])
          index += 1
        }

        continue
      }

      output.push(char)
      index += 1

      if (char === "'") {
        state = 'code'
      }

      continue
    }

    if (state === 'double-quote') {
      if (char === '\\') {
        output.push(char)
        index += 1

        if (index < source.length) {
          output.push(source[index])
          index += 1
        }

        continue
      }

      output.push(char)
      index += 1

      if (char === '"') {
        state = 'code'
      }

      continue
    }

    if (state === 'template') {
      if (char === '\\') {
        output.push(char)
        index += 1

        if (index < source.length) {
          output.push(source[index])
          index += 1
        }

        continue
      }

      output.push(char)
      index += 1

      if (char === '`') {
        state = 'code'
      }

      continue
    }
  }

  return {
    source: output.join(''),
    counts,
  }
}

function findComposableSearchTagEnd(source, startIndex) {
  let index = startIndex + COMPOSABLE_SEARCH_OPEN_TAG.length
  let braceDepth = 0
  let quote = null
  let comment = null

  while (index < source.length) {
    const char = source[index]
    const next = source[index + 1]

    if (comment === 'line') {
      if (char === '\n') {
        comment = null
      }

      index += 1
      continue
    }

    if (comment === 'block') {
      if (char === '*' && next === '/') {
        index += 2
        comment = null
        continue
      }

      index += 1
      continue
    }

    if (quote) {
      if (char === '\\') {
        index += 2
        continue
      }

      if (char === quote) {
        quote = null
      }

      index += 1
      continue
    }

    if (braceDepth > 0) {
      if (char === '/' && next === '/') {
        comment = 'line'
        index += 2
        continue
      }

      if (char === '/' && next === '*') {
        comment = 'block'
        index += 2
        continue
      }

      if (char === '"' || char === "'" || char === '`') {
        quote = char
        index += 1
        continue
      }

      if (char === '{') {
        braceDepth += 1
        index += 1
        continue
      }

      if (char === '}') {
        braceDepth -= 1
        index += 1
        continue
      }

      index += 1
      continue
    }

    if (char === '>') {
      return index + 1
    }

    if (char === '{') {
      braceDepth = 1
      index += 1
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char
      index += 1
      continue
    }

    index += 1
  }

  return -1
}

function collectTopLevelJsxAttributeNames(tagText) {
  const names = new Set()
  let index = 0
  let braceDepth = 0
  let quote = null
  let comment = null

  while (index < tagText.length) {
    const char = tagText[index]
    const next = tagText[index + 1]

    if (comment === 'line') {
      if (char === '\n') {
        comment = null
      }

      index += 1
      continue
    }

    if (comment === 'block') {
      if (char === '*' && next === '/') {
        index += 2
        comment = null
        continue
      }

      index += 1
      continue
    }

    if (quote) {
      if (char === '\\') {
        index += 2
        continue
      }

      if (char === quote) {
        quote = null
      }

      index += 1
      continue
    }

    if (braceDepth > 0) {
      if (char === '/' && next === '/') {
        comment = 'line'
        index += 2
        continue
      }

      if (char === '/' && next === '*') {
        comment = 'block'
        index += 2
        continue
      }

      if (char === '"' || char === "'" || char === '`') {
        quote = char
        index += 1
        continue
      }

      if (char === '{') {
        braceDepth += 1
        index += 1
        continue
      }

      if (char === '}') {
        braceDepth -= 1
        index += 1
        continue
      }

      index += 1
      continue
    }

    if (char === '{') {
      braceDepth = 1
      index += 1
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char
      index += 1
      continue
    }

    if (isIdentifierStart(char)) {
      const start = index
      index += 1

      while (index < tagText.length && isIdentifierPart(tagText[index])) {
        index += 1
      }

      const token = tagText.slice(start, index)
      const valueIndex = skipWhitespace(tagText, index)

      if (tagText[valueIndex] === '=') {
        names.add(token)
      }

      continue
    }

    index += 1
  }

  return names
}

function replaceTopLevelJsxAttributeName(tagText, fromName, toName) {
  const output = []
  let index = 0
  let braceDepth = 0
  let quote = null
  let comment = null
  let count = 0

  while (index < tagText.length) {
    const char = tagText[index]
    const next = tagText[index + 1]

    if (comment === 'line') {
      output.push(char)

      if (char === '\n') {
        comment = null
      }

      index += 1
      continue
    }

    if (comment === 'block') {
      if (char === '*' && next === '/') {
        output.push('*/')
        index += 2
        comment = null
        continue
      }

      output.push(char)
      index += 1
      continue
    }

    if (quote) {
      if (char === '\\') {
        output.push(char)
        index += 1

        if (index < tagText.length) {
          output.push(tagText[index])
          index += 1
        }

        continue
      }

      output.push(char)

      if (char === quote) {
        quote = null
      }

      index += 1
      continue
    }

    if (braceDepth > 0) {
      if (char === '/' && next === '/') {
        output.push('//')
        index += 2
        comment = 'line'
        continue
      }

      if (char === '/' && next === '*') {
        output.push('/*')
        index += 2
        comment = 'block'
        continue
      }

      if (char === '"' || char === "'" || char === '`') {
        output.push(char)
        quote = char
        index += 1
        continue
      }

      if (char === '{') {
        output.push(char)
        braceDepth += 1
        index += 1
        continue
      }

      if (char === '}') {
        output.push(char)
        braceDepth -= 1
        index += 1
        continue
      }

      output.push(char)
      index += 1
      continue
    }

    if (char === '{') {
      output.push(char)
      braceDepth = 1
      index += 1
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      output.push(char)
      quote = char
      index += 1
      continue
    }

    if (isIdentifierStart(char)) {
      const start = index
      index += 1

      while (index < tagText.length && isIdentifierPart(tagText[index])) {
        index += 1
      }

      const token = tagText.slice(start, index)
      const valueIndex = skipWhitespace(tagText, index)

      if (token === fromName && tagText[valueIndex] === '=') {
        output.push(toName)
        count += 1
        continue
      }

      output.push(token)
      continue
    }

    output.push(char)
    index += 1
  }

  return {
    tagText: output.join(''),
    count,
  }
}

function replaceComposableSearchOnChange(source) {
  const output = []
  let index = 0
  let state = 'code'
  let replacementCount = 0
  let skippedConflictCount = 0
  let unclosedTagCount = 0

  while (index < source.length) {
    const char = source[index]
    const next = source[index + 1]

    if (state === 'code') {
      if (char === '/' && next === '/') {
        output.push('//')
        index += 2
        state = 'line-comment'
        continue
      }

      if (char === '/' && next === '*') {
        output.push('/*')
        index += 2
        state = 'block-comment'
        continue
      }

      if (char === "'") {
        output.push(char)
        index += 1
        state = 'single-quote'
        continue
      }

      if (char === '"') {
        output.push(char)
        index += 1
        state = 'double-quote'
        continue
      }

      if (char === '`') {
        output.push(char)
        index += 1
        state = 'template'
        continue
      }

      if (char === '<' && isComposableSearchOpenTagAt(source, index)) {
        const tagEnd = findComposableSearchTagEnd(source, index)

        if (tagEnd === -1) {
          unclosedTagCount += 1
          output.push(char)
          index += 1
          continue
        }

        const tagText = source.slice(index, tagEnd)
        const attributes = collectTopLevelJsxAttributeNames(tagText)

        if (attributes.has('onChange') && attributes.has('onValueChange')) {
          skippedConflictCount += 1
          output.push(tagText)
          index = tagEnd
          continue
        }

        if (attributes.has('onChange')) {
          const replacement = replaceTopLevelJsxAttributeName(
            tagText,
            'onChange',
            'onValueChange',
          )

          replacementCount += replacement.count
          output.push(replacement.tagText)
          index = tagEnd
          continue
        }

        output.push(tagText)
        index = tagEnd
        continue
      }

      output.push(char)
      index += 1
      continue
    }

    if (state === 'line-comment') {
      output.push(char)
      index += 1

      if (char === '\n') {
        state = 'code'
      }

      continue
    }

    if (state === 'block-comment') {
      if (char === '*' && next === '/') {
        output.push('*/')
        index += 2
        state = 'code'
        continue
      }

      output.push(char)
      index += 1
      continue
    }

    if (state === 'single-quote') {
      if (char === '\\') {
        output.push(char)
        index += 1

        if (index < source.length) {
          output.push(source[index])
          index += 1
        }

        continue
      }

      output.push(char)
      index += 1

      if (char === "'") {
        state = 'code'
      }

      continue
    }

    if (state === 'double-quote') {
      if (char === '\\') {
        output.push(char)
        index += 1

        if (index < source.length) {
          output.push(source[index])
          index += 1
        }

        continue
      }

      output.push(char)
      index += 1

      if (char === '"') {
        state = 'code'
      }

      continue
    }

    if (state === 'template') {
      if (char === '\\') {
        output.push(char)
        index += 1

        if (index < source.length) {
          output.push(source[index])
          index += 1
        }

        continue
      }

      output.push(char)
      index += 1

      if (char === '`') {
        state = 'code'
      }

      continue
    }
  }

  return {
    source: output.join(''),
    replacementCount,
    skippedConflictCount,
    unclosedTagCount,
  }
}

function transformSource(source) {
  const identifierResult = replaceIdentifierTokens(source, IDENTIFIER_REPLACEMENTS)
  const jsxResult = replaceComposableSearchOnChange(identifierResult.source)

  const selectorsReplacementCount = identifierResult.counts.selectorsProps ?? 0
  const placeholderReplacementCount = identifierResult.counts.placeHolder ?? 0
  const onChangeReplacementCount = jsxResult.replacementCount

  return {
    source: jsxResult.source,
    counts: {
      selectorsPropsToSelectors: selectorsReplacementCount,
      placeHolderToPlaceholder: placeholderReplacementCount,
      onChangeToOnValueChange: onChangeReplacementCount,
      skippedOnChangeConflictTags: jsxResult.skippedConflictCount,
      unclosedComposableSearchTags: jsxResult.unclosedTagCount,
      total:
        selectorsReplacementCount +
        placeholderReplacementCount +
        onChangeReplacementCount,
    },
  }
}

async function collectTargetFiles(targetPaths) {
  const files = []

  for (const targetPath of targetPaths) {
    await walkTarget(targetPath, files)
  }

  return Array.from(
    new Set(
      files
        .map((filePath) => path.resolve(filePath))
        .filter((filePath) => filePath !== THIS_SCRIPT_PATH),
    ),
  ).sort()
}

async function walkTarget(entryPath, collector) {
  let stats

  try {
    stats = await fs.stat(entryPath)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return
    }
    throw error
  }

  if (stats.isFile()) {
    if (SUPPORTED_EXTENSIONS.has(path.extname(entryPath))) {
      collector.push(entryPath)
    }
    return
  }

  if (!stats.isDirectory()) {
    return
  }

  const directoryName = path.basename(entryPath)
  if (IGNORED_DIRECTORIES.has(directoryName)) {
    return
  }

  const entries = await fs.readdir(entryPath, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isSymbolicLink()) {
      continue
    }

    const fullPath = path.join(entryPath, entry.name)

    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        continue
      }

      await walkTarget(fullPath, collector)
      continue
    }

    if (entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name))) {
      collector.push(fullPath)
    }
  }
}

function formatFileSummary(relativePath, counts) {
  const parts = []

  if (counts.selectorsPropsToSelectors > 0) {
    parts.push(`selectorsProps->selectors ${counts.selectorsPropsToSelectors}`)
  }

  if (counts.placeHolderToPlaceholder > 0) {
    parts.push(`placeHolder->placeholder ${counts.placeHolderToPlaceholder}`)
  }

  if (counts.onChangeToOnValueChange > 0) {
    parts.push(`onChange->onValueChange ${counts.onChangeToOnValueChange}`)
  }

  if (parts.length === 0) {
    parts.push('치환 없음')
  }

  return `- ${relativePath}: ${parts.join(', ')}`
}

async function run() {
  const options = parseArguments(process.argv.slice(2))

  if (options.help) {
    printHelp()
    return
  }

  const defaultTarget = await (async () => {
    try {
      const srcStats = await fs.stat(path.resolve(process.cwd(), 'src'))
      return srcStats.isDirectory() ? 'src' : '.'
    } catch (_error) {
      return '.'
    }
  })()

  const targets =
    options.targets.length > 0
      ? options.targets.map((target) => path.resolve(process.cwd(), target))
      : [path.resolve(process.cwd(), defaultTarget)]

  const files = await collectTargetFiles(targets)

  if (files.length === 0) {
    console.log('[migrate-to-0.5] 처리할 파일이 없습니다.')
    return
  }

  const totals = {
    scannedFiles: 0,
    changedFiles: 0,
    selectorsPropsToSelectors: 0,
    placeHolderToPlaceholder: 0,
    onChangeToOnValueChange: 0,
    skippedOnChangeConflictTags: 0,
    unclosedComposableSearchTags: 0,
    totalReplacements: 0,
  }

  const changedFileSummaries = []

  for (const filePath of files) {
    const original = await fs.readFile(filePath, 'utf8')
    const transformed = transformSource(original)
    const isChanged = transformed.source !== original

    totals.scannedFiles += 1
    totals.selectorsPropsToSelectors += transformed.counts.selectorsPropsToSelectors
    totals.placeHolderToPlaceholder += transformed.counts.placeHolderToPlaceholder
    totals.onChangeToOnValueChange += transformed.counts.onChangeToOnValueChange
    totals.skippedOnChangeConflictTags += transformed.counts.skippedOnChangeConflictTags
    totals.unclosedComposableSearchTags += transformed.counts.unclosedComposableSearchTags
    totals.totalReplacements += transformed.counts.total

    if (!isChanged) {
      continue
    }

    totals.changedFiles += 1

    const relativePath = path.relative(process.cwd(), filePath) || filePath
    changedFileSummaries.push(formatFileSummary(relativePath, transformed.counts))

    if (!options.dryRun) {
      await fs.writeFile(filePath, transformed.source, 'utf8')
    }
  }

  console.log(
    `[migrate-to-0.5] mode=${options.dryRun ? 'dry-run' : 'write'}, targets=${targets
      .map((targetPath) => path.relative(process.cwd(), targetPath) || '.')
      .join(', ')}`,
  )
  console.log(`[migrate-to-0.5] scanned files: ${totals.scannedFiles}`)
  console.log(`[migrate-to-0.5] changed files: ${totals.changedFiles}`)
  console.log(
    `[migrate-to-0.5] replacements: selectorsProps->selectors=${totals.selectorsPropsToSelectors}, placeHolder->placeholder=${totals.placeHolderToPlaceholder}, onChange->onValueChange=${totals.onChangeToOnValueChange}, total=${totals.totalReplacements}`,
  )

  if (totals.skippedOnChangeConflictTags > 0) {
    console.log(
      `[migrate-to-0.5] skipped onChange replacements (onValueChange already exists): ${totals.skippedOnChangeConflictTags}`,
    )
  }

  if (totals.unclosedComposableSearchTags > 0) {
    console.log(
      `[migrate-to-0.5] warning: composable search tag parse 실패(닫히지 않은 태그 추정): ${totals.unclosedComposableSearchTags}`,
    )
  }

  if (changedFileSummaries.length > 0) {
    console.log('[migrate-to-0.5] changed file details:')
    changedFileSummaries.forEach((line) => console.log(line))
  }

  if (options.dryRun) {
    console.log('[migrate-to-0.5] dry-run 모드이므로 파일은 변경되지 않았습니다.')
  }
}

try {
  await run()
} catch (error) {
  console.error('[migrate-to-0.5] 실행 실패')
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
