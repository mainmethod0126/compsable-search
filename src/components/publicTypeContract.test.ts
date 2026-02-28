import { describe, expect, it } from 'vitest'
import type {
  ChangeMeta,
  ComposableSearchProps,
  ComposableSearchValue,
  ComposableSelectItem,
  KeywordSelectOptions,
  SelectorInstance,
  SelectorPlugin,
  SelectorPluginRegistry,
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

const regionSelectorInstance: SelectorInstance<'region'> = {
  id: 'region-selector',
  type: 'region',
  props: {
    type: 'region',
    ...regionDataSource,
    options: {
      placeholder: '지역 선택',
    },
  },
}

const keywordSelectorInstance: SelectorInstance<'keyword'> = {
  id: 'keyword-selector',
  type: 'keyword',
  props: {
    type: 'keyword',
    options: {
      placeholder: '키워드 선택',
    },
  },
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

  it('RegionSelectOptions는 placeholder + placeHolder 하위 호환 필드를 모두 지원한다', () => {
    const options: RegionSelectOptions = {
      placeholder: '지역 선택',
      placeHolder: '지역 선택(레거시)',
    }

    expect(options.placeholder).toBe('지역 선택')
    expect(options.placeHolder).toBe('지역 선택(레거시)')
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
      placeholder: '키워드 선택',
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

    expect(options.placeholder).toBe('키워드 선택')
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

  it('SelectorPluginRegistry는 selector instance 기반 plugin 계약을 수용한다', () => {
    const regionPlugin: SelectorPlugin<'region'> = {
      id: 'region-telemetry',
      type: 'region',
      onInit: (instance) => {
        expect(instance.id).toBe('region-selector')
      },
      onDispose: (instance) => {
        expect(instance.type).toBe('region')
      },
    }
    const plugins: SelectorPluginRegistry = {
      regionTelemetry: regionPlugin,
    }

    const regionTelemetryPlugin = plugins.regionTelemetry
    if (regionTelemetryPlugin.type === 'region') {
      regionTelemetryPlugin.onInit?.(regionSelectorInstance)
      regionTelemetryPlugin.onDispose?.(regionSelectorInstance)
    }
    expect(Object.keys(plugins)).toEqual(['regionTelemetry'])
  })

  it('ComposableSearchProps는 0.3 value 기반 계약을 수용한다', () => {
    const value: ComposableSearchValue = []
    const meta: ChangeMeta = {
      source: 'region',
      selectorType: 'region',
      selectorId: regionSelectorInstance.id,
    }

    const onValueChange: NonNullable<ComposableSearchProps['onValueChange']> = (
      nextValue,
      changeMeta,
    ) => {
      expect(nextValue).toBe(value)
      expect(changeMeta.source).toBe('region')
    }

    const props: ComposableSearchProps = {
      value,
      defaultValue: [],
      onValueChange,
      selectors: [regionSelectorInstance, keywordSelectorInstance],
      plugins: {
        regionTelemetry: {
          id: 'region-telemetry',
          type: 'region',
        },
      },
      placeholder: '조건 선택',
    }

    expect(props.selectors).toHaveLength(2)
    props.onValueChange?.(value, meta)
  })

  it('ComposableSearchProps는 레거시 selectorsProps/onChange/placeHolder도 유지한다', () => {
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
      placeHolder: '조건 선택(레거시)',
    }

    expect(props.selectorsProps).toHaveLength(2)
    props.onChange?.([])
  })
})
