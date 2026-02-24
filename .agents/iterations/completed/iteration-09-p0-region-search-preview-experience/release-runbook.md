# Iteration 09 릴리스 런북

## 메타
- 이터레이션: `iteration-09-p0-region-search-preview-experience`
- 관련 Task: `T-185`
- 작성일: `2026-02-24`

## 1. 사전 점검
- 코드 게이트:
  - `npm run test`
  - `npm run lint`
  - `npm run build`
- 문서 게이트:
  - `region-search-policy.md`
  - `execution-log.md`
  - `observability-plan.md`
  - `risk-review.md`

## 2. 배포 후 스모크
1. `지역 검색` 입력 `수` -> `경기도 > 수원시 장안구 > 조원동` 선택
2. 조건 칩 생성 확인
3. 동일 칩 재선택 시 토글 정책 확인
4. `서` 검색 후 `충청남도 > 서산시` 선택 확인
5. `전체 삭제` 후 payload 초기화 확인

## 3. 롤백 트리거
- 검색 입력 박스가 `cs-selector-area` 바깥 아래 형제 영역에서 사라지거나, `cs-selector-area`/`cs-detailed-area` 내부로 이동한 경우
- 미리보기 클릭 시 조건 칩 미생성 또는 중복 생성
- callback error 로그 급증
- 회귀 테스트 실패

## 4. 롤백 절차
1. 지역 검색 도입 커밋(`ComposableSearch.tsx`, `RegionSearchInput.tsx`, `regionSearchModel.ts`)을 되돌린다.
2. `npm run test`, `npm run lint`, `npm run build`를 재실행한다.
3. 안정 버전 재배포 후 오류 로그 정상화 여부를 확인한다.


