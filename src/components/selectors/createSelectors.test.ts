import { describe, expect, it } from 'vitest'
import type {
  KeywordSelectProps,
  KeywordSelectorDriver,
  RegionSelectProps,
  RegionSelectorDriver,
  SelectionItem,
  SelectorDefinition,
} from '../types'
import { createKeywordSelector } from './createKeywordSelector'
import { createRegionSelector } from './createRegionSelector'
import { createSelector } from './createSelector'

const SIDOS = [
  { displayName: '서울특별시', name: '서울특별시', code: '11' },
]
const SIGUNGUS = {
  '11': [{ displayName: '강남구', name: '강남구', code: '11680' }],
}
const EUPMYEONDONGS = {
  '11680': [{ displayName: '역삼동', name: '역삼동', code: '1168010100' }],
}

describe('create selector factories', () => {
  it('createSelector는 전달된 SelectorDefinition을 그대로 반환한다', () => {
    type CustomProps = {
      title: string
    }

    const customDriver: SelectorDefinition<
      CustomProps,
      'custom',
      SelectionItem
    >['driver'] = {
      type: 'custom',
      getTriggerLabel: (props: CustomProps) => props.title,
      renderPanel: () => null,
    }

    const definition: SelectorDefinition<CustomProps, 'custom', SelectionItem> = {
      id: 'custom-main',
      type: 'custom',
      props: {
        title: '커스텀 셀렉터',
      },
      driver: customDriver,
    }

    const selector = createSelector(definition)

    expect(selector).toBe(definition)
    expect(selector.driver.getTriggerLabel(selector.props)).toBe('커스텀 셀렉터')
  })

  it('createRegionSelector는 RegionSelectorDefinition을 생성하고 기본 드라이버를 채운다', () => {
    const regionProps: RegionSelectProps = {
      findAllSidos: () => SIDOS,
      findAllSigungus: (sidoCode) => SIGUNGUS[sidoCode as keyof typeof SIGUNGUS] ?? [],
      findAllEupmyeondongs: (sigunguCode) =>
        EUPMYEONDONGS[sigunguCode as keyof typeof EUPMYEONDONGS] ?? [],
      options: {
        placeholder: '지역 선택',
      },
    }

    const selector = createRegionSelector('region-main', regionProps)

    expect(selector.id).toBe('region-main')
    expect(selector.type).toBe('region')
    expect(selector.driver.type).toBe('region')
    expect(selector.driver.getTriggerLabel(selector.props)).toBe('지역 선택')
    expect(selector.props.findAllSidos()).toEqual(SIDOS)
  })

  it('createKeywordSelector는 KeywordSelectorDefinition을 생성하고 version/driver override를 지원한다', () => {
    const keywordProps: KeywordSelectProps = {
      options: {
        placeholder: '키워드 선택',
        maxTokens: 5,
      },
    }

    const keywordDriver: KeywordSelectorDriver = {
      type: 'keyword',
      getTriggerLabel: (props) => `커스텀:${props.options?.placeholder ?? ''}`,
      renderPanel: () => null,
    }

    const selector = createKeywordSelector('keyword-main', keywordProps, {
      version: '2026-03',
      driver: keywordDriver,
    })

    expect(selector.id).toBe('keyword-main')
    expect(selector.type).toBe('keyword')
    expect(selector.version).toBe('2026-03')
    expect(selector.driver).toBe(keywordDriver)
    expect(selector.driver.getTriggerLabel(selector.props)).toBe('커스텀:키워드 선택')
    expect(selector.props.options?.maxTokens).toBe(5)
  })

  it('createRegionSelector는 custom region driver override를 지원한다', () => {
    const regionProps: RegionSelectProps = {
      findAllSidos: () => SIDOS,
      findAllSigungus: () => [],
      findAllEupmyeondongs: () => [],
      options: {
        placeholder: '기본 라벨',
      },
    }

    const regionDriver: RegionSelectorDriver = {
      type: 'region',
      getTriggerLabel: () => '커스텀 지역 라벨',
      renderPanel: () => null,
    }

    const selector = createRegionSelector('region-override', regionProps, {
      version: 2,
      driver: regionDriver,
    })

    expect(selector.version).toBe(2)
    expect(selector.driver).toBe(regionDriver)
    expect(selector.driver.getTriggerLabel(selector.props)).toBe('커스텀 지역 라벨')
  })
})
