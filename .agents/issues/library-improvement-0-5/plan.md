# ComposableSearch 0.5.0 만점(10/10) 달성 설계 플랜

## 요약
- 목표: 라이브러리 평가 축 `사용성/편의성/확장성/코드 품질`을 10점 수준으로 끌어올리는 `0.5.0` 설계·구현 계획 수립.
- 전략: `사용자경험 우선`으로 설계하되, breaking 변경을 허용해 계약을 단순화하고 예측 가능성을 극대화.
- 릴리스 라인: `0.5.0` (breaking 허용), RC 검증 후 GA.
- 핵심 결정: `selectors 타입+런타임 필수화`, `중복 selector type 금지(에러)`, `deprecated 호환 필드 완전 제거`, `React peer ^18.3 || ^19`, `plugin/selector 검증 게이트 기본 포함`.

## 만점 기준 (평가 루브릭)
1. 사용성 10점 기준
- async/sync/mixed 데이터소스에서 검색 결과 일관성 100% 보장.
- loading/error/empty 상태가 사용자에게 명확히 구분되어 표시.
- 구성 오류는 조용히 무시되지 않고 즉시 명확한 오류로 드러남.

2. 편의성 10점 기준
- 설치 후 최소 예제로 즉시 동작.
- 마이그레이션 경로가 자동화(codemod) + 문서 + 체크리스트로 제공.
- React 18/19 소비자 모두 지원.

3. 확장성 10점 기준
- selector/plugin 구성 검증 API가 표준화되어 CI에 통합 가능.
- 런타임 정책(검증/오류 코드)이 타입 계약과 일치.
- 확장 실패 시 원인 코드 단위로 진단 가능.

4. 코드 품질 10점 기준
- 계약/회귀/패키징 테스트 게이트 전부 통과.
- 공개 API 문서와 테스트 계약이 동기화.
- 복잡도 높은 런타임 로직을 검증 가능한 경계로 분리.

## 공개 API/인터페이스/타입 변경 (중요)
| 구분 | 변경 내용 | 호환성 |
|---|---|---|
| `ComposableSearchProps.selectors` | optional -> required | Breaking |
| `ComposableSearchProps.selectorsProps` | 제거 | Breaking |
| `ComposableSearchProps.onChange` | 제거 | Breaking |
| `RegionSelectOptions.placeHolder` | 제거 (`placeholder`만 허용) | Breaking |
| `KeywordSelectOptions.placeHolder` | 제거 (`placeholder`만 허용) | Breaking |
| 중복 selector type | `first-wins` 제거, 구성 오류로 즉시 실패 | Breaking |
| plugin type 미매칭 | 경고 -> 구성 오류로 즉시 실패 | Breaking |
| React peer | `^19` -> `^18.3 || ^19` | Additive |
| 신규 공개 유틸 | `validateComposableSearchConfiguration(config)` 추가 | Additive |
| 신규 에러 타입 | `ComposableSearchConfigErrorCode`, `ComposableSearchConfigError` 추가 | Additive |

### 신규 에러 코드 (고정)
- `MISSING_SELECTORS`
- `EMPTY_SELECTORS`
- `DUPLICATE_SELECTOR_TYPE`
- `PLUGIN_SELECTOR_TYPE_MISMATCH`

### 에러 정책 (고정)
- 위 4개는 개발/프로덕션 모두에서 런타임 예외로 처리.
- 에러 메시지는 코드 + 원인 + 해결 가이드 문구를 포함.
- 기존 warning-once 정책은 deprecated 경로 제거 후 구성 오류 중심 정책으로 전환.

## 구현 설계 (의사결정 완료)

### 1) 계약 하드닝 레이어 신설
- 대상: `src/components/ComposableSearch.tsx`, `src/components/publicTypes.ts`, `src/components/types.ts`
- 변경: 렌더링 이전 `assertComposableSearchConfiguration` 실행.
- 동작: selectors 누락/빈 배열/중복 type/plugin mismatch 발견 시 즉시 throw.
- 산출물: 에러 코드/메시지 표준화, 런타임/타입 일치.

### 2) 검색 UX 상태 모델 강화
- 대상: `src/components/ComposableSearch.tsx`, `src/components/RegionSearchInput.tsx`, `src/components/regionSearchModel.ts`
- 변경: `idle/loading/ready/error` 상태를 UI 표현까지 연결.
- 동작: loading 스켈레톤/문구, error 문구(`searchErrorMessage` 신규 옵션) 추가.
- 산출물: no-result와 error의 의미 분리, 사용자 피드백 향상.

