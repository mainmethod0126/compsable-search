import type { KeyboardEventHandler } from 'react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  dispatchComposableOnChange,
  dispatchComposableOnValueChange,
  dispatchKeywordOnClick,
  dispatchKeywordOnInvalidToken,
  dispatchPluginOnDispose,
  dispatchPluginOnInit,
  dispatchRegionOnClick,
  dispatchRegionOnSelectedEupmyeondong,
} from './callbackPipeline'
import { KeywordDetailPanel } from './KeywordDetailPanel'
import {
  createInitialKeywordInputState,
  hasSameKeywordTokenSequence,
  normalizeKeywordInput,
  resolveKeywordInputErrorMessage,
  resolveKeywordPolicy,
  transitionKeywordInputState,
  type KeywordInputEvent,
} from './keywordInputModel'
import { RegionDetailPanel } from './RegionDetailPanel'
import { RegionSearchInput } from './RegionSearchInput'
import {
  buildRegionSearchIndex,
  DEFAULT_REGION_SEARCH_RESULT_LIMIT,
  filterRegionSearchResults,
  mapRegionSearchResultToCondition,
  type RegionSearchResult,
} from './regionSearchModel'
import {
  createSelectorResolutionWarningContext,
  resolveSelectorsWithPolicy,
} from './selectorTypeUtils'
import { SelectedConditionBasket } from './SelectedConditionBasket'
import { toggleRegionCondition } from './selectionPolicy'
import type {
  AnySelectorPlugin,
  ChangeMeta,
  ComposableSearchProps,
  ComposableSelectProps,
  Region,
  RegionDataSource,
  SearchSelectionItem,
  SelectedKeywordCondition,
  SelectedRegionCondition,
  SelectorInstance,
} from './types'
import {
  mergeSearchSelectionItems,
  resolveHybridValueUpdate,
  resolveInitialSelectionState,
  splitSearchSelectionItems,
} from './valueStateCore'
import './ComposableSearch.css'

const DETAILED_CONDITION_PLACEHOLDER = '상세 조건을 선택해 주세요.'
const REGION_PLACEHOLDER = '지역 선택'
const REGION_SEARCH_LABEL = '지역 검색'
const REGION_SEARCH_PLACEHOLDER = '지역명 입력'
const KEYWORD_PLACEHOLDER = '키워드 선택'
const KEYWORD_INPUT_LABEL = '키워드 입력'
const KEYWORD_INPUT_GUIDE_TEXT =
  'Enter로 키워드 확정, 입력이 비었을 때 Backspace로 마지막 키워드 삭제'
const KEYWORD_INPUT_PLACEHOLDER = '키워드를 입력해 주세요.'
const LEGACY_REGION_SELECTOR_ID = 'legacy-region-selector'
const LEGACY_KEYWORD_SELECTOR_ID = 'legacy-keyword-selector'

type DetailPanelMode = 'none' | 'region' | 'keyword'
type SelectorType = ComposableSelectProps['type']
type InitializedPluginBinding = {
  plugin: AnySelectorPlugin
  selectorInstance: SelectorInstance
}

function resolveClassName(className?: string): string {
  return ['cs-composable-search', className].filter(Boolean).join(' ')
}

function buildCombinedSelectionPayload(
  selectedRegionConditions: SelectedRegionCondition[],
  selectedKeywordConditions: SelectedKeywordCondition[],
): SearchSelectionItem[] {
  return mergeSearchSelectionItems(selectedRegionConditions, selectedKeywordConditions)
}

function isSelectedKeywordCondition(
  condition: SearchSelectionItem | undefined,
): condition is SelectedKeywordCondition {
  return Boolean(condition && 'normalizedKeyword' in condition)
}

function createLegacySelectorInstances(
  selectorsProps: ComposableSelectProps[],
): SelectorInstance[] {
  return selectorsProps.map((selectorProps, index) => {
    if (selectorProps.type === 'region') {
      return {
        id: `legacy-region-${index}`,
        type: 'region',
        props: selectorProps,
      }
    }

    return {
      id: `legacy-keyword-${index}`,
      type: 'keyword',
      props: selectorProps,
    }
  })
}

