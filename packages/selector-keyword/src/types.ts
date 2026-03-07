import type { KeyboardEventHandler, ReactNode } from 'react'

export type SelectorType = string

export interface SelectionItem {
  id: string
  displayName: string
  selectorId: string
  payload?: unknown
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

export interface SelectorDriver<
  TProps = unknown,
  TType extends SelectorType = SelectorType,
  TItem extends SelectionItem = SelectionItem,
> {
  type: TType
  getTriggerLabel: BivariantCallback<[props: TProps], string>
  renderPanel: BivariantCallback<
    [panelProps: SelectorPanelProps<TProps, TItem>],
    ReactNode
  >
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

export interface SelectedKeywordCondition extends SelectionItem {
  selectorType?: SelectorType
  keyword: string
  normalizedKeyword: string
}

export type SearchSelectionItem = SelectionItem

export interface KeywordDetailPanelProps {
  label: string
  guideText: string
  inputPlaceholder: string
  inputValue: string
  tokenCount: number
  maxTokens: number
  tokens?: SelectedKeywordCondition[]
  errorMessage: string | null
  onInputChange: (value: string) => void
  onInputFocus: () => void
  onInputBlur: () => void
  onInputKeyDown: KeyboardEventHandler<HTMLInputElement>
  onRemoveToken?: (tokenId: string) => void
  onClearAllTokens?: () => void
}

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

export type KeywordSelectorDriver = SelectorDriver<
  KeywordSelectorProps,
  'keyword',
  SelectionItem
>

export type KeywordSelectorDefinition = SelectorDefinition<
  KeywordSelectorProps,
  'keyword',
  SelectionItem
>
