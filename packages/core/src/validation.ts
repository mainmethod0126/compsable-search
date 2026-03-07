import type {
  ComposableSearchConfigurationErrorCode,
  ComposableSearchConfigurationIssue,
  ComposableSearchConfigurationIssueCause,
  ComposableSearchConfigurationRuntimeError,
  ComposableSearchConfigurationValidationResult,
  SelectionItem,
  SelectorDefinition,
  SelectorPlugin,
  ValidateComposableSearchConfigurationInput,
} from './types'
import { COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE } from './types'

const ERROR_GUIDE_BY_CODE: Record<
  ComposableSearchConfigurationErrorCode,
  string
> = {
  MISSING_SELECTORS:
    '`selectors`를 필수로 전달하세요. 최소 1개의 selector 정의가 필요합니다.',
  EMPTY_SELECTORS:
    '`selectors` 배열이 비어 있습니다. 최소 1개의 selector를 등록하세요.',
  DUPLICATE_SELECTOR_ID:
    '`selector.id`는 전역 유일해야 합니다. 중복된 selector id를 제거하거나 이름을 변경하세요.',
  UNKNOWN_PLUGIN_TARGET:
    'plugin target은 존재하는 selector id 또는 selector type만 참조해야 합니다.',
  MISSING_SELECTION_SELECTOR_ID:
    '모든 SelectionItem은 `selectorId`를 반드시 포함해야 합니다.',
}

function createIssue(
  issue: ComposableSearchConfigurationIssue,
): ComposableSearchConfigurationIssue {
  return issue
}

function collectDuplicateSelectorIdIssues(
  selectors: readonly SelectorDefinition[],
): ComposableSearchConfigurationIssue[] {
  const countsBySelectorId = selectors.reduce<Map<string, number>>((counts, selector) => {
    counts.set(selector.id, (counts.get(selector.id) ?? 0) + 1)
    return counts
  }, new Map<string, number>())

  return Array.from(countsBySelectorId.entries())
    .filter(([, count]) => count > 1)
    .map(([selectorId, duplicateCount]) =>
      createIssue({
        code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.DUPLICATE_SELECTOR_ID,
        message: `중복 selector id가 감지되었습니다: "${selectorId}"`,
        cause: {
          selectorId,
          duplicateCount,
        },
      }),
    )
}

function uniqueMissingTargets(targets: readonly string[], available: Set<string>): string[] {
  return Array.from(
    targets.reduce<Set<string>>((missingTargets, target) => {
      if (!available.has(target)) {
        missingTargets.add(target)
      }

      return missingTargets
    }, new Set<string>()),
  )
}

function collectUnknownPluginTargetIssues(
  selectors: readonly SelectorDefinition[],
  plugins: readonly SelectorPlugin[] | undefined,
): ComposableSearchConfigurationIssue[] {
  if (!plugins || plugins.length === 0) {
    return []
  }

  const availableSelectorIds = new Set(selectors.map((selector) => selector.id))
  const availableSelectorTypes = new Set(selectors.map((selector) => selector.type))

  return plugins.flatMap((plugin) => {
    if (!plugin.target || plugin.target.kind === 'all') {
      return []
    }

    const missingTargets =
      plugin.target.kind === 'selectorIds'
        ? uniqueMissingTargets(plugin.target.selectorIds, availableSelectorIds)
        : uniqueMissingTargets(plugin.target.selectorTypes, availableSelectorTypes)

    if (missingTargets.length === 0) {
      return []
    }

    return [
      createIssue({
        code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.UNKNOWN_PLUGIN_TARGET,
        message: `plugin "${plugin.id}"의 target이 존재하지 않는 selector를 참조합니다.`,
        cause: {
          pluginId: plugin.id,
          targetKind: plugin.target.kind,
          missingTargets,
        },
      }),
    ]
  })
}

function collectMissingSelectionSelectorIdIssues(
  location: 'value' | 'defaultValue',
  items: readonly SelectionItem[] | undefined,
): ComposableSearchConfigurationIssue[] {
  if (!items || items.length === 0) {
    return []
  }

  const missingSelectorIdItemIds = items.flatMap((item, index) => {
    if (typeof item.selectorId === 'string' && item.selectorId.trim().length > 0) {
      return []
    }

    return [typeof item.id === 'string' && item.id.length > 0 ? item.id : `item#${index + 1}`]
  })

  if (missingSelectorIdItemIds.length === 0) {
    return []
  }

  return [
    createIssue({
      code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.MISSING_SELECTION_SELECTOR_ID,
      message: `${location}에 selectorId가 누락된 selection item이 있습니다.`,
      cause: {
        location,
        itemIds: missingSelectorIdItemIds,
      },
    }),
  ]
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

export function validateComposableSearchConfiguration(
  config: ValidateComposableSearchConfigurationInput,
): ComposableSearchConfigurationValidationResult {
  const selectors = config.selectors
  const issues: ComposableSearchConfigurationIssue[] = []

  if (selectors === undefined) {
    return {
      isValid: false,
      issues: [
        createIssue({
          code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.MISSING_SELECTORS,
          message: '`selectors`가 누락되었습니다.',
          cause: {
            selectors: undefined,
          },
        }),
      ],
    }
  }

  if (selectors.length === 0) {
    return {
      isValid: false,
      issues: [
        createIssue({
          code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.EMPTY_SELECTORS,
          message: '`selectors`는 최소 1개 이상이어야 합니다.',
          cause: {
            selectorsLength: 0,
          },
        }),
      ],
    }
  }

  issues.push(...collectDuplicateSelectorIdIssues(selectors))
  issues.push(...collectUnknownPluginTargetIssues(selectors, config.plugins))
  issues.push(...collectMissingSelectionSelectorIdIssues('value', config.value))
  issues.push(
    ...collectMissingSelectionSelectorIdIssues('defaultValue', config.defaultValue),
  )

  return {
    isValid: issues.length === 0,
    issues,
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
