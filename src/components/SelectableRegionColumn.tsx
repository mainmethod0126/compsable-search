import { useMemo, useState } from 'react'
import { EMPTY_STATE_MESSAGES } from './emptyStateMessages'
import type { Region } from './types'

interface WholeRegionToggle {
  region: Region
  checked: boolean
  onToggle: (region: Region) => void
}

interface SelectableRegionColumnProps {
  title: string
  regions: Region[]
  parentRegion?: Region
  emptyMessage?: string
  onSelectedRegion: (selectedRegion: Region) => void
  wholeRegionToggle?: WholeRegionToggle
  descendantSelectedRegionCodeSet?: Set<string>
}

function resolveRegions(regions: Region[], parentRegion?: Region): Region[] {
  if (!parentRegion) {
    return regions
  }

  const hasParentRegion = regions.some(
    (region) => region.code === parentRegion.code,
  )
  if (hasParentRegion) {
    return regions
  }

  return [parentRegion, ...regions]
}

export function SelectableRegionColumn({
  title,
  regions,
  parentRegion,
  emptyMessage = EMPTY_STATE_MESSAGES.NO_ITEMS,
  onSelectedRegion,
  wholeRegionToggle,
  descendantSelectedRegionCodeSet,
}: SelectableRegionColumnProps) {
  const [currentRegionCode, setCurrentRegionCode] = useState<string | null>(null)
  const resolvedRegions = useMemo(
    () => resolveRegions(regions, parentRegion),
    [regions, parentRegion],
  )
  const effectiveCurrentRegionCode = resolvedRegions.some(
    (region) => region.code === currentRegionCode,
  )
    ? currentRegionCode
    : null

  return (
    <section className="cs-region-column">
      <h3 className="cs-region-column-title">{title}</h3>
      {wholeRegionToggle ? (
        <div className="cs-region-column-whole-toggle">
          <label
            className={`cs-checkable-item cs-region-typography ${
              wholeRegionToggle.checked ? 'is-selected' : ''
            }`}
          >
            <input
              checked={wholeRegionToggle.checked}
              className="cs-checkable-input"
              type="checkbox"
              onChange={() => wholeRegionToggle.onToggle(wholeRegionToggle.region)}
            />
            <span>{wholeRegionToggle.region.displayName}</span>
          </label>
        </div>
      ) : null}
      {resolvedRegions.length === 0 ? (
        <p className="cs-empty-message">{emptyMessage}</p>
      ) : (
        <ul className="cs-region-column-list">
          {resolvedRegions.map((region) => {
            const isCurrent = region.code === effectiveCurrentRegionCode
            const hasDescendantSelected =
              descendantSelectedRegionCodeSet?.has(region.code) ?? false
            return (
              <li key={region.code}>
                <button
                  className={`cs-region-item cs-region-typography ${isCurrent ? 'is-current' : ''} ${
                    hasDescendantSelected ? 'has-descendant-selected' : ''
                  }`}
                  type="button"
                  onClick={() => {
                    setCurrentRegionCode(region.code)
                    onSelectedRegion(region)
                  }}
                >
                  {region.displayName}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
