import type {
  ComposableSelectProps,
  KeywordSelectProps,
  RegionSelectProps,
} from './publicTypes'

export type SelectorType = ComposableSelectProps['type']
export type SelectorOfType<TType extends SelectorType> = Extract<
  ComposableSelectProps,
  { type: TType }
>

export interface DuplicateSelectorWarningMetadata {
  selectorType: SelectorType
  count: number
}

export interface SelectorResolutionWarningContext {
  warnedTypes: Set<SelectorType>
}

export interface ResolveSelectorByTypeOptions {
  warningContext?: SelectorResolutionWarningContext
  warn?: (
    message: string,
    metadata: DuplicateSelectorWarningMetadata,
  ) => void
}

export interface ResolvedSelectors {
  regionSelector: SelectorOfType<'region'> | undefined
  keywordSelector: SelectorOfType<'keyword'> | undefined
}

export const DUPLICATE_SELECTOR_WARNING_PREFIX =
  '[ComposableSearch] duplicate selector type detected'

export function createSelectorResolutionWarningContext(): SelectorResolutionWarningContext {
  return {
    warnedTypes: new Set<SelectorType>(),
  }
}

export function isRegionSelector(
  selector: ComposableSelectProps,
): selector is RegionSelectProps {
  return selector.type === 'region'
}

export function isKeywordSelector(
  selector: ComposableSelectProps,
): selector is KeywordSelectProps {
  return selector.type === 'keyword'
}

export function resolveSelectorByType<TType extends SelectorType>(
  selectors: ComposableSelectProps[],
  type: TType,
  options: ResolveSelectorByTypeOptions = {},
): SelectorOfType<TType> | undefined {
  let resolvedSelector: SelectorOfType<TType> | undefined
  let matchedCount = 0

  selectors.forEach((selector) => {
    if (selector.type !== type) {
      return
    }

    matchedCount += 1
    if (!resolvedSelector) {
      resolvedSelector = selector as SelectorOfType<TType>
    }
  })

  if (matchedCount > 1) {
    const warningContext = options.warningContext
    const wasWarned = warningContext?.warnedTypes.has(type) ?? false
    if (!wasWarned) {
      warningContext?.warnedTypes.add(type)
      const warn = options.warn ?? console.warn
      warn(DUPLICATE_SELECTOR_WARNING_PREFIX, {
        selectorType: type,
        count: matchedCount,
      })
    }
  }

  return resolvedSelector
}

export function resolveSelectorsWithPolicy(
  selectors: ComposableSelectProps[],
  options: ResolveSelectorByTypeOptions = {},
): ResolvedSelectors {
  const warningContext =
    options.warningContext ?? createSelectorResolutionWarningContext()

  return {
    regionSelector: resolveSelectorByType(selectors, 'region', {
      ...options,
      warningContext,
    }),
    keywordSelector: resolveSelectorByType(selectors, 'keyword', {
      ...options,
      warningContext,
    }),
  }
}

export function validateSelectorTypeUniqueness(
  selectors: ComposableSelectProps[],
): DuplicateSelectorWarningMetadata[] {
  const selectorTypeCounts = selectors.reduce<Record<SelectorType, number>>(
    (counts, selector) => {
      counts[selector.type] += 1
      return counts
    },
    {
      region: 0,
      keyword: 0,
    },
  )

  return (Object.entries(selectorTypeCounts) as [SelectorType, number][])
    .filter(([, count]) => count > 1)
    .map(([selectorType, count]) => ({
      selectorType,
      count,
    }))
}
