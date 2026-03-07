import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEventHandler,
} from 'react'
import { KeywordDetailPanel } from '../KeywordDetailPanel'
import {
  createKeywordInvalidTokenContext,
  dispatchKeywordInvalidToken,
  shouldDispatchKeywordInvalidToken,
} from '../keywordInvalidTokenPolicy'
import {
  createInitialKeywordInputState,
  hasSameKeywordTokenSequence,
  resolveKeywordInputErrorMessage,
  resolveKeywordPolicy,
  transitionKeywordInputState,
  type KeywordInputEvent,
  type KeywordInputState,
} from '../keywordInputModel'
import type {
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

function isKeywordSelectionItem(
  item: SelectionItem,
): item is SelectedKeywordCondition {
  return 'normalizedKeyword' in item && typeof item.normalizedKeyword === 'string'
}

function KeywordPanel({
  selectorId,
  props: selectorProps,
  selectedItems,
  setSelectedItems,
  emitError,
}: SelectorPanelProps<KeywordSelectorProps, SelectionItem>) {
  const keywordPolicy = useMemo(
    () => resolveKeywordPolicy(selectorProps.options, selectorId),
    [selectorId, selectorProps.options],
  )
  const keywordSelectedItems = useMemo(
    () => selectedItems.filter(isKeywordSelectionItem),
    [selectedItems],
  )
  const selectedItemsRef = useRef(keywordSelectedItems)

  useEffect(() => {
    selectedItemsRef.current = keywordSelectedItems
  }, [keywordSelectedItems])

  const [keywordInputState, setKeywordInputState] = useState<KeywordInputState>(() => ({
    ...createInitialKeywordInputState(),
    tokens: keywordSelectedItems,
  }))
  const keywordInputStateRef = useRef(keywordInputState)

  useEffect(() => {
    keywordInputStateRef.current = keywordInputState
  }, [keywordInputState])

  const applyKeywordInputEvent = useCallback(
    (event: KeywordInputEvent) => {
      const currentState = keywordInputStateRef.current
      const latestTokens = selectedItemsRef.current
      const stateBase = hasSameKeywordTokenSequence(currentState.tokens, latestTokens)
        ? currentState
        : {
            ...currentState,
            tokens: latestTokens,
          }
      const nextState = transitionKeywordInputState(stateBase, event, keywordPolicy)

      if (
        shouldDispatchKeywordInvalidToken(stateBase.errorCode, nextState.errorCode)
      ) {
        dispatchKeywordInvalidToken(
          selectorProps.options,
          emitError,
          nextState.errorCode,
          createKeywordInvalidTokenContext(stateBase.inputValue, keywordPolicy),
        )
      }

      keywordInputStateRef.current = nextState
      setKeywordInputState(nextState)

      if (!hasSameKeywordTokenSequence(stateBase.tokens, nextState.tokens)) {
        try {
          setSelectedItems(nextState.tokens)
        } catch (error) {
          emitError(error)
        }
      }
    },
    [emitError, keywordPolicy, selectorProps.options, setSelectedItems],
  )

  const handleKeywordInputKeyDown = useCallback<
    KeyboardEventHandler<HTMLInputElement>
  >(
    (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        applyKeywordInputEvent({ type: 'COMMIT_INPUT' })
        return
      }

      if (
        event.key === 'Backspace' &&
        keywordInputStateRef.current.inputValue.length === 0
      ) {
        event.preventDefault()
        applyKeywordInputEvent({ type: 'BACKSPACE' })
      }
    },
    [applyKeywordInputEvent],
  )

  return (
    <KeywordDetailPanel
      errorMessage={resolveKeywordInputErrorMessage(
        keywordInputState.errorCode,
        keywordPolicy,
      )}
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
