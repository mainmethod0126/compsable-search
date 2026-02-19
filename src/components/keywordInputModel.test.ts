import { describe, expect, it } from 'vitest'
import {
  createInitialKeywordInputState,
  resolveKeywordPolicy,
  transitionKeywordInputState,
  type KeywordInputState,
} from './keywordInputModel'

function reduceToState(
  events: Array<Parameters<typeof transitionKeywordInputState>[1]>,
): KeywordInputState {
  const policy = resolveKeywordPolicy()
  return events.reduce(
    (state, event) => transitionKeywordInputState(state, event, policy),
    createInitialKeywordInputState(),
  )
}

describe('keywordInputModel', () => {
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
        keyword: 'react query',
        normalizedKeyword: 'react query',
        displayName: '키워드: react query',
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
    expect(state.errorCode).toBe('duplicate-token')
  })

  it('최대 토큰 수에 도달하면 max-token-reached 상태가 되고 추가 확정이 차단된다', () => {
    const policy = resolveKeywordPolicy({ maxTokens: 2 })
    const state = [
      { type: 'INPUT_CHANGED', value: 'alpha' } as const,
      { type: 'COMMIT_INPUT' } as const,
      { type: 'INPUT_CHANGED', value: 'beta' } as const,
      { type: 'COMMIT_INPUT' } as const,
      { type: 'INPUT_CHANGED', value: 'gamma' } as const,
      { type: 'COMMIT_INPUT' } as const,
    ].reduce(
      (currentState, event) =>
        transitionKeywordInputState(currentState, event, policy),
      createInitialKeywordInputState(),
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
