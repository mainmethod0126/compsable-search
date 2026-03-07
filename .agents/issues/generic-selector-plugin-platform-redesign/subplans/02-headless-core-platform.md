# [E-02] Headless Core 플랫폼 확정

## 문서 메타
- 이슈 제목: `Generic Selector/Plugin 플랫폼 전면 재설계`
- 하위 플랜: `E-02 Headless Core 플랫폼 확정`
- 이슈 소스: `사용자 요청`
- 기준일: `2026-03-07`
- 상태: `Final`
- 출력 경로: `.agents/issues/generic-selector-plugin-platform-redesign/subplans/02-headless-core-platform.md`
- Task 구간: `009-020`

## 상위 계획과의 연결
- 상위 인덱스 문서: [../plan.md](../plan.md)
- 이 Epic의 역할: `@compsable-search/core`의 공개 계약과 controller/store 책임을 확정해 React host와 selector package의 의존 기준을 만든다.
- 선행 Epic:
  - `E-01`의 package 경계가 잡히면 해당 package layout을 따른다.
- 후속 Epic:
  - `E-03`는 이 Epic의 controller/store와 validation 정책에 직접 의존한다.
  - `E-04`는 selector package를 core plugin 계약 위에 구축한다.

## 이번 Epic의 목표 / 비목표
### 목표
- selector 식별성과 selection ownership 정책을 `selector.id` 중심으로 재정의한다.
- controlled/uncontrolled selection store와 panel state controller를 core로 이동한다.
- plugin targeting, stable binding, error isolation을 core가 책임지게 만든다.

### 비목표
- React UI shell 구현
- region/keyword 전용 도메인 상태머신 구현
- demo/documentation 정렬

## 선행조건 / 병렬 가능 작업
### 선행조건
- `E-01`의 package manifest와 경로 구조가 결정돼 있어야 한다.

### 병렬 가능 작업
- `F-02.1`은 `E-01/F-01.2`와 병렬 진행 가능하다.
- `F-02.3`은 `E-03/F-03.1` UI/UX 선행 설계와 병렬 진행 가능하다.

## Feature/UserStory/Task 실행 계획
### [F-02.1] 공개 타입/식별 규칙 재정의
| UserStory | Task ID | 실행 항목 | 산출물 | 검증 |
| --- | --- | --- | --- | --- |
| `US-02.1` selector 식별 정책 | `T-009` | `SelectorDefinition`의 유일성 기준을 `selector.id`로 고정하고 `selector.type` 중복 허용 규칙을 문서화한다. | core 공개 타입 계약 문서/코드 | 동일 `selector.type` 중복이 허용되고 `selector.id`만 유일성 대상이어야 한다. |
| `US-02.1` selector 식별 정책 | `T-010` | validation 코드를 `DUPLICATE_SELECTOR_ID` 중심으로 재정의하고 기존 duplicate type 정책을 제거한다. | validation 에러 규칙 | duplicate type 오류가 제거되고 duplicate id만 blocking error로 동작해야 한다. |
| `US-02.2` selection ownership 정규화 | `T-011` | `SelectionItem.selectorId`를 필수화한다. | selection item 타입 계약 | selection item이 어느 selector 소유인지 shape 추론 없이 판별 가능해야 한다. |
| `US-02.2` selection ownership 정규화 | `T-012` | selection merge/remove/clear 규칙을 `selectorId` 기준으로만 해석하도록 코어 모델을 정의한다. | selection ownership 규칙 | merge/remove/clear가 item shape나 selector type이 아니라 `selectorId`에만 의존해야 한다. |

### [F-02.2] headless controller/store
| UserStory | Task ID | 실행 항목 | 산출물 | 검증 |
| --- | --- | --- | --- | --- |
| `US-02.3` value/panel 상태 엔진 | `T-013` | controlled/uncontrolled selection store를 구현한다. | selection store/controller API | 외부 value와 내부 default state를 모두 처리하는 store가 React 없이 동작해야 한다. |
| `US-02.3` value/panel 상태 엔진 | `T-014` | active panel open/close 상태와 panel change meta를 core controller로 이동한다. | panel state controller | panel open/close가 host 구현이 아니라 core 이벤트로 추적 가능해야 한다. |
| `US-02.4` change meta와 action 계약 | `T-015` | `ValueChangeMeta`, `PanelOpenChangeEvent`, `SelectionChangeEvent`를 core 이벤트로 정규화한다. | 공개 이벤트 타입 | selector source, external source, clear-all 같은 변화 맥락이 타입으로 고정돼야 한다. |
| `US-02.4` change meta와 action 계약 | `T-016` | selector source, external source, clear-all reason 규칙을 unit test로 고정한다. | core unit test | 상태 전이 메타가 회귀 없이 유지돼야 한다. |

