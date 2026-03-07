import '@testing-library/jest-dom/vitest'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { isValidElement, useCallback, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_REGION_SEARCH_RESULT_LIMIT,
  buildRegionSearchIndex,
  buildRegionSearchIndexAsync,
  createRegionSelector,
  filterRegionSearchResults,
  mapRegionSearchResultToCondition,
  type Region,
  type RegionDataSource,
  type RegionSelectProps,
  type SelectedRegionCondition,
} from '../src/index'

interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason?: unknown) => void
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve
    reject = nextReject
  })

  return {
    promise,
    resolve,
    reject,
  }
}

const regionData = {
  sidos: [
    { displayName: '서울특별시', name: '서울특별시', code: '11' },
    { displayName: '부산광역시', name: '부산광역시', code: '26' },
  ],
  sigungus: {
    '11': [
      { displayName: '강남구', name: '강남구', code: '11680' },
      { displayName: '송파구', name: '송파구', code: '11710' },
    ],
    '26': [{ displayName: '해운대구', name: '해운대구', code: '26350' }],
  },
  eupmyeondongs: {
    '11680': [{ displayName: '역삼동', name: '역삼동', code: '1168010100' }],
    '11710': [{ displayName: '잠실동', name: '잠실동', code: '1171010100' }],
    '26350': [{ displayName: '우동', name: '우동', code: '2635010100' }],
  },
} as const

function createRegionDataSource(): RegionDataSource {
  return {
    findAllSidos: () => [...regionData.sidos],
    findAllSigungus: (sidoCode) => [
      ...(regionData.sigungus[sidoCode as keyof typeof regionData.sigungus] ?? []),
    ],
    findAllEupmyeondongs: (sigunguCode) => [
      ...(
        regionData.eupmyeondongs[
          sigunguCode as keyof typeof regionData.eupmyeondongs
        ] ?? []
      ),
    ],
  }
}

function createRegionSelectorProps(
  overrides: Partial<RegionSelectProps> = {},
): RegionSelectProps {
  const base = createRegionDataSource()

  return {
    ...base,
    ...overrides,
    options: {
      placeholder: '지역 선택',
      searchInputLabel: '지역 검색',
      searchNoResultMessage: '검색 결과가 없습니다.',
      ...overrides.options,
    },
  }
}

interface RegionPanelHarnessProps {
  selector: ReturnType<typeof createRegionSelector>
  initialSelectedItems?: SelectedRegionCondition[]
  onSelectionChange?: (nextItems: SelectedRegionCondition[]) => void
  onError?: (error: unknown) => void
}

function RegionPanelHarness({
  selector,
  initialSelectedItems = [],
  onSelectionChange,
  onError,
}: RegionPanelHarnessProps) {
  const [selectedItems, setSelectedItems] = useState(initialSelectedItems)
  const handleSelectionChange = useCallback(
    (nextSelectedItems: SelectedRegionCondition[]) => {
      setSelectedItems(nextSelectedItems)
      onSelectionChange?.(nextSelectedItems)
    },
    [onSelectionChange],
  )
  const handleError = useCallback(
    (error: unknown) => {
      onError?.(error)
    },
    [onError],
  )

  return (
    <div>
      <ul data-testid="selected-items">
        {selectedItems.map((item) => (
          <li key={item.id}>{item.displayName}</li>
        ))}
      </ul>
      {selector.driver.renderPanel({
        selectorId: selector.id,
        selectorType: selector.type,
        props: selector.props,
        selectedItems,
        setSelectedItems: (nextItems) => {
          const nextSelectedItems = nextItems as SelectedRegionCondition[]
          handleSelectionChange(nextSelectedItems)
        },
        closePanel: () => undefined,
        emitError: handleError,
      })}
    </div>
  )
}

function renderRegionSelectorPanel(
  overrides: Partial<RegionSelectProps> = {},
  options: Pick<RegionPanelHarnessProps, 'onError' | 'onSelectionChange'> = {},
) {
  const selector = createRegionSelector(
    overrides.options?.placeholder === '지역 선택 2' ? 'region-secondary' : 'region-main',
    createRegionSelectorProps(overrides),
  )

  return render(
    <RegionPanelHarness
      selector={selector}
      onError={options.onError}
      onSelectionChange={options.onSelectionChange}
    />,
  )
}

