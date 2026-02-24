import type { KeyboardEventHandler } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  dispatchKeywordOnClick,
  dispatchKeywordOnInvalidToken,
  dispatchRegionOnChange,
  dispatchRegionOnClick,
  dispatchRegionOnSelectedEupmyeondong,
} from './callbackPipeline'
import type {
  InternalKeywordSelectOptions,
  InternalRegionSelectOptions,
  InternalRegionSelector,
} from './internalTypes'
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
import { resolveSelectorByType } from './selectorTypeUtils'
import { SelectedConditionBasket } from './SelectedConditionBasket'
import { toggleRegionCondition } from './selectionPolicy'
import type {
  ComposableSearchProps,
  ComposableSelectProps,
  KeywordSelectProps,
  Region,
  SearchSelectionItem,
  SelectedRegionCondition,
} from './types'
import './ComposableSearch.css'

const DETAILED_CONDITION_PLACEHOLDER = '상세 조건을 선택해 주세요.'
const REGION_PLACEHOLDER = '지역 선택'
const REGION_SEARCH_LABEL = '지역 검색'
const REGION_SEARCH_PLACEHOLDER = '시/도, 시/군/구, 읍/면/동 검색'
const REGION_SEARCH_IDLE_MESSAGE =
  '지역명을 입력하면 시/도, 시/군/구, 읍/면/동 미리보기를 제공합니다.'
const REGION_SEARCH_NO_RESULT_MESSAGE = '일치하는 지역이 없습니다.'
const KEYWORD_PLACEHOLDER = '키워드 선택'
const KEYWORD_INPUT_LABEL = '키워드 입력'
const KEYWORD_INPUT_GUIDE_TEXT =
  'Enter로 키워드 확정, 입력이 비었을 때 Backspace로 마지막 키워드 삭제'
const KEYWORD_INPUT_PLACEHOLDER = '키워드를 입력해 주세요.'

type DetailPanelMode = 'none' | 'region' | 'keyword'

function resolveRegionSelector(
  selectorsProps: ComposableSelectProps[],
): InternalRegionSelector | undefined {
  return resolveSelectorByType(selectorsProps, 'region')
}

function resolveKeywordSelector(
  selectorsProps: ComposableSelectProps[],
): KeywordSelectProps | undefined {
  return resolveSelectorByType(selectorsProps, 'keyword')
}

function resolveClassName(className?: string): string {
  return ['cs-composable-search', className].filter(Boolean).join(' ')
}

function buildCombinedSelectionPayload(
  selectedRegionConditions: SelectedRegionCondition[],
  selectedKeywordConditions: SearchSelectionItem[],
): SearchSelectionItem[] {
  return [...selectedRegionConditions, ...selectedKeywordConditions]
}

