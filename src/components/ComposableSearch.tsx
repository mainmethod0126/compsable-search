import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  dispatchComposableOnValueChange,
  dispatchKeywordOnClick,
  dispatchPluginOnDispose,
  dispatchPluginOnError,
  dispatchPluginOnInit,
  dispatchPluginOnPanelOpenChange,
  dispatchPluginOnSelectionChange,
  dispatchRegionOnClick,
  dispatchRegionOnSelectedEupmyeondong,
} from './callbackPipeline'
import { createSelectorPluginBindingKey } from './plugins'
import type { AnySelectorPlugin } from './plugins'
import { RegionSearchInput } from './RegionSearchInput'
import { assertComposableSearchConfiguration } from './configurationValidation'
import {
  buildRegionSearchIndex,
  DEFAULT_REGION_SEARCH_RESULT_LIMIT,
  filterRegionSearchResults,
  mapRegionSearchResultToCondition,
  type RegionSearchResult,
} from './regionSearchModel'
import { SelectedConditionBasket } from './SelectedConditionBasket'
import { toggleRegionCondition } from './selectionPolicy'
import type {
  ComposableSearchProps,
  KeywordSelectorProps,
  RegionDataSource,
  RegionSelectProps,
  SearchSelectionItem,
  SelectionItem,
  SelectedKeywordCondition,
  SelectedRegionCondition,
  SelectorInstance,
  SelectorType,
  ValueChangeMeta,
} from './types'
import {
  resolveHybridValueUpdate,
  resolveInitialSelectionState,
} from './valueStateCore'
import './ComposableSearch.css'

const DETAILED_CONDITION_PLACEHOLDER = '상세 조건을 선택해 주세요.'
const REGION_SEARCH_LABEL = '지역 검색'
const REGION_SEARCH_PLACEHOLDER = '지역명 입력'
const DEFAULT_REGION_SEARCH_LOADING_MESSAGE = '지역 데이터를 불러오는 중입니다.'
const DEFAULT_REGION_SEARCH_ERROR_MESSAGE =
  '지역 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'

type InitializedPluginBinding = {
  bindingKey: string
  plugin: AnySelectorPlugin
  selectorInstance: SelectorInstance
}

type OpenPanelType = SelectorType | 'none'

type ApplySelectionChangeOptions = {
  proposedValue: SearchSelectionItem[]
  source: ValueChangeMeta['source']
  selector?: SelectorInstance
  reason?: ValueChangeMeta['reason']
}

type RegionSearchIndexLoadStatus = 'idle' | 'loading' | 'ready' | 'error'

type RegionSearchIndexState = {
  status: RegionSearchIndexLoadStatus
  index: RegionSearchResult[]
}

function resolveClassName(className?: string): string {
  return ['cs-composable-search', className].filter(Boolean).join(' ')
}

function resolveRegionSearchErrorMessage(
  options: RegionSelectProps['options'] | undefined,
): string {
  const configuredMessage = options?.searchErrorMessage

  return typeof configuredMessage === 'string' && configuredMessage.trim().length > 0
    ? configuredMessage
    : DEFAULT_REGION_SEARCH_ERROR_MESSAGE
}

function isSelectedKeywordCondition(
  condition: SearchSelectionItem,
): condition is SelectedKeywordCondition {
  return 'normalizedKeyword' in condition
}

function resolveSelectionItemSelectorId(
  item: SearchSelectionItem,
): string | undefined {
  const selectorId = (item as Partial<SearchSelectionItem>).selectorId
  return typeof selectorId === 'string' && selectorId.length > 0
    ? selectorId
    : undefined
}

function resolveSelectionItemSelectorType(
  item: SearchSelectionItem,
): SelectorType | undefined {
  const selectorType = (item as Partial<SearchSelectionItem>).selectorType
  return typeof selectorType === 'string' && selectorType.length > 0
    ? selectorType
    : undefined
}

function isSelectionItemOwnedBySelector(
  item: SearchSelectionItem,
  selector: SelectorInstance,
): boolean {
  const itemSelectorId = resolveSelectionItemSelectorId(item)
  if (itemSelectorId) {
    return itemSelectorId === selector.id
  }

  const itemSelectorType = resolveSelectionItemSelectorType(item)
  if (itemSelectorType) {
    return itemSelectorType === selector.type
  }

  if (selector.type === 'keyword') {
    return isSelectedKeywordCondition(item)
  }

  if (selector.type === 'region') {
    return !isSelectedKeywordCondition(item)
  }

  return false
}

