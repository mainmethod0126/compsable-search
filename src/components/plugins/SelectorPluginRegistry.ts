import type { SelectorPlugin } from './SelectorPlugin'
import {
  validateSelectorPlugins,
  type SelectorPluginValidationResult,
  type ValidateSelectorPluginsOptions,
} from './pluginValidation'

export interface SelectorPluginRegistry {
  get(pluginId: string): SelectorPlugin | undefined
  getAll(): readonly SelectorPlugin[]
  validate(
    options?: ValidateSelectorPluginsOptions,
  ): SelectorPluginValidationResult
}

export function createSelectorPluginRegistry(
  plugins: readonly SelectorPlugin[] = [],
): SelectorPluginRegistry {
  const registeredPlugins = [...plugins]
  const pluginById = new Map<string, SelectorPlugin>()

  registeredPlugins.forEach((plugin) => {
    if (!pluginById.has(plugin.id)) {
      pluginById.set(plugin.id, plugin)
    }
  })

  return {
    get(pluginId) {
      return pluginById.get(pluginId)
    },
    getAll() {
      return registeredPlugins
    },
    validate(options) {
      return validateSelectorPlugins(registeredPlugins, options)
    },
  }
}

export function getSelectorPlugin(
  registry: SelectorPluginRegistry,
  pluginId: string,
): SelectorPlugin | undefined {
  return registry.get(pluginId)
}

export function getAllSelectorPlugins(
  registry: SelectorPluginRegistry,
): readonly SelectorPlugin[] {
  return registry.getAll()
}

export function validateSelectorPluginRegistry(
  registry: SelectorPluginRegistry,
  options?: ValidateSelectorPluginsOptions,
): SelectorPluginValidationResult {
  return registry.validate(options)
}
