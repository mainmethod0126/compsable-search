# Generic Selector/Plugin 플랫폼 전면 재설계 실행 플랜

## 문서 메타
- 이슈 제목: `Generic Selector/Plugin 플랫폼 전면 재설계`
- 이슈 소스: `사용자 요청`
- 기준일: `2026-03-07`
- 상태: `Final`
- 기준 저장 경로: `.agents/issues/generic-selector-plugin-platform-redesign/plan.md`
- 관련 문서:
  - `PRD.md`
  - `README.md`
  - `.agents/issues/generic-selector-redesign/plan.md` (`과거 초안/참고 문서`, 수정 금지)

## 요약
- 본 문서는 이번 재설계의 canonical entrypoint다.
- 전체 아키텍처 결정, 공개 API/패키지 경계, 교차 Epic 의존성, 전역 테스트/릴리스 게이트는 이 문서를 기준으로 관리한다.
- Epic별 실행 상세는 `subplans/` 하위 문서 6개로 분리했다.
- 하위호환성은 제공하지 않는다. `selectorsProps`, `onChange`, `placeHolder`, compat/adaptor, dual-run bridge는 범위 밖이다.

## 하위 플랜 인덱스
- [01-workspace-package-boundaries.md](subplans/01-workspace-package-boundaries.md): workspace 전환, 패키지 스캐폴드, build/test/lint/typecheck/pack 체인을 고정한다.
- [02-headless-core-platform.md](subplans/02-headless-core-platform.md): `@compsable-search/core`의 식별 정책, controller/store, plugin targeting, 오류 격리를 확정한다.
- [03-react-host-shell.md](subplans/03-react-host-shell.md): React host shell의 UI/UX 선행 설계, core 연동, 공개 export 경계를 고정한다.
- [04-first-party-selector-packages.md](subplans/04-first-party-selector-packages.md): region/keyword selector를 first-party package로 추출하고 조합성 검증 기준을 명시한다.
- [05-demo-docs-truth-source.md](subplans/05-demo-docs-truth-source.md): demo 앱과 README/PRD/API 문서를 새 플랫폼 계약 기준으로 재정렬한다.
- [06-release-gate-operations.md](subplans/06-release-gate-operations.md): 릴리스 게이트, 운영 관측, rollback, 최종 RC 증적 수집 절차를 고정한다.

## Task 범위 매핑표
| Epic | 하위 플랜 문서 | Task 범위 | 핵심 산출물 |
| --- | --- | --- | --- |
| `E-01` | `subplans/01-workspace-package-boundaries.md` | `T-001`~`T-008` | workspace/package 경계, 빌드/검증 체인 |
| `E-02` | `subplans/02-headless-core-platform.md` | `T-009`~`T-020` | core 공개 계약, controller/store, plugin validation |
| `E-03` | `subplans/03-react-host-shell.md` | `T-021`~`T-030` | generic host shell, UI 상태 계약, React export 표면 |
| `E-04` | `subplans/04-first-party-selector-packages.md` | `T-031`~`T-040` | region/keyword package 추출, selector 조합성 검증 |
| `E-05` | `subplans/05-demo-docs-truth-source.md` | `T-041`~`T-048` | demo 소비 경로, canonical docs, snippet smoke |
| `E-06` | `subplans/06-release-gate-operations.md` | `T-049`~`T-054` | release gate, rollback, 운영 관측, RC 증적 |

## 최종 아키텍처 결정
### 1. 플랫폼 방향
- 패키지 구조는 아래 5개 단위로 고정한다.
  - `packages/core`
  - `packages/react`
  - `packages/selector-region`
  - `packages/selector-keyword`
  - `apps/demo`
- `packages/core`는 React 비의존 headless engine이다.
- `packages/react`는 공통 shell UI와 React host runtime을 제공한다.
- `packages/selector-region`, `packages/selector-keyword`는 공식 first-party selector package다.
- `apps/demo`는 publishable package만 소비하는 검증용 앱이다.

### 2. runtime 책임 분리
- `core`는 selection state, panel state, plugin dispatch, configuration validation만 책임진다.
- `react`는 trigger area, panel host, selected basket의 generic shell만 책임진다.
- selector별 데이터 로딩, 패널 UI, 도메인 상태머신, 에러 처리, 비동기 경합 제어는 각 selector package가 책임진다.

### 3. breaking 결정
- 하위호환성 브리지는 제공하지 않는다.
- 기존 root 단일 라이브러리 publish 모델은 폐기한다.
- 기존 `selector.type` 중복 금지 정책은 제거하고, `selector.id` 유일성만 강제한다.
- selection ownership은 item shape 추론이 아니라 `selectorId` 기준으로만 해석한다.

### 4. 저장소 사실 관계 정리
- 새 공식 계획 경로는 `.agents/issues/generic-selector-plugin-platform-redesign/plan.md`다.
- 기존 `.agents/issues/generic-selector-redesign/plan.md`는 과거 초안/참고 문서로만 취급한다.
- 현재 저장소에는 `packages/core`, `packages/react`, `packages/selector-region`, `packages/selector-keyword`, `apps/demo/src` 디렉토리가 존재한다.
- 현재 기준 `apps/demo/vite.config.ts` 파일은 존재하지 않는다.
- 현재 기준 root `src/index.ts`와 root `README.md`가 여전히 실제 공개 계약의 주 진입점 역할을 하고 있다.

