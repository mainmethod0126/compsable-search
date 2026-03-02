import type {
  KeywordInputErrorCode,
  KeywordInvalidTokenContext,
  KeywordSelectOptions,
  Region,
  RegionSelectOptions,
  SearchSelectionItem,
  SelectorInstance,
  ValueChangeMeta,
} from './types'
import type {
  AnySelectorPlugin,
  SelectorPluginErrorEvent,
  SelectorPluginErrorSourceHookName,
  SelectorPluginPanelOpenChangeEvent,
  SelectorPluginSelectionChangeEvent,
} from './plugins'

type CallbackScope = 'region' | 'keyword' | 'composableSearch' | 'plugin'
type CallbackName =
  | 'onChange'
  | 'onValueChange'
  | 'onSelectedEupmyeondong'
  | 'onClick'
  | 'onInvalidToken'
  | 'onInit'
  | 'onDispose'
  | 'onSelectionChange'
  | 'onPanelOpenChange'
  | 'onError'
type PluginCallbackName = Extract<
  CallbackName,
  | 'onInit'
  | 'onDispose'
  | 'onSelectionChange'
  | 'onPanelOpenChange'
  | 'onError'
>

export const CALLBACK_ERROR_PREFIX = '[ComposableSearch] callback error'

function normalizeCallbackError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

function reportCallbackError(
  scope: CallbackScope,
  callbackName: CallbackName,
  error: unknown,
): void {
  console.error(
    CALLBACK_ERROR_PREFIX,
    `${scope}.${callbackName}`,
    normalizeCallbackError(error),
  )
}

function executeCallbackSafely<TArgs extends unknown[]>(
  scope: CallbackScope,
  callbackName: CallbackName,
  callback: ((...args: TArgs) => void) | undefined,
  ...args: TArgs
): void {
  if (!callback) {
    return
  }

  try {
    callback(...args)
  } catch (error) {
    reportCallbackError(scope, callbackName, error)
  }
}

function resolveBoundPlugin(
  plugin: AnySelectorPlugin | undefined,
  instance: SelectorInstance | undefined,
): AnySelectorPlugin | undefined {
  if (!plugin || !instance) {
    return undefined
  }

  if (plugin.type !== instance.type) {
    return undefined
  }

  return plugin
}

function createPluginErrorEvent(
  plugin: AnySelectorPlugin,
  instance: SelectorInstance,
  sourceHookName: SelectorPluginErrorSourceHookName,
  error: Error,
): SelectorPluginErrorEvent {
  return {
    pluginId: plugin.id,
    pluginType: plugin.type ?? instance.type,
    selectorId: instance.id,
    selectorType: instance.type,
    sourceHookName,
    error,
  }
}

function executePluginCallbackSafely<TArgs extends unknown[]>(
  plugin: AnySelectorPlugin,
  instance: SelectorInstance,
  callbackName: PluginCallbackName,
  callback: ((...args: TArgs) => void) | undefined,
  ...args: TArgs
): void {
  if (!callback) {
    return
  }

  try {
    callback(...args)
  } catch (error) {
    const normalizedError = normalizeCallbackError(error)
    reportCallbackError('plugin', callbackName, normalizedError)
    if (callbackName === 'onError') {
      return
    }

    executePluginCallbackSafely(
      plugin,
      instance,
      'onError',
      plugin.onError,
      createPluginErrorEvent(
        plugin,
        instance,
        callbackName,
        normalizedError,
      ),
    )
  }
}

function dispatchPluginCallback<TArgs extends unknown[]>(
  plugin: AnySelectorPlugin | undefined,
  instance: SelectorInstance | undefined,
  callbackName: PluginCallbackName,
  callback: ((...args: TArgs) => void) | undefined,
  ...args: TArgs
): void {
  const boundPlugin = resolveBoundPlugin(plugin, instance)
  if (!boundPlugin || !instance) {
    return
  }

  executePluginCallbackSafely(
    boundPlugin,
    instance,
    callbackName,
    callback,
    ...args,
  )
}

export function dispatchRegionOnChange(
  options: RegionSelectOptions | undefined,
  payload: SearchSelectionItem[],
): void {
  executeCallbackSafely('region', 'onChange', options?.onChange, payload)
}

