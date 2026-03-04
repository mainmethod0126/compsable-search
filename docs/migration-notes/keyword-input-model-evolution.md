# 키워드 입력 모델 전환 마이그레이션 노트

## 메타
- 대상 버전: `0.1.x` -> `0.2.x`
- 갱신일: `2026-03-04`
- 관련 Epic: `[E-04] 키워드 조건 입력 모델 확장`

## 1. 변경 요약
- `keyword` selector가 trigger-only 모델에서 실제 입력/토큰 모델로 확장되었다.
- 상태 변경 이벤트 기준이 `onValueChange(nextValue, meta)`로 정리되었고, `nextValue`에 region + keyword 조건이 함께 전달된다.
- `meta`(`reason`, `source`, `selectorType`)를 통해 변경 원인/출처를 함께 해석할 수 있다.
- keyword 입력 제약/정규화/오류 콜백 옵션이 추가되었다.

## 2. 영향 범위
- **영향 있음**
  - `onChange(selectedItems)` 또는 `region.options.onChange` 중심으로 payload만 처리하던 소비자 코드
  - `onValueChange(nextValue, meta)`에서 `meta.source`, `meta.reason`를 사용하지 않던 로깅/분석 코드
  - `meta.source === 'region' | 'keyword'`를 직접 비교하던 코드 (V2 기준: `selector | external`)
  - keyword 버튼 클릭만 처리하고 입력 상태를 별도 UI에서 관리하던 코드
- **영향 없음**
  - region 선택 흐름(`onSelectedEupmyeondong`, region 계층 선택 정책)
  - 기존 `type: 'region' | 'keyword'` selector 구성 방식

## 3. 코드 변경 가이드
1. `onValueChange(nextValue, meta)` 기준 핸들러로 전환
```ts
function isRegionCondition(item: SearchSelectionItem): item is SelectedRegionCondition {
  return 'sido' in item && 'sigungu' in item && 'eupmyeondong' in item
}

const handleValueChange = (nextValue: SearchSelectionItem[], meta: ChangeMeta) => {
  if (meta.source === 'external') return

  const regionOnly = nextValue.filter(isRegionCondition)
  // region-only 후속 로직
}
```
2. keyword 옵션을 명시적으로 선언
```ts
{
  type: 'keyword',
  options: {
    label: '키워드 입력',
    maxTokens: 5,
    maxTokenLength: 20,
    normalization: { casePolicy: 'lower' },
    onInvalidToken: (error, context) => {},
  },
}
```
3. 컴포넌트 이벤트 연결을 `onValueChange`로 통일
```tsx
<ComposableSearch
  selectors={selectors}
  onValueChange={(nextValue, meta) => {
    console.log(meta.reason ?? 'replace', meta.source, meta.selectorType)
    handleValueChange(nextValue, meta)
  }}
/>
```

## 4. 런타임 동작 차이
- 이전: `keyword` 트리거 클릭 -> `onClick`만 발생
- 이후:
  - `keyword` 트리거 클릭 -> 입력 패널 토글 + `onClick`
  - Enter/Blur -> 토큰 확정 + `onValueChange(nextValue, meta)`
  - 빈 입력 Backspace -> 마지막 토큰 삭제 + `onValueChange(nextValue, meta)`
  - 중복/길이초과/최대개수 초과 -> `onInvalidToken` + 오류 메시지

## 5. 검증 체크리스트
- `npm test`
- `npm run lint`
- `npm run build`
- region + keyword 조합 상태에서 `onValueChange(nextValue, meta)`의 `nextValue` 내용/순서 확인
- `meta.reason`(`add/remove/clear/replace`)가 입력 동작과 일치하는지 확인
- `meta.source`가 V2 계약(`selector | external`)으로 처리되는지 확인