export function ComposableSearch({
  selectorsProps = [],
  className,
  style,
}: ComposableSearchProps) {
  const [activePanelMode, setActivePanelMode] = useState<DetailPanelMode>('none')
  const [regionSearchQuery, setRegionSearchQuery] = useState('')
  const [selectedRegionConditions, setSelectedRegionConditions] = useState<
    SelectedRegionCondition[]
  >([])
  const [keywordInputState, setKeywordInputState] = useState(
    createInitialKeywordInputState,
  )

  const regionSelector = useMemo(
    () => resolveRegionSelector(selectorsProps),
    [selectorsProps],
  )
  const keywordSelector = useMemo(
    () => resolveKeywordSelector(selectorsProps),
    [selectorsProps],
  )
  const keywordPolicy = useMemo(
    () => resolveKeywordPolicy(keywordSelector?.options),
    [keywordSelector?.options],
  )
  const regionSearchIndex = useMemo(
    () => (regionSelector ? buildRegionSearchIndex(regionSelector) : []),
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

  const handleToggleRegionTrigger = (selector: InternalRegionSelector) => {
    setActivePanelMode((previous) => (previous === 'region' ? 'none' : 'region'))
    dispatchRegionOnClick(selector.options)
  }

  const handleToggleKeywordTrigger = (options?: InternalKeywordSelectOptions) => {
    setActivePanelMode((previous) => (previous === 'keyword' ? 'none' : 'keyword'))
    dispatchKeywordOnClick(options)
  }

  const dispatchCombinedOnChange = (
    options: InternalRegionSelectOptions | undefined,
    nextRegionConditions: SelectedRegionCondition[],
    nextKeywordConditions: SearchSelectionItem[],
  ) => {
    dispatchRegionOnChange(
      options,
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
          regionSelector?.options,
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
    options?: InternalRegionSelectOptions,
  ) => {
    setSelectedRegionConditions((previous) => {
      const wasSelected = previous.some(
        (condition) => condition.id === nextCondition.id,
      )
      const next = toggleRegionCondition(previous, nextCondition)
      dispatchCombinedOnChange(options, next, keywordConditionRef.current)
      if (!wasSelected) {
        dispatchRegionOnSelectedEupmyeondong(options, selectedRegion)
      }
      return next
    })
  }

  const handleSelectRegionSearchResult = (result: RegionSearchResult) => {
    if (!regionSelector) {
      return
    }

    const { condition, selectedRegion } = mapRegionSearchResultToCondition(result)
    handleToggleRegionCondition(condition, selectedRegion, regionSelector.options)
    setRegionSearchQuery('')
  }

  const handleRemoveCondition = (
    conditionId: string,
    options?: InternalRegionSelectOptions,
  ) => {
    if (conditionId.startsWith('keyword:')) {
      applyKeywordInputEvent({ type: 'REMOVE_TOKEN', tokenId: conditionId })
      return
    }

    setSelectedRegionConditions((previous) => {
      const next = previous.filter((condition) => condition.id !== conditionId)
      dispatchCombinedOnChange(options, next, keywordConditionRef.current)
      return next
    })
  }

  const handleClearAllConditions = (options?: InternalRegionSelectOptions) => {
    setSelectedRegionConditions([])
    setKeywordInputState((previous) =>
      transitionKeywordInputState(previous, { type: 'CLEAR_ALL' }, keywordPolicy),
    )
    dispatchCombinedOnChange(options, [], [])
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

  const detailedContent =
    activePanelMode === 'keyword' && keywordSelector ? (
      <KeywordDetailPanel
        errorMessage={keywordErrorMessage}
        guideText={keywordSelector.options?.guideText ?? KEYWORD_INPUT_GUIDE_TEXT}
        inputPlaceholder={
          keywordSelector.options?.inputPlaceholder ?? KEYWORD_INPUT_PLACEHOLDER
        }
        inputValue={keywordInputState.inputValue}
        label={keywordSelector.options?.label ?? KEYWORD_INPUT_LABEL}
        maxTokens={keywordPolicy.maxTokens}
        tokenCount={keywordInputState.tokens.length}
        onInputBlur={() => applyKeywordInputEvent({ type: 'BLUR' })}
        onInputChange={(value) =>
          applyKeywordInputEvent({ type: 'INPUT_CHANGED', value })
        }
        onInputFocus={() => applyKeywordInputEvent({ type: 'FOCUS' })}
        onInputKeyDown={handleKeywordInputKeyDown}
      />
    ) : regionSelector ? (
    <RegionDetailPanel
      selector={regionSelector}
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
                type="button"
                onClick={() => handleToggleRegionTrigger(selector)}
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
              type="button"
              onClick={() => handleToggleKeywordTrigger(selector.options)}
            >
              <span aria-hidden="true" className="cs-selector-icon">
                K
              </span>
              <span>{buttonLabel}</span>
            </button>
          )
        })}
      </div>
      {regionSelector ? (
        <div className="cs-region-search-area" data-testid="cs-region-search-area">
          <RegionSearchInput
            emptyMessage={
              regionSelector.options?.searchNoResultMessage ??
              REGION_SEARCH_NO_RESULT_MESSAGE
            }
            icon={regionSelector.options?.searchInputIcon}
            idleMessage={
              regionSelector.options?.searchIdleMessage ??
              REGION_SEARCH_IDLE_MESSAGE
            }
            label={regionSelector.options?.searchInputLabel ?? REGION_SEARCH_LABEL}
            placeholder={
              regionSelector.options?.searchInputPlaceholder ??
              REGION_SEARCH_PLACEHOLDER
            }
            results={regionSearchResults}
            value={regionSearchQuery}
            onChange={setRegionSearchQuery}
            onSelectResult={handleSelectRegionSearchResult}
          />
        </div>
      ) : null}
      <div
        className="cs-detailed-area"
        data-state={activePanelMode === 'none' ? 'closed' : 'open'}
        data-testid="cs-detailed-area"
      >
        {detailedContent}
      </div>
      <div className="cs-selected-area" data-testid="cs-selected-area">
        <SelectedConditionBasket
          selectedConditions={selectedConditions}
          onRemoveCondition={(conditionId) =>
            handleRemoveCondition(conditionId, regionSelector?.options)
          }
          onClearAllConditions={() =>
            handleClearAllConditions(regionSelector?.options)
          }
        />
      </div>
    </section>
  )
}
