import type { KeyboardEventHandler } from 'react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  dispatchComposableOnChange,
  dispatchKeywordOnClick,
  dispatchKeywordOnInvalidToken,
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
  ComposableSearchProps,
  Region,
  RegionDataSource,
  SearchSelectionItem,
  SelectedKeywordCondition,
  SelectedRegionCondition,
} from './types'
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

type DetailPanelMode = 'none' | 'region' | 'keyword'

function resolveClassName(className?: string): string {
  return ['cs-composable-search', className].filter(Boolean).join(' ')
}

function buildCombinedSelectionPayload(
  selectedRegionConditions: SelectedRegionCondition[],
  selectedKeywordConditions: SearchSelectionItem[],
): SearchSelectionItem[] {
  return [...selectedRegionConditions, ...selectedKeywordConditions]
}

function isSelectedKeywordCondition(
  condition: SearchSelectionItem | undefined,
): condition is SelectedKeywordCondition {
  return Boolean(condition && 'normalizedKeyword' in condition)
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
  selectorsProps = [],
  onChange,
  className,
  style,
}: ComposableSearchProps) {
  const detailedPanelId = useId()
  const [activePanelMode, setActivePanelMode] = useState<DetailPanelMode>('none')
  const [regionSearchQuery, setRegionSearchQuery] = useState('')
  const [selectedRegionConditions, setSelectedRegionConditions] = useState<
    SelectedRegionCondition[]
  >([])
  const [keywordInputState, setKeywordInputState] = useState(
    createInitialKeywordInputState,
  )

  const { regionSelector, keywordSelector } = useMemo(
    () =>
      resolveSelectorsWithPolicy(selectorsProps, {
        warningContext: createSelectorResolutionWarningContext(),
      }),
    [selectorsProps],
  )
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
  const keywordConditionRef = useRef<SearchSelectionItem[]>(keywordInputState.tokens)

  useEffect(() => {
    selectedRegionConditionsRef.current = selectedRegionConditions
  }, [selectedRegionConditions])

  useEffect(() => {
    keywordConditionRef.current = keywordInputState.tokens
  }, [keywordInputState.tokens])

  const handleToggleRegionTrigger = () => {
    setActivePanelMode((previous) => (previous === 'region' ? 'none' : 'region'))
    dispatchRegionOnClick(regionSelector?.options)
  }

  const handleToggleKeywordTrigger = () => {
    setActivePanelMode((previous) => (previous === 'keyword' ? 'none' : 'keyword'))
    dispatchKeywordOnClick(keywordSelector?.options)
  }

  const dispatchCombinedOnChange = (
    nextRegionConditions: SelectedRegionCondition[],
    nextKeywordConditions: SearchSelectionItem[],
  ) => {
    dispatchComposableOnChange(
      onChange,
      regionSelector?.options,
      buildCombinedSelectionPayload(nextRegionConditions, nextKeywordConditions),
    )
  }

  const applyKeywordInputEvent = (event: KeywordInputEvent) => {
    setKeywordInputState((previous) => {
      const next = transitionKeywordInputState(previous, event, keywordPolicy)

      if (next.errorCode && next.errorCode !== previous.errorCode) {
        dispatchKeywordOnInvalidToken(keywordSelector?.options, next.errorCode, {
          inputValue: previous.inputValue,
          normalizedValue: normalizeKeywordInput(previous.inputValue, keywordPolicy),
          maxTokens: keywordPolicy.maxTokens,
          maxTokenLength: keywordPolicy.maxTokenLength,
        })
      }

      if (!hasSameKeywordTokenSequence(previous.tokens, next.tokens)) {
        dispatchCombinedOnChange(
          selectedRegionConditionsRef.current,
          next.tokens,
        )
      }

      return next
    })
  }

  const handleToggleRegionCondition = (
    nextCondition: SelectedRegionCondition,
    selectedRegion: Region,
  ) => {
    setSelectedRegionConditions((previous) => {
      const wasSelected = previous.some(
        (condition) => condition.id === nextCondition.id,
      )
      const next = toggleRegionCondition(previous, nextCondition)
      dispatchCombinedOnChange(next, keywordConditionRef.current)
      if (!wasSelected) {
        dispatchRegionOnSelectedEupmyeondong(regionSelector?.options, selectedRegion)
      }
      return next
    })
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

    setSelectedRegionConditions((previous) => {
      const next = previous.filter((condition) => condition.id !== conditionId)
      dispatchCombinedOnChange(next, keywordConditionRef.current)
      return next
    })
  }

  const handleClearAllConditions = () => {
    setSelectedRegionConditions([])
    setKeywordInputState((previous) =>
      transitionKeywordInputState(previous, { type: 'CLEAR_ALL' }, keywordPolicy),
    )
    dispatchCombinedOnChange([], [])
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

  const selectedConditions = useMemo(
    () =>
      buildCombinedSelectionPayload(
        selectedRegionConditions,
        keywordInputState.tokens,
      ),
    [keywordInputState.tokens, selectedRegionConditions],
  )
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
        onInputChange={(value) =>
          applyKeywordInputEvent({ type: 'INPUT_CHANGED', value })
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
        {selectorsProps.map((selector, index) => {
          if (selector.type === 'region') {
            const buttonLabel = selector.options?.placeHolder ?? REGION_PLACEHOLDER

            return (
              <button
                key={`selector-region-${index}`}
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

          const buttonLabel = selector.options?.placeHolder ?? KEYWORD_PLACEHOLDER

          return (
            <button
              key={`selector-keyword-${index}`}
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