export function dispatchComposableOnChange(
  onChange: ((selectedItems: SearchSelectionItem[]) => void) | undefined,
  options: RegionSelectOptions | undefined,
  payload: SearchSelectionItem[],
): void {
  if (onChange) {
    executeCallbackSafely('composableSearch', 'onChange', onChange, payload)
    return
  }

  dispatchRegionOnChange(options, payload)
}

export function dispatchComposableOnValueChange(
  onValueChange:
    | ((nextValue: SearchSelectionItem[], meta: ValueChangeMeta) => void)
    | undefined,
  nextValue: SearchSelectionItem[],
  meta: ValueChangeMeta,
): void {
  executeCallbackSafely(
    'composableSearch',
    'onValueChange',
    onValueChange,
    nextValue,
    meta,
  )
}

export function dispatchRegionOnSelectedEupmyeondong(
  options: RegionSelectOptions | undefined,
  selected: Region,
): void {
  executeCallbackSafely(
    'region',
    'onSelectedEupmyeondong',
    options?.onSelectedEupmyeondong,
    selected,
  )
}

export function dispatchRegionOnClick(
  options: RegionSelectOptions | undefined,
): void {
  executeCallbackSafely('region', 'onClick', options?.onClick)
}

export function dispatchKeywordOnClick(
  options: KeywordSelectOptions | undefined,
): void {
  executeCallbackSafely('keyword', 'onClick', options?.onClick)
}

export function dispatchKeywordOnInvalidToken(
  options: KeywordSelectOptions | undefined,
  error: KeywordInputErrorCode,
  context: KeywordInvalidTokenContext,
): void {
  executeCallbackSafely(
    'keyword',
    'onInvalidToken',
    options?.onInvalidToken,
    error,
    context,
  )
}

export function dispatchPluginOnInit(
  plugin: AnySelectorPlugin | undefined,
  instance: SelectorInstance | undefined,
): void {
  dispatchPluginCallback(
    plugin,
    instance,
    'onInit',
    plugin?.onInit,
    { selector: instance as SelectorInstance },
  )
}

export function dispatchPluginOnDispose(
  plugin: AnySelectorPlugin | undefined,
  instance: SelectorInstance | undefined,
): void {
  dispatchPluginCallback(
    plugin,
    instance,
    'onDispose',
    plugin?.onDispose,
    { selector: instance as SelectorInstance },
  )
}

export function dispatchPluginOnSelectionChange(
  plugin: AnySelectorPlugin | undefined,
  instance: SelectorInstance | undefined,
  nextValue: SearchSelectionItem[],
  meta: ValueChangeMeta,
): void {
  const event: SelectorPluginSelectionChangeEvent = {
    nextValue,
    meta,
  }
  dispatchPluginCallback(
    plugin,
    instance,
    'onSelectionChange',
    plugin?.onSelectionChange,
    event,
  )
}

export function dispatchPluginOnPanelOpenChange(
  plugin: AnySelectorPlugin | undefined,
  instance: SelectorInstance | undefined,
  panelType: SelectorPluginPanelOpenChangeEvent['panelType'],
  isOpen: boolean,
): void {
  const event: SelectorPluginPanelOpenChangeEvent = {
    selectorId: instance?.id,
    selectorType: instance?.type,
    panelType,
    isOpen,
  }
  dispatchPluginCallback(
    plugin,
    instance,
    'onPanelOpenChange',
    plugin?.onPanelOpenChange,
    event,
  )
}

export function dispatchPluginOnError(
  plugin: AnySelectorPlugin | undefined,
  instance: SelectorInstance | undefined,
  sourceHookName: SelectorPluginErrorSourceHookName,
  error: unknown,
): void {
  const boundPlugin = resolveBoundPlugin(plugin, instance)
  if (!boundPlugin || !instance) {
    return
  }

  dispatchPluginCallback(
    boundPlugin,
    instance,
    'onError',
    boundPlugin.onError,
    createPluginErrorEvent(
      boundPlugin,
      instance,
      sourceHookName,
      normalizeCallbackError(error),
    ),
  )
}
