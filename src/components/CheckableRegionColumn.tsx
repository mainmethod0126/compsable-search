import { EMPTY_STATE_MESSAGES } from './emptyStateMessages'
import type { Region } from './types'

interface CheckableRegionColumnProps {
  title: string
  regions: Region[]
  emptyMessage?: string
  selectedConditionIdSet: Set<string>
  onToggleRegion: (region: Region) => void
}

export function CheckableRegionColumn({
  title,
  regions,
  emptyMessage = EMPTY_STATE_MESSAGES.NO_ITEMS,
  selectedConditionIdSet,
  onToggleRegion,
}: CheckableRegionColumnProps) {
  return (
    <section className="cs-region-column">
      <h3 className="cs-region-column-title">{title}</h3>
      {regions.length === 0 ? (
        <p className="cs-empty-message">{emptyMessage}</p>
      ) : (
        <div className="cs-checkable-list">
          {regions.map((region) => {
            const isSelected = selectedConditionIdSet.has(region.code)

            return (
              <label
                key={region.code}
                className={`cs-checkable-item cs-region-typography ${
                  isSelected ? 'is-selected' : ''
                }`}
              >
                <input
                  checked={isSelected}
                  className="cs-checkable-input"
                  type="checkbox"
                  onChange={() => onToggleRegion(region)}
                />
                <span>{region.displayName}</span>
              </label>
            )
          })}
        </div>
      )}
    </section>
  )
}
