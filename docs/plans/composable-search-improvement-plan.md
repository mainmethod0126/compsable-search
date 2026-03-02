# ComposableSearch 아쉬운 점 개선 패치 플랜 (즉시 정리 + 플러그인 기능 구현)

## 요약
이번 개선은 `2단계 분할`로 진행한다.  
1단계에서 공개 API/런타임 정합성을 맞추고, 2단계에서 문서/패키징/검증 체계를 정리한다.  
핵심 목표는 “타입에 있는 기능은 실제로 동작하게 만들고, 동작하지 않는 계약은 제거”다.

## 범위
1. `plugins` 공개 계약을 실제 `ComposableSearch` 런타임에 연결한다.
2. 타입/문서/엔트리 export 불일치를 제거한다.
3. 패키지 소비자 관점의 import 경로와 의존성 구성을 정리한다.

## 비범위
1. `selectorsProps`, `onChange`, `placeHolder`(selector options)의 레거시 하위 호환 제거는 이번 플랜에서 하지 않는다.
2. region/keyword UI 기능 자체의 신규 기능 추가는 하지 않는다.

## 공개 API 변경 사항 (결정 완료)
| 구분 | 현재 | 변경 |
| --- | --- | --- |
| `ComposableSearchProps.plugins` | 타입만 존재, 런타임 미사용 | 런타임에서 `onInit`/`onDispose` 실행 |
| `ChangeMeta.source` | `'region' \| 'keyword' \| 'external' \| 'initialize'` | `'initialize'` 제거 |
| `ComposableSearchProps.placeholder` | 타입/문서에 존재, 런타임 미사용 | 제거 (breaking) |
| `ComposableSearchProps.placeHolder` | 타입에 존재, 런타임 미사용 | 제거 (breaking) |
| 플러그인 타입 정의 | `publicTypes`와 `components/plugins` 이원화 | `publicTypes` 기준 단일 계약으로 통합 |
| 루트 export | 플러그인 유틸 접근 어려움 | 루트 엔트리(`src/index.ts`)에서 플러그인 타입/유틸 export |

## 1단계: Core 정합성 패치
1. 타입 계약 정리.  
   `src/components/publicTypes.ts`에서 `ComposableSearchProps.placeholder/placeHolder` 제거, `ChangeMeta.source`에서 `initialize` 제거, 플러그인 타입을 단일 계약으로 고정한다.

2. 런타임 플러그인 실행 연결.  
   `src/components/ComposableSearch.tsx`에서 `plugins`를 props로 수신하고, selector first-wins 결과와 매칭해 `onInit`를 mount/변경 시 호출하고 `onDispose`를 cleanup 시 호출한다.

3. 플러그인 실행 안정성.  
   플러그인 콜백 예외가 UI 흐름을 깨지 않도록 `callbackPipeline`에 동일한 safe-dispatch 경로를 추가하고 오류 로깅 prefix를 일관화한다.

4. 플러그인 모듈 통합.  
   `src/components/plugins/*`를 `publicTypes` 계약과 동일한 구조로 정리한다.  
   `SelectorPlugin.ts`, `SelectorPluginRegistry.ts`, `pluginValidation.ts`의 타입/검증 로직을 단일 모델로 맞춘다.

5. 루트 엔트리 export 정리.  
   `src/index.ts`, `src/components/index.ts`에서 플러그인 타입/유틸을 정식 export한다.

## 2단계: 문서/패키징/검증 정리
1. 문서 import 경로 수정.  
   `README.md`, `docs/api-usage-guide.md`, `docs/migration-notes/0.3.0-migration.md`의 예제를 `from 'compsable-search'` 기준으로 수정한다.

2. breaking 변경 안내 반영.  
   문서에 `ComposableSearchProps.placeholder/placeHolder` 제거와 `ChangeMeta.source` 변경을 명시하고, 대체/영향(없음 또는 사용처 제거)을 적는다.

3. 패키지 의존성 정리.  
   `package.json`에서 `react`, `react-dom`을 `dependencies`에서 제거하고 `peerDependencies + devDependencies` 구조로 통일한다.

4. 검증 스크립트 보강.  
   `scripts/verify-esm-consumer.mjs`, `scripts/verify-cjs-consumer.mjs`에 플러그인 export smoke 체크를 추가한다.

## 테스트 케이스 및 시나리오
1. 런타임 플러그인 호출.  
   `ComposableSearch` mount 시 타입 매칭 플러그인 `onInit` 1회 호출, unmount/selector 변경 시 `onDispose` 호출.

2. first-wins 연동.  
   동일 selector type 중 첫 selector만 플러그인 인자로 전달되는지 검증.

3. 예외 내성.  
   플러그인 훅에서 throw 시 렌더/선택 동작이 지속되고 에러가 로깅되는지 검증.

4. 타입 계약 회귀.  
   `publicTypeContract.test.ts`에서 제거된 필드(`placeholder/placeHolder`, `initialize`)가 더 이상 허용되지 않음을 검증하고, 신규 export 타입이 정상 추론되는지 검증.

5. 엔트리 export 회귀.  
   ESM/CJS smoke에서 `SelectorPlugin` 관련 export 접근 가능 여부 검증.

6. 패키지 게이트.  
   `npm test`, `npm run lint`, `npm run build`, `npm run build:lib`, `npm run verify:package` 전부 통과.

## 구현 순서
1. 타입 변경(`publicTypes`, `types`, plugin module 타입).
2. `ComposableSearch` 런타임 훅 연결.
3. callback 안전 실행 경로 추가.
4. 엔트리 export 업데이트.
5. 테스트 수정/추가.
6. 문서 갱신.
7. 패키지 의존성 정리.
8. 전체 검증 커맨드 실행.

## 리스크 및 완화
1. Breaking 영향.  
   `placeholder/placeHolder` 제거로 타입 에러 발생 가능. 문서와 마이그레이션에 “삭제/치환 없음(미사용 필드)”을 명확히 기재한다.

2. 플러그인 호출 타이밍 회귀.  
   effect dependency 설계를 명시적으로 고정하고 mount/update/unmount 테스트를 분리해 회귀를 방지한다.

3. 패키지 소비자 호환성.  
   ESM/CJS smoke + 타입 테스트를 함께 돌려 배포 전 확인한다.

## 가정 및 기본값
1. 릴리스는 pre-1.0 기준의 breaking 허용 버전(`0.4.0`)으로 진행한다.
2. 플러그인 매칭 기준은 selector `type`이며, 실행 대상 selector는 first-wins 정책을 따른다.
3. 플러그인 실행 순서는 registry 순회 순서(Object insertion order)를 따른다.
4. plugin 유틸은 루트 엔트리에서 직접 import 가능해야 한다.
5. 레거시 `selectorsProps/onChange`는 이번 범위에서 유지한다.

## 완료 정의 (DoD)
1. 타입/런타임/문서가 동일 계약을 설명한다.
2. 플러그인 계약이 실제 컴포넌트에서 동작한다.
3. 루트 패키지 import로 예제가 그대로 동작한다.
4. React 의존성 중복 리스크가 제거된다.
5. 검증 명령 전체가 CI에서 재현 가능하게 통과한다.
