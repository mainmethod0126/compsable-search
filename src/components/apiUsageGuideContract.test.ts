import { describe, expect, it } from 'vitest'
import type {
  ChangeMeta,
  ComposableSearchProps,
  ComposableSearchValue,
  ComposableSelectProps,
  Region,
  SelectorInstance,
  SelectorPluginRegistry,
  SearchSelectionItem,
} from './types'

const SIDOS: Region[] = [{ displayName: '서울특별시', name: '서울특별시', code: '11' }]
const SIGUNGUS: Record<string, Region[]> = {
  '11': [{ displayName: '강남구', name: '강남구', code: '11680' }],
}
const EUPMYEONDONGS: Record<string, Region[]> = {
  '11680': [{ displayName: '역삼동', name: '역삼동', code: '1168010100' }],
}

function isRegionSelectorInstance(
  selector: SelectorInstance,
): selector is SelectorInstance<'region'> {
  return selector.type === 'region'
}

function isKeywordSelectorInstance(
  selector: SelectorInstance,
): selector is SelectorInstance<'keyword'> {
  return selector.type === 'keyword'
}

function isLegacyRegionSelector(
  selector: ComposableSelectProps,
): selector is Extract<ComposableSelectProps, { type: 'region' }> {
  return selector.type === 'region'
}

function isLegacyKeywordSelector(
  selector: ComposableSelectProps,
): selector is Extract<ComposableSelectProps, { type: 'keyword' }> {
  return selector.type === 'keyword'
}

function createGuideExampleProps(): ComposableSearchProps {
  const regionSelector: SelectorInstance<'region'> = {
    id: 'region-main',
    type: 'region',
    props: {
      type: 'region',
      findAllSidos: () => [...SIDOS],
      findAllSigungus: (sidoCode) => [...(SIGUNGUS[sidoCode] ?? [])],
      findAllEupmyeondongs: (sigunguCode) => [
        ...(EUPMYEONDONGS[sigunguCode] ?? []),
      ],
      options: {
        placeholder: '지역 선택',
        placeHolder: '지역 선택(레거시)',
        onClick: () => undefined,
        onChange: (selectedItems: SearchSelectionItem[]) => selectedItems,
        onSelectedEupmyeondong: (selected: Region) => selected,
      },
    },
  }

  const keywordSelector: SelectorInstance<'keyword'> = {
    id: 'keyword-main',
    type: 'keyword',
    props: {
      type: 'keyword',
      options: {
        placeholder: '키워드 선택',
        placeHolder: '키워드 선택(레거시)',
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
  }

  const plugins: SelectorPluginRegistry = {
    regionTelemetry: {
      id: 'region-telemetry',
      type: 'region',
    },
  }

  const defaultValue: ComposableSearchValue = []
  const onValueChange: NonNullable<ComposableSearchProps['onValueChange']> = (
    nextValue: ComposableSearchValue,
    meta: ChangeMeta,
  ) => ({ nextValue, meta })

  return {
    value: [],
    defaultValue,
    onValueChange,
    selectors: [regionSelector, keywordSelector],
    plugins,
    onChange: (selectedItems: SearchSelectionItem[]) => selectedItems,
    selectorsProps: [
      {
        type: 'region',
        findAllSidos: () => [...SIDOS],
        findAllSigungus: (sidoCode) => [...(SIGUNGUS[sidoCode] ?? [])],
        findAllEupmyeondongs: (sigunguCode) => [
          ...(EUPMYEONDONGS[sigunguCode] ?? []),
        ],
        options: {
          placeholder: '지역 선택',
          placeHolder: '지역 선택',
          onClick: () => undefined,
          onChange: (selectedItems: SearchSelectionItem[]) => selectedItems,
          onSelectedEupmyeondong: (selected: Region) => selected,
        },
      },
      {
        type: 'keyword',
        options: {
          placeholder: '키워드 선택',
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
  it('가이드 예제가 0.3 공개 타입 계약에서 타입 오류 없이 구성된다', () => {
    const props = createGuideExampleProps()
    expect(props.selectors).toHaveLength(2)
    expect(props.plugins).toBeDefined()
    expect('placeholder' in props).toBe(false)
    expect('placeHolder' in props).toBe(false)
    expect(props.onValueChange).toBeDefined()
    expect(props.selectorsProps).toHaveLength(2)
    expect(props.onChange).toBeDefined()
  })

  it('가이드 예제의 region 콜백 시그니처는 0.3/레거시 계약을 모두 만족한다', () => {
    const props = createGuideExampleProps()
    const regionSelector = props.selectors?.find(isRegionSelectorInstance)
    const legacyRegionSelector = props.selectorsProps?.find(isLegacyRegionSelector)

    expect(regionSelector?.props.options?.onChange).toBeDefined()
    expect(regionSelector?.props.options?.onSelectedEupmyeondong).toBeDefined()
    expect(regionSelector?.props.options?.placeholder).toBe('지역 선택')
    expect(regionSelector?.props.options?.placeHolder).toBe('지역 선택(레거시)')
    expect(legacyRegionSelector?.options?.placeHolder).toBe('지역 선택')
  })

  it('가이드 예제의 keyword 입력 옵션 계약은 최신 입력 모델과 일치한다', () => {
    const props = createGuideExampleProps()
    const keywordSelector = props.selectors?.find(isKeywordSelectorInstance)
    const legacyKeywordSelector = props.selectorsProps?.find(isLegacyKeywordSelector)

    expect(keywordSelector?.props.options?.label).toBe('키워드 입력')
    expect(keywordSelector?.props.options?.maxTokens).toBe(5)
    expect(keywordSelector?.props.options?.onInvalidToken).toBeDefined()
    expect(keywordSelector?.props.options?.placeholder).toBe('키워드 선택')
    expect(keywordSelector?.props.options?.placeHolder).toBe('키워드 선택(레거시)')
    expect(legacyKeywordSelector?.options?.placeHolder).toBe('키워드 선택')
  })

  it('가이드 예제의 onValueChange meta 시그니처는 문서 계약과 일치한다', () => {
    const props = createGuideExampleProps()
    const meta: ChangeMeta = {
      source: 'region',
      selectorType: 'region',
      selectorId: 'region-main',
    }
    const value: ComposableSearchValue = []

    expect(props.onValueChange).toBeDefined()
    props.onValueChange?.(value, meta)
  })
})
