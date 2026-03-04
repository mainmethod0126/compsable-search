import type { SelectorDefinition } from './publicTypes'
import {
  COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE,
  ComposableSearchConfigurationError,
  assertComposableSearchConfiguration,
} from './configurationValidation'
import type { ComposableSearchConfigurationIssue } from './publicTypes'

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
  void options

  const matchedSelectors = selectors.filter(
    (selector) => selector.type === type,
  ) as SelectorOfType<TType, TSelector>[]

  if (matchedSelectors.length > 1) {
    const issue: ComposableSearchConfigurationIssue = {
      code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.DUPLICATE_SELECTOR_TYPE,
      message: `중복 selector type이 감지되었습니다: "${type}"`,
      cause: {
        selectorType: type,
        selectorIds: matchedSelectors.map((selector, index) => {
          const maybeWithId = selector as { id?: unknown }
          return typeof maybeWithId.id === 'string' && maybeWithId.id.length > 0
            ? maybeWithId.id
            : `${type}#${index + 1}`
        }),
        duplicateCount: matchedSelectors.length,
      },
    }

    throw new ComposableSearchConfigurationError(issue)
  }

  return matchedSelectors[0]
}

export function resolveSelectorsWithPolicy(
  selectors: readonly SelectorDefinition[],
  options: ResolveSelectorByTypeOptions = {},
): ResolvedSelectors {
  assertComposableSearchConfiguration({ selectors })

  return {
    regionSelector: resolveSelectorByType(selectors, 'region', options),
    keywordSelector: resolveSelectorByType(selectors, 'keyword', options),
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
