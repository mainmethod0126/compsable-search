# [US-046] 미리보기 UI와 선택 조건 연동

## 메타
- ID: `US-046`
- 소속 Feature: `[F-15] 지역 검색 모델과 미리보기 선택 연동 구현` (`../feature.md`)
- 소속 Epic: `[E-06] 지역 검색 미리보기 선택 경험 구현` (`../../epic.md`)
- 우선순위: `P0`
- 상태: `TBD`
- GitHub Issue: `TBD`

## 사용자 스토리
- As a: 최종 사용자
- I want: 지역명을 일부 입력하면 일치 후보를 보고 클릭으로 바로 선택하고 싶다.
- So that: 계층 컬럼을 모두 탐색하지 않고도 원하는 지역 조건을 빠르게 추가할 수 있다.

## 수용 기준
- [ ] 시/도 컬럼 상단에 검색 입력이 표시되고 좌측 SVG 아이콘 슬롯이 동작한다.
- [ ] 입력값과 부분 일치하는 미리보기 목록이 즉시 갱신된다.
- [ ] 미리보기 항목은 경로 문자열 형식으로 표시된다.
- [ ] 미리보기 클릭 시 선택 조건 칩이 정확히 1회 추가되고 기존 중복/상호배타 규칙이 유지된다.
- [ ] `onChange`, `onSelectedEupmyeondong` 콜백 계약이 기존 동작과 호환된다.

## 하위 Task
- [T-180] 구현한다: 지역 검색 입력과 미리보기 목록 UI (`./implement-region-search-input-and-preview-list-ui/task.md`)
- [T-181] 연동한다: 미리보기 선택과 조건 정책/콜백 파이프라인 (`./integrate-preview-selection-with-condition-policy-and-callbacks/task.md`)
- [T-182] 검증한다: 지역 검색 플로우 통합/회귀 테스트 (`./verify-integration-and-regression-for-region-search-flow/task.md`)

