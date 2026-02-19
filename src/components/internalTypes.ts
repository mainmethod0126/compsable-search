import type {
  Region,
  RegionSelectOptions,
  RegionSelectProps,
  SelectedRegionCondition,
} from './publicTypes'

export type InternalRegionSelector = Readonly<RegionSelectProps>
export type InternalRegionSelectOptions = Readonly<RegionSelectOptions>
export type InternalSelectedRegionCondition = Readonly<SelectedRegionCondition>

export type RegionConditionToggleHandler = (
  nextCondition: InternalSelectedRegionCondition,
  selectedRegion: Region,
  options?: InternalRegionSelectOptions,
) => void
