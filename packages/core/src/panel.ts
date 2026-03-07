import type { PanelStateController } from './types'

export function createPanelStateController(): PanelStateController {
  let activeSelectorId: string | null = null
  const open: PanelStateController['open'] = (selectorId, source = 'selector') => {
    const previousSelectorId = activeSelectorId
    if (previousSelectorId === selectorId) {
      return null
    }

    activeSelectorId = selectorId
    return {
      previousSelectorId,
      currentSelectorId: selectorId,
      isOpen: true,
      reason: previousSelectorId ? 'switch' : 'open',
      source,
    }
  }

  const close: PanelStateController['close'] = (source = 'external') => {
    const previousSelectorId = activeSelectorId
    if (!previousSelectorId) {
      return null
    }

    activeSelectorId = null
    return {
      previousSelectorId,
      currentSelectorId: null,
      isOpen: false,
      reason: 'close',
      source,
    }
  }

  return {
    getSnapshot() {
      return {
        isOpen: activeSelectorId !== null,
        activeSelectorId,
      }
    },
    open,
    close,
    toggle(selectorId, source = 'selector') {
      if (activeSelectorId === selectorId) {
        return close(source)
      }

      return open(selectorId, source)
    },
  }
}
