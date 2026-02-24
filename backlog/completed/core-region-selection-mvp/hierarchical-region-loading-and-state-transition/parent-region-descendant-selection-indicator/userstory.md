# [US-039] 하위 선택의 상위 지역 색상 인디케이터 보장

## 메타
- ID: `US-039`
- 소속 Feature: `[F-02] 계층형 지역 로딩과 선택 상태 전이` (`../feature.md`)
- 소속 Epic: `[E-01] 코어 지역 선택 경험 MVP 완성` (`../../epic.md`)
- 우선순위: `P1`
- 상태: `Done`
- GitHub Issue: `TBD`

## 사용자 스토리
- As a: 최종 사용자
- I want: 읍/면/동 같은 하위 지역뿐 아니라 시/군/구/읍/면/동의 `전체` 항목을 선택했을 때도 상위 시/도/시/군/구에서 하위 선택 존재를 색상으로 바로 확인하고 싶다.
- So that: 현재 선택 경로를 컬럼을 오가며 다시 추적하지 않고도 빠르게 인지할 수 있다.

## 수용 기준
- [x] `서울특별시 > 강남구 > 역삼동` 선택 시 시/도 컬럼 `서울특별시`, 시/군/구 컬럼 `강남구`는 하위 선택 존재를 나타내는 별도 색상 상태(`has-descendant-selected`)로 표시된다.
- [x] `서울특별시 > 강남구 전체`처럼 하위 `전체` 항목 선택 시에도 시/도 컬럼 `서울특별시`, 시/군/구 컬럼 `강남구`가 `has-descendant-selected`로 표시된다.
- [x] `has-descendant-selected` 색상은 기본/`current`/직접 `selected` 상태와 시각적으로 구분된다. 특히 `current`와 `has-descendant-selected`가 모두 파랑 계열일 때도 진하기/채도 또는 보더 스타일 차이로 즉시 구분된다.
- [x] 하위 선택(`역삼동`)이 해제되면 상위(`서울특별시`, `강남구`)의 `has-descendant-selected` 상태는 즉시 제거된다.
- [x] `has-descendant-selected` 상태 추가가 FR-016(시각 상태 표기), FR-022(타이포그래피 일관성), FR-019/FR-021(상호 배타/자동 선택 금지) 동작을 깨지 않음을 검증한다.

## 하위 Task
- [T-153] 정의한다: 하위 선택 상위 색상 인디케이터 범위와 상태 우선순위 (`./define-scope-and-acceptance/task.md`)
- [T-154] 구현한다: 하위 선택 상위 색상 인디케이터 핵심 시나리오 (`./implement-main-scenario/task.md`)
- [T-155] 검증한다: 하위 선택 상위 색상 인디케이터 회귀와 실패 시나리오 (`./validate-regression-and-failure-flow/task.md`)
- [T-156] 준비한다: 하위 선택 상위 색상 인디케이터 관측과 릴리스 운영 (`./prepare-observability-and-rollout/task.md`)


