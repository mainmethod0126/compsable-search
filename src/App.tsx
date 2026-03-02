import { useCallback, useMemo, useState, type ChangeEvent } from 'react'
import {
  ComposableSearch,
  createKeywordSelector,
  createRegionSelector,
} from './components'
import type {
  KeywordSelectorProps,
  Region,
  RegionSelectorProps,
  SearchSelectionItem,
  ValueChangeMeta,
} from './components'
import {
  DEMO_REGION_PROFILE_SPECS,
  createDemoRegionDataSource,
  type DemoRegionSampleProfile,
} from './DemoService'
import './App.css'

const MAX_EVENT_LOG_LENGTH = 8
const PROFILE_ORDER: DemoRegionSampleProfile[] = ['small', 'medium', 'large']

interface DemoProfileMetrics {
  panelOpenDurationMs: number | null
  firstSelectionDurationMs: number | null
  regionOnClickCount: number
  regionOnValueChangeCount: number
  regionOnSelectedCount: number
}

function createInitialProfileMetrics(): DemoProfileMetrics {
  return {
    panelOpenDurationMs: null,
    firstSelectionDurationMs: null,
    regionOnClickCount: 0,
    regionOnValueChangeCount: 0,
    regionOnSelectedCount: 0,
  }
}

function createInitialMetricsRecord(): Record<
  DemoRegionSampleProfile,
  DemoProfileMetrics
> {
  return {
    small: createInitialProfileMetrics(),
    medium: createInitialProfileMetrics(),
    large: createInitialProfileMetrics(),
  }
}

function formatOnValueChangeMessage(
  selectedItems: SearchSelectionItem[],
  meta: ValueChangeMeta,
): string {
  const selectedCodes = selectedItems.map((item) => item.id).join(', ')
  const suffix = selectedCodes ? ` [${selectedCodes}]` : ''
  return `onValueChange(reason=${meta.reason ?? 'unknown'}, source=${meta.source ?? 'unknown'}, selectorType=${meta.selectorType ?? 'unknown'}, selectorId=${meta.selectorId ?? 'unknown'}, count=${selectedItems.length})${suffix}`
}

function formatOnSelectedMessage(selected: Region): string {
  return `region.onSelectedEupmyeondong(${selected.code})`
}

function resolveNow(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

function scheduleAfterPaint(task: () => void): void {
  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(() => task())
    return
  }

  setTimeout(task, 0)
}

function formatDuration(durationMs: number | null): string {
  if (durationMs === null) {
    return '미측정'
  }

  return `${durationMs.toFixed(2)}ms`
}

