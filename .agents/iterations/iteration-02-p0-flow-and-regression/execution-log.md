# Iteration 02 실행 로그

## 메타
- 이터레이션: `iteration-02-p0-flow-and-regression`
- 갱신일: `2026-02-19`
- 이번 반영 범위: `T-153`, `T-154`, `T-155`, `T-156`

## 1. 정의 (Task: T-153)
- `FR-023/AC-023` 기준으로 상위 하이라이팅 상태 모델을 확정했다.
- `default/current/is-selected/has-descendant-selected` 우선순위와 조합 규칙을 문서화했다.
- `역삼동`, `강남구 전체`, `서울특별시 전체` 시나리오별 기대 상태를 명시했다.

## 2. 구현 (Task: T-154)
- `resolveDescendantSelectedAncestorCodeSet` 규칙을 확장해 `시/군/구 전체`와 `읍/면/동 전체` 선택도 상위 하이라이팅 대상에 포함했다.
- `시/도 전체` 선택은 시/도 하이라이팅만 반영하고, 시/군/구 하이라이팅은 제외하도록 경계를 유지했다.

## 3. 검증 (Task: T-155)
- Red:
  - `selectionPolicy.test.ts`에 전체 선택 하이라이팅 기대값 테스트를 추가해 실패를 확인했다.
  - `ComposableSearch.test.tsx`에 `강남구 전체`, `서울특별시 전체`, `is-current`/`has-descendant-selected` 구분 테스트를 추가해 실패를 확인했다.
- Green:
  - 정책 로직 수정 후 전체 테스트 통과를 확인했다.
- 검증 명령:
  - `npm test`
  - `npm run lint`
  - `npm run build`

## 4. 운영 준비 (Task: T-156)
- 이터레이션 2용 릴리스 런북(`release-runbook.md`)에 FR-023 스모크 체크, 시각 회귀 triage, 롤백 조건/절차를 반영했다.
