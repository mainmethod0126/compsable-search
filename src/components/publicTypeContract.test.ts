import { describe, expect, it } from 'vitest'
import type {
  ComposableSearchProps,
  ComposableSelectItem,
  RegionDataSource,
  RegionSelectOptions,
  RegionSelectProps,
  RegionSelectionItem,
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

  it('RegionSelectOptions.onChange는 RegionSelectionItem 배열 계약을 유지한다', () => {
    const onChange: NonNullable<RegionSelectOptions['onChange']> = (
      selectedItems: RegionSelectionItem[],
    ) => {
      expect(selectedItems[0]?.id).toBeDefined()
    }

    onChange([
      {
        id: '1168010100',
        displayName: '서울특별시>강남구>역삼동',
        sido: { displayName: '서울특별시', name: '서울특별시', code: '11' },
        sigungu: { displayName: '강남구', name: '강남구', code: '11680' },
        eupmyeondong: { displayName: '역삼동', name: '역삼동', code: '1168010100' },
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

  it('레거시 onChange 시그니처(ComposableSelectItem[])도 호환된다', () => {
    const legacyOnChange: NonNullable<RegionSelectOptions['onChange']> = (
      selectedItems: ComposableSelectItem[],
    ) => {
      expect(selectedItems).toBeDefined()
    }

    legacyOnChange([])
  })

  it('ComposableSearchProps는 region/keyword selector 조합을 허용한다', () => {
    const props: ComposableSearchProps = {
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
  })
})
