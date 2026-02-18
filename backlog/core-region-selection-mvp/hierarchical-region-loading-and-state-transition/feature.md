# [F-02] 계층형 지역 로딩과 선택 상태 전이

## 메타
- ID: `F-02`
- 소속 Epic: `[E-01] 코어 지역 선택 경험 MVP 완성` (`../epic.md`)
- 우선순위: `P0`
- 상태: `TBD`
- GitHub Issue: `TBD`

## 사용자 가치
- 가치:
  - 최종 사용자는 시/도 -> 시/군/구 -> 읍/면/동 탐색을 단계적으로 수행하며 현재 선택 맥락을 잃지 않는다.
  - 유지보수자는 계층형 상태 전이 규칙을 명시적으로 검증해 회귀를 줄일 수 있다.
- 수용 기준:
  - [ ] 시/도 선택 변경 시 하위(시/군/구, 읍/면/동) 상태가 정책에 맞게 초기화되고 목록이 재로딩된다.
  - [ ] 시/군/구 선택 후 읍/면/동 목록 로딩에서 `로딩/빈 결과/에러` 상태가 구분되어 표시되며, 빈 상태 문구는 상위 미선택(`상위 지역을 먼저 선택해 주세요.`)과 상위 선택 후 빈 결과(`표시할 지역이 없습니다.`)를 구분한다.
  - [ ] 지역 체크 토글 시 `selected condition` 상태와 UI 체크 상태가 즉시 동기화된다.
  - [ ] FR-020(시/군/구 컬럼 `시/도 전체` 직접 체크 + 읍/면/동 중복 제거), FR-019(시/도 전체 vs 시/군/구 상세), FR-021(시/군/구 목록 갱신 후 사용자 명시 선택 전 자동 선택 금지) 정책이 적용되어 충돌 조건이 동시 선택되지 않는다.
  - [ ] 시/군/구 컬럼의 `시/도 전체` 체크는 즉시 조건에 반영되고, 읍/면/동 컬럼에 동일한 `시/도 전체` 체크 항목이 다시 나타나지 않는다.
  - [ ] `서울특별시 전체`와 `서울특별시 강남구`, `부산광역시 해운대구`와 `부산광역시 전체` 같은 충돌 조합에서 마지막 선택만 유지된다.
  - [ ] 시/도 선택 변경 직후 또는 `서울특별시 전체` 체크 후 해제 직후에도 `강남구`가 자동 current/선택되지 않고, 사용자가 시/군/구를 직접 클릭하기 전까지 하위 상태가 비선택으로 유지된다.
  - [ ] 체크박스 기반 지역 항목 텍스트(`시/도 전체`, 읍/면/동)와 일반 지역 item 텍스트(시/도/시/군/구)의 타이포그래피(`font-family/font-size/font-weight/line-height`)가 동일하게 유지된다(FR-022).
  - [ ] `서울특별시 > 강남구 > 역삼동`처럼 하위 지역이 선택되면 시/도(`서울특별시`)와 시/군/구(`강남구`) 항목에 하위 선택 존재를 나타내는 별도 색상 상태(`has-descendant-selected`)가 표시되고, `current`와는 파랑 계열 내 진하기/보더 스타일 차이로 구분되며, 마지막 하위 선택 해제 시 원복된다(FR-023).

## 하위 UserStory
- [US-004] 1단계 지역 로딩과 전이 처리 (`./province-loading-and-transition/userstory.md`)
- [US-005] 2~3단계 지역 로딩 예외 처리 (`./district-and-town-loading-exception-handling/userstory.md`)
- [US-006] 지역 선택 체크 토글 동기화 (`./region-selection-toggle-synchronization/userstory.md`)
- [US-037] 시/도 전체와 하위 시/군/구 상호 배타 보장 (`./province-whole-and-district-mutual-exclusion/userstory.md`)
- [US-038] 지역 항목 타이포그래피 일관성 보장 (`./region-item-typography-consistency/userstory.md`)
- [US-039] 하위 선택의 상위 지역 색상 인디케이터 보장 (`./parent-region-descendant-selection-indicator/userstory.md`)

## 의존성
- 선행:
  - `[F-01] 검색 컨테이너와 Selector 오케스트레이션` (`../search-container-and-selector-orchestration/feature.md`)
- 후행:
  - `[F-03] 선택 조건 칩/삭제/중복 방지 처리` (`../selected-condition-chip-and-dedup-management/feature.md`)
