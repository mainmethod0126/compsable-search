import { describe, expect, it } from 'vitest'
import {
  DEFAULT_KEYWORD_SELECTOR_ID,
  DEFAULT_MAX_KEYWORD_TOKENS,
  createInitialKeywordInputState,
  createKeywordSelector,
  resolveKeywordPolicy,
} from '../src/index'

describe('@compsable-search/selector-keyword package', () => {
  it('로컬 keyword selector factory와 input helper를 export한다', () => {
    const selector = createKeywordSelector('keyword-main', {
      options: {
        placeholder: '키워드 선택',
      },
    })

    expect(selector.id).toBe('keyword-main')
    expect(selector.type).toBe('keyword')
    expect(selector.driver.getTriggerLabel(selector.props)).toBe('키워드 선택')
    expect(createInitialKeywordInputState().tokens).toHaveLength(0)
    expect(DEFAULT_MAX_KEYWORD_TOKENS).toBeGreaterThan(0)
    expect(resolveKeywordPolicy().selectorId).toBe(DEFAULT_KEYWORD_SELECTOR_ID)
  })

  it('createKeywordSelector는 version과 driver override를 지원한다', () => {
    const customDriver = {
      type: 'keyword' as const,
      getTriggerLabel: () => '커스텀 키워드 선택',
      renderPanel: () => null,
    }

    const selector = createKeywordSelector(
      'keyword-custom',
      {
        options: {
          placeholder: '기본 라벨',
        },
      },
      {
        version: '2026-03',
        driver: customDriver,
      },
    )

    expect(selector.version).toBe('2026-03')
    expect(selector.driver).toBe(customDriver)
    expect(selector.driver.getTriggerLabel(selector.props)).toBe(
      '커스텀 키워드 선택',
    )
  })
})
