# Iteration 03 릴리스 런북

## 메타
- 이터레이션: `iteration-03-p1-style-and-api-hardening`
- 갱신일: `2026-02-19`
- 대상 범위: `F-04`, `F-09`

## 1. 사전 점검 (Pre-release)
- 코드 게이트:
  - `npm test`
  - `npm run lint`
  - `npm run build`
- 필수 타입 계약 시나리오:
  - `RegionSelectProps`가 `RegionDataSource` 계약을 만족한다.
  - `ComposableSearchProps`가 `region + keyword` 조합을 허용한다.
  - `types.ts` 경유 기존 import가 깨지지 않는다.
- 필수 스타일 격리 시나리오:
  - `src/index.css`에 `html/body/:root` 전역 selector가 존재하지 않는다.
  - `ComposableSearch.css`가 `cs-` 네임스페이스 기반으로만 동작한다.

## 2. 관측/알람 기준
- 타입 계약 회귀 알람:
  - 조건: `publicTypeContract`/`selectorTypeUtils` 테스트 실패
  - 조치: 공개 타입 변경 diff 확인 후 호환성 규칙 문서와 동기화
- 스타일 충돌 회귀 알람:
  - 조건: `styleIsolation.test.ts` 실패
  - 조치: 전역 selector 유입 경로 차단, 데모 전용 스타일 스코프 재검토
- 임계값 정책:
  - 빌드/테스트 실패 허용치: `0`
  - 운영 메트릭 임계값: `TBD` (저장소 공통 정책 확정 전)

## 3. 배포 후 스모크 체크
1. Demo 앱에서 `ComposableSearch` 렌더링 및 selector 동작 확인
2. 지역 선택/해제/전체 선택 상호배타 시나리오 재확인
3. 호스트 앱 공용 스타일(`body`, `button`)과 충돌 없음 확인

## 4. 롤백 절차
- 롤백 조건:
  - 공개 타입 계약 회귀 1건 이상
  - 스타일 스코프 격리 회귀 1건 이상
- 롤백 단계:
1. 직전 안정 커밋으로 배포 버전 복구
2. 실패 테스트 케이스(`publicTypeContract`, `styleIsolation`) 고정
3. 패치 후 `npm test`, `npm run lint`, `npm run build` 재실행

## 5. Triage 포인트
- 타입 계약 문제:
  - `src/components/publicTypes.ts`
  - `src/components/types.ts`
  - `src/components/selectorTypeUtils.ts`
- 스타일 문제:
  - `src/index.css`
  - `src/components/ComposableSearch.css`
  - `src/App.css`
