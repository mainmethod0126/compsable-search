import type {
  KeywordSelectOptions,
  KeywordSelectProps,
  Region,
  RegionSelectOptions,
  RegionSelectProps,
  SelectedRegionCondition,
} from './publicTypes'

export const LEGACY_REGION_SELECTOR_ID = 'legacy-region-selector'

export type InternalRegionSelector = Readonly<RegionSelectProps>
export type InternalRegionSelectOptions = Readonly<RegionSelectOptions>
export type InternalKeywordSelector = Readonly<KeywordSelectProps>
export type InternalKeywordSelectOptions = Readonly<KeywordSelectOptions>
export type InternalSelectedRegionCondition = Readonly<SelectedRegionCondition>

export type RegionConditionToggleHandler = (
  nextCondition: InternalSelectedRegionCondition,
  selectedRegion: Region,
) => void
