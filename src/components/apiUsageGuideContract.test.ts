import { describe, expect, it } from 'vitest'
import { createKeywordSelector, createRegionSelector } from './selectors'
import type {
  ComposableSearchProps,
  ComposableSearchValue,
  Region,
  SelectorPluginRegistry,
  ValueChangeMeta,
} from './types'

const SIDOS: Region[] = [{ displayName: '서울특별시', name: '서울특별시', code: '11' }]
const SIGUNGUS: Record<string, Region[]> = {
  '11': [{ displayName: '강남구', name: '강남구', code: '11680' }],
}
const EUPMYEONDONGS: Record<string, Region[]> = {
  '11680': [{ displayName: '역삼동', name: '역삼동', code: '1168010100' }],
}

function createGuideExampleProps(): ComposableSearchProps {
  const regionSelector = createRegionSelector('region-main', {
    findAllSidos: () => [...SIDOS],
    findAllSigungus: (sidoCode) => [...(SIGUNGUS[sidoCode] ?? [])],
    findAllEupmyeondongs: (sigunguCode) => [...(EUPMYEONDONGS[sigunguCode] ?? [])],
    options: {
      placeholder: '지역 선택',
      onClick: () => undefined,
      onSelectedEupmyeondong: (selected: Region) => selected,
    },
  })

  const keywordSelector = createKeywordSelector('keyword-main', {
    options: {
      placeholder: '키워드 선택',
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
  })

  const plugins: SelectorPluginRegistry = {
    regionTelemetry: {
      id: 'region-telemetry',
      type: 'region',
      onSelectionChange: (event) => event,
      onPanelOpenChange: (event) => event,
      onError: (event) => event,
    },
  }

  const onValueChange: NonNullable<ComposableSearchProps['onValueChange']> = (
    nextValue: ComposableSearchValue,
    meta: ValueChangeMeta,
  ) => ({ nextValue, meta })

  return {
    defaultValue: [],
    onValueChange,
    selectors: [regionSelector, keywordSelector],
    plugins,
  }
}

describe('API usage guide contract (V2)', () => {
  it('가이드 예제는 selectors + onValueChange 중심 공개 계약으로 구성된다', () => {
    const props = createGuideExampleProps()

    expect(props.selectors).toHaveLength(2)
    expect(props.onValueChange).toBeDefined()
    expect(props.plugins).toBeDefined()
    expect('selectorsProps' in props).toBe(false)
    expect('onChange' in props).toBe(false)
    expect('placeholder' in props).toBe(false)
    expect('placeHolder' in props).toBe(false)
  })

  it('가이드 예제 selector 옵션은 placeholder 표준 필드만 사용한다', () => {
    const props = createGuideExampleProps()
    const regionSelector = props.selectors.find((selector) => selector.type === 'region')
    const keywordSelector = props.selectors.find((selector) => selector.type === 'keyword')

    expect(regionSelector?.props.options?.placeholder).toBe('지역 선택')
    expect(keywordSelector?.props.options?.placeholder).toBe('키워드 선택')
    expect('placeHolder' in (regionSelector?.props.options ?? {})).toBe(false)
    expect('placeHolder' in (keywordSelector?.props.options ?? {})).toBe(false)
  })

  it('가이드 예제의 onValueChange meta 시그니처는 ValueChangeMeta(reason/source)를 따른다', () => {
    const props = createGuideExampleProps()
    const meta: ValueChangeMeta = {
      reason: 'add',
      source: 'selector',
      selectorType: 'region',
      selectorId: 'region-main',
    }
    const value: ComposableSearchValue = []

    expect(props.onValueChange).toBeDefined()
    props.onValueChange?.(value, meta)
  })

  it('가이드 예제의 plugin 훅 시그니처는 V2 이벤트를 지원한다', () => {
    const props = createGuideExampleProps()
    const plugin = props.plugins?.regionTelemetry

    plugin?.onSelectionChange?.({
      nextValue: [],
      meta: {
        reason: 'replace',
        source: 'external',
      },
    })
    plugin?.onPanelOpenChange?.({
      selectorId: 'region-main',
      selectorType: 'region',
      isOpen: true,
    })
    plugin?.onError?.({
      selectorId: 'region-main',
      selectorType: 'region',
      error: new Error('guide-plugin-error'),
    })

    expect(plugin).toBeDefined()
  })
})
