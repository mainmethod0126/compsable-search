import type { SelectorDefinition, SelectorType } from './types'

export function createSelector<
  TConfig,
  TType extends SelectorType,
>(
  definition: SelectorDefinition<TConfig> & { type: TType },
): SelectorDefinition<TConfig> & { type: TType } {
  return definition
}
