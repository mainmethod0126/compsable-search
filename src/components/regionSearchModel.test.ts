import { isValidElement } from 'react'
import { describe, expect, it } from 'vitest'
import { LEGACY_REGION_SELECTOR_ID } from './internalTypes'
import { createRegionSelector } from './selectors/createRegionSelector'
import type { RegionDataSource } from './types'
import {
  buildRegionSearchIndex,
  buildRegionSearchIndexAsync,
  filterRegionSearchResults,
  mapRegionSearchResultToCondition,
} from './regionSearchModel'

const regionDataSource: RegionDataSource = {
  findAllSidos: () => [
    { displayName: '서울특별시', name: '서울특별시', code: '11' },
    { displayName: '경기도', name: '경기도', code: '41' },
    { displayName: '충청남도', name: '충청남도', code: '44' },
  ],
  findAllSigungus: (sidoCode: string) => {
    if (sidoCode === '11') {
      return [{ displayName: '광진구', name: '광진구', code: '11215' }]
    }

    if (sidoCode === '41') {
      return [{ displayName: '수원시 장안구', name: '수원시 장안구', code: '41111' }]
    }

    if (sidoCode === '44') {
      return [{ displayName: '서산시', name: '서산시', code: '44210' }]
    }

    return []
  },
  findAllEupmyeondongs: (sigunguCode: string) => {
    if (sigunguCode === '11215') {
      return [{ displayName: '자양동', name: '자양동', code: '1121510500' }]
    }

    if (sigunguCode === '41111') {
      return [{ displayName: '조원동', name: '조원동', code: '4111113300' }]
    }

    if (sigunguCode === '44210') {
      return [{ displayName: '동문동', name: '동문동', code: '4421010100' }]
    }

    return []
  },
}

