import type { SelectionItem, SelectorId } from './types'

function cloneSelectionItems<TSelectionItem extends SelectionItem>(
  items: readonly TSelectionItem[],
): TSelectionItem[] {
  return [...items]
}

function assertSelectionOwnership<TSelectionItem extends SelectionItem>(
  selectorId: SelectorId,
  nextItems: readonly TSelectionItem[],
): void {
  const invalidItem = nextItems.find((item) => item.selectorId !== selectorId)
  if (!invalidItem) {
    return
  }

  throw new Error(
    `Selection item "${invalidItem.id}" is owned by "${invalidItem.selectorId}", expected "${selectorId}".`,
  )
}

export function mergeSelectionBySelectorId<
  TSelectionItem extends SelectionItem = SelectionItem,
>(
  currentValue: readonly TSelectionItem[],
  selectorId: SelectorId,
  nextItems: readonly TSelectionItem[],
): TSelectionItem[] {
  assertSelectionOwnership(selectorId, nextItems)

  const retainedItems = currentValue.filter((item) => item.selectorId !== selectorId)
  return [...retainedItems, ...cloneSelectionItems(nextItems)]
}

export function removeSelectionBySelectorId<
  TSelectionItem extends SelectionItem = SelectionItem,
>(
  currentValue: readonly TSelectionItem[],
  selectorId: SelectorId,
  itemIds?: readonly string[],
): TSelectionItem[] {
  if (!itemIds) {
    return currentValue.filter((item) => item.selectorId !== selectorId)
  }

  if (itemIds.length === 0) {
    return cloneSelectionItems(currentValue)
  }

  const itemIdSet = new Set(itemIds)

  return currentValue.filter((item) => {
    if (item.selectorId !== selectorId) {
      return true
    }

    return !itemIdSet.has(item.id)
  })
}

export function clearSelectionBySelectorId<
  TSelectionItem extends SelectionItem = SelectionItem,
>(
  currentValue: readonly TSelectionItem[],
  selectorId?: SelectorId,
): TSelectionItem[] {
  if (selectorId === undefined) {
    return []
  }

  return currentValue.filter((item) => item.selectorId !== selectorId)
}
