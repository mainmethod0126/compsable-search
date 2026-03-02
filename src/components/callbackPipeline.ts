import type {
  AnySelectorPlugin,
  ChangeMeta,
  KeywordInputErrorCode,
  KeywordInvalidTokenContext,
  KeywordSelectOptions,
  Region,
  RegionSelectOptions,
  SearchSelectionItem,
  SelectorInstance,
} from './types'

type CallbackScope = 'region' | 'keyword' | 'composableSearch' | 'plugin'
type CallbackName =
  | 'onChange'
  | 'onValueChange'
  | 'onSelectedEupmyeondong'
  | 'onClick'
  | 'onInvalidToken'
  | 'onInit'
  | 'onDispose'

export const CALLBACK_ERROR_PREFIX = '[ComposableSearch] callback error'

function reportCallbackError(
  scope: CallbackScope,
  callbackName: CallbackName,
  error: unknown,
): void {
  console.error(
    CALLBACK_ERROR_PREFIX,
    `${scope}.${callbackName}`,
    error instanceof Error ? error : new Error(String(error)),
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
    | ((nextValue: SearchSelectionItem[], meta: ChangeMeta) => void)
    | undefined,
  nextValue: SearchSelectionItem[],
  meta: ChangeMeta,
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
  if (!plugin || !instance) {
    return
  }

  if (plugin.type === 'region') {
    if (instance.type !== 'region') {
      return
    }

    executeCallbackSafely('plugin', 'onInit', plugin.onInit, instance)
    return
  }

  if (instance.type !== 'keyword') {
    return
  }

  executeCallbackSafely('plugin', 'onInit', plugin.onInit, instance)
}

export function dispatchPluginOnDispose(
  plugin: AnySelectorPlugin | undefined,
  instance: SelectorInstance | undefined,
): void {
  if (!plugin || !instance) {
    return
  }

  if (plugin.type === 'region') {
    if (instance.type !== 'region') {
      return
    }

    executeCallbackSafely('plugin', 'onDispose', plugin.onDispose, instance)
    return
  }

  if (instance.type !== 'keyword') {
    return
  }

  executeCallbackSafely('plugin', 'onDispose', plugin.onDispose, instance)
}
