# composable-search

`ComposableSearch`는 `region`/`keyword` 선택기를 조합해 검색 조건 UI를 구성하는 React 컴포넌트입니다.  
UI는 `selector 영역 + 상세 패널 + 선택 조건 칩`으로 구성되며, 선택 결과를 `SearchSelectionItem[]`로 전달합니다.

## 빠른 시작

현재 저장소 기준으로는 아래처럼 `src/components` 엔트리에서 가져와 사용합니다.

```tsx
import { ComposableSearch, type Region, type SearchSelectionItem } from './src/components'

const SIDO_LIST: Region[] = [
  { displayName: '서울특별시', name: '서울특별시', code: '11' },
  { displayName: '부산광역시', name: '부산광역시', code: '26' },
]

const SIGUNGU_BY_SIDO: Record<string, Region[]> = {
  '11': [
    { displayName: '강남구', name: '강남구', code: '11680' },
    { displayName: '송파구', name: '송파구', code: '11710' },
  ],
  '26': [{ displayName: '해운대구', name: '해운대구', code: '26350' }],
}

const EUPMYEONDONG_BY_SIGUNGU: Record<string, Region[]> = {
  '11680': [
    { displayName: '역삼동', name: '역삼동', code: '11680101' },
    { displayName: '삼성동', name: '삼성동', code: '11680105' },
  ],
  '11710': [{ displayName: '잠실동', name: '잠실동', code: '11710101' }],
  '26350': [{ displayName: '우동', name: '우동', code: '26350101' }],
}

export function SearchExample() {
  const handleSelectionChange = (selectedItems: SearchSelectionItem[]) => {
    console.log('선택 조건 변경', selectedItems)
  }

  return (
    <ComposableSearch
      onChange={handleSelectionChange}
      selectorsProps={[
        {
          type: 'region',
          findAllSidos: () => SIDO_LIST,
          findAllSigungus: (sidoCode) => SIGUNGU_BY_SIDO[sidoCode] ?? [],
          findAllEupmyeondongs: (sigunguCode) =>
            EUPMYEONDONG_BY_SIGUNGU[sigunguCode] ?? [],
          options: {
            placeHolder: '지역 선택',
            searchInputPlaceholder: '지역명 입력',
            searchNoResultMessage: '검색 결과가 없습니다.',
            onChange: (selectedItems) =>
              console.log('fallback onChange(최상위 onChange 미지정 시)', selectedItems),
            onSelectedEupmyeondong: (selected) =>
              console.log('지역 확정', selected.code),
          },
        },
        {
          type: 'keyword',
          options: {
            placeHolder: '키워드 선택',
            inputPlaceholder: '키워드를 입력해 주세요.',
            maxTokens: 5,
            maxTokenLength: 20,
            normalization: { casePolicy: 'lower' },
            onInvalidToken: (error, context) => {
              console.warn('유효하지 않은 키워드', error, context)
            },
          },
        },
      ]}
    />
  )
}
```

## 핵심 동작

- `selectorsProps` 순서대로 트리거 버튼이 렌더링됩니다.
- `selectorsProps`에 동일 `type`이 중복되면 첫 번째 selector만 상세 패널/로직에 사용됩니다(first-wins).
- 동일 `type` 중복이 감지되면 개발 환경에서 `console.warn`으로 경고를 남깁니다.
- `region` 트리거 클릭 시 지역 상세 패널이 열리고, 검색 입력으로 빠른 지역 탐색이 가능합니다.
- 지역 검색어가 있고 결과가 0건일 때 `RegionSelectOptions.searchNoResultMessage`가 노출됩니다.
- 지역 선택은 `시/도 -> 시/군/구 -> 읍/면/동` 3단계입니다.
- `keyword` 트리거 클릭 시 키워드 입력 패널이 열립니다.
- 키워드 입력은 상태머신(`idle`, `typing`, `token-committed`, `max-token-reached`)으로 관리됩니다.
- `Enter`/`Blur`로 토큰을 확정하고, 입력이 비어있을 때 `Backspace`로 마지막 토큰을 삭제합니다.
- 선택 조건은 하단 칩으로 표시되며 개별 삭제와 전체 삭제를 지원합니다.

