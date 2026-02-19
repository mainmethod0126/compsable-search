# Iteration 04 릴리스 런북

## 메타
- 이터레이션: `iteration-04-p1-callback-and-consumer-validation`
- 갱신일: `2026-02-19`
- 대상 범위: `F-05`, `F-06`

## 1. 사전 점검 (Pre-release)
- 코드 게이트:
  - `npm test`
  - `npm run lint`
  - `npm run build`
- 필수 콜백 시나리오:
  - `region.onClick`/`keyword.onClick` 호출 누락 없음
  - `region.onChange` payload가 선택 상태와 일치
  - `region.onSelectedEupmyeondong`은 선택 확정 시점에만 호출
- 필수 소비자 샘플 시나리오:
  - App 데모 이벤트 로그에 콜백 호출 결과가 누적
  - 이벤트 로그 초기화 동작 정상

## 2. 관측/알람 기준
- 콜백 오류 알람:
  - 조건: `[ComposableSearch] callback error` 로그 발생
  - 조치: 콜백 종류(`region.onChange`, `region.onSelectedEupmyeondong`, `region.onClick`, `keyword.onClick`)별 입력/예외 재현
- 계약 회귀 알람:
  - 조건: `callbackContract`, `apiUsageGuideContract` 테스트 실패
  - 조치: 타입 계약/문서 예제/구현 연결 경로 재검토
- 임계값 정책:
  - 빌드/테스트 실패 허용치: `0`
  - 운영 메트릭 임계값: `TBD`

## 3. 배포 후 스모크 체크
1. 지역 selector 클릭 시 상세 영역 토글 + `region.onClick` 로그 생성 확인
2. 읍/면/동 선택/해제 시 `onChange` payload 및 `onSelectedEupmyeondong` 호출 규칙 확인
3. keyword selector 클릭 시 `keyword.onClick` 로그 생성 확인
4. 콜백에서 예외를 발생시켜도 UI 흐름이 유지되는지 확인

## 4. 롤백 절차
- 롤백 조건:
  - 콜백 누락 또는 오호출 1건 이상
  - 콜백 예외로 UI 흐름 중단 1건 이상
  - 문서 예제와 타입 계약 불일치 1건 이상
- 롤백 단계:
1. 직전 안정 버전으로 복구
2. 실패 테스트(`callbackContract`, `App.test`, `apiUsageGuideContract`) 고정
3. 패치 후 `npm test`, `npm run lint`, `npm run build` 재실행

## 5. Triage 포인트
- 콜백 실행/오류 처리:
  - `src/components/callbackPipeline.ts`
  - `src/components/ComposableSearch.tsx`
- 소비자 샘플:
  - `src/App.tsx`
  - `src/App.css`
  - `src/App.test.tsx`
- 문서/계약 정합성:
  - `docs/api-usage-guide.md`
  - `src/components/apiUsageGuideContract.test.ts`
