import {
  normalizeKeywordInput,
  type KeywordPolicy,
} from './keywordInputModel'
import type {
  KeywordInputErrorCode,
  KeywordInvalidTokenContext,
  KeywordSelectOptions,
} from './types'

export function shouldDispatchKeywordInvalidToken(
  previousErrorCode: KeywordInputErrorCode | null,
  nextErrorCode: KeywordInputErrorCode | null,
): nextErrorCode is KeywordInputErrorCode {
  return nextErrorCode !== null && nextErrorCode !== previousErrorCode
}

export function createKeywordInvalidTokenContext(
  inputValue: string,
  policy: KeywordPolicy,
): KeywordInvalidTokenContext {
  return {
    inputValue,
    normalizedValue: normalizeKeywordInput(inputValue, policy),
    maxTokens: policy.maxTokens,
    maxTokenLength: policy.maxTokenLength,
  }
}

export function dispatchKeywordInvalidToken(
  options: KeywordSelectOptions | undefined,
  emitError: (error: unknown) => void,
  errorCode: KeywordInputErrorCode,
  context: KeywordInvalidTokenContext,
): void {
  if (!options?.onInvalidToken) {
    return
  }

  try {
    options.onInvalidToken(errorCode, context)
  } catch (error) {
    emitError(error)
  }
}
