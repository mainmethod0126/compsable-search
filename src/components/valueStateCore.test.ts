import { describe, expect, it } from 'vitest'
import type {
  SelectedKeywordCondition,
  SelectedRegionCondition,
} from './types'
import {
  type SelectionItem,
  areSearchSelectionItemsEqual,
  mergeSearchSelectionItems,
  resolveHybridValueUpdate,
  resolveInitialSelectionState,
  splitSearchSelectionItems,
} from './valueStateCore'

const regionA: SelectedRegionCondition = {
  id: 'region:1168010100',
  displayName: '서울특별시>강남구>역삼동',
  selectorId: 'region-main',
  selectorType: 'region',
  sido: { code: '11', name: '서울특별시', displayName: '서울특별시' },
  sigungu: { code: '11680', name: '강남구', displayName: '강남구' },
  eupmyeondong: { code: '1168010100', name: '역삼동', displayName: '역삼동' },
}

const regionB: SelectedRegionCondition = {
  id: 'region:4111113300',
  displayName: '경기도>수원시 장안구>조원동',
  selectorId: 'region-main',
  selectorType: 'region',
  sido: { code: '41', name: '경기도', displayName: '경기도' },
  sigungu: { code: '41111', name: '수원시 장안구', displayName: '수원시 장안구' },
  eupmyeondong: { code: '4111113300', name: '조원동', displayName: '조원동' },
}

const keywordA: SelectedKeywordCondition = {
  id: 'keyword:react query',
  displayName: '키워드: react query',
  selectorId: 'keyword-main',
  selectorType: 'keyword',
  keyword: 'react query',
  normalizedKeyword: 'react query',
}

const keywordB: SelectedKeywordCondition = {
  id: 'keyword:vitest',
  displayName: '키워드: vitest',
  selectorId: 'keyword-main',
  selectorType: 'keyword',
  keyword: 'vitest',
  normalizedKeyword: 'vitest',
}

function cloneSelectionItems(items: SelectionItem[]): SelectionItem[] {
  return items.map((item) =>
    'normalizedKeyword' in item
      ? { ...item }
      : 'sido' in item && 'sigungu' in item && 'eupmyeondong' in item
        ? {
            ...item,
            sido: { ...(item as SelectedRegionCondition).sido },
            sigungu: { ...(item as SelectedRegionCondition).sigungu },
            eupmyeondong: { ...(item as SelectedRegionCondition).eupmyeondong },
          }
        : { ...item },
  )
}

