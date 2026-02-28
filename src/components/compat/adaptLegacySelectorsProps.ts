import type { ComposableSelectProps, SelectorInstance } from '../types'
import { createKeywordSelector } from '../selectors/createKeywordSelector'
import { createRegionSelector } from '../selectors/createRegionSelector'

export function adaptLegacySelectorsProps(
  selectorsProps: ComposableSelectProps[],
): SelectorInstance[] {
  return selectorsProps.map((selectorProps, index) => {
    if (selectorProps.type === 'region') {
      return createRegionSelector(`region-${index}`, selectorProps)
    }

    return createKeywordSelector(`keyword-${index}`, selectorProps)
  })
}
