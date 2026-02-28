import { describe, expect, it } from 'vitest'
import type {
  ComposableSearchProps,
  ComposableSelectItem,
  KeywordSelectOptions,
  RegionDataSource,
  RegionSelectOptions,
  RegionSelectProps,
  SearchSelectionItem,
  RegionSelectionItem,
  SelectedKeywordCondition,
} from './types'

const regionDataSource: RegionDataSource = {
  findAllSidos: () => [{ displayName: '서울특별시', name: '서울특별시', code: '11' }],
  findAllSigungus: () => [{ displayName: '강남구', name: '강남구', code: '11680' }],
  findAllEupmyeondongs: () => [
    { displayName: '역삼동', name: '역삼동', code: '1168010100' },
  ],
}

describe('public type contract', () => {
  it('RegionSelectProps는 공개 데이터 소스 계약을 그대로 수용한다', () => {
    const selector: RegionSelectProps = {
      type: 'region',
      ...regionDataSource,
    }

    expect(selector.findAllSidos()).toHaveLength(1)
  })

  it('RegionSelectOptions.onChange는 region + keyword 조합 payload 계약을 수용한다', () => {
    const onChange: NonNullable<RegionSelectOptions['onChange']> = (
      selectedItems: SearchSelectionItem[],
    ) => {
      expect(selectedItems).toHaveLength(2)
    }

    onChange([
      {
        id: '1168010100',
        displayName: '서울특별시>강남구>역삼동',
        sido: { displayName: '서울특별시', name: '서울특별시', code: '11' },
        sigungu: { displayName: '강남구', name: '강남구', code: '11680' },
        eupmyeondong: { displayName: '역삼동', name: '역삼동', code: '1168010100' },
      },
      {
        id: 'keyword:react',
        displayName: '키워드: react',
        keyword: 'react',
        normalizedKeyword: 'react',
      },
    ])
  })

  it('ComposableSelectItem 하위 호환 타입 별칭은 0.1.x에서 계속 사용할 수 있다', () => {
    const legacyItem: ComposableSelectItem = {
      id: 'legacy',
      displayName: '레거시 조건',
    }

    expect(legacyItem.id).toBe('legacy')
  })

  it('레거시 onChange 시그니처(RegionSelectionItem[])도 호환된다', () => {
    const legacyOnChange: NonNullable<RegionSelectOptions['onChange']> = (
      selectedItems: RegionSelectionItem[],
    ) => {
      expect(selectedItems).toBeDefined()
    }

    legacyOnChange([])
  })

  it('KeywordSelectOptions는 입력 모델 설정과 유효성 콜백 계약을 제공한다', () => {
    const onInvalidToken: NonNullable<KeywordSelectOptions['onInvalidToken']> = (
      error,
      context,
    ) => {
      expect(error).toBeDefined()
      expect(context.maxTokens).toBeGreaterThan(0)
    }
    const options: KeywordSelectOptions = {
      placeHolder: '키워드 선택',
      label: '키워드 입력',
      guideText: 'Enter로 확정',
      maxTokens: 5,
      maxTokenLength: 20,
      normalization: {
        casePolicy: 'lower',
      },
      onInvalidToken,
    }

    expect(options.maxTokens).toBe(5)
  })

  it('SelectedKeywordCondition은 SelectedCondition 기반 식별 계약을 유지한다', () => {
    const condition: SelectedKeywordCondition = {
      id: 'keyword:vite',
      displayName: '키워드: vite',
      keyword: 'vite',
      normalizedKeyword: 'vite',
    }

    expect(condition.id).toBe('keyword:vite')
  })

  it('ComposableSearchProps는 region/keyword selector 조합을 허용한다', () => {
    const props: ComposableSearchProps = {
      onChange: (selectedItems) => {
        expect(selectedItems).toBeDefined()
      },
      selectorsProps: [
        {
          type: 'region',
          ...regionDataSource,
        },
        {
          type: 'keyword',
          options: {
            placeHolder: '키워드 선택',
          },
        },
      ],
    }

    expect(props.selectorsProps).toHaveLength(2)
    props.onChange?.([])
  })
})
