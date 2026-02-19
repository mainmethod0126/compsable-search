import { describe, expect, it } from 'vitest'
import type {
  ComposableSelectProps,
  KeywordSelectProps,
  RegionSelectProps,
} from './types'
import {
  isKeywordSelector,
  isRegionSelector,
  resolveSelectorByType,
  type SelectorOfType,
} from './selectorTypeUtils'

const regionSelector: RegionSelectProps = {
  type: 'region',
  findAllSidos: () => [{ displayName: '서울특별시', name: '서울특별시', code: '11' }],
  findAllSigungus: () => [{ displayName: '강남구', name: '강남구', code: '11680' }],
  findAllEupmyeondongs: () => [
    { displayName: '역삼동', name: '역삼동', code: '1168010100' },
  ],
}

const keywordSelector: KeywordSelectProps = {
  type: 'keyword',
  options: {
    placeHolder: '키워드 선택',
  },
}

describe('selectorTypeUtils', () => {
  it('selector type literal로 원하는 selector를 조회한다', () => {
    const selectors: ComposableSelectProps[] = [keywordSelector, regionSelector]

    const resolvedRegion = resolveSelectorByType(selectors, 'region')
    const resolvedKeyword = resolveSelectorByType(selectors, 'keyword')

    expect(resolvedRegion).toBe(regionSelector)
    expect(resolvedKeyword).toBe(keywordSelector)
  })

  it('region/keyword type guard가 런타임 분기를 명확하게 보장한다', () => {
    const selectors: ComposableSelectProps[] = [regionSelector, keywordSelector]

    const onlyRegion = selectors.filter(isRegionSelector)
    const onlyKeyword = selectors.filter(isKeywordSelector)

    expect(onlyRegion).toEqual([regionSelector])
    expect(onlyKeyword).toEqual([keywordSelector])
  })

  it('SelectorOfType 공통 유틸 타입이 공개 계약 타입을 그대로 보존한다', () => {
    const expectsRegionSelectorType: SelectorOfType<'region'> = regionSelector
    const expectsKeywordSelectorType: SelectorOfType<'keyword'> = keywordSelector

    expect(expectsRegionSelectorType.type).toBe('region')
    expect(expectsKeywordSelectorType.type).toBe('keyword')
  })
})
