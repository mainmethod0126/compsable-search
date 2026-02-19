import { describe, expect, it } from 'vitest'
import type {
  ComposableSearchProps,
  Region,
  SearchSelectionItem,
} from './types'

const SIDOS: Region[] = [{ displayName: '서울특별시', name: '서울특별시', code: '11' }]
const SIGUNGUS: Record<string, Region[]> = {
  '11': [{ displayName: '강남구', name: '강남구', code: '11680' }],
}
const EUPMYEONDONGS: Record<string, Region[]> = {
  '11680': [{ displayName: '역삼동', name: '역삼동', code: '1168010100' }],
}

function createGuideExampleProps(): ComposableSearchProps {
  return {
    selectorsProps: [
      {
        type: 'region',
        findAllSidos: () => [...SIDOS],
        findAllSigungus: (sidoCode) => [...(SIGUNGUS[sidoCode] ?? [])],
        findAllEupmyeondongs: (sigunguCode) => [
          ...(EUPMYEONDONGS[sigunguCode] ?? []),
        ],
        options: {
          placeHolder: '지역 선택',
          onClick: () => undefined,
          onChange: (selectedItems: SearchSelectionItem[]) => selectedItems,
          onSelectedEupmyeondong: (selected: Region) => selected,
        },
      },
      {
        type: 'keyword',
        options: {
          placeHolder: '키워드 선택',
          label: '키워드 입력',
          inputPlaceholder: '키워드를 입력하세요',
          guideText: 'Enter로 키워드 확정',
          maxTokens: 5,
          maxTokenLength: 20,
          normalization: {
            casePolicy: 'lower',
          },
          onInvalidToken: () => undefined,
          onClick: () => undefined,
        },
      },
    ],
  }
}

describe('API usage guide contract', () => {
  it('가이드 예제가 최신 공개 타입 계약에서 타입 오류 없이 구성된다', () => {
    const props = createGuideExampleProps()
    expect(props.selectorsProps).toHaveLength(2)
  })

  it('가이드 예제의 region 콜백 시그니처는 문서 계약과 일치한다', () => {
    const props = createGuideExampleProps()
    const regionSelector = props.selectorsProps?.find(
      (selector) => selector.type === 'region',
    )
    expect(regionSelector?.options?.onChange).toBeDefined()
    expect(regionSelector?.options?.onSelectedEupmyeondong).toBeDefined()
  })

  it('가이드 예제의 keyword 입력 옵션 계약은 최신 입력 모델과 일치한다', () => {
    const props = createGuideExampleProps()
    const keywordSelector = props.selectorsProps?.find(
      (selector) => selector.type === 'keyword',
    )

    expect(keywordSelector?.options?.label).toBe('키워드 입력')
    expect(keywordSelector?.options?.maxTokens).toBe(5)
    expect(keywordSelector?.options?.onInvalidToken).toBeDefined()
  })
})
