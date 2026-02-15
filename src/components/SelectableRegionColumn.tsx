import { useEffect, useMemo, useRef, useState } from 'react'
import type { Region } from './types'

interface SelectableRegionColumnProps {
  title: string
  regions: Region[]
  parentRegion?: Region
  onSelectedRegion: (selectedRegion: Region) => void
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
  onSelectedRegion,
}: SelectableRegionColumnProps) {
  const [currentRegionCode, setCurrentRegionCode] = useState<string | null>(null)
  const lastNotifiedCodeRef = useRef<string | null>(null)
  const resolvedRegions = useMemo(
    () => resolveRegions(regions, parentRegion),
    [regions, parentRegion],
  )
  const fallbackRegionCode = (parentRegion ?? resolvedRegions[0])?.code ?? null
  const effectiveCurrentRegionCode =
    currentRegionCode &&
    resolvedRegions.some((region) => region.code === currentRegionCode)
      ? currentRegionCode
      : fallbackRegionCode

  useEffect(() => {
    if (!effectiveCurrentRegionCode) {
      lastNotifiedCodeRef.current = null
      return
    }

    if (lastNotifiedCodeRef.current === effectiveCurrentRegionCode) {
      return
    }

    const selectedRegion = resolvedRegions.find(
      (region) => region.code === effectiveCurrentRegionCode,
    )
    if (!selectedRegion) {
      return
    }

    onSelectedRegion(selectedRegion)
    lastNotifiedCodeRef.current = effectiveCurrentRegionCode
  }, [effectiveCurrentRegionCode, onSelectedRegion, resolvedRegions])

  return (
    <section className="cs-region-column">
      <h3 className="cs-region-column-title">{title}</h3>
      {resolvedRegions.length === 0 ? (
        <p className="cs-empty-message">No items to display.</p>
      ) : (
        <ul className="cs-region-column-list">
          {resolvedRegions.map((region) => {
            const isCurrent = region.code === effectiveCurrentRegionCode
            return (
              <li key={region.code}>
                <button
                  className={`cs-region-item ${isCurrent ? 'is-current' : ''}`}
                  type="button"
                  onClick={() => {
                    setCurrentRegionCode(region.code)
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
