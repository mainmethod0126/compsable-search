# ComposableSearch 0.3.0 실행 백로그 분해

- 기준 문서: `.agents/issues/composable-search-architecture-review/plan.md`
- 기준일: `2026-02-28`
- 목표: `0.3.0 구조개편`을 파일 단위 구현 Task로 분해하고, 8단계 실행과 검증 게이트를 연결

## 1) Task 백로그 (파일 단위)

| Task ID | 작업명 | 목적 | 소유 파일/디렉토리 | 선행조건 | 병렬 가능 여부 | 완료 조건(DoD) | 검증 명령 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1-T01 | 0.3 API RFC 상세화 | 0.3.0 공개 계약 기준선 고정 | `.agents/issues/composable-search-architecture-review/execution/step-01-api-rfc.md` | 없음 | 가능 (문서 단독) | `value/defaultValue/onValueChange`, `selectors/plugins`, `placeholder alias`, `compat 범위`가 한 문서에 명시됨 | `rg "value/defaultValue|onValueChange|SelectorPlugin|placeholder" .agents/issues/composable-search-architecture-review/execution/step-01-api-rfc.md` |
| S1-T02 | 공개 타입 확장 | Controlled/Plugin 타입을 공개 계약에 추가 | `src/components/publicTypes.ts` | S1-T01 | 불가 | `ComposableSearchValue`, `ChangeMeta`, `SelectorPlugin`, `SelectorInstance` 타입이 추가되고 TS 오류가 없음 | `npm run test -- src/components/publicTypeContract.test.ts` |
| S1-T03 | 공개 export 표면 정리 | 0.3 신규 타입/팩토리가 엔트리에서 노출되도록 정리 | `src/components/types.ts`<br>`src/components/index.ts` | S1-T02 | 가능 (테스트 병행) | `types.ts`(레거시 경로)와 `index.ts`(권장 경로)에서 동일 공개 타입 접근 가능 | `npm run test -- src/components/publicTypeContract.test.ts src/components/apiUsageGuideContract.test.ts` |
| S1-T04 | 타입 계약 테스트 갱신 | API 스펙과 테스트 계약 동기화 | `src/components/publicTypeContract.test.ts`<br>`src/components/apiUsageGuideContract.test.ts` | S1-T02, S1-T03 | 불가 | 신규 props/type 사용 예제가 모두 컴파일 및 테스트 통과 | `npm run test -- src/components/publicTypeContract.test.ts src/components/apiUsageGuideContract.test.ts` |
| S2-T01 | 하이브리드 상태 코어 모듈 생성 | controlled/uncontrolled 공통 상태 전이 분리 | `src/components/valueStateCore.ts` | S1-T04 | 가능 (테스트와 직렬) | 내부 상태, 외부 value, defaultValue 우선순위 규칙이 순수 함수로 분리됨 | `Test-Path 'src/components/valueStateCore.ts'` |
| S2-T02 | 상태 코어 단위 테스트 작성 | 루프/중복 이벤트 방지 규칙 보호 | `src/components/valueStateCore.test.ts` | S2-T01 | 불가 | controlled/uncontrolled, source meta, noop update 케이스가 테스트됨 | `npm run test -- src/components/valueStateCore.test.ts` |
| S2-T03 | ComposableSearch 상태 연결 리팩터링 | 컴포넌트가 value/defaultValue/onValueChange를 사용하도록 전환 | `src/components/ComposableSearch.tsx` | S2-T01 | 불가 | 내부 useState 직접 갱신 경로가 상태 코어 호출로 일원화됨 | `npm run test -- src/components/ComposableSearch.test.tsx` |
| S2-T04 | 콜백 파이프라인 메타 반영 | `onValueChange`와 기존 `onChange` 이벤트 메타 동기화 | `src/components/callbackPipeline.ts`<br>`src/components/internalTypes.ts` | S2-T01, S2-T03 | 가능 (테스트 병행) | 콜백 payload에 `source`, `selectorId` 등 메타가 누락 없이 전달됨 | `npm run test -- src/components/callbackContract.test.tsx` |
| S2-T05 | controlled 회귀 테스트 강화 | 무한 루프/이벤트 중복 회귀 방지 | `src/components/callbackContract.test.tsx`<br>`src/components/ComposableSearch.test.tsx` | S2-T03, S2-T04 | 불가 | controlled 모드에서 동일 value 재전달 시 추가 이벤트가 발생하지 않음 | `npm run test -- src/components/callbackContract.test.tsx src/components/ComposableSearch.test.tsx` |
| S3-T01 | 플러그인 계약 타입 정의 | selector 확장 인터페이스 도입 | `src/components/plugins/SelectorPlugin.ts` | S1-T04 | 가능 (독립 구현) | trigger/panel/state-transition/serialize/validate 훅 시그니처가 타입으로 고정됨 | `Test-Path 'src/components/plugins/SelectorPlugin.ts'` |
| S3-T02 | 플러그인 레지스트리 구현 | 플러그인 등록/해석/충돌검증 처리 | `src/components/plugins/SelectorPluginRegistry.ts`<br>`src/components/plugins/pluginValidation.ts` | S3-T01 | 불가 | ID 중복, 필수 훅 누락, unknown selector 처리 규칙이 코드로 구현됨 | `Test-Path 'src/components/plugins/SelectorPluginRegistry.ts'` |
| S3-T03 | 플러그인 API 공개 export | 외부 소비자가 플러그인 타입/레지스트리를 import 가능하게 구성 | `src/components/index.ts`<br>`src/components/publicTypes.ts` | S3-T01, S3-T02 | 가능 (테스트 병행) | 루트 엔트리에서 플러그인 타입과 생성 유틸이 노출됨 | `npm run test -- src/components/publicTypeContract.test.ts` |
| S3-T04 | 플러그인 계약 테스트 추가 | custom plugin 확장 경로를 자동 검증 | `src/components/plugins/SelectorPluginRegistry.test.ts` | S3-T02, S3-T03 | 불가 | 샘플 custom plugin 등록/조회/검증 실패 케이스 모두 통과 | `npm run test -- src/components/plugins/SelectorPluginRegistry.test.ts` |
| S4-T01 | Region built-in plugin 팩토리 추가 | region 기능을 코어 분기 없이 플러그인으로 이관 | `src/components/plugins/builtins/createRegionSelector.ts` | S3-T04, S2-T05 | 가능 (S4-T02와 병렬) | region selector 생성 팩토리가 기존 데이터소스 계약을 유지함 | `Test-Path 'src/components/plugins/builtins/createRegionSelector.ts'` |
| S4-T02 | Keyword built-in plugin 팩토리 추가 | keyword 기능을 코어 분기 없이 플러그인으로 이관 | `src/components/plugins/builtins/createKeywordSelector.ts` | S3-T04, S2-T05 | 가능 (S4-T01과 병렬) | keyword selector 생성 팩토리가 기존 토큰 정책 계약을 유지함 | `Test-Path 'src/components/plugins/builtins/createKeywordSelector.ts'` |
| S4-T03 | ComposableSearch 플러그인 루프 전환 | region/keyword 하드코딩 분기를 plugin loop로 교체 | `src/components/ComposableSearch.tsx`<br>`src/components/selectorTypeUtils.ts` | S4-T01, S4-T02 | 불가 | `selectors` 배열 순회 기반 렌더링으로 동작하고 기존 UX 회귀 없음 | `npm run test -- src/components/ComposableSearch.test.tsx src/components/selectorTypeUtils.test.ts` |
| S4-T04 | 내장 플러그인 회귀 테스트 | built-in plugin 전환 후 기존 계약 유지 검증 | `src/components/plugins/builtins/builtinPluginContract.test.tsx`<br>`src/components/ComposableSearch.test.tsx` | S4-T03 | 불가 | region/keyword 선택, chip 삭제, no-result 메시지 시나리오 통과 | `npm run test -- src/components/plugins/builtins/builtinPluginContract.test.tsx src/components/ComposableSearch.test.tsx` |
| S4-T05 | selector 유틸 정리 | `region|keyword` 고정 유틸을 plugin ID 기준으로 정리 | `src/components/selectorTypeUtils.ts`<br>`src/components/selectorTypeUtils.test.ts` | S4-T03 | 가능 (S4-T04와 병렬) | selector 해석 유틸이 plugin ID 충돌/우선순위를 일관되게 처리 | `npm run test -- src/components/selectorTypeUtils.test.ts` |
| S5-T01 | compat 패키지 스캐폴딩 | 0.2.x 소비자 이전 경로 준비 | `packages/compat/package.json`<br>`packages/compat/tsconfig.json`<br>`packages/compat/src/index.ts` | S3-T04 | 가능 (초기 구조) | `@composable-search/compat` 패키지 기본 빌드 구조가 생성됨 | `Test-Path 'packages/compat/src/index.ts'` |
| S5-T02 | 레거시 selectorsProps 어댑터 구현 | 0.2 API를 0.3 selectors/plugins로 매핑 | `packages/compat/src/adaptSelectorsProps.ts` | S5-T01, S4-T03 | 불가 | `selectorsProps` 입력을 새 `selectors/plugins` 입력으로 변환 가능 | `Test-Path 'packages/compat/src/adaptSelectorsProps.ts'` |
| S5-T03 | `placeHolder` alias + deprecation 경고 구현 | 0.3에서 `placeholder` 표준화와 하위 호환 동시 제공 | `src/components/publicTypes.ts`<br>`src/components/ComposableSearch.tsx`<br>`packages/compat/src/deprecations.ts` | S5-T02 | 불가 | `placeHolder` 사용 시 동작 유지 + 개발 경고 출력, `placeholder` 우선 적용 | `npm run test -- src/components/publicTypeContract.test.ts` |
| S5-T04 | compat 계약 테스트 | 어댑터/경고/매핑 회귀 자동화 | `packages/compat/src/adaptSelectorsProps.test.ts`<br>`packages/compat/src/index.test.ts` | S5-T02, S5-T03 | 불가 | 기존 0.2 예제가 compat 경유로 타입/런타임 모두 통과 | `npm run test -- packages/compat/src/adaptSelectorsProps.test.ts packages/compat/src/index.test.ts` |
| S6-T01 | 라이브러리 엔트리 분리 | 앱 엔트리와 npm 라이브러리 엔트리 분리 | `src/index.ts`<br>`src/components/index.ts` | S4-T04, S4-T05 | 가능 (설정 병행) | 소비자가 `src/index.ts` 기준으로 컴포넌트/타입 import 가능 | `Test-Path 'src/index.ts'` |
| S6-T02 | 라이브러리 빌드 설정 추가 | Dual 포맷 빌드를 위한 설정 분리 | `vite.lib.config.ts`<br>`tsconfig.build.json` | S6-T01 | 불가 | ESM/CJS 산출물 + `.d.ts` 생성 경로가 설정됨 | `Test-Path 'vite.lib.config.ts'; Test-Path 'tsconfig.build.json'` |
| S6-T03 | package 배포 계약 정리 | `exports/main/module/types/peerDependencies/sideEffects` 명시 | `package.json` | S6-T02, S5-T04 | 불가 | `private` 해제 및 배포 메타가 완성되고 css export 경로가 노출됨 | `node -e "const p=require('./package.json');console.log(p.exports&&p.main&&p.module&&p.types&&p.peerDependencies&&p.sideEffects)"` |
| S6-T04 | ESM/CJS 소비 fixture 작성 | 실제 소비자 환경 호환성 검증 기반 마련 | `fixtures/esm-consumer/package.json`<br>`fixtures/esm-consumer/src/main.tsx`<br>`fixtures/cjs-consumer/package.json`<br>`fixtures/cjs-consumer/index.cjs` | S6-T03 | 가능 (S6-T05와 직렬) | ESM/CJS 각각 최소 렌더/require 시나리오가 실행 가능 | `Test-Path 'fixtures/esm-consumer/src/main.tsx'; Test-Path 'fixtures/cjs-consumer/index.cjs'` |
| S6-T05 | 패키지 검증 스크립트 구성 | fixture 기반 import 검증을 릴리스 게이트화 | `scripts/verify-esm-consumer.mjs`<br>`scripts/verify-cjs-consumer.mjs`<br>`scripts/verify-package.mjs`<br>`package.json` | S6-T04 | 불가 | `verify:package` 단일 명령으로 lint/test/build/fixture 검증 실행 | `npm run verify:package` |
| S7-T01 | README 0.3 사용법 갱신 | 설치/기본 사용/controlled/plugin 경로 문서화 | `README.md` | S6-T03, S5-T04 | 가능 (문서 병렬) | README 예제가 `npm 설치 + 0.3 API` 기준으로 교체됨 | `npm run test -- src/components/apiUsageGuideContract.test.ts` |
| S7-T02 | API 가이드 문서 갱신 | 상세 옵션/콜백/플러그인 계약 최신화 | `docs/api-usage-guide.md` | S6-T03, S5-T04 | 가능 (문서 병렬) | 가이드 내 코드 스니펫이 `value/defaultValue/onValueChange`를 포함 | `rg "onValueChange|selectors|plugins|placeholder" docs/api-usage-guide.md` |
| S7-T03 | 0.3 마이그레이션 가이드 작성 | 0.2 -> 0.3 변경점과 치환 규칙 명시 | `docs/migration-notes/0.3.0-migration.md` | S5-T04 | 가능 (문서 병렬) | 변경 매핑표(구 API/신 API/코드 예시/주의점)가 문서화됨 | `Test-Path 'docs/migration-notes/0.3.0-migration.md'` |
| S7-T04 | 공개 API 호환 규칙 문서 갱신 | compat 제거 일정/지원 범위 관리 | `docs/public-api-compatibility-rules.md` | S7-T03 | 불가 | 0.3.x 호환 범위, deprecation 일정, 제거 목표 버전이 명시됨 | `rg "0.3|compat|deprecation|제거" docs/public-api-compatibility-rules.md` |
| S7-T05 | 데모/문서 계약 테스트 동기화 | 실제 데모와 문서 예제의 코드 계약 동기화 | `src/App.tsx`<br>`src/App.test.tsx`<br>`src/components/apiUsageGuideContract.test.ts` | S7-T01, S7-T02, S4-T04 | 불가 | 데모가 신규 API로 동작하고 문서 계약 테스트가 모두 통과 | `npm run test -- src/App.test.tsx src/components/apiUsageGuideContract.test.ts` |
| S8-T01 | RC 릴리스 게이트 체크리스트 작성 | 배포 전 필수 검증 항목 고정 | `.agents/issues/composable-search-architecture-review/execution/release-gate-0.3.0-rc.md` | S6-T05, S7-T05 | 가능 (문서 단독) | 체크리스트에 lint/test/build/fixture/문서/롤백 항목이 포함됨 | `rg "lint|test|build|fixture|rollback" .agents/issues/composable-search-architecture-review/execution/release-gate-0.3.0-rc.md` |
| S8-T02 | RC 릴리스/롤백 문서 작성 | 릴리스 노트와 롤백 절차 준비 | `docs/releases/0.3.0-rc.1.md`<br>`docs/releases/rollback-0.3.x.md` | S7-T03, S7-T04 | 가능 (문서 단독) | breaking change, compat 사용법, 롤백 트리거/절차가 문서화됨 | `Test-Path 'docs/releases/0.3.0-rc.1.md'; Test-Path 'docs/releases/rollback-0.3.x.md'` |
| S8-T03 | RC 버전/배포 스크립트 반영 | 실제 배포 가능한 RC 메타 확정 | `package.json` | S8-T01, S8-T02 | 불가 | 버전이 `0.3.0-rc.1`로 갱신되고 publish/verify 스크립트가 일관됨 | `node -e "const p=require('./package.json');console.log(p.version)"` |
| S8-T04 | 최종 게이트 실행 및 증적 기록 | RC 승인 근거를 문서화하고 배포 준비 완료 | `.agents/issues/composable-search-architecture-review/execution/release-gate-evidence.md` | S8-T03 | 불가 | `npm run lint`, `npm test`, `npm run build`, `npm run verify:package` 결과와 실패 대응 기록 완료 | `npm run lint; npm test; npm run build; npm run verify:package` |

