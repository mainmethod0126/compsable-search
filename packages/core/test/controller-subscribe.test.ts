import { describe, expect, it, vi } from 'vitest'
import { createHeadlessCoreController, createSelector } from '../src/index'
import type { SelectionItem } from '../src/index'

function createSelectionItem(id: string, selectorId: string): SelectionItem {
  return {
    id,
    displayName: `${selectorId}:${id}`,
    selectorId,
  }
}

describe('createHeadlessCoreController subscribe', () => {
  it('selection/panel state change마다 listener를 호출하고 최신 state를 읽을 수 있다', () => {
    const controller = createHeadlessCoreController({
      selectors: [
        createSelector({ id: 'region-main', type: 'region' }),
        createSelector({ id: 'keyword-main', type: 'keyword' }),
      ],
    })
    const snapshots: Array<{
      activeSelectorId: string | null
      isPanelOpen: boolean
      valueIds: string[]
    }> = []
    const listener = vi.fn(() => {
      const state = controller.getState()
      snapshots.push({
        activeSelectorId: state.activeSelectorId,
        isPanelOpen: state.isPanelOpen,
        valueIds: state.value.map((item) => item.id),
      })
    })

    const unsubscribe = controller.subscribe(listener)

    controller.openPanel('region-main')
    controller.replaceSelection('region-main', [
      createSelectionItem('region:seoul', 'region-main'),
    ])
    controller.togglePanel('keyword-main')

    expect(listener).toHaveBeenCalledTimes(3)
    expect(snapshots).toEqual([
      {
        activeSelectorId: 'region-main',
        isPanelOpen: true,
        valueIds: [],
      },
      {
        activeSelectorId: 'region-main',
        isPanelOpen: true,
        valueIds: ['region:seoul'],
      },
      {
        activeSelectorId: 'keyword-main',
        isPanelOpen: true,
        valueIds: ['region:seoul'],
      },
    ])

    unsubscribe()
    controller.closePanel()

    expect(listener).toHaveBeenCalledTimes(3)
  })

  it('no-op state transition에는 listener를 호출하지 않는다', () => {
    const controller = createHeadlessCoreController({
      selectors: [createSelector({ id: 'keyword-main', type: 'keyword' })],
      defaultValue: [createSelectionItem('keyword:react', 'keyword-main')],
    })
    const listener = vi.fn()

    controller.subscribe(listener)

    controller.openPanel('keyword-main')
    controller.openPanel('keyword-main')
    controller.replaceSelection('keyword-main', [
      createSelectionItem('keyword:react', 'keyword-main'),
    ])

    expect(listener).toHaveBeenCalledTimes(1)
  })
})
