import { useId, type ChangeEventHandler, type ReactNode } from 'react'
import type { RegionSearchResult } from './regionSearchModel'

type RegionSearchInputStatus = 'idle' | 'loading' | 'ready' | 'error'

interface RegionSearchInputProps {
  value: string
  results: RegionSearchResult[]
  status: RegionSearchInputStatus
  icon?: ReactNode
  label: string
  placeholder: string
  idleMessage?: string
  loadingMessage?: string
  errorMessage?: string
  onChange: (value: string) => void
  onSelectResult: (result: RegionSearchResult) => void
}

function DefaultRegionSearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="cs-region-search-svg"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L19 20.49 20.49 19 15.5 14ZM9.5 14A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function RegionSearchInput({
  value,
  results,
  status,
  icon,
  label,
  placeholder,
  idleMessage,
  loadingMessage,
  errorMessage,
  onChange,
  onSelectResult,
}: RegionSearchInputProps) {
  const inputId = useId()
  const normalizedQuery = value.trim()
  const hasQuery = normalizedQuery.length > 0
  const shouldShowResults = status === 'ready' && hasQuery && results.length > 0
  const shouldShowLoadingState = status === 'loading'
  const shouldShowErrorState = status === 'error' && Boolean(errorMessage)
  const shouldShowIdleMessage =
    status !== 'loading' &&
    status !== 'error' &&
    !hasQuery &&
    Boolean(idleMessage)

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange(event.target.value)
  }

  return (
    <section className="cs-region-search-input" data-status={status}>
      <div className="cs-region-search-field">
        <span aria-hidden="true" className="cs-region-search-icon">
          {icon ?? <DefaultRegionSearchIcon />}
        </span>
        <input
          id={inputId}
          aria-label={label}
          autoComplete="off"
          className="cs-region-search-control"
          placeholder={placeholder}
          type="text"
          value={value}
          onChange={handleChange}
        />
      </div>
      {shouldShowErrorState ? (
        <p className="cs-region-search-message cs-region-search-message-error" role="alert">
          {errorMessage}
        </p>
      ) : shouldShowLoadingState ? (
        <div className="cs-region-search-loading" role="status" aria-live="polite">
          {loadingMessage ? <p className="cs-region-search-message">{loadingMessage}</p> : null}
          <ul className="cs-region-search-skeleton-list" aria-hidden="true">
            {Array.from({ length: 3 }, (_, index) => (
              <li key={`region-search-skeleton-${index}`}>
                <span className="cs-region-search-skeleton-item" />
              </li>
            ))}
          </ul>
        </div>
      ) : shouldShowResults ? (
        <ul className="cs-region-search-preview-list">
          {results.map((result) => (
            <li key={`${result.level}-${result.id}`}>
              <button
                className="cs-region-search-preview-item"
                type="button"
                onClick={() => onSelectResult(result)}
              >
                {result.pathLabel}
              </button>
            </li>
          ))}
        </ul>
      ) : shouldShowIdleMessage ? (
        <p className="cs-region-search-message">{idleMessage}</p>
      ) : null}
    </section>
  )
}
