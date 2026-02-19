# Iteration 05 릴리스 런북

## 메타
- 이터레이션: `iteration-05-p2-keyword-model-evolution`
- 갱신일: `2026-02-19`
- 대상 범위: `F-10`, `F-11`, `F-12`

## 1. 사전 점검 (Pre-release)
- 코드 게이트:
  - `npm test`
  - `npm run lint`
  - `npm run build`
- 키워드 입력 필수 시나리오:
  - `Enter`로 토큰 확정
  - `Blur`로 토큰 확정
  - 입력 비어 있을 때 `Backspace`로 마지막 토큰 삭제
  - 중복/길이초과/최대개수 초과 시 오류 메시지 및 `onInvalidToken` 호출
- 조합 상태 필수 시나리오:
  - region + keyword 동시 선택 시 `onChange` payload 정합성
  - 키워드 칩 개별 삭제/전체 삭제 시 region 상태와 충돌 없음

## 2. 관측/알람 기준
- 콜백 오류 알람:
  - 조건: `[ComposableSearch] callback error` 로그 발생
  - 조치: `region.onChange`, `region.onSelectedEupmyeondong`, `region.onClick`, `keyword.onClick`, `keyword.onInvalidToken` 재현
- 입력 정책 알람:
  - 조건: duplicate/length/max 오류율 급증
  - 조치: `maxTokens`, `maxTokenLength`, `normalization.casePolicy` 설정값 검토
- 계약 회귀 알람:
  - 조건: `publicTypeContract`, `apiUsageGuideContract` 실패
  - 조치: 공개 타입/가이드/예제 동기화 점검
- 임계값 정책:
  - 빌드/테스트 실패 허용치: `0`
  - 키워드 입력 성능 임계값: `TBD`

## 3. 배포 후 스모크 체크
1. 키워드 패널 오픈 후 `키워드 입력` label, guide text, 입력창 포커스 동작 확인
2. `React Query` 입력 시 `키워드: react query` 토큰 생성 확인
3. 동일 키워드 재입력 시 중복 에러 표시 확인
4. 토큰 길이/최대 개수 제한 초과 시 오류 문구 확인
5. region + keyword 조합에서 `onChange` payload 항목/순서 확인
6. 전체 삭제 시 region/keyword 칩 동시 제거 확인

## 4. 롤백 절차
- 롤백 조건:
  - 키워드 토큰 생성/삭제 불가 1건 이상
  - `onChange` 조합 payload 불일치 1건 이상
  - 공개 타입/문서와 구현 불일치 1건 이상
- 롤백 단계:
1. 직전 안정 버전으로 복구
2. 실패 재현 테스트(`keywordInputModel`, `ComposableSearch`, `callbackContract`) 고정
3. 패치 후 `npm test`, `npm run lint`, `npm run build` 재실행

## 5. Triage 포인트
- 상태머신/정규화:
  - `src/components/keywordInputModel.ts`
  - `src/components/keywordInputModel.test.ts`
- UI/조합 상태:
  - `src/components/ComposableSearch.tsx`
  - `src/components/KeywordDetailPanel.tsx`
  - `src/components/SelectedConditionBasket.tsx`
- 타입/콜백 계약:
  - `src/components/publicTypes.ts`
  - `src/components/callbackPipeline.ts`
  - `src/components/publicTypeContract.test.ts`
- 문서/가이드:
  - `docs/api-usage-guide.md`
  - `docs/keyword-input-state-machine.md`
  - `docs/migration-notes/keyword-input-model-evolution.md`
