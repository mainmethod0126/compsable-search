import { describe, expect, it, vi } from 'vitest'
import {
  createSelectorPluginBindingKey,
  dispatchPluginLifecycle,
  dispatchPluginPanelOpenChange,
  dispatchPluginSelectionChange,
  resolveSelectorPluginBindings,
} from '../src/plugins'
import type {
  PanelOpenChangeEvent,
  SelectionChangeEvent,
  SelectorDefinition,
} from '../src/types'

function createSelector(id: string, type: string): SelectorDefinition {
  return {
    id,
    type,
  }
}

const selectors = [
  createSelector('region-main', 'region'),
  createSelector('region-secondary', 'region'),
  createSelector('keyword-main', 'keyword'),
] as const

describe('resolveSelectorPluginBindings', () => {
  it('selectorTypes target은 같은 type의 모든 selector로 해석하고 안정 바인딩 키를 만든다', () => {
    const bindings = resolveSelectorPluginBindings(selectors, [
      {
        id: 'region-observer',
        version: '2',
        target: {
          kind: 'selectorTypes',
          selectorTypes: ['region'],
        },
      },
    ])

    expect(bindings).toHaveLength(2)
    expect(bindings.map((binding) => binding.selector.id)).toEqual([
      'region-main',
      'region-secondary',
    ])
    expect(bindings.map((binding) => binding.bindingKey)).toEqual([
      'region-observer@2:region-main,region-secondary',
      'region-observer@2:region-main,region-secondary',
    ])
    expect(bindings[0]?.resolvedTarget.selectorIds).toEqual([
      'region-main',
      'region-secondary',
    ])
  })

  it('selectorIds target과 all target 모두 selector 순서를 유지한다', () => {
    const [selectorIdPluginBindings, allPluginBindings] = [
      resolveSelectorPluginBindings(selectors, [
        {
          id: 'targeted',
          target: {
            kind: 'selectorIds',
            selectorIds: ['keyword-main', 'region-main'],
          },
        },
      ]),
      resolveSelectorPluginBindings(selectors, [
        {
          id: 'all',
          target: {
            kind: 'all',
          },
        },
      ]),
    ]

    expect(selectorIdPluginBindings.map((binding) => binding.selector.id)).toEqual([
      'region-main',
      'keyword-main',
    ])
    expect(allPluginBindings.map((binding) => binding.selector.id)).toEqual([
      'region-main',
      'region-secondary',
      'keyword-main',
    ])
  })

  it('binding key는 selectorIds를 정렬해 안정적으로 계산한다', () => {
    expect(
      createSelectorPluginBindingKey(
        { id: 'telemetry', version: 3 },
        {
          selectorIds: ['keyword-main', 'region-main'],
        },
      ),
    ).toBe('telemetry@3:keyword-main,region-main')
  })
})

describe('dispatchPluginSelectionChange', () => {
  it('meta.selectorId가 있으면 해당 binding에만 dispatch한다', () => {
    const regionMainSelection = vi.fn()
    const regionSecondarySelection = vi.fn()
    const keywordSelection = vi.fn()

    const bindings = resolveSelectorPluginBindings(selectors, [
      {
        id: 'region-main-observer',
        target: {
          kind: 'selectorIds',
          selectorIds: ['region-main'],
        },
        onSelectionChange: regionMainSelection,
      },
      {
        id: 'region-secondary-observer',
        target: {
          kind: 'selectorIds',
          selectorIds: ['region-secondary'],
        },
        onSelectionChange: regionSecondarySelection,
      },
      {
        id: 'keyword-observer',
        target: {
          kind: 'selectorIds',
          selectorIds: ['keyword-main'],
        },
        onSelectionChange: keywordSelection,
      },
    ])

    const event: SelectionChangeEvent = {
      currentValue: [],
      nextValue: [
        {
          id: 'region:seoul',
          displayName: '서울',
          selectorId: 'region-main',
        },
      ],
      meta: {
        source: 'selector',
        reason: 'add',
        selectorId: 'region-main',
      },
    }

    dispatchPluginSelectionChange(bindings, event)

    expect(regionMainSelection).toHaveBeenCalledTimes(1)
    expect(regionSecondarySelection).not.toHaveBeenCalled()
    expect(keywordSelection).not.toHaveBeenCalled()
  })

  it('meta.selectorId가 없으면 모든 binding에 broadcast한다', () => {
    const handlers = [vi.fn(), vi.fn(), vi.fn()]
    const bindings = resolveSelectorPluginBindings(selectors, [
      {
        id: 'broadcast-a',
        target: { kind: 'selectorIds', selectorIds: ['region-main'] },
        onSelectionChange: handlers[0],
      },
      {
        id: 'broadcast-b',
        target: { kind: 'selectorIds', selectorIds: ['region-secondary'] },
        onSelectionChange: handlers[1],
      },
      {
        id: 'broadcast-c',
        target: { kind: 'selectorIds', selectorIds: ['keyword-main'] },
        onSelectionChange: handlers[2],
      },
    ])

    dispatchPluginSelectionChange(bindings, {
      currentValue: [],
      nextValue: [],
      meta: {
        source: 'external',
        reason: 'clear-all',
      },
    })

    expect(handlers[0]).toHaveBeenCalledTimes(1)
    expect(handlers[1]).toHaveBeenCalledTimes(1)
    expect(handlers[2]).toHaveBeenCalledTimes(1)
  })
})

