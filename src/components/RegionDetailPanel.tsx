import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckableRegionColumn } from './CheckableRegionColumn'
import {
  EMPTY_STATE_MESSAGES,
  resolveChildColumnEmptyMessage,
} from './emptyStateMessages'
import type {
  InternalRegionSelector,
  RegionConditionToggleHandler,
} from './internalTypes'
import { resolveDescendantSelectedAncestorCodeSet } from './selectionPolicy'
import { SelectableRegionColumn } from './SelectableRegionColumn'
import type { Region, SelectedRegionCondition } from './types'

interface RegionDetailPanelProps {
  selector: InternalRegionSelector
  selectedConditions: SelectedRegionCondition[]
  onToggleRegionCondition: RegionConditionToggleHandler
}

function createWholeRegion(region: Region): Region {
  const resolvedDisplayName = region.displayName.endsWith(' 전체')
    ? region.displayName
    : `${region.displayName} 전체`

  return {
    ...region,
    displayName: resolvedDisplayName,
  }
}

function formatRegionConditionLabel(
  sido: Region,
  sigungu: Region,
  eupmyeondong: Region,
): string {
  return `${sido.displayName}>${sigungu.displayName}>${eupmyeondong.displayName}`
}

export function RegionDetailPanel({
  selector,
  selectedConditions,
  onToggleRegionCondition,
}: RegionDetailPanelProps) {
  const [sidos, setSidos] = useState<Region[]>([])
  const [sigungus, setSigungus] = useState<Region[]>([])
  const [eupmyeondongs, setEupmyeondongs] = useState<Region[]>([])
  const [selectedSido, setSelectedSido] = useState<Region | null>(null)
  const [selectedSigungu, setSelectedSigungu] = useState<Region | null>(null)

  const selectedSidoWholeRegion = useMemo(
    () => (selectedSido ? createWholeRegion(selectedSido) : undefined),
    [selectedSido],
  )

  useEffect(() => {
    setSidos(selector.findAllSidos())
  }, [selector])

  const handleSelectedSido = useCallback(
    (nextSido: Region) => {
      setSelectedSido(nextSido)
      setSelectedSigungu(null)
      setEupmyeondongs([])

      const nextSigungus = selector.findAllSigungus(nextSido.code)
      setSigungus(nextSigungus)
    },
    [selector],
  )

  const handleSelectedSigungu = useCallback(
    (nextSigungu: Region) => {
      setSelectedSigungu(nextSigungu)

      const wholeSigungu = createWholeRegion(nextSigungu)
      const nextEupmyeondongs = selector.findAllEupmyeondongs(nextSigungu.code)

      setEupmyeondongs([wholeSigungu, ...nextEupmyeondongs])
    },
    [selector],
  )

  const selectedConditionIdSet = useMemo(
    () => new Set(selectedConditions.map((condition) => condition.id)),
    [selectedConditions],
  )
  const descendantSelectedAncestorCodeSet = useMemo(
    () => resolveDescendantSelectedAncestorCodeSet(selectedConditions),
    [selectedConditions],
  )
  const isSelectedSidoWhole = selectedSidoWholeRegion
    ? selectedConditionIdSet.has(selectedSidoWholeRegion.code)
    : false
  const sigunguEmptyMessage = resolveChildColumnEmptyMessage(selectedSido !== null)
  const eupmyeondongEmptyMessage = resolveChildColumnEmptyMessage(
    selectedSigungu !== null,
  )

  const handleToggleEupmyeondong = (eupmyeondong: Region) => {
    if (!selectedSido || !selectedSigungu) {
      return
    }

    const nextCondition: SelectedRegionCondition = {
      id: eupmyeondong.code,
      displayName: formatRegionConditionLabel(
        selectedSido,
        selectedSigungu,
        eupmyeondong,
      ),
      sido: selectedSido,
      sigungu: selectedSigungu,
      eupmyeondong,
    }

    onToggleRegionCondition(nextCondition, eupmyeondong, selector.options)
  }

  const handleToggleSidoWhole = useCallback(
    (wholeSido: Region) => {
      if (!selectedSido) {
        return
      }

      const isTogglingOnWholeSido = !selectedConditionIdSet.has(wholeSido.code)
      if (isTogglingOnWholeSido) {
        setSelectedSigungu(null)
        setEupmyeondongs([])
      }

      const nextCondition: SelectedRegionCondition = {
        id: wholeSido.code,
        displayName: formatRegionConditionLabel(selectedSido, wholeSido, wholeSido),
        sido: selectedSido,
        sigungu: wholeSido,
        eupmyeondong: wholeSido,
      }

      onToggleRegionCondition(nextCondition, wholeSido, selector.options)
    },
    [onToggleRegionCondition, selectedConditionIdSet, selectedSido, selector.options],
  )

  return (
    <div className="cs-region-detail-panel">
      <div className="cs-region-columns">
        <SelectableRegionColumn
          regions={sidos}
          descendantSelectedRegionCodeSet={
            descendantSelectedAncestorCodeSet.sidoCodeSet
          }
          emptyMessage={EMPTY_STATE_MESSAGES.NO_ITEMS}
          onSelectedRegion={handleSelectedSido}
          title="시/도"
        />
        <SelectableRegionColumn
          key={`sigungu-${selectedSido?.code ?? 'none'}-${isSelectedSidoWhole ? 'whole' : 'detail'}`}
          regions={sigungus}
          descendantSelectedRegionCodeSet={
            descendantSelectedAncestorCodeSet.sigunguCodeSet
          }
          emptyMessage={sigunguEmptyMessage}
          onSelectedRegion={handleSelectedSigungu}
          title="시/군/구"
          wholeRegionToggle={
            selectedSidoWholeRegion
              ? {
                  region: selectedSidoWholeRegion,
                  checked: isSelectedSidoWhole,
                  onToggle: handleToggleSidoWhole,
                }
              : undefined
          }
        />
        <CheckableRegionColumn
          regions={eupmyeondongs}
          emptyMessage={eupmyeondongEmptyMessage}
          selectedConditionIdSet={selectedConditionIdSet}
          onToggleRegion={handleToggleEupmyeondong}
          title="읍/면/동"
        />
      </div>
    </div>
  )
}
