import { RegionSelectorPanel } from './RegionSelectorPanel'
import {
  buildRegionSearchIndex,
  mapRegionSearchResultToCondition,
} from './regionSearchModel'
import type {
  RegionSelectorDefinition,
  RegionSelectorDriver,
  RegionSelectorProps,
} from './types'

export interface CreateRegionSelectorOptions {
  driver?: RegionSelectorDriver
  version?: string | number
}

function createRegionDriver(selectorId: string): RegionSelectorDriver {
  return {
    type: 'region',
    loadItems: async (context, props) => {
      try {
        const index = await Promise.resolve(buildRegionSearchIndex(props, context))
        if (context.signal.aborted) {
          return []
        }

        return index.map((result) =>
          mapRegionSearchResultToCondition(result, {
            selectorId,
          }).condition,
        )
      } catch (error) {
        if (context.signal.aborted) {
          return []
        }

        throw error
      }
    },
    getTriggerLabel: (props) => props.options?.placeholder ?? '지역 선택',
    renderPanel: (panelProps) => <RegionSelectorPanel {...panelProps} />,
  }
}

export function createRegionSelector(
  id: string,
  props: RegionSelectorProps,
  options: CreateRegionSelectorOptions = {},
): RegionSelectorDefinition {
  return {
    id,
    type: 'region',
    version: options.version,
    props,
    driver: options.driver ?? createRegionDriver(id),
  }
}