describe('dispatchPluginPanelOpenChange', () => {
  it('close는 previousSelectorId binding에만 dispatch한다', () => {
    const regionMainPanel = vi.fn()
    const keywordPanel = vi.fn()

    const bindings = resolveSelectorPluginBindings(selectors, [
      {
        id: 'region-main-panel',
        target: { kind: 'selectorIds', selectorIds: ['region-main'] },
        onPanelOpenChange: regionMainPanel,
      },
      {
        id: 'keyword-panel',
        target: { kind: 'selectorIds', selectorIds: ['keyword-main'] },
        onPanelOpenChange: keywordPanel,
      },
    ])

    const closeEvent: PanelOpenChangeEvent = {
      previousSelectorId: 'region-main',
      currentSelectorId: null,
      isOpen: false,
      reason: 'close',
      source: 'external',
    }

    dispatchPluginPanelOpenChange(bindings, closeEvent)

    expect(regionMainPanel).toHaveBeenCalledTimes(1)
    expect(keywordPanel).not.toHaveBeenCalled()
  })

  it('switch는 previous/current selector binding 모두에 dispatch한다', () => {
    const regionMainPanel = vi.fn()
    const keywordPanel = vi.fn()
    const regionSecondaryPanel = vi.fn()

    const bindings = resolveSelectorPluginBindings(selectors, [
      {
        id: 'region-main-panel',
        target: { kind: 'selectorIds', selectorIds: ['region-main'] },
        onPanelOpenChange: regionMainPanel,
      },
      {
        id: 'keyword-panel',
        target: { kind: 'selectorIds', selectorIds: ['keyword-main'] },
        onPanelOpenChange: keywordPanel,
      },
      {
        id: 'region-secondary-panel',
        target: { kind: 'selectorIds', selectorIds: ['region-secondary'] },
        onPanelOpenChange: regionSecondaryPanel,
      },
    ])

    dispatchPluginPanelOpenChange(bindings, {
      previousSelectorId: 'region-main',
      currentSelectorId: 'keyword-main',
      isOpen: true,
      reason: 'switch',
      source: 'selector',
    })

    expect(regionMainPanel).toHaveBeenCalledTimes(1)
    expect(keywordPanel).toHaveBeenCalledTimes(1)
    expect(regionSecondaryPanel).not.toHaveBeenCalled()
  })
})

describe('plugin error isolation', () => {
  it('hook 오류는 plugin.onError로 격리 dispatch하고 throw하지 않는다', () => {
    const onSelectionChange = vi.fn(() => {
      throw new Error('selection-hook-failed')
    })
    const onError = vi.fn()
    const externalOnError = vi.fn()

    const [binding] = resolveSelectorPluginBindings(selectors, [
      {
        id: 'telemetry',
        target: {
          kind: 'selectorIds',
          selectorIds: ['region-main'],
        },
        onSelectionChange,
        onError,
      },
    ])

    dispatchPluginSelectionChange(
      binding ? [binding] : [],
      {
        currentValue: [],
        nextValue: [],
        meta: {
          source: 'selector',
          reason: 'replace',
          selectorId: 'region-main',
        },
      },
      externalOnError,
    )

    expect(onSelectionChange).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        pluginId: 'telemetry',
        selectorId: 'region-main',
        sourceHookName: 'onSelectionChange',
      }),
    )
    expect(externalOnError).toHaveBeenCalledTimes(1)
    expect(externalOnError.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        pluginId: 'telemetry',
        selectorId: 'region-main',
        sourceHookName: 'onSelectionChange',
      }),
    )
  })

  it('plugin.onError가 다시 실패하면 외부 onError 콜백으로만 보고하고 swallow한다', () => {
    const externalOnError = vi.fn()
    const lifecycle = vi.fn(() => {
      throw new Error('init-failed')
    })
    const onError = vi.fn(() => {
      throw new Error('onError-failed')
    })

    const [binding] = resolveSelectorPluginBindings(selectors, [
      {
        id: 'telemetry',
        target: {
          kind: 'selectorIds',
          selectorIds: ['region-main'],
        },
        onInit: lifecycle,
        onError,
      },
    ])

    expect(() =>
      binding ? dispatchPluginLifecycle(binding, 'onInit', externalOnError) : undefined,
    ).not.toThrow()

    expect(lifecycle).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(1)
    expect(externalOnError).toHaveBeenCalledTimes(2)
    expect(externalOnError.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        pluginId: 'telemetry',
        selectorId: 'region-main',
        sourceHookName: 'onError',
      }),
    )
    expect(externalOnError.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({
        pluginId: 'telemetry',
        selectorId: 'region-main',
        sourceHookName: 'onInit',
      }),
    )
  })
})
