import type {
  PanelOpenChangeEvent,
  SelectionChangeEvent,
  SelectorPlugin as PublicSelectorPlugin,
  SelectorErrorEvent,
  SelectorType,
} from '../publicTypes'

type BivariantCallback<TArgs extends unknown[]> = {
  bivarianceHack(...args: TArgs): void
}['bivarianceHack']

export interface SelectorPluginSelectionChangeMeta {
  source: string
  selectorType?: string
  selectorId?: string
}

export type SelectorPluginSelectionChangeEvent = SelectionChangeEvent

export type SelectorPluginPanelOpenChangeEvent = PanelOpenChangeEvent

export type SelectorPluginVersion = string | number

export interface SelectorPluginBindingKeyInput {
  id: string
  version?: SelectorPluginVersion
}

export type SelectorPluginLifecycleHookName = 'onInit' | 'onDispose'
export type SelectorPluginEventHookName =
  | 'onSelectionChange'
  | 'onPanelOpenChange'
  | 'onError'
export type SelectorPluginHookName =
  | SelectorPluginLifecycleHookName
  | SelectorPluginEventHookName
export type SelectorPluginErrorSourceHookName = Exclude<
  SelectorPluginHookName,
  'onError'
>

export interface SelectorPluginErrorEvent extends SelectorErrorEvent {
  pluginId: string
  pluginType: SelectorType
  sourceHookName: SelectorPluginErrorSourceHookName
}

export interface SelectorPluginV2Hooks {
  version?: SelectorPluginVersion
  onSelectionChange?: BivariantCallback<
    [event: SelectorPluginSelectionChangeEvent]
  >
  onPanelOpenChange?: BivariantCallback<
    [event: SelectorPluginPanelOpenChangeEvent]
  >
  onError?: BivariantCallback<[event: SelectorPluginErrorEvent]>
}

export type SelectorPlugin<TType extends SelectorType = SelectorType> =
  PublicSelectorPlugin<TType> & SelectorPluginV2Hooks
export type AnySelectorPlugin = SelectorPlugin

const DEFAULT_SELECTOR_PLUGIN_VERSION = '0'

export function createSelectorPluginBindingKey(
  plugin: SelectorPluginBindingKeyInput,
): string {
  const normalizedVersion =
    plugin.version === undefined || plugin.version === null
      ? DEFAULT_SELECTOR_PLUGIN_VERSION
      : String(plugin.version)

  return `${plugin.id}@${normalizedVersion}`
}
