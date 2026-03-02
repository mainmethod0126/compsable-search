import type {
  AnySelectorPlugin as PublicAnySelectorPlugin,
  SelectorPlugin as PublicSelectorPlugin,
  SelectorType,
} from '../publicTypes'

export type SelectorPlugin<TType extends SelectorType = SelectorType> =
  PublicSelectorPlugin<TType>
export type AnySelectorPlugin = PublicAnySelectorPlugin

export type SelectorPluginLifecycleHookName = 'onInit' | 'onDispose'
