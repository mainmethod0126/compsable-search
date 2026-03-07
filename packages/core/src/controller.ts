import type {
  CreateHeadlessCoreControllerOptions,
  HeadlessCoreController,
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

  const reportError = (event: SelectorPluginErrorEvent) => {
    onError?.(event)
  }

  bindings.forEach((binding) => {
    dispatchPluginLifecycle(binding, 'onInit', reportError)
  })

  return {
    getState() {
      const storeSnapshot = store.getSnapshot()
      const panelSnapshot = panel.getSnapshot()

      return {
        selectors,
        plugins: bindings,
        value: storeSnapshot.value,
        isControlled: storeSnapshot.isControlled,
        activeSelectorId: panelSnapshot.activeSelectorId,
        isPanelOpen: panelSnapshot.isOpen,
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
      return event
    },
    openPanel(selectorId, source = 'selector') {
      const event = panel.open(selectorId, source)
      if (!event) {
        return null
      }

      options.onPanelOpenChange?.(event)
      dispatchPluginPanelOpenChange(bindings, event, reportError)
      return event
    },
    closePanel(source = 'external') {
      const event = panel.close(source)
      if (!event) {
        return null
      }

      options.onPanelOpenChange?.(event)
      dispatchPluginPanelOpenChange(bindings, event, reportError)
      return event
    },
    togglePanel(selectorId, source = 'selector') {
      const event = panel.toggle(selectorId, source)
      if (!event) {
        return null
      }

      options.onPanelOpenChange?.(event)
      dispatchPluginPanelOpenChange(bindings, event, reportError)
      return event
    },
    destroy() {
      bindings.forEach((binding) => {
        dispatchPluginLifecycle(binding, 'onDispose', reportError)
      })
    },
  }
}
