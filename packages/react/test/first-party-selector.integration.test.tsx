import '@testing-library/jest-dom/vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { SelectionItem } from '@compsable-search/core'
import {
  ComposableSearch,
  type ComposableSearchProps,
  type ReactHostSelectorDefinition,
  type SelectorPanelProps,
} from '../src/index'

type HostSelector = ComposableSearchProps<SelectionItem>['selectors'][number]
type MaybePromise<T> = T | Promise<T>

interface RegionRecord {
  displayName: string
  name: string
  code: string
}

interface RegionSelectorApi {
  createRegionSelector: (
    id: string,
    props: {
      findAllSidos: () => MaybePromise<RegionRecord[]>
      findAllSigungus: (sidoCode: string) => MaybePromise<RegionRecord[]>
      findAllEupmyeondongs: (sigunguCode: string) => MaybePromise<RegionRecord[]>
      options?: {
        placeholder?: string
      }
    },
  ) => HostSelector
}

interface KeywordSelectorApi {
  createKeywordSelector: (
    id: string,
    props: {
      options?: {
        placeholder?: string
        label?: string
        inputPlaceholder?: string
      }
    },
  ) => HostSelector
}

interface CustomSelectorProps {
  addButtonLabel: string
  displayName: string
  foreignSelectorId: string
  invalidButtonLabel: string
  triggerLabel: string
}

const REGION_FIXTURE = {
  sidos: [
    {
      displayName: '서울특별시',
      name: '서울특별시',
      code: '11',
    },
  ],
  sigungus: {
    '11': [
      {
        displayName: '강남구',
        name: '강남구',
        code: '11680',
      },
    ],
  },
  eupmyeondongs: {
    '11680': [
      {
        displayName: '역삼동',
        name: '역삼동',
        code: '1168010100',
      },
    ],
  },
} as const

let regionSelectorApiPromise: Promise<RegionSelectorApi> | undefined
let keywordSelectorApiPromise: Promise<KeywordSelectorApi> | undefined

async function importFirstPartySelectorApi<T>(
  sourceRelativePath: string,
  distRelativePath: string,
): Promise<T> {
  try {
    return (await import(
      new URL(sourceRelativePath, import.meta.url).href
    )) as T
  } catch {
    return (await import(
      new URL(distRelativePath, import.meta.url).href
    )) as T
  }
}

function loadRegionSelectorApi(): Promise<RegionSelectorApi> {
  regionSelectorApiPromise ??= importFirstPartySelectorApi<RegionSelectorApi>(
    '../../selector-region/src/index.ts',
    '../../selector-region/dist/index.js',
  )

  return regionSelectorApiPromise
}

function loadKeywordSelectorApi(): Promise<KeywordSelectorApi> {
  keywordSelectorApiPromise ??= importFirstPartySelectorApi<KeywordSelectorApi>(
    '../../selector-keyword/src/index.ts',
    '../../selector-keyword/dist/index.js',
  )

  return keywordSelectorApiPromise
}

function createRegionDataSource() {
  return {
    findAllSidos: () => [...REGION_FIXTURE.sidos],
    findAllSigungus: (sidoCode: string) => [
      ...(REGION_FIXTURE.sigungus[
        sidoCode as keyof typeof REGION_FIXTURE.sigungus
      ] ?? []),
    ],
    findAllEupmyeondongs: (sigunguCode: string) => [
      ...(REGION_FIXTURE.eupmyeondongs[
        sigunguCode as keyof typeof REGION_FIXTURE.eupmyeondongs
      ] ?? []),
    ],
  }
}

async function createRegionPackageSelector(
  id: string,
  placeholder = '지역 선택',
): Promise<HostSelector> {
  const { createRegionSelector } = await loadRegionSelectorApi()

  return createRegionSelector(id, {
    ...createRegionDataSource(),
    options: {
      placeholder,
    },
  })
}

async function createKeywordPackageSelector(
  id: string,
  placeholder: string,
  label: string,
): Promise<HostSelector> {
  const { createKeywordSelector } = await loadKeywordSelectorApi()

  return createKeywordSelector(id, {
    options: {
      placeholder,
      label,
    },
  })
}

function CustomOwnershipPanel({
  props,
  selectedItems,
  selectorId,
  setSelectedItems,
}: SelectorPanelProps<CustomSelectorProps, SelectionItem>) {
  return (
    <div>
      <p data-testid={`${selectorId}-selected-count`}>{selectedItems.length}</p>
      <button
        type="button"
        onClick={() =>
          setSelectedItems([
            {
              id: `${selectorId}:item`,
              displayName: props.displayName,
              selectorId,
            },
          ])
        }
      >
        {props.addButtonLabel}
      </button>
      <button
        type="button"
        onClick={() =>
          setSelectedItems([
            {
              id: `${selectorId}:foreign-item`,
              displayName: `${props.displayName} 오염`,
              selectorId: props.foreignSelectorId,
            },
          ])
        }
      >
        {props.invalidButtonLabel}
      </button>
    </div>
  )
}

