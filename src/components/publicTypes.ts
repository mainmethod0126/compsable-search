/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CSSProperties, ReactNode } from 'react'

export type MaybePromise<T> = T | Promise<T>

export type SelectorType = string
export type ValueChangeReason = 'add' | 'remove' | 'replace' | 'clear'
export type ValueChangeSource = 'selector' | 'external'

export interface SelectionItem {
  id: string
  displayName: string
  selectorId?: string
  selectorType?: SelectorType
  payload?: unknown
}

export interface ValueChangeMeta {
  reason: ValueChangeReason
  source: ValueChangeSource
  selectorId?: string
  selectorType?: SelectorType
}

export interface ChangeMeta {
  reason?: ValueChangeReason
  source: ValueChangeSource | 'region' | 'keyword'
  selectorId?: string
  selectorType?: SelectorType
}

export interface SelectorLoadContext {
  signal: AbortSignal
}

type BivariantCallback<TArgs extends unknown[], TResult = void> = {
  bivarianceHack(...args: TArgs): TResult
}['bivarianceHack']

export interface SelectorPanelProps<
  TProps = any,
  TItem extends SelectionItem = SelectionItem,
> {
  selectorId: string
  selectorType: SelectorType
  props: TProps
  selectedItems: TItem[]
  setSelectedItems: (next: TItem[]) => void
  closePanel: () => void
  emitError: (error: unknown) => void
}

export interface SelectorDriverLifecycleContext<
  TProps = any,
  TType extends SelectorType = SelectorType,
> {
  selectorId: string
  selectorType: TType
  props: TProps
}

export interface SelectorDriver<
  TProps = any,
  TType extends SelectorType = SelectorType,
  TItem extends SelectionItem = SelectionItem,
> {
  type: TType
  loadItems?: BivariantCallback<
    [context: SelectorLoadContext, props: TProps],
    MaybePromise<readonly TItem[]>
  >
  getTriggerLabel: BivariantCallback<[props: TProps], string>
  renderPanel: BivariantCallback<[props: SelectorPanelProps<TProps, TItem>], ReactNode>
  onInit?: BivariantCallback<[context: SelectorDriverLifecycleContext<TProps, TType>]>
  onDispose?: BivariantCallback<[context: SelectorDriverLifecycleContext<TProps, TType>]>
}

export interface Region {
  displayName: string
  name: string
  code: string
}

export interface RegionDataSource {
  findAllSidos: (context?: SelectorLoadContext) => MaybePromise<Region[]>
  findAllSigungus: (
    sidoCode: string,
    context?: SelectorLoadContext,
  ) => MaybePromise<Region[]>
  findAllEupmyeondongs: (
    sigunguCode: string,
    context?: SelectorLoadContext,
  ) => MaybePromise<Region[]>
}

export interface RegionSelectOptions {
  placeholder?: string
  placeHolder?: string
  searchInputLabel?: string
  searchInputPlaceholder?: string
  searchIdleMessage?: string
  searchNoResultMessage?: string
  searchResultLimit?: number
  searchInputIcon?: ReactNode
  onChange?: (selectedItems: SearchSelectionItem[]) => void
  onSelectedEupmyeondong?: (selected: Region) => void
  onClick?: () => void
}

export interface RegionSelectorProps extends RegionDataSource {
  options?: RegionSelectOptions
}

export interface RegionSelectProps extends RegionSelectorProps {
  type?: 'region'
}

export type KeywordNormalizationCasePolicy = 'preserve' | 'lower'

export interface KeywordNormalizationPolicy {
  trim?: boolean
  collapseWhitespace?: boolean
  casePolicy?: KeywordNormalizationCasePolicy
}

export type KeywordInputErrorCode =
  | 'empty-token'
  | 'duplicate-token'
  | 'token-too-long'
  | 'max-token-reached'

export interface KeywordInvalidTokenContext {
  inputValue: string
  normalizedValue: string
  maxTokens: number
  maxTokenLength: number
}

