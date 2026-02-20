# Iteration 08 선택 조건 스크롤 UX 정책

## 메타
- 이터레이션: `iteration-08-p0-selected-condition-scroll-containment`
- 관련 Task: `T-169`
- 갱신일: `2026-02-20`
- 대상 범위: `US-043`

## 1. 확정 정책
- 스크롤 축:
  - 세로 스크롤만 허용한다. (`overflow-y: auto`, `overflow-x: hidden`)
- 높이 상한:
  - 데스크톱 기본 상한: `144px`
  - 모바일(`@media (max-width: 768px)`) 상한: `112px`
- 적용 기준:
  - 칩 수 고정 임계치가 아니라, 리스트 콘텐츠 높이가 상한을 초과하는 시점에 스크롤을 활성화한다.
- 헤더 고정:
  - 별도 sticky는 적용하지 않는다.
  - 헤더와 리스트 viewport를 구조적으로 분리해 스크롤 시 상단 액션 영역(제목/전체 삭제)은 고정된 위치를 유지한다.

## 2. 구현 계약
- `SelectedConditionBasket`은 아래 책임 경계를 갖는다.
  - `cs-selected-condition-header`: 제목/전체삭제 액션
  - `cs-selected-condition-scroll`: 스크롤 viewport
  - `cs-selected-condition-list`: 칩 래핑 레이아웃
- 핵심 상호작용 계약(개별 삭제/전체 삭제/`onChange`)은 스크롤 도입 전후 동일하게 유지한다.

## 3. 수용 기준 매핑
- AC-1: 스크롤/높이 상한 정책은 `src/components/ComposableSearch.css`로 강제한다.
- AC-2: 기능 계약 회귀는 `src/components/ComposableSearch.test.tsx`로 검증한다.
- AC-3: 스타일 계약 회귀는 `src/styleIsolation.test.ts`로 검증한다.

## 4. 후속 추적 항목
- 재검토 오너: `FE Lead`, `PO`
- 재검토 트리거:
  - 모바일에서 칩 가시성 저하 이슈 접수
  - 삭제 버튼 접근성 저하 리포트 접수
  - 대량 칩(100+) 입력 시 조작성 저하 징후
