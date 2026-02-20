# [US-043] 선택 조건 영역 스크롤과 레이아웃 보호

## 메타
- ID: `US-043`
- 소속 Feature: `[F-03] 선택 조건 칩/삭제/중복 방지 처리` (`../feature.md`)
- 소속 Epic: `[E-01] 코어 지역 선택 경험 MVP 완성` (`../../epic.md`)
- 우선순위: `P0`
- 상태: `TBD`
- GitHub Issue: `TBD`

## 사용자 스토리
- As a: 최종 사용자
- I want: 선택 조건 칩이 많아져도 선택 영역이 일정 높이 내에서 유지되고 내부 스크롤로 탐색되길 원한다.
- So that: 데스크톱/모바일 모두에서 상세 패널 접근성과 조건 삭제 흐름을 안정적으로 유지할 수 있다.

## 수용 기준
- [ ] 선택 조건 리스트 콘텐츠 높이가 데스크톱 `144px`, 모바일 `112px` 상한을 초과하면 선택 조건 영역에 내부 세로 스크롤(`overflow-y: auto`)이 활성화된다.
- [ ] 스크롤 적용 후에도 개별 삭제/전체 삭제/조건 동기화(`onChange`) 계약이 기존과 동일하게 동작한다.
- [ ] 데스크톱(`>=1024px`)과 모바일(`<=768px`)에서 선택 영역이 상위 레이아웃을 과도하게 밀어내지 않는다.
- [ ] `ComposableSearch.test.tsx`, `styleIsolation.test.ts` 회귀 검증이 CI 기준으로 통과한다.
- [ ] 스크롤 축은 세로 전용으로 유지하고, 헤더 고정(sticky)은 미적용으로 관리하며 재검토 오너를 `FE Lead/PO`로 추적한다.

## 하위 Task
- [T-169] 정의한다: 선택 조건 영역 스크롤 UX 기준과 수용 기준 (`./define-scope-and-acceptance/task.md`)
- [T-170] 구현한다: 선택 조건 영역 스크롤 viewport와 레이아웃 보호 규칙 (`./implement-main-scenario/task.md`)
- [T-171] 검증한다: 스크롤 도입 후 삭제/동기화 회귀와 스타일 계약 (`./validate-regression-and-failure-flow/task.md`)
- [T-172] 준비한다: 스크롤 릴리스 관측과 수동 검증 체크리스트 (`./prepare-observability-and-rollout/task.md`)
