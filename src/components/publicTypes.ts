import type { CSSProperties, ReactNode } from 'react'

export interface Region {
  displayName: string
  name: string
  code: string
}

export interface SelectedCondition {
  id: string
  displayName: string
}

export interface SelectedRegionCondition extends SelectedCondition {
  sido: Region
  sigungu: Region
  eupmyeondong: Region
}

export interface SelectedKeywordCondition extends SelectedCondition {
  keyword: string
  normalizedKeyword: string
}

export type RegionSelectionItem = SelectedRegionCondition
export type SearchSelectionItem = SelectedRegionCondition | SelectedKeywordCondition

/**
 * @deprecated `RegionSelectionItem`을 사용하세요.
 * 0.1.x 하위 호환을 위해 유지합니다.
 */
export type ComposableSelectItem = SelectedCondition | SelectedRegionCondition

export interface RegionDataSource {
  findAllSidos: () => Region[]
  findAllSigungus: (sidoCode: string) => Region[]
  findAllEupmyeondongs: (sigunguCode: string) => Region[]
}

type BivariantCallback<TArgs extends unknown[]> = {
  bivarianceHack(...args: TArgs): void
}['bivarianceHack']

export interface RegionSelectOptions {
  placeHolder?: string
  searchInputLabel?: string
  searchInputPlaceholder?: string
  searchIdleMessage?: string
  searchNoResultMessage?: string
  searchResultLimit?: number
  searchInputIcon?: ReactNode
  onChange?: BivariantCallback<[selectedItems: SearchSelectionItem[]]>
  onSelectedEupmyeondong?: (selected: Region) => void
  onClick?: () => void
}

export interface RegionSelectProps extends RegionDataSource {
  type: 'region'
  options?: RegionSelectOptions
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

export interface KeywordSelectProps {
  type: 'keyword'
  options?: KeywordSelectOptions
}

export type ComposableSelectProps = RegionSelectProps | KeywordSelectProps

export interface ComposableSearchProps {
  selectorsProps?: ComposableSelectProps[]
  className?: string
  style?: CSSProperties
  placeHolder?: string
}
