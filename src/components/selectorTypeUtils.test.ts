import { describe, expect, it } from 'vitest'
import type { SelectorDefinition } from './publicTypes'
import {
  COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE,
  ComposableSearchConfigurationError,
} from './configurationValidation'
import {
  isKeywordSelector,
  isRegionSelector,
  resolveSelectorByType,
  resolveSelectorsWithPolicy,
  validateSelectorTypeUniqueness,
  type SelectorOfType,
} from './selectorTypeUtils'

function createSelectorDefinition<TType extends string>(
  id: string,
  type: TType,
): SelectorDefinition<unknown, TType> {
  return {
    id,
    type,
    props: { id, type },
    driver: {
      type,
      getTriggerLabel: () => `${type} selector`,
      renderPanel: () => null,
    },
  }
}

const regionSelector = createSelectorDefinition('region-main', 'region')
const keywordSelector = createSelectorDefinition('keyword-main', 'keyword')

describe('selectorTypeUtils', () => {
  it('selector type literal로 원하는 selector를 조회한다', () => {
    const selectors: SelectorDefinition[] = [keywordSelector, regionSelector]

    const resolvedRegion = resolveSelectorByType(selectors, 'region')
    const resolvedKeyword = resolveSelectorByType(selectors, 'keyword')

    expect(resolvedRegion).toBe(regionSelector)
    expect(resolvedKeyword).toBe(keywordSelector)
  })

  it('region/keyword type guard가 런타임 분기를 명확하게 보장한다', () => {
    const selectors: SelectorDefinition[] = [regionSelector, keywordSelector]

    const onlyRegion = selectors.filter(isRegionSelector)
    const onlyKeyword = selectors.filter(isKeywordSelector)

    expect(onlyRegion).toEqual([regionSelector])
    expect(onlyKeyword).toEqual([keywordSelector])
  })

  it('SelectorOfType 공통 유틸 타입이 V2 selector 계약을 보존한다', () => {
    const expectsRegionSelectorType: SelectorOfType<'region'> = regionSelector
    const expectsKeywordSelectorType: SelectorOfType<'keyword'> = keywordSelector

    expect(expectsRegionSelectorType.type).toBe('region')
    expect(expectsKeywordSelectorType.type).toBe('keyword')
  })

  it('동일 type selector가 여러 개면 strict 정책으로 DUPLICATE_SELECTOR_TYPE 예외를 던진다', () => {
    const primaryRegionSelector = createSelectorDefinition(
      'region-primary',
      'region',
    )
    const secondaryRegionSelector = createSelectorDefinition(
      'region-secondary',
      'region',
    )

    expect(() =>
      resolveSelectorByType([primaryRegionSelector, secondaryRegionSelector], 'region'),
    ).toThrowError(ComposableSearchConfigurationError)

    try {
      resolveSelectorByType([primaryRegionSelector, secondaryRegionSelector], 'region')
    } catch (error) {
      const configurationError = error as ComposableSearchConfigurationError
      expect(configurationError.code).toBe(
        COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.DUPLICATE_SELECTOR_TYPE,
      )
      expect(configurationError.causeContext).toEqual(
        expect.objectContaining({
          selectorType: 'region',
          selectorIds: ['region-primary', 'region-secondary'],
          duplicateCount: 2,
        }),
      )
    }
  })

  it('resolveSelectorsWithPolicy는 strict 구성 검증(assert) 이후 selector를 해석한다', () => {
    const resolved = resolveSelectorsWithPolicy([
      createSelectorDefinition('region-primary', 'region'),
      createSelectorDefinition('keyword-primary', 'keyword'),
    ])

    expect(resolved.regionSelector?.id).toBe('region-primary')
    expect(resolved.keywordSelector?.id).toBe('keyword-primary')
  })

  it('resolveSelectorsWithPolicy는 selectors가 비어 있으면 EMPTY_SELECTORS 예외를 던진다', () => {
    expect(() => resolveSelectorsWithPolicy([])).toThrowError(
      ComposableSearchConfigurationError,
    )

    try {
      resolveSelectorsWithPolicy([])
    } catch (error) {
      const configurationError = error as ComposableSearchConfigurationError
      expect(configurationError.code).toBe(
        COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.EMPTY_SELECTORS,
      )
    }
  })

  it('selector type 중복 검증 유틸은 V2 임의 type까지 중복 메타데이터를 반환한다', () => {
    const duplicates = validateSelectorTypeUniqueness([
      regionSelector,
      createSelectorDefinition('region-duplicate', 'region'),
      keywordSelector,
      createSelectorDefinition('custom-a', 'custom'),
      createSelectorDefinition('custom-b', 'custom'),
    ])

    expect(duplicates).toEqual([
      { selectorType: 'region', count: 2 },
      { selectorType: 'custom', count: 2 },
    ])
  })
})
