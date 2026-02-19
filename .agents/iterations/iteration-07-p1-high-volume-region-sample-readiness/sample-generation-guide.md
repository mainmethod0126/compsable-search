# Iteration 07 샘플 생성 운영 가이드

## 메타
- 이터레이션: `iteration-07-p1-high-volume-region-sample-readiness`
- 관련 Task: `T-160`
- 갱신일: `2026-02-19`
- 근거 코드: `src/DemoService.ts`, `src/DemoService.test.ts`

## 1. 변경 원칙
- `DEMO_REGION_PROFILE_SPECS`를 단일 진입점으로 사용한다.
- 프로파일 추가/변경 시 생성기 로직과 테스트를 함께 수정한다.
- 코드 규칙(2/5/10자리, 접두 정합성, 전역 유일성)을 깨는 변경은 금지한다.

## 2. 프로파일 변경 절차
1. `src/DemoService.ts`의 `DEMO_REGION_PROFILE_SPECS`에서 수량/용도를 조정한다.
2. 필요 시 코드 풀(`SIDO_CODE_POOL`) 또는 naming 규칙을 확장한다.
3. `src/DemoService.test.ts` 기대값을 업데이트한다.
4. `npm run test:large` + `npm test`를 실행해 회귀를 확인한다.

## 3. PR 리뷰 체크리스트
- [ ] 프로파일 수량 변경 이유와 영향 범위를 PR 설명에 기록했다.
- [ ] `region.code` 유일성/계층 정합성 테스트가 통과한다.
- [ ] 대량 시나리오 테스트(`ComposableSearch`, `App`)가 통과한다.
- [ ] 전환 UX/레이아웃 보호 스타일 회귀가 없다.
- [ ] 문서(`profile-spec.md`, `validation-matrix.md`, `release-runbook.md`)를 동기화했다.

## 4. 장애 시 안전 복귀 절차
1. 프로파일 변경 커밋을 revert한다.
2. `small` 프로파일 기준으로 앱 동작을 복구한다.
3. 실패 케이스를 `src/DemoService.test.ts` 또는 `src/components/ComposableSearch.test.tsx`에 고정한다.
4. `npm test`, `npm run lint`, `npm run build` 재실행 후 재배포한다.
