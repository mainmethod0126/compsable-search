import {
  createHeadlessCoreController,
  type HeadlessCoreController,
  type HeadlessCoreControllerState,
  type PanelOpenChangeEvent as CorePanelOpenChangeEvent,
  type SelectionChangeEvent,
  type SelectionItem,
} from '@compsable-search/core'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { PanelContainer } from './components/PanelContainer'
import { SelectedBasket } from './components/SelectedBasket'
import { TriggerList } from './components/TriggerList'
import type {
  ComposableSearchLabels,
  ComposableSearchProps,
  ReactHostSelectorDefinition,
  ReactPanelOpenChangeEvent,
  ReactValueChangeMeta,
  SelectedBasketItem,
  SelectorErrorEvent,
} from './types'

const DEFAULT_LABELS: Required<ComposableSearchLabels> = {
  emptyPanelTitle: '선택할 조건을 고르세요',
  emptyPanelDescription:
    'trigger area에서 selector를 열면 panel host에 해당 selector의 상세 UI가 표시됩니다.',
  selectedBasketTitle: '선택된 항목',
  clearAllButtonLabel: '전체 삭제',
  emptySelectionMessage: '선택된 항목이 없습니다.',
  removeSelectionAriaLabel: (itemDisplayName) => `${itemDisplayName} 삭제`,
}

interface ControllerSnapshotRef<TSelectionItem extends SelectionItem> {
  controller: HeadlessCoreController<TSelectionItem>
  snapshot: HeadlessCoreControllerState<TSelectionItem>
}

