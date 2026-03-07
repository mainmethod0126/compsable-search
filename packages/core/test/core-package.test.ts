import { describe, expect, it, vi } from 'vitest'
import {
  createHeadlessCoreController,
  createSelector,
  validateComposableSearchConfiguration,
} from '../src/index'
import type {
  SelectionItem,
  SelectorDefinition,
  SelectorPlugin,
} from '../src/index'

function createSelectorDefinition(
  id: string,
  type: string,
): SelectorDefinition<{ label: string }> {
  return createSelector({
    id,
    type,
    config: {
      label: `${id} label`,
    },
  })
}

function createSelectionItem(
  id: string,
  selectorId: string,
): SelectionItem<{ raw: string }> {
  return {
    id,
    displayName: `${selectorId}:${id}`,
    selectorId,
    payload: {
      raw: id,
    },
  }
}

describe('@compsable-search/core headless facade', () => {
  it('exports headless core helpers', () => {
    expect(typeof createSelector).toBe('function')
    expect(typeof createHeadlessCoreController).toBe('function')
    expect(typeof validateComposableSearchConfiguration).toBe('function')
  })

  it('preserves selector definitions through createSelector', () => {
    const selector = createSelector({
      id: 'custom-1',
      type: 'custom',
      config: { label: 'Custom selector' },
    })

    expect(selector.id).toBe('custom-1')
    expect(selector.type).toBe('custom')
    expect(selector.config).toEqual({ label: 'Custom selector' })
  })

  it('runs selection/panel/plugin state without React and allows duplicate selector.type', () => {
    const selectionEvents: Array<{ selectorId?: string; nextIds: string[] }> = []
    const panelEvents: string[] = []
    const pluginInit = vi.fn()
    const pluginDispose = vi.fn()
    const pluginSelection = vi.fn()
    const pluginPanel = vi.fn()

    const selectors = [
      createSelectorDefinition('region-main', 'region'),
      createSelectorDefinition('region-secondary', 'region'),
      createSelectorDefinition('keyword-main', 'keyword'),
    ]

    const plugins: readonly SelectorPlugin[] = [
      {
        id: 'region-observer',
        version: '1',
        target: {
          kind: 'selectorTypes',
          selectorTypes: ['region'],
        },
        onInit: (context) => {
          pluginInit(context.selector.id)
        },
        onDispose: (context) => {
          pluginDispose(context.selector.id)
        },
        onSelectionChange: (event) => {
          pluginSelection(event.meta.selectorId)
        },
        onPanelOpenChange: (event) => {
          pluginPanel(
            `${event.previousSelectorId ?? 'none'}->${event.currentSelectorId ?? 'none'}`,
          )
        },
      },
    ]

    const controller = createHeadlessCoreController({
      selectors,
      plugins,
      defaultValue: [createSelectionItem('seed', 'region-main')],
      onSelectionChange: (event) => {
        selectionEvents.push({
          selectorId: event.meta.selectorId,
          nextIds: event.nextValue.map((item) => item.id),
        })
      },
      onPanelOpenChange: (event) => {
        panelEvents.push(
          `${event.reason}:${event.previousSelectorId ?? 'none'}->${event.currentSelectorId ?? 'none'}`,
        )
      },
    })

    const replaceEvent = controller.replaceSelection('region-secondary', [
      createSelectionItem('region:seoul', 'region-secondary'),
    ])
    const panelOpenEvent = controller.openPanel('region-secondary')
    const panelSwitchEvent = controller.togglePanel('keyword-main')
    const state = controller.getState()
    controller.destroy()

    expect(validateComposableSearchConfiguration({ selectors }).isValid).toBe(true)
    expect(replaceEvent?.meta.selectorId).toBe('region-secondary')
    expect(replaceEvent?.nextValue.map((item) => item.selectorId)).toEqual([
      'region-main',
      'region-secondary',
    ])
    expect(panelOpenEvent?.reason).toBe('open')
    expect(panelSwitchEvent?.reason).toBe('switch')
    expect(state.isPanelOpen).toBe(true)
    expect(state.activeSelectorId).toBe('keyword-main')
    expect(state.value.map((item) => item.selectorId)).toEqual([
      'region-main',
      'region-secondary',
    ])

    expect(selectionEvents).toEqual([
      {
        selectorId: 'region-secondary',
        nextIds: ['seed', 'region:seoul'],
      },
    ])
    expect(panelEvents).toEqual([
      'open:none->region-secondary',
      'switch:region-secondary->keyword-main',
    ])
    expect(pluginInit).toHaveBeenCalledTimes(2)
    expect(pluginInit).toHaveBeenCalledWith('region-main')
    expect(pluginInit).toHaveBeenCalledWith('region-secondary')
    expect(pluginSelection).toHaveBeenCalledTimes(1)
    expect(pluginSelection).toHaveBeenCalledWith('region-secondary')
    expect(pluginPanel).toHaveBeenCalledWith('none->region-secondary')
    expect(pluginPanel).toHaveBeenCalledWith('region-secondary->keyword-main')
    expect(pluginDispose).toHaveBeenCalledTimes(2)
  })
})
