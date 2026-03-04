import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
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
  id: 'react18-fixture-plugin',
  type: 'region',
  onInit: () => undefined,
  onDispose: () => undefined,
}

const pluginRegistry = createSelectorPluginRegistry([demoPlugin])
const maybeReactNode: ReactNode = null
const rootRef: Root | null = null

void ComposableSearch
void SELECTOR_PLUGIN_VALIDATION_CODE
void createKeywordSelector
void createRegionSelector
void getAllSelectorPlugins(pluginRegistry)
void getSelectorPlugin(pluginRegistry, demoPlugin.id)
void validateSelectorPluginRegistry(pluginRegistry)
void validateSelectorPlugins([demoPlugin])
void maybeReactNode
void rootRef