function resolveClassName(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

function resolveShellState(
  hasFocusWithin: boolean,
  isKeyboardMode: boolean,
  isPanelOpen: boolean,
): string {
  if (hasFocusWithin && isKeyboardMode) {
    return isPanelOpen ? 'keyboard-open' : 'keyboard-focus'
  }

  if (hasFocusWithin) {
    return isPanelOpen ? 'focus-open' : 'focus'
  }

  if (isKeyboardMode) {
    return isPanelOpen ? 'keyboard-open' : 'keyboard'
  }

  return isPanelOpen ? 'open' : 'idle'
}

function createSelectorLookup<TSelectionItem extends SelectionItem>(
  selectors: readonly ReactHostSelectorDefinition<
    unknown,
    string,
    TSelectionItem
  >[],
): Map<
  string,
  ReactHostSelectorDefinition<unknown, string, TSelectionItem>
> {
  return new Map(selectors.map((selector) => [selector.id, selector]))
}

function selectItemsBySelectorId<TSelectionItem extends SelectionItem>(
  value: readonly TSelectionItem[],
): Map<string, TSelectionItem[]> {
  return value.reduce<Map<string, TSelectionItem[]>>((map, item) => {
    const selectedItems = map.get(item.selectorId) ?? []
    selectedItems.push(item)
    map.set(item.selectorId, selectedItems)
    return map
  }, new Map())
}

function resolveValueMeta<
  TSelectionItem extends SelectionItem,
  TSelector extends { type: string },
>(
  event: SelectionChangeEvent<TSelectionItem>,
  selectorLookup: ReadonlyMap<string, TSelector>,
): ReactValueChangeMeta {
  const selectorType = event.meta.selectorId
    ? selectorLookup.get(event.meta.selectorId)?.type
    : undefined

  return {
    ...event.meta,
    selectorType,
  }
}

function resolvePanelEvent<TSelector extends { type: string }>(
  event: CorePanelOpenChangeEvent,
  selectorLookup: ReadonlyMap<string, TSelector>,
): ReactPanelOpenChangeEvent {
  return {
    ...event,
    previousSelectorType: event.previousSelectorId
      ? selectorLookup.get(event.previousSelectorId)?.type
      : undefined,
    currentSelectorType: event.currentSelectorId
      ? selectorLookup.get(event.currentSelectorId)?.type
      : undefined,
  }
}

function useControllerSnapshot<TSelectionItem extends SelectionItem>(
  controller: HeadlessCoreController<TSelectionItem>,
): HeadlessCoreControllerState<TSelectionItem> {
  const snapshotRef = useRef<ControllerSnapshotRef<TSelectionItem>>({
    controller,
    snapshot: controller.getState(),
  })

  if (snapshotRef.current.controller !== controller) {
    snapshotRef.current = {
      controller,
      snapshot: controller.getState(),
    }
  }

  return useSyncExternalStore(
    (onStoreChange) =>
      controller.subscribe(() => {
        snapshotRef.current = {
          controller,
          snapshot: controller.getState(),
        }
        onStoreChange()
      }),
    () => snapshotRef.current.snapshot,
    () => snapshotRef.current.snapshot,
  )
}

function isSelectionItemInput(
  item: unknown,
): item is Pick<SelectionItem, 'id' | 'displayName'> &
  Partial<Pick<SelectionItem, 'selectorId' | 'payload'>> &
  Record<string, unknown> {
  if (typeof item !== 'object' || item === null) {
    return false
  }

  const candidate = item as Partial<SelectionItem>
  return typeof candidate.id === 'string' && typeof candidate.displayName === 'string'
}

function normalizeSelectorSelectionItems<TSelectionItem extends SelectionItem>(
  selectorId: string,
  nextItems: unknown[],
): TSelectionItem[] {
  return nextItems.map((item) => {
    if (!isSelectionItemInput(item)) {
      throw new Error(
        'selector panel은 id/displayName을 가진 selection item 배열을 setSelectedItems로 전달해야 합니다.',
      )
    }

    if (item.selectorId !== undefined && item.selectorId !== selectorId) {
      throw new Error(
        `selector "${selectorId}" panel은 다른 selectorId("${item.selectorId}")를 가진 item을 소유할 수 없습니다.`,
      )
    }

    return {
      ...item,
      selectorId,
    } as TSelectionItem
  })
}

export function ComposableSearch<
  TSelectionItem extends SelectionItem = SelectionItem,
>(props: ComposableSearchProps<TSelectionItem>) {
  const {
    className,
    defaultValue,
    labels,
    onPanelOpenChange,
    onPluginError,
    onSelectorError,
    onValueChange,
    plugins,
    selectors,
    style,
    value,
  } = props
  const isControlled = value !== undefined
  const resolvedLabels = {
    ...DEFAULT_LABELS,
    ...labels,
  }
  const initialDefaultValueRef = useRef(defaultValue)
  const [hasFocusWithin, setHasFocusWithin] = useState(false)
  const [isKeyboardMode, setIsKeyboardMode] = useState(false)
  const selectorLookup = useMemo(() => createSelectorLookup(selectors), [selectors])
  const callbackRef = useRef({
    onPanelOpenChange,
    onPluginError,
    onSelectorError,
    onValueChange,
    selectorLookup,
  })

  useEffect(() => {
    callbackRef.current = {
      onPanelOpenChange,
      onPluginError,
      onSelectorError,
      onValueChange,
      selectorLookup,
    }
  }, [
    onPanelOpenChange,
    onPluginError,
    onSelectorError,
    onValueChange,
    selectorLookup,
  ])

  const coreSelectors = useMemo(
    () =>
      selectors.map((selector) => ({
        id: selector.id,
        type: selector.type,
        version: selector.version,
      })),
    [selectors],
  )
  const controller = useMemo(
    () =>
      createHeadlessCoreController<TSelectionItem>({
        selectors: coreSelectors,
        plugins,
        value: isControlled ? value : undefined,
        defaultValue: initialDefaultValueRef.current,
        onSelectionChange: (event) => {
          const nextValue = [...event.nextValue]
          const nextMeta = resolveValueMeta(
            event,
            callbackRef.current.selectorLookup,
          )
          callbackRef.current.onValueChange?.(nextValue, nextMeta)
        },
        onPanelOpenChange: (event) => {
          const nextEvent = resolvePanelEvent(
            event,
            callbackRef.current.selectorLookup,
          )
          callbackRef.current.onPanelOpenChange?.(nextEvent)
        },
        onError: (event) => {
          callbackRef.current.onPluginError?.(event)
        },
      }),
    [coreSelectors, isControlled, plugins],
  )
  const controllerState = useControllerSnapshot(controller)
  const selectedItemsBySelectorId = useMemo(
    () => selectItemsBySelectorId(controllerState.value),
    [controllerState.value],
  )
  const activeSelector = controllerState.activeSelectorId
    ? selectorLookup.get(controllerState.activeSelectorId) ?? null
    : null
  const activeSelectedItems = activeSelector
    ? (selectedItemsBySelectorId.get(activeSelector.id) ?? [])
    : []
  const triggerItems = selectors.map((selector) => ({
    id: selector.id,
    label: selector.driver.getTriggerLabel(selector.props),
    selectedCount: selectedItemsBySelectorId.get(selector.id)?.length ?? 0,
    isActive: controllerState.activeSelectorId === selector.id,
    isOpen:
      controllerState.isPanelOpen && controllerState.activeSelectorId === selector.id,
  }))
  const selectedBasketItems: SelectedBasketItem[] = controllerState.value.map((item) => ({
    id: item.id,
    displayName: item.displayName,
    selectorId: item.selectorId,
  }))

  useEffect(() => {
    if (isControlled && value !== undefined) {
      controller.syncExternalValue(value)
    }
  }, [controller, isControlled, value])

  useEffect(() => () => controller.destroy(), [controller])

  const handleTriggerClick = (selectorId: string) => {
    controller.togglePanel(selectorId, 'selector')
  }

  const handleRemoveItem = (selectorId: string, itemId: string) => {
    controller.removeSelection(selectorId, [itemId], 'external')
  }

  const handleClearAll = () => {
    controller.clearSelection(undefined, 'external')
  }

  const emitSelectorError = (event: SelectorErrorEvent) => {
    callbackRef.current.onSelectorError?.(event)
  }

  const renderedPanel: ReactNode =
    activeSelector && controllerState.isPanelOpen
      ? activeSelector.driver.renderPanel({
          selectorId: activeSelector.id,
          selectorType: activeSelector.type,
          props: activeSelector.props,
          selectedItems: [...activeSelectedItems],
          setSelectedItems: (nextItems: unknown[]) => {
            try {
              controller.replaceSelection(
                activeSelector.id,
                normalizeSelectorSelectionItems<TSelectionItem>(
                  activeSelector.id,
                  nextItems,
                ),
                'selector',
              )
            } catch (error) {
              emitSelectorError({
                selectorId: activeSelector.id,
                selectorType: activeSelector.type,
                error,
              })
            }
          },
          closePanel: () => {
            controller.closePanel('selector')
          },
          emitError: (error: unknown) => {
            emitSelectorError({
              selectorId: activeSelector.id,
              selectorType: activeSelector.type,
              error,
            })
          },
        })
      : null

  return (
    <div
      className={resolveClassName('cs-shell', className)}
      data-shell-state={resolveShellState(
        hasFocusWithin,
        isKeyboardMode,
        controllerState.isPanelOpen,
      )}
      style={style}
      onBlurCapture={(event) => {
        const nextFocusedTarget = event.relatedTarget

        if (
          nextFocusedTarget instanceof Node &&
          event.currentTarget.contains(nextFocusedTarget)
        ) {
          return
        }

        setHasFocusWithin(false)
      }}
      onFocusCapture={() => {
        setHasFocusWithin(true)
      }}
      onKeyDownCapture={() => {
        setIsKeyboardMode(true)
      }}
      onPointerDownCapture={() => {
        setIsKeyboardMode(false)
      }}
    >
      <TriggerList
        activeSelectorId={controllerState.activeSelectorId}
        items={triggerItems}
        onTriggerClick={handleTriggerClick}
      />
      <PanelContainer
        emptyDescription={resolvedLabels.emptyPanelDescription}
        emptyTitle={resolvedLabels.emptyPanelTitle}
        isOpen={controllerState.isPanelOpen && activeSelector !== null}
        panelId={
          activeSelector ? `cs-panel-${activeSelector.id}` : 'cs-panel-empty'
        }
        title={
          activeSelector
            ? activeSelector.driver.getTriggerLabel(activeSelector.props)
            : resolvedLabels.emptyPanelTitle
        }
      >
        {renderedPanel}
      </PanelContainer>
      <SelectedBasket
        clearAllButtonLabel={resolvedLabels.clearAllButtonLabel}
        emptySelectionMessage={resolvedLabels.emptySelectionMessage}
        items={selectedBasketItems}
        removeSelectionAriaLabel={resolvedLabels.removeSelectionAriaLabel}
        title={resolvedLabels.selectedBasketTitle}
        onClearAll={handleClearAll}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  )
}