function resolveSelectorIdsByType(
  selectorInstances: SelectorInstance[],
): Partial<Record<SelectorType, string>> {
  const selectorIdsByType: Partial<Record<SelectorType, string>> = {}
  selectorInstances.forEach((selectorInstance) => {
    if (!selectorIdsByType[selectorInstance.type]) {
      selectorIdsByType[selectorInstance.type] = selectorInstance.id
    }
  })
  return selectorIdsByType
}

function resolveFirstSelectorInstanceByType(
  selectorInstances: SelectorInstance[],
): Partial<Record<SelectorType, SelectorInstance>> {
  const selectorInstancesByType: Partial<Record<SelectorType, SelectorInstance>> =
    {}
  selectorInstances.forEach((selectorInstance) => {
    if (!selectorInstancesByType[selectorInstance.type]) {
      selectorInstancesByType[selectorInstance.type] = selectorInstance
    }
  })
  return selectorInstancesByType
}

function resolveSelectorOptionLabel(
  options: { placeholder?: string; placeHolder?: string } | undefined,
  fallback: string,
): string {
  return options?.placeholder ?? options?.placeHolder ?? fallback
}

const regionSearchIndexCache = new WeakMap<
  RegionDataSource['findAllSidos'],
  WeakMap<
    RegionDataSource['findAllSigungus'],
    WeakMap<RegionDataSource['findAllEupmyeondongs'], RegionSearchResult[]>
  >
>()

function resolveRegionSearchIndexWithCache(
  regionDataSource: Pick<
    RegionDataSource,
    'findAllSidos' | 'findAllSigungus' | 'findAllEupmyeondongs'
  >,
): RegionSearchResult[] {
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

  const nextIndex = buildRegionSearchIndex({
    findAllSidos,
    findAllSigungus,
    findAllEupmyeondongs,
  })
  eupmyeondongCacheBySigungu.set(findAllEupmyeondongs, nextIndex)
  return nextIndex
}

