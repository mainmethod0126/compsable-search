# [E-03] React Host Shell 재구성

## 문서 메타
- 이슈 제목: `Generic Selector/Plugin 플랫폼 전면 재설계`
- 하위 플랜: `E-03 React Host Shell 재구성`
- 이슈 소스: `사용자 요청`
- 기준일: `2026-03-07`
- 상태: `Final`
- 출력 경로: `.agents/issues/generic-selector-plugin-platform-redesign/subplans/03-react-host-shell.md`
- Task 구간: `021-030`

## 상위 계획과의 연결
- 상위 인덱스 문서: [../plan.md](../plan.md)
- 이 Epic의 역할: `@compsable-search/react`를 selector-specific 분기 없는 generic host shell로 재구성하고, UI/UX 선행 설계 산출물과 runtime 구현을 연결한다.
- 선행 Epic:
  - `E-02`의 controller/store와 validation 정책 확정
- 후속 Epic:
  - `E-04`는 이 Epic이 제공하는 generic host 위에서 selector package를 연결한다.
  - `E-05`는 이 Epic의 shell/export 계약을 README/demo/API 문서의 기준으로 사용한다.

## 이번 Epic의 목표 / 비목표
### 목표
- trigger area, panel host, selected basket으로 구성된 generic shell을 정의한다.
- `ComposableSearch`를 core controller 구독 기반의 얇은 React host로 재작성한다.
- domain-agnostic 공통 UI와 React export 표면만 남긴다.

### 비목표
- region/keyword 데이터 모델 직접 소유
- legacy fallback ID/shape inference 유지
- selector package 내부 도메인 로직 구현

## 선행조건 / 병렬 가능 작업
### 선행조건
- `E-02`의 `ValueChangeMeta`, `PanelOpenChangeEvent`, `SelectionChangeEvent`, plugin targeting 규칙이 고정돼 있어야 한다.

### 병렬 가능 작업
- `F-03.1` UI/UX 선행 설계는 `E-02/F-02.3`과 병렬 가능하다.
- `F-03.2`와 `F-03.3`은 shell 정보구조가 나온 뒤 병렬 일부 조정 가능하다.

## Feature/UserStory/Task 실행 계획
### [F-03.1] UI/UX 선행 설계
| UserStory | Task ID | 실행 항목 | 산출물 | 검증 |
| --- | --- | --- | --- | --- |
| `US-03.1` shell 정보구조와 상태 정의 | `T-021` | trigger area, panel host, selected basket 3영역 shell 와이어프레임을 정의한다. | shell wireframe | host의 3영역 책임이 selector 내용과 분리돼 설명 가능해야 한다. |
| `US-03.1` shell 정보구조와 상태 정의 | `T-022` | empty/loading/error/focus/keyboard 상태 목록과 반응형 규칙을 정리한다. | 상태 목록, 반응형 규칙 | shell 상태가 selector package와 host 사이에서 누락 없이 매핑돼야 한다. |
| `US-03.2` 프로토타입/핸드오프 | `T-023` | 클릭 가능한 shell 프로토타입을 만든다. | interactive prototype | panel 전환, trigger 상호작용, selected basket 흐름이 설계 단계에서 검토 가능해야 한다. |
| `US-03.2` 프로토타입/핸드오프 | `T-024` | 접근성 체크리스트와 CSS token/class contract를 handoff 문서로 고정한다. | a11y checklist, CSS contract | 구현자가 class/token/상태명을 임의로 다시 정하지 않아도 돼야 한다. |

### [F-03.2] React runtime과 core 연결
| UserStory | Task ID | 실행 항목 | 산출물 | 검증 |
| --- | --- | --- | --- | --- |
| `US-03.3` generic host 구현 | `T-025` | `ComposableSearch`를 core controller 구독 기반의 얇은 host로 다시 작성한다. | React host runtime | host가 상태 소유자가 아니라 core 구독/렌더 계층임이 코드 구조로 드러나야 한다. |
| `US-03.3` generic host 구현 | `T-026` | 현재 host 내부의 `region/keyword` 분기, region search cache, legacy fallback ID를 모두 제거한다. | selector-agnostic host | host 내부에서 selector 종류별 분기가 사라져야 한다. |
| `US-03.4` 공통 UI 컴포넌트 분리 | `T-027` | trigger list, panel container, selected basket을 domain-agnostic 컴포넌트로 분리한다. | 공통 shell 컴포넌트 | region/keyword/custom selector가 동일 shell 부품을 공유할 수 있어야 한다. |
| `US-03.4` 공통 UI 컴포넌트 분리 | `T-028` | React integration test로 panel switching, selection sync, clear-all, plugin event dispatch를 고정한다. | React integration test | generic host의 핵심 상호작용이 자동 검증돼야 한다. |

### [F-03.3] React 공개 API 정리
| UserStory | Task ID | 실행 항목 | 산출물 | 검증 |
| --- | --- | --- | --- | --- |
| `US-03.5` React package export 안정화 | `T-029` | `@compsable-search/react`에서 `ComposableSearch`, React host types, common shell props만 export한다. | React package export surface | public export가 generic host API로만 제한돼야 한다. |
| `US-03.5` React package export 안정화 | `T-030` | React package가 region/keyword 전용 모듈을 직접 import하지 않음을 검증한다. | import boundary 검증 | package 경계가 lint/test 수준에서 자동 확인돼야 한다. |

## 완료 조건(DoD)
- `ComposableSearch`가 core controller 구독 기반의 얇은 host로 동작한다.
- host 내부에 selector-specific 분기와 legacy fallback이 존재하지 않는다.
- shell UI의 상태/접근성/CSS 계약이 문서와 구현에서 같은 이름으로 유지된다.
- React package export가 generic host API로 한정된다.

## 테스트 및 검증
### Unit
- shell 상태 매핑 규칙과 common shell props 타입 검증

### Integration
- panel switching
- selection sync
- clear-all
- plugin event dispatch
- domain-specific import 제거 검증

### Regression
- 기존 region/keyword UX가 host generic화 이후에도 shell 수준에서 회귀하지 않는지 확인
- keyboard/focus/error 상태가 selector package 연결 시 누락되지 않는지 확인

## 리스크 / 차단요인 / 인계 조건
### 리스크 / 차단요인
| ID | 리스크/차단요인 | 영향 | 완화 방안 |
| --- | --- | --- | --- |
| `R-01` | UI shell 설계가 늦어지면 구현자가 selector package 인터페이스를 임의로 추론하게 됨 | host/selector 결합 증가 | wireframe, 상태 목록, CSS contract를 먼저 고정한다. |
| `R-02` | host가 core 상태를 다시 소유하면 책임 분리가 무너짐 | `E-02` 산출물 무력화 | host를 구독/렌더 전용으로 유지하고 상태 전이 테스트를 core 이벤트 기준으로 고정한다. |
| `R-03` | React package가 selector package를 직접 import하면 generic host가 아니라 조합 불가능한 패키지가 됨 | `E-04` package 분리 실패 | export/import boundary 검증을 release blocking 수준으로 올린다. |

### 인계 조건
- `E-04`는 shell props/CSS contract를 바꾸지 않고 selector package 내부에서 필요한 패널 UI만 제공한다.
- `E-05`는 demo와 README에 이 Epic의 export surface만 사용한다.
- `E-06`는 domain-specific import 제거 검증을 release blocking 체크에 포함한다.
