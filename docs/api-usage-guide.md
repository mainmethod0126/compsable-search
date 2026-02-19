# ComposableSearch API 사용 가이드

## 1. 빠른 시작
```tsx
import {
  ComposableSearch,
  type ComposableSearchProps,
  type SearchSelectionItem,
} from './src/components'

const props: ComposableSearchProps = {
  selectorsProps: [
    {
      type: 'region',
      findAllSidos,
      findAllSigungus,
      findAllEupmyeondongs,
      options: {
        placeHolder: '지역 선택',
        onClick: () => {},
        onChange: (selectedItems: SearchSelectionItem[]) => {},
        onSelectedEupmyeondong: (selected) => {},
      },
    },
    {
      type: 'keyword',
      options: {
        placeHolder: '키워드 선택',
        label: '키워드 입력',
        inputPlaceholder: '키워드를 입력해 주세요.',
        guideText: 'Enter로 키워드 확정, 입력이 비었을 때 Backspace로 마지막 키워드 삭제',
        maxTokens: 5,
        maxTokenLength: 20,
        normalization: {
          casePolicy: 'lower',
        },
        onInvalidToken: (error, context) => {},
        onClick: () => {},
      },
    },
  ],
}

<ComposableSearch {...props} />
```

## 2. 콜백 계약
- `region.options.onClick`
  - 지역 selector 트리거 클릭 시 항상 호출된다.
- `region.options.onChange`
  - 선택 조건이 변경될 때마다 호출된다.
  - payload 타입: `SearchSelectionItem[]`
  - payload 구성:
    - 지역 조건: `SelectedRegionCondition` (`sido`, `sigungu`, `eupmyeondong` 포함)
    - 키워드 조건: `SelectedKeywordCondition` (`keyword`, `normalizedKeyword` 포함)
  - 정렬 정책:
    - `region` 조건이 먼저, `keyword` 조건이 뒤에 온다.
    - `keyword` 조건은 토큰 확정 순서를 유지한다.
- `region.options.onSelectedEupmyeondong`
  - 사용자가 지역 조건을 새로 확정(선택)할 때 호출된다.
  - 해제(toggle off) 시에는 호출되지 않는다.
- `keyword.options.onClick`
  - 키워드 selector 트리거 클릭 시 항상 호출된다.
- `keyword.options.onInvalidToken`
  - 유효하지 않은 키워드 입력 확정 시 호출된다.
  - 오류 코드:
    - `empty-token`
    - `duplicate-token`
    - `token-too-long`
    - `max-token-reached`

## 3. 키워드 입력 정책
- 상태:
  - `idle` → `typing` → `token-committed` → `max-token-reached`
- 이벤트:
  - `Enter`: 현재 입력 토큰 확정
  - `Blur`: 현재 입력 토큰 확정
  - `Backspace`(입력 비어 있음): 마지막 토큰 제거
- 기본 정규화 정책:
  - 앞뒤 공백 제거
  - 연속 공백을 단일 공백으로 변환
  - 소문자 정규화(`casePolicy: 'lower'`)
- 기본 제한 정책:
  - `maxTokens = 5`
  - `maxTokenLength = 20`

## 4. 콜백 오류 처리 정책
- 콜백 내부에서 예외가 발생해도 UI 선택 흐름은 중단되지 않는다.
- 오류는 `console.error`로 기록되며 prefix는 다음과 같다.
  - `[ComposableSearch] callback error`

## 5. 권장 검증 명령
- `npm test`
- `npm run lint`
- `npm run build`