function createCustomSelector(
  id: string,
  triggerLabel: string,
  displayName: string,
  foreignSelectorId: string,
): ReactHostSelectorDefinition<CustomSelectorProps, 'custom', SelectionItem> {
  return {
    id,
    type: 'custom',
    props: {
      addButtonLabel: '커스텀 추가',
      displayName,
      foreignSelectorId,
      invalidButtonLabel: '잘못된 소유권 추가',
      triggerLabel,
    },
    driver: {
      type: 'custom',
      getTriggerLabel: (props) => props.triggerLabel,
      renderPanel: (panelProps) => <CustomOwnershipPanel {...panelProps} />,
    },
  }
}

function renderComposableSearchWithSelectors(
  selectors: readonly HostSelector[],
  props: Partial<ComposableSearchProps<SelectionItem>> = {},
) {
  return render(<ComposableSearch selectors={selectors} {...props} />)
}

function getSelectedBasket(): HTMLElement {
  const basket = screen.getByText('선택된 항목').closest('section')

  if (!basket) {
    throw new Error('selected basket section not found')
  }

  return basket
}

async function selectRegionCondition(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('tab', { name: '지역 선택' }))
  await user.click(await screen.findByRole('button', { name: '서울특별시' }))
  await user.click(await screen.findByRole('button', { name: '강남구' }))
  await user.click(await screen.findByRole('checkbox', { name: '역삼동' }))
}

async function openKeywordInput(
  user: ReturnType<typeof userEvent.setup>,
  triggerLabel: string,
  inputLabel: string,
) {
  await user.click(screen.getByRole('tab', { name: triggerLabel }))

  return screen.getByRole('textbox', { name: inputLabel })
}

