export type SelectorPluginHook = (...args: never[]) => unknown

export type SelectorPluginHookMap = Record<
  string,
  SelectorPluginHook | undefined
>

export interface SelectorPlugin<
  THooks extends SelectorPluginHookMap = SelectorPluginHookMap,
> {
  id: string
  hooks: THooks
}