### 3) 확장성 검증 API 표준화
- 대상: `src/components/selectorTypeUtils.ts`, `src/components/plugins/*`, `src/index.ts`, `src/components/index.ts`
- 변경: `validateComposableSearchConfiguration` 공개.
- 동작: selector uniqueness + plugin-selector 매칭을 단일 결과 포맷으로 반환.
- 산출물: 앱/CI에서 사전검증 가능.

### 4) 마이그레이션 자동화
- 대상: `scripts/migrate-to-0.5.mjs`, `docs/migration-notes/0.5.0-migration.md`
- 변경: deprecated 필드 제거 codemod 제공.
- 동작: `selectorsProps -> selectors`, `onChange -> onValueChange`, `placeHolder -> placeholder`.
- 산출물: 소비자 전환 비용 최소화.

### 5) 문서/계약 단일 소스화
- 대상: `README.md`, `docs/api-usage-guide.md`, `docs/public-api-compatibility-rules.md`
- 변경: 0.5 계약 기준으로 문서 재작성.
- 동작: 설치/예제/오류코드/검증 API/마이그레이션 순서 고정.
- 산출물: 문서-코드 불일치 제거.

### 6) 게이트 파이프라인 강화
- 대상: `package.json`, `scripts/verify-package.mjs`, CI 워크플로우
- 변경: `validate:contracts`를 기본 게이트로 추가.
- 동작: `lint + test + build:lib + validate:contracts + verify:package` 미통과 시 릴리스 차단.
- 산출물: 품질 하한 자동 보장.

## 테스트 케이스/시나리오 (필수)
1. 구성 검증
- selectors 누락 시 `MISSING_SELECTORS` throw.
- selectors 빈 배열 시 `EMPTY_SELECTORS` throw.
- 동일 type 중복 시 `DUPLICATE_SELECTOR_TYPE` throw.
- plugin type 미매칭 시 `PLUGIN_SELECTOR_TYPE_MISMATCH` throw.

2. 검색 UX
- async datasource에서 loading -> ready 전이 후 결과 노출.
- loading 중 no-result 미노출.
- error 상태에서 no-result 대신 error 메시지 노출.
- abort/race 상황에서 stale 결과 미반영.

3. 이벤트 계약
- `onValueChange` 메타(reason/source/selectorType/selectorId) 유지.
- region+keyword 병합 상태 유지.
- clear/remove/add/replace reason 정확성 유지.

4. 확장성 API
- `validateComposableSearchConfiguration` 결과 포맷 안정성.
- `createSelectorResolutionWarningContext`, `resolveSelectorsWithPolicy`, `validateSelectorTypeUniqueness`와의 상호 일관성.

5. 패키지/호환성
- React 18.3 consumer fixture 통과.
- React 19 consumer fixture 통과.
- ESM/CJS smoke 통과.
- d.ts 타입 소비 테스트 통과.

## 실행 마일스톤
1. M1 (설계 고정)
- API/에러코드/검증 포맷 ADR 확정.
- DoD: 타입 시그니처와 런타임 정책 문서 승인.

2. M2 (breaking 구현)
- deprecated 제거 + selectors required + 중복/미매칭 에러화.
- DoD: 구성 검증 테스트 전부 통과.

3. M3 (UX 완성)
- loading/error/empty 상태 UI 완성.
- DoD: 검색 UX 시나리오 테스트 전부 통과.

4. M4 (확장/편의)
- 검증 API 공개 + codemod + React peer 확장.
- DoD: 소비자 fixture(18/19) 전부 통과.

5. M5 (릴리스)
- `0.5.0-rc.1` -> 검증 -> `0.5.0` GA.
- DoD: 게이트 100% 통과 + 48시간 모니터링 종료.

## 릴리스/운영 계획
- RC: `0.5.0-rc.1` 배포 후 소비자 샘플 18/19 검증.
- GA: `0.5.0` 태깅/릴리스 노트/마이그레이션 노트 동시 발행.
- 모니터링: 0h/4h/24h/48h 체크포인트로 실패율/이슈율 추적.
- 롤백 트리거: 구성 오류 급증, import 실패, 이벤트 계약 회귀.

## 리스크 및 완화
- breaking 저항: codemod + 체크리스트 + 명확한 에러코드 제공.
- React 범위 확대 회귀: 18/19 매트릭스 CI 고정.
- 런타임 strict화로 초기 장애 가능성: RC에서 구성 오류 조기 탐지 후 수정.

