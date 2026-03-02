import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CheckableRegionColumn } from './CheckableRegionColumn'
import {
  EMPTY_STATE_MESSAGES,
  resolveChildColumnEmptyMessage,
} from './emptyStateMessages'
import type { InternalRegionSelector, RegionConditionToggleHandler } from './internalTypes'
import { LEGACY_REGION_SELECTOR_ID } from './internalTypes'
import { resolveDescendantSelectedAncestorCodeSet } from './selectionPolicy'
import { SelectableRegionColumn } from './SelectableRegionColumn'
import type { Region, SelectedRegionCondition } from './types'

interface RegionDetailPanelProps {
  selectorId?: string
  selector: InternalRegionSelector
  selectedConditions: SelectedRegionCondition[]
  onToggleRegionCondition: RegionConditionToggleHandler
}

function isAbortError(error: unknown): boolean {
  if (typeof DOMException !== 'undefined' && error instanceof DOMException) {
    return error.name === 'AbortError'
  }

  if (typeof error === 'object' && error !== null && 'name' in error) {
    return (error as { name?: unknown }).name === 'AbortError'
  }

  return false
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
  selectorId,
  selector,
  selectedConditions,
  onToggleRegionCondition,
}: RegionDetailPanelProps) {
  const resolvedSelectorId = selectorId ?? LEGACY_REGION_SELECTOR_ID
  const [sidos, setSidos] = useState<Region[]>([])
  const [sigungus, setSigungus] = useState<Region[]>([])
  const [eupmyeondongs, setEupmyeondongs] = useState<Region[]>([])
  const [selectedSido, setSelectedSido] = useState<Region | null>(null)
  const [selectedSigungu, setSelectedSigungu] = useState<Region | null>(null)
  const sigunguLoadRequestIdRef = useRef(0)
  const eupmyeondongLoadRequestIdRef = useRef(0)
  const sigunguLoadControllerRef = useRef<AbortController | null>(null)
  const eupmyeondongLoadControllerRef = useRef<AbortController | null>(null)

  const selectedSidoWholeRegion = useMemo(
    () => (selectedSido ? createWholeRegion(selectedSido) : undefined),
    [selectedSido],
  )

  useEffect(() => {
    sigunguLoadControllerRef.current?.abort()
    eupmyeondongLoadControllerRef.current?.abort()
    sigunguLoadRequestIdRef.current += 1
    eupmyeondongLoadRequestIdRef.current += 1

    const controller = new AbortController()
    void Promise.resolve(selector.findAllSidos({ signal: controller.signal }))
      .then((nextSidos) => {
        if (controller.signal.aborted) {
          return
        }

        setSidos(nextSidos)
      })
      .catch((error) => {
        if (isAbortError(error)) {
          return
        }

        console.error(error)
      })

    return () => {
      controller.abort()
    }
  }, [selector])

  useEffect(
    () => () => {
      sigunguLoadControllerRef.current?.abort()
      eupmyeondongLoadControllerRef.current?.abort()
    },
    [],
  )

  const handleSelectedSido = useCallback(
    (nextSido: Region) => {
      setSelectedSido(nextSido)
      setSelectedSigungu(null)
      setSigungus([])
      setEupmyeondongs([])
      eupmyeondongLoadControllerRef.current?.abort()
      eupmyeondongLoadControllerRef.current = null
      eupmyeondongLoadRequestIdRef.current += 1

      sigunguLoadControllerRef.current?.abort()
      const controller = new AbortController()
      sigunguLoadControllerRef.current = controller
      sigunguLoadRequestIdRef.current += 1
      const requestId = sigunguLoadRequestIdRef.current

      void Promise.resolve(
        selector.findAllSigungus(nextSido.code, { signal: controller.signal }),
      )
        .then((nextSigungus) => {
          if (
            controller.signal.aborted ||
            requestId !== sigunguLoadRequestIdRef.current
          ) {
            return
          }

          setSigungus(nextSigungus)
        })
        .catch((error) => {
          if (isAbortError(error)) {
            return
          }

          console.error(error)
        })
    },
    [selector],
  )

  const handleSelectedSigungu = useCallback(
    (nextSigungu: Region) => {
      setSelectedSigungu(nextSigungu)
      const wholeSigungu = createWholeRegion(nextSigungu)
      setEupmyeondongs([wholeSigungu])

      eupmyeondongLoadControllerRef.current?.abort()
      const controller = new AbortController()
      eupmyeondongLoadControllerRef.current = controller
      eupmyeondongLoadRequestIdRef.current += 1
      const requestId = eupmyeondongLoadRequestIdRef.current

      void Promise.resolve(
        selector.findAllEupmyeondongs(nextSigungu.code, { signal: controller.signal }),
      )
        .then((nextEupmyeondongs) => {
          if (
            controller.signal.aborted ||
            requestId !== eupmyeondongLoadRequestIdRef.current
          ) {
            return
          }

          setEupmyeondongs([wholeSigungu, ...nextEupmyeondongs])
        })
        .catch((error) => {
          if (isAbortError(error)) {
            return
          }

          console.error(error)
        })
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
      selectorId: resolvedSelectorId,
      selectorType: 'region',
      sido: selectedSido,
      sigungu: selectedSigungu,
      eupmyeondong,
    }

    onToggleRegionCondition(nextCondition, eupmyeondong)
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
        selectorId: resolvedSelectorId,
        selectorType: 'region',
        sido: selectedSido,
        sigungu: wholeSido,
        eupmyeondong: wholeSido,
      }

      onToggleRegionCondition(nextCondition, wholeSido)
    },
    [onToggleRegionCondition, resolvedSelectorId, selectedConditionIdSet, selectedSido],
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
          testId="cs-region-column-sido"
        />
        <SelectableRegionColumn
          key={`sigungu-${selectedSido?.code ?? 'none'}-${isSelectedSidoWhole ? 'whole' : 'detail'}`}
          regions={sigungus}
          descendantSelectedRegionCodeSet={
            descendantSelectedAncestorCodeSet.sigunguCodeSet
          }
          emptyMessage={sigunguEmptyMessage}
          onSelectedRegion={handleSelectedSigungu}
          testId="cs-region-column-sigungu"
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
          testId="cs-region-column-eupmyeondong"
        />
      </div>
    </div>
  )
}
