# [US-038] 지역 항목 타이포그래피 일관성 보장

## 메타
- ID: `US-038`
- 소속 Feature: `[F-02] 계층형 지역 로딩과 선택 상태 전이` (`../feature.md`)
- 소속 Epic: `[E-01] 코어 지역 선택 경험 MVP 완성` (`../../epic.md`)
- 우선순위: `P1`
- 상태: `TBD`
- GitHub Issue: `TBD`

## 사용자 스토리
- As a: 최종 사용자
- I want: 체크박스 기반 지역 텍스트와 일반 지역 item 텍스트가 같은 폰트/사이즈로 보이길 원한다.
- So that: 지역 선택 화면이 이질감 없이 자연스럽게 보이고 선택 맥락을 더 쉽게 인지할 수 있다.

## 수용 기준
- [ ] 시/군/구 컬럼의 `시/도 전체` 체크박스 라벨 텍스트와 일반 시/군/구 item 텍스트는 동일한 `font-family`, `font-size`, `font-weight`, `line-height`를 사용한다.
- [ ] 읍/면/동 체크박스 라벨 텍스트와 시/도/시/군/구 일반 item 텍스트는 동일한 타이포그래피 기준을 따른다.
- [ ] `selected/current/hover` 상태에서도 타이포그래피 값은 유지되고, 강조는 색상/배경 등 비타이포 속성으로만 구분된다.
- [ ] 타이포그래피 정합성 변경이 FR-016(시각 상태 표기)과 기존 선택 토글 동작(FR-007~FR-021)을 깨지 않음을 검증한다.

## 하위 Task
- [T-149] 정의한다: 지역 항목 타이포그래피 일관성 범위와 수용 기준 (`./define-scope-and-acceptance/task.md`)
- [T-150] 구현한다: 지역 항목 타이포그래피 일관성 핵심 시나리오 (`./implement-main-scenario/task.md`)
- [T-151] 검증한다: 지역 항목 타이포그래피 일관성 회귀와 실패 시나리오 (`./validate-regression-and-failure-flow/task.md`)
- [T-152] 준비한다: 지역 항목 타이포그래피 일관성 관측과 릴리스 운영 (`./prepare-observability-and-rollout/task.md`)
