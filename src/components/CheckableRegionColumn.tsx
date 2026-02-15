import type { Region } from './types'

interface CheckableRegionColumnProps {
  title: string
  regions: Region[]
  selectedConditionIdSet: Set<string>
  onToggleRegion: (region: Region) => void
}

export function CheckableRegionColumn({
  title,
  regions,
  selectedConditionIdSet,
  onToggleRegion,
}: CheckableRegionColumnProps) {
  return (
    <section className="cs-region-column">
      <h3 className="cs-region-column-title">{title}</h3>
      {regions.length === 0 ? (
        <p className="cs-empty-message">No items to display.</p>
      ) : (
        <div className="cs-checkable-list">
          {regions.map((region) => {
            const isSelected = selectedConditionIdSet.has(region.code)

            return (
              <label
                key={region.code}
                className={`cs-checkable-item ${isSelected ? 'is-selected' : ''}`}
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

