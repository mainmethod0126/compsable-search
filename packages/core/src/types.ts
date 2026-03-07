export type MaybePromise<T> = T | Promise<T>

export type SelectorId = string
export type SelectorType = string
export type SelectorVersion = string | number
export type PluginVersion = string | number

export type ValueChangeSource = 'selector' | 'external'
export type ValueChangeReason = 'add' | 'remove' | 'replace' | 'clear-all'
export type PanelChangeReason = 'open' | 'close' | 'switch'

export interface SelectionItem<TPayload = unknown> {
  id: string
  displayName: string
  selectorId: SelectorId
  payload?: TPayload
}

export interface SelectorDefinition<TConfig = unknown> {
  id: SelectorId
  type: SelectorType
  version?: SelectorVersion
  config?: TConfig
}

export interface ValueChangeMeta {
  source: ValueChangeSource
  reason: ValueChangeReason
  selectorId?: SelectorId
}

export interface SelectionChangeEvent<
  TSelectionItem extends SelectionItem = SelectionItem,
> {
  currentValue: readonly TSelectionItem[]
  nextValue: readonly TSelectionItem[]
  meta: ValueChangeMeta
}

export interface PanelOpenChangeEvent {
  previousSelectorId: SelectorId | null
  currentSelectorId: SelectorId | null
  isOpen: boolean
  reason: PanelChangeReason
  source: ValueChangeSource
}

export interface SelectorPluginTargetAll {
  kind: 'all'
}

export interface SelectorPluginTargetByIds {
  kind: 'selectorIds'
  selectorIds: readonly SelectorId[]
}

export interface SelectorPluginTargetByTypes {
  kind: 'selectorTypes'
  selectorTypes: readonly SelectorType[]
}

export type SelectorPluginTarget =
  | SelectorPluginTargetAll
  | SelectorPluginTargetByIds
  | SelectorPluginTargetByTypes

export interface ResolvedSelectorPluginTarget {
  selectorIds: readonly SelectorId[]
  selectorTypes: readonly SelectorType[]
}

export interface SelectorPluginLifecycleContext {
  bindingKey: string
  selector: SelectorDefinition
  resolvedTarget: ResolvedSelectorPluginTarget
}

export type SelectorPluginHookName =
  | 'onInit'
  | 'onDispose'
  | 'onSelectionChange'
  | 'onPanelOpenChange'
  | 'onError'

export type SelectorPluginErrorSourceHookName = Exclude<
  SelectorPluginHookName,
  never
>

export interface SelectorPluginErrorEvent {
  pluginId: string
  bindingKey: string
  selectorId: SelectorId
  selectorType: SelectorType
  sourceHookName: SelectorPluginErrorSourceHookName
  error: unknown
}

export interface SelectorPlugin {
  id: string
  version?: PluginVersion
  target?: SelectorPluginTarget
  onInit?: (context: SelectorPluginLifecycleContext) => void
  onDispose?: (context: SelectorPluginLifecycleContext) => void
  onSelectionChange?: (event: SelectionChangeEvent) => void
  onPanelOpenChange?: (event: PanelOpenChangeEvent) => void
  onError?: (event: SelectorPluginErrorEvent) => void
}

export interface ResolvedSelectorPluginBinding {
  bindingKey: string
  plugin: SelectorPlugin
  selector: SelectorDefinition
  resolvedTarget: ResolvedSelectorPluginTarget
}

export const COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE = {
  MISSING_SELECTORS: 'MISSING_SELECTORS',
  EMPTY_SELECTORS: 'EMPTY_SELECTORS',
  DUPLICATE_SELECTOR_ID: 'DUPLICATE_SELECTOR_ID',
  UNKNOWN_PLUGIN_TARGET: 'UNKNOWN_PLUGIN_TARGET',
  MISSING_SELECTION_SELECTOR_ID: 'MISSING_SELECTION_SELECTOR_ID',
} as const

export type ComposableSearchConfigurationErrorCode =
  (typeof COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE)[keyof typeof COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE]

export interface MissingSelectorsIssueCause {
  selectors: undefined
}

export interface EmptySelectorsIssueCause {
  selectorsLength: 0
}

export interface DuplicateSelectorIdIssueCause {
  selectorId: SelectorId
  duplicateCount: number
}

export interface UnknownPluginTargetIssueCause {
  pluginId: string
  targetKind: SelectorPluginTarget['kind']
  missingTargets: readonly string[]
}

export interface MissingSelectionSelectorIdIssueCause {
  location: 'value' | 'defaultValue'
  itemIds: readonly string[]
}

export type ComposableSearchConfigurationIssueCause =
  | MissingSelectorsIssueCause
  | EmptySelectorsIssueCause
  | DuplicateSelectorIdIssueCause
  | UnknownPluginTargetIssueCause
  | MissingSelectionSelectorIdIssueCause

