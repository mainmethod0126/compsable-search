import { describe, expect, it } from 'vitest'
import composableSearchCss from './components/ComposableSearch.css?raw'
import indexCss from './index.css?raw'

const TYPOGRAPHY_PROPERTIES = [
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
] as const

function extractRuleBody(css: string, selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`))
  return match?.[1] ?? ''
}

describe('style scope isolation', () => {
  it('앱 엔트리 스타일은 html/body/:root 전역 selector를 사용하지 않는다', () => {
    const css = indexCss

    expect(css).not.toMatch(/(^|\n)\s*html\b/m)
    expect(css).not.toMatch(/(^|\n)\s*body\b/m)
    expect(css).not.toMatch(/(^|\n)\s*:root\b/m)
  })

  it('컴포넌트 스타일은 cs- 네임스페이스만 사용하고 전역 element selector를 노출하지 않는다', () => {
    const css = composableSearchCss

    expect(css).not.toMatch(/(^|\n)\s*(button|input|section|ul|li|p|h3)\b/m)
    expect(css).toContain('.cs-composable-search')
    expect(css).toContain('.cs-selector-area')
    expect(css).toContain('.cs-region-item')
  })

  it('선택/hover 상태 스타일은 타이포그래피 속성을 재정의하지 않는다', () => {
    const css = composableSearchCss
    const stateSelectors = [
      '.cs-region-item.is-current',
      '.cs-region-item.has-descendant-selected',
      '.cs-region-item.is-current.has-descendant-selected',
      '.cs-region-item:hover',
      '.cs-checkable-item.is-selected',
      '.cs-checkable-item:hover',
    ]

    stateSelectors.forEach((selector) => {
      const ruleBody = extractRuleBody(css, selector)
      expect(ruleBody, `${selector} rule should exist`).not.toBe('')
      TYPOGRAPHY_PROPERTIES.forEach((property) => {
        expect(ruleBody).not.toContain(property)
      })
    })
  })

  it('대량 리스트 보호를 위해 컬럼/리스트 스크롤 및 overflow 제어 규칙을 제공한다', () => {
    const css = composableSearchCss
    const detailRule = extractRuleBody(css, '.cs-detailed-area')
    const columnRule = extractRuleBody(css, '.cs-region-column')
    const listRule = extractRuleBody(css, '.cs-region-column-list')
    const checkableListRule = extractRuleBody(css, '.cs-checkable-list')
    const selectedConditionScrollRule = extractRuleBody(
      css,
      '.cs-selected-condition-scroll',
    )

    expect(detailRule).toContain('overflow-x: hidden')
    expect(columnRule).toContain('min-height')
    expect(columnRule).toContain('overflow: hidden')
    expect(listRule).toContain('max-height')
    expect(listRule).toContain('overflow-y: auto')
    expect(checkableListRule).toContain('max-height')
    expect(checkableListRule).toContain('overflow-y: auto')
    expect(selectedConditionScrollRule).toContain('max-height')
    expect(selectedConditionScrollRule).toContain('overflow-y: auto')
    expect(css).toMatch(
      /@media\s*\(max-width:\s*768px\)[\s\S]*\.cs-selected-condition-scroll\s*\{[\s\S]*max-height/m,
    )
  })

  it('region/checkable item은 데이터 수와 무관하게 동일한 고정 높이 규칙을 가진다', () => {
    const css = composableSearchCss
    const rootRule = extractRuleBody(css, '.cs-composable-search')
    const regionItemRule = extractRuleBody(css, '.cs-region-item')
    const checkableItemRule = extractRuleBody(css, '.cs-checkable-item')

    expect(rootRule).toContain('--cs-region-column-item-height')
    expect(regionItemRule).toContain('height: var(--cs-region-column-item-height)')
    expect(checkableItemRule).toContain(
      'height: var(--cs-region-column-item-height)',
    )
  })
})
