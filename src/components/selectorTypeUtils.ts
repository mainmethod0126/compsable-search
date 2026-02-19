import type {
  ComposableSelectProps,
  KeywordSelectProps,
  RegionSelectProps,
} from './publicTypes'

export type SelectorType = ComposableSelectProps['type']
export type SelectorOfType<TType extends SelectorType> = Extract<
  ComposableSelectProps,
  { type: TType }
>

export function isRegionSelector(
  selector: ComposableSelectProps,
): selector is RegionSelectProps {
  return selector.type === 'region'
}

export function isKeywordSelector(
  selector: ComposableSelectProps,
): selector is KeywordSelectProps {
  return selector.type === 'keyword'
}

export function resolveSelectorByType<TType extends SelectorType>(
  selectors: ComposableSelectProps[],
  type: TType,
): SelectorOfType<TType> | undefined {
  return selectors.find(
    (selector): selector is SelectorOfType<TType> => selector.type === type,
  )
}
