# Iteration 04 실행 로그

## 메타
- 이터레이션: `iteration-04-p1-callback-and-consumer-validation`
- 갱신일: `2026-02-19`
- 이번 반영 범위: `T-049~T-072`

## 1. 정의 (T-049, T-053, T-057, T-061, T-065, T-069)
- F-05 범위를 `callbackPipeline` 단일 경계로 정리했다.
  - `onChange`, `onSelectedEupmyeondong`, `onClick(region/keyword)`를 동일 오류 처리 정책으로 실행
- F-06 범위를 `소비자 샘플 + 계약 테스트 + API 가이드` 3개 축으로 확정했다.
- 콜백 오류 정책을 `UI non-blocking + console.error 로깅`으로 명시했다.

## 2. 구현 (T-050, T-054, T-058, T-062, T-066, T-070)
- 콜백 파이프라인 구현:
  - `src/components/callbackPipeline.ts`
  - `dispatchRegionOnChange`, `dispatchRegionOnSelectedEupmyeondong`, `dispatchRegionOnClick`, `dispatchKeywordOnClick`
- `ComposableSearch`에 표준 콜백 경로 연결:
  - `src/components/ComposableSearch.tsx`
  - `onSelectedEupmyeondong`는 선택 확정(on) 시점에만 호출
  - 콜백 예외 발생 시에도 state 업데이트/렌더링 흐름 유지
- 소비자 통합 샘플 갱신:
  - `src/App.tsx`, `src/App.css`
  - region/keyword callback event log UI 추가
- API 가이드 동기화:
  - `docs/api-usage-guide.md`
  - `README.md` 사용 예시/문서 링크 갱신

## 3. 검증 (T-051, T-055, T-059, T-063, T-067, T-071)
### TDD 실행 로그
- Red:
  - `src/components/callbackContract.test.tsx` 추가 후 `callbackPipeline` 모듈 미존재 실패 확인
- Green:
  - callback pipeline 구현 및 `ComposableSearch` 연결 후 테스트 통과
- Refactor:
  - 콜백 실행/오류 처리 공통 로직을 `callbackPipeline.ts`로 이동해 중복 제거

### 검증 코드
- `src/components/callbackContract.test.tsx`
- `src/App.test.tsx`
- `src/components/apiUsageGuideContract.test.ts`

### 검증 명령
- `npm test`
- `npm run lint`
- `npm run build`

### 결과
- 테스트: `8 files, 43 tests` 통과
- 린트: 통과
- 빌드: 통과

## 4. 운영 준비 (T-052, T-056, T-060, T-064, T-068, T-072)
- 이터레이션 4 릴리스 런북 작성:
  - `.agents/iterations/iteration-04-p1-callback-and-consumer-validation/release-runbook.md`
- 콜백 오류 triage 경로 및 롤백 조건 정의
- 문서-구현 정합성 검증 지점을 계약 테스트로 고정

## 5. 잔여 리스크
- callback payload 버전 정책(`0.1.x` vs `0.2.0`) 세분화는 `TBD`
- 소비자 샘플 CI 표준 환경(외부 예제 앱 분리 포함)은 `TBD`
