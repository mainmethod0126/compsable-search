import { describe, expect, it } from 'vitest'
import { createPanelStateController } from '../src/panel'
import { createSelectionStore } from '../src/store'
import type { SelectionItem } from '../src/types'

function createItem(id: string, selectorId: string): SelectionItem {
  return {
    id,
    displayName: id,
    selectorId,
  }
}

describe('createSelectionStore', () => {
  it('controlled 모드에서는 replace가 nextValue만 계산하고 rendered value는 유지한다', () => {
    const externalValue = [createItem('region:seoul', 'region-main')]
    const store = createSelectionStore({
      value: externalValue,
      defaultValue: [createItem('keyword:react', 'keyword-main')],
    })

    const change = store.replaceSelectorItems('keyword-main', [
      createItem('keyword:vitest', 'keyword-main'),
    ])

    expect(change.didChange).toBe(true)
    expect(change.meta).toEqual({
      source: 'selector',
      reason: 'add',
      selectorId: 'keyword-main',
    })
    expect(change.currentValue).toEqual(externalValue)
    expect(change.nextValue).toEqual([
      createItem('region:seoul', 'region-main'),
      createItem('keyword:vitest', 'keyword-main'),
    ])
    expect(store.getSnapshot()).toEqual({
      isControlled: true,
      value: externalValue,
    })
  })

  it('controlled 모드의 syncExternalValue는 external source와 비교 기반 reason을 사용한다', () => {
    const store = createSelectionStore({
      value: [createItem('region:seoul', 'region-main')],
    })

    const cleared = store.syncExternalValue([])

    expect(cleared.meta).toEqual({
      source: 'external',
      reason: 'clear-all',
      selectorId: undefined,
    })
    expect(store.getSnapshot()).toEqual({
      isControlled: true,
      value: [],
    })
  })

  it('uncontrolled 모드에서는 replace/remove/clear가 내부 상태를 실제로 갱신한다', () => {
    const store = createSelectionStore({
      defaultValue: [createItem('region:seoul', 'region-main')],
    })

    const added = store.replaceSelectorItems('keyword-main', [
      createItem('keyword:react', 'keyword-main'),
    ])
    expect(added.meta.reason).toBe('add')
    expect(store.getSnapshot().value).toEqual([
      createItem('region:seoul', 'region-main'),
      createItem('keyword:react', 'keyword-main'),
    ])

    const removed = store.removeSelectorItems('keyword-main', undefined, 'external')
    expect(removed.meta).toEqual({
      source: 'external',
      reason: 'remove',
      selectorId: 'keyword-main',
    })
    expect(store.getSnapshot().value).toEqual([
      createItem('region:seoul', 'region-main'),
    ])

    const cleared = store.clear(undefined, 'external')
    expect(cleared.meta).toEqual({
      source: 'external',
      reason: 'clear-all',
      selectorId: undefined,
    })
    expect(store.getSnapshot().value).toEqual([])
  })

  it('didChange=false여도 current/next/meta를 계산하고 상태는 바꾸지 않는다', () => {
    const initialValue = [createItem('region:seoul', 'region-main')]
    const store = createSelectionStore({
      defaultValue: initialValue,
    })

    const change = store.replaceSelectorItems('region-main', initialValue)

    expect(change.didChange).toBe(false)
    expect(change.meta).toEqual({
      source: 'selector',
      reason: 'replace',
      selectorId: 'region-main',
    })
    expect(store.getSnapshot().value).toEqual(initialValue)
  })

  it('uncontrolled 모드의 syncExternalValue도 내부 상태를 갱신한다', () => {
    const store = createSelectionStore({
      defaultValue: [createItem('region:seoul', 'region-main')],
    })

    const change = store.syncExternalValue([
      createItem('region:seoul', 'region-main'),
      createItem('keyword:react', 'keyword-main'),
    ])

    expect(change.meta).toEqual({
      source: 'external',
      reason: 'add',
      selectorId: undefined,
    })
    expect(store.getSnapshot().value).toEqual([
      createItem('region:seoul', 'region-main'),
      createItem('keyword:react', 'keyword-main'),
    ])
  })
})

describe('createPanelStateController', () => {
  it('open/close가 패널 메타를 제공한다', () => {
    const panel = createPanelStateController()

    expect(panel.open('region-main', 'selector')).toEqual({
      previousSelectorId: null,
      currentSelectorId: 'region-main',
      isOpen: true,
      reason: 'open',
      source: 'selector',
    })
    expect(panel.close('external')).toEqual({
      previousSelectorId: 'region-main',
      currentSelectorId: null,
      isOpen: false,
      reason: 'close',
      source: 'external',
    })
  })

  it('다른 selector를 열면 switch 메타를 제공하고 toggle은 동일 selector에서 close로 동작한다', () => {
    const panel = createPanelStateController()

    panel.open('region-main')

    expect(panel.open('keyword-main')).toEqual({
      previousSelectorId: 'region-main',
      currentSelectorId: 'keyword-main',
      isOpen: true,
      reason: 'switch',
      source: 'selector',
    })
    expect(panel.toggle('keyword-main')).toEqual({
      previousSelectorId: 'keyword-main',
      currentSelectorId: null,
      isOpen: false,
      reason: 'close',
      source: 'selector',
    })
  })

  it('동일 상태 재호출 시 null을 반환할 수 있다', () => {
    const panel = createPanelStateController()

    expect(panel.close()).toBeNull()
    panel.open('region-main')
    expect(panel.open('region-main')).toBeNull()
  })
})