describe('valueStateCore', () => {
  describe('resolveInitialSelectionState', () => {
    it('value가 주어지면 controlled 모드로 value를 초기값으로 선택한다', () => {
      const result = resolveInitialSelectionState({
        value: [regionA],
        defaultValue: [keywordA],
      })

      expect(result.isControlled).toBe(true)
      expect(result.source).toBe('value')
      expect(result.selectedItems).toEqual([regionA])
      expect(result.split.regionItems).toEqual([regionA])
      expect(result.split.keywordItems).toEqual([])
    })

    it('value가 없고 defaultValue가 있으면 uncontrolled 모드로 defaultValue를 사용한다', () => {
      const result = resolveInitialSelectionState({
        defaultValue: [keywordA],
      })

      expect(result.isControlled).toBe(false)
      expect(result.source).toBe('defaultValue')
      expect(result.selectedItems).toEqual([keywordA])
      expect(result.split.regionItems).toEqual([])
      expect(result.split.keywordItems).toEqual([keywordA])
    })

    it('value/defaultValue가 모두 없으면 빈 배열로 초기화한다', () => {
      const result = resolveInitialSelectionState()

      expect(result.isControlled).toBe(false)
      expect(result.source).toBe('empty')
      expect(result.selectedItems).toEqual([])
      expect(result.split.regionItems).toEqual([])
      expect(result.split.keywordItems).toEqual([])
    })
  })

  describe('splitSearchSelectionItems / mergeSearchSelectionItems', () => {
    it('혼합된 selection 배열을 region/keyword로 분리한다', () => {
      const mixedSelections: SelectionItem[] = [
        keywordA,
        regionA,
        keywordB,
        regionB,
      ]

      const result = splitSearchSelectionItems(mixedSelections)

      expect(result.regionItems).toEqual([regionA, regionB])
      expect(result.keywordItems).toEqual([keywordA, keywordB])
    })

    it('분리된 region/keyword 배열을 region 우선 순서로 병합한다', () => {
      const merged = mergeSearchSelectionItems([regionA, regionB], [keywordA, keywordB])

      expect(merged).toEqual([regionA, regionB, keywordA, keywordB])
    })
  })

  describe('areSearchSelectionItemsEqual', () => {
    it('참조가 달라도 값이 같으면 동등하다고 판단한다', () => {
      const previous: SelectionItem[] = [regionA, keywordA]
      const next = cloneSelectionItems(previous)

      expect(areSearchSelectionItemsEqual(previous, next)).toBe(true)
    })

    it('배열 순서가 다르면 동등하지 않다', () => {
      const previous: SelectionItem[] = [regionA, keywordA]
      const next: SelectionItem[] = [keywordA, regionA]

      expect(areSearchSelectionItemsEqual(previous, next)).toBe(false)
    })

    it('동일 위치의 항목 값이 다르면 동등하지 않다', () => {
      const previous: SelectionItem[] = [regionA, keywordA]
      const next: SelectionItem[] = [
        regionA,
        {
          ...keywordA,
          normalizedKeyword: 'react-query',
        } as SelectedKeywordCondition,
      ]

      expect(areSearchSelectionItemsEqual(previous, next)).toBe(false)
    })
  })

  describe('resolveHybridValueUpdate', () => {
    it('uncontrolled 모드에서 값이 바뀌면 내부 상태를 갱신하고 onChange emit 대상값을 반환한다', () => {
      const result = resolveHybridValueUpdate({
        uncontrolledValue: [regionA],
        proposedValue: [regionA, keywordA],
      })

      expect(result.isControlled).toBe(false)
      expect(result.shouldEmitOnChange).toBe(true)
      expect(result.shouldUpdateUncontrolledValue).toBe(true)
      expect(result.nextRenderedValue).toEqual([regionA, keywordA])
      expect(result.nextUncontrolledValue).toEqual([regionA, keywordA])
      expect(result.eventValue).toEqual([regionA, keywordA])
      expect(result.meta).toEqual({
        branch: 'uncontrolled',
        sourceOfTruth: 'internal',
        didChange: true,
        reason: 'add',
        shouldEmitOnChange: true,
        shouldUpdateUncontrolledValue: true,
      })
      expect(result.split.nextRendered.keywordItems).toEqual([keywordA])
    })

    it('uncontrolled 모드에서 값이 같으면 내부 상태/emit 모두 생략한다', () => {
      const result = resolveHybridValueUpdate({
        uncontrolledValue: [regionA, keywordA],
        proposedValue: cloneSelectionItems([regionA, keywordA]),
      })

      expect(result.isControlled).toBe(false)
      expect(result.shouldEmitOnChange).toBe(false)
      expect(result.shouldUpdateUncontrolledValue).toBe(false)
      expect(result.nextRenderedValue).toEqual([regionA, keywordA])
      expect(result.nextUncontrolledValue).toEqual([regionA, keywordA])
      expect(result.meta.reason).toBeNull()
    })

    it('변경 reason 힌트가 있어도 동일 값이면 emit을 생략한다', () => {
      const result = resolveHybridValueUpdate({
        uncontrolledValue: [regionA, keywordA],
        proposedValue: cloneSelectionItems([regionA, keywordA]),
        reason: 'replace',
      })

      expect(result.shouldEmitOnChange).toBe(false)
      expect(result.shouldUpdateUncontrolledValue).toBe(false)
      expect(result.meta.didChange).toBe(false)
      expect(result.meta.reason).toBeNull()
    })

    it('uncontrolled 모드에서 항목이 제거되면 reason=remove를 반환한다', () => {
      const result = resolveHybridValueUpdate({
        uncontrolledValue: [regionA, keywordA],
        proposedValue: [regionA],
      })

      expect(result.shouldEmitOnChange).toBe(true)
      expect(result.shouldUpdateUncontrolledValue).toBe(true)
      expect(result.nextRenderedValue).toEqual([regionA])
      expect(result.meta.reason).toBe('remove')
    })

    it('controlled 모드에서 값이 바뀌면 내부 상태는 유지하고 emit만 필요하다고 판단한다', () => {
      const result = resolveHybridValueUpdate({
        value: [regionA],
        uncontrolledValue: [keywordB],
        proposedValue: [regionA, keywordA],
      })

      expect(result.isControlled).toBe(true)
      expect(result.shouldEmitOnChange).toBe(true)
      expect(result.shouldUpdateUncontrolledValue).toBe(false)
      expect(result.nextRenderedValue).toEqual([regionA])
      expect(result.nextUncontrolledValue).toEqual([keywordB])
      expect(result.eventValue).toEqual([regionA, keywordA])
      expect(result.meta).toEqual({
        branch: 'controlled',
        sourceOfTruth: 'value',
        didChange: true,
        reason: 'add',
        shouldEmitOnChange: true,
        shouldUpdateUncontrolledValue: false,
      })
      expect(result.split.current.regionItems).toEqual([regionA])
      expect(result.split.event.keywordItems).toEqual([keywordA])
      expect(result.split.nextRendered.keywordItems).toEqual([])
    })

    it('값이 동시에 추가/삭제되면 reason=replace를 반환한다', () => {
      const result = resolveHybridValueUpdate({
        value: [regionA, keywordA],
        uncontrolledValue: [keywordB],
        proposedValue: [regionB, keywordA],
      })

      expect(result.shouldEmitOnChange).toBe(true)
      expect(result.shouldUpdateUncontrolledValue).toBe(false)
      expect(result.meta.reason).toBe('replace')
    })

    it('값이 빈 배열로 전환되면 reason=clear를 반환한다', () => {
      const result = resolveHybridValueUpdate({
        uncontrolledValue: [regionA, keywordA],
        proposedValue: [],
      })

      expect(result.shouldEmitOnChange).toBe(true)
      expect(result.shouldUpdateUncontrolledValue).toBe(true)
      expect(result.nextRenderedValue).toEqual([])
      expect(result.meta.reason).toBe('clear')
    })

    it('controlled 모드에서 값이 같으면 emit을 생략한다', () => {
      const result = resolveHybridValueUpdate({
        value: [regionA, keywordA],
        uncontrolledValue: [keywordB],
        proposedValue: cloneSelectionItems([regionA, keywordA]),
      })

      expect(result.isControlled).toBe(true)
      expect(result.shouldEmitOnChange).toBe(false)
      expect(result.shouldUpdateUncontrolledValue).toBe(false)
      expect(result.nextRenderedValue).toEqual([regionA, keywordA])
      expect(result.nextUncontrolledValue).toEqual([keywordB])
      expect(result.eventValue).toEqual([regionA, keywordA])
      expect(result.meta.reason).toBeNull()
    })
  })
})
