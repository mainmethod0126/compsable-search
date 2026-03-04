import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComposableSearch } from './ComposableSearch'
import { createRegionSelector } from './selectors'
import type { Region, RegionSelectProps } from './types'

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

const NO_RESULT_MESSAGE = '검색 결과가 없습니다.'
const SEARCH_ERROR_MESSAGE = '지역 검색 중 오류가 발생했습니다.'

type AsyncRegionOptions = NonNullable<RegionSelectProps['options']> & {
  searchErrorMessage?: string
}

type AsyncRegionOverrides = Partial<Omit<RegionSelectProps, 'options'>> & {
  options?: Partial<AsyncRegionOptions>
}

function createAsyncRegionSelector(
  id = 'region-async',
  overrides: AsyncRegionOverrides = {},
) {
  const baseOptions: AsyncRegionOptions = {
    placeholder: '지역 선택',
    searchInputLabel: '지역 검색',
    searchNoResultMessage: NO_RESULT_MESSAGE,
  }

  const mergedOptions: AsyncRegionOptions = {
    ...baseOptions,
    ...overrides.options,
  }

  const selectorProps: RegionSelectProps = {
    findAllSidos: overrides.findAllSidos ?? (() => []),
    findAllSigungus: overrides.findAllSigungus ?? (() => []),
    findAllEupmyeondongs: overrides.findAllEupmyeondongs ?? (() => []),
    options: mergedOptions as RegionSelectProps['options'],
  }

  return createRegionSelector(id, {
    ...selectorProps,
  })
}

async function openRegionSearchPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: '지역 선택' }))

  const searchArea = screen.getByTestId('cs-region-search-area')
  const searchInput = within(searchArea).getByRole('textbox', {
    name: '지역 검색',
  })

  return {
    searchArea,
    searchInput,
  }
}

describe('ComposableSearch async 지역 검색 UX (TDD Red)', () => {
  it('async RegionDataSource에서도 상단 지역 검색 인덱스 결과를 노출해야 한다', async () => {
    const user = userEvent.setup()
    const sidosDeferred = createDeferred<Region[]>()

    const regionSelector = createAsyncRegionSelector('region-async', {
      findAllSidos: () => sidosDeferred.promise,
    })

    render(<ComposableSearch selectors={[regionSelector]} />)

    const { searchArea, searchInput } = await openRegionSearchPanel(user)

    await user.type(searchInput, '서울')

    sidosDeferred.resolve([
      { displayName: '서울특별시', name: '서울특별시', code: '11' },
      { displayName: '부산광역시', name: '부산광역시', code: '26' },
    ])

    await expect(
      within(searchArea).findByRole('button', { name: '서울특별시' }),
    ).resolves.toBeInTheDocument()
  })

  it('검색어 입력 직후 인덱스 로딩 중에는 no-result를 숨기고, 로딩 완료 후 결과가 없을 때만 노출해야 한다', async () => {
    const user = userEvent.setup()
    const sidosDeferred = createDeferred<Region[]>()

    const regionSelector = createAsyncRegionSelector('region-async', {
      findAllSidos: () => sidosDeferred.promise,
    })

    render(<ComposableSearch selectors={[regionSelector]} />)

    const { searchArea, searchInput } = await openRegionSearchPanel(user)

    await user.type(searchInput, '존재하지않는지역')

    expect(
      within(searchArea).queryByText(NO_RESULT_MESSAGE),
    ).not.toBeInTheDocument()

    sidosDeferred.resolve([])

    await waitFor(() => {
      expect(within(searchArea).getByText(NO_RESULT_MESSAGE)).toBeInTheDocument()
    })
  })

  it('error 상태에서는 searchErrorMessage를 우선 노출하고 no-result는 숨긴다', async () => {
    const user = userEvent.setup()
    const sidosDeferred = createDeferred<Region[]>()

    const regionSelector = createAsyncRegionSelector('region-async', {
      findAllSidos: () => sidosDeferred.promise,
      options: {
        searchNoResultMessage: NO_RESULT_MESSAGE,
        searchErrorMessage: SEARCH_ERROR_MESSAGE,
      },
    })

    render(<ComposableSearch selectors={[regionSelector]} />)

    const { searchArea, searchInput } = await openRegionSearchPanel(user)
    await user.type(searchInput, '서울')

    sidosDeferred.reject(new Error('network-failed'))

    await waitFor(() => {
      expect(within(searchArea).getByText(SEARCH_ERROR_MESSAGE)).toBeInTheDocument()
    })

    expect(within(searchArea).queryByText(NO_RESULT_MESSAGE)).not.toBeInTheDocument()
  })

  it('요청 경합(race) 시 stale 검색 인덱스 결과는 반영하지 않고 최신 결과만 유지한다', async () => {
    const user = userEvent.setup()
    const firstSidosDeferred = createDeferred<Region[]>()
    const secondSidosDeferred = createDeferred<Region[]>()

    const { rerender } = render(
      <ComposableSearch
        selectors={[
          createAsyncRegionSelector('region-async', {
            findAllSidos: () => firstSidosDeferred.promise,
          }),
        ]}
      />,
    )

    const { searchInput } = await openRegionSearchPanel(user)
    await user.type(searchInput, '부산')

    rerender(
      <ComposableSearch
        selectors={[
          createAsyncRegionSelector('region-async', {
            findAllSidos: () => secondSidosDeferred.promise,
          }),
        ]}
      />,
    )

    const latestSearchArea = screen.getByTestId('cs-region-search-area')
    const latestSearchInput = within(latestSearchArea).getByRole('textbox', {
      name: '지역 검색',
    })
    await user.clear(latestSearchInput)
    await user.type(latestSearchInput, '부산')

    secondSidosDeferred.resolve([
      { displayName: '부산광역시', name: '부산광역시', code: '26' },
    ])

    await expect(
      within(latestSearchArea).findByRole('button', { name: '부산광역시' }),
    ).resolves.toBeInTheDocument()

    firstSidosDeferred.resolve([
      { displayName: '서울특별시', name: '서울특별시', code: '11' },
    ])

    await waitFor(() => {
      expect(
        within(latestSearchArea).getByRole('button', { name: '부산광역시' }),
      ).toBeInTheDocument()
      expect(
        within(latestSearchArea).queryByRole('button', { name: '서울특별시' }),
      ).not.toBeInTheDocument()
      expect(
        within(latestSearchArea).queryByText(NO_RESULT_MESSAGE),
      ).not.toBeInTheDocument()
    })
  })
})
