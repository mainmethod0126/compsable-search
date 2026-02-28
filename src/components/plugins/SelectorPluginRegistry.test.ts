import { describe, expect, it } from 'vitest'
import type { SelectorPlugin } from './SelectorPlugin'
import {
  createSelectorPluginRegistry,
  getAllSelectorPlugins,
  getSelectorPlugin,
  validateSelectorPluginRegistry,
} from './SelectorPluginRegistry'
import { SELECTOR_PLUGIN_VALIDATION_CODE } from './pluginValidation'

function createPlugin(
  id: string,
  hooks: SelectorPlugin['hooks'],
): SelectorPlugin {
  return {
    id,
    hooks,
  }
}

describe('SelectorPluginRegistry', () => {
  it('create/get/getAll 유틸로 플러그인을 조회한다', () => {
    const regionPlugin = createPlugin('region', {
      setup: () => undefined,
    })
    const keywordPlugin = createPlugin('keyword', {
      setup: () => undefined,
    })
    const registry = createSelectorPluginRegistry([regionPlugin, keywordPlugin])

    expect(getSelectorPlugin(registry, 'region')).toBe(regionPlugin)
    expect(getSelectorPlugin(registry, 'keyword')).toBe(keywordPlugin)
    expect(getSelectorPlugin(registry, 'unknown')).toBeUndefined()
    expect(getAllSelectorPlugins(registry)).toEqual([regionPlugin, keywordPlugin])
  })

  it('중복 id 플러그인을 검증에서 감지한다', () => {
    const primaryRegionPlugin = createPlugin('region', {
      setup: () => undefined,
    })
    const duplicateRegionPlugin = createPlugin('region', {
      setup: () => undefined,
    })
    const registry = createSelectorPluginRegistry([
      primaryRegionPlugin,
      duplicateRegionPlugin,
    ])

    const validationResult = validateSelectorPluginRegistry(registry)

    expect(validationResult.isValid).toBe(false)
    expect(validationResult.issues).toContainEqual(
      expect.objectContaining({
        code: SELECTOR_PLUGIN_VALIDATION_CODE.DUPLICATE_PLUGIN_ID,
        pluginId: 'region',
      }),
    )
  })

  it('등록되지 않은 unknown plugin id를 감지한다', () => {
    const regionPlugin = createPlugin('region', {
      setup: () => undefined,
    })
    const registry = createSelectorPluginRegistry([regionPlugin])

    const validationResult = validateSelectorPluginRegistry(registry, {
      enabledPluginIds: ['region', 'keyword'],
    })

    expect(validationResult.isValid).toBe(false)
    expect(validationResult.issues).toContainEqual(
      expect.objectContaining({
        code: SELECTOR_PLUGIN_VALIDATION_CODE.UNKNOWN_PLUGIN,
        pluginId: 'keyword',
      }),
    )
  })

  it('필수 훅이 없는 플러그인을 감지한다', () => {
    const regionPlugin = createPlugin('region', {
      setup: () => undefined,
    })
    const keywordPlugin = createPlugin('keyword', {})
    const registry = createSelectorPluginRegistry([regionPlugin, keywordPlugin])

    const validationResult = validateSelectorPluginRegistry(registry, {
      requiredHooks: ['setup'],
    })

    expect(validationResult.isValid).toBe(false)
    expect(validationResult.issues).toContainEqual(
      expect.objectContaining({
        code: SELECTOR_PLUGIN_VALIDATION_CODE.MISSING_REQUIRED_HOOK,
        pluginId: 'keyword',
        hookName: 'setup',
      }),
    )
  })

  it('요구된 플러그인/필수 훅이 모두 충족되면 검증을 통과한다', () => {
    const regionPlugin = createPlugin('region', {
      setup: () => undefined,
    })
    const keywordPlugin = createPlugin('keyword', {
      setup: () => undefined,
    })
    const registry = createSelectorPluginRegistry([regionPlugin, keywordPlugin])

    const validationResult = validateSelectorPluginRegistry(registry, {
      enabledPluginIds: ['region', 'keyword'],
      requiredHooks: ['setup'],
    })

    expect(validationResult).toEqual({
      isValid: true,
      issues: [],
    })
  })
})
