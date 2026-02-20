import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createDemoRegionDataSource } from '../DemoService'
import { ComposableSearch } from './ComposableSearch'
import type { RegionSelectProps } from './types'

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

const keywordSelector = {
  type: 'keyword' as const,
  options: {
    placeHolder: '키워드 선택',
  },
}

describe('ComposableSearch', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('selector/detailed/selected 영역을 순서대로 렌더링하고 selector 순서를 보존한다', () => {
    render(
      <ComposableSearch
        selectorsProps={[createRegionSelector(), keywordSelector]}
      />,
    )

    const selectorArea = screen.getByTestId('cs-selector-area')
    const detailedArea = screen.getByTestId('cs-detailed-area')
    const selectedArea = screen.getByTestId('cs-selected-area')

    expect(
      selectorArea.compareDocumentPosition(detailedArea) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      detailedArea.compareDocumentPosition(selectedArea) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()

    const selectorButtons = within(selectorArea).getAllByRole('button')
    expect(selectorButtons[0]).toHaveTextContent('지역 선택')
    expect(selectorButtons[1]).toHaveTextContent('키워드 선택')
  })

  it('region 트리거 클릭 시 상세 패널이 open/closed 토글된다', async () => {
    const user = userEvent.setup()
    render(<ComposableSearch selectorsProps={[createRegionSelector()]} />)

    const detailArea = screen.getByTestId('cs-detailed-area')
    const regionTrigger = screen.getByRole('button', { name: '지역 선택' })

    expect(detailArea).toHaveAttribute('data-state', 'closed')
    await user.click(regionTrigger)
    expect(detailArea).toHaveAttribute('data-state', 'open')
    await user.click(regionTrigger)
    expect(detailArea).toHaveAttribute('data-state', 'closed')
  })

  it('상세 콘텐츠 주입 후 시/도 컬럼이 로딩된다', () => {
    render(<ComposableSearch selectorsProps={[createRegionSelector()]} />)

    expect(screen.getByText('서울특별시')).toBeInTheDocument()
    expect(screen.getByText('부산광역시')).toBeInTheDocument()
  })

  it('초기 렌더에서는 시/도/시군구 컬럼이 자동 current를 지정하지 않는다', async () => {
    const user = userEvent.setup()
    render(<ComposableSearch selectorsProps={[createRegionSelector()]} />)

    await user.click(screen.getByRole('button', { name: '지역 선택' }))

    const sidoColumn = screen
      .getByRole('heading', { name: '시/도' })
      .closest('section') as HTMLElement
    const sigunguColumn = screen
      .getByRole('heading', { name: '시/군/구' })
      .closest('section') as HTMLElement
    const eupmyeondongColumn = screen
      .getByRole('heading', { name: '읍/면/동' })
      .closest('section') as HTMLElement

    expect(
      within(sidoColumn).getByRole('button', { name: '서울특별시' }),
    ).not.toHaveClass('is-current')
    expect(
      within(sidoColumn).getByRole('button', { name: '부산광역시' }),
    ).not.toHaveClass('is-current')
    expect(
      within(sigunguColumn).getByText('상위 지역을 먼저 선택해 주세요.'),
    ).toBeInTheDocument()
    expect(
      within(eupmyeondongColumn).getByText('상위 지역을 먼저 선택해 주세요.'),
    ).toBeInTheDocument()
  })

  it('시/도 변경 후 시군구 목록 갱신 시에도 시군구 current는 자동 지정되지 않는다', async () => {
    const user = userEvent.setup()
    render(<ComposableSearch selectorsProps={[createRegionSelector()]} />)

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))

    const initialSigunguColumn = screen
      .getByRole('heading', { name: '시/군/구' })
      .closest('section') as HTMLElement

    expect(
      within(initialSigunguColumn).getByRole('button', { name: '강남구' }),
    ).toHaveClass('is-current')

    await user.click(screen.getByRole('button', { name: '부산광역시' }))

    const refreshedSigunguColumn = screen
      .getByRole('heading', { name: '시/군/구' })
      .closest('section') as HTMLElement
    const refreshedEupmyeondongColumn = screen
      .getByRole('heading', { name: '읍/면/동' })
      .closest('section') as HTMLElement

    expect(
      within(refreshedSigunguColumn).getByRole('button', { name: '해운대구' }),
    ).not.toHaveClass('is-current')
    expect(
      within(refreshedEupmyeondongColumn).getByText('상위 지역을 먼저 선택해 주세요.'),
    ).toBeInTheDocument()
  })

  it('keyword 트리거 클릭 시 options.onClick이 호출된다', async () => {
    const user = userEvent.setup()
    const onKeywordClick = vi.fn()

    render(
      <ComposableSearch
        selectorsProps={[
          createRegionSelector(),
          {
            ...keywordSelector,
            options: {
              ...keywordSelector.options,
              onClick: onKeywordClick,
            },
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: '키워드 선택' }))
    expect(onKeywordClick).toHaveBeenCalledTimes(1)
  })

  it('keyword 트리거 클릭 시 키워드 입력 패널이 열리고 접근성 라벨/힌트가 노출된다', async () => {
    const user = userEvent.setup()

    render(
      <ComposableSearch
        selectorsProps={[
          createRegionSelector(),
          {
            ...keywordSelector,
            options: {
              ...keywordSelector.options,
              label: '검색 키워드 입력',
              guideText: 'Enter로 키워드 확정, Backspace로 마지막 키워드 삭제',
            },
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: '키워드 선택' }))

    expect(
      screen.getByRole('textbox', { name: '검색 키워드 입력' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Enter로 키워드 확정, Backspace로 마지막 키워드 삭제'),
    ).toBeInTheDocument()
  })

  it('키워드는 Enter로 정규화 토큰을 추가하고 중복 입력은 에러로 차단된다', async () => {
    const user = userEvent.setup()

    render(<ComposableSearch selectorsProps={[createRegionSelector(), keywordSelector]} />)

    await user.click(screen.getByRole('button', { name: '키워드 선택' }))
    const input = screen.getByRole('textbox', { name: '키워드 입력' })

    await user.type(input, '  React   Query  ')
    await user.keyboard('{Enter}')
    expect(screen.getByText('키워드: react query')).toBeInTheDocument()

    await user.type(input, 'react query')
    await user.keyboard('{Enter}')
    expect(screen.getAllByText('키워드: react query')).toHaveLength(1)
    expect(screen.getByRole('alert')).toHaveTextContent('이미 추가된 키워드입니다.')
  })

  it('입력창이 비어 있으면 Backspace로 마지막 키워드가 삭제된다', async () => {
    const user = userEvent.setup()

    render(<ComposableSearch selectorsProps={[createRegionSelector(), keywordSelector]} />)

    await user.click(screen.getByRole('button', { name: '키워드 선택' }))
    const input = screen.getByRole('textbox', { name: '키워드 입력' })

    await user.type(input, 'alpha{Enter}')
    await user.type(input, 'beta{Enter}')
    expect(screen.getByText('키워드: alpha')).toBeInTheDocument()
    expect(screen.getByText('키워드: beta')).toBeInTheDocument()

    await user.click(input)
    await user.keyboard('{Backspace}')

    expect(screen.getByText('키워드: alpha')).toBeInTheDocument()
    expect(screen.queryByText('키워드: beta')).not.toBeInTheDocument()
  })

  it('키워드 최대 토큰 수/길이 제한 정책을 적용한다', async () => {
    const user = userEvent.setup()

    render(
      <ComposableSearch
        selectorsProps={[
          createRegionSelector(),
          {
            ...keywordSelector,
            options: {
              ...keywordSelector.options,
              maxTokens: 2,
              maxTokenLength: 5,
            },
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: '키워드 선택' }))
    const input = screen.getByRole('textbox', { name: '키워드 입력' })

    await user.type(input, 'alphabet')
    await user.keyboard('{Enter}')
    expect(screen.getByRole('alert')).toHaveTextContent(
      '키워드는 최대 5자까지 입력할 수 있습니다.',
    )
    expect(screen.queryByText('키워드: alphabet')).not.toBeInTheDocument()

    await user.clear(input)
    await user.type(input, 'alpha{Enter}')
    await user.type(input, 'beta{Enter}')
    await user.type(input, 'gamma{Enter}')

    expect(screen.getByText('키워드: alpha')).toBeInTheDocument()
    expect(screen.getByText('키워드: beta')).toBeInTheDocument()
    expect(screen.queryByText('키워드: gamma')).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(
      '키워드는 최대 2개까지 추가할 수 있습니다.',
    )
  })

  it('읍/면/동 체크 토글은 조건 칩을 추가/삭제하고 중복을 남기지 않는다', async () => {
    const user = userEvent.setup()
    render(<ComposableSearch selectorsProps={[createRegionSelector()]} />)

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))
    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))

    expect(
      screen.getByText('서울특별시>강남구>역삼동'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))
    expect(screen.queryByText('서울특별시>강남구>역삼동')).not.toBeInTheDocument()
  })

  it('동일 시군구에서 전체/상세 조건은 상호 배타적으로 동작한다', async () => {
    const user = userEvent.setup()
    render(<ComposableSearch selectorsProps={[createRegionSelector()]} />)

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))
    await user.click(screen.getByRole('checkbox', { name: '강남구 전체' }))

    expect(
      screen.getByText('서울특별시>강남구>강남구 전체'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))

    expect(screen.queryByText('서울특별시>강남구>강남구 전체')).not.toBeInTheDocument()
    expect(
      screen.getByText('서울특별시>강남구>역삼동'),
    ).toBeInTheDocument()
  })

  it('동일 시도에서 시도 전체와 하위 시군구 조건은 상호 배타적으로 동작한다', async () => {
    const user = userEvent.setup()
    render(<ComposableSearch selectorsProps={[createRegionSelector()]} />)

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))

    const getSigunguColumn = () =>
      screen.getByRole('heading', { name: '시/군/구' }).closest('section')
    const getEupmyeondongColumn = () =>
      screen.getByRole('heading', { name: '읍/면/동' }).closest('section')

    const sigunguColumn = getSigunguColumn()
    const eupmyeondongColumn = getEupmyeondongColumn()

    expect(sigunguColumn).not.toBeNull()
    expect(eupmyeondongColumn).not.toBeNull()

    await user.click(
      within(sigunguColumn as HTMLElement).getByRole('checkbox', {
        name: '서울특별시 전체',
      }),
    )
    expect(
      screen.getByText('서울특별시>서울특별시 전체>서울특별시 전체'),
    ).toBeInTheDocument()
    expect(
      within(eupmyeondongColumn as HTMLElement).queryByRole('checkbox', {
        name: '서울특별시 전체',
      }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '강남구' }))
    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))

    expect(
      screen.queryByText('서울특별시>서울특별시 전체>서울특별시 전체'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('서울특별시>강남구>역삼동'),
    ).toBeInTheDocument()

    await user.click(
      within(getSigunguColumn() as HTMLElement).getByRole('checkbox', {
        name: '서울특별시 전체',
      }),
    )

    expect(screen.queryByText('서울특별시>강남구>역삼동')).not.toBeInTheDocument()
    expect(
      screen.getByText('서울특별시>서울특별시 전체>서울특별시 전체'),
    ).toBeInTheDocument()
  })

  it('시도 전체를 해제하면 시군구 첫 항목이 자동 선택되지 않고 명시 선택 전까지 비선택 상태를 유지한다', async () => {
    const user = userEvent.setup()
    render(<ComposableSearch selectorsProps={[createRegionSelector()]} />)

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))

    const getSigunguColumn = () =>
      screen.getByRole('heading', { name: '시/군/구' }).closest('section')
    const getEupmyeondongColumn = () =>
      screen.getByRole('heading', { name: '읍/면/동' }).closest('section')

    await user.click(
      within(getSigunguColumn() as HTMLElement).getByRole('checkbox', {
        name: '서울특별시 전체',
      }),
    )
    expect(
      screen.getByText('서울특별시>서울특별시 전체>서울특별시 전체'),
    ).toBeInTheDocument()

    await user.click(
      within(getSigunguColumn() as HTMLElement).getByRole('checkbox', {
        name: '서울특별시 전체',
      }),
    )

    expect(
      screen.queryByText('서울특별시>서울특별시 전체>서울특별시 전체'),
    ).not.toBeInTheDocument()
    expect(
      within(getSigunguColumn() as HTMLElement).getByRole('button', {
        name: '강남구',
      }),
    ).not.toHaveClass('is-current')
    expect(
      within(getEupmyeondongColumn() as HTMLElement).getByText(
        '상위 지역을 먼저 선택해 주세요.',
      ),
    ).toBeInTheDocument()

    await user.click(
      within(getSigunguColumn() as HTMLElement).getByRole('button', {
        name: '강남구',
      }),
    )

    expect(
      within(getSigunguColumn() as HTMLElement).getByRole('button', {
        name: '강남구',
      }),
    ).toHaveClass('is-current')
    expect(
      within(getEupmyeondongColumn() as HTMLElement).getByRole('checkbox', {
        name: '역삼동',
      }),
    ).toBeInTheDocument()
  })

  it('해운대구 선선택 후 부산광역시 전체를 체크하면 하위 선택 UI와 조건이 즉시 해제된다', async () => {
    const user = userEvent.setup()
    render(<ComposableSearch selectorsProps={[createRegionSelector()]} />)

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '부산광역시' }))
    await user.click(screen.getByRole('button', { name: '해운대구' }))

    const getSigunguColumn = () =>
      screen.getByRole('heading', { name: '시/군/구' }).closest('section')
    const getEupmyeondongColumn = () =>
      screen.getByRole('heading', { name: '읍/면/동' }).closest('section')

    const sigunguColumn = getSigunguColumn()
    const eupmyeondongColumn = getEupmyeondongColumn()

    expect(sigunguColumn).not.toBeNull()
    expect(eupmyeondongColumn).not.toBeNull()

    await user.click(
      within(eupmyeondongColumn as HTMLElement).getByRole('checkbox', {
        name: '해운대구 전체',
      }),
    )
    expect(
      screen.getByText('부산광역시>해운대구>해운대구 전체'),
    ).toBeInTheDocument()

    await user.click(
      within(sigunguColumn as HTMLElement).getByRole('checkbox', {
        name: '부산광역시 전체',
      }),
    )

    expect(screen.queryByText('부산광역시>해운대구>해운대구 전체')).not.toBeInTheDocument()
    expect(
      screen.getByText('부산광역시>부산광역시 전체>부산광역시 전체'),
    ).toBeInTheDocument()
    expect(
      within(getSigunguColumn() as HTMLElement).getByRole('button', {
        name: '해운대구',
      }),
    ).not.toHaveClass('is-current')
    expect(
      within(getEupmyeondongColumn() as HTMLElement).getByText(
        '상위 지역을 먼저 선택해 주세요.',
      ),
    ).toBeInTheDocument()
  })

  it('체크박스 라벨과 일반 지역 item은 동일 타이포그래피 계약 클래스를 사용한다', async () => {
    const user = userEvent.setup()
    render(<ComposableSearch selectorsProps={[createRegionSelector()]} />)

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))

    const sigunguColumn = screen
      .getByRole('heading', { name: '시/군/구' })
      .closest('section') as HTMLElement
    const eupmyeondongColumn = screen
      .getByRole('heading', { name: '읍/면/동' })
      .closest('section') as HTMLElement

    const sigunguRegionItem = within(sigunguColumn).getByRole('button', {
      name: '강남구',
    })
    const wholeCheckboxLabel = within(sigunguColumn)
      .getByRole('checkbox', { name: '서울특별시 전체' })
      .closest('label')
    const eupmyeondongCheckboxLabel = within(eupmyeondongColumn)
      .getByRole('checkbox', { name: '역삼동' })
      .closest('label')

    expect(wholeCheckboxLabel).not.toBeNull()
    expect(eupmyeondongCheckboxLabel).not.toBeNull()
    expect(sigunguRegionItem).toHaveClass('cs-region-typography')
    expect(wholeCheckboxLabel).toHaveClass('cs-region-typography')
    expect(eupmyeondongCheckboxLabel).toHaveClass('cs-region-typography')
  })

  it('하위 읍/면/동 선택 시 상위 시/도/시/군/구에 하위 선택 색상 인디케이터를 표시하고 해제 시 원복한다', async () => {
    const user = userEvent.setup()
    render(<ComposableSearch selectorsProps={[createRegionSelector()]} />)

    const getSidoColumn = () =>
      screen.getByRole('heading', { name: '시/도' }).closest('section') as HTMLElement
    const getSigunguColumn = () =>
      screen
        .getByRole('heading', { name: '시/군/구' })
        .closest('section') as HTMLElement

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))

    expect(
      within(getSidoColumn()).getByRole('button', { name: '서울특별시' }),
    ).not.toHaveClass('has-descendant-selected')
    expect(
      within(getSigunguColumn()).getByRole('button', { name: '강남구' }),
    ).not.toHaveClass('has-descendant-selected')

    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))

    expect(
      within(getSidoColumn()).getByRole('button', { name: '서울특별시' }),
    ).toHaveClass('has-descendant-selected')
    expect(
      within(getSigunguColumn()).getByRole('button', { name: '강남구' }),
    ).toHaveClass('has-descendant-selected')
    expect(
      within(getSidoColumn()).getByRole('button', { name: '부산광역시' }),
    ).not.toHaveClass('has-descendant-selected')
    expect(
      within(getSigunguColumn()).getByRole('button', { name: '송파구' }),
    ).not.toHaveClass('has-descendant-selected')

    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))

    expect(
      within(getSidoColumn()).getByRole('button', { name: '서울특별시' }),
    ).not.toHaveClass('has-descendant-selected')
    expect(
      within(getSigunguColumn()).getByRole('button', { name: '강남구' }),
    ).not.toHaveClass('has-descendant-selected')
  })

  it('하위 전체(강남구 전체) 선택 시 상위 시/도/시/군/구 하위 선택 인디케이터를 표시하고 해제 시 원복한다', async () => {
    const user = userEvent.setup()
    render(<ComposableSearch selectorsProps={[createRegionSelector()]} />)

    const getSidoColumn = () =>
      screen.getByRole('heading', { name: '시/도' }).closest('section') as HTMLElement
    const getSigunguColumn = () =>
      screen
        .getByRole('heading', { name: '시/군/구' })
        .closest('section') as HTMLElement

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))
    await user.click(screen.getByRole('checkbox', { name: '강남구 전체' }))

    expect(
      within(getSidoColumn()).getByRole('button', { name: '서울특별시' }),
    ).toHaveClass('has-descendant-selected')
    expect(
      within(getSigunguColumn()).getByRole('button', { name: '강남구' }),
    ).toHaveClass('has-descendant-selected')

    await user.click(screen.getByRole('checkbox', { name: '강남구 전체' }))

    expect(
      within(getSidoColumn()).getByRole('button', { name: '서울특별시' }),
    ).not.toHaveClass('has-descendant-selected')
    expect(
      within(getSigunguColumn()).getByRole('button', { name: '강남구' }),
    ).not.toHaveClass('has-descendant-selected')
  })

  it('시/군/구 전체(서울특별시 전체) 선택 시 시/도에 하위 선택 인디케이터를 표시하고 해제 시 원복한다', async () => {
    const user = userEvent.setup()
    render(<ComposableSearch selectorsProps={[createRegionSelector()]} />)

    const getSidoColumn = () =>
      screen.getByRole('heading', { name: '시/도' }).closest('section') as HTMLElement
    const getSigunguColumn = () =>
      screen
        .getByRole('heading', { name: '시/군/구' })
        .closest('section') as HTMLElement

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(
      within(getSigunguColumn()).getByRole('checkbox', {
        name: '서울특별시 전체',
      }),
    )

    expect(
      within(getSidoColumn()).getByRole('button', { name: '서울특별시' }),
    ).toHaveClass('has-descendant-selected')

    await user.click(
      within(getSigunguColumn()).getByRole('checkbox', {
        name: '서울특별시 전체',
      }),
    )

    expect(
      within(getSidoColumn()).getByRole('button', { name: '서울특별시' }),
    ).not.toHaveClass('has-descendant-selected')
  })

  it('current와 has-descendant-selected는 서로 다른 클래스로 동시에 구분 가능하다', async () => {
    const user = userEvent.setup()
    render(<ComposableSearch selectorsProps={[createRegionSelector()]} />)

    const getSidoColumn = () =>
      screen.getByRole('heading', { name: '시/도' }).closest('section') as HTMLElement

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))
    await user.click(screen.getByRole('checkbox', { name: '강남구 전체' }))
    await user.click(screen.getByRole('button', { name: '부산광역시' }))

    const seoulButton = within(getSidoColumn()).getByRole('button', {
      name: '서울특별시',
    })
    const busanButton = within(getSidoColumn()).getByRole('button', {
      name: '부산광역시',
    })

    expect(seoulButton).toHaveClass('has-descendant-selected')
    expect(seoulButton).not.toHaveClass('is-current')
    expect(busanButton).toHaveClass('is-current')
    expect(busanButton).not.toHaveClass('has-descendant-selected')
  })

  it('region 옵션 콜백(onChange/onSelectedEupmyeondong/onClick)을 호출한다', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onSelectedEupmyeondong = vi.fn()
    const onClick = vi.fn()

    render(
      <ComposableSearch
        selectorsProps={[
          createRegionSelector({
            options: {
              placeHolder: '지역 선택',
              onChange,
              onSelectedEupmyeondong,
              onClick,
            },
          }),
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))
    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onSelectedEupmyeondong).toHaveBeenCalledTimes(1)
    expect(onSelectedEupmyeondong).toHaveBeenLastCalledWith(
      expect.objectContaining({ code: '1168010100' }),
    )
    expect(onChange).toHaveBeenCalled()
    expect(onChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: '1168010100' }),
      ]),
    )
  })

  it('전체 삭제 버튼은 빈 상태에서 disabled이며 클릭 시 모든 칩을 제거한다', async () => {
    const user = userEvent.setup()
    render(<ComposableSearch selectorsProps={[createRegionSelector()]} />)

    const clearAllButton = screen.getByRole('button', { name: '전체 삭제' })
    expect(clearAllButton).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))
    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))

    expect(clearAllButton).toBeEnabled()
    await user.click(clearAllButton)
    expect(screen.queryByText('서울특별시>강남구>역삼동')).not.toBeInTheDocument()
    expect(clearAllButton).toBeDisabled()
  })

  it('다수 칩 상태에서도 스크롤 viewport 내부에서 개별 삭제/전체 삭제와 onChange 계약을 유지한다', async () => {
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
            ...keywordSelector,
            options: {
              ...keywordSelector.options,
              maxTokens: 12,
            },
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: '키워드 선택' }))
    const input = screen.getByRole('textbox', { name: '키워드 입력' })
    const keywordValues = Array.from({ length: 8 }, (_, index) => `token${index + 1}`)

    for (const keywordValue of keywordValues) {
      await user.type(input, `${keywordValue}{Enter}`)
    }

    const basketSection = screen
      .getByRole('heading', { name: '선택된 조건' })
      .closest('section') as HTMLElement
    const scrollViewport = within(basketSection).getByTestId(
      'cs-selected-condition-scroll',
    )

    expect(scrollViewport).toBeInTheDocument()
    expect(
      within(scrollViewport).getAllByRole('button', { name: /키워드: token\d+ 삭제/ }),
    ).toHaveLength(8)

    await user.click(
      within(scrollViewport).getByRole('button', { name: '키워드: token4 삭제' }),
    )
    expect(screen.queryByText('키워드: token4')).not.toBeInTheDocument()
    expect(onChange).toHaveBeenLastCalledWith(
      expect.not.arrayContaining([expect.objectContaining({ id: 'keyword:token4' })]),
    )

    await user.click(screen.getByRole('button', { name: '전체 삭제' }))
    expect(
      within(scrollViewport).queryByRole('button', { name: '키워드: token1 삭제' }),
    ).not.toBeInTheDocument()
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it('상위 선택 유무와 데이터 존재 여부에 따라 빈 상태 문구를 구분해 렌더링한다', () => {
    render(
      <ComposableSearch
        selectorsProps={[
          createRegionSelector({
            findAllSidos: () => [],
            findAllSigungus: () => [],
            findAllEupmyeondongs: () => [],
          }),
        ]}
      />,
    )

    expect(
      screen.getByRole('heading', { name: '시/도' }).closest('section'),
    ).toHaveTextContent('표시할 지역이 없습니다.')
    expect(screen.getAllByText('상위 지역을 먼저 선택해 주세요.')).toHaveLength(2)
  })

  it('상위 지역을 선택했지만 하위 데이터가 비어 있으면 빈 데이터 문구를 표시한다', async () => {
    const user = userEvent.setup()
    render(
      <ComposableSearch
        selectorsProps={[
          createRegionSelector({
            findAllSigungus: () => [],
            findAllEupmyeondongs: () => [],
          }),
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))

    const sigunguColumn = screen
      .getByRole('heading', { name: '시/군/구' })
      .closest('section') as HTMLElement

    expect(within(sigunguColumn).getByText('표시할 지역이 없습니다.')).toBeInTheDocument()
  })

  it('selected 조건 목록 렌더링에서 React key 경고가 발생하지 않는다', async () => {
    const user = userEvent.setup()
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    render(<ComposableSearch selectorsProps={[createRegionSelector()]} />)

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))
    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))
    await user.click(screen.getByRole('button', { name: '송파구' }))
    await user.click(screen.getByRole('checkbox', { name: '잠실동' }))

    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Each child in a list should have a unique "key" prop'),
    )
  })

  it('large 프로파일에서도 열기/선택/해제/전체선택/초기화와 콜백 계약을 유지한다', async () => {
    const user = userEvent.setup()
    const dataSource = createDemoRegionDataSource('large')
    const onClick = vi.fn()
    const onChange = vi.fn()
    const onSelectedEupmyeondong = vi.fn()
    const [firstSido] = dataSource.findAllSidos()
    const [firstSigungu] = dataSource.findAllSigungus(firstSido.code)
    const [firstEupmyeondong] = dataSource.findAllEupmyeondongs(firstSigungu.code)

    render(
      <ComposableSearch
        selectorsProps={[
          {
            type: 'region',
            findAllSidos: dataSource.findAllSidos,
            findAllSigungus: dataSource.findAllSigungus,
            findAllEupmyeondongs: dataSource.findAllEupmyeondongs,
            options: {
              placeHolder: '지역 선택',
              onClick,
              onChange,
              onSelectedEupmyeondong,
            },
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: firstSido.displayName }))
    await user.click(screen.getByRole('button', { name: firstSigungu.displayName }))
    await user.click(
      screen.getByRole('checkbox', { name: firstEupmyeondong.displayName }),
    )

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onSelectedEupmyeondong).toHaveBeenCalledTimes(1)
    expect(onSelectedEupmyeondong).toHaveBeenLastCalledWith(
      expect.objectContaining({ code: firstEupmyeondong.code }),
    )
    expect(
      screen.getByText(
        `${firstSido.displayName}>${firstSigungu.displayName}>${firstEupmyeondong.displayName}`,
      ),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('checkbox', { name: firstEupmyeondong.displayName }),
    )
    expect(
      screen.queryByText(
        `${firstSido.displayName}>${firstSigungu.displayName}>${firstEupmyeondong.displayName}`,
      ),
    ).not.toBeInTheDocument()

    const wholeSigunguName = `${firstSigungu.displayName} 전체`
    await user.click(screen.getByRole('checkbox', { name: wholeSigunguName }))
    expect(
      screen.getByText(
        `${firstSido.displayName}>${firstSigungu.displayName}>${wholeSigunguName}`,
      ),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '전체 삭제' }))
    expect(
      screen.queryByText(
        `${firstSido.displayName}>${firstSigungu.displayName}>${wholeSigunguName}`,
      ),
    ).not.toBeInTheDocument()
    expect(onChange).toHaveBeenLastCalledWith([])
  })
})