## 2) 8단계 실행 계획 매핑

| 단계 | 단계 목표 | 매핑 Task ID | 단계 완료 게이트 |
| --- | --- | --- | --- |
| 1 | 0.3 API 스펙 동결 | S1-T01, S1-T02, S1-T03, S1-T04 | 공개 타입 테스트(`publicTypeContract`, `apiUsageGuideContract`) 통과 |
| 2 | 하이브리드 상태 코어 구현 | S2-T01, S2-T02, S2-T03, S2-T04, S2-T05 | controlled/uncontrolled 회귀 테스트 통과 |
| 3 | 플러그인 인터페이스 도입 | S3-T01, S3-T02, S3-T03, S3-T04 | custom plugin 등록/검증 테스트 통과 |
| 4 | region/keyword built-in plugin 이관 | S4-T01, S4-T02, S4-T03, S4-T04, S4-T05 | 기존 UX 회귀 테스트 + built-in 계약 테스트 통과 |
| 5 | 레거시 compat 경로 구현 | S5-T01, S5-T02, S5-T03, S5-T04 | 0.2 스타일 입력이 compat 경유로 동작 |
| 6 | Dual ESM/CJS 패키지 파이프라인 | S6-T01, S6-T02, S6-T03, S6-T04, S6-T05 | `verify:package` 통과(ESM/CJS fixture 포함) |
| 7 | 문서/마이그레이션/데모 동기화 | S7-T01, S7-T02, S7-T03, S7-T04, S7-T05 | 문서 계약 테스트 + App 통합 테스트 통과 |
| 8 | 릴리스 게이트 및 RC 준비 | S8-T01, S8-T02, S8-T03, S8-T04 | 릴리스 체크리스트와 증적 문서 완료 |

