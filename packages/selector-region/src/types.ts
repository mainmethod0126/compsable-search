import type { ReactNode } from 'react'

export type MaybePromise<T> = T | Promise<T>

export type SelectorType = string

export interface SelectionItem {
  id: string
  displayName: string
  selectorId: string
  payload?: unknown
}

export interface SelectorLoadContext {
  signal: AbortSignal
}

type BivariantCallback<TArgs extends unknown[], TResult = void> = {
  bivarianceHack(...args: TArgs): TResult
}['bivarianceHack']

export interface SelectorPanelProps<
  TProps = unknown,
  TItem extends SelectionItem = SelectionItem,
> {
  selectorId: string
  selectorType: SelectorType
  props: TProps
  selectedItems: TItem[]
  setSelectedItems: (nextItems: TItem[]) => void
  closePanel: () => void
  emitError: (error: unknown) => void
}

export interface SelectorDriverLifecycleContext<
  TProps = unknown,
  TType extends SelectorType = SelectorType,
> {
  selectorId: string
  selectorType: TType
  props: TProps
}

export interface SelectorDriver<
  TProps = unknown,
  TType extends SelectorType = SelectorType,
  TItem extends SelectionItem = SelectionItem,
> {
  type: TType
  loadItems?: BivariantCallback<
    [context: SelectorLoadContext, props: TProps],
    MaybePromise<readonly TItem[]>
  >
  getTriggerLabel: BivariantCallback<[props: TProps], string>
  renderPanel: BivariantCallback<
    [panelProps: SelectorPanelProps<TProps, TItem>],
    ReactNode
  >
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
  searchInputLabel?: string
  searchInputPlaceholder?: string
  searchIdleMessage?: string
  searchLoadingMessage?: string
  searchNoResultMessage?: string
  searchErrorMessage?: string
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

export interface SelectedRegionCondition extends SelectionItem {
  selectorType?: SelectorType
  sido: Region
  sigungu: Region
  eupmyeondong: Region
}

export type RegionSelectionItem = SelectedRegionCondition
export type SearchSelectionItem = SelectionItem

export interface SelectorDefinition<
  TProps = unknown,
  TType extends SelectorType = SelectorType,
  TItem extends SelectionItem = SelectionItem,
> {
  id: string
  type: TType
  version?: string | number
  props: TProps
  driver: SelectorDriver<TProps, TType, TItem>
}

export type RegionSelectorDriver = SelectorDriver<
  RegionSelectorProps,
  'region',
  SelectionItem
>

export type RegionSelectorDefinition = SelectorDefinition<
  RegionSelectorProps,
  'region',
  SelectionItem
>
