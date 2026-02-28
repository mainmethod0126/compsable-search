import { useId, type KeyboardEventHandler } from 'react'

interface KeywordDetailPanelProps {
  label: string
  guideText: string
  inputPlaceholder: string
  inputValue: string
  tokenCount: number
  maxTokens: number
  errorMessage: string | null
  onInputChange: (value: string) => void
  onInputFocus: () => void
  onInputBlur: () => void
  onInputKeyDown: KeyboardEventHandler<HTMLInputElement>
}

export function KeywordDetailPanel({
  label,
  guideText,
  inputPlaceholder,
  inputValue,
  tokenCount,
  maxTokens,
  errorMessage,
  onInputChange,
  onInputFocus,
  onInputBlur,
  onInputKeyDown,
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
    </section>
  )
}