## 3) 리스크/차단요인 및 우회 전략

| Risk ID | 리스크/차단요인 | 영향 Task | 조기 감지 신호 | 우회 전략 (파일 단위) | 우회 검증 명령 |
| --- | --- | --- | --- | --- | --- |
| R-01 | controlled 모드에서 `onValueChange` 무한 루프 | S2-T03, S2-T04, S2-T05 | 동일 값 재전달 시 콜백이 반복 호출됨 | `src/components/valueStateCore.ts`에 shallow/deep 비교 가드 추가, `src/components/callbackContract.test.tsx`에 루프 재현 테스트 추가 | `npm run test -- src/components/callbackContract.test.tsx src/components/valueStateCore.test.ts` |
| R-02 | plugin ID 충돌로 selector 렌더 순서가 깨짐 | S3-T02, S4-T03, S4-T05 | 특정 selector가 렌더되지 않거나 잘못된 패널이 열림 | `src/components/plugins/pluginValidation.ts`에서 중복 ID 즉시 예외 처리, `SelectorPluginRegistry.test.ts`에 충돌 케이스 고정 | `npm run test -- src/components/plugins/SelectorPluginRegistry.test.ts` |
| R-03 | region 데이터소스 동기 계약이 plugin 전환 중 누락 | S4-T01, S4-T03 | 지역 패널에서 목록 비정상(empty) | `src/components/plugins/builtins/createRegionSelector.ts`에서 기존 `findAll*` 호출 경로 유지, `ComposableSearch.test.tsx` 기존 지역 시나리오 유지 | `npm run test -- src/components/ComposableSearch.test.tsx` |
| R-04 | `placeHolder`/`placeholder` 동시 지원 중 우선순위 혼선 | S5-T03, S5-T04 | 버튼 라벨이 예상과 다르게 표시됨 | `src/components/ComposableSearch.tsx`에 `placeholder ?? placeHolder` 우선순위 고정, compat 경고를 `packages/compat/src/deprecations.ts`로 단일화 | `npm run test -- src/components/publicTypeContract.test.ts packages/compat/src/adaptSelectorsProps.test.ts` |
| R-05 | ESM/CJS export 경로 불일치 | S6-T02, S6-T03, S6-T04, S6-T05 | 한쪽 포맷에서 import/require 실패 | `package.json` `exports`를 조건부(`import`/`require`)로 고정하고 fixture에서 양쪽 로딩 검증 | `npm run verify:package` |
| R-06 | CSS export 누락으로 소비자 앱 스타일 미적용 | S6-T03, S6-T04 | 컴포넌트 구조는 렌더되나 스타일이 깨짐 | `package.json` `sideEffects`와 CSS export 명시, `fixtures/esm-consumer`에서 스타일 import 스모크 추가 | `node scripts/verify-esm-consumer.mjs` |
| R-07 | 문서 예제와 실제 타입 계약 불일치 | S7-T01, S7-T02, S7-T05 | README 코드 복사 시 타입 오류 발생 | 문서 예제를 `src/components/apiUsageGuideContract.test.ts`에 1:1 반영해 타입 게이트 유지 | `npm run test -- src/components/apiUsageGuideContract.test.ts` |
| R-08 | 릴리스 직전 품질 게이트 누락 | S8-T01, S8-T04 | RC 배포 후 회귀 이슈 다수 발생 | `.agents/.../release-gate-0.3.0-rc.md` 체크리스트 기반으로 `release-gate-evidence.md`에 실행 로그 강제 기록 | `npm run lint; npm test; npm run build; npm run verify:package` |

## 4) 병렬 실행 권장 묶음

| 병렬 묶음 | 포함 Task ID | 이유 |
| --- | --- | --- |
| P-A | S4-T01 + S4-T02 | region/keyword built-in 팩토리 구현 파일이 분리되어 충돌 가능성이 낮음 |
| P-B | S7-T01 + S7-T02 + S7-T03 | 문서 파일이 분리되어 동시 작업 가능 |
| P-C | S8-T01 + S8-T02 | 릴리스 체크리스트와 릴리스 노트 파일이 분리되어 동시 작성 가능 |