function selectItemsBySelector(
  selectedItems: SearchSelectionItem[],
  selector: SelectorInstance,
): SearchSelectionItem[] {
  return selectedItems.filter((item) => isSelectionItemOwnedBySelector(item, selector))
}

function normalizeSelectorSelectionItems(
  selectedItems: SearchSelectionItem[],
  selector: SelectorInstance,
): SearchSelectionItem[] {
  return selectedItems.map((item) => ({
    ...item,
    selectorId: resolveSelectionItemSelectorId(item) ?? selector.id,
    selectorType: resolveSelectionItemSelectorType(item) ?? selector.type,
  }))
}

function replaceSelectorSelectionItems(
  selectedItems: SearchSelectionItem[],
  selector: SelectorInstance,
  nextSelectorItems: SearchSelectionItem[],
): SearchSelectionItem[] {
  const retainedItems = selectedItems.filter(
    (item) => !isSelectionItemOwnedBySelector(item, selector),
  )

  return [
    ...retainedItems,
    ...normalizeSelectorSelectionItems(nextSelectorItems, selector),
  ]
}

function resolveSelectorForSelectionItem(
  item: SearchSelectionItem,
  selectors: SelectorInstance[],
): SelectorInstance | undefined {
  return selectors.find((selector) => isSelectionItemOwnedBySelector(item, selector))
}

function resolveSelectorSelectionChangeReason(
  previousSelectorItems: SearchSelectionItem[],
  nextSelectorItems: SearchSelectionItem[],
): ValueChangeMeta['reason'] {
  if (nextSelectorItems.length > previousSelectorItems.length) {
    return 'add'
  }

  if (nextSelectorItems.length < previousSelectorItems.length) {
    return 'remove'
  }

  return 'replace'
}

function resolveFirstSelectorByType(
  selectors: SelectorInstance[],
): Map<SelectorType, SelectorInstance> {
  return selectors.reduce<Map<SelectorType, SelectorInstance>>((map, selector) => {
    if (!map.has(selector.type)) {
      map.set(selector.type, selector)
    }

    return map
  }, new Map())
}

function isRegionSelectorInstance(
  selector: SelectorInstance | null,
): selector is SelectorInstance<'region', RegionSelectProps, SelectionItem> {
  return selector?.type === 'region'
}

function resolveSelectorTriggerIcon(selectorType: SelectorType): string {
  if (selectorType === 'region') {
    return 'R'
  }

  if (selectorType === 'keyword') {
    return 'K'
  }

  const normalizedType = selectorType.trim()
  if (!normalizedType) {
    return '?'
  }

  return normalizedType.slice(0, 1).toUpperCase()
}

const regionSearchIndexCache = new WeakMap<
  RegionDataSource['findAllSidos'],
  WeakMap<
    RegionDataSource['findAllSigungus'],
    WeakMap<RegionDataSource['findAllEupmyeondongs'], Promise<RegionSearchResult[]>>
  >
>()

function resolveRegionSearchIndexWithCache(
  regionDataSource: Pick<
    RegionDataSource,
    'findAllSidos' | 'findAllSigungus' | 'findAllEupmyeondongs'
  >,
): Promise<RegionSearchResult[]> {
  const { findAllSidos, findAllSigungus, findAllEupmyeondongs } = regionDataSource
  let sigunguCacheBySido = regionSearchIndexCache.get(findAllSidos)
  if (!sigunguCacheBySido) {
    sigunguCacheBySido = new WeakMap()
    regionSearchIndexCache.set(findAllSidos, sigunguCacheBySido)
  }

  let eupmyeondongCacheBySigungu = sigunguCacheBySido.get(findAllSigungus)
  if (!eupmyeondongCacheBySigungu) {
    eupmyeondongCacheBySigungu = new WeakMap()
    sigunguCacheBySido.set(findAllSigungus, eupmyeondongCacheBySigungu)
  }

  const cachedIndex = eupmyeondongCacheBySigungu.get(findAllEupmyeondongs)
  if (cachedIndex) {
    return cachedIndex
  }

  const nextIndexPromise = Promise.resolve(
    buildRegionSearchIndex({
      findAllSidos,
      findAllSigungus,
      findAllEupmyeondongs,
    }),
  ).catch((error) => {
    if (eupmyeondongCacheBySigungu.get(findAllEupmyeondongs) === nextIndexPromise) {
      eupmyeondongCacheBySigungu.delete(findAllEupmyeondongs)
    }

    throw error
  })
  eupmyeondongCacheBySigungu.set(findAllEupmyeondongs, nextIndexPromise)
  return nextIndexPromise
}

