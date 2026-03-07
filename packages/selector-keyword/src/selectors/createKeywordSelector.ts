import { DEFAULT_KEYWORD_SELECTOR_DRIVER } from '../drivers/keywordDriver'
import type {
  KeywordSelectorDefinition,
  KeywordSelectorDriver,
  KeywordSelectorProps,
} from '../types'
import { createSelector } from './createSelector'

export interface CreateKeywordSelectorOptions {
  driver?: KeywordSelectorDriver
  version?: string | number
}

export function createKeywordSelector(
  id: string,
  props: KeywordSelectorProps,
  options: CreateKeywordSelectorOptions = {},
): KeywordSelectorDefinition {
  return createSelector({
    id,
    type: 'keyword',
    version: options.version,
    props,
    driver: options.driver ?? DEFAULT_KEYWORD_SELECTOR_DRIVER,
  })
}
