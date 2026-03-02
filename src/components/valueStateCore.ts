import type {
  SearchSelectionItem,
  SelectedKeywordCondition,
  SelectedRegionCondition,
} from './types'

export type SelectionItem = SearchSelectionItem
export type InitialSelectionSource = 'value' | 'defaultValue' | 'empty'
export type ValueChangeReason = 'add' | 'remove' | 'replace' | 'clear'

export interface SplitSelectionItemsResult {
  regionItems: SelectedRegionCondition[]
  keywordItems: SelectedKeywordCondition[]
}
export type SplitSearchSelectionItemsResult = SplitSelectionItemsResult

export interface ResolveInitialSelectionStateOptions {
  value?: SelectionItem[]
  defaultValue?: SelectionItem[]
}

export interface ResolveInitialSelectionStateResult {
  isControlled: boolean
  source: InitialSelectionSource
  selectedItems: SelectionItem[]
  split: SplitSelectionItemsResult
}

export interface ResolveHybridValueUpdateOptions {
  value?: SelectionItem[]
  uncontrolledValue: SelectionItem[]
  proposedValue: SelectionItem[]
  reason?: ValueChangeReason
}

export interface HybridValueUpdateMeta {
  branch: 'controlled' | 'uncontrolled'
  sourceOfTruth: 'value' | 'internal'
  didChange: boolean
  reason: ValueChangeReason | null
  shouldEmitOnChange: boolean
  shouldUpdateUncontrolledValue: boolean
}

export interface ResolveHybridValueUpdateResult {
  isControlled: boolean
  currentValue: SelectionItem[]
  nextRenderedValue: SelectionItem[]
  nextUncontrolledValue: SelectionItem[]
  eventValue: SelectionItem[]
  shouldEmitOnChange: boolean
  shouldUpdateUncontrolledValue: boolean
  split: {
    current: SplitSelectionItemsResult
    event: SplitSelectionItemsResult
    nextRendered: SplitSelectionItemsResult
  }
  meta: HybridValueUpdateMeta
}

function cloneSelectionItems(items: SelectionItem[]): SelectionItem[] {
  return [...items]
}

function isKeywordSelectionItem(item: SelectionItem): item is SelectedKeywordCondition {
  return (
    'keyword' in item &&
    typeof item.keyword === 'string' &&
    'normalizedKeyword' in item &&
    typeof item.normalizedKeyword === 'string'
  )
}

function isRegionSelectionItem(item: SelectionItem): item is SelectedRegionCondition {
  return (
    'sido' in item &&
    typeof item.sido === 'object' &&
    item.sido !== null &&
    'sigungu' in item &&
    typeof item.sigungu === 'object' &&
    item.sigungu !== null &&
    'eupmyeondong' in item &&
    typeof item.eupmyeondong === 'object' &&
    item.eupmyeondong !== null
  )
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
  previous: SelectionItem,
  next: SelectionItem,
): boolean {
  if (isKeywordSelectionItem(previous) && isKeywordSelectionItem(next)) {
    return areKeywordsEqual(previous, next)
  }

  if (isRegionSelectionItem(previous) && isRegionSelectionItem(next)) {
    return areRegionsEqual(previous, next)
  }

  return false
}

function resolveSelectionItemType(item: SelectionItem): 'region' | 'keyword' {
  return isKeywordSelectionItem(item) ? 'keyword' : 'region'
}

function toSelectionItemKey(item: SelectionItem): string {
  return `${resolveSelectionItemType(item)}:${item.id}`
}

function inferValueChangeReason(
  previous: SelectionItem[],
  next: SelectionItem[],
): ValueChangeReason {
  if (previous.length > 0 && next.length === 0) {
    return 'clear'
  }

  const previousKeys = new Set(previous.map(toSelectionItemKey))
  const nextKeys = new Set(next.map(toSelectionItemKey))
  let addedCount = 0
  let removedCount = 0

  nextKeys.forEach((key) => {
    if (!previousKeys.has(key)) {
      addedCount += 1
    }
  })

  previousKeys.forEach((key) => {
    if (!nextKeys.has(key)) {
      removedCount += 1
    }
  })

  if (addedCount > 0 && removedCount === 0) {
    return 'add'
  }

  if (removedCount > 0 && addedCount === 0) {
    return 'remove'
  }

  return 'replace'
}

export function splitSelectionItems(
  selectedItems: SelectionItem[],
): SplitSelectionItemsResult {
  const regionItems: SelectedRegionCondition[] = []
  const keywordItems: SelectedKeywordCondition[] = []

  selectedItems.forEach((item) => {
    if (isKeywordSelectionItem(item)) {
      keywordItems.push(item)
      return
    }

    if (isRegionSelectionItem(item)) {
      regionItems.push(item)
    }
  })

  return {
    regionItems,
    keywordItems,
  }
}

export const splitSearchSelectionItems = splitSelectionItems

export function mergeSelectionItems(
  regionItems: SelectedRegionCondition[],
  keywordItems: SelectedKeywordCondition[],
): SelectionItem[] {
  return [...regionItems, ...keywordItems]
}

export const mergeSearchSelectionItems = mergeSelectionItems

export function areSelectionItemsEqual(
  previous: SelectionItem[],
  next: SelectionItem[],
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

export const areSearchSelectionItemsEqual = areSelectionItemsEqual

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
    split: splitSelectionItems(selectedItems),
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
  const didChange = !areSelectionItemsEqual(currentValue, eventValue)
  const shouldUpdateUncontrolledValue = !isControlled && didChange
  const nextUncontrolledValue = shouldUpdateUncontrolledValue
    ? eventValue
    : cloneSelectionItems(options.uncontrolledValue)
  const nextRenderedValue = isControlled ? currentValue : nextUncontrolledValue
  const shouldEmitOnChange = didChange
  const reason = didChange
    ? options.reason ?? inferValueChangeReason(currentValue, eventValue)
    : null

  return {
    isControlled,
    currentValue,
    nextRenderedValue,
    nextUncontrolledValue,
    eventValue,
    shouldEmitOnChange,
    shouldUpdateUncontrolledValue,
    split: {
      current: splitSelectionItems(currentValue),
      event: splitSelectionItems(eventValue),
      nextRendered: splitSelectionItems(nextRenderedValue),
    },
    meta: {
      branch: isControlled ? 'controlled' : 'uncontrolled',
      sourceOfTruth: isControlled ? 'value' : 'internal',
      didChange,
      reason,
      shouldEmitOnChange,
      shouldUpdateUncontrolledValue,
    },
  }
}