describe('@compsable-search/selector-region', () => {
  it('검색 모델과 factory API를 패키지 내부 구현으로 노출한다', async () => {
    const selector = createRegionSelector('region-main', createRegionSelectorProps())
    const index = await Promise.resolve(buildRegionSearchIndex(createRegionDataSource()))
    const rendered = selector.driver.renderPanel({
      selectorId: selector.id,
      selectorType: selector.type,
      props: selector.props,
      selectedItems: [],
      setSelectedItems: () => undefined,
      closePanel: () => undefined,
      emitError: () => undefined,
    })

    expect(selector.id).toBe('region-main')
    expect(selector.type).toBe('region')
    expect(DEFAULT_REGION_SEARCH_RESULT_LIMIT).toBeGreaterThan(0)
    expect(isValidElement(rendered)).toBe(true)
    expect(index).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: '11', level: 'sido' }),
        expect.objectContaining({ id: '1168010100', level: 'eupmyeondong' }),
      ]),
    )
  })

  it('검색 결과 레벨별 매핑과 loadItems selector ownership을 유지한다', async () => {
    const selector = createRegionSelector('region-main', createRegionSelectorProps())
    const index = await Promise.resolve(buildRegionSearchIndex(createRegionDataSource()))
    const sidoResult = index.find((result) => result.id === '11')
    const eupmyeondongResult = index.find((result) => result.id === '1168010100')
    const loaded = await selector.driver.loadItems?.(
      { signal: new AbortController().signal },
      selector.props,
    )

    expect(sidoResult).toBeDefined()
    expect(eupmyeondongResult).toBeDefined()
    expect(mapRegionSearchResultToCondition(sidoResult!).condition).toMatchObject({
      id: '11',
      selectorId: 'region-selector',
      selectorType: 'region',
    })
    expect(mapRegionSearchResultToCondition(eupmyeondongResult!).condition).toMatchObject(
      {
        id: '1168010100',
        selectorType: 'region',
      },
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

  it('부분 일치 검색과 결과 제한 정책을 적용한다', async () => {
    const index = await Promise.resolve(buildRegionSearchIndex(createRegionDataSource()))

    const seoResults = filterRegionSearchResults(index, '서울')
    const gangResults = filterRegionSearchResults(index, '강', { limit: 1 })

    expect(seoResults.map((result) => result.pathLabel)).toContain('서울특별시')
    expect(gangResults).toHaveLength(1)
  })

  it('abort된 async 인덱스 빌드는 빈 결과를 반환한다', async () => {
    const controller = new AbortController()
    const deferred = createDeferred<Region[]>()
    const dataSource: RegionDataSource = {
      findAllSidos: (context) =>
        new Promise((resolve, reject) => {
          if (context?.signal.aborted) {
            reject(new DOMException('aborted', 'AbortError'))
            return
          }

          const onAbort = () => reject(new DOMException('aborted', 'AbortError'))
          context?.signal.addEventListener('abort', onAbort, { once: true })
          deferred.promise.then(resolve, reject)
        }),
      findAllSigungus: () => [],
      findAllEupmyeondongs: () => [],
    }

    const pending = buildRegionSearchIndexAsync(dataSource, {
      signal: controller.signal,
    })
    controller.abort()
    deferred.resolve([])

    await expect(pending).resolves.toEqual([])
  })

  it('계층 탐색과 whole/detail 상호배타를 region package 패널에서 유지한다', async () => {
    const user = userEvent.setup()

    renderRegionSelectorPanel()

    await user.click(await screen.findByRole('button', { name: '서울특별시' }))
    await user.click(await screen.findByRole('button', { name: '강남구' }))
    await user.click(await screen.findByRole('checkbox', { name: '역삼동' }))

    const selectedItems = screen.getByTestId('selected-items')
    expect(within(selectedItems).getByText('서울특별시>강남구>역삼동')).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: '강남구 전체' }))

    expect(
      within(selectedItems).getByText('서울특별시>강남구>강남구 전체'),
    ).toBeInTheDocument()
    expect(
      within(selectedItems).queryByText('서울특별시>강남구>역삼동'),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))

    expect(
      within(selectedItems).getByText('서울특별시>강남구>역삼동'),
    ).toBeInTheDocument()
    expect(
      within(selectedItems).queryByText('서울특별시>강남구>강남구 전체'),
    ).not.toBeInTheDocument()
  })

  it('검색 선택은 package panel 내부에서 selection을 갱신하고 onSelectedEupmyeondong을 호출한다', async () => {
    const user = userEvent.setup()
    const onSelectedEupmyeondong = vi.fn()

    renderRegionSelectorPanel({
      options: {
        placeholder: '지역 선택',
        searchInputLabel: '지역 검색',
        onSelectedEupmyeondong,
      },
    })

    await user.type(
      screen.getByRole('textbox', { name: '지역 검색' }),
      '역삼',
    )
    await user.click(
      await screen.findByRole('button', {
        name: '서울특별시 > 강남구 > 역삼동',
      }),
    )

    expect(screen.getByText('서울특별시>강남구>역삼동')).toBeInTheDocument()
    expect(onSelectedEupmyeondong).toHaveBeenCalledWith(
      expect.objectContaining({ code: '1168010100' }),
    )
  })

  it('no-result와 error 상태를 package panel 자체 정책으로 표시한다', async () => {
    const user = userEvent.setup()
    const sidosDeferred = createDeferred<Region[]>()
    const searchErrorMessage = '지역 검색 실패'

    const { rerender } = render(
      <RegionPanelHarness
        selector={createRegionSelector(
          'region-main',
          createRegionSelectorProps({
            findAllSidos: () => sidosDeferred.promise,
            findAllSigungus: () => [],
            findAllEupmyeondongs: () => [],
            options: {
              placeholder: '지역 선택',
              searchInputLabel: '지역 검색',
              searchNoResultMessage: '검색 결과가 없습니다.',
              searchErrorMessage,
            },
          }),
        )}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: '지역 검색' }), '없는 지역')
    sidosDeferred.resolve([])

    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument()
    })

    const errorDeferred = createDeferred<Region[]>()
    rerender(
      <RegionPanelHarness
        selector={createRegionSelector(
          'region-main',
          createRegionSelectorProps({
            findAllSidos: () => errorDeferred.promise,
            findAllSigungus: () => [],
            findAllEupmyeondongs: () => [],
            options: {
              placeholder: '지역 선택',
              searchInputLabel: '지역 검색',
              searchNoResultMessage: '검색 결과가 없습니다.',
              searchErrorMessage,
            },
          }),
        )}
      />,
    )

    await user.clear(screen.getByRole('textbox', { name: '지역 검색' }))
    await user.type(screen.getByRole('textbox', { name: '지역 검색' }), '서울')
    errorDeferred.reject(new Error('network-failed'))

    await waitFor(() => {
      expect(screen.getByText(searchErrorMessage)).toBeInTheDocument()
    })
    expect(screen.queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument()
  })

  it('같은 data source 함수는 검색 인덱스 cache를 재사용한다', async () => {
    const user = userEvent.setup()
    const findAllSidos = vi.fn(() => [...regionData.sidos])
    const findAllSigungus = vi.fn((sidoCode: string) => [
      ...(regionData.sigungus[sidoCode as keyof typeof regionData.sigungus] ?? []),
    ])
    const findAllEupmyeondongs = vi.fn((sigunguCode: string) => [
      ...(
        regionData.eupmyeondongs[
          sigunguCode as keyof typeof regionData.eupmyeondongs
        ] ?? []
      ),
    ])

    const createCachedSelector = () =>
      createRegionSelector(
        'region-main',
        createRegionSelectorProps({
          findAllSidos,
          findAllSigungus,
          findAllEupmyeondongs,
        }),
      )

    const { rerender } = render(<RegionPanelHarness selector={createCachedSelector()} />)

    await user.type(screen.getByRole('textbox', { name: '지역 검색' }), '서울')
    await expect(
      within(screen.getByTestId('cs-region-search-area')).findByRole('button', {
        name: '서울특별시',
      }),
    ).resolves.toBeInTheDocument()

    rerender(<RegionPanelHarness selector={createCachedSelector()} />)

    await user.clear(screen.getByRole('textbox', { name: '지역 검색' }))
    await user.type(screen.getByRole('textbox', { name: '지역 검색' }), '서울')

    await expect(
      within(screen.getByTestId('cs-region-search-area')).findByRole('button', {
        name: '서울특별시',
      }),
    ).resolves.toBeInTheDocument()

    expect(findAllSidos).toHaveBeenCalledTimes(3)
    expect(findAllSigungus).toHaveBeenCalledTimes(regionData.sidos.length)
    expect(findAllEupmyeondongs).toHaveBeenCalledTimes(
      Object.keys(regionData.sigungus).reduce((total, sidoCode) => {
        const sigungus =
          regionData.sigungus[sidoCode as keyof typeof regionData.sigungus] ?? []
        return total + sigungus.length
      }, 0),
    )
  })

  it('비동기 인덱스 요청 경합 시 최신 결과만 유지한다', async () => {
    const user = userEvent.setup()
    const firstDeferred = createDeferred<Region[]>()
    const secondDeferred = createDeferred<Region[]>()

    const { rerender } = render(
      <RegionPanelHarness
        selector={createRegionSelector(
          'region-main',
          createRegionSelectorProps({
            findAllSidos: () => firstDeferred.promise,
            findAllSigungus: () => [],
            findAllEupmyeondongs: () => [],
          }),
        )}
      />,
    )

    const searchInput = screen.getByRole('textbox', { name: '지역 검색' })
    await user.type(searchInput, '부산')

    rerender(
      <RegionPanelHarness
        selector={createRegionSelector(
          'region-main',
          createRegionSelectorProps({
            findAllSidos: () => secondDeferred.promise,
            findAllSigungus: () => [],
            findAllEupmyeondongs: () => [],
          }),
        )}
      />,
    )

    await user.clear(screen.getByRole('textbox', { name: '지역 검색' }))
    await user.type(screen.getByRole('textbox', { name: '지역 검색' }), '부산')

    await act(async () => {
      secondDeferred.resolve([
        { displayName: '부산광역시', name: '부산광역시', code: '26' },
      ])
    })

    await expect(
      within(screen.getByTestId('cs-region-search-area')).findByRole('button', {
        name: '부산광역시',
      }),
    ).resolves.toBeInTheDocument()

    await act(async () => {
      firstDeferred.resolve([
        { displayName: '서울특별시', name: '서울특별시', code: '11' },
      ])
    })

    await waitFor(() => {
      expect(
        within(screen.getByTestId('cs-region-search-area')).getByRole('button', {
          name: '부산광역시',
        }),
      ).toBeInTheDocument()
      expect(
        within(screen.getByTestId('cs-region-search-area')).queryByRole('button', {
          name: '서울특별시',
        }),
      ).not.toBeInTheDocument()
    })
  })
})