function App() {
  const [activeProfile, setActiveProfile] = useState<DemoRegionSampleProfile>('small')
  const [callbackEvents, setCallbackEvents] = useState<string[]>([])
  const [metricsByProfile, setMetricsByProfile] = useState(createInitialMetricsRecord)
  const [isRegionPanelOpen, setIsRegionPanelOpen] = useState(false)
  const [firstSelectionMeasureStartedAt, setFirstSelectionMeasureStartedAt] = useState<
    number | null
  >(null)

  const activeProfileSpec = DEMO_REGION_PROFILE_SPECS[activeProfile]
  const activeProfileMetrics = metricsByProfile[activeProfile]
  const activeDataSource = useMemo(
    () => createDemoRegionDataSource(activeProfile),
    [activeProfile],
  )

  const appendCallbackEvent = useCallback((message: string) => {
    setCallbackEvents((previous) => [message, ...previous].slice(0, MAX_EVENT_LOG_LENGTH))
  }, [])

  const updateActiveProfileMetrics = useCallback(
    (updater: (current: DemoProfileMetrics) => DemoProfileMetrics) => {
      setMetricsByProfile((previous) => ({
        ...previous,
        [activeProfile]: updater(previous[activeProfile]),
      }))
    },
    [activeProfile],
  )

  const clearCallbackEvents = useCallback(() => {
    setCallbackEvents([])
  }, [])

  const handleKeywordClick = useCallback(() => {
    appendCallbackEvent('keyword.onClick')
  }, [appendCallbackEvent])

  const handleRegionClick = useCallback(() => {
    appendCallbackEvent('region.onClick')
    const clickedAt = resolveNow()
    const isOpeningRegionPanel = !isRegionPanelOpen

    updateActiveProfileMetrics((current) => ({
      ...current,
      regionOnClickCount: current.regionOnClickCount + 1,
    }))
    setIsRegionPanelOpen(isOpeningRegionPanel)

    if (isOpeningRegionPanel) {
      setFirstSelectionMeasureStartedAt(clickedAt)
      scheduleAfterPaint(() => {
        updateActiveProfileMetrics((current) => ({
          ...current,
          panelOpenDurationMs: resolveNow() - clickedAt,
        }))
      })
      return
    }

    setFirstSelectionMeasureStartedAt(null)
  }, [appendCallbackEvent, isRegionPanelOpen, updateActiveProfileMetrics])

  const handleRegionSelected = useCallback(
    (selected: Region) => {
      appendCallbackEvent(formatOnSelectedMessage(selected))

      const startedAt = firstSelectionMeasureStartedAt
      const firstSelectionDurationMs =
        startedAt === null ? null : resolveNow() - startedAt
      setFirstSelectionMeasureStartedAt(null)

      updateActiveProfileMetrics((current) => ({
        ...current,
        regionOnSelectedCount: current.regionOnSelectedCount + 1,
        firstSelectionDurationMs:
          firstSelectionDurationMs ?? current.firstSelectionDurationMs,
      }))
    },
    [appendCallbackEvent, firstSelectionMeasureStartedAt, updateActiveProfileMetrics],
  )

  const handleValueChange = useCallback(
    (nextValue: SearchSelectionItem[], meta: ValueChangeMeta) => {
      appendCallbackEvent(formatOnValueChangeMessage(nextValue, meta))
      if (meta.selectorType !== 'region') {
        return
      }

      updateActiveProfileMetrics((current) => ({
        ...current,
        regionOnValueChangeCount: current.regionOnValueChangeCount + 1,
      }))
    },
    [appendCallbackEvent, updateActiveProfileMetrics],
  )

  const selectors = useMemo(
    () => {
      const regionSelectorProps: RegionSelectorProps & { type: 'region' } = {
        type: 'region',
        ...activeDataSource,
        options: {
          placeholder: '지역 선택',
          onClick: handleRegionClick,
          onSelectedEupmyeondong: handleRegionSelected,
        },
      }
      const keywordSelectorProps: KeywordSelectorProps & { type: 'keyword' } = {
        type: 'keyword',
        options: {
          placeholder: '키워드 선택',
          onClick: handleKeywordClick,
        },
      }

      return [
        createRegionSelector('demo-region-selector', regionSelectorProps),
        createKeywordSelector('demo-keyword-selector', keywordSelectorProps),
      ]
    },
    [
      activeDataSource,
      handleKeywordClick,
      handleRegionClick,
      handleRegionSelected,
    ],
  )

  const handleProfileChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextProfile = event.target.value as DemoRegionSampleProfile
    setActiveProfile(nextProfile)
    setCallbackEvents([])
    setIsRegionPanelOpen(false)
    setFirstSelectionMeasureStartedAt(null)
  }

  return (
    <main className="demo-root demo-shell">
      <header>
        <h1 className="demo-title">Composable Search Demo</h1>
        <p className="demo-description">
          V2(Generic Selector) 기준 대량 샘플 프로파일 전환/상호작용 회귀 검증 데모
        </p>
      </header>
      <section className="demo-profile-panel">
        <div className="demo-profile-controls">
          <label className="demo-profile-label" htmlFor="demo-profile-select">
            샘플 프로파일
          </label>
          <select
            id="demo-profile-select"
            className="demo-profile-select"
            value={activeProfile}
            onChange={handleProfileChange}
          >
            {PROFILE_ORDER.map((profile) => {
              const spec = DEMO_REGION_PROFILE_SPECS[profile]
              return (
                <option key={profile} value={profile}>
                  {`${profile} (${spec.sidoCount} x ${spec.sigunguPerSido} x ${spec.eupmyeondongPerSigungu})`}
                </option>
              )
            })}
          </select>
        </div>
        <p className="demo-profile-summary">현재 프로파일: {activeProfile}</p>
        <p className="demo-profile-summary">
          규모: 시/도 {activeProfileSpec.sidoCount}개, 시/군/구 {activeProfileSpec.sigunguPerSido}개/시도, 읍/면/동{' '}
          {activeProfileSpec.eupmyeondongPerSigungu}개/시군구
        </p>
      </section>
      <div className="demo-panel">
        <ComposableSearch
          key={`demo-search-${activeProfile}`}
          selectors={selectors}
          onValueChange={handleValueChange}
        />
      </div>
      <section className="demo-metrics-panel" data-testid="demo-performance-metrics">
        <h2 className="demo-metrics-title">프로파일별 성능 기준선</h2>
        <p className="demo-metrics-item">
          패널 오픈: {formatDuration(activeProfileMetrics.panelOpenDurationMs)}
        </p>
        <p className="demo-metrics-item">
          첫 선택 반영: {formatDuration(activeProfileMetrics.firstSelectionDurationMs)}
        </p>
        <p className="demo-metrics-item">
          region.onClick 호출: {activeProfileMetrics.regionOnClickCount}회
        </p>
        <p className="demo-metrics-item">
          onValueChange(region) 호출: {activeProfileMetrics.regionOnValueChangeCount}회
        </p>
        <p className="demo-metrics-item">
          region.onSelectedEupmyeondong 호출: {activeProfileMetrics.regionOnSelectedCount}회
        </p>
      </section>
      <section className="demo-event-log" data-testid="demo-event-log">
        <header className="demo-event-log-header">
          <h2 className="demo-event-log-title">Callback Event Log</h2>
          <button
            className="demo-event-log-clear-button"
            disabled={callbackEvents.length === 0}
            type="button"
            onClick={clearCallbackEvents}
          >
            로그 초기화
          </button>
        </header>
        {callbackEvents.length === 0 ? (
          <p className="demo-event-log-empty">아직 이벤트가 없습니다.</p>
        ) : (
          <ol className="demo-event-log-list">
            {callbackEvents.map((eventMessage, index) => (
              <li key={`${eventMessage}-${index}`} className="demo-event-log-item">
                {eventMessage}
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  )
}

export default App
