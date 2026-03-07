import { describe, expect, it } from 'vitest'
import {
  assertComposableSearchConfiguration,
  COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE,
  validateComposableSearchConfiguration,
} from '../src'
import type { SelectionItem, SelectorDefinition, SelectorPlugin } from '../src'

function createSelector(id: string, type: string): SelectorDefinition {
  return {
    id,
    type,
  }
}

describe('validateComposableSearchConfiguration', () => {
  it('selectors가 누락되면 MISSING_SELECTORS를 반환한다', () => {
    const result = validateComposableSearchConfiguration({})

    expect(result.isValid).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.MISSING_SELECTORS,
      }),
    )
  })

  it('selectors가 빈 배열이면 EMPTY_SELECTORS를 반환한다', () => {
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

  it('동일 selector.type 중복은 허용하고 selector.id 중복만 차단한다', () => {
    const result = validateComposableSearchConfiguration({
      selectors: [
        createSelector('region-main', 'region'),
        createSelector('region-secondary', 'region'),
      ],
    })

    expect(result).toEqual({
      isValid: true,
      issues: [],
    })

    const duplicatedIdResult = validateComposableSearchConfiguration({
      selectors: [
        createSelector('region-main', 'region'),
        createSelector('region-main', 'keyword'),
      ],
    })

    expect(duplicatedIdResult.isValid).toBe(false)
    expect(duplicatedIdResult.issues).toContainEqual(
      expect.objectContaining({
        code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.DUPLICATE_SELECTOR_ID,
        cause: expect.objectContaining({
          selectorId: 'region-main',
        }),
      }),
    )
  })

  it('존재하지 않는 selectorIds/selectorTypes target을 UNKNOWN_PLUGIN_TARGET으로 반환한다', () => {
    const plugins: SelectorPlugin[] = [
      {
        id: 'target-by-id',
        target: {
          kind: 'selectorIds',
          selectorIds: ['unknown-selector'],
        },
      },
      {
        id: 'target-by-type',
        target: {
          kind: 'selectorTypes',
          selectorTypes: ['missing-type'],
        },
      },
    ]

    const result = validateComposableSearchConfiguration({
      selectors: [createSelector('region-main', 'region')],
      plugins,
    })

    expect(result.isValid).toBe(false)
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.UNKNOWN_PLUGIN_TARGET,
          cause: expect.objectContaining({
            pluginId: 'target-by-id',
            targetKind: 'selectorIds',
            missingTargets: ['unknown-selector'],
          }),
        }),
        expect.objectContaining({
          code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.UNKNOWN_PLUGIN_TARGET,
          cause: expect.objectContaining({
            pluginId: 'target-by-type',
            targetKind: 'selectorTypes',
            missingTargets: ['missing-type'],
          }),
        }),
      ]),
    )
  })

  it('value/defaultValue에 selectorId 누락 항목이 있으면 MISSING_SELECTION_SELECTOR_ID를 반환한다', () => {
    const missingOwnerItem = {
      id: 'broken-item',
      displayName: 'broken-item',
    } as unknown as SelectionItem

    const result = validateComposableSearchConfiguration({
      selectors: [createSelector('region-main', 'region')],
      value: [missingOwnerItem],
      defaultValue: [missingOwnerItem],
    })

    expect(result.isValid).toBe(false)
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.MISSING_SELECTION_SELECTOR_ID,
          cause: expect.objectContaining({
            location: 'value',
            itemIds: ['broken-item'],
          }),
        }),
        expect.objectContaining({
          code: COMPOSABLE_SEARCH_CONFIGURATION_ERROR_CODE.MISSING_SELECTION_SELECTOR_ID,
          cause: expect.objectContaining({
            location: 'defaultValue',
            itemIds: ['broken-item'],
          }),
        }),
      ]),
    )
  })

  it('assert는 첫 이슈를 런타임 에러 형태로 throw한다', () => {
    expect(() =>
      assertComposableSearchConfiguration({
        selectors: [createSelector('dup', 'region'), createSelector('dup', 'keyword')],
      }),
    ).toThrowError(/\[DUPLICATE_SELECTOR_ID\]/)
  })
})