export interface ComposableSearchConfigurationIssue {
  code: ComposableSearchConfigurationErrorCode
  message: string
  cause: ComposableSearchConfigurationIssueCause
}

export interface ComposableSearchConfigurationValidationResult {
  isValid: boolean
  issues: ComposableSearchConfigurationIssue[]
}

export interface ValidateComposableSearchConfigurationInput<
  TSelectionItem extends SelectionItem = SelectionItem,
> {
  selectors?: readonly SelectorDefinition[]
  plugins?: readonly SelectorPlugin[]
  value?: readonly TSelectionItem[]
  defaultValue?: readonly TSelectionItem[]
}

export interface ComposableSearchConfigurationRuntimeError extends Error {
  name: 'ComposableSearchConfigurationError'
  code: ComposableSearchConfigurationErrorCode
  causeContext: ComposableSearchConfigurationIssueCause
  guide: string
}

export interface CreateSelectionStoreOptions<
  TSelectionItem extends SelectionItem = SelectionItem,
> {
  value?: readonly TSelectionItem[]
  defaultValue?: readonly TSelectionItem[]
}

export interface SelectionStoreSnapshot<
  TSelectionItem extends SelectionItem = SelectionItem,
> {
  isControlled: boolean
  value: readonly TSelectionItem[]
}

export interface SelectionStoreChange<
  TSelectionItem extends SelectionItem = SelectionItem,
> extends SelectionChangeEvent<TSelectionItem> {
  didChange: boolean
}

export interface SelectionStore<
  TSelectionItem extends SelectionItem = SelectionItem,
> {
  getSnapshot(): SelectionStoreSnapshot<TSelectionItem>
  syncExternalValue(nextValue: readonly TSelectionItem[]): SelectionStoreChange<TSelectionItem>
  replaceSelectorItems(
    selectorId: SelectorId,
    nextItems: readonly TSelectionItem[],
    source?: ValueChangeSource,
  ): SelectionStoreChange<TSelectionItem>
  removeSelectorItems(
    selectorId: SelectorId,
    itemIds?: readonly string[],
    source?: ValueChangeSource,
  ): SelectionStoreChange<TSelectionItem>
  clear(
    selectorId?: SelectorId,
    source?: ValueChangeSource,
  ): SelectionStoreChange<TSelectionItem>
}

export interface PanelStateSnapshot {
  isOpen: boolean
  activeSelectorId: SelectorId | null
}

export interface PanelStateController {
  getSnapshot(): PanelStateSnapshot
  open(selectorId: SelectorId, source?: ValueChangeSource): PanelOpenChangeEvent | null
  close(source?: ValueChangeSource): PanelOpenChangeEvent | null
  toggle(selectorId: SelectorId, source?: ValueChangeSource): PanelOpenChangeEvent | null
}

export interface CreateHeadlessCoreControllerOptions<
  TSelectionItem extends SelectionItem = SelectionItem,
> extends ValidateComposableSearchConfigurationInput<TSelectionItem> {
  onSelectionChange?: (event: SelectionChangeEvent<TSelectionItem>) => void
  onPanelOpenChange?: (event: PanelOpenChangeEvent) => void
  onError?: (event: SelectorPluginErrorEvent) => void
}

export interface HeadlessCoreControllerState<
  TSelectionItem extends SelectionItem = SelectionItem,
> {
  selectors: readonly SelectorDefinition[]
  plugins: readonly ResolvedSelectorPluginBinding[]
  value: readonly TSelectionItem[]
  isControlled: boolean
  activeSelectorId: SelectorId | null
  isPanelOpen: boolean
}

export interface HeadlessCoreController<
  TSelectionItem extends SelectionItem = SelectionItem,
> {
  getState(): HeadlessCoreControllerState<TSelectionItem>
  syncExternalValue(nextValue: readonly TSelectionItem[]): SelectionChangeEvent<TSelectionItem> | null
  replaceSelection(
    selectorId: SelectorId,
    nextItems: readonly TSelectionItem[],
    source?: ValueChangeSource,
  ): SelectionChangeEvent<TSelectionItem> | null
  removeSelection(
    selectorId: SelectorId,
    itemIds?: readonly string[],
    source?: ValueChangeSource,
  ): SelectionChangeEvent<TSelectionItem> | null
  clearSelection(
    selectorId?: SelectorId,
    source?: ValueChangeSource,
  ): SelectionChangeEvent<TSelectionItem> | null
  openPanel(selectorId: SelectorId, source?: ValueChangeSource): PanelOpenChangeEvent | null
  closePanel(source?: ValueChangeSource): PanelOpenChangeEvent | null
  togglePanel(selectorId: SelectorId, source?: ValueChangeSource): PanelOpenChangeEvent | null
  destroy(): void
}
