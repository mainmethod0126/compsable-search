import { EMPTY_STATE_MESSAGES } from './emptyStateMessages'
import type { Region } from './types'

interface CheckableRegionColumnProps {
  regions: Region[]
  emptyMessage?: string
  selectedConditionIdSet: Set<string>
  onToggleRegion: (region: Region) => void
  testId?: string
}

export function CheckableRegionColumn({
  regions,
  emptyMessage = EMPTY_STATE_MESSAGES.NO_ITEMS,
  selectedConditionIdSet,
  onToggleRegion,
  testId,
}: CheckableRegionColumnProps) {
  return (
    <section className="cs-region-column" data-testid={testId}>
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
                <span className="cs-region-item-label">{region.displayName}</span>
              </label>
            )
          })}
        </div>
      )}
    </section>
  )
}
