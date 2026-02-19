import type { CSSProperties } from 'react'

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

export type ComposableSelectItem = SelectedCondition | SelectedRegionCondition

export interface RegionSelectOptions {
  placeHolder?: string
  onChange?: (selectedItems: ComposableSelectItem[]) => void
  onSelectedEupmyeondong?: (selected: Region) => void
  onClick?: () => void
}

export interface RegionSelectProps {
  type: 'region'
  findAllSidos: () => Region[]
  findAllSigungus: (sidoCode: string) => Region[]
  findAllEupmyeondongs: (sigunguCode: string) => Region[]
  options?: RegionSelectOptions
}

export interface KeywordSelectOptions {
  placeHolder?: string
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

