import type {
  PanelOpenChangeEvent,
  ResolvedSelectorPluginBinding,
  ResolvedSelectorPluginTarget,
  SelectionChangeEvent,
  SelectorDefinition,
  SelectorPlugin,
  SelectorPluginErrorEvent,
} from './types'

const DEFAULT_PLUGIN_VERSION = '0'

function normalizeSelectorIds(selectorIds: readonly string[]): string[] {
  return [...new Set(selectorIds)].sort()
}

function normalizeError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

function resolveTargetSelectors(
  selectors: readonly SelectorDefinition[],
  plugin: SelectorPlugin,
): SelectorDefinition[] {
  const target = plugin.target
  if (!target || target.kind === 'all') {
    return [...selectors]
  }

  if (target.kind === 'selectorIds') {
    const selectorIdSet = new Set(target.selectorIds)
    return selectors.filter((selector) => selectorIdSet.has(selector.id))
  }

  const selectorTypeSet = new Set(target.selectorTypes)
  return selectors.filter((selector) => selectorTypeSet.has(selector.type))
}

function resolveBindingTarget(
  selectors: readonly SelectorDefinition[],
): ResolvedSelectorPluginTarget {
  return {
    selectorIds: normalizeSelectorIds(selectors.map((selector) => selector.id)),
    selectorTypes: [...new Set(selectors.map((selector) => selector.type))].sort(),
  }
}

function createPluginErrorEvent(
  binding: ResolvedSelectorPluginBinding,
  sourceHookName: SelectorPluginErrorEvent['sourceHookName'],
  error: unknown,
): SelectorPluginErrorEvent {
  return {
    pluginId: binding.plugin.id,
    bindingKey: binding.bindingKey,
    selectorId: binding.selector.id,
    selectorType: binding.selector.type,
    sourceHookName,
    error: normalizeError(error),
  }
}

function reportExternalError(
  onError: ((event: SelectorPluginErrorEvent) => void) | undefined,
  event: SelectorPluginErrorEvent,
): void {
  if (!onError) {
    return
  }

  try {
    onError(event)
  } catch {
    // 외부 관측 지점 오류는 런타임을 중단시키지 않는다.
  }
}

function handleHookError(
  binding: ResolvedSelectorPluginBinding,
  sourceHookName: SelectorPluginErrorEvent['sourceHookName'],
  error: unknown,
  onError?: (event: SelectorPluginErrorEvent) => void,
): void {
  const event = createPluginErrorEvent(binding, sourceHookName, error)
  if (sourceHookName === 'onError') {
    reportExternalError(onError, event)
    return
  }

  if (!binding.plugin.onError) {
    reportExternalError(onError, event)
    return
  }

  try {
    binding.plugin.onError(event)
  } catch (onErrorFailure) {
    reportExternalError(
      onError,
      createPluginErrorEvent(binding, 'onError', onErrorFailure),
    )
  }

  reportExternalError(onError, event)
}

function executeHook<TArg>(
  binding: ResolvedSelectorPluginBinding,
  hookName: 'onInit' | 'onDispose' | 'onSelectionChange' | 'onPanelOpenChange',
  callback: ((arg: TArg) => void) | undefined,
  arg: TArg,
  onError?: (event: SelectorPluginErrorEvent) => void,
): void {
  if (!callback) {
    return
  }

  try {
    callback(arg)
  } catch (error) {
    handleHookError(binding, hookName, error, onError)
  }
}

export function createSelectorPluginBindingKey(
  plugin: Pick<SelectorPlugin, 'id' | 'version'>,
  resolvedTarget: { selectorIds: readonly string[] },
): string {
  const normalizedVersion =
    plugin.version === undefined || plugin.version === null
      ? DEFAULT_PLUGIN_VERSION
      : String(plugin.version)
  const normalizedTarget = normalizeSelectorIds(resolvedTarget.selectorIds)

  return `${plugin.id}@${normalizedVersion}:${normalizedTarget.join(',') || 'none'}`
}

export function resolveSelectorPluginBindings(
  selectors: readonly SelectorDefinition[],
  plugins: readonly SelectorPlugin[],
): ResolvedSelectorPluginBinding[] {
  return plugins.flatMap((plugin) => {
    const targetSelectors = resolveTargetSelectors(selectors, plugin)
    const resolvedTarget = resolveBindingTarget(targetSelectors)
    const bindingKey = createSelectorPluginBindingKey(plugin, resolvedTarget)

    return targetSelectors.map((selector) => ({
      bindingKey,
      plugin,
      selector,
      resolvedTarget,
    }))
  })
}

export function dispatchPluginLifecycle(
  binding: ResolvedSelectorPluginBinding,
  hookName: 'onInit' | 'onDispose',
  onError?: (event: SelectorPluginErrorEvent) => void,
): void {
  executeHook(
    binding,
    hookName,
    binding.plugin[hookName],
    {
      bindingKey: binding.bindingKey,
      selector: binding.selector,
      resolvedTarget: binding.resolvedTarget,
    },
    onError,
  )
}

export function dispatchPluginSelectionChange(
  bindings: readonly ResolvedSelectorPluginBinding[],
  event: SelectionChangeEvent,
  onError?: (event: SelectorPluginErrorEvent) => void,
): void {
  const targetBindings = event.meta.selectorId
    ? bindings.filter((binding) => binding.selector.id === event.meta.selectorId)
    : bindings

  targetBindings.forEach((binding) => {
    executeHook(
      binding,
      'onSelectionChange',
      binding.plugin.onSelectionChange,
      event,
      onError,
    )
  })
}

export function dispatchPluginPanelOpenChange(
  bindings: readonly ResolvedSelectorPluginBinding[],
  event: PanelOpenChangeEvent,
  onError?: (event: SelectorPluginErrorEvent) => void,
): void {
  const targetSelectorIds = new Set(
    [event.previousSelectorId, event.currentSelectorId].filter(
      (selectorId): selectorId is string => typeof selectorId === 'string' && selectorId.length > 0,
    ),
  )

  if (targetSelectorIds.size === 0) {
    return
  }

  bindings
    .filter((binding) => targetSelectorIds.has(binding.selector.id))
    .forEach((binding) => {
      executeHook(
        binding,
        'onPanelOpenChange',
        binding.plugin.onPanelOpenChange,
        event,
        onError,
      )
    })
}
