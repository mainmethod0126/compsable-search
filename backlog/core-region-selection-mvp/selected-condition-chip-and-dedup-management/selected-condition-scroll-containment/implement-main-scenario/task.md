# [T-170] 구현한다: 선택 조건 영역 스크롤 viewport와 레이아웃 보호 규칙

## 메타
- ID: `T-170`
- 소속 UserStory: `[US-043] 선택 조건 영역 스크롤과 레이아웃 보호` (`../userstory.md`)
- 소속 Feature: `[F-03] 선택 조건 칩/삭제/중복 방지 처리` (`../../feature.md`)
- 소속 Epic: `[E-01] 코어 지역 선택 경험 MVP 완성` (`../../../epic.md`)
- 유형: `프론트엔드`
- 담당 역할: `프론트엔드 엔지니어`
- 우선순위: `P0`
- 난이도: `High`
- GitHub Issue: `TBD`

## 작업 내용
- 목표: 선택 조건 칩 대량 상태에서도 컴포넌트 높이 확장을 제한하고 내부 스크롤 탐색을 가능하게 만든다.
- 구현 항목: `SelectedConditionBasket` 구조를 헤더와 스크롤 viewport 책임으로 분리한다. / `ComposableSearch.css`에 `max-height`, `overflow-y`, 반응형 브레이크포인트 규칙을 추가한다. / 개별 삭제/전체 삭제/onChange 계약과 접근성 라벨 동작을 유지한다.
- 선행조건: [T-169] 정의한다: 선택 조건 영역 스크롤 UX 기준과 수용 기준 완료

## 검증과 완료 조건
- 검증 방법(테스트/리뷰/지표): 로컬 UI 점검에서 칩 30~200개 상태의 스크롤 활성화와 삭제 조작 가능 여부를 확인한다.
- 산출물: `src/components/SelectedConditionBasket.tsx`, `src/components/ComposableSearch.css` 변경 코드
- 완료 정의(DoD): 데스크톱/모바일에서 선택 영역이 높이 상한을 유지하며 핵심 상호작용이 차단되지 않는다.
