import type { RegionSelectProps, SelectorInstance } from '../types'

export type CreateRegionSelectorProps =
  | RegionSelectProps
  | Omit<RegionSelectProps, 'type'>

function normalizeRegionSelectorProps(
  props: CreateRegionSelectorProps,
): RegionSelectProps {
  if ('type' in props) {
    return props
  }

  return {
    ...props,
    type: 'region',
  }
}

export function createRegionSelector(
  id: string,
  props: CreateRegionSelectorProps,
): SelectorInstance<'region'> {
  return {
    id,
    type: 'region',
    props: normalizeRegionSelectorProps(props),
  }
}