## 공개 API/패키지 경계 결정
### 1. `@compsable-search/core`
- 공개 책임:
  - `SelectionItem`
  - `ValueChangeMeta`
  - `SelectionChangeEvent`
  - `PanelOpenChangeEvent`
  - `SelectorDefinition`
  - `SelectorPlugin`
  - controller/store 생성 API
  - configuration validation API
- 핵심 정책:
  - `selector.id`는 필수이며 전역 유일
  - `selector.type`은 문자열이며 중복 허용
  - `SelectionItem.selectorId`는 필수
  - plugin 입력은 `readonly SelectorPlugin[]`
  - plugin targeting은 `all | selectorIds[] | selectorTypes[]`

### 2. `@compsable-search/react`
- 공개 책임:
  - `ComposableSearch`
  - React host types
  - generic trigger/panel/selected shell
- 비목표:
  - region/keyword 전용 데이터 모델 직접 소유
  - host 내부의 selector-specific 분기
  - legacy fallback ID/shape inference 유지

### 3. `@compsable-search/selector-region`
- 공개 책임:
  - `createRegionSelector`
  - region type
  - region panel UI
  - 계층 선택 정책
  - 검색 인덱스
  - async abort/race 처리

### 4. `@compsable-search/selector-keyword`
- 공개 책임:
  - `createKeywordSelector`
  - keyword panel UI
  - keyword input state machine
  - normalization/validation 정책
  - invalid token 처리

### 5. 폐기/제거 대상
- root monolith publish contract
- `selectorsProps`
- `onChange`
- `placeHolder`
- `compat/adaptLegacySelectorsProps`
- host 내부 `region`/`keyword` 특수 분기
- `LEGACY_REGION_SELECTOR_ID`

## 선행조건과 실행 순서
### 1. 권장 순서
1. `E-01` Workspace와 패키지 경계 재구성
2. `E-02` Headless Core 플랫폼 확정
3. `E-03` React Host Shell 재구성
4. `E-04` First-party Selector 패키지 추출
5. `E-05` Demo와 문서 Truth Source 재정렬
6. `E-06` 릴리스 게이트와 운영 준비

### 2. 핵심 선행조건
- `E-03`는 `E-02`의 controller/store와 validation 정책이 확정되어야 시작할 수 있다.
- `E-04`는 `E-03` host가 selector-specific 분기를 제거한 뒤 진행해야 한다.
- `E-05`는 `E-01`~`E-04`의 공개 구조가 고정된 뒤 진행해야 한다.
- `E-06`는 `E-01`~`E-05`의 코드/문서 truth source가 정렬된 뒤 진행해야 한다.

### 3. 병렬 가능 묶음
- `E-01/F-01.2`와 `E-02/F-02.1`은 병렬 가능
- `E-03/F-03.1` UI/UX 선행 설계와 `E-02/F-02.3` plugin targeting 구현은 병렬 가능
- `E-04/F-04.1` region 패키지화와 `E-04/F-04.2` keyword 패키지화는 병렬 가능
- `E-05/F-05.1` demo 재구성과 `E-05/F-05.2` 문서 전면 교체는 병렬 가능

## 테스트/릴리스 게이트
### 1. 필수 테스트 범주
- core unit
  - duplicate selector id
  - selector ownership
  - controlled/uncontrolled state
  - plugin target resolution
  - plugin error isolation
- react integration
  - panel switch
  - selected basket sync
  - clear-all
  - plugin event dispatch
  - domain-specific import 제거 검증
- selector-region integration
  - hierarchy load
  - whole/detail mutual exclusion
  - search preview selection
  - async abort/race
  - no-result/error
- selector-keyword integration
  - Enter/Blur/Backspace
  - normalization
  - duplicate/max length/max token
  - invalid token callback
- workspace smoke
  - `npm run lint -ws`
  - `npm run test -ws`
  - `npm run build -ws`
  - `npm pack --workspaces`
  - `apps/demo` production build

### 2. release blocking 조건
- root source import 없이 `apps/demo`가 workspace package만으로 빌드되어야 한다.
- `packages/core`에 React import가 없어야 한다.
- `packages/react`에 region/keyword 전용 import가 없어야 한다.
- `selector.type` 중복 허용 + `selector.id` 유일성 검증 테스트가 통과해야 한다.
- legacy compat/adaptor/export가 완전히 제거되어야 한다.
- 문서와 공개 API contract test가 같은 계약을 설명해야 한다.

## 범위 경계와 가정
- 본 문서는 실행 기준의 상위 인덱스 문서다.
- Epic별 상세 Task, 산출물, 검증 방식은 `subplans/` 하위 문서에서 관리한다.
- 실제 코드 구현은 아직 시작하지 않는다.
- `backlog/` 계층 문서 생성은 후속 턴에서 별도로 진행한다.
- 하위호환성은 제공하지 않는다.
- 공식 패키지 경계는 `core/react/selector-region/selector-keyword/apps-demo`로 확정했다.
- `region`, `keyword`는 코어 내장이 아니라 공식 first-party selector package로 확정했다.
- React host 모델은 `Headless Core + 기본 Shell UI`로 확정했다.
- 현재 기준 본 계획에 남겨진 구조적 `TBD`는 없다.
