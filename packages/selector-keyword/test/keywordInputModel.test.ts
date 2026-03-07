import { describe, expect, it } from 'vitest'
import {
  DEFAULT_KEYWORD_SELECTOR_ID,
  createInitialKeywordInputState,
  normalizeKeywordInput,
  resolveKeywordPolicy,
  transitionKeywordInputState,
  type KeywordInputState,
} from '../src/keywordInputModel'

function reduceToState(
  events: Array<Parameters<typeof transitionKeywordInputState>[1]>,
  policy = resolveKeywordPolicy(),
): KeywordInputState {
  return events.reduce(
    (state, event) => transitionKeywordInputState(state, event, policy),
    createInitialKeywordInputState(),
  )
}

describe('keywordInputModel', () => {
  it('기본 정규화 정책은 trim/collapse/lower를 적용한다', () => {
    const policy = resolveKeywordPolicy()

    expect(normalizeKeywordInput('  React   Query  ', policy)).toBe('react query')
  })

  it('preserve case 정책을 주면 대소문자를 유지한다', () => {
    const policy = resolveKeywordPolicy({
      normalization: {
        casePolicy: 'preserve',
      },
    })

    expect(normalizeKeywordInput('  React   Query  ', policy)).toBe('React Query')
  })

  it('Enter로 입력을 확정하면 정규화된 토큰이 생성되고 token-committed 상태가 된다', () => {
    const state = reduceToState([
      { type: 'FOCUS' },
      { type: 'INPUT_CHANGED', value: '  React   Query  ' },
      { type: 'COMMIT_INPUT' },
    ])

    expect(state.status).toBe('token-committed')
    expect(state.inputValue).toBe('')
    expect(state.errorCode).toBeNull()
    expect(state.tokens).toEqual([
      expect.objectContaining({
        id: 'keyword:react query',
        selectorId: DEFAULT_KEYWORD_SELECTOR_ID,
        selectorType: 'keyword',
        keyword: 'react query',
        normalizedKeyword: 'react query',
        displayName: '키워드: react query',
      }),
    ])
  })

  it('정책에 selectorId를 주입하면 생성 토큰에 동일한 selectorId가 반영된다', () => {
    const policy = resolveKeywordPolicy(undefined, 'keyword-v2-main')
    const state = reduceToState(
      [
        { type: 'INPUT_CHANGED', value: 'React' },
        { type: 'COMMIT_INPUT' },
      ],
      policy,
    )

    expect(state.tokens).toEqual([
      expect.objectContaining({
        id: 'keyword:react',
        selectorId: 'keyword-v2-main',
        selectorType: 'keyword',
        keyword: 'react',
        normalizedKeyword: 'react',
      }),
    ])
  })

  it('중복 토큰은 정규화 기준으로 차단되고 duplicate-token 오류 상태를 남긴다', () => {
    const state = reduceToState([
      { type: 'INPUT_CHANGED', value: 'React Query' },
      { type: 'COMMIT_INPUT' },
      { type: 'INPUT_CHANGED', value: ' react   query ' },
      { type: 'COMMIT_INPUT' },
    ])

    expect(state.tokens).toHaveLength(1)
    expect(state.status).toBe('typing')
    expect(state.inputValue).toBe('react query')
    expect(state.errorCode).toBe('duplicate-token')
  })

  it('최대 길이를 초과한 토큰은 token-too-long 오류 상태로 차단된다', () => {
    const state = reduceToState(
      [
        { type: 'INPUT_CHANGED', value: 'react-query' },
        { type: 'COMMIT_INPUT' },
      ],
      resolveKeywordPolicy({ maxTokenLength: 5 }),
    )

    expect(state.tokens).toHaveLength(0)
    expect(state.status).toBe('typing')
    expect(state.inputValue).toBe('react-query')
    expect(state.errorCode).toBe('token-too-long')
  })

  it('최대 토큰 수에 도달하면 max-token-reached 상태가 되고 추가 확정이 차단된다', () => {
    const policy = resolveKeywordPolicy({ maxTokens: 2 })
    const state = reduceToState(
      [
        { type: 'INPUT_CHANGED', value: 'alpha' },
        { type: 'COMMIT_INPUT' },
        { type: 'INPUT_CHANGED', value: 'beta' },
        { type: 'COMMIT_INPUT' },
        { type: 'INPUT_CHANGED', value: 'gamma' },
        { type: 'COMMIT_INPUT' },
      ],
      policy,
    )

    expect(state.tokens.map((token) => token.keyword)).toEqual(['alpha', 'beta'])
    expect(state.status).toBe('max-token-reached')
    expect(state.errorCode).toBe('max-token-reached')
  })

  it('입력창이 비어 있을 때 Backspace를 누르면 마지막 토큰이 삭제된다', () => {
    const state = reduceToState([
      { type: 'INPUT_CHANGED', value: 'alpha' },
      { type: 'COMMIT_INPUT' },
      { type: 'INPUT_CHANGED', value: 'beta' },
      { type: 'COMMIT_INPUT' },
      { type: 'BACKSPACE' },
    ])

    expect(state.tokens.map((token) => token.keyword)).toEqual(['alpha'])
    expect(state.errorCode).toBeNull()
  })

  it('Blur 이벤트도 Enter와 동일하게 현재 입력을 확정한다', () => {
    const state = reduceToState([
      { type: 'FOCUS' },
      { type: 'INPUT_CHANGED', value: '  vite  ' },
      { type: 'BLUR' },
    ])

    expect(state.tokens).toHaveLength(1)
    expect(state.tokens[0].keyword).toBe('vite')
    expect(state.isFocused).toBe(false)
  })
})
