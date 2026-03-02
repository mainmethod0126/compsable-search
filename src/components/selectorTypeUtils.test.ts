import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SelectorDefinition } from './publicTypes'
import {
  createSelectorResolutionWarningContext,
  isKeywordSelector,
  isRegionSelector,
  resolveSelectorByType,
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
  afterEach(() => {
    vi.restoreAllMocks()
  })

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

  it('동일 type selector가 여러 개면 first-wins 정책으로 첫 selector를 선택한다', () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined)
    const primaryRegionSelector = createSelectorDefinition(
      'region-primary',
      'region',
    )
    const secondaryRegionSelector = createSelectorDefinition(
      'region-secondary',
      'region',
    )

    const resolved = resolveSelectorByType(
      [primaryRegionSelector, secondaryRegionSelector],
      'region',
    )

    expect(resolved).toBe(primaryRegionSelector)
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
  })

  it('동일 렌더 컨텍스트에서는 중복 selector 경고를 type별 1회로 제한한다', () => {
    const warningContext = createSelectorResolutionWarningContext()
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined)

    const duplicatedRegionSelectors: SelectorDefinition[] = [
      regionSelector,
      createSelectorDefinition('region-duplicate', 'region'),
    ]

    resolveSelectorByType(duplicatedRegionSelectors, 'region', {
      warningContext,
    })
    resolveSelectorByType(duplicatedRegionSelectors, 'region', {
      warningContext,
    })

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ComposableSearch] duplicate selector type detected'),
      expect.objectContaining({ selectorType: 'region', count: 2 }),
    )
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
