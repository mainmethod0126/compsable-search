import type {
  RegionSelectorDefinition,
  RegionSelectorDriver,
  RegionSelectorProps,
} from '../types'
import { createRegionDriver } from '../drivers/regionDriver'
import { createSelector } from './createSelector'

export interface CreateRegionSelectorOptions {
  driver?: RegionSelectorDriver
  version?: string | number
}

export function createRegionSelector(
  id: string,
  props: RegionSelectorProps,
  options: CreateRegionSelectorOptions = {},
): RegionSelectorDefinition {
  const defaultDriver: RegionSelectorDriver = createRegionDriver({
    selectorId: id,
  })

  return createSelector({
    id,
    type: 'region',
    version: options.version,
    props,
    driver: options.driver ?? defaultDriver,
  })
}
