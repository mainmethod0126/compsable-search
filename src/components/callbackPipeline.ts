import type {
  KeywordInputErrorCode,
  KeywordInvalidTokenContext,
  KeywordSelectOptions,
  Region,
  RegionSelectOptions,
  SearchSelectionItem,
} from './types'

type CallbackScope = 'region' | 'keyword' | 'composableSearch'
type CallbackName =
  | 'onChange'
  | 'onSelectedEupmyeondong'
  | 'onClick'
  | 'onInvalidToken'

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
