import { LEGACY_REGION_SELECTOR_ID } from './internalTypes'
import type {
  MaybePromise,
  Region,
  RegionDataSource,
  SelectedRegionCondition,
  SelectorLoadContext,
} from './types'

export type RegionSearchResultLevel = 'sido' | 'sigungu' | 'eupmyeondong'

export interface RegionSearchResult {
  id: string
  level: RegionSearchResultLevel
  pathLabel: string
  searchName: string
  searchText: string
  sido: Region
  sigungu?: Region
  eupmyeondong?: Region
}

export interface RegionSearchFilterOptions {
  limit?: number
}

export interface MappedRegionSearchSelection {
  condition: SelectedRegionCondition
  selectedRegion: Region
}

export interface MapRegionSearchResultOptions {
  selectorId?: string
}

export const DEFAULT_REGION_SEARCH_RESULT_LIMIT = 20

const LEVEL_PRIORITY: Record<RegionSearchResultLevel, number> = {
  eupmyeondong: 0,
  sigungu: 1,
  sido: 2,
}

function isPromiseLike<T>(value: MaybePromise<T>): value is Promise<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  )
}

function isAborted(context?: SelectorLoadContext): boolean {
  return Boolean(context?.signal.aborted)
}

function isAbortError(error: unknown): boolean {
  if (typeof DOMException !== 'undefined' && error instanceof DOMException) {
    return error.name === 'AbortError'
  }

  if (typeof error === 'object' && error !== null && 'name' in error) {
    return (error as { name?: unknown }).name === 'AbortError'
  }

  return false
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function resolvePathLabel(
  sido: Region,
  sigungu?: Region,
  eupmyeondong?: Region,
): string {
  if (eupmyeondong && sigungu) {
    return `${sido.displayName} > ${sigungu.displayName} > ${eupmyeondong.displayName}`
  }

  if (sigungu) {
    return `${sido.displayName} > ${sigungu.displayName}`
  }

  return sido.displayName
}

function createSearchResult(
  level: RegionSearchResultLevel,
  sido: Region,
  sigungu?: Region,
  eupmyeondong?: Region,
): RegionSearchResult {
  const target = eupmyeondong ?? sigungu ?? sido
  const pathLabel = resolvePathLabel(sido, sigungu, eupmyeondong)
  const searchableTokens = [pathLabel, target.name, target.displayName]

  return {
    id: target.code,
    level,
    pathLabel,
    searchName: normalizeSearchText(target.displayName),
    searchText: normalizeSearchText(searchableTokens.join(' ')),
    sido,
    sigungu,
    eupmyeondong,
  }
}

function createWholeRegion(region: Region): Region {
  return {
    ...region,
    displayName: region.displayName.endsWith(' 전체')
      ? region.displayName
      : `${region.displayName} 전체`,
  }
}

function formatRegionConditionLabel(
  sido: Region,
  sigungu: Region,
  eupmyeondong: Region,
): string {
  return `${sido.displayName}>${sigungu.displayName}>${eupmyeondong.displayName}`
}

export function buildRegionSearchIndex(
  regionDataSource: RegionDataSource,
  context?: SelectorLoadContext,
): MaybePromise<RegionSearchResult[]> {
  if (isAborted(context)) {
    return []
  }

  const results: RegionSearchResult[] = []
  const maybeSidos = regionDataSource.findAllSidos(context)
  if (isPromiseLike(maybeSidos)) {
    return buildRegionSearchIndexAsync(regionDataSource, context)
  }

  for (const sido of maybeSidos) {
    if (isAborted(context)) {
      return []
    }

    results.push(createSearchResult('sido', sido))

    const maybeSigungus = regionDataSource.findAllSigungus(sido.code, context)
    if (isPromiseLike(maybeSigungus)) {
      return buildRegionSearchIndexAsync(regionDataSource, context)
    }

    for (const sigungu of maybeSigungus) {
      if (isAborted(context)) {
        return []
      }

      results.push(createSearchResult('sigungu', sido, sigungu))

      const maybeEupmyeondongs = regionDataSource.findAllEupmyeondongs(
        sigungu.code,
        context,
      )
      if (isPromiseLike(maybeEupmyeondongs)) {
        return buildRegionSearchIndexAsync(regionDataSource, context)
      }

      for (const eupmyeondong of maybeEupmyeondongs) {
        if (isAborted(context)) {
          return []
        }

        results.push(createSearchResult('eupmyeondong', sido, sigungu, eupmyeondong))
      }
    }
  }

  return results
}

export async function buildRegionSearchIndexAsync(
  regionDataSource: RegionDataSource,
  context?: SelectorLoadContext,
): Promise<RegionSearchResult[]> {
  if (isAborted(context)) {
    return []
  }

  const results: RegionSearchResult[] = []

  try {
    const sidos = await Promise.resolve(regionDataSource.findAllSidos(context))
    for (const sido of sidos) {
      if (isAborted(context)) {
        return []
      }

      results.push(createSearchResult('sido', sido))
      const sigungus = await Promise.resolve(
        regionDataSource.findAllSigungus(sido.code, context),
      )

      for (const sigungu of sigungus) {
        if (isAborted(context)) {
          return []
        }

        results.push(createSearchResult('sigungu', sido, sigungu))
        const eupmyeondongs = await Promise.resolve(
          regionDataSource.findAllEupmyeondongs(sigungu.code, context),
        )

        for (const eupmyeondong of eupmyeondongs) {
          if (isAborted(context)) {
            return []
          }

          results.push(
            createSearchResult('eupmyeondong', sido, sigungu, eupmyeondong),
          )
        }
      }
    }

    return results
  } catch (error) {
    if (isAborted(context) || isAbortError(error)) {
      return []
    }

    throw error
  }
}

export function filterRegionSearchResults(
  index: RegionSearchResult[],
  rawQuery: string,
  options: RegionSearchFilterOptions = {},
): RegionSearchResult[] {
  const normalizedQuery = normalizeSearchText(rawQuery)
  if (normalizedQuery.length === 0) {
    return []
  }

  const normalizedLimit = Math.max(
    1,
    options.limit ?? DEFAULT_REGION_SEARCH_RESULT_LIMIT,
  )

  const results = index.filter((candidate) =>
    candidate.searchText.includes(normalizedQuery),
  )

  results.sort((left, right) => {
    const leftMatchIndex = left.searchName.indexOf(normalizedQuery)
    const rightMatchIndex = right.searchName.indexOf(normalizedQuery)
    const leftPriority = leftMatchIndex === -1 ? Number.MAX_SAFE_INTEGER : leftMatchIndex
    const rightPriority =
      rightMatchIndex === -1 ? Number.MAX_SAFE_INTEGER : rightMatchIndex

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority
    }

    if (LEVEL_PRIORITY[left.level] !== LEVEL_PRIORITY[right.level]) {
      return LEVEL_PRIORITY[left.level] - LEVEL_PRIORITY[right.level]
    }

    return left.pathLabel.localeCompare(right.pathLabel, 'ko-KR')
  })

  return results.slice(0, normalizedLimit)
}

