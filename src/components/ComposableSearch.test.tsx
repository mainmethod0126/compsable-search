import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComposableSearch } from './ComposableSearch'
import { createKeywordSelector, createRegionSelector } from './selectors'
import type { RegionSelectProps, SelectorInstance, ValueChangeMeta } from './types'

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

function createRegionProps(overrides: Partial<RegionSelectProps> = {}): RegionSelectProps {
  const base: RegionSelectProps = {
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
    options: {
      placeholder: '지역 선택',
    },
  }

  return {
    ...base,
    ...overrides,
    options: {
      ...base.options,
      ...overrides.options,
    },
  }
}

function createRegionSelectorInstance(
  id = 'region-main',
  overrides: Partial<RegionSelectProps> = {},
): SelectorInstance<'region'> {
  return createRegionSelector(id, createRegionProps(overrides))
}

function createKeywordSelectorInstance(id = 'keyword-main'): SelectorInstance<'keyword'> {
  return createKeywordSelector(id, {
    options: {
      placeholder: '키워드 선택',
      label: '키워드 입력',
    },
  })
}

function createRuntimeRegionSelectorInstance(
  id = 'region-main',
  overrides: Partial<RegionSelectProps> = {},
): SelectorInstance<'region'> {
  const selector = createRegionSelectorInstance(id, overrides)
  return {
    ...selector,
    props: {
      ...(selector.props as Record<string, unknown>),
      type: 'region',
    } as unknown as SelectorInstance<'region'>['props'],
  }
}

function createRuntimeKeywordSelectorInstance(
  id = 'keyword-main',
): SelectorInstance<'keyword'> {
  const selector = createKeywordSelectorInstance(id)
  return {
    ...selector,
    props: {
      ...(selector.props as Record<string, unknown>),
      type: 'keyword',
    } as unknown as SelectorInstance<'keyword'>['props'],
  }
}

describe('ComposableSearch V2 contract', () => {
  it('selector/detailed/selected 영역을 순서대로 렌더링하고 selectors 순서를 보존한다', () => {
    render(
      <ComposableSearch
        selectors={[
          createRuntimeRegionSelectorInstance(),
          createRuntimeKeywordSelectorInstance(),
        ]}
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

  it('factory selector(createRegionSelector)만으로도 region 패널을 열 수 있어야 한다', async () => {
    const user = userEvent.setup()

    render(<ComposableSearch selectors={[createRegionSelectorInstance('region-main')]} />)

    await user.click(screen.getByRole('button', { name: '지역 선택' }))

    expect(screen.getByRole('button', { name: '서울특별시' })).toBeInTheDocument()
  })

  it('onValueChange는 add/remove/clear에서 ValueChangeMeta(reason/source)를 전달한다', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <ComposableSearch
        selectors={[
          createRuntimeRegionSelectorInstance('region-main'),
          createRuntimeKeywordSelectorInstance('keyword-main'),
        ]}
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))
    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))

    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: '1168010100',
          displayName: '서울특별시>강남구>역삼동',
          selectorType: 'region',
        }),
      ]),
      expect.objectContaining({
        reason: 'add',
        source: 'selector',
        selectorType: 'region',
        selectorId: 'region-main',
      } satisfies Partial<ValueChangeMeta>),
    )

    await user.click(screen.getByRole('button', { name: '키워드 선택' }))
    await user.type(screen.getByRole('textbox', { name: '키워드 입력' }), 'React{Enter}')
    await user.click(
      screen.getByRole('button', { name: '서울특별시>강남구>역삼동 삭제' }),
    )

    expect(onValueChange).toHaveBeenLastCalledWith(
      [expect.objectContaining({ id: 'keyword:react', selectorType: 'keyword' })],
      expect.objectContaining({
        reason: 'remove',
        source: 'external',
        selectorType: 'region',
        selectorId: 'region-main',
      } satisfies Partial<ValueChangeMeta>),
    )

    const selectedArea = screen.getByTestId('cs-selected-area')
    await user.click(within(selectedArea).getByRole('button', { name: '전체 삭제' }))

    expect(onValueChange).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({
        reason: 'clear',
        source: 'external',
        selectorType: 'region',
        selectorId: 'region-main',
      } satisfies Partial<ValueChangeMeta>),
    )
  })

  it('region + keyword 동시 사용 시 onValueChange payload는 두 selector 값을 함께 유지한다', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <ComposableSearch
        selectors={[
          createRuntimeRegionSelectorInstance('region-main'),
          createRuntimeKeywordSelectorInstance('keyword-main'),
        ]}
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))
    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))

    await user.click(screen.getByRole('button', { name: '키워드 선택' }))
    await user.type(screen.getByRole('textbox', { name: '키워드 입력' }), 'React{Enter}')

    expect(onValueChange).toHaveBeenLastCalledWith(
      [
        expect.objectContaining({
          id: '1168010100',
          selectorType: 'region',
        }),
        expect.objectContaining({
          id: 'keyword:react',
          selectorType: 'keyword',
          keyword: 'react',
          normalizedKeyword: 'react',
        }),
      ],
      expect.objectContaining({
        reason: 'add',
        source: 'selector',
        selectorType: 'keyword',
        selectorId: 'keyword-main',
      } satisfies Partial<ValueChangeMeta>),
    )
  })
})
