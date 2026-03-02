import { describe, expect, it } from 'vitest'
import type {
  ComposableSearchProps,
  ComposableSearchValue,
  KeywordSelectOptions,
  MaybePromise,
  PanelOpenChangeEvent,
  RegionDataSource,
  RegionSelectOptions,
  RegionSelectProps,
  SelectionChangeEvent,
  SelectionItem,
  SelectorDefinition,
  SelectorDriver,
  SelectorErrorEvent,
  SelectorLoadContext,
  SelectorPanelProps,
  SelectorPlugin,
  SelectorPluginRegistry,
  ValueChangeMeta,
} from './types'

const regionDataSource: RegionDataSource = {
  findAllSidos: () => [{ displayName: '서울특별시', name: '서울특별시', code: '11' }],
  findAllSigungus: () => [{ displayName: '강남구', name: '강남구', code: '11680' }],
  findAllEupmyeondongs: () => [
    { displayName: '역삼동', name: '역삼동', code: '1168010100' },
  ],
}

const regionDriver: SelectorDriver<RegionSelectProps, 'region'> = {
  type: 'region',
  getTriggerLabel: (props) => props.options?.placeholder ?? '지역 선택',
  loadItems: async (context, props) => {
    if (context.signal.aborted) {
      return []
    }

    const sido = await props.findAllSidos(context)
    return sido.map((item) => ({
      id: item.code,
      displayName: item.displayName,
      selectorId: 'region-selector',
      selectorType: 'region',
      payload: item,
    }))
  },
  renderPanel: () => null,
}

const regionSelector: SelectorDefinition<RegionSelectProps, 'region'> = {
  id: 'region-selector',
  type: 'region',
  props: {
    ...regionDataSource,
    options: {
      placeholder: '지역 선택',
    },
  },
  driver: regionDriver,
}

