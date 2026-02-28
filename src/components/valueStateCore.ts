import type {
  SearchSelectionItem,
  SelectedKeywordCondition,
  SelectedRegionCondition,
} from './types'

export type InitialSelectionSource = 'value' | 'defaultValue' | 'empty'

export interface SplitSearchSelectionItemsResult {
  regionItems: SelectedRegionCondition[]
  keywordItems: SelectedKeywordCondition[]
}

export interface ResolveInitialSelectionStateOptions {
  value?: SearchSelectionItem[]
  defaultValue?: SearchSelectionItem[]
}

export interface ResolveInitialSelectionStateResult {
  isControlled: boolean
  source: InitialSelectionSource
  selectedItems: SearchSelectionItem[]
  split: SplitSearchSelectionItemsResult
}

export interface ResolveHybridValueUpdateOptions {
  value?: SearchSelectionItem[]
  uncontrolledValue: SearchSelectionItem[]
  proposedValue: SearchSelectionItem[]
}

export interface HybridValueUpdateMeta {
  branch: 'controlled' | 'uncontrolled'
  sourceOfTruth: 'value' | 'internal'
  didChange: boolean
  shouldEmitOnChange: boolean
  shouldUpdateUncontrolledValue: boolean
}

export interface ResolveHybridValueUpdateResult {
  isControlled: boolean
  currentValue: SearchSelectionItem[]
  nextRenderedValue: SearchSelectionItem[]
  nextUncontrolledValue: SearchSelectionItem[]
  eventValue: SearchSelectionItem[]
  shouldEmitOnChange: boolean
  shouldUpdateUncontrolledValue: boolean
  split: {
    current: SplitSearchSelectionItemsResult
    event: SplitSearchSelectionItemsResult
    nextRendered: SplitSearchSelectionItemsResult
  }
  meta: HybridValueUpdateMeta
}

function cloneSelectionItems(items: SearchSelectionItem[]): SearchSelectionItem[] {
  return [...items]
}

function isKeywordSelectionItem(
  item: SearchSelectionItem,
): item is SelectedKeywordCondition {
  return 'normalizedKeyword' in item
}

function isRegionSelectionItem(
  item: SearchSelectionItem,
): item is SelectedRegionCondition {
  return !isKeywordSelectionItem(item)
}

function areRegionsEqual(
  previous: SelectedRegionCondition,
  next: SelectedRegionCondition,
): boolean {
  return (
    previous.id === next.id &&
    previous.displayName === next.displayName &&
    previous.sido.code === next.sido.code &&
    previous.sido.name === next.sido.name &&
    previous.sido.displayName === next.sido.displayName &&
    previous.sigungu.code === next.sigungu.code &&
    previous.sigungu.name === next.sigungu.name &&
    previous.sigungu.displayName === next.sigungu.displayName &&
    previous.eupmyeondong.code === next.eupmyeondong.code &&
    previous.eupmyeondong.name === next.eupmyeondong.name &&
    previous.eupmyeondong.displayName === next.eupmyeondong.displayName
  )
}

function areKeywordsEqual(
  previous: SelectedKeywordCondition,
  next: SelectedKeywordCondition,
): boolean {
  return (
    previous.id === next.id &&
    previous.displayName === next.displayName &&
    previous.keyword === next.keyword &&
    previous.normalizedKeyword === next.normalizedKeyword
  )
}

function areSearchSelectionItemsEqualByIndex(
  previous: SearchSelectionItem,
  next: SearchSelectionItem,
): boolean {
  if (isKeywordSelectionItem(previous) && isKeywordSelectionItem(next)) {
    return areKeywordsEqual(previous, next)
  }

  if (isRegionSelectionItem(previous) && isRegionSelectionItem(next)) {
    return areRegionsEqual(previous, next)
  }

  return false
}

export function splitSearchSelectionItems(
  selectedItems: SearchSelectionItem[],
): SplitSearchSelectionItemsResult {
  const regionItems: SelectedRegionCondition[] = []
  const keywordItems: SelectedKeywordCondition[] = []

  selectedItems.forEach((item) => {
    if (isKeywordSelectionItem(item)) {
      keywordItems.push(item)
      return
    }

    regionItems.push(item)
  })

  return {
    regionItems,
    keywordItems,
  }
}

export function mergeSearchSelectionItems(
  regionItems: SelectedRegionCondition[],
  keywordItems: SelectedKeywordCondition[],
): SearchSelectionItem[] {
  return [...regionItems, ...keywordItems]
}

export function areSearchSelectionItemsEqual(
  previous: SearchSelectionItem[],
  next: SearchSelectionItem[],
): boolean {
  if (previous === next) {
    return true
  }

  if (previous.length !== next.length) {
    return false
  }

  return previous.every((previousItem, index) => {
    const nextItem = next[index]
    if (!nextItem) {
      return false
    }

    return areSearchSelectionItemsEqualByIndex(previousItem, nextItem)
  })
}

export function resolveInitialSelectionState(
  options: ResolveInitialSelectionStateOptions = {},
): ResolveInitialSelectionStateResult {
  const isControlled = options.value !== undefined
  const source: InitialSelectionSource = isControlled
    ? 'value'
    : options.defaultValue !== undefined
      ? 'defaultValue'
      : 'empty'
  const selectedItems = cloneSelectionItems(
    isControlled ? options.value ?? [] : options.defaultValue ?? [],
  )

  return {
    isControlled,
    source,
    selectedItems,
    split: splitSearchSelectionItems(selectedItems),
  }
}

export function resolveHybridValueUpdate(
  options: ResolveHybridValueUpdateOptions,
): ResolveHybridValueUpdateResult {
  const isControlled = options.value !== undefined
  const currentValue = cloneSelectionItems(
    isControlled ? options.value ?? [] : options.uncontrolledValue,
  )
  const eventValue = cloneSelectionItems(options.proposedValue)
  const didChange = !areSearchSelectionItemsEqual(currentValue, eventValue)
  const shouldUpdateUncontrolledValue = !isControlled && didChange
  const nextUncontrolledValue = shouldUpdateUncontrolledValue
    ? eventValue
    : cloneSelectionItems(options.uncontrolledValue)
  const nextRenderedValue = isControlled ? currentValue : nextUncontrolledValue
  const shouldEmitOnChange = didChange

  return {
    isControlled,
    currentValue,
    nextRenderedValue,
    nextUncontrolledValue,
    eventValue,
    shouldEmitOnChange,
    shouldUpdateUncontrolledValue,
    split: {
      current: splitSearchSelectionItems(currentValue),
      event: splitSearchSelectionItems(eventValue),
      nextRendered: splitSearchSelectionItems(nextRenderedValue),
    },
    meta: {
      branch: isControlled ? 'controlled' : 'uncontrolled',
      sourceOfTruth: isControlled ? 'value' : 'internal',
      didChange,
      shouldEmitOnChange,
      shouldUpdateUncontrolledValue,
    },
  }
}
