# [US-041] 데모 프로파일 전환과 대량 리스트 UX 안정화

## 메타
- ID: `US-041`
- 소속 Feature: `[F-13] 결정적 지역 샘플 프로파일과 대량 검증 워크플로우` (`../feature.md`)
- 소속 Epic: `[E-05] 대량 지역 샘플 확장과 검증 가능성 확보` (`../../epic.md`)
- 우선순위: `P0`
- 상태: `TBD`
- GitHub Issue: `TBD`

## 사용자 스토리
- As a: QA 엔지니어
- I want: 데모에서 샘플 프로파일을 즉시 전환하고 대량 목록에서도 동일한 조작 흐름을 확인하길 원한다.
- So that: 실제 대량 데이터 상황의 UI/UX 위험을 빠르게 재현하고 결함 여부를 판단할 수 있다.

## 수용 기준
- [ ] 데모 UI에서 `small`, `medium`, `large` 전환이 앱 재실행 없이 동작한다.
- [ ] `large` 프로파일에서 가로 overflow, 클릭 불가, 선택 표시 불일치가 발생하지 않는다.
- [ ] 모바일(`<=768px`)과 데스크톱(`>=1024px`) 모두에서 열기/선택/해제/전체 선택 조작이 가능하다.
- [ ] 프로파일 전환 후에도 `onClick`, `onChange`, `onSelectedEupmyeondong` 콜백 계약이 유지된다.
- [ ] 프로파일 전환 시 초기화/유지 정책(선택 상태, 현재 컬럼 포커스)이 정의된 규칙대로 동작한다.

## 하위 Task
- [T-161] 정의한다: 프로파일 전환 UX와 레이아웃 보호 기준 (`./define-scope-and-acceptance/task.md`)
- [T-162] 구현한다: 데모 프로파일 전환 UI와 상태 연동 (`./implement-main-scenario/task.md`)
- [T-163] 검증한다: 대량 리스트 상호작용과 콜백 계약 회귀 (`./validate-regression-and-failure-flow/task.md`)
- [T-164] 준비한다: 데스크톱/모바일 수동 점검 체크리스트 (`./prepare-observability-and-rollout/task.md`)
