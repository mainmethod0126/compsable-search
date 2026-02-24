# [F-01] 검색 컨테이너와 Selector 오케스트레이션

## 메타
- ID: `F-01`
- 소속 Epic: `[E-01] 코어 지역 선택 경험 MVP 완성` (`../epic.md`)
- 우선순위: `P0`
- 상태: `Done`
- GitHub Issue: `TBD`

## 사용자 가치
- 가치:
  - 소비자 애플리케이션은 `ComposableSearch` 하나로 selector 레이아웃과 상호작용 시작점을 일관되게 통합할 수 있다.
  - 최종 사용자는 selector 순서가 고정된 예측 가능한 탐색 흐름을 경험할 수 있다.
- 수용 기준:
  - [x] `region`, `keyword`, `sort` selector가 정의된 순서대로 항상 렌더링된다.
  - [x] region 트리거 클릭 시 상세 패널 열기/닫기가 토글되고, 재오픈 시 직전 선택 컨텍스트를 유지한다.
  - [x] selector 콘텐츠 주입 지점이 문서화된 계약대로 렌더링되어 확장 selector 추가 시 기존 동작이 깨지지 않는다.
  - [x] 상세 콘텐츠가 없는 상태에서 빈 영역 처리 정책(placeholder 또는 미노출)이 일관되게 동작한다.

## 하위 UserStory
- [US-001] Selector 레이아웃과 순서 보존 (`./selector-layout-order-preservation/userstory.md`)
- [US-002] Region 트리거 상세 패널 토글 (`./region-trigger-detail-panel-toggle/userstory.md`)
- [US-003] Selector 콘텐츠 주입 계약 (`./selector-content-injection-contract/userstory.md`)

## 의존성
- 선행:
  - `TBD`
- 후행:
  - `[F-02] 계층형 지역 로딩과 선택 상태 전이` (`../hierarchical-region-loading-and-state-transition/feature.md`)
  - `[F-03] 선택 조건 칩/삭제/중복 방지 처리` (`../selected-condition-chip-and-dedup-management/feature.md`)


