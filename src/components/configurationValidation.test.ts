import { describe, expect, it } from 'vitest'
import type { SelectorDefinition, SelectorPluginRegistry } from './types'
import {
  assertComposableSearchConfiguration,
  COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE,
  ComposableSearchConfigurationError,
  validateComposableSearchConfiguration,
} from './configurationValidation'

function createSelector(
  id: string,
  type: string,
): SelectorDefinition<Record<string, never>, string> {
  return {
    id,
    type,
    props: {},
    driver: {
      type,
      getTriggerLabel: () => `${type} selector`,
      renderPanel: () => null,
    },
  }
}

describe('configurationValidation', () => {
  it('selectors가 누락되면 MISSING_SELECTORS 이슈를 반환한다', () => {
    const result = validateComposableSearchConfiguration({})

    expect(result.isValid).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.MISSING_SELECTORS,
      }),
    )
  })

  it('selectors가 빈 배열이면 EMPTY_SELECTORS 이슈를 반환한다', () => {
    const result = validateComposableSearchConfiguration({
      selectors: [],
    })

    expect(result.isValid).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.EMPTY_SELECTORS,
      }),
    )
  })

  it('동일 selector type 중복을 DUPLICATE_SELECTOR_TYPE으로 감지한다', () => {
    const result = validateComposableSearchConfiguration({
      selectors: [
        createSelector('region-main', 'region'),
        createSelector('region-secondary', 'region'),
        createSelector('keyword-main', 'keyword'),
      ],
    })

    expect(result.isValid).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.DUPLICATE_SELECTOR_TYPE,
        cause: expect.objectContaining({
          selectorType: 'region',
          selectorIds: ['region-main', 'region-secondary'],
        }),
      }),
    )
  })

  it('plugin type이 selector type과 매칭되지 않으면 PLUGIN_SELECTOR_TYPE_MISMATCH를 반환한다', () => {
    const plugins: SelectorPluginRegistry = {
      regionOnlyPlugin: {
        id: 'region-only-plugin',
        type: 'region',
      },
    }

    const result = validateComposableSearchConfiguration({
      selectors: [createSelector('keyword-main', 'keyword')],
      plugins,
    })

    expect(result.isValid).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.PLUGIN_SELECTOR_TYPE_MISMATCH,
        cause: expect.objectContaining({
          pluginId: 'region-only-plugin',
          pluginType: 'region',
          availableSelectorTypes: ['keyword'],
        }),
      }),
    )
  })

  it('구성이 유효하면 isValid=true와 빈 issues를 반환한다', () => {
    const plugins: SelectorPluginRegistry = {
      regionOnlyPlugin: {
        id: 'region-only-plugin',
        type: 'region',
      },
      keywordOnlyPlugin: {
        id: 'keyword-only-plugin',
        type: 'keyword',
      },
    }

    const result = validateComposableSearchConfiguration({
      selectors: [
        createSelector('region-main', 'region'),
        createSelector('keyword-main', 'keyword'),
      ],
      plugins,
    })

    expect(result).toEqual({
      isValid: true,
      issues: [],
    })
  })

  it.each([
    {
      name: 'MISSING_SELECTORS',
      config: {},
      expectedCode: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.MISSING_SELECTORS,
    },
    {
      name: 'EMPTY_SELECTORS',
      config: {
        selectors: [],
      },
      expectedCode: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.EMPTY_SELECTORS,
    },
    {
      name: 'DUPLICATE_SELECTOR_TYPE',
      config: {
        selectors: [
          createSelector('region-main', 'region'),
          createSelector('region-secondary', 'region'),
        ],
      },
      expectedCode:
        COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.DUPLICATE_SELECTOR_TYPE,
    },
    {
      name: 'PLUGIN_SELECTOR_TYPE_MISMATCH',
      config: {
        selectors: [createSelector('keyword-main', 'keyword')],
        plugins: {
          regionOnlyPlugin: {
            id: 'region-only-plugin',
            type: 'region',
          },
        } as SelectorPluginRegistry,
      },
      expectedCode:
        COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.PLUGIN_SELECTOR_TYPE_MISMATCH,
    },
  ])(
    'assertComposableSearchConfiguration은 $name 오류를 코드/원인/해결가이드와 함께 throw한다',
    ({ config, expectedCode }) => {
      try {
        assertComposableSearchConfiguration(config)
        throw new Error('assertComposableSearchConfiguration should throw')
      } catch (error) {
        expect(error).toBeInstanceOf(ComposableSearchConfigurationError)

        const configurationError = error as ComposableSearchConfigurationError
        expect(configurationError.code).toBe(expectedCode)
        expect(configurationError.causeContext).toBeDefined()
        expect(configurationError.guide).toBeTruthy()
        expect(configurationError.message).toContain(`[${expectedCode}]`)
        expect(configurationError.message).toContain('원인:')
        expect(configurationError.message).toContain('해결 가이드:')
      }
    },
  )
})
