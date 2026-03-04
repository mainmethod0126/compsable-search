import { describe, expect, it } from 'vitest'
import * as componentsPublicApi from './index'
import { createSelector } from './selectors'
import type {
  ComposableSearchProps,
  ComposableSearchValue,
  SelectionItem,
  SelectorDriver,
  ValueChangeMeta,
} from './types'

interface DemoSelectorProps {
  options?: {
    placeholder?: string
    searchErrorMessage?: string
  }
  items: Array<{ id: string; label: string }>
}

type IsRequiredKey<T, K extends keyof T> = Pick<T, K> extends Required<Pick<T, K>>
  ? true
  : false

const regionDriver: SelectorDriver<DemoSelectorProps, 'region', SelectionItem> = {
  type: 'region',
  getTriggerLabel: (props) => props.options?.placeholder ?? '지역 선택',
  loadItems: async (_context, props) =>
    props.items.map((item) => ({
      id: item.id,
      displayName: item.label,
      selectorId: 'region-main',
      selectorType: 'region',
    })),
  renderPanel: () => null,
}

const keywordDriver: SelectorDriver<DemoSelectorProps, 'keyword', SelectionItem> = {
  type: 'keyword',
  getTriggerLabel: (props) => props.options?.placeholder ?? '키워드 선택',
  loadItems: (_context, props) =>
    props.items.map((item) => ({
      id: item.id,
      displayName: item.label,
      selectorId: 'keyword-main',
      selectorType: 'keyword',
    })),
  renderPanel: () => null,
}

const noopOnValueChange: NonNullable<ComposableSearchProps['onValueChange']> = () => undefined

function createGuideExampleProps(
  onValueChange: NonNullable<ComposableSearchProps['onValueChange']> = noopOnValueChange,
): ComposableSearchProps {
  const selectors = [
    createSelector<DemoSelectorProps, 'region', SelectionItem>({
      id: 'region-main',
      type: 'region',
      props: {
        options: {
          placeholder: '지역 선택',
          searchErrorMessage: '검색 중 오류가 발생했습니다.',
        },
        items: [{ id: '11', label: '서울특별시' }],
      },
      driver: regionDriver,
    }),
    createSelector<DemoSelectorProps, 'keyword', SelectionItem>({
      id: 'keyword-main',
      type: 'keyword',
      props: {
        options: { placeholder: '키워드 선택' },
        items: [{ id: 'kw:원룸', label: '원룸' }],
      },
      driver: keywordDriver,
    }),
  ] satisfies ComposableSearchProps['selectors']

  return {
    value: [],
    defaultValue: [],
    onValueChange,
    selectors,
  } satisfies ComposableSearchProps
}

describe('API usage guide contract (V2 Generic Selector)', () => {
  it('가이드 기본 예제는 createSelector 흐름으로 캐스팅 없이 타입 계약을 만족한다', () => {
    const props = createGuideExampleProps()
    const selectorsRequired: IsRequiredKey<ComposableSearchProps, 'selectors'> = true
    const hasSelectorsProps: (
      'selectorsProps' extends keyof ComposableSearchProps ? true : false
    ) = false
    const hasOnChange: ('onChange' extends keyof ComposableSearchProps ? true : false) =
      false

    expect(selectorsRequired).toBe(true)
    expect(hasSelectorsProps).toBe(false)
    expect(hasOnChange).toBe(false)
    expect(props.selectors).toHaveLength(2)
    expect(props.value).toEqual([])
    expect(props.defaultValue).toEqual([])
    expect(props.onValueChange).toBeDefined()
    expect('selectorsProps' in props).toBe(false)
    expect('onChange' in props).toBe(false)
  })

  it('가이드 예제 selector 옵션은 placeholder 표준 필드만 사용한다', () => {
    const props = createGuideExampleProps()
    const regionSelector = props.selectors.find((selector) => selector.type === 'region')
    const keywordSelector = props.selectors.find((selector) => selector.type === 'keyword')

    expect(regionSelector?.props.options?.placeholder).toBe('지역 선택')
    expect(regionSelector?.props.options?.searchErrorMessage).toBe(
      '검색 중 오류가 발생했습니다.',
    )
    expect(keywordSelector?.props.options?.placeholder).toBe('키워드 선택')
    expect('placeHolder' in (regionSelector?.props.options ?? {})).toBe(false)
    expect('placeHolder' in (keywordSelector?.props.options ?? {})).toBe(false)
  })

  it('가이드 예제의 onValueChange meta.source는 selector | external 기준을 따른다', () => {
    const observedSources: ValueChangeMeta['source'][] = []
    const props = createGuideExampleProps((_nextValue, meta) => {
      observedSources.push(meta.source)
    })
    const value: ComposableSearchValue = []
    const selectorMeta: ValueChangeMeta = {
      reason: 'add',
      source: 'selector',
      selectorType: 'region',
      selectorId: 'region-main',
    }
    const externalMeta: ValueChangeMeta = {
      reason: 'replace',
      source: 'external',
    }
    const allowedSources: ValueChangeMeta['source'][] = ['selector', 'external']

    expect(props.onValueChange).toBeDefined()
    props.onValueChange?.(value, selectorMeta)
    props.onValueChange?.(value, externalMeta)
    expect(observedSources).toEqual(allowedSources)
    expect(allowedSources).toEqual(['selector', 'external'])
  })

  it('가이드 예제는 validateComposableSearchConfiguration으로 렌더 전 구성을 검증한다', () => {
    const hasValidateComposableSearchConfiguration: (
      'validateComposableSearchConfiguration' extends keyof typeof componentsPublicApi
        ? true
        : false
    ) = true
    const validateComposableSearchConfiguration =
      componentsPublicApi.validateComposableSearchConfiguration
    const props = createGuideExampleProps()

    expect(hasValidateComposableSearchConfiguration).toBe(true)
    expect(typeof validateComposableSearchConfiguration).toBe('function')

    if (!validateComposableSearchConfiguration) {
      return
    }

    const validResult = validateComposableSearchConfiguration({
      selectors: props.selectors,
    })
    const missingSelectorsResult = validateComposableSearchConfiguration({})

    expect(validResult).toEqual({
      isValid: true,
      issues: [],
    })
    expect(missingSelectorsResult.isValid).toBe(false)
    expect(missingSelectorsResult.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'MISSING_SELECTORS',
        }),
      ]),
    )
  })
})
