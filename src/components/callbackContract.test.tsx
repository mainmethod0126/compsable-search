import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComposableSearch } from './ComposableSearch'
import { CALLBACK_ERROR_PREFIX } from './callbackPipeline'
import type {
  RegionSelectProps,
  SearchSelectionItem,
  SelectorInstance,
} from './types'

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

const searchableRegionData = {
  sidos: [
    { displayName: '서울특별시', name: '서울특별시', code: '11' },
    { displayName: '경기도', name: '경기도', code: '41' },
    { displayName: '충청남도', name: '충청남도', code: '44' },
  ],
  sigungus: {
    '11': [{ displayName: '광진구', name: '광진구', code: '11215' }],
    '41': [{ displayName: '수원시 장안구', name: '수원시 장안구', code: '41111' }],
    '44': [{ displayName: '서산시', name: '서산시', code: '44210' }],
  },
  eupmyeondongs: {
    '11215': [{ displayName: '자양동', name: '자양동', code: '1121510500' }],
    '41111': [{ displayName: '조원동', name: '조원동', code: '4111113300' }],
    '44210': [{ displayName: '동문동', name: '동문동', code: '4421010100' }],
  },
} as const

function createRegionSelector(
  overrides: Partial<RegionSelectProps> = {},
): RegionSelectProps {
  return {
    type: 'region',
    findAllSidos: () => [...regionData.sidos],
    findAllSigungus: (sidoCode: string) => [
      ...(regionData.sigungus[sidoCode as keyof typeof regionData.sigungus] ?? []),
    ],
    findAllEupmyeondongs: (sigunguCode: string) => [
      ...(
        regionData.eupmyeondongs[
          sigunguCode as keyof typeof regionData.eupmyeondongs
        ] ?? []
      ),
    ],
    options: {
      placeHolder: '지역 선택',
    },
    ...overrides,
  }
}

function createSearchableRegionSelector(
  overrides: Partial<RegionSelectProps> = {},
): RegionSelectProps {
  return {
    type: 'region',
    findAllSidos: () => [...searchableRegionData.sidos],
    findAllSigungus: (sidoCode: string) => [
      ...(
        searchableRegionData.sigungus[
          sidoCode as keyof typeof searchableRegionData.sigungus
        ] ?? []
      ),
    ],
    findAllEupmyeondongs: (sigunguCode: string) => [
      ...(
        searchableRegionData.eupmyeondongs[
          sigunguCode as keyof typeof searchableRegionData.eupmyeondongs
        ] ?? []
      ),
    ],
    options: {
      placeHolder: '지역 선택',
    },
    ...overrides,
  }
}

