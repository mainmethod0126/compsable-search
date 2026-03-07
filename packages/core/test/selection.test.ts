import { describe, expect, it } from 'vitest'
import {
  clearSelectionBySelectorId,
  mergeSelectionBySelectorId,
  removeSelectionBySelectorId,
} from '../src'
import type { SelectionItem } from '../src'

function createItem(
  id: string,
  selectorId: string,
  payload: Record<string, unknown>,
): SelectionItem {
  return {
    id,
    displayName: id,
    selectorId,
    payload,
  }
}

describe('selection ownership helpers', () => {
  const regionMain = createItem('region-main:seoul', 'region-main', {
    shape: 'shared',
  })
  const regionSecondary = createItem('region-secondary:busan', 'region-secondary', {
    shape: 'shared',
  })
  const keywordMain = createItem('keyword-main:react', 'keyword-main', {
    shape: 'shared',
  })

  it('merge는 selectorId가 같은 항목만 교체하고 나머지 owner는 유지한다', () => {
    const nextValue = mergeSelectionBySelectorId(
      [regionMain, regionSecondary, keywordMain],
      'keyword-main',
      [createItem('keyword-main:vitest', 'keyword-main', { shape: 'shared' })],
    )

    expect(nextValue).toEqual([
      regionMain,
      regionSecondary,
      createItem('keyword-main:vitest', 'keyword-main', { shape: 'shared' }),
    ])
  })

  it('동일 shape 항목이어도 selectorId가 다르면 별도 owner로 처리한다', () => {
    const nextValue = mergeSelectionBySelectorId(
      [regionMain, regionSecondary],
      'region-main',
      [createItem('region-main:incheon', 'region-main', { shape: 'shared' })],
    )

    expect(nextValue).toEqual([
      regionSecondary,
      createItem('region-main:incheon', 'region-main', { shape: 'shared' }),
    ])
  })

  it('merge 입력에 다른 selectorId가 섞이면 즉시 throw한다', () => {
    expect(() =>
      mergeSelectionBySelectorId(
        [regionMain],
        'region-main',
        [createItem('region-secondary:busan', 'region-secondary', { shape: 'shared' })],
      ),
    ).toThrow(/region-main/)
  })

  it('remove는 selectorId 전체 제거와 itemIds 기반 부분 제거를 지원한다', () => {
    expect(
      removeSelectionBySelectorId(
        [regionMain, regionSecondary, keywordMain],
        'region-main',
      ),
    ).toEqual([regionSecondary, keywordMain])

    expect(
      removeSelectionBySelectorId(
        [regionMain, keywordMain, createItem('keyword-main:vitest', 'keyword-main', {})],
        'keyword-main',
        ['keyword-main:vitest'],
      ),
    ).toEqual([regionMain, keywordMain])
  })

  it('clear는 특정 selector만 비우거나 전체를 비운다', () => {
    expect(
      clearSelectionBySelectorId(
        [regionMain, regionSecondary, keywordMain],
        'region-secondary',
      ),
    ).toEqual([regionMain, keywordMain])
    expect(
      clearSelectionBySelectorId([regionMain, regionSecondary, keywordMain]),
    ).toEqual([])
  })
})
