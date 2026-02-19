# Iteration 07 릴리스 런북

## 메타
- 이터레이션: `iteration-07-p1-high-volume-region-sample-readiness`
- 관련 Task: `T-168`
- 갱신일: `2026-02-19`
- 대상 범위: `US-040`, `US-041`, `US-042`

## 1. 사전 점검 (Pre-release)
- 코드 게이트:
  - `npm test`
  - `npm run lint`
  - `npm run build`
  - `npm run test:large`
- 문서 게이트:
  - `profile-spec.md`
  - `profile-switch-ux-policy.md`
  - `validation-matrix.md`
  - `manual-qa-checklist.md`

## 2. 관측 지표
- 앱 내 기준선 패널(`src/App.tsx`):
  - 패널 오픈 시간
  - 첫 선택 반영 시간
  - `region.onClick` 호출 횟수
  - `region.onChange` 호출 횟수
  - `region.onSelectedEupmyeondong` 호출 횟수
- 대량 회귀 테스트 지표:
  - `npm run test:large` 총 실행 시간
  - 실패율(최근 3회 기준)

## 3. 롤백 트리거
- 프로파일 전환 후 이전 선택 상태 잔존
- `large` 프로파일에서 선택/해제/전체선택/초기화 동작 실패
- 콜백 계약(`onClick/onChange/onSelectedEupmyeondong`) 누락
- `npm run test:large` 연속 실패 또는 급격한 시간 증가

## 4. 롤백 절차
1. 직전 안정 커밋으로 복구한다.
2. `src/DemoService.ts`, `src/App.tsx`, `src/components/ComposableSearch.css` 변경분을 우선 역추적한다.
3. 회귀 케이스를 테스트로 고정한다.
4. `npm test`, `npm run lint`, `npm run build`, `npm run test:large` 재검증 후 재배포한다.

## 5. 배포 후 점검 (Post-release)
1. `small -> medium -> large` 전환 스모크
2. `large`에서 열기/선택/해제/전체선택/전체삭제 스모크
3. 성능 기준선 패널 값이 `미측정`에서 측정값으로 전환되는지 확인
4. 이벤트 로그와 콜백 횟수 증가가 사용자 조작과 일치하는지 확인