describe('regionSearchModel', () => {
  it('지역 트리를 평탄화해 시도/시군구/읍면동 미리보기 인덱스를 생성한다', async () => {
    const index = await Promise.resolve(buildRegionSearchIndex(regionDataSource))

    expect(index).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: '11',
          level: 'sido',
          pathLabel: '서울특별시',
        }),
        expect.objectContaining({
          id: '44210',
          level: 'sigungu',
          pathLabel: '충청남도 > 서산시',
        }),
        expect.objectContaining({
          id: '4111113300',
          level: 'eupmyeondong',
          pathLabel: '경기도 > 수원시 장안구 > 조원동',
        }),
      ]),
    )
  })

  it('부분 일치 검색(`수`/`서`)과 결과 제한 정책을 적용한다', async () => {
    const index = await Promise.resolve(buildRegionSearchIndex(regionDataSource))

    const seoResults = filterRegionSearchResults(index, '서')
    const suResults = filterRegionSearchResults(index, '수', { limit: 1 })

    expect(seoResults.map((result) => result.pathLabel)).toEqual(
      expect.arrayContaining(['서울특별시', '충청남도 > 서산시']),
    )
    expect(suResults).toHaveLength(1)
  })

  it('검색 결과 레벨별로 SelectedRegionCondition 매핑 규칙을 유지한다', async () => {
    const index = await Promise.resolve(buildRegionSearchIndex(regionDataSource))
    const sidoResult = index.find((result) => result.id === '11')
    const sigunguResult = index.find((result) => result.id === '44210')
    const eupmyeondongResult = index.find((result) => result.id === '4111113300')

    expect(sidoResult).toBeDefined()
    expect(sigunguResult).toBeDefined()
    expect(eupmyeondongResult).toBeDefined()

    const mappedSido = mapRegionSearchResultToCondition(sidoResult!)
    const mappedSigungu = mapRegionSearchResultToCondition(sigunguResult!)
    const mappedEupmyeondong = mapRegionSearchResultToCondition(eupmyeondongResult!)

    expect(mappedSido.condition).toMatchObject({
      id: '11',
      displayName: '서울특별시>서울특별시 전체>서울특별시 전체',
      selectorId: LEGACY_REGION_SELECTOR_ID,
      selectorType: 'region',
    })
    expect(mappedSido.selectedRegion).toMatchObject({
      code: '11',
      displayName: '서울특별시 전체',
    })

    expect(mappedSigungu.condition).toMatchObject({
      id: '44210',
      displayName: '충청남도>서산시>서산시 전체',
      selectorId: LEGACY_REGION_SELECTOR_ID,
      selectorType: 'region',
    })
    expect(mappedSigungu.selectedRegion).toMatchObject({
      code: '44210',
      displayName: '서산시 전체',
    })

    expect(mappedEupmyeondong.condition).toMatchObject({
      id: '4111113300',
      displayName: '경기도>수원시 장안구>조원동',
      selectorId: LEGACY_REGION_SELECTOR_ID,
      selectorType: 'region',
    })
    expect(mappedEupmyeondong.selectedRegion).toMatchObject({
      code: '4111113300',
      displayName: '조원동',
    })
  })

  it('sync+async RegionDataSource를 혼합해도 인덱스 빌드를 완료한다', async () => {
    const asyncDataSource: RegionDataSource = {
      findAllSidos: regionDataSource.findAllSidos,
      findAllSigungus: async (sidoCode) =>
        Promise.resolve(regionDataSource.findAllSigungus(sidoCode)),
      findAllEupmyeondongs: (sigunguCode) =>
        Promise.resolve(regionDataSource.findAllEupmyeondongs(sigunguCode)),
    }

    const index = await Promise.resolve(buildRegionSearchIndex(asyncDataSource))

    expect(index).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: '11',
          level: 'sido',
        }),
        expect.objectContaining({
          id: '4421010100',
          level: 'eupmyeondong',
        }),
      ]),
    )
  })

  it('SelectorLoadContext.signal이 abort되면 async 인덱스 빌드는 안전하게 빈 결과를 반환한다', async () => {
    const controller = new AbortController()
    const abortAwareDataSource: RegionDataSource = {
      findAllSidos: async (context) =>
        new Promise((resolve, reject) => {
          if (context?.signal.aborted) {
            reject(new DOMException('aborted', 'AbortError'))
            return
          }

          const onAbort = () => reject(new DOMException('aborted', 'AbortError'))
          context?.signal.addEventListener('abort', onAbort, { once: true })
          setTimeout(() => {
            context?.signal.removeEventListener('abort', onAbort)
            resolve(regionDataSource.findAllSidos())
          }, 0)
        }),
      findAllSigungus: regionDataSource.findAllSigungus,
      findAllEupmyeondongs: regionDataSource.findAllEupmyeondongs,
    }

    const pending = buildRegionSearchIndexAsync(abortAwareDataSource, {
      signal: controller.signal,
    })
    controller.abort()

    await expect(pending).resolves.toEqual([])
  })

  it('커스텀 selectorId를 전달하면 매핑 결과 condition에 반영한다', async () => {
    const index = await Promise.resolve(buildRegionSearchIndex(regionDataSource))
    const target = index.find((result) => result.id === '1121510500')

    expect(target).toBeDefined()

    const mapped = mapRegionSearchResultToCondition(target!, {
      selectorId: 'region-main',
    })

    expect(mapped.condition.selectorId).toBe('region-main')
    expect(mapped.condition.selectorType).toBe('region')
  })

  it('createRegionSelector 기본 driver는 loadItems에서 selectorId/selectorType을 채운다', async () => {
    const selector = createRegionSelector('region-main', regionDataSource)
    const loaded = await selector.driver.loadItems?.(
      { signal: new AbortController().signal },
      selector.props,
    )

    expect(loaded).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          selectorId: 'region-main',
          selectorType: 'region',
        }),
      ]),
    )
  })

  it('createRegionSelector 기본 driver는 RegionDetailPanel 렌더 노드를 반환한다', () => {
    const selector = createRegionSelector('region-main', regionDataSource)
    const rendered = selector.driver.renderPanel({
      selectorId: selector.id,
      selectorType: selector.type,
      props: selector.props,
      selectedItems: [],
      setSelectedItems: () => {},
      closePanel: () => {},
      emitError: () => {},
    })

    expect(isValidElement(rendered)).toBe(true)
  })
})
