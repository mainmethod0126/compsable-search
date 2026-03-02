import { useId, type KeyboardEventHandler } from 'react'
import type { SelectedKeywordCondition } from './types'

interface KeywordDetailPanelProps {
  label: string
  guideText: string
  inputPlaceholder: string
  inputValue: string
  tokenCount: number
  maxTokens: number
  tokens?: SelectedKeywordCondition[]
  errorMessage: string | null
  onInputChange: (value: string) => void
  onInputFocus: () => void
  onInputBlur: () => void
  onInputKeyDown: KeyboardEventHandler<HTMLInputElement>
  onRemoveToken?: (tokenId: string) => void
  onClearAllTokens?: () => void
}

export function KeywordDetailPanel({
  label,
  guideText,
  inputPlaceholder,
  inputValue,
  tokenCount,
  maxTokens,
  tokens = [],
  errorMessage,
  onInputChange,
  onInputFocus,
  onInputBlur,
  onInputKeyDown,
  onRemoveToken,
  onClearAllTokens,
}: KeywordDetailPanelProps) {
  const instanceId = useId()
  const inputId = `cs-keyword-input-${instanceId}`
  const hintId = `cs-keyword-hint-${instanceId}`
  const errorId = `cs-keyword-error-${instanceId}`
  const describedBy = errorMessage ? `${hintId} ${errorId}` : hintId

  return (
    <section className="cs-keyword-panel" data-testid="cs-keyword-panel">
      <div className="cs-keyword-input-row">
        <input
          aria-label={label}
          aria-describedby={describedBy}
          className="cs-keyword-input"
          id={inputId}
          placeholder={inputPlaceholder}
          type="text"
          value={inputValue}
          onBlur={onInputBlur}
          onChange={(event) => onInputChange(event.target.value)}
          onFocus={onInputFocus}
          onKeyDown={onInputKeyDown}
        />
        <span className="cs-keyword-counter" aria-live="polite">
          {tokenCount}/{maxTokens}
        </span>
      </div>
      <p className="cs-keyword-guide" id={hintId}>
        {guideText}
      </p>
      {errorMessage ? (
        <p className="cs-keyword-error" id={errorId} role="alert">
          {errorMessage}
        </p>
      ) : null}
      {tokens.length > 0 ? (
        <div className="cs-keyword-token-area">
          <ul className="cs-keyword-token-list" aria-label="선택된 키워드">
            {tokens.map((token) => (
              <li key={token.id} className="cs-keyword-token-item">
                {onRemoveToken ? (
                  <button
                    type="button"
                    className="cs-keyword-token-button"
                    onClick={() => onRemoveToken(token.id)}
                  >
                    {token.displayName}
                  </button>
                ) : (
                  <span className="cs-keyword-token-label">{token.displayName}</span>
                )}
              </li>
            ))}
          </ul>
          {onClearAllTokens ? (
            <button
              type="button"
              className="cs-keyword-clear-all"
              onClick={onClearAllTokens}
            >
              전체 삭제
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