export function mapRegionSearchResultToCondition(
  result: RegionSearchResult,
  options: MapRegionSearchResultOptions = {},
): MappedRegionSearchSelection {
  const selectorId = options.selectorId ?? LEGACY_REGION_SELECTOR_ID

  if (result.level === 'sido') {
    const wholeSido = createWholeRegion(result.sido)
    return {
      condition: {
        id: result.sido.code,
        displayName: formatRegionConditionLabel(result.sido, wholeSido, wholeSido),
        selectorId,
        selectorType: 'region',
        sido: result.sido,
        sigungu: wholeSido,
        eupmyeondong: wholeSido,
      },
      selectedRegion: wholeSido,
    }
  }

  if (result.level === 'sigungu') {
    if (!result.sigungu) {
      throw new Error('sigungu search result requires sigungu data')
    }

    const wholeSigungu = createWholeRegion(result.sigungu)
    return {
      condition: {
        id: result.sigungu.code,
        displayName: formatRegionConditionLabel(
          result.sido,
          result.sigungu,
          wholeSigungu,
        ),
        selectorId,
        selectorType: 'region',
        sido: result.sido,
        sigungu: result.sigungu,
        eupmyeondong: wholeSigungu,
      },
      selectedRegion: wholeSigungu,
    }
  }

  if (!result.sigungu || !result.eupmyeondong) {
    throw new Error('eupmyeondong search result requires sigungu/eupmyeondong data')
  }

  return {
    condition: {
      id: result.eupmyeondong.code,
      displayName: formatRegionConditionLabel(
        result.sido,
        result.sigungu,
        result.eupmyeondong,
      ),
      selectorId,
      selectorType: 'region',
      sido: result.sido,
      sigungu: result.sigungu,
      eupmyeondong: result.eupmyeondong,
    },
    selectedRegion: result.eupmyeondong,
  }
}
