import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckableRegionColumn } from './CheckableRegionColumn'
import { SelectableRegionColumn } from './SelectableRegionColumn'
import type {
  Region,
  RegionSelectOptions,
  RegionSelectProps,
  SelectedRegionCondition,
} from './types'

interface RegionDetailPanelProps {
  selector: RegionSelectProps
  selectedConditions: SelectedRegionCondition[]
  onToggleRegionCondition: (
    nextCondition: SelectedRegionCondition,
    selectedRegion: Region,
    options?: RegionSelectOptions,
  ) => void
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

      const wholeSido = createWholeRegion(nextSido)
      const nextSigungus = selector.findAllSigungus(nextSido.code)

      setSigungus([wholeSido, ...nextSigungus])
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

  return (
    <div className="cs-region-detail-panel">
      <div className="cs-region-columns">
        <SelectableRegionColumn
          regions={sidos}
          onSelectedRegion={handleSelectedSido}
          title="시/도"
        />
        <SelectableRegionColumn
          parentRegion={selectedSidoWholeRegion}
          regions={sigungus}
          onSelectedRegion={handleSelectedSigungu}
          title="시/군/구"
        />
        <CheckableRegionColumn
          regions={eupmyeondongs}
          selectedConditionIdSet={selectedConditionIdSet}
          onToggleRegion={handleToggleEupmyeondong}
          title="읍/면/동"
        />
      </div>
    </div>
  )
}