### [F-02.3] plugin targeting과 오류 격리
| UserStory | Task ID | 실행 항목 | 산출물 | 검증 |
| --- | --- | --- | --- | --- |
| `US-02.5` plugin targeting 모델 | `T-017` | plugin 입력을 `readonly SelectorPlugin[]`로 바꾸고 `all | selectorIds[] | selectorTypes[]` target 모델을 도입한다. | plugin targeting 타입/해석 로직 | plugin 적용 대상이 selector ID와 selector type 기준으로 모두 해석 가능해야 한다. |
| `US-02.5` plugin targeting 모델 | `T-018` | plugin stable binding key를 `plugin.id@version + resolved target` 기준으로 구현한다. | stable binding 규칙 | 동일 plugin이 타깃 해석 결과까지 포함해 안정적으로 식별돼야 한다. |
| `US-02.6` plugin error isolation | `T-019` | plugin hook 오류를 `onError`로 격리 디스패치하고 controller 상태 오염을 막는다. | plugin error isolation 경로 | plugin 예외가 core controller 상태를 깨지 않고 관측 포인트로 전달돼야 한다. |
| `US-02.6` plugin error isolation | `T-020` | `MISSING_SELECTORS`, `EMPTY_SELECTORS`, `DUPLICATE_SELECTOR_ID`, `UNKNOWN_PLUGIN_TARGET` 검증 테스트를 작성한다. | validation unit test | 필수 validation 오류가 전부 자동 검증돼야 한다. |

## 완료 조건(DoD)
- `@compsable-search/core`가 React import 없이 selection/panel/plugin 상태를 독립적으로 소유한다.
- `selector.id` 유일성과 `selector.type` 중복 허용 정책이 타입, validation, 테스트에 모두 반영된다.
- plugin targeting과 오류 격리 규칙이 이후 host/selector package가 그대로 소비할 수 있는 수준으로 고정된다.

## 테스트 및 검증
### Unit
- duplicate selector id
- selector ownership
- controlled/uncontrolled state
- plugin target resolution
- plugin error isolation

### Integration
- core controller가 host 없이도 value/panel/plugin 이벤트를 일관되게 산출하는지 검증

### Regression
- legacy duplicate type 규칙이 제거된 뒤 same-type multi-selector 시나리오가 막히지 않는지 확인
- `SelectionItem.selectorId` 누락 시 validation이 즉시 실패하는지 확인

## 리스크 / 차단요인 / 인계 조건
### 리스크 / 차단요인
| ID | 리스크/차단요인 | 영향 | 완화 방안 |
| --- | --- | --- | --- |
| `R-01` | 식별 정책 변경이 incomplete하면 host와 selector package에서 서로 다른 기준을 쓸 수 있음 | selection ownership 오동작 | `selector.id` 유일성, `selector.type` 중복 허용을 타입/validation/test 세 축으로 동시에 고정한다. |
| `R-02` | controlled/uncontrolled store가 React host에 종속되면 headless 목표가 무너짐 | `packages/core` 책임 분리 실패 | core 테스트를 React 비의존 순수 상태 전이 기준으로 설계한다. |
| `R-03` | plugin 예외가 controller 상태를 오염시키면 런타임 복구가 어려움 | selector host 전체 불안정 | `onError` 격리 디스패치와 상태 불변성 검증 테스트를 함께 둔다. |

### 인계 조건
- `E-03`는 이 Epic이 확정한 controller/store 및 이벤트 타입만 소비하고 selector-specific fallback을 추가하지 않는다.
- `E-04`는 `readonly SelectorPlugin[]`과 target model을 그대로 따른다.
- `E-06`는 이 Epic의 validation/test 범주를 release blocking 조건에 그대로 반영한다.
