import { describe, expect, it } from 'vitest'
import composableSearchCss from './components/ComposableSearch.css?raw'
import indexCss from './index.css?raw'

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
})