export function ComposableSearch({
  selectors,
  plugins,
  selectorsProps = [],
  value,
  defaultValue,
  onValueChange,
  onChange,
  className,
  style,
}: ComposableSearchProps) {
  const detailedPanelId = useId()
  const [activePanelMode, setActivePanelMode] = useState<DetailPanelMode>('none')
  const [regionSearchQuery, setRegionSearchQuery] = useState('')
  const [uncontrolledSelectedItems, setUncontrolledSelectedItems] = useState(() =>
    resolveInitialSelectionState({ value, defaultValue }).selectedItems,
  )
  const [keywordInputState, setKeywordInputState] = useState(() => {
    const initialSelectionState = resolveInitialSelectionState({ value, defaultValue })
    return {
      ...createInitialKeywordInputState(),
      tokens: initialSelectionState.split.keywordItems,
    }
  })

  const selectorInstances = useMemo(
    () => selectors ?? createLegacySelectorInstances(selectorsProps),
    [selectors, selectorsProps],
  )
  const internalSelectorProps = useMemo(
    () => selectorInstances.map((selectorInstance) => selectorInstance.props),
    [selectorInstances],
  )
  const selectorIdsByType = useMemo(
    () => resolveSelectorIdsByType(selectorInstances),
    [selectorInstances],
  )
  const firstSelectorInstanceByType = useMemo(
    () => resolveFirstSelectorInstanceByType(selectorInstances),
    [selectorInstances],
  )
  const runtimePluginEntries = useMemo(
    () => Object.entries(plugins ?? {}),
    [plugins],
  )
  const { regionSelector, keywordSelector } = useMemo(
    () =>
      resolveSelectorsWithPolicy(internalSelectorProps, {
        warningContext: createSelectorResolutionWarningContext(),
      }),
    [internalSelectorProps],
  )
  const selectedItems = useMemo(
    () => (value !== undefined ? value : uncontrolledSelectedItems),
    [uncontrolledSelectedItems, value],
  )
  const selectedItemsByType = useMemo(
    () => splitSearchSelectionItems(selectedItems),
    [selectedItems],
  )
  const selectedRegionConditions = selectedItemsByType.regionItems
  const selectedKeywordConditions = selectedItemsByType.keywordItems
  const keywordPolicy = useMemo(
    () => resolveKeywordPolicy(keywordSelector?.options),
    [keywordSelector?.options],
  )
  const regionSearchIndex = useMemo(
    () =>
      regionSelector
        ? resolveRegionSearchIndexWithCache(regionSelector)
        : [],
    [regionSelector],
  )
  const regionSearchResults = useMemo(
    () =>
      filterRegionSearchResults(regionSearchIndex, regionSearchQuery, {
        limit:
          regionSelector?.options?.searchResultLimit ??
          DEFAULT_REGION_SEARCH_RESULT_LIMIT,
      }),
    [regionSearchIndex, regionSearchQuery, regionSelector?.options?.searchResultLimit],
  )

  const selectedRegionConditionsRef = useRef(selectedRegionConditions)
  const keywordConditionRef = useRef<SelectedKeywordCondition[]>(
    selectedKeywordConditions,
  )
  const uncontrolledSelectedItemsRef = useRef(uncontrolledSelectedItems)
  const initializedPluginBindingsRef = useRef<
    Map<string, InitializedPluginBinding>
  >(new Map())

  useEffect(() => {
    selectedRegionConditionsRef.current = selectedRegionConditions
  }, [selectedRegionConditions])

  useEffect(() => {
    keywordConditionRef.current = selectedKeywordConditions
  }, [selectedKeywordConditions])

  useEffect(() => {
    uncontrolledSelectedItemsRef.current = uncontrolledSelectedItems
  }, [uncontrolledSelectedItems])

  useEffect(() => {
    const previousBindings = initializedPluginBindingsRef.current
    const nextBindings = new Map<string, InitializedPluginBinding>()

    runtimePluginEntries.forEach(([pluginKey, plugin]) => {
      const selectorInstance = firstSelectorInstanceByType[plugin.type]
      if (!selectorInstance) {
        return
      }

      const previousBinding = previousBindings.get(pluginKey)
      const hasSameBinding =
        previousBinding?.plugin === plugin &&
        previousBinding.selectorInstance === selectorInstance

      if (hasSameBinding) {
        nextBindings.set(pluginKey, previousBinding)
        return
      }

      if (previousBinding) {
        dispatchPluginOnDispose(
          previousBinding.plugin,
          previousBinding.selectorInstance,
        )
      }

      dispatchPluginOnInit(plugin, selectorInstance)
      nextBindings.set(pluginKey, { plugin, selectorInstance })
    })

    previousBindings.forEach((binding, pluginKey) => {
      if (!nextBindings.has(pluginKey)) {
        dispatchPluginOnDispose(binding.plugin, binding.selectorInstance)
      }
    })

    initializedPluginBindingsRef.current = nextBindings
  }, [firstSelectorInstanceByType, runtimePluginEntries])

  useEffect(() => {
    return () => {
      initializedPluginBindingsRef.current.forEach((binding) => {
        dispatchPluginOnDispose(binding.plugin, binding.selectorInstance)
      })
      initializedPluginBindingsRef.current.clear()
    }
  }, [])

  const resolveSelectorId = (selectorType: SelectorType): string =>
    selectorIdsByType[selectorType] ??
    (selectorType === 'region'
      ? LEGACY_REGION_SELECTOR_ID
      : LEGACY_KEYWORD_SELECTOR_ID)

  const resolveChangeMeta = (
    source: ChangeMeta['source'],
    selectorType: SelectorType,
  ): ChangeMeta => ({
    source,
    selectorType,
    selectorId: resolveSelectorId(selectorType),
  })

  const applySelectionChange = (
    proposedValue: SearchSelectionItem[],
    meta: ChangeMeta,
  ) => {
    const hybridValueResult = resolveHybridValueUpdate({
      value,
      uncontrolledValue: uncontrolledSelectedItemsRef.current,
      proposedValue,
    })

    if (hybridValueResult.shouldUpdateUncontrolledValue) {
      setUncontrolledSelectedItems(hybridValueResult.nextUncontrolledValue)
    }

    if (hybridValueResult.shouldEmitOnChange) {
      dispatchComposableOnValueChange(
        onValueChange,
        hybridValueResult.eventValue,
        meta,
      )
      dispatchComposableOnChange(
        onChange,
        regionSelector?.options,
        hybridValueResult.eventValue,
      )
    }

    return hybridValueResult
  }

  const handleToggleRegionTrigger = () => {
    setActivePanelMode((previous) => (previous === 'region' ? 'none' : 'region'))
    dispatchRegionOnClick(regionSelector?.options)
  }

  const handleToggleKeywordTrigger = () => {
    setActivePanelMode((previous) => (previous === 'keyword' ? 'none' : 'keyword'))
    dispatchKeywordOnClick(keywordSelector?.options)
  }

  const applyKeywordInputEvent = (event: KeywordInputEvent) => {
    setKeywordInputState((previous) => {
      const keywordInputStateBase = hasSameKeywordTokenSequence(
        previous.tokens,
        keywordConditionRef.current,
      )
        ? previous
        : {
            ...previous,
            tokens: keywordConditionRef.current,
          }
      const next = transitionKeywordInputState(
        keywordInputStateBase,
        event,
        keywordPolicy,
      )

      if (next.errorCode && next.errorCode !== previous.errorCode) {
        dispatchKeywordOnInvalidToken(keywordSelector?.options, next.errorCode, {
          inputValue: previous.inputValue,
          normalizedValue: normalizeKeywordInput(previous.inputValue, keywordPolicy),
          maxTokens: keywordPolicy.maxTokens,
          maxTokenLength: keywordPolicy.maxTokenLength,
        })
      }

      if (!hasSameKeywordTokenSequence(previous.tokens, next.tokens)) {
        const hybridValueResult = applySelectionChange(
          buildCombinedSelectionPayload(selectedRegionConditionsRef.current, next.tokens),
          resolveChangeMeta('keyword', 'keyword'),
        )

        return {
          ...next,
          tokens: hybridValueResult.split.nextRendered.keywordItems,
        }
      }

      return next
    })
  }

  const handleToggleRegionCondition = (
    nextCondition: SelectedRegionCondition,
    selectedRegion: Region,
  ) => {
    const previousRegionConditions = selectedRegionConditionsRef.current
    const wasSelected = previousRegionConditions.some(
      (condition) => condition.id === nextCondition.id,
    )
    const nextRegionConditions = toggleRegionCondition(
      previousRegionConditions,
      nextCondition,
    )
    const hybridValueResult = applySelectionChange(
      buildCombinedSelectionPayload(nextRegionConditions, keywordConditionRef.current),
      resolveChangeMeta('region', 'region'),
    )

    if (!wasSelected && hybridValueResult.meta.didChange) {
      dispatchRegionOnSelectedEupmyeondong(regionSelector?.options, selectedRegion)
    }
  }

  const handleSelectRegionSearchResult = (result: RegionSearchResult) => {
    if (!regionSelector) {
      return
    }

    const { condition, selectedRegion } = mapRegionSearchResultToCondition(result)
    handleToggleRegionCondition(condition, selectedRegion)
    setRegionSearchQuery('')
  }

  const handleRemoveCondition = (conditionId: string) => {
    const selectedKeywordCondition = keywordConditionRef.current.find(
      (condition) => condition.id === conditionId,
    )
    if (isSelectedKeywordCondition(selectedKeywordCondition)) {
      applyKeywordInputEvent({ type: 'REMOVE_TOKEN', tokenId: conditionId })
      return
    }

    const nextRegionConditions = selectedRegionConditionsRef.current.filter(
      (condition) => condition.id !== conditionId,
    )
    applySelectionChange(
      buildCombinedSelectionPayload(nextRegionConditions, keywordConditionRef.current),
      resolveChangeMeta('region', 'region'),
    )
  }

  const handleClearAllConditions = () => {
    const clearSourceSelectorType: SelectorType = regionSelector
      ? 'region'
      : keywordSelector
        ? 'keyword'
        : 'region'
    const hybridValueResult = applySelectionChange(
      [],
      resolveChangeMeta('external', clearSourceSelectorType),
    )

    setKeywordInputState((previous) => {
      const clearedKeywordInputState = transitionKeywordInputState(
        previous,
        { type: 'CLEAR_ALL' },
        keywordPolicy,
      )
      return {
        ...clearedKeywordInputState,
        tokens: hybridValueResult.split.nextRendered.keywordItems,
      }
    })
  }

  const keywordErrorMessage = resolveKeywordInputErrorMessage(
    keywordInputState.errorCode,
    keywordPolicy,
  )

  const handleKeywordInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      applyKeywordInputEvent({ type: 'COMMIT_INPUT' })
      return
    }

    if (event.key === 'Backspace' && keywordInputState.inputValue.length === 0) {
      event.preventDefault()
      applyKeywordInputEvent({ type: 'BACKSPACE' })
    }
  }

  const selectedConditions = selectedItems
  const openedRegionSelector =
    activePanelMode === 'region' ? regionSelector : undefined
  const openedKeywordSelector =
    activePanelMode === 'keyword' ? keywordSelector : undefined
  const isRegionPanelOpen = Boolean(openedRegionSelector)
  const isKeywordPanelOpen = Boolean(openedKeywordSelector)
  const isDetailedPanelOpen = isRegionPanelOpen || isKeywordPanelOpen
  const shouldShowRegionSearchNoResultMessage =
    isRegionPanelOpen &&
    regionSearchQuery.trim().length > 0 &&
    regionSearchResults.length === 0 &&
    Boolean(openedRegionSelector?.options?.searchNoResultMessage)

  const detailedContent =
    openedKeywordSelector ? (
      <KeywordDetailPanel
        errorMessage={keywordErrorMessage}
        guideText={
          openedKeywordSelector.options?.guideText ?? KEYWORD_INPUT_GUIDE_TEXT
        }
        inputPlaceholder={
          openedKeywordSelector.options?.inputPlaceholder ??
          KEYWORD_INPUT_PLACEHOLDER
        }
        inputValue={keywordInputState.inputValue}
        label={openedKeywordSelector.options?.label ?? KEYWORD_INPUT_LABEL}
        maxTokens={keywordPolicy.maxTokens}
        tokenCount={keywordInputState.tokens.length}
        onInputBlur={() => applyKeywordInputEvent({ type: 'BLUR' })}
        onInputChange={(inputValue) =>
          applyKeywordInputEvent({ type: 'INPUT_CHANGED', value: inputValue })
        }
        onInputFocus={() => applyKeywordInputEvent({ type: 'FOCUS' })}
        onInputKeyDown={handleKeywordInputKeyDown}
      />
    ) : openedRegionSelector ? (
      <RegionDetailPanel
        selector={openedRegionSelector}
        selectedConditions={selectedRegionConditions}
        onToggleRegionCondition={handleToggleRegionCondition}
      />
    ) : (
      <p className="cs-detailed-placeholder">{DETAILED_CONDITION_PLACEHOLDER}</p>
    )

  return (
    <section className={resolveClassName(className)} style={style}>
      <div className="cs-selector-area" data-testid="cs-selector-area">
        {selectorInstances.map((selectorInstance, index) => {
          const selector = selectorInstance.props
          if (selector.type === 'region') {
            const buttonLabel = resolveSelectorOptionLabel(
              selector.options,
              REGION_PLACEHOLDER,
            )

            return (
              <button
                key={`selector-region-${selectorInstance.id}-${index}`}
                className="cs-selector-trigger"
                aria-controls={detailedPanelId}
                aria-expanded={isRegionPanelOpen}
                type="button"
                onClick={handleToggleRegionTrigger}
              >
                <span aria-hidden="true" className="cs-selector-icon">
                  R
                </span>
                <span>{buttonLabel}</span>
              </button>
            )
          }

          const buttonLabel = resolveSelectorOptionLabel(
            selector.options,
            KEYWORD_PLACEHOLDER,
          )

          return (
            <button
              key={`selector-keyword-${selectorInstance.id}-${index}`}
              className="cs-selector-trigger"
              aria-controls={detailedPanelId}
              aria-expanded={isKeywordPanelOpen}
              type="button"
              onClick={handleToggleKeywordTrigger}
            >
              <span aria-hidden="true" className="cs-selector-icon">
                K
              </span>
              <span>{buttonLabel}</span>
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
              icon={openedRegionSelector.options?.searchInputIcon}
              idleMessage={openedRegionSelector.options?.searchIdleMessage}
              label={
                openedRegionSelector.options?.searchInputLabel ?? REGION_SEARCH_LABEL
              }
              placeholder={
                openedRegionSelector.options?.searchInputPlaceholder ??
                REGION_SEARCH_PLACEHOLDER
              }
              results={regionSearchResults}
              value={regionSearchQuery}
              onChange={setRegionSearchQuery}
              onSelectResult={handleSelectRegionSearchResult}
            />
            {shouldShowRegionSearchNoResultMessage ? (
              <p className="cs-region-search-message">
                {openedRegionSelector.options?.searchNoResultMessage}
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
          selectedConditions={selectedConditions}
          onRemoveCondition={handleRemoveCondition}
          onClearAllConditions={handleClearAllConditions}
        />
      </div>
    </section>
  )
}
