import { useId, type ChangeEventHandler, type ReactNode } from 'react'
import type { RegionSearchResult } from './regionSearchModel'

interface RegionSearchInputProps {
  value: string
  results: RegionSearchResult[]
  icon?: ReactNode
  label: string
  placeholder: string
  idleMessage?: string
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
  icon,
  label,
  placeholder,
  idleMessage,
  onChange,
  onSelectResult,
}: RegionSearchInputProps) {
  const inputId = useId()
  const normalizedQuery = value.trim()
  const hasQuery = normalizedQuery.length > 0

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange(event.target.value)
  }

  return (
    <section className="cs-region-search-input">
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
      {hasQuery ? (
        results.length > 0 ? (
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
        ) : null
      ) : idleMessage ? (
        <p className="cs-region-search-message">{idleMessage}</p>
      ) : null}
    </section>
  )
}
