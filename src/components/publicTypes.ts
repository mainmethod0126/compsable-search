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

export type RegionSelectionItem = SelectedRegionCondition

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

export interface RegionSelectOptions {
  placeHolder?: string
  onChange?: (selectedItems: RegionSelectionItem[]) => void
  onSelectedEupmyeondong?: (selected: Region) => void
  onClick?: () => void
}

export interface RegionSelectProps extends RegionDataSource {
  type: 'region'
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
