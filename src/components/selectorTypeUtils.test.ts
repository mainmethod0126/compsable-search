import { afterEach, describe, expect, it, vi } from 'vitest'
import type {
  ComposableSelectProps,
  KeywordSelectProps,
  RegionSelectProps,
} from './types'
import {
  createSelectorResolutionWarningContext,
  isKeywordSelector,
  isRegionSelector,
  resolveSelectorByType,
  validateSelectorTypeUniqueness,
  type SelectorOfType,
} from './selectorTypeUtils'

const regionSelector: RegionSelectProps = {
  type: 'region',
  findAllSidos: () => [{ displayName: '서울특별시', name: '서울특별시', code: '11' }],
  findAllSigungus: () => [{ displayName: '강남구', name: '강남구', code: '11680' }],
  findAllEupmyeondongs: () => [
    { displayName: '역삼동', name: '역삼동', code: '1168010100' },
  ],
}

const keywordSelector: KeywordSelectProps = {
  type: 'keyword',
  options: {
    placeHolder: '키워드 선택',
  },
}

describe('selectorTypeUtils', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('selector type literal로 원하는 selector를 조회한다', () => {
    const selectors: ComposableSelectProps[] = [keywordSelector, regionSelector]

    const resolvedRegion = resolveSelectorByType(selectors, 'region')
    const resolvedKeyword = resolveSelectorByType(selectors, 'keyword')

    expect(resolvedRegion).toBe(regionSelector)
    expect(resolvedKeyword).toBe(keywordSelector)
  })

  it('region/keyword type guard가 런타임 분기를 명확하게 보장한다', () => {
    const selectors: ComposableSelectProps[] = [regionSelector, keywordSelector]

    const onlyRegion = selectors.filter(isRegionSelector)
    const onlyKeyword = selectors.filter(isKeywordSelector)

    expect(onlyRegion).toEqual([regionSelector])
    expect(onlyKeyword).toEqual([keywordSelector])
  })

  it('SelectorOfType 공통 유틸 타입이 공개 계약 타입을 그대로 보존한다', () => {
    const expectsRegionSelectorType: SelectorOfType<'region'> = regionSelector
    const expectsKeywordSelectorType: SelectorOfType<'keyword'> = keywordSelector

    expect(expectsRegionSelectorType.type).toBe('region')
    expect(expectsKeywordSelectorType.type).toBe('keyword')
  })

  it('동일 type selector가 여러 개면 first-wins 정책으로 첫 selector를 선택한다', () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined)
    const primaryRegionSelector: RegionSelectProps = {
      ...regionSelector,
      options: {
        placeHolder: '지역 선택 A',
      },
    }
    const secondaryRegionSelector: RegionSelectProps = {
      ...regionSelector,
      options: {
        placeHolder: '지역 선택 B',
      },
    }

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

    const duplicatedRegionSelectors: ComposableSelectProps[] = [
      regionSelector,
      {
        ...regionSelector,
        options: {
          placeHolder: '중복 지역 선택기',
        },
      },
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

  it('selector type 중복 검증 유틸은 중복 type/count 메타데이터를 반환한다', () => {
    const duplicates = validateSelectorTypeUniqueness([
      regionSelector,
      {
        ...regionSelector,
        options: {
          placeHolder: '중복 지역 선택기',
        },
      },
      keywordSelector,
    ])

    expect(duplicates).toEqual([{ selectorType: 'region', count: 2 }])
  })
})