describe('callback contract', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('onChange는 선택/해제/전체삭제 흐름에서 표준 payload(SelectedRegionCondition[])를 전달한다', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <ComposableSearch
        selectorsProps={[
          createRegionSelector({
            options: {
              placeHolder: '지역 선택',
              onChange,
            },
          }),
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))
    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))

    expect(onChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: '1168010100',
          displayName: '서울특별시>강남구>역삼동',
        }),
      ]),
    )

    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))
    expect(onChange).toHaveBeenLastCalledWith([])

    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))
    await user.click(screen.getByRole('button', { name: '전체 삭제' }))
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it('top-level onChange가 제공되면 region.options.onChange 대신 우선 호출된다', async () => {
    const user = userEvent.setup()
    const topLevelOnChange = vi.fn()
    const legacyRegionOnChange = vi.fn()

    render(
      <ComposableSearch
        onChange={topLevelOnChange}
        selectorsProps={[
          createRegionSelector({
            options: {
              placeHolder: '지역 선택',
              onChange: legacyRegionOnChange,
            },
          }),
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))
    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))

    expect(topLevelOnChange).toHaveBeenCalledTimes(1)
    expect(topLevelOnChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: '1168010100',
          displayName: '서울특별시>강남구>역삼동',
        }),
      ]),
    )
    expect(legacyRegionOnChange).not.toHaveBeenCalled()
  })

  it('onValueChange는 source/selectorType/selectorId meta를 포함해 전달하고 레거시 onChange 계약도 유지한다', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const onChange = vi.fn()
    const selectors: SelectorInstance[] = [
      {
        id: 'region-main',
        type: 'region',
        props: createRegionSelector(),
      },
    ]

    render(
      <ComposableSearch
        selectors={selectors}
        onValueChange={onValueChange}
        onChange={onChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))
    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))

    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: '1168010100',
          displayName: '서울특별시>강남구>역삼동',
        }),
      ]),
      expect.objectContaining({
        source: 'region',
        selectorType: 'region',
        selectorId: 'region-main',
      }),
    )
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('controlled 모드에서 동일 값 제안은 onValueChange/onChange를 중복 emit하지 않는다', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const onChange = vi.fn()
    const controlledValue: SearchSelectionItem[] = [
      {
        id: 'keyword:react',
        displayName: '키워드: react',
        keyword: 'react',
        normalizedKeyword: 'react',
      },
    ]

    render(
      <ComposableSearch
        value={controlledValue}
        onValueChange={onValueChange}
        onChange={onChange}
        selectors={[
          {
            id: 'region-main',
            type: 'region',
            props: createRegionSelector({
              options: {
                placeHolder: '지역 선택',
              },
            }),
          },
          {
            id: 'keyword-main',
            type: 'keyword',
            props: {
              type: 'keyword',
              options: {
                placeHolder: '키워드 선택',
              },
            },
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: '키워드 선택' }))
    await user.type(screen.getByRole('textbox', { name: '키워드 입력' }), 'react{Enter}')

    expect(onValueChange).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('region + keyword 조합 상태를 onChange payload에 함께 전달한다', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <ComposableSearch
        selectorsProps={[
          createRegionSelector({
            options: {
              placeHolder: '지역 선택',
              onChange,
            },
          }),
          {
            type: 'keyword',
            options: {
              placeHolder: '키워드 선택',
            },
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))
    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))
    await user.click(screen.getByRole('button', { name: '키워드 선택' }))
    await user.type(screen.getByRole('textbox', { name: '키워드 입력' }), 'React{Enter}')

    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({
        id: '1168010100',
        displayName: '서울특별시>강남구>역삼동',
      }),
      expect.objectContaining({
        id: 'keyword:react',
        displayName: '키워드: react',
        keyword: 'react',
      }),
    ])
  })

  it('onSelectedEupmyeondong은 선택 확정 시점에만 호출되고 해제 시에는 재호출되지 않는다', async () => {
    const user = userEvent.setup()
    const onSelectedEupmyeondong = vi.fn()
    render(
      <ComposableSearch
        selectorsProps={[
          createRegionSelector({
            options: {
              placeHolder: '지역 선택',
              onSelectedEupmyeondong,
            },
          }),
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))
    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))

    expect(onSelectedEupmyeondong).toHaveBeenCalledTimes(1)
    expect(onSelectedEupmyeondong).toHaveBeenLastCalledWith(
      expect.objectContaining({ code: '1168010100' }),
    )

    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))
    expect(onSelectedEupmyeondong).toHaveBeenCalledTimes(1)
  })

  it('region/keyword onClick은 누락 없이 실행되고 예외가 발생해도 UI 흐름은 유지된다', async () => {
    const user = userEvent.setup()
    const regionOnClick = vi.fn(() => {
      throw new Error('region click failed')
    })
    const keywordOnClick = vi.fn(() => {
      throw new Error('keyword click failed')
    })
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    render(
      <ComposableSearch
        selectorsProps={[
          createRegionSelector({
            options: {
              placeHolder: '지역 선택',
              onClick: regionOnClick,
            },
          }),
          {
            type: 'keyword',
            options: {
              placeHolder: '키워드 선택',
              onClick: keywordOnClick,
            },
          },
        ]}
      />,
    )

    const detailArea = screen.getByTestId('cs-detailed-area')
    expect(detailArea).toHaveAttribute('data-state', 'closed')

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '키워드 선택' }))

    expect(detailArea).toHaveAttribute('data-state', 'open')
    expect(regionOnClick).toHaveBeenCalledTimes(1)
    expect(keywordOnClick).toHaveBeenCalledTimes(1)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(CALLBACK_ERROR_PREFIX),
      expect.stringContaining('region.onClick'),
      expect.any(Error),
    )
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(CALLBACK_ERROR_PREFIX),
      expect.stringContaining('keyword.onClick'),
      expect.any(Error),
    )
  })

  it('plugin onInit/onDispose 예외가 발생해도 렌더와 사용자 상호작용이 유지된다', async () => {
    const user = userEvent.setup()
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    const onInit = vi.fn(() => {
      throw new Error('plugin onInit failed')
    })
    const onDispose = vi.fn(() => {
      throw new Error('plugin onDispose failed')
    })
    const selectors: SelectorInstance[] = [
      {
        id: 'region-main',
        type: 'region',
        props: createRegionSelector(),
      },
    ]
    const { unmount } = render(
      <ComposableSearch
        selectors={selectors}
        plugins={{
          regionPlugin: {
            id: 'region-plugin',
            type: 'region',
            onInit,
            onDispose,
          },
        }}
      />,
    )

    expect(onInit).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    expect(screen.getByTestId('cs-detailed-area')).toHaveAttribute('data-state', 'open')

    unmount()

    expect(onDispose).toHaveBeenCalledTimes(1)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(CALLBACK_ERROR_PREFIX),
      expect.stringContaining('plugin.onInit'),
      expect.any(Error),
    )
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(CALLBACK_ERROR_PREFIX),
      expect.stringContaining('plugin.onDispose'),
      expect.any(Error),
    )
  })

  it('onChange/onSelectedEupmyeondong 콜백 오류가 발생해도 조건 선택/칩 렌더링은 중단되지 않는다', async () => {
    const user = userEvent.setup()
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    render(
      <ComposableSearch
        selectorsProps={[
          createRegionSelector({
            options: {
              placeHolder: '지역 선택',
              onChange: () => {
                throw new Error('onChange failed')
              },
              onSelectedEupmyeondong: () => {
                throw new Error('onSelectedEupmyeondong failed')
              },
            },
          }),
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))
    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))

    const selectedArea = screen.getByTestId('cs-selected-area')
    expect(
      within(selectedArea).getByText('서울특별시>강남구>역삼동'),
    ).toBeInTheDocument()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(CALLBACK_ERROR_PREFIX),
      expect.stringContaining('region.onChange'),
      expect.any(Error),
    )
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(CALLBACK_ERROR_PREFIX),
      expect.stringContaining('region.onSelectedEupmyeondong'),
      expect.any(Error),
    )
  })

  it('검색 미리보기 클릭도 onChange/onSelectedEupmyeondong 계약을 동일하게 준수한다', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onSelectedEupmyeondong = vi.fn()

    render(
      <ComposableSearch
        selectorsProps={[
          createSearchableRegionSelector({
            options: {
              placeHolder: '지역 선택',
              onChange,
              onSelectedEupmyeondong,
            },
          }),
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.type(screen.getByRole('textbox', { name: '지역 검색' }), '서')
    await user.click(
      screen.getByRole('button', { name: '충청남도 > 서산시' }),
    )

    expect(onSelectedEupmyeondong).toHaveBeenCalledTimes(1)
    expect(onSelectedEupmyeondong).toHaveBeenLastCalledWith(
      expect.objectContaining({ code: '44210', displayName: '서산시 전체' }),
    )
    expect(onChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: '44210',
          displayName: '충청남도>서산시>서산시 전체',
        }),
      ]),
    )
  })
})
