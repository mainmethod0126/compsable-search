import type {
  ComposableSearchConfigurationErrorCode,
  ComposableSearchConfigurationIssue,
  ComposableSearchConfigurationIssueCause,
  ComposableSearchConfigurationRuntimeError,
  ComposableSearchConfigurationValidationResult,
  PluginSelectorTypeMismatchIssueCause,
  SelectorDefinition,
  SelectorPluginRegistry,
  ValidateComposableSearchConfigurationInput,
} from './publicTypes'

export const COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE = {
  MISSING_SELECTORS: 'MISSING_SELECTORS',
  EMPTY_SELECTORS: 'EMPTY_SELECTORS',
  DUPLICATE_SELECTOR_TYPE: 'DUPLICATE_SELECTOR_TYPE',
  PLUGIN_SELECTOR_TYPE_MISMATCH: 'PLUGIN_SELECTOR_TYPE_MISMATCH',
} as const

const ERROR_GUIDE_BY_CODE: Record<ComposableSearchConfigurationErrorCode, string> = {
  MISSING_SELECTORS:
    '`selectors` 필드를 필수로 전달하세요. 최소 1개의 selector 정의가 필요합니다.',
  EMPTY_SELECTORS:
    '`selectors` 배열이 비어 있습니다. `region`, `keyword` 또는 커스텀 selector를 최소 1개 이상 등록하세요.',
  DUPLICATE_SELECTOR_TYPE:
    '동일한 `selector.type`은 하나만 허용됩니다. 중복 타입 selector를 제거하거나 타입을 분리하세요.',
  PLUGIN_SELECTOR_TYPE_MISMATCH:
    '`plugin.type`과 동일한 `selector.type`이 존재해야 합니다. plugin 타입 또는 selector 구성을 일치시키세요.',
}

function createIssue(issue: ComposableSearchConfigurationIssue) {
  return issue
}

function collectDuplicateSelectorTypeIssues(
  selectors: readonly SelectorDefinition<unknown, string>[],
): ComposableSearchConfigurationIssue[] {
  const selectorIdsByType = selectors.reduce<Map<string, string[]>>(
    (map, selector) => {
      const selectorIds = map.get(selector.type) ?? []
      selectorIds.push(selector.id)
      map.set(selector.type, selectorIds)
      return map
    },
    new Map<string, string[]>(),
  )

  return Array.from(selectorIdsByType.entries())
    .filter(([, selectorIds]) => selectorIds.length > 1)
    .map(([selectorType, selectorIds]) =>
      createIssue({
        code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.DUPLICATE_SELECTOR_TYPE,
        message: `중복 selector type이 감지되었습니다: "${selectorType}"`,
        cause: {
          selectorType,
          selectorIds,
          duplicateCount: selectorIds.length,
        },
      }),
    )
}

function collectPluginSelectorTypeMismatchIssues(
  selectors: readonly SelectorDefinition<unknown, string>[],
  plugins: SelectorPluginRegistry | undefined,
): ComposableSearchConfigurationIssue[] {
  if (!plugins) {
    return []
  }

  const availableSelectorTypes = Array.from(
    new Set(selectors.map((selector) => selector.type)),
  )
  const availableSelectorTypeSet = new Set(availableSelectorTypes)

  return Object.values(plugins)
    .filter((plugin) => plugin.type !== undefined)
    .filter((plugin) => !availableSelectorTypeSet.has(plugin.type ?? ''))
    .map((plugin) => {
      const cause: PluginSelectorTypeMismatchIssueCause = {
        pluginId: plugin.id,
        pluginType: plugin.type ?? '',
        availableSelectorTypes,
      }

      return createIssue({
        code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.PLUGIN_SELECTOR_TYPE_MISMATCH,
        message: `plugin "${plugin.id}"의 type "${plugin.type}"과 매칭되는 selector type이 없습니다.`,
        cause,
      })
    })
}

export function validateComposableSearchConfiguration(
  config: ValidateComposableSearchConfigurationInput,
): ComposableSearchConfigurationValidationResult {
  const selectors = config.selectors
  const issues: ComposableSearchConfigurationIssue[] = []

  if (selectors === undefined) {
    issues.push(
      createIssue({
        code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.MISSING_SELECTORS,
        message: '`selectors`가 누락되었습니다.',
        cause: {
          selectors: undefined,
        },
      }),
    )

    return {
      isValid: false,
      issues,
    }
  }

  if (selectors.length === 0) {
    issues.push(
      createIssue({
        code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.EMPTY_SELECTORS,
        message: '`selectors`는 최소 1개 이상이어야 합니다.',
        cause: {
          selectorsLength: 0,
        },
      }),
    )

    return {
      isValid: false,
      issues,
    }
  }

  issues.push(...collectDuplicateSelectorTypeIssues(selectors))
  issues.push(...collectPluginSelectorTypeMismatchIssues(selectors, config.plugins))

  return {
    isValid: issues.length === 0,
    issues,
  }
}

function formatCauseContext(causeContext: ComposableSearchConfigurationIssueCause): string {
  return JSON.stringify(causeContext)
}

function buildErrorMessage(
  issue: ComposableSearchConfigurationIssue,
  guide: string,
): string {
  return `[${issue.code}] ${issue.message}\n원인: ${formatCauseContext(
    issue.cause,
  )}\n해결 가이드: ${guide}`
}

function resolveGuideByCode(code: ComposableSearchConfigurationErrorCode): string {
  return ERROR_GUIDE_BY_CODE[code]
}

export class ComposableSearchConfigurationError
  extends Error
  implements ComposableSearchConfigurationRuntimeError
{
  readonly name = 'ComposableSearchConfigurationError' as const
  readonly code: ComposableSearchConfigurationErrorCode
  readonly causeContext: ComposableSearchConfigurationIssueCause
  readonly guide: string

  constructor(issue: ComposableSearchConfigurationIssue) {
    const guide = resolveGuideByCode(issue.code)
    super(buildErrorMessage(issue, guide), {
      cause: issue.cause,
    })
    this.code = issue.code
    this.causeContext = issue.cause
    this.guide = guide
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export function assertComposableSearchConfiguration(
  config: ValidateComposableSearchConfigurationInput,
): void {
  const validationResult = validateComposableSearchConfiguration(config)
  if (validationResult.isValid) {
    return
  }

  const firstIssue = validationResult.issues[0]
  if (!firstIssue) {
    return
  }

  throw new ComposableSearchConfigurationError(firstIssue)
}
