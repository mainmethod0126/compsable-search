# 키워드 입력 모델 전환 마이그레이션 노트

## 메타
- 대상 버전: `0.1.x` -> `0.2.x`
- 갱신일: `2026-02-19`
- 관련 Epic: `[E-04] 키워드 조건 입력 모델 확장`

## 1. 변경 요약
- `keyword` selector가 trigger-only 모델에서 실제 입력/토큰 모델로 확장되었다.
- `region.options.onChange` payload가 `SearchSelectionItem[]`로 확장되어 keyword 조건을 함께 전달한다.
- keyword 입력 제약/정규화/오류 콜백 옵션이 추가되었다.

## 2. 영향 범위
- **영향 있음**
  - `region.options.onChange`에서 region 전용 타입 단정(`SelectedRegionCondition[]`)을 가정한 소비자 코드
  - keyword 버튼 클릭만 처리하고 입력 상태를 별도 UI에서 관리하던 코드
- **영향 없음**
  - region 선택 흐름(`onSelectedEupmyeondong`, region 계층 선택 정책)
  - 기존 `type: 'region' | 'keyword'` selector 구성 방식

## 3. 코드 변경 가이드
1. `onChange` payload 처리 분기 추가
```ts
function isRegionCondition(item: SearchSelectionItem): item is SelectedRegionCondition {
  return 'sido' in item && 'sigungu' in item && 'eupmyeondong' in item
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
3. region-only 로직이 필요한 경우 필터링 사용
```ts
const regionOnly = payload.filter(isRegionCondition)
```

## 4. 런타임 동작 차이
- 이전: `keyword` 트리거 클릭 -> `onClick`만 발생
- 이후:
  - `keyword` 트리거 클릭 -> 입력 패널 토글 + `onClick`
  - Enter/Blur -> 토큰 확정
  - 빈 입력 Backspace -> 마지막 토큰 삭제
  - 중복/길이초과/최대개수 초과 -> `onInvalidToken` + 오류 메시지

## 5. 검증 체크리스트
- `npm test`
- `npm run lint`
- `npm run build`
- region + keyword 조합 상태에서 `onChange` payload 내용/순서 확인