export function ComposableSearch(props: ComposableSearchProps) {
  const {
    selectors: receivedSelectors,
    plugins,
    value,
    defaultValue,
    onValueChange,
    className,
    style,
  } = props

  assertComposableSearchConfiguration({
    selectors: receivedSelectors,
    plugins,
  })

  const detailedPanelId = useId()
  const [activeSelectorId, setActiveSelectorId] = useState<string | null>(null)
  const [regionSearchQuery, setRegionSearchQuery] = useState('')
  const [regionSearchIndexState, setRegionSearchIndexState] =
    useState<RegionSearchIndexState>({
      status: 'idle',
      index: [],
    })
  const [uncontrolledSelectedItems, setUncontrolledSelectedItems] = useState(() =>
    resolveInitialSelectionState({ value, defaultValue }).selectedItems,
  )

  const selectedItems = useMemo(
    () => (value !== undefined ? value : uncontrolledSelectedItems),
    [uncontrolledSelectedItems, value],
  )
  const uncontrolledSelectedItemsRef = useRef(uncontrolledSelectedItems)
  const initializedPluginBindingsRef = useRef<Map<string, InitializedPluginBinding>>(
    new Map(),
  )
  const previousPanelStateRef = useRef<{
    panelType: OpenPanelType
    isOpen: boolean
  } | null>(null)
  const regionSearchIndexRequestSequenceRef = useRef(0)
  const selectors = receivedSelectors

  const activeSelector = useMemo(
    () =>
      activeSelectorId
        ? selectors.find((selector) => selector.id === activeSelectorId) ?? null
        : null,
    [activeSelectorId, selectors],
  )
  const openedRegionSelector = useMemo(
    () => (isRegionSelectorInstance(activeSelector) ? activeSelector : null),
    [activeSelector],
  )
  const selectedRegionConditions = useMemo(
    () =>
      openedRegionSelector
        ? selectItemsBySelector(selectedItems, openedRegionSelector).filter(
            (item): item is SelectedRegionCondition => !isSelectedKeywordCondition(item),
          )
        : [],
    [openedRegionSelector, selectedItems],
  )
  const firstSelectorByType = useMemo(
    () => resolveFirstSelectorByType(selectors),
    [selectors],
  )
  const runtimePlugins = useMemo(() => Object.values(plugins ?? {}), [plugins])
  const normalizedRuntimePlugins = useMemo(() => {
    const seenBindingKey = new Set<string>()
    const deduplicatedPlugins: Array<{ bindingKey: string; plugin: AnySelectorPlugin }> =
      []

    runtimePlugins.forEach((plugin) => {
      const bindingKey = createSelectorPluginBindingKey({
        id: plugin.id,
        version: plugin.version,
      })
      if (seenBindingKey.has(bindingKey)) {
        return
      }

      seenBindingKey.add(bindingKey)
      deduplicatedPlugins.push({ bindingKey, plugin })
    })

    return deduplicatedPlugins
  }, [runtimePlugins])

  useEffect(() => {
    regionSearchIndexRequestSequenceRef.current += 1
    const requestSequence = regionSearchIndexRequestSequenceRef.current
    const abortController = new AbortController()

    if (!openedRegionSelector) {
      setRegionSearchIndexState((previousState) => {
        if (previousState.status === 'idle' && previousState.index.length === 0) {
          return previousState
        }

        return {
          status: 'idle',
          index: [],
        }
      })

      return () => {
        abortController.abort()
      }
    }

    setRegionSearchIndexState({
      status: 'loading',
      index: [],
    })

    resolveRegionSearchIndexWithCache(openedRegionSelector.props)
      .then((nextIndex) => {
        if (
          abortController.signal.aborted ||
          regionSearchIndexRequestSequenceRef.current !== requestSequence
        ) {
          return
        }

        setRegionSearchIndexState({
          status: 'ready',
          index: nextIndex,
        })
      })
      .catch(() => {
        if (
          abortController.signal.aborted ||
          regionSearchIndexRequestSequenceRef.current !== requestSequence
        ) {
          return
        }

        setRegionSearchIndexState({
          status: 'error',
          index: [],
        })
      })

    return () => {
      abortController.abort()
    }
  }, [openedRegionSelector])

  const regionSearchResults = useMemo(
    () =>
      filterRegionSearchResults(regionSearchIndexState.index, regionSearchQuery, {
        limit:
          openedRegionSelector?.props.options?.searchResultLimit ??
          DEFAULT_REGION_SEARCH_RESULT_LIMIT,
      }),
    [
      openedRegionSelector?.props.options?.searchResultLimit,
      regionSearchIndexState.index,
      regionSearchQuery,
    ],
  )

  useEffect(() => {
    uncontrolledSelectedItemsRef.current = uncontrolledSelectedItems
  }, [uncontrolledSelectedItems])

  useEffect(() => {
    if (!activeSelectorId) {
      return
    }

    if (activeSelector) {
      return
    }

    setActiveSelectorId(null)
  }, [activeSelector, activeSelectorId])

  useEffect(() => {
    setRegionSearchQuery('')
  }, [activeSelectorId])

  useEffect(() => {
    const previousBindings = initializedPluginBindingsRef.current
    const nextBindings = new Map<string, InitializedPluginBinding>()

    normalizedRuntimePlugins.forEach(({ bindingKey, plugin }) => {
      if (!plugin.type) {
        return
      }

      const selectorInstance = firstSelectorByType.get(plugin.type)
      if (!selectorInstance) {
        return
      }

      const previousBinding = previousBindings.get(bindingKey)
      if (previousBinding?.selectorInstance === selectorInstance) {
        nextBindings.set(bindingKey, {
          bindingKey,
          plugin,
          selectorInstance,
        })
        return
      }

      if (previousBinding) {
        dispatchPluginOnDispose(
          previousBinding.plugin,
          previousBinding.selectorInstance,
        )
      }

      dispatchPluginOnInit(plugin, selectorInstance)
      nextBindings.set(bindingKey, {
        bindingKey,
        plugin,
        selectorInstance,
      })
    })

    previousBindings.forEach((binding, bindingKey) => {
      if (!nextBindings.has(bindingKey)) {
        dispatchPluginOnDispose(binding.plugin, binding.selectorInstance)
      }
    })

    initializedPluginBindingsRef.current = nextBindings
  }, [firstSelectorByType, normalizedRuntimePlugins])

  useEffect(() => {
    return () => {
      initializedPluginBindingsRef.current.forEach((binding) => {
        dispatchPluginOnDispose(binding.plugin, binding.selectorInstance)
      })
      initializedPluginBindingsRef.current.clear()
    }
  }, [])

  useEffect(() => {
    const nextPanelState = {
      panelType: (activeSelector?.type ?? 'none') as OpenPanelType,
      isOpen: Boolean(activeSelector),
    }
    const previousPanelState = previousPanelStateRef.current

    if (!previousPanelState) {
      previousPanelStateRef.current = nextPanelState
      return
    }

    if (
      previousPanelState.panelType === nextPanelState.panelType &&
      previousPanelState.isOpen === nextPanelState.isOpen
    ) {
      return
    }

    initializedPluginBindingsRef.current.forEach((binding) => {
      const isBindingPanelOpen =
        nextPanelState.isOpen &&
        binding.selectorInstance.type === activeSelector?.type

      dispatchPluginOnPanelOpenChange(
        binding.plugin,
        binding.selectorInstance,
        isBindingPanelOpen ? binding.selectorInstance.type : 'none',
        isBindingPanelOpen,
      )
    })

    previousPanelStateRef.current = nextPanelState
  }, [activeSelector])

  const dispatchSelectorPluginError = (
    selector: SelectorInstance,
    error: unknown,
  ) => {
    initializedPluginBindingsRef.current.forEach((binding) => {
      if (binding.selectorInstance.type !== selector.type) {
        return
      }

      dispatchPluginOnError(
        binding.plugin,
        binding.selectorInstance,
        'onSelectionChange',
        error,
      )
    })
  }

  const applySelectionChange = ({
    proposedValue,
    source,
    selector,
    reason,
  }: ApplySelectionChangeOptions) => {
    const hybridValueResult = resolveHybridValueUpdate({
      value,
      uncontrolledValue: uncontrolledSelectedItemsRef.current,
      proposedValue,
      reason,
    })

    if (hybridValueResult.shouldUpdateUncontrolledValue) {
      setUncontrolledSelectedItems(hybridValueResult.nextUncontrolledValue)
    }

    if (hybridValueResult.shouldEmitOnChange) {
      const meta: ValueChangeMeta = {
        reason: hybridValueResult.meta.reason ?? reason ?? 'replace',
        source,
        selectorType: selector?.type,
        selectorId: selector?.id,
      }

      dispatchComposableOnValueChange(onValueChange, hybridValueResult.eventValue, meta)

      initializedPluginBindingsRef.current.forEach((binding) => {
        if (selector && binding.selectorInstance.type !== selector.type) {
          return
        }

        dispatchPluginOnSelectionChange(
          binding.plugin,
          binding.selectorInstance,
          hybridValueResult.eventValue,
          meta,
        )
      })
    }

    return hybridValueResult
  }

  const handleToggleSelectorTrigger = (selector: SelectorInstance) => {
    setActiveSelectorId((previous) =>
      previous === selector.id ? null : selector.id,
    )

    if (selector.type === 'region') {
      dispatchRegionOnClick((selector.props as RegionSelectProps).options)
      return
    }

    if (selector.type === 'keyword') {
      dispatchKeywordOnClick((selector.props as KeywordSelectorProps).options)
    }
  }

  const handleSelectRegionSearchResult = (result: RegionSearchResult) => {
    if (!openedRegionSelector) {
      return
    }

    const { condition, selectedRegion } = mapRegionSearchResultToCondition(result, {
      selectorId: openedRegionSelector.id,
    })
    const wasSelected = selectedRegionConditions.some(
      (selectedCondition) => selectedCondition.id === condition.id,
    )
    const nextRegionConditions = toggleRegionCondition(
      selectedRegionConditions,
      condition,
    )
    const reason = resolveSelectorSelectionChangeReason(
      selectedRegionConditions,
      nextRegionConditions,
    )
    const nextValue = replaceSelectorSelectionItems(
      selectedItems,
      openedRegionSelector,
      nextRegionConditions,
    )
    const hybridValueResult = applySelectionChange({
      proposedValue: nextValue,
      source: 'selector',
      selector: openedRegionSelector,
      reason,
    })

    if (!wasSelected && hybridValueResult.meta.didChange) {
      dispatchRegionOnSelectedEupmyeondong(
        openedRegionSelector.props.options,
        selectedRegion,
      )
    }

    setRegionSearchQuery('')
  }

  const handleRemoveCondition = (conditionId: string) => {
    const currentItems = selectedItems
    const targetCondition = currentItems.find((condition) => condition.id === conditionId)
    if (!targetCondition) {
      return
    }

    const nextValue = currentItems.filter((condition) => condition.id !== conditionId)
    const selector = resolveSelectorForSelectionItem(targetCondition, selectors)

    applySelectionChange({
      proposedValue: nextValue,
      source: 'external',
      selector,
      reason: 'remove',
    })

    setActiveSelectorId(null)
  }

  const handleClearAllConditions = () => {
    const clearSourceSelector =
      selectors.find((selector) => selector.type === 'region') ??
      selectors.find((selector) => selector.type === 'keyword') ??
      selectors[0]

    applySelectionChange({
      proposedValue: [],
      source: 'external',
      selector: clearSourceSelector,
      reason: 'clear',
    })
  }

  const isDetailedPanelOpen = Boolean(activeSelector)
  const regionSearchErrorMessage = resolveRegionSearchErrorMessage(
    openedRegionSelector?.props.options,
  )
  const shouldShowRegionSearchNoResultMessage =
    Boolean(openedRegionSelector) &&
    regionSearchQuery.trim().length > 0 &&
    regionSearchIndexState.status === 'ready' &&
    regionSearchResults.length === 0 &&
    Boolean(openedRegionSelector?.props.options?.searchNoResultMessage)

  const detailedContent = activeSelector ? (
    // eslint-disable-next-line react-hooks/refs
    activeSelector.driver.renderPanel({
      selectorId: activeSelector.id,
      selectorType: activeSelector.type,
      props: activeSelector.props,
      selectedItems: selectItemsBySelector(selectedItems, activeSelector),
      setSelectedItems: (nextSelectorItems) => {
        try {
          const previousSelectorItems = selectItemsBySelector(
            selectedItems,
            activeSelector,
          )
          const reason = resolveSelectorSelectionChangeReason(
            previousSelectorItems,
            nextSelectorItems,
          )
          const nextValue = replaceSelectorSelectionItems(
            selectedItems,
            activeSelector,
            nextSelectorItems,
          )
          applySelectionChange({
            proposedValue: nextValue,
            source: 'selector',
            selector: activeSelector,
            reason,
          })
        } catch (error) {
          dispatchSelectorPluginError(activeSelector, error)
        }
      },
      closePanel: () => setActiveSelectorId(null),
      emitError: (error) => dispatchSelectorPluginError(activeSelector, error),
    } as Parameters<SelectorInstance['driver']['renderPanel']>[0])
  ) : (
    <p className="cs-detailed-placeholder">{DETAILED_CONDITION_PLACEHOLDER}</p>
  )

  return (
    <section className={resolveClassName(className)} style={style}>
      <div className="cs-selector-area" data-testid="cs-selector-area">
        {selectors.map((selector, index) => {
          const isPanelOpen = activeSelector?.id === selector.id

          return (
            <button
              key={`selector-trigger-${selector.id}-${index}`}
              className="cs-selector-trigger"
              aria-controls={detailedPanelId}
              aria-expanded={isPanelOpen}
              type="button"
              onClick={() => handleToggleSelectorTrigger(selector)}
            >
              <span aria-hidden="true" className="cs-selector-icon">
                {resolveSelectorTriggerIcon(selector.type)}
              </span>
              <span>{selector.driver.getTriggerLabel(selector.props)}</span>
            </button>
          )
        })}
      </div>
      <div
        className="cs-expanded-area"
        data-state={isDetailedPanelOpen ? 'open' : 'closed'}
      >
        {openedRegionSelector ? (
          <div className="cs-region-search-area" data-testid="cs-region-search-area">
            <RegionSearchInput
              icon={openedRegionSelector.props.options?.searchInputIcon}
              status={regionSearchIndexState.status}
              loadingMessage={DEFAULT_REGION_SEARCH_LOADING_MESSAGE}
              errorMessage={regionSearchErrorMessage}
              idleMessage={openedRegionSelector.props.options?.searchIdleMessage}
              label={
                openedRegionSelector.props.options?.searchInputLabel ??
                REGION_SEARCH_LABEL
              }
              placeholder={
                openedRegionSelector.props.options?.searchInputPlaceholder ??
                REGION_SEARCH_PLACEHOLDER
              }
              results={regionSearchResults}
              value={regionSearchQuery}
              onChange={setRegionSearchQuery}
              onSelectResult={handleSelectRegionSearchResult}
            />
            {shouldShowRegionSearchNoResultMessage ? (
              <p className="cs-region-search-message">
                {openedRegionSelector.props.options?.searchNoResultMessage}
              </p>
            ) : null}
          </div>
        ) : null}
        <div
          id={detailedPanelId}
          className="cs-detailed-area"
          data-state={isDetailedPanelOpen ? 'open' : 'closed'}
          data-testid="cs-detailed-area"
          hidden={!isDetailedPanelOpen}
        >
          {detailedContent}
        </div>
      </div>
      <div className="cs-selected-area" data-testid="cs-selected-area">
        <SelectedConditionBasket
          selectedConditions={selectedItems}
          onRemoveCondition={handleRemoveCondition}
          onClearAllConditions={handleClearAllConditions}
        />
      </div>
    </section>
  )
}
