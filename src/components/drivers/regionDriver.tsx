import { RegionDetailPanel } from '../RegionDetailPanel'
import {
  buildRegionSearchIndex,
  mapRegionSearchResultToCondition,
} from '../regionSearchModel'
import { toggleRegionCondition } from '../selectionPolicy'
import type {
  Region,
  RegionSelectorDriver,
  SelectionItem,
  SelectedRegionCondition,
} from '../types'

export interface CreateRegionDriverOptions {
  selectorId: string
}

function isRegionSelectionItem(
  item: SelectionItem,
): item is SelectedRegionCondition {
  return 'sido' in item && 'sigungu' in item && 'eupmyeondong' in item
}

export function createRegionDriver(
  options: CreateRegionDriverOptions,
): RegionSelectorDriver {
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
            selectorId: options.selectorId,
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
    renderPanel: ({
      selectorId,
      props,
      selectedItems,
      setSelectedItems,
      emitError,
    }) => {
      const regionSelectedItems = selectedItems.filter(isRegionSelectionItem)

      const handleToggleRegionCondition = (
        nextCondition: SelectedRegionCondition,
        selectedRegion: Region,
      ) => {
        try {
          const wasSelected = regionSelectedItems.some(
            (condition) => condition.id === nextCondition.id,
          )
          const nextSelectedItems = toggleRegionCondition(
            regionSelectedItems,
            nextCondition,
          )
          setSelectedItems(nextSelectedItems)

          if (!wasSelected) {
            props.options?.onSelectedEupmyeondong?.(selectedRegion)
          }
        } catch (error) {
          emitError(error)
        }
      }

      return (
        <RegionDetailPanel
          selectorId={selectorId}
          selector={props}
          selectedConditions={regionSelectedItems}
          onToggleRegionCondition={handleToggleRegionCondition}
        />
      )
    },
  }
}
