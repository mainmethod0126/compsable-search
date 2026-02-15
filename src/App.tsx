import { ComposableSearch } from './components'
import {
  findAllEupmyeondongs,
  findAllSidos,
  findAllSigungus,
} from './DemoService'
import './App.css'

function App() {
  return (
    <main className="demo-shell">
      <header>
        <h1 className="demo-title">Composable Search Demo</h1>
        <p className="demo-description">
          iteration-01 기준 검색 컨테이너/토글/콘텐츠 주입/선택 칩 동작 예시
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
              },
            },
            {
              type: 'keyword',
              options: {
                placeHolder: '키워드 선택',
                onClick: () => {
                  window.alert('키워드 입력 모델은 iteration-05 범위입니다.')
                },
              },
            },
          ]}
        />
      </div>
    </main>
  )
}

export default App
