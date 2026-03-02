import type {
  SelectionItem,
  SelectorDefinition,
  SelectorType,
} from '../types'

export function createSelector<
  TProps,
  TType extends SelectorType,
  TSelection extends SelectionItem,
>(
  definition: SelectorDefinition<TProps, TType, TSelection>,
): SelectorDefinition<TProps, TType, TSelection> {
  return definition
}
