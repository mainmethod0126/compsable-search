import { describe, expect, it } from 'vitest'
import type { SelectorDefinition } from './publicTypes'
import {
  COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE,
  ComposableSearchConfigurationError,
  assertComposableSearchConfiguration,
  validateComposableSearchConfiguration,
} from './configurationValidation'
import * as selectorTypeUtils from './selectorTypeUtils'
import * as componentsIndex from './index'
import * as rootIndex from '../index'
import type {
  ComposableSearchConfigErrorCode as ComponentsConfigErrorCode,
  ComposableSearchConfigurationErrorCode as ComponentsConfigurationErrorCode,
} from './index'
import type {
  ComposableSearchConfigErrorCode as RootConfigErrorCode,
  ComposableSearchConfigurationErrorCode as RootConfigurationErrorCode,
} from '../index'

function createSelectorDefinition<TType extends string>(
  id: string,
  type: TType,
): SelectorDefinition<unknown, TType> {
  return {
    id,
    type,
    props: { id, type },
    driver: {
      type,
      getTriggerLabel: () => `${type} selector`,
      renderPanel: () => null,
    },
  }
}

describe('public API exports contract', () => {
  it('root/components 엔트리는 동일한 runtime export 집합을 보장한다', () => {
    const rootExportKeys = Object.keys(rootIndex).sort()
    const componentsExportKeys = Object.keys(componentsIndex).sort()

    expect(rootExportKeys).toEqual(componentsExportKeys)
    expect(rootExportKeys).toEqual(
      expect.arrayContaining([
        'validateComposableSearchConfiguration',
        'assertComposableSearchConfiguration',
        'ComposableSearchConfigError',
        'resolveSelectorByType',
        'resolveSelectorsWithPolicy',
        'validateSelectorTypeUniqueness',
      ]),
    )
  })

  it('WS1 configurationValidation 모듈 export를 root/components 엔트리에서 동일 참조로 제공한다', () => {
    const configErrorCode: RootConfigErrorCode = 'DUPLICATE_SELECTOR_TYPE'
    const configErrorCodeFromComponents: ComponentsConfigErrorCode = configErrorCode
    const fullNameCodeFromRoot: RootConfigurationErrorCode = configErrorCode
    const fullNameCodeFromComponents: ComponentsConfigurationErrorCode =
      configErrorCodeFromComponents

    expect(configErrorCodeFromComponents).toBe(configErrorCode)
    expect(fullNameCodeFromRoot).toBe(configErrorCode)
    expect(fullNameCodeFromComponents).toBe(configErrorCode)

    expect(rootIndex.validateComposableSearchConfiguration).toBe(
      validateComposableSearchConfiguration,
    )
    expect(componentsIndex.validateComposableSearchConfiguration).toBe(
      validateComposableSearchConfiguration,
    )
    expect(rootIndex.assertComposableSearchConfiguration).toBe(
      assertComposableSearchConfiguration,
    )
    expect(componentsIndex.assertComposableSearchConfiguration).toBe(
      assertComposableSearchConfiguration,
    )
    expect(rootIndex.ComposableSearchConfigurationError).toBe(
      ComposableSearchConfigurationError,
    )
    expect(componentsIndex.ComposableSearchConfigError).toBe(
      ComposableSearchConfigurationError,
    )
  })

  it('validate API와 selector 유틸 조합이 strict 정책에서 동일 계약을 보장한다', () => {
    const selectors: SelectorDefinition[] = [
      createSelectorDefinition('region-primary', 'region'),
      createSelectorDefinition('region-secondary', 'region'),
      createSelectorDefinition('keyword-primary', 'keyword'),
    ]

    const validateResult = rootIndex.validateComposableSearchConfiguration({
      selectors,
    })
    const duplicates = componentsIndex.validateSelectorTypeUniqueness(selectors)

    expect(validateResult.isValid).toBe(false)
    expect(validateResult.issues).toContainEqual(
      expect.objectContaining({
        code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.DUPLICATE_SELECTOR_TYPE,
      }),
    )
    expect(duplicates).toEqual([{ selectorType: 'region', count: 2 }])
    expect(rootIndex.resolveSelectorsWithPolicy).toBe(
      selectorTypeUtils.resolveSelectorsWithPolicy,
    )

    expect(() => rootIndex.resolveSelectorsWithPolicy(selectors)).toThrowError(
      ComposableSearchConfigurationError,
    )

    try {
      rootIndex.resolveSelectorsWithPolicy(selectors)
    } catch (error) {
      const configurationError = error as ComposableSearchConfigurationError
      expect(configurationError.code).toBe(
        COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.DUPLICATE_SELECTOR_TYPE,
      )
    }

    expect(() => rootIndex.assertComposableSearchConfiguration({ selectors })).toThrowError(
      ComposableSearchConfigurationError,
    )
  })
})
