import { useEffect, useMemo, useRef, useState } from 'react'
import { RegionDetailPanel } from './RegionDetailPanel'
import { RegionSearchInput, type RegionSearchInputStatus } from './RegionSearchInput'
import {
  DEFAULT_REGION_SEARCH_RESULT_LIMIT,
  buildRegionSearchIndex,
  filterRegionSearchResults,
  mapRegionSearchResultToCondition,
  type RegionSearchResult,
} from './regionSearchModel'
import { toggleRegionCondition } from './selectionPolicy'
import type {
  Region,
  RegionDataSource,
  RegionSelectorProps,
  SearchSelectionItem,
  SelectedRegionCondition,
  SelectionItem,
  SelectorPanelProps,
} from './types'

const DEFAULT_REGION_SEARCH_LABEL = '지역 검색'
const DEFAULT_REGION_SEARCH_PLACEHOLDER = '지역명 입력'
const DEFAULT_REGION_SEARCH_LOADING_MESSAGE = '지역 데이터를 불러오는 중입니다.'
const DEFAULT_REGION_SEARCH_ERROR_MESSAGE =
  '지역 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'

interface RegionSearchIndexState {
  status: RegionSearchInputStatus
  index: RegionSearchResult[]
}

const regionSearchIndexCache = new WeakMap<
  RegionDataSource['findAllSidos'],
  WeakMap<
    RegionDataSource['findAllSigungus'],
    WeakMap<RegionDataSource['findAllEupmyeondongs'], Promise<RegionSearchResult[]>>
  >
>()

function isRegionSelectionItem(
  item: SelectionItem,
): item is SelectedRegionCondition {
  return 'sido' in item && 'sigungu' in item && 'eupmyeondong' in item
}

function resolveRegionSearchErrorMessage(
  options: RegionSelectorProps['options'] | undefined,
): string {
  const configuredMessage = options?.searchErrorMessage
  return typeof configuredMessage === 'string' && configuredMessage.trim().length > 0
    ? configuredMessage
    : DEFAULT_REGION_SEARCH_ERROR_MESSAGE
}

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

function emitRegionOptionChange(
  options: RegionSelectorProps['options'] | undefined,
  emitError: (error: unknown) => void,
  nextSelectedItems: SearchSelectionItem[],
): void {
  if (!options?.onChange) {
    return
  }

  try {
    options.onChange(nextSelectedItems)
  } catch (error) {
    emitError(error)
  }
}

function emitSelectedEupmyeondong(
  options: RegionSelectorProps['options'] | undefined,
  emitError: (error: unknown) => void,
  selectedRegion: Region,
): void {
  if (!options?.onSelectedEupmyeondong) {
    return
  }

  try {
    options.onSelectedEupmyeondong(selectedRegion)
  } catch (error) {
    emitError(error)
  }
}

export function RegionSelectorPanel({
  selectorId,
  props,
  selectedItems,
  setSelectedItems,
  emitError,
}: SelectorPanelProps<RegionSelectorProps, SelectionItem>) {
  const [regionSearchQuery, setRegionSearchQuery] = useState('')
  const [regionSearchIndexState, setRegionSearchIndexState] =
    useState<RegionSearchIndexState>({
      status: 'loading',
      index: [],
    })
  const regionSearchIndexRequestSequenceRef = useRef(0)
  const regionSelectedItems = useMemo(
    () => selectedItems.filter(isRegionSelectionItem),
    [selectedItems],
  )
  const regionSearchResults = useMemo(
    () =>
      filterRegionSearchResults(regionSearchIndexState.index, regionSearchQuery, {
        limit:
          props.options?.searchResultLimit ?? DEFAULT_REGION_SEARCH_RESULT_LIMIT,
      }),
    [props.options?.searchResultLimit, regionSearchIndexState.index, regionSearchQuery],
  )

  useEffect(() => {
    regionSearchIndexRequestSequenceRef.current += 1
    const requestSequence = regionSearchIndexRequestSequenceRef.current
    const abortController = new AbortController()

    setRegionSearchIndexState({
      status: 'loading',
      index: [],
    })

    resolveRegionSearchIndexWithCache(props)
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
  }, [props.findAllEupmyeondongs, props.findAllSidos, props.findAllSigungus])

  const applyRegionSelection = (
    nextSelectedItems: SelectedRegionCondition[],
    selectedRegion?: Region,
  ) => {
    try {
      setSelectedItems(nextSelectedItems)
      emitRegionOptionChange(props.options, emitError, nextSelectedItems)

      if (selectedRegion) {
        emitSelectedEupmyeondong(props.options, emitError, selectedRegion)
      }
    } catch (error) {
      emitError(error)
    }
  }

  const handleToggleRegionCondition = (
    nextCondition: SelectedRegionCondition,
    selectedRegion: Region,
  ) => {
    const wasSelected = regionSelectedItems.some(
      (condition) => condition.id === nextCondition.id,
    )
    const nextSelectedItems = toggleRegionCondition(regionSelectedItems, nextCondition)

    applyRegionSelection(nextSelectedItems, wasSelected ? undefined : selectedRegion)
  }

  const handleSelectRegionSearchResult = (result: RegionSearchResult) => {
    const { condition, selectedRegion } = mapRegionSearchResultToCondition(result, {
      selectorId,
    })
    const wasSelected = regionSelectedItems.some(
      (selectedCondition) => selectedCondition.id === condition.id,
    )
    const nextSelectedItems = toggleRegionCondition(regionSelectedItems, condition)

    applyRegionSelection(
      nextSelectedItems,
      wasSelected ? undefined : selectedRegion,
    )
    setRegionSearchQuery('')
  }

  const shouldShowRegionSearchNoResultMessage =
    regionSearchQuery.trim().length > 0 &&
    regionSearchIndexState.status === 'ready' &&
    regionSearchResults.length === 0 &&
    Boolean(props.options?.searchNoResultMessage)

  return (
    <div className="cs-region-selector-panel">
      <div className="cs-region-search-area" data-testid="cs-region-search-area">
        <RegionSearchInput
          icon={props.options?.searchInputIcon}
          status={regionSearchIndexState.status}
          loadingMessage={
            props.options?.searchLoadingMessage ?? DEFAULT_REGION_SEARCH_LOADING_MESSAGE
          }
          errorMessage={resolveRegionSearchErrorMessage(props.options)}
          idleMessage={props.options?.searchIdleMessage}
          label={props.options?.searchInputLabel ?? DEFAULT_REGION_SEARCH_LABEL}
          placeholder={
            props.options?.searchInputPlaceholder ?? DEFAULT_REGION_SEARCH_PLACEHOLDER
          }
          results={regionSearchResults}
          value={regionSearchQuery}
          onChange={setRegionSearchQuery}
          onSelectResult={handleSelectRegionSearchResult}
        />
        {shouldShowRegionSearchNoResultMessage ? (
          <p className="cs-region-search-message">{props.options?.searchNoResultMessage}</p>
        ) : null}
      </div>
      <RegionDetailPanel
        selectorId={selectorId}
        selector={props}
        selectedConditions={regionSelectedItems}
        onToggleRegionCondition={handleToggleRegionCondition}
        emitError={emitError}
      />
    </div>
  )
}
