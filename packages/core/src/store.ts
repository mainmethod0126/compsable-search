import type {
  CreateSelectionStoreOptions,
  SelectionItem,
  SelectionStore,
  SelectionStoreChange,
  ValueChangeMeta,
  ValueChangeReason,
} from './types'
import {
  clearSelectionBySelectorId,
  mergeSelectionBySelectorId,
  removeSelectionBySelectorId,
} from './selection'

function cloneSelectionItems<TSelectionItem extends SelectionItem>(
  items: readonly TSelectionItem[],
): TSelectionItem[] {
  return [...items]
}

function toSelectionKey(item: SelectionItem): string {
  return `${item.selectorId}:${item.id}`
}

function areSelectionItemsEqual(
  currentValue: readonly SelectionItem[],
  nextValue: readonly SelectionItem[],
): boolean {
  if (currentValue === nextValue) {
    return true
  }

  if (currentValue.length !== nextValue.length) {
    return false
  }

  return currentValue.every((item, index) => {
    const candidate = nextValue[index]
    if (!candidate) {
      return false
    }

    return (
      item.id === candidate.id &&
      item.displayName === candidate.displayName &&
      item.selectorId === candidate.selectorId &&
      Object.is(item.payload, candidate.payload)
    )
  })
}

function inferReason(
  currentValue: readonly SelectionItem[],
  nextValue: readonly SelectionItem[],
): ValueChangeReason {
  if (currentValue.length > 0 && nextValue.length === 0) {
    return 'clear-all'
  }

  const currentKeys = new Set(currentValue.map(toSelectionKey))
  const nextKeys = new Set(nextValue.map(toSelectionKey))
  let addedCount = 0
  let removedCount = 0

  nextKeys.forEach((key) => {
    if (!currentKeys.has(key)) {
      addedCount += 1
    }
  })

  currentKeys.forEach((key) => {
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

function createChange<TSelectionItem extends SelectionItem>(
  currentValue: readonly TSelectionItem[],
  nextValue: readonly TSelectionItem[],
  meta: ValueChangeMeta,
): SelectionStoreChange<TSelectionItem> {
  return {
    currentValue: cloneSelectionItems(currentValue),
    nextValue: cloneSelectionItems(nextValue),
    meta,
    didChange: !areSelectionItemsEqual(currentValue, nextValue),
  }
}

export function createSelectionStore<
  TSelectionItem extends SelectionItem = SelectionItem,
>(
  options: CreateSelectionStoreOptions<TSelectionItem> = {},
): SelectionStore<TSelectionItem> {
  const isControlled = options.value !== undefined
  let controlledValue = cloneSelectionItems(options.value ?? [])
  let uncontrolledValue = cloneSelectionItems(options.defaultValue ?? [])

  const readCurrentValue = () =>
    cloneSelectionItems(isControlled ? controlledValue : uncontrolledValue)

  const commitUncontrolledValue = (nextValue: readonly TSelectionItem[]) => {
    uncontrolledValue = cloneSelectionItems(nextValue)
  }

  const commitExternalValue = (nextValue: readonly TSelectionItem[]) => {
    if (isControlled) {
      controlledValue = cloneSelectionItems(nextValue)
      return
    }

    commitUncontrolledValue(nextValue)
  }

  const finalizeChange = (
    nextValue: readonly TSelectionItem[],
    meta: ValueChangeMeta,
    commit: (value: readonly TSelectionItem[]) => void,
  ) => {
    const currentValue = readCurrentValue()
    const change = createChange(currentValue, nextValue, meta)
    if (change.didChange) {
      commit(nextValue)
    }

    return change
  }

  return {
    getSnapshot() {
      return {
        isControlled,
        value: readCurrentValue(),
      }
    },
    syncExternalValue(nextValue) {
      const currentValue = readCurrentValue()

      return finalizeChange(
        nextValue,
        {
          source: 'external',
          reason: inferReason(currentValue, nextValue),
        },
        commitExternalValue,
      )
    },
    replaceSelectorItems(selectorId, nextItems, source = 'selector') {
      const currentValue = readCurrentValue()
      const nextValue = mergeSelectionBySelectorId(currentValue, selectorId, nextItems)

      return finalizeChange(
        nextValue,
        {
          source,
          reason: inferReason(currentValue, nextValue),
          selectorId,
        },
        commitUncontrolledValue,
      )
    },
    removeSelectorItems(selectorId, itemIds, source = 'external') {
      const currentValue = readCurrentValue()
      const nextValue = removeSelectionBySelectorId(currentValue, selectorId, itemIds)

      return finalizeChange(
        nextValue,
        {
          source,
          reason: 'remove',
          selectorId,
        },
        commitUncontrolledValue,
      )
    },
    clear(selectorId, source = 'external') {
      const currentValue = readCurrentValue()
      const nextValue = clearSelectionBySelectorId(currentValue, selectorId)

      return finalizeChange(
        nextValue,
        {
          source,
          reason: selectorId ? 'remove' : 'clear-all',
          selectorId,
        },
        commitUncontrolledValue,
      )
    },
  }
}
