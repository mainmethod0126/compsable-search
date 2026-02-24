import { useId, type ChangeEventHandler, type ReactNode } from 'react'
import type { RegionSearchResult } from './regionSearchModel'

interface RegionSearchInputProps {
  value: string
  results: RegionSearchResult[]
  icon?: ReactNode
  label: string
  placeholder: string
  idleMessage: string
  emptyMessage: string
  onChange: (value: string) => void
  onSelectResult: (result: RegionSearchResult) => void
}

function DefaultRegionSearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="cs-region-search-svg"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.8 12.8a5.2 5.2 0 1 1 1.4-1.4l3.8 3.8-1.4 1.4-3.8-3.8Zm-7.6-3.6a3.2 3.2 0 1 0 6.4 0 3.2 3.2 0 0 0-6.4 0Z"
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
  emptyMessage,
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
      <label className="cs-region-search-label" htmlFor={inputId}>
        {label}
      </label>
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
      {!hasQuery ? (
        <p className="cs-region-search-message">{idleMessage}</p>
      ) : results.length === 0 ? (
        <p className="cs-region-search-message">{emptyMessage}</p>
      ) : (
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
      )}
    </section>
  )
}
