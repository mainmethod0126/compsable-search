/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useState, type KeyboardEventHandler } from 'react'
import { KeywordDetailPanel } from '../KeywordDetailPanel'
import {
  createInitialKeywordInputState,
  hasSameKeywordTokenSequence,
  normalizeKeywordInput,
  resolveKeywordInputErrorMessage,
  resolveKeywordPolicy,
  transitionKeywordInputState,
  type KeywordInputEvent,
} from '../keywordInputModel'
import type {
  KeywordInputErrorCode,
  KeywordInvalidTokenContext,
  KeywordSelectOptions,
  KeywordSelectorDriver,
  KeywordSelectorProps,
  SelectionItem,
  SelectorPanelProps,
  SelectedKeywordCondition,
} from '../types'

const KEYWORD_TRIGGER_PLACEHOLDER = '키워드 선택'
const KEYWORD_INPUT_LABEL = '키워드 입력'
const KEYWORD_INPUT_GUIDE_TEXT =
  'Enter로 키워드 확정, 입력이 비었을 때 Backspace로 마지막 키워드 삭제'
const KEYWORD_INPUT_PLACEHOLDER = '키워드를 입력해 주세요.'

function dispatchKeywordInvalidToken(
  options: KeywordSelectOptions | undefined,
  emitError: (error: unknown) => void,
  errorCode: KeywordInputErrorCode,
  context: KeywordInvalidTokenContext,
): void {
  if (!options?.onInvalidToken) {
    return
  }

  try {
    options.onInvalidToken(errorCode, context)
  } catch (error) {
    emitError(error)
  }
}

function isKeywordSelectionItem(
  item: SelectionItem,
): item is SelectedKeywordCondition {
  return 'normalizedKeyword' in item
}

function KeywordPanel({
  selectorId,
  props: selectorProps,
  selectedItems,
  setSelectedItems,
  emitError,
}: SelectorPanelProps<KeywordSelectorProps, SelectionItem>) {
  const keywordPolicy = resolveKeywordPolicy(selectorProps.options, selectorId)
  const keywordSelectedItems = selectedItems.filter(isKeywordSelectionItem)
  const selectedItemsRef = useRef(keywordSelectedItems)

  useEffect(() => {
    selectedItemsRef.current = keywordSelectedItems
  }, [keywordSelectedItems])

  const [keywordInputState, setKeywordInputState] = useState(() => ({
    ...createInitialKeywordInputState(),
    tokens: keywordSelectedItems,
  }))

  const applyKeywordInputEvent = (event: KeywordInputEvent) => {
    const stateBase = hasSameKeywordTokenSequence(
      keywordInputState.tokens,
      selectedItemsRef.current,
    )
      ? keywordInputState
      : {
          ...keywordInputState,
          tokens: selectedItemsRef.current,
        }
    const next = transitionKeywordInputState(stateBase, event, keywordPolicy)

    if (next.errorCode && next.errorCode !== stateBase.errorCode) {
      dispatchKeywordInvalidToken(selectorProps.options, emitError, next.errorCode, {
        inputValue: stateBase.inputValue,
        normalizedValue: normalizeKeywordInput(stateBase.inputValue, keywordPolicy),
        maxTokens: keywordPolicy.maxTokens,
        maxTokenLength: keywordPolicy.maxTokenLength,
      })
    }

    setKeywordInputState(next)

    if (!hasSameKeywordTokenSequence(stateBase.tokens, next.tokens)) {
      try {
        setSelectedItems(next.tokens as SelectedKeywordCondition[])
      } catch (error) {
        emitError(error)
      }
    }
  }

  const handleKeywordInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      applyKeywordInputEvent({ type: 'COMMIT_INPUT' })
      return
    }

    if (event.key === 'Backspace' && keywordInputState.inputValue.length === 0) {
      event.preventDefault()
      applyKeywordInputEvent({ type: 'BACKSPACE' })
    }
  }

  return (
    <KeywordDetailPanel
      errorMessage={resolveKeywordInputErrorMessage(keywordInputState.errorCode, keywordPolicy)}
      guideText={selectorProps.options?.guideText ?? KEYWORD_INPUT_GUIDE_TEXT}
      inputPlaceholder={
        selectorProps.options?.inputPlaceholder ?? KEYWORD_INPUT_PLACEHOLDER
      }
      inputValue={keywordInputState.inputValue}
      label={selectorProps.options?.label ?? KEYWORD_INPUT_LABEL}
      maxTokens={keywordPolicy.maxTokens}
      tokenCount={keywordSelectedItems.length}
      tokens={keywordSelectedItems}
      onClearAllTokens={() => applyKeywordInputEvent({ type: 'CLEAR_ALL' })}
      onInputBlur={() => applyKeywordInputEvent({ type: 'BLUR' })}
      onInputChange={(value) =>
        applyKeywordInputEvent({ type: 'INPUT_CHANGED', value })
      }
      onInputFocus={() => applyKeywordInputEvent({ type: 'FOCUS' })}
      onInputKeyDown={handleKeywordInputKeyDown}
      onRemoveToken={(tokenId) =>
        applyKeywordInputEvent({ type: 'REMOVE_TOKEN', tokenId })
      }
    />
  )
}

export const DEFAULT_KEYWORD_SELECTOR_DRIVER: KeywordSelectorDriver = {
  type: 'keyword',
  getTriggerLabel: (props) => props.options?.placeholder ?? KEYWORD_TRIGGER_PLACEHOLDER,
  renderPanel: (panelProps) => <KeywordPanel {...panelProps} />,
}
