import type { SelectorPlugin } from './SelectorPlugin'

export const SELECTOR_PLUGIN_VALIDATION_CODE = {
  DUPLICATE_PLUGIN_ID: 'DUPLICATE_PLUGIN_ID',
  UNKNOWN_PLUGIN: 'UNKNOWN_PLUGIN',
  MISSING_REQUIRED_HOOK: 'MISSING_REQUIRED_HOOK',
} as const

export type SelectorPluginValidationCode =
  (typeof SELECTOR_PLUGIN_VALIDATION_CODE)[keyof typeof SELECTOR_PLUGIN_VALIDATION_CODE]

export interface SelectorPluginValidationIssue {
  code: SelectorPluginValidationCode
  pluginId: string
  hookName?: string
  message: string
}

export interface SelectorPluginValidationResult {
  isValid: boolean
  issues: SelectorPluginValidationIssue[]
}

export interface ValidateSelectorPluginsOptions {
  enabledPluginIds?: readonly string[]
  requiredHooks?: readonly string[]
}

function collectDuplicatePluginIds(plugins: readonly SelectorPlugin[]): string[] {
  const seenPluginIds = new Set<string>()
  const duplicatedPluginIds = new Set<string>()
  const orderedDuplicates: string[] = []

  for (const plugin of plugins) {
    if (seenPluginIds.has(plugin.id)) {
      if (!duplicatedPluginIds.has(plugin.id)) {
        duplicatedPluginIds.add(plugin.id)
        orderedDuplicates.push(plugin.id)
      }
      continue
    }

    seenPluginIds.add(plugin.id)
  }

  return orderedDuplicates
}

function createIssue(
  issue: SelectorPluginValidationIssue,
): SelectorPluginValidationIssue {
  return issue
}

export function validateSelectorPlugins(
  plugins: readonly SelectorPlugin[],
  options: ValidateSelectorPluginsOptions = {},
): SelectorPluginValidationResult {
  const issues: SelectorPluginValidationIssue[] = []
  const duplicatePluginIds = collectDuplicatePluginIds(plugins)

  duplicatePluginIds.forEach((pluginId) => {
    issues.push(
      createIssue({
        code: SELECTOR_PLUGIN_VALIDATION_CODE.DUPLICATE_PLUGIN_ID,
        pluginId,
        message: `중복 플러그인 id가 감지되었습니다: "${pluginId}"`,
      }),
    )
  })

  if (options.enabledPluginIds) {
    const availablePluginIds = new Set(plugins.map((plugin) => plugin.id))
    const unknownPluginIds = new Set<string>()

    options.enabledPluginIds.forEach((pluginId) => {
      if (availablePluginIds.has(pluginId) || unknownPluginIds.has(pluginId)) {
        return
      }

      unknownPluginIds.add(pluginId)
      issues.push(
        createIssue({
          code: SELECTOR_PLUGIN_VALIDATION_CODE.UNKNOWN_PLUGIN,
          pluginId,
          message: `등록되지 않은 플러그인 id입니다: "${pluginId}"`,
        }),
      )
    })
  }

  const requiredHooks = options.requiredHooks ?? []
  plugins.forEach((plugin) => {
    requiredHooks.forEach((hookName) => {
      const hook = plugin.hooks[hookName]
      if (typeof hook === 'function') {
        return
      }

      issues.push(
        createIssue({
          code: SELECTOR_PLUGIN_VALIDATION_CODE.MISSING_REQUIRED_HOOK,
          pluginId: plugin.id,
          hookName,
          message: `필수 훅이 누락되었습니다: "${plugin.id}.${hookName}"`,
        }),
      )
    })
  })

  return {
    isValid: issues.length === 0,
    issues,
  }
}
