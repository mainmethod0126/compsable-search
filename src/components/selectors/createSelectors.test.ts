import { describe, expect, it } from 'vitest'
import type { KeywordSelectProps, RegionSelectProps } from '../types'
import { createKeywordSelector } from './createKeywordSelector'
import { createRegionSelector } from './createRegionSelector'

const SIDOS = [
  { displayName: '서울특별시', name: '서울특별시', code: '11' },
]
const SIGUNGUS = {
  '11': [{ displayName: '강남구', name: '강남구', code: '11680' }],
}
const EUPMYEONDONGS = {
  '11680': [{ displayName: '역삼동', name: '역삼동', code: '1168010100' }],
}

describe('create selector factories', () => {
  it('createRegionSelector는 type 없는 props를 SelectorInstance<region>으로 만든다', () => {
    const regionProps: Omit<RegionSelectProps, 'type'> = {
      findAllSidos: () => SIDOS,
      findAllSigungus: (sidoCode) => SIGUNGUS[sidoCode as keyof typeof SIGUNGUS] ?? [],
      findAllEupmyeondongs: (sigunguCode) =>
        EUPMYEONDONGS[sigunguCode as keyof typeof EUPMYEONDONGS] ?? [],
      options: {
        placeholder: '지역 선택',
      },
    }

    const selector = createRegionSelector('region-main', regionProps)

    expect(selector.id).toBe('region-main')
    expect(selector.type).toBe('region')
    expect(selector.props.type).toBe('region')
    expect(selector.props.findAllSidos()).toEqual(SIDOS)
    expect(selector.props.options?.placeholder).toBe('지역 선택')
  })

  it('createKeywordSelector는 type 없는 props를 SelectorInstance<keyword>로 만든다', () => {
    const keywordProps: Omit<KeywordSelectProps, 'type'> = {
      options: {
        placeholder: '키워드 선택',
        maxTokens: 5,
      },
    }

    const selector = createKeywordSelector('keyword-main', keywordProps)

    expect(selector.id).toBe('keyword-main')
    expect(selector.type).toBe('keyword')
    expect(selector.props.type).toBe('keyword')
    expect(selector.props.options?.placeholder).toBe('키워드 선택')
    expect(selector.props.options?.maxTokens).toBe(5)
  })
})
