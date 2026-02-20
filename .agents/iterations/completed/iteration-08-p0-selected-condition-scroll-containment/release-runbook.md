# Iteration 08 릴리스 런북

## 메타
- 이터레이션: `iteration-08-p0-selected-condition-scroll-containment`
- 관련 Task: `T-172`
- 갱신일: `2026-02-20`
- 대상 범위: `US-043`

## 1. 사전 점검 (Pre-release)
- 코드 게이트:
  - `npm test`
  - `npm run lint`
  - `npm run build`
- 문서 게이트:
  - `scroll-ux-policy.md`
  - `manual-qa-checklist.md`
  - `execution-log.md`

## 2. 관측 포인트
- 기능 관측:
  - 선택 조건 다량 상태에서 칩 개별 삭제 성공률
  - `전체 삭제` 성공률
  - 스크롤 영역 내부에서 클릭 불가/포커스 불가 이슈 건수
- 계약 관측:
  - 삭제 직후 `region.onChange` payload 길이 변화
  - `전체 삭제` 직후 `region.onChange` payload가 `[]`인지 여부

## 3. 롤백 트리거
- 칩 다량 상태에서 삭제 버튼 클릭 불가
- `전체 삭제` 불가 또는 잔존 칩 발생
- 스크롤 영역이 레이아웃을 깨뜨려 상세 패널 접근 불가
- 자동 테스트(`npm test`)에서 `ComposableSearch`/`styleIsolation` 회귀 실패

## 4. 롤백 절차
1. `SelectedConditionBasket` 스크롤 viewport 분리 변경을 우선 역추적한다.
2. `src/components/SelectedConditionBasket.tsx`, `src/components/ComposableSearch.css`를 직전 안정 버전으로 되돌린다.
3. `npm test`, `npm run lint`, `npm run build`를 재실행한다.
4. 회귀 원인을 테스트 케이스로 먼저 고정한 뒤 재배포한다.

## 5. 배포 후 스모크
1. 키워드 8개 이상 추가 후 스크롤 활성화 확인
2. 스크롤 하단 칩 개별 삭제 확인
3. `전체 삭제` 확인
4. 모바일 해상도에서 높이 상한(`112px`) 및 스크롤 확인
