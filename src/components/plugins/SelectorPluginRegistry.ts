import type { AnySelectorPlugin } from './SelectorPlugin'
import {
  validateSelectorPlugins,
  type SelectorPluginValidationResult,
  type ValidateSelectorPluginsOptions,
} from './pluginValidation'

export interface SelectorPluginRegistry {
  get(pluginId: string): AnySelectorPlugin | undefined
  getAll(): readonly AnySelectorPlugin[]
  validate(
    options?: ValidateSelectorPluginsOptions,
  ): SelectorPluginValidationResult
}

export function createSelectorPluginRegistry(
  plugins: readonly AnySelectorPlugin[] = [],
): SelectorPluginRegistry {
  const registeredPlugins = [...plugins]
  const pluginById = new Map<string, AnySelectorPlugin>()

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
): AnySelectorPlugin | undefined {
  return registry.get(pluginId)
}

export function getAllSelectorPlugins(
  registry: SelectorPluginRegistry,
): readonly AnySelectorPlugin[] {
  return registry.getAll()
}

export function validateSelectorPluginRegistry(
  registry: SelectorPluginRegistry,
  options?: ValidateSelectorPluginsOptions,
): SelectorPluginValidationResult {
  return registry.validate(options)
}
