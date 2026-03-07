import { describe, expect, it } from 'vitest'
import {
  createSelector,
  createSelectorPluginRegistry,
  validateComposableSearchConfiguration,
} from '../src/index'

describe('@compsable-search/core facade', () => {
  it('exports core contract helpers', () => {
    expect(typeof createSelector).toBe('function')
    expect(typeof createSelectorPluginRegistry).toBe('function')
    expect(typeof validateComposableSearchConfiguration).toBe('function')
  })

  it('preserves selector definitions through createSelector', () => {
    const selector = createSelector({
      id: 'custom-1',
      type: 'custom',
      props: { label: 'Custom selector' },
      driver: {
        type: 'custom',
        getTriggerLabel: () => 'Custom selector',
        renderPanel: () => null,
      },
    })

    expect(selector.id).toBe('custom-1')
    expect(selector.type).toBe('custom')
    expect(selector.driver.getTriggerLabel(selector.props)).toBe('Custom selector')
  })
})
