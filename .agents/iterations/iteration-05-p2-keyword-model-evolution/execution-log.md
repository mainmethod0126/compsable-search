# Iteration 05 실행 로그

## 메타
- 이터레이션: `iteration-05-p2-keyword-model-evolution`
- 갱신일: `2026-02-19`
- 이번 반영 범위: `T-109~T-144`

## 1. 정의 (T-109, T-113, T-117, T-121, T-125, T-129, T-133, T-137, T-141)
- E-04 범위를 `키워드 입력 상태머신 + 토큰 모델 + 조합 상태 payload`로 명확히 분해했다.
- 키워드 입력 핵심 상태를 `idle`, `typing`, `token-committed`, `max-token-reached`로 정의했다.
- 토큰 정규화/검증 정책을 기본값과 함께 명시했다.
  - 공백 정리, 소문자 정규화, 중복 차단, 길이/개수 제한
- F-12 범위에서 공개 타입/가이드/마이그레이션 문서 동기화 경계를 확정했다.

## 2. 구현 (T-110, T-114, T-118, T-122, T-126, T-130, T-134, T-138, T-142)
- 키워드 입력 모델 구현:
  - `src/components/keywordInputModel.ts`
  - 상태 전이, 정규화, 오류 메시지, 토큰 동등성 비교 유틸 분리
- 검색 컴포넌트 조합 상태 구현:
  - `src/components/ComposableSearch.tsx`
  - region/keyword 패널 전환, 키보드 이벤트 처리, 조합 `onChange` payload 송신
- 키워드 입력 패널 UI 구현:
  - `src/components/KeywordDetailPanel.tsx`
  - 접근성 label/hint/alert + 토큰 카운터
- 선택 칩/타입/콜백 경계 확장:
  - `src/components/SelectedConditionBasket.tsx`
  - `src/components/publicTypes.ts`
  - `src/components/callbackPipeline.ts`
  - `src/components/internalTypes.ts`
  - `src/components/types.ts`
  - `src/components/index.ts`
- 소비자 샘플/가이드 반영:
  - `src/App.tsx`
  - `docs/api-usage-guide.md`
  - `docs/keyword-input-state-machine.md`
  - `docs/migration-notes/keyword-input-model-evolution.md`
  - `docs/public-api-compatibility-rules.md`
  - `README.md`

## 3. 검증 (T-111, T-115, T-119, T-123, T-127, T-131, T-135, T-139, T-143)
### TDD 실행 로그
- Red:
  - `src/components/keywordInputModel.test.ts` 추가 후 모듈 미존재/키워드 입력 UI 부재 실패 확인
  - `src/components/ComposableSearch.test.tsx` 키워드 패널/정규화/제약 시나리오 실패 확인
  - `src/components/callbackContract.test.tsx` 조합 payload 실패 확인
- Green:
  - 키워드 상태머신/입력 UI/조합 payload 구현으로 신규 실패 케이스 통과
  - 공개 타입/가이드 계약 테스트 통과
- Refactor:
  - 입력 정책/검증 로직을 `keywordInputModel.ts`로 분리해 SRP 확보
  - UI 컴포넌트(`KeywordDetailPanel`)와 상태 전이 로직을 분리해 유지보수 경계 명확화

### 검증 코드
- `src/components/keywordInputModel.test.ts`
- `src/components/ComposableSearch.test.tsx`
- `src/components/callbackContract.test.tsx`
- `src/components/publicTypeContract.test.ts`
- `src/components/apiUsageGuideContract.test.ts`
- `src/App.test.tsx`

### 검증 명령
- `npm test`
- `npm run lint`
- `npm run build`

### 결과
- 테스트: `9 files, 56 tests` 통과
- 린트: 통과
- 빌드: 통과

## 4. 운영 준비 (T-112, T-116, T-120, T-124, T-128, T-132, T-136, T-140, T-144)
- 이터레이션 5 릴리스 런북 작성:
  - `.agents/iterations/iteration-05-p2-keyword-model-evolution/release-runbook.md`
- 상태머신/입력 정책 관측 포인트를 `onInvalidToken`, `onChange` payload 검증으로 고정
- 문서-구현 정합성 검증을 계약 테스트(`apiUsageGuideContract`, `publicTypeContract`)에 반영

## 5. 잔여 리스크
- 대량 토큰 입력(고성능 경계: 100개+)에서 렌더링/상태 업데이트 비용 기준은 `TBD`
- `onChange` payload 정렬 정책 커스터마이징 요구는 `TBD`
