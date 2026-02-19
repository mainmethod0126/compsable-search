# composable-search

`ComposableSearch`는 selector/detailed/selected 3영역을 조합해 검색 조건 UI를 구성하는 React 컴포넌트입니다.

## 주요 동작
- `selectorsProps` 순서대로 selector 트리거 렌더링
- `region` 트리거 클릭 시 상세 패널 open/closed 토글
- 시/도 -> 시/군/구 -> 읍/면/동 3단계 선택
- 선택 조건 칩 렌더링, 개별 삭제, 전체 삭제
- 동일 시/군/구에서 `전체` 조건과 상세 조건 상호 배타 처리

## 사용 예시
```tsx
import { ComposableSearch } from './src/components'

<ComposableSearch
  selectorsProps={[
    {
      type: 'region',
      findAllSidos,
      findAllSigungus,
      findAllEupmyeondongs,
      options: { placeHolder: '지역 선택' },
    },
    {
      type: 'keyword',
      options: { placeHolder: '키워드 선택', onClick: () => {} },
    },
  ]}
/>
```

## 개발 명령
- `npm run dev`
- `npm test`
- `npm run lint`
- `npm run build`
