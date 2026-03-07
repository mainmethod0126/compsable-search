import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MAX_KEYWORD_TOKENS,
  createInitialKeywordInputState,
  createKeywordSelector,
} from '../src/index'

describe('@compsable-search/selector-keyword facade', () => {
  it('exports the keyword selector factory and input helpers', () => {
    const selector = createKeywordSelector('keyword-main', {
      options: {
        placeholder: '키워드 선택',
      },
    })

    expect(selector.id).toBe('keyword-main')
    expect(selector.type).toBe('keyword')
    expect(createInitialKeywordInputState().tokens).toHaveLength(0)
    expect(DEFAULT_MAX_KEYWORD_TOKENS).toBeGreaterThan(0)
  })
})
