import {
  ComposableSearch,
  SELECTOR_PLUGIN_VALIDATION_CODE,
  createKeywordSelector,
  createRegionSelector,
  createSelectorPluginRegistry,
  getAllSelectorPlugins,
  getSelectorPlugin,
  validateSelectorPluginRegistry,
  validateSelectorPlugins,
} from 'compsable-search'
import type { SelectorPlugin } from 'compsable-search'
import 'compsable-search/style.css'

const demoPlugin: SelectorPlugin = {
  id: 'esm-fixture-plugin',
  type: 'region',
  onInit: () => undefined,
  onDispose: () => undefined,
}

const pluginRegistry = createSelectorPluginRegistry([demoPlugin])

void ComposableSearch
void SELECTOR_PLUGIN_VALIDATION_CODE
void createKeywordSelector
void createRegionSelector
void getAllSelectorPlugins(pluginRegistry)
void getSelectorPlugin(pluginRegistry, demoPlugin.id)
void validateSelectorPluginRegistry(pluginRegistry)
void validateSelectorPlugins([demoPlugin])
