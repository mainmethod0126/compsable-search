import { describe, expect, it } from 'vitest'
import type { ComposableSelectProps } from '../types'
import { adaptLegacySelectorsProps } from './adaptLegacySelectorsProps'

const SIDOS = [
  { displayName: '서울특별시', name: '서울특별시', code: '11' },
]
const SIGUNGUS = {
  '11': [{ displayName: '강남구', name: '강남구', code: '11680' }],
}
const EUPMYEONDONGS = {
  '11680': [{ displayName: '역삼동', name: '역삼동', code: '1168010100' }],
}

describe('adaptLegacySelectorsProps', () => {
  it('ComposableSelectProps[]를 SelectorInstance[]로 변환하고 id 규칙을 적용한다', () => {
    const selectorsProps: ComposableSelectProps[] = [
      {
        type: 'keyword',
        options: {
          placeholder: '키워드 선택',
        },
      },
      {
        type: 'region',
        findAllSidos: () => SIDOS,
        findAllSigungus: (sidoCode) => SIGUNGUS[sidoCode as keyof typeof SIGUNGUS] ?? [],
        findAllEupmyeondongs: (sigunguCode) =>
          EUPMYEONDONGS[sigunguCode as keyof typeof EUPMYEONDONGS] ?? [],
        options: {
          placeholder: '지역 선택',
        },
      },
    ]

    const selectors = adaptLegacySelectorsProps(selectorsProps)

    expect(selectors).toHaveLength(2)
    expect(selectors[0]).toMatchObject({
      id: 'keyword-0',
      type: 'keyword',
    })
    expect(selectors[1]).toMatchObject({
      id: 'region-1',
      type: 'region',
    })
    expect(selectors[0]?.props).toBe(selectorsProps[0])
    expect(selectors[1]?.props).toBe(selectorsProps[1])
  })

  it('빈 입력은 빈 배열을 반환한다', () => {
    expect(adaptLegacySelectorsProps([])).toEqual([])
  })
})