## 가정 및 기본값 (확정)
- 버전: `0.5.0`에서 breaking 수행.
- 우선순위: `사용자경험` 최우선.
- `selectors`는 타입/런타임 모두 필수.
- duplicate selector type은 금지, 즉시 에러 처리.
- deprecated 호환 필드(`selectorsProps`, `onChange`, `placeHolder`)는 완전 제거.
- React peer는 `^18.3 || ^19`.
- plugin/selector 검증은 기본 릴리스 게이트에 포함.

## 세분화 실행 작업 분해 (Codex 오케스트레이션)

### WS1. 계약 하드닝/검증 API
- [x] T1-1: `ComposableSearchConfigErrorCode`/`ComposableSearchConfigError` 런타임 타입 추가.
- [x] T1-2: `validateComposableSearchConfiguration(config)` 결과 포맷(`isValid`, `issues`) 정의.
- [x] T1-3: selectors 누락/빈배열/중복/plugin-type 미매칭 규칙 구현.
- [x] T1-4: `assertComposableSearchConfiguration(config)` 추가 및 표준 메시지 포맷 고정.
- [x] T1-5: `publicTypes/types`에서 deprecated 필드 제거 + `selectors` required 전환.

### WS2. 런타임 적용/검색 UX
- [x] T2-1: `ComposableSearch` 렌더 이전에 구성 검증 assert 연결.
- [x] T2-2: duplicate first-wins 경로 제거(경고 정책 제거, 즉시 예외 정책 전환).
- [x] T2-3: plugin mismatch 경고 경로 제거(즉시 예외 정책 전환).
- [x] T2-4: region 검색 상태(`idle/loading/ready/error`)를 UI 메시지와 일치하도록 연결.
- [x] T2-5: `searchErrorMessage` 옵션 추가 및 error 상태 메시지 노출.
- [x] T2-6: abort/race 상황 stale 업데이트 방지 회귀 확인.

### WS3. selector 유틸/공개 export 정렬
- [x] T3-1: selector type 중복 검증 유틸 계약을 0.5 기준으로 정렬.
- [x] T3-2: 공개 엔트리(`src/index.ts`, `src/components/index.ts`)에 검증 API/에러 타입 export 정렬.
- [x] T3-3: export 계약 테스트를 0.5 기준으로 갱신.

### WS4. 테스트(계약/회귀)
- [x] T4-1: 구성 오류 4종 throw 테스트 추가(`MISSING_SELECTORS`, `EMPTY_SELECTORS`, `DUPLICATE_SELECTOR_TYPE`, `PLUGIN_SELECTOR_TYPE_MISMATCH`).
- [x] T4-2: async 검색 UX 테스트를 loading/ready/error/no-result 분리 기준으로 갱신.
- [x] T4-3: 이벤트 메타(reason/source/selectorType/selectorId) 회귀 테스트 유지/보강.
- [x] T4-4: public type 계약 테스트에서 deprecated 필드 제거 기준으로 갱신.
- [x] T4-5: validate API와 selector 유틸 상호 일관성 테스트 추가.

### WS5. 마이그레이션 자동화/문서
- [x] T5-1: `scripts/migrate-to-0.5.mjs` codemod 구현(`selectorsProps`, `onChange`, `placeHolder` 치환).
- [x] T5-2: `docs/migration-notes/0.5.0-migration.md` 신규 작성(자동화 + 수동 체크리스트 + 실패 케이스).
- [x] T5-3: `README.md`, `docs/api-usage-guide.md`, `docs/public-api-compatibility-rules.md`를 0.5 truth로 재작성.

### WS6. 패키징/게이트
- [x] T6-1: peer dependency를 `^18.3 || ^19`로 확장.
- [x] T6-2: `validate:contracts` 게이트 추가(계약 테스트 전용).
- [x] T6-3: `verify:package`에 계약 게이트 연동.
- [x] T6-4: React 18/19 consumer fixture 검증 경로 추가.
- [x] T6-5: ESM/CJS + d.ts smoke를 0.5 export 기준으로 유지.

### 에이전트 할당 원칙
- 각 Task는 별도 워커 에이전트에 할당한다.
- 워커는 명시된 파일 소유권만 수정하고, 다른 워커 변경은 건드리지 않는다.
- 모든 워커 완료 후 통합 검증(`lint`, `test`, `build:lib`, `validate:contracts`, `verify:package`)을 수행한다.
