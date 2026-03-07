import type { CSSProperties, ReactNode } from 'react'
import type {
  PanelOpenChangeEvent as CorePanelOpenChangeEvent,
  SelectionItem,
  SelectorPlugin,
  SelectorPluginErrorEvent,
  SelectorType,
  SelectorVersion,
  ValueChangeMeta as CoreValueChangeMeta,
} from '@compsable-search/core'

type BivariantCallback<TArgs extends unknown[], TResult = void> = {
  bivarianceHack(...args: TArgs): TResult
}['bivarianceHack']

export type ComposableSearchValue<
  TSelectionItem extends SelectionItem = SelectionItem,
> = TSelectionItem[]

export interface SelectorPanelProps<
  TProps = unknown,
  TSelectionItem = SelectionItem,
> {
  selectorId: string
  selectorType: SelectorType
  props: TProps
  selectedItems: TSelectionItem[]
  setSelectedItems: (nextItems: TSelectionItem[]) => void
  closePanel: () => void
  emitError: (error: unknown) => void
}

export interface ReactHostSelectorDriver<
  TProps = unknown,
  TType extends SelectorType = SelectorType,
  TSelectionItem = SelectionItem,
> {
  type: TType
  getTriggerLabel: BivariantCallback<[props: TProps], string>
  renderPanel: BivariantCallback<
    [props: SelectorPanelProps<TProps, TSelectionItem>],
    ReactNode
  >
}

export interface ReactHostSelectorDefinition<
  TProps = unknown,
  TType extends SelectorType = SelectorType,
  TSelectionItem = SelectionItem,
> {
  id: string
  type: TType
  version?: SelectorVersion
  props: TProps
  driver: ReactHostSelectorDriver<TProps, TType, TSelectionItem>
}

export interface SelectorErrorEvent {
  selectorId: string
  selectorType: SelectorType
  error: unknown
}

export interface ReactValueChangeMeta extends CoreValueChangeMeta {
  selectorType?: SelectorType
}

export interface ReactPanelOpenChangeEvent extends CorePanelOpenChangeEvent {
  previousSelectorType?: SelectorType
  currentSelectorType?: SelectorType
}

export interface ComposableSearchLabels {
  emptyPanelTitle?: string
  emptyPanelDescription?: string
  selectedBasketTitle?: string
  clearAllButtonLabel?: string
  emptySelectionMessage?: string
  removeSelectionAriaLabel?: (itemDisplayName: string) => string
}

export interface ComposableSearchShellProps {
  labels?: ComposableSearchLabels
}

export interface ComposableSearchProps<
  TSelectionItem extends SelectionItem = SelectionItem,
> extends ComposableSearchShellProps {
  selectors: readonly ReactHostSelectorDefinition<
    unknown,
    SelectorType,
    TSelectionItem
  >[]
  value?: ComposableSearchValue<TSelectionItem>
  defaultValue?: ComposableSearchValue<TSelectionItem>
  onValueChange?: BivariantCallback<
    [nextValue: ComposableSearchValue<TSelectionItem>, meta: ReactValueChangeMeta]
  >
  onPanelOpenChange?: BivariantCallback<[event: ReactPanelOpenChangeEvent]>
  onSelectorError?: BivariantCallback<[event: SelectorErrorEvent]>
  onPluginError?: BivariantCallback<[event: SelectorPluginErrorEvent]>
  plugins?: readonly SelectorPlugin[]
  className?: string
  style?: CSSProperties
}

export interface TriggerListItem {
  id: string
  label: string
  selectedCount: number
  isActive: boolean
  isOpen: boolean
}

export interface TriggerListProps {
  activeSelectorId: string | null
  items: readonly TriggerListItem[]
  onTriggerClick: (selectorId: string) => void
}

export interface PanelContainerProps {
  emptyDescription: string
  emptyTitle: string
  isOpen: boolean
  panelId: string
  title: string
  children: ReactNode
}

export interface SelectedBasketItem {
  id: string
  displayName: string
  selectorId: string
}

export interface SelectedBasketProps {
  clearAllButtonLabel: string
  emptySelectionMessage: string
  items: readonly SelectedBasketItem[]
  removeSelectionAriaLabel: (itemDisplayName: string) => string
  title: string
  onClearAll: () => void
  onRemoveItem: (selectorId: string, itemId: string) => void
}