describe('public type contract', () => {
  it('MaybePromise는 sync/async 반환을 모두 수용한다', async () => {
    const syncValue: MaybePromise<number> = 1
    const asyncValue: MaybePromise<number> = Promise.resolve(2)

    expect(syncValue).toBe(1)
    await expect(asyncValue).resolves.toBe(2)
  })

  it('SelectionItem/ValueChangeMeta는 V2 reason/source 계약을 제공한다', () => {
    const selection: SelectionItem = {
      id: 'keyword:react',
      displayName: '키워드: react',
      selectorId: 'keyword-selector',
      selectorType: 'keyword',
      payload: {
        keyword: 'react',
      },
    }

    const meta: ValueChangeMeta = {
      reason: 'add',
      source: 'selector',
      selectorId: 'keyword-selector',
      selectorType: 'keyword',
    }

    const allowedReasons: ValueChangeMeta['reason'][] = [
      'add',
      'remove',
      'replace',
      'clear',
    ]
    const allowedSources: ValueChangeMeta['source'][] = ['selector', 'external']

    expect(selection.selectorType).toBe('keyword')
    expect(meta.reason).toBe('add')
    expect(allowedReasons).toHaveLength(4)
    expect(allowedSources).toEqual(['selector', 'external'])
  })

  it('RegionDataSource는 SelectorLoadContext 기반 MaybePromise 데이터 소스를 수용한다', async () => {
    const controller = new AbortController()
    const context: SelectorLoadContext = {
      signal: controller.signal,
    }

    const sido = await regionDataSource.findAllSidos(context)
    const sigungu = await regionDataSource.findAllSigungus('11', context)
    const eupmyeondong = await regionDataSource.findAllEupmyeondongs('11680', context)

    expect(sido[0]?.code).toBe('11')
    expect(sigungu[0]?.code).toBe('11680')
    expect(eupmyeondong[0]?.code).toBe('1168010100')
  })

  it('SelectorPanelProps는 선택값 변경/패널 제어/에러 전파 핸들러를 노출한다', () => {
    let closed = false
    let emittedError: unknown
    let latestSelection: SelectionItem[] = []

    const panelProps: SelectorPanelProps<RegionSelectProps> = {
      selectorId: 'region-selector',
      selectorType: 'region',
      props: regionSelector.props,
      selectedItems: [],
      setSelectedItems: (next) => {
        latestSelection = next
      },
      closePanel: () => {
        closed = true
      },
      emitError: (error) => {
        emittedError = error
      },
    }

    panelProps.setSelectedItems([
      {
        id: '11',
        displayName: '서울특별시',
        selectorId: 'region-selector',
        selectorType: 'region',
      },
    ])
    panelProps.closePanel()
    panelProps.emitError(new Error('panel-error'))

    expect(latestSelection).toHaveLength(1)
    expect(closed).toBe(true)
    expect(emittedError).toBeInstanceOf(Error)
  })

  it('SelectorDriver/SelectorDefinition은 Generic Selector V2 계약을 따른다', async () => {
    const controller = new AbortController()
    const loaded = await regionDriver.loadItems?.(
      { signal: controller.signal },
      regionSelector.props,
    )

    expect(regionDriver.type).toBe('region')
    expect(regionDriver.getTriggerLabel(regionSelector.props)).toBe('지역 선택')
    expect(loaded).toHaveLength(1)
    expect(regionSelector.id).toBe('region-selector')
  })

  it('SelectorPlugin은 selection/panel/error 이벤트 확장 계약을 제공한다', () => {
    const regionPlugin: SelectorPlugin = {
      id: 'region-telemetry',
      version: 'v2',
      onSelectionChange: (event: SelectionChangeEvent) => {
        expect(event.meta.reason).toBe('replace')
      },
      onPanelOpenChange: (event: PanelOpenChangeEvent) => {
        expect(event.isOpen).toBe(true)
      },
      onError: (event: SelectorErrorEvent) => {
        expect(event.selectorType).toBe('region')
      },
    }
    const plugins: SelectorPluginRegistry = {
      regionTelemetry: regionPlugin,
    }

    plugins.regionTelemetry.onSelectionChange?.({
      nextValue: [],
      meta: {
        reason: 'replace',
        source: 'external',
      },
    })
    plugins.regionTelemetry.onPanelOpenChange?.({
      selectorId: 'region-selector',
      selectorType: 'region',
      isOpen: true,
    })
    plugins.regionTelemetry.onError?.({
      selectorId: 'region-selector',
      selectorType: 'region',
      error: new Error('plugin-error'),
    })

    expect(Object.keys(plugins)).toEqual(['regionTelemetry'])
  })

  it('ComposableSearchProps는 selectors 기반 단일 공개 계약만 유지한다', () => {
    const value: ComposableSearchValue = []

    const onValueChange: NonNullable<ComposableSearchProps['onValueChange']> = (
      nextValue,
      meta,
    ) => {
      expect(nextValue).toBe(value)
      expect(meta.source).toBe('selector')
    }

    const props: ComposableSearchProps = {
      selectors: [regionSelector],
      value,
      defaultValue: [],
      onValueChange,
      plugins: {
        regionTelemetry: {
          id: 'region-telemetry',
        },
      },
    }

    const meta: ValueChangeMeta = {
      reason: 'replace',
      source: 'selector',
      selectorId: 'region-selector',
      selectorType: 'region',
    }

    expect(props.selectors).toHaveLength(1)
    expect('selectorsProps' in props).toBe(false)
    expect('onChange' in props).toBe(false)
    props.onValueChange?.(value, meta)
  })

  it('RegionSelectOptions/KeywordSelectOptions는 built-in driver 공용 옵션 계약을 유지한다', () => {
    const regionOptions: RegionSelectOptions = {
      placeholder: '지역 선택',
      searchInputPlaceholder: '지역명 입력',
    }
    const keywordOptions: KeywordSelectOptions = {
      placeholder: '키워드 선택',
      maxTokens: 5,
      maxTokenLength: 20,
    }

    expect(regionOptions.placeholder).toBe('지역 선택')
    expect(keywordOptions.maxTokens).toBe(5)
  })
})
