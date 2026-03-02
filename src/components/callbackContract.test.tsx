import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComposableSearch } from './ComposableSearch'
import {
  CALLBACK_ERROR_PREFIX,
  dispatchPluginOnError,
  dispatchPluginOnPanelOpenChange,
  dispatchPluginOnSelectionChange,
} from './callbackPipeline'
import { createKeywordSelector, createRegionSelector } from './selectors'
import type { AnySelectorPlugin } from './plugins'
import type {
  RegionSelectProps,
  SearchSelectionItem,
  SelectorInstance,
  ValueChangeMeta,
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
): SelectorInstance<'region'> {
  const selector = createRegionSelectorInstance(id)
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

describe('callback contract (V2)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
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
      expect.arrayContaining([expect.objectContaining({ id: '1168010100' })]),
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

  it('plugin V2 이벤트(onSelectionChange/onPanelOpenChange)는 안전 디스패치되고 오류는 onError로 격리된다', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const onSelectionChange = vi.fn(() => {
      throw new Error('plugin onSelectionChange failed')
    })
    const onPanelOpenChange = vi.fn()
    const onError = vi.fn()
    const selectorInstance = createRuntimeRegionSelectorInstance('region-v2')
    const plugin: AnySelectorPlugin = {
      id: 'region-plugin-v2',
      type: 'region',
      onSelectionChange,
      onPanelOpenChange,
      onError,
    }
    const nextValue: SearchSelectionItem[] = [
      {
        id: '1168010100',
        displayName: '서울특별시>강남구>역삼동',
        selectorId: 'region-v2',
        selectorType: 'region',
      },
    ]
    const meta: ValueChangeMeta = {
      reason: 'add',
      source: 'selector',
      selectorType: 'region',
      selectorId: selectorInstance.id,
    }

    dispatchPluginOnSelectionChange(plugin, selectorInstance, nextValue, meta)
    dispatchPluginOnPanelOpenChange(plugin, selectorInstance, 'region', true)

    expect(onSelectionChange).toHaveBeenCalledTimes(1)
    expect(onSelectionChange).toHaveBeenLastCalledWith({ nextValue, meta })
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenLastCalledWith(
      expect.objectContaining({
        pluginId: 'region-plugin-v2',
        selectorId: selectorInstance.id,
        sourceHookName: 'onSelectionChange',
        error: expect.any(Error),
      }),
    )
    expect(onPanelOpenChange).toHaveBeenCalledTimes(1)
    expect(onPanelOpenChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        panelType: 'region',
        selectorId: selectorInstance.id,
        selectorType: 'region',
        isOpen: true,
      }),
    )
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(CALLBACK_ERROR_PREFIX),
      expect.stringContaining('plugin.onSelectionChange'),
      expect.any(Error),
    )
  })

  it('plugin onError 자체 예외도 격리되어 전파되지 않는다', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const onError = vi.fn(() => {
      throw new Error('plugin onError failed')
    })
    const selectorInstance = createRuntimeRegionSelectorInstance('region-v2-error')
    const plugin: AnySelectorPlugin = {
      id: 'region-plugin-v2-error',
      type: 'region',
      onError,
    }

    dispatchPluginOnError(plugin, selectorInstance, 'onSelectionChange', 'selection failed')

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sourceHookName: 'onSelectionChange',
        error: expect.any(Error),
      }),
    )
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(CALLBACK_ERROR_PREFIX),
      expect.stringContaining('plugin.onError'),
      expect.any(Error),
    )
  })

  it('ComposableSearch 런타임에서 plugin onSelectionChange/onPanelOpenChange가 호출된다', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    const onPanelOpenChange = vi.fn()
    const onError = vi.fn()

    render(
      <ComposableSearch
        selectors={[createRuntimeRegionSelectorInstance('region-main')]}
        plugins={{
          regionPlugin: {
            id: 'region-plugin-runtime',
            type: 'region',
            onSelectionChange,
            onPanelOpenChange,
            onError,
          },
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))
    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))

    expect(onPanelOpenChange).toHaveBeenCalledWith(
      expect.objectContaining({ panelType: 'region', isOpen: true }),
    )
    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({ reason: 'add', source: 'selector' }),
      }),
    )
    expect(onError).not.toHaveBeenCalled()
  })

  it('region + keyword 조합 상태를 onValueChange payload에 함께 전달한다', async () => {
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
        expect.objectContaining({ id: '1168010100', selectorType: 'region' }),
        expect.objectContaining({ id: 'keyword:react', selectorType: 'keyword' }),
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
