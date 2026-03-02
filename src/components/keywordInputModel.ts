import type {
  KeywordInputErrorCode,
  KeywordNormalizationCasePolicy,
  KeywordSelectOptions,
  SelectedKeywordCondition,
} from './publicTypes'

export const DEFAULT_MAX_KEYWORD_TOKENS = 5
export const DEFAULT_MAX_KEYWORD_TOKEN_LENGTH = 20
export const DEFAULT_KEYWORD_SELECTOR_ID = 'keyword-selector'

export type KeywordInputStatus =
  | 'idle'
  | 'typing'
  | 'token-committed'
  | 'max-token-reached'

export interface KeywordPolicy {
  maxTokens: number
  maxTokenLength: number
  selectorId: string
  normalization: {
    trim: boolean
    collapseWhitespace: boolean
    casePolicy: KeywordNormalizationCasePolicy
  }
}

export interface KeywordInputState {
  status: KeywordInputStatus
  inputValue: string
  tokens: SelectedKeywordCondition[]
  errorCode: KeywordInputErrorCode | null
  isFocused: boolean
}

export type KeywordInputEvent =
  | { type: 'FOCUS' }
  | { type: 'BLUR' }
  | { type: 'INPUT_CHANGED'; value: string }
  | { type: 'COMMIT_INPUT' }
  | { type: 'BACKSPACE' }
  | { type: 'REMOVE_TOKEN'; tokenId: string }
  | { type: 'CLEAR_ALL' }

function resolvePositiveInteger(value: number | undefined, fallback: number): number {
  if (!value || !Number.isFinite(value)) {
    return fallback
  }

  const normalized = Math.floor(value)
  return normalized > 0 ? normalized : fallback
}

export function resolveKeywordPolicy(
  options?: KeywordSelectOptions,
  selectorId: string = DEFAULT_KEYWORD_SELECTOR_ID,
): KeywordPolicy {
  return {
    maxTokens: resolvePositiveInteger(
      options?.maxTokens,
      DEFAULT_MAX_KEYWORD_TOKENS,
    ),
    maxTokenLength: resolvePositiveInteger(
      options?.maxTokenLength,
      DEFAULT_MAX_KEYWORD_TOKEN_LENGTH,
    ),
    selectorId,
    normalization: {
      trim: options?.normalization?.trim ?? true,
      collapseWhitespace: options?.normalization?.collapseWhitespace ?? true,
      casePolicy: options?.normalization?.casePolicy ?? 'lower',
    },
  }
}

function collapseSequentialWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ')
}

export function normalizeKeywordInput(
  inputValue: string,
  policy: KeywordPolicy,
): string {
  let next = inputValue

  if (policy.normalization.trim) {
    next = next.trim()
  }

  if (policy.normalization.collapseWhitespace) {
    next = collapseSequentialWhitespace(next)
  }

  if (policy.normalization.casePolicy === 'lower') {
    next = next.toLowerCase()
  }

  return next
}

function createKeywordCondition(
  normalizedKeyword: string,
  policy: KeywordPolicy,
): SelectedKeywordCondition {
  return {
    id: `keyword:${normalizedKeyword}`,
    displayName: `키워드: ${normalizedKeyword}`,
    selectorId: policy.selectorId,
    selectorType: 'keyword',
    keyword: normalizedKeyword,
    normalizedKeyword,
  }
}

function resolveStatus(
  tokens: SelectedKeywordCondition[],
  inputValue: string,
  policy: KeywordPolicy,
): KeywordInputStatus {
  if (tokens.length >= policy.maxTokens) {
    return 'max-token-reached'
  }

  if (inputValue.length > 0) {
    return 'typing'
  }

  if (tokens.length > 0) {
    return 'token-committed'
  }

  return 'idle'
}

