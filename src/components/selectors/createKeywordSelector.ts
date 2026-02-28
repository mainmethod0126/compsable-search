import type { KeywordSelectProps, SelectorInstance } from '../types'

export type CreateKeywordSelectorProps =
  | KeywordSelectProps
  | Omit<KeywordSelectProps, 'type'>

function normalizeKeywordSelectorProps(
  props: CreateKeywordSelectorProps,
): KeywordSelectProps {
  if ('type' in props) {
    return props
  }

  return {
    ...props,
    type: 'keyword',
  }
}

export function createKeywordSelector(
  id: string,
  props: CreateKeywordSelectorProps,
): SelectorInstance<'keyword'> {
  return {
    id,
    type: 'keyword',
    props: normalizeKeywordSelectorProps(props),
  }
}