export interface KeywordSelectOptions {
  placeholder?: string
  placeHolder?: string
  inputPlaceholder?: string
  label?: string
  guideText?: string
  maxTokens?: number
  maxTokenLength?: number
  normalization?: KeywordNormalizationPolicy
  onInvalidToken?: (
    error: KeywordInputErrorCode,
    context: KeywordInvalidTokenContext,
  ) => void
  onClick?: () => void
}

export interface KeywordSelectorProps {
  options?: KeywordSelectOptions
}

export interface KeywordSelectProps extends KeywordSelectorProps {
  type?: 'keyword'
}

export type SelectedCondition = SelectionItem

export interface SelectedRegionCondition extends SelectedCondition {
  selectorType?: SelectorType
  sido: Region
  sigungu: Region
  eupmyeondong: Region
}

export interface SelectedKeywordCondition extends SelectedCondition {
  selectorType?: SelectorType
  keyword: string
  normalizedKeyword: string
}

export type RegionSelectionItem = SelectedRegionCondition
export type SearchSelectionItem = SelectionItem
export type ComposableSearchValue = SearchSelectionItem[]

export type ComposableSelectProps =
  | (RegionSelectorProps & { type: 'region' })
  | (KeywordSelectorProps & { type: 'keyword' })

export interface SelectorDefinition<
  TProps = any,
  TType extends SelectorType = SelectorType,
  TItem extends SelectionItem = SelectionItem,
> {
  id: string
  type: TType
  version?: string | number
  props: TProps
  driver: SelectorDriver<TProps, TType, TItem>
}

export type SelectorInstance<
  TType extends SelectorType = SelectorType,
  TProps = any,
  TItem extends SelectionItem = SelectionItem,
> = SelectorDefinition<TProps, TType, TItem>

export type RegionSelectorDriver = SelectorDriver<
  RegionSelectorProps,
  'region',
  SelectionItem
>

export type KeywordSelectorDriver = SelectorDriver<
  KeywordSelectorProps,
  'keyword',
  SelectionItem
>

export type RegionSelectorDefinition = SelectorDefinition<
  RegionSelectorProps,
  'region',
  SelectionItem
>

export type KeywordSelectorDefinition = SelectorDefinition<
  KeywordSelectorProps,
  'keyword',
  SelectionItem
>

export interface SelectorPluginLifecycleContext {
  selector: SelectorDefinition<any, any, SelectionItem>
}

export interface SelectionChangeEvent {
  nextValue: SearchSelectionItem[]
  meta: ValueChangeMeta
}

export interface PanelOpenChangeEvent {
  selectorId?: string
  selectorType?: SelectorType
  panelType?: SelectorType | 'none'
  isOpen: boolean
}

export interface SelectorErrorEvent {
  selectorId?: string
  selectorType?: SelectorType
  error: unknown
}

export interface SelectorPlugin<TType extends SelectorType = SelectorType> {
  id: string
  type?: TType
  version?: string | number
  onInit?: BivariantCallback<[context: SelectorPluginLifecycleContext]>
  onDispose?: BivariantCallback<[context: SelectorPluginLifecycleContext]>
  onSelectionChange?: BivariantCallback<[event: SelectionChangeEvent]>
  onPanelOpenChange?: BivariantCallback<[event: PanelOpenChangeEvent]>
  onError?: BivariantCallback<[event: SelectorErrorEvent]>
}

export type AnySelectorPlugin = SelectorPlugin
export type SelectorPluginRegistry = Record<string, AnySelectorPlugin>

export interface ComposableSearchProps {
  selectors: SelectorDefinition<any, any, SelectionItem>[]
  value?: ComposableSearchValue
  defaultValue?: ComposableSearchValue
  onValueChange?: BivariantCallback<
    [nextValue: ComposableSearchValue, meta: ChangeMeta]
  >
  plugins?: SelectorPluginRegistry
  className?: string
  style?: CSSProperties
}
