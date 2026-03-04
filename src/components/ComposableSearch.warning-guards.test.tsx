import { render } from '@testing-library/react'
import { ComposableSearch } from './ComposableSearch'
import { createKeywordSelector, createRegionSelector } from './selectors'
import type { AnySelectorPlugin } from './plugins'

function createKeywordSelectorInstance(id = 'keyword-main') {
  return createKeywordSelector(id, {
    options: {
      placeholder: '키워드 선택',
      label: '키워드 입력',
    },
  })
}

function createRegionSelectorInstance(id = 'region-main') {
  return createRegionSelector(id, {
    findAllSidos: () => [],
    findAllSigungus: () => [],
    findAllEupmyeondongs: () => [],
    options: {
      placeholder: '지역 선택',
    },
  })
}

function renderComposableSearchRuntimeProps(props: Record<string, unknown>) {
  return render(
    <ComposableSearch {...(props as unknown as Parameters<typeof ComposableSearch>[0])} />,
  )
}

function expectComposableSearchConfigError(
  renderComposableSearch: () => unknown,
  expectedCode: string,
) {
  const expectedErrorNotThrown = '__COMPOSABLE_SEARCH_CONFIG_ERROR_NOT_THROWN__'

  try {
    renderComposableSearch()
    throw new Error(expectedErrorNotThrown)
  } catch (error) {
    if (error instanceof Error && error.message === expectedErrorNotThrown) {
      throw error
    }

    expect(error).toBeInstanceOf(Error)

    const runtimeError = error as Error & { code?: unknown }
    expect(runtimeError.message).toContain(expectedCode)
    if (runtimeError.code !== undefined) {
      expect(String(runtimeError.code)).toBe(expectedCode)
    }
  }
}

describe('ComposableSearch strict configuration guards (0.5)', () => {
  it('selectors 누락이면 MISSING_SELECTORS 예외를 throw한다', () => {
    expectComposableSearchConfigError(
      () => renderComposableSearchRuntimeProps({}),
      'MISSING_SELECTORS',
    )
  })

  it('selectors 빈 배열이면 EMPTY_SELECTORS 예외를 throw한다', () => {
    expectComposableSearchConfigError(
      () => render(<ComposableSearch selectors={[]} />),
      'EMPTY_SELECTORS',
    )
  })

  it('selector type이 중복이면 DUPLICATE_SELECTOR_TYPE 예외를 throw한다', () => {
    expectComposableSearchConfigError(
      () =>
        render(
          <ComposableSearch
            selectors={[
              createRegionSelectorInstance('region-main'),
              createRegionSelectorInstance('region-duplicate'),
              createKeywordSelectorInstance('keyword-main'),
            ]}
          />,
        ),
      'DUPLICATE_SELECTOR_TYPE',
    )
  })

  it('plugin-selector type이 불일치하면 PLUGIN_SELECTOR_TYPE_MISMATCH 예외를 throw한다', () => {
    const mismatchPlugin: AnySelectorPlugin = {
      id: 'region-only-plugin',
      type: 'region',
    }

    expectComposableSearchConfigError(
      () =>
        render(
          <ComposableSearch
            selectors={[createKeywordSelectorInstance('keyword-main')]}
            plugins={{
              regionOnly: mismatchPlugin,
            }}
          />,
        ),
      'PLUGIN_SELECTOR_TYPE_MISMATCH',
    )
  })
})
