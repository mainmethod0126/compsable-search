import { useCallback, useState } from 'react'
import { ComposableSearch } from './components'
import type { Region, RegionSelectionItem } from './components'
import {
  findAllEupmyeondongs,
  findAllSidos,
  findAllSigungus,
} from './DemoService'
import './App.css'

const MAX_EVENT_LOG_LENGTH = 8

function formatOnChangeMessage(selectedItems: RegionSelectionItem[]): string {
  const selectedCodes = selectedItems.map((item) => item.id).join(', ')
  const suffix = selectedCodes ? ` [${selectedCodes}]` : ''
  return `region.onChange(count=${selectedItems.length})${suffix}`
}

function formatOnSelectedMessage(selected: Region): string {
  return `region.onSelectedEupmyeondong(${selected.code})`
}

function App() {
  const [callbackEvents, setCallbackEvents] = useState<string[]>([])

  const appendCallbackEvent = useCallback((message: string) => {
    setCallbackEvents((previous) => [message, ...previous].slice(0, MAX_EVENT_LOG_LENGTH))
  }, [])

  const clearCallbackEvents = useCallback(() => {
    setCallbackEvents([])
  }, [])

  return (
    <main className="demo-root demo-shell">
      <header>
        <h1 className="demo-title">Composable Search Demo</h1>
        <p className="demo-description">
          iteration-04 기준 콜백 파이프라인/소비자 통합 샘플 반영 데모
        </p>
      </header>
      <div className="demo-panel">
        <ComposableSearch
          selectorsProps={[
            {
              type: 'region',
              findAllSidos,
              findAllSigungus,
              findAllEupmyeondongs,
              options: {
                placeHolder: '지역 선택',
                onChange: (selectedItems) => {
                  appendCallbackEvent(formatOnChangeMessage(selectedItems))
                },
                onSelectedEupmyeondong: (selected) => {
                  appendCallbackEvent(formatOnSelectedMessage(selected))
                },
                onClick: () => {
                  appendCallbackEvent('region.onClick')
                },
              },
            },
            {
              type: 'keyword',
              options: {
                placeHolder: '키워드 선택',
                onClick: () => {
                  appendCallbackEvent('keyword.onClick')
                },
              },
            },
          ]}
        />
      </div>
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
