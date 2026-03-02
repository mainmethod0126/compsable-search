import type { SelectorDefinition } from './publicTypes'

type SelectorLike<TType extends string = string> = {
  type: TType
}

export type SelectorType = SelectorDefinition['type']
export type SelectorOfType<
  TType extends string,
  TSelector extends SelectorLike = SelectorDefinition,
> = TSelector & { type: TType }

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
  regionSelector: SelectorOfType<'region', SelectorDefinition> | undefined
  keywordSelector: SelectorOfType<'keyword', SelectorDefinition> | undefined
}

export const DUPLICATE_SELECTOR_WARNING_PREFIX =
  '[ComposableSearch] duplicate selector type detected'

export function createSelectorResolutionWarningContext(): SelectorResolutionWarningContext {
  return {
    warnedTypes: new Set<SelectorType>(),
  }
}

export function isRegionSelector<TSelector extends SelectorLike>(
  selector: TSelector,
): selector is SelectorOfType<'region', TSelector> {
  return selector.type === 'region'
}

export function isKeywordSelector<TSelector extends SelectorLike>(
  selector: TSelector,
): selector is SelectorOfType<'keyword', TSelector> {
  return selector.type === 'keyword'
}

export function resolveSelectorByType<
  TSelector extends SelectorLike,
  TType extends TSelector['type'],
>(
  selectors: readonly TSelector[],
  type: TType,
  options: ResolveSelectorByTypeOptions = {},
): SelectorOfType<TType, TSelector> | undefined {
  let resolvedSelector: SelectorOfType<TType, TSelector> | undefined
  let matchedCount = 0

  selectors.forEach((selector) => {
    if (selector.type !== type) {
      return
    }

    matchedCount += 1
    if (!resolvedSelector) {
      resolvedSelector = selector as SelectorOfType<TType, TSelector>
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
  selectors: readonly SelectorDefinition[],
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
  selectors: readonly SelectorLike[],
): DuplicateSelectorWarningMetadata[] {
  const selectorTypeCounts = selectors.reduce<Map<SelectorType, number>>(
    (counts, selector) => {
      counts.set(selector.type, (counts.get(selector.type) ?? 0) + 1)
      return counts
    },
    new Map<SelectorType, number>(),
  )

  return Array.from(selectorTypeCounts.entries())
    .filter(([, count]) => count > 1)
    .map(([selectorType, count]) => ({ selectorType, count }))
}
