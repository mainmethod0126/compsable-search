import { describe, expect, it } from 'vitest'
import {
  createSelectorPluginBindingKey,
  type SelectorPlugin,
} from './SelectorPlugin'
import {
  createSelectorPluginRegistry,
  getAllSelectorPlugins,
  getSelectorPlugin,
  validateSelectorPluginRegistry,
} from './SelectorPluginRegistry'
import { SELECTOR_PLUGIN_VALIDATION_CODE } from './pluginValidation'

type SelectorPluginType = SelectorPlugin['type']
type ConcreteSelectorPluginType = Exclude<SelectorPluginType, undefined>

function createPlugin<TType extends ConcreteSelectorPluginType>(
  id: string,
  type: TType,
  hooks: Pick<SelectorPlugin<TType>, 'onInit' | 'onDispose'> = {},
): SelectorPlugin<TType> {
  return {
    id,
    type,
    ...hooks,
  }
}

describe('SelectorPluginRegistry', () => {
  it('plugin 바인딩 키는 id+version 조합으로 안정적으로 계산된다', () => {
    expect(createSelectorPluginBindingKey({ id: 'region-telemetry' })).toBe(
      'region-telemetry@0',
    )
    expect(
      createSelectorPluginBindingKey({
        id: 'region-telemetry',
        version: 'v2',
      }),
    ).toBe('region-telemetry@v2')
    expect(
      createSelectorPluginBindingKey({
        id: 'region-telemetry',
        version: 3,
      }),
    ).toBe('region-telemetry@3')
  })

  it('create/get/getAll 유틸로 플러그인을 조회한다', () => {
    const regionPlugin = createPlugin('region', 'region')
    const keywordPlugin = createPlugin('keyword', 'keyword')
    const registry = createSelectorPluginRegistry([regionPlugin, keywordPlugin])

    expect(getSelectorPlugin(registry, 'region')).toBe(regionPlugin)
    expect(getSelectorPlugin(registry, 'keyword')).toBe(keywordPlugin)
    expect(getSelectorPlugin(registry, 'unknown')).toBeUndefined()
    expect(getAllSelectorPlugins(registry)).toEqual([regionPlugin, keywordPlugin])
  })

  it('중복 id 플러그인을 검증에서 감지한다', () => {
    const primaryRegionPlugin = createPlugin('region', 'region')
    const duplicateRegionPlugin = createPlugin('region', 'region')
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
    const regionPlugin = createPlugin('region', 'region')
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
    const regionPlugin = createPlugin('region', 'region', {
      onInit: () => undefined,
    })
    const keywordPlugin = createPlugin('keyword', 'keyword')
    const registry = createSelectorPluginRegistry([regionPlugin, keywordPlugin])

    const validationResult = validateSelectorPluginRegistry(registry, {
      requiredHooks: ['onInit'],
    })

    expect(validationResult.isValid).toBe(false)
    expect(validationResult.issues).toContainEqual(
      expect.objectContaining({
        code: SELECTOR_PLUGIN_VALIDATION_CODE.MISSING_REQUIRED_HOOK,
        pluginId: 'keyword',
        hookName: 'onInit',
      }),
    )
  })

  it('요구된 플러그인/필수 훅이 모두 충족되면 검증을 통과한다', () => {
    const regionPlugin = createPlugin('region', 'region', {
      onInit: () => undefined,
    })
    const keywordPlugin = createPlugin('keyword', 'keyword', {
      onInit: () => undefined,
    })
    const registry = createSelectorPluginRegistry([regionPlugin, keywordPlugin])

    const validationResult = validateSelectorPluginRegistry(registry, {
      enabledPluginIds: ['region', 'keyword'],
      requiredHooks: ['onInit'],
    })

    expect(validationResult).toEqual({
      isValid: true,
      issues: [],
    })
  })

  it('필수 훅이 함수가 아니면 검증에서 감지한다', () => {
    const regionPlugin = createPlugin('region', 'region', {
      onInit: 'not-a-function' as unknown as () => unknown,
    })
    const registry = createSelectorPluginRegistry([regionPlugin])

    const validationResult = validateSelectorPluginRegistry(registry, {
      requiredHooks: ['onInit'],
    })

    expect(validationResult.isValid).toBe(false)
    expect(validationResult.issues).toContainEqual(
      expect.objectContaining({
        code: SELECTOR_PLUGIN_VALIDATION_CODE.MISSING_REQUIRED_HOOK,
        pluginId: 'region',
        hookName: 'onInit',
      }),
    )
  })

  it('V2 이벤트 훅도 requiredHooks 검증 대상으로 동작한다', () => {
    const regionPlugin = createPlugin('region', 'region', {
      onInit: () => undefined,
    })
    const registry = createSelectorPluginRegistry([regionPlugin])

    const validationResult = validateSelectorPluginRegistry(registry, {
      requiredHooks: ['onSelectionChange'],
    })

    expect(validationResult.isValid).toBe(false)
    expect(validationResult.issues).toContainEqual(
      expect.objectContaining({
        code: SELECTOR_PLUGIN_VALIDATION_CODE.MISSING_REQUIRED_HOOK,
        pluginId: 'region',
        hookName: 'onSelectionChange',
      }),
    )
  })
})