## 선택 결과와 콜백 계약

### `ComposableSearch.onChange` (권장)

- 호출 시점: 지역 또는 키워드 조건이 변경될 때마다 호출됩니다.
- 시그니처: `(selectedItems: SearchSelectionItem[]) => void`
- 우선순위: `props.onChange`가 지정되면 이 콜백이 최우선으로 사용되고, `region.options.onChange`는 호출되지 않습니다.
- payload 구성:
  - 지역 조건: `SelectedRegionCondition`
  - 키워드 조건: `SelectedKeywordCondition`

### `region.options.onChange`

- 호출 시점: `ComposableSearch.onChange`를 지정하지 않았을 때, 지역 또는 키워드 조건이 변경될 때마다 호출됩니다.
- 시그니처: `(selectedItems: SearchSelectionItem[]) => void`
- `0.2.x`에서는 기존 소비자 코드 호환을 위해 fallback 콜백으로 유지됩니다.
- payload 구성:
  - 지역 조건: `SelectedRegionCondition`
  - 키워드 조건: `SelectedKeywordCondition`
- 순서: `region` 조건이 앞, `keyword` 조건이 뒤입니다.

### `region.options.onSelectedEupmyeondong`

- 호출 시점: 지역 조건이 새로 추가될 때만 호출됩니다.
- 시그니처: `(selected: Region) => void`
- 조건 해제(toggle off) 시에는 호출되지 않습니다.

### `region.options.onClick`, `keyword.options.onClick`

- 각 트리거 버튼 클릭 시 호출됩니다.

### `keyword.options.onInvalidToken`

- 호출 시점: 잘못된 키워드 토큰 확정 시
- 시그니처: `(error: KeywordInputErrorCode, context: KeywordInvalidTokenContext) => void`
- 오류 코드:
  - `empty-token`
  - `duplicate-token`
  - `token-too-long`
  - `max-token-reached`

### 콜백 예외 격리

- 콜백 내부에서 예외가 발생해도 UI 흐름은 유지됩니다.
- 에러는 `console.error`로 기록되며 prefix는 `[ComposableSearch] callback error`입니다.

## 기본 정책

### 키워드 기본값

- `maxTokens`: `5`
- `maxTokenLength`: `20`
- `normalization.trim`: `true`
- `normalization.collapseWhitespace`: `true`
- `normalization.casePolicy`: `'lower'`

### 지역 선택 상호 배타 정책

- 동일 `시/도`에서 `시/도 전체`를 선택하면 해당 `시/도`의 상세 선택은 제거됩니다.
- 동일 `시/군/구`에서 `시/군/구 전체`와 개별 `읍/면/동`은 동시에 유지되지 않습니다.

## 타입/유틸리티

`src/components`에서 아래 타입/유틸을 함께 제공합니다.

- 타입:
  - `ComposableSearchProps`
  - `ComposableSelectProps`
  - `RegionSelectProps`
  - `KeywordSelectProps`
  - `SearchSelectionItem`
  - `SelectedRegionCondition`
  - `SelectedKeywordCondition`
- 유틸:
  - `resolveSelectorByType`
  - `isRegionSelector`
  - `isKeywordSelector`

## 스타일 커스터마이징

- 루트에 `className`, `style`을 전달할 수 있습니다.
- 내부 클래스는 `cs-` 접두사를 사용해 충돌을 줄였습니다.

## 개발 명령

- `npm run dev`
- `npm test`
- `npm run lint`
- `npm run build`

## 추가 문서

- `0.2.x`는 non-breaking 범위를 유지하며, 기존 레거시 import 경로(`src/components/types.ts`)도 유지됩니다.
- 하위 호환 규칙: `docs/public-api-compatibility-rules.md`
- API 가이드: `docs/api-usage-guide.md`
- 키워드 입력 상태머신: `docs/keyword-input-state-machine.md`
- 마이그레이션 노트: `docs/migration-notes/keyword-input-model-evolution.md`
