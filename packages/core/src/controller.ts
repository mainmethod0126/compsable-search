import type {
  CreateHeadlessCoreControllerOptions,
  HeadlessCoreController,
  HeadlessCoreControllerState,
  SelectionChangeEvent,
  SelectorPluginErrorEvent,
  SelectionItem,
} from './types'
import { createPanelStateController } from './panel'
import {
  dispatchPluginLifecycle,
  dispatchPluginPanelOpenChange,
  dispatchPluginSelectionChange,
  resolveSelectorPluginBindings,
} from './plugins'
import { createSelectionStore } from './store'
import { assertComposableSearchConfiguration } from './validation'

function toSelectionChangeEvent<
  TSelectionItem extends SelectionItem,
>(
  change: SelectionChangeEvent<TSelectionItem> & { didChange?: boolean },
): SelectionChangeEvent<TSelectionItem> | null {
  if ('didChange' in change && change.didChange === false) {
    return null
  }

  return {
    currentValue: change.currentValue,
    nextValue: change.nextValue,
    meta: change.meta,
  }
}

export function createHeadlessCoreController<
  TSelectionItem extends SelectionItem = SelectionItem,
>(
  options: CreateHeadlessCoreControllerOptions<TSelectionItem>,
): HeadlessCoreController<TSelectionItem> {
  assertComposableSearchConfiguration(options)

  const selectors = [...(options.selectors ?? [])]
  const onError = options.onError
  const store = createSelectionStore<TSelectionItem>({
    value: options.value,
    defaultValue: options.defaultValue,
  })
  const panel = createPanelStateController()
  const bindings = resolveSelectorPluginBindings(selectors, options.plugins ?? [])
  const listeners = new Set<() => void>()
  let state: HeadlessCoreControllerState<TSelectionItem>

  const reportError = (event: SelectorPluginErrorEvent) => {
    onError?.(event)
  }
  const syncState = () => {
    const storeSnapshot = store.getSnapshot()
    const panelSnapshot = panel.getSnapshot()

    state = {
      selectors,
      plugins: bindings,
      value: storeSnapshot.value,
      isControlled: storeSnapshot.isControlled,
      activeSelectorId: panelSnapshot.activeSelectorId,
      isPanelOpen: panelSnapshot.isOpen,
    }
  }
  const notifyListeners = () => {
    listeners.forEach((listener) => {
      listener()
    })
  }

  bindings.forEach((binding) => {
    dispatchPluginLifecycle(binding, 'onInit', reportError)
  })
  syncState()

  return {
    getState() {
      return state
    },
    subscribe(listener) {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
    syncExternalValue(nextValue) {
      const change = store.syncExternalValue(nextValue)
      const event = toSelectionChangeEvent(change)
      if (!event) {
        return null
      }

      options.onSelectionChange?.(event)
      dispatchPluginSelectionChange(bindings, event, reportError)
      syncState()
      notifyListeners()
      return event
    },
    replaceSelection(selectorId, nextItems, source = 'selector') {
      const change = store.replaceSelectorItems(selectorId, nextItems, source)
      const event = toSelectionChangeEvent(change)
      if (!event) {
        return null
      }

      options.onSelectionChange?.(event)
      dispatchPluginSelectionChange(bindings, event, reportError)
      syncState()
      notifyListeners()
      return event
    },
    removeSelection(selectorId, itemIds, source = 'external') {
      const change = store.removeSelectorItems(selectorId, itemIds, source)
      const event = toSelectionChangeEvent(change)
      if (!event) {
        return null
      }

      options.onSelectionChange?.(event)
      dispatchPluginSelectionChange(bindings, event, reportError)
      syncState()
      notifyListeners()
      return event
    },
    clearSelection(selectorId, source = 'external') {
      const change = store.clear(selectorId, source)
      const event = toSelectionChangeEvent(change)
      if (!event) {
        return null
      }

      options.onSelectionChange?.(event)
      dispatchPluginSelectionChange(bindings, event, reportError)
      syncState()
      notifyListeners()
      return event
    },
    openPanel(selectorId, source = 'selector') {
      const event = panel.open(selectorId, source)
      if (!event) {
        return null
      }

      options.onPanelOpenChange?.(event)
      dispatchPluginPanelOpenChange(bindings, event, reportError)
      syncState()
      notifyListeners()
      return event
    },
    closePanel(source = 'external') {
      const event = panel.close(source)
      if (!event) {
        return null
      }

      options.onPanelOpenChange?.(event)
      dispatchPluginPanelOpenChange(bindings, event, reportError)
      syncState()
      notifyListeners()
      return event
    },
    togglePanel(selectorId, source = 'selector') {
      const event = panel.toggle(selectorId, source)
      if (!event) {
        return null
      }

      options.onPanelOpenChange?.(event)
      dispatchPluginPanelOpenChange(bindings, event, reportError)
      syncState()
      notifyListeners()
      return event
    },
    destroy() {
      bindings.forEach((binding) => {
        dispatchPluginLifecycle(binding, 'onDispose', reportError)
      })
      listeners.clear()
    },
  }
}