function commitInput(
  state: KeywordInputState,
  policy: KeywordPolicy,
): KeywordInputState {
  const normalizedValue = normalizeKeywordInput(state.inputValue, policy)
  const hasRawInput = state.inputValue.length > 0

  if (!normalizedValue) {
    if (!hasRawInput) {
      return {
        ...state,
        errorCode: null,
        status: resolveStatus(state.tokens, '', policy),
      }
    }

    return {
      ...state,
      inputValue: '',
      errorCode: 'empty-token',
      status: resolveStatus(state.tokens, '', policy),
    }
  }

  if (normalizedValue.length > policy.maxTokenLength) {
    return {
      ...state,
      errorCode: 'token-too-long',
      status: 'typing',
    }
  }

  const hasDuplicate = state.tokens.some(
    (token) => token.normalizedKeyword === normalizedValue,
  )
  if (hasDuplicate) {
    return {
      ...state,
      inputValue: normalizedValue,
      errorCode: 'duplicate-token',
      status: 'typing',
    }
  }

  if (state.tokens.length >= policy.maxTokens) {
    return {
      ...state,
      errorCode: 'max-token-reached',
      status: 'max-token-reached',
    }
  }

  const nextTokens = [...state.tokens, createKeywordCondition(normalizedValue, policy)]
  return {
    ...state,
    tokens: nextTokens,
    inputValue: '',
    errorCode: null,
    status: resolveStatus(nextTokens, '', policy),
  }
}

export function createInitialKeywordInputState(): KeywordInputState {
  return {
    status: 'idle',
    inputValue: '',
    tokens: [],
    errorCode: null,
    isFocused: false,
  }
}

export function transitionKeywordInputState(
  state: KeywordInputState,
  event: KeywordInputEvent,
  policy: KeywordPolicy,
): KeywordInputState {
  switch (event.type) {
    case 'FOCUS':
      return {
        ...state,
        isFocused: true,
        status: resolveStatus(state.tokens, state.inputValue, policy),
      }
    case 'BLUR': {
      const committed = commitInput(state, policy)
      return {
        ...committed,
        isFocused: false,
      }
    }
    case 'INPUT_CHANGED':
      return {
        ...state,
        inputValue: event.value,
        errorCode: null,
        status: resolveStatus(state.tokens, event.value, policy),
      }
    case 'COMMIT_INPUT':
      return commitInput(state, policy)
    case 'BACKSPACE': {
      if (state.inputValue.length > 0 || state.tokens.length === 0) {
        return state
      }

      const nextTokens = state.tokens.slice(0, -1)
      return {
        ...state,
        tokens: nextTokens,
        errorCode: null,
        status: resolveStatus(nextTokens, '', policy),
      }
    }
    case 'REMOVE_TOKEN': {
      const nextTokens = state.tokens.filter((token) => token.id !== event.tokenId)
      if (nextTokens.length === state.tokens.length) {
        return state
      }

      return {
        ...state,
        tokens: nextTokens,
        errorCode: null,
        status: resolveStatus(nextTokens, state.inputValue, policy),
      }
    }
    case 'CLEAR_ALL':
      return {
        ...state,
        inputValue: '',
        tokens: [],
        errorCode: null,
        status: 'idle',
      }
    default:
      return state
  }
}

export function resolveKeywordInputErrorMessage(
  errorCode: KeywordInputErrorCode | null,
  policy: KeywordPolicy,
): string | null {
  if (!errorCode) {
    return null
  }

  switch (errorCode) {
    case 'empty-token':
      return '빈 키워드는 추가할 수 없습니다.'
    case 'duplicate-token':
      return '이미 추가된 키워드입니다.'
    case 'token-too-long':
      return `키워드는 최대 ${policy.maxTokenLength}자까지 입력할 수 있습니다.`
    case 'max-token-reached':
      return `키워드는 최대 ${policy.maxTokens}개까지 추가할 수 있습니다.`
    default:
      return null
  }
}

export function hasSameKeywordTokenSequence(
  previousTokens: SelectedKeywordCondition[],
  nextTokens: SelectedKeywordCondition[],
): boolean {
  if (previousTokens.length !== nextTokens.length) {
    return false
  }

  return previousTokens.every(
    (previousToken, index) =>
      previousToken.id === nextTokens[index]?.id &&
      previousToken.selectorId === nextTokens[index]?.selectorId &&
      previousToken.selectorType === nextTokens[index]?.selectorType,
  )
}