describe('ComposableSearch first-party selector packages', () => {
  it('keyword selector package가 generic host에서 Enter/Backspace 상호작용을 유지한다', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const selectors = [
      await createKeywordPackageSelector(
        'keyword-main',
        '키워드 선택',
        '키워드 입력',
      ),
    ]

    renderComposableSearchWithSelectors(selectors, { onValueChange })

    const input = await openKeywordInput(user, '키워드 선택', '키워드 입력')
    const basket = getSelectedBasket()

    await user.type(input, 'React{Enter}')

    expect(within(basket).getByText('키워드: react')).toBeInTheDocument()
    expect(onValueChange).toHaveBeenLastCalledWith(
      [
        expect.objectContaining({
          id: 'keyword:react',
          selectorId: 'keyword-main',
        }),
      ],
      expect.objectContaining({
        reason: 'add',
        source: 'selector',
        selectorId: 'keyword-main',
        selectorType: 'keyword',
      }),
    )

    await user.type(input, 'TypeScript{Enter}')

    expect(within(basket).getByText('키워드: typescript')).toBeInTheDocument()

    await user.click(input)
    await user.keyboard('{Backspace}')

    const latestValue = onValueChange.mock.lastCall?.[0] as SelectionItem[] | undefined

    expect(latestValue).toHaveLength(1)
    expect(within(basket).getByText('키워드: react')).toBeInTheDocument()
    expect(within(basket).queryByText('키워드: typescript')).not.toBeInTheDocument()
    expect(onValueChange).toHaveBeenLastCalledWith(
      [
        expect.objectContaining({
          id: 'keyword:react',
          selectorId: 'keyword-main',
        }),
      ],
      expect.objectContaining({
        reason: 'remove',
        source: 'selector',
        selectorId: 'keyword-main',
        selectorType: 'keyword',
      }),
    )
  })

  it('같은 selector.type의 keyword selectors도 selectorId 기준으로 공존한다', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const selectors = [
      await createKeywordPackageSelector(
        'keyword-include',
        '포함 키워드',
        '포함 키워드 입력',
      ),
      await createKeywordPackageSelector(
        'keyword-exclude',
        '제외 키워드',
        '제외 키워드 입력',
      ),
    ]

    renderComposableSearchWithSelectors(selectors, { onValueChange })

    const includeInput = await openKeywordInput(
      user,
      '포함 키워드',
      '포함 키워드 입력',
    )
    await user.type(includeInput, 'React{Enter}')

    const excludeInput = await openKeywordInput(
      user,
      '제외 키워드',
      '제외 키워드 입력',
    )
    await user.type(excludeInput, 'Legacy{Enter}')

    const basket = getSelectedBasket()
    const latestValue = onValueChange.mock.lastCall?.[0] as SelectionItem[] | undefined

    expect(latestValue).toHaveLength(2)
    expect(within(basket).getByText('키워드: react')).toBeInTheDocument()
    expect(within(basket).getByText('키워드: legacy')).toBeInTheDocument()
    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'keyword:react',
          selectorId: 'keyword-include',
        }),
        expect.objectContaining({
          id: 'keyword:legacy',
          selectorId: 'keyword-exclude',
        }),
      ]),
      expect.objectContaining({
        reason: 'add',
        source: 'selector',
        selectorId: 'keyword-exclude',
        selectorType: 'keyword',
      }),
    )

    const includeTab = screen.getByRole('tab', { name: '포함 키워드' })
    const excludeTab = screen.getByRole('tab', { name: '제외 키워드' })

    expect(within(includeTab).getByText('1')).toBeInTheDocument()
    expect(within(excludeTab).getByText('1')).toBeInTheDocument()

    await user.click(includeTab)

    const includePanel = screen.getByRole('region', { name: '포함 키워드' })

    expect(
      within(includePanel).getByRole('button', { name: '키워드: react' }),
    ).toBeInTheDocument()
    expect(
      within(includePanel).queryByRole('button', { name: '키워드: legacy' }),
    ).not.toBeInTheDocument()

    await user.click(excludeTab)

    const excludePanel = screen.getByRole('region', { name: '제외 키워드' })

    expect(
      within(excludePanel).getByRole('button', { name: '키워드: legacy' }),
    ).toBeInTheDocument()
    expect(
      within(excludePanel).queryByRole('button', { name: '키워드: react' }),
    ).not.toBeInTheDocument()
  })

  it('region + keyword + custom 조합에서도 value merge와 selector ownership 분리가 유지된다', async () => {
    const user = userEvent.setup()
    const onSelectorError = vi.fn()
    const onValueChange = vi.fn()
    const selectors = [
      await createRegionPackageSelector('region-main'),
      await createKeywordPackageSelector(
        'keyword-main',
        '키워드 선택',
        '키워드 입력',
      ),
      createCustomSelector(
        'custom-main',
        '커스텀 선택',
        '커스텀 조건',
        'keyword-main',
      ),
    ]

    renderComposableSearchWithSelectors(selectors, {
      onSelectorError,
      onValueChange,
    })

    await selectRegionCondition(user)

    expect(onValueChange).toHaveBeenLastCalledWith(
      [
        expect.objectContaining({
          id: '1168010100',
          selectorId: 'region-main',
        }),
      ],
      expect.objectContaining({
        reason: 'add',
        source: 'selector',
        selectorId: 'region-main',
        selectorType: 'region',
      }),
    )

    const keywordInput = await openKeywordInput(user, '키워드 선택', '키워드 입력')
    await user.type(keywordInput, 'React{Enter}')

    const valueChangeCountBeforeOwnershipViolation = onValueChange.mock.calls.length
    const basket = getSelectedBasket()

    await user.click(screen.getByRole('tab', { name: '커스텀 선택' }))

    expect(screen.getByTestId('custom-main-selected-count')).toHaveTextContent('0')

    await user.click(screen.getByRole('button', { name: '잘못된 소유권 추가' }))

    expect(onSelectorError).toHaveBeenCalledWith(
      expect.objectContaining({
        selectorId: 'custom-main',
        selectorType: 'custom',
        error: expect.any(Error),
      }),
    )
    expect(onValueChange).toHaveBeenCalledTimes(
      valueChangeCountBeforeOwnershipViolation,
    )
    expect(screen.getByTestId('custom-main-selected-count')).toHaveTextContent('0')
    expect(within(basket).getByText('서울특별시>강남구>역삼동')).toBeInTheDocument()
    expect(within(basket).getByText('키워드: react')).toBeInTheDocument()
    expect(within(basket).queryByText('커스텀 조건')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '커스텀 추가' }))

    const latestValue = onValueChange.mock.lastCall?.[0] as SelectionItem[] | undefined

    expect(latestValue).toHaveLength(3)
    expect(screen.getByTestId('custom-main-selected-count')).toHaveTextContent('1')
    expect(within(basket).getByText('커스텀 조건')).toBeInTheDocument()
    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: '1168010100',
          selectorId: 'region-main',
        }),
        expect.objectContaining({
          id: 'keyword:react',
          selectorId: 'keyword-main',
        }),
        expect.objectContaining({
          id: 'custom-main:item',
          selectorId: 'custom-main',
        }),
      ]),
      expect.objectContaining({
        reason: 'add',
        source: 'selector',
        selectorId: 'custom-main',
        selectorType: 'custom',
      }),
    )
  })
})
