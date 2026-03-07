# [E-04] First-party Selector 패키지 추출

## 문서 메타
- 이슈 제목: `Generic Selector/Plugin 플랫폼 전면 재설계`
- 하위 플랜: `E-04 First-party Selector 패키지 추출`
- 이슈 소스: `사용자 요청`
- 기준일: `2026-03-07`
- 상태: `Final`
- 출력 경로: `.agents/issues/generic-selector-plugin-platform-redesign/subplans/04-first-party-selector-packages.md`
- Task 구간: `031-040`

## 상위 계획과의 연결
- 상위 인덱스 문서: [../plan.md](../plan.md)
- 이 Epic의 역할: region/keyword를 코어 내장 기능이 아니라 공식 first-party selector package로 분리하고, multi-selector 조합성까지 검증한다.
- 선행 Epic:
  - `E-03` host가 selector-specific 분기를 제거해야 한다.
  - `E-02` plugin 계약과 ownership 정책이 확정돼 있어야 한다.
- 후속 Epic:
  - `E-05`는 이 Epic에서 확정한 package API를 demo/README/API guide에 반영한다.
  - `E-06`는 이 Epic의 integration test 범주를 release gate에 포함한다.

## 이번 Epic의 목표 / 비목표
### 목표
- `packages/selector-region`과 `packages/selector-keyword`가 각자 도메인 로직과 panel UI를 완전히 소유하게 만든다.
- `createRegionSelector`, `createKeywordSelector`를 공식 공개 API로 고정한다.
- same-type multi-selector와 custom selector 조합 시 ownership 분리가 유지됨을 검증한다.

### 비목표
- React host에 region/keyword 특수 분기 재도입
- legacy compat 레이어 제공
- 문서 rewrite와 release 운영 절차 작성

## 선행조건 / 병렬 가능 작업
### 선행조건
- `E-03`에서 generic host, common shell, import boundary가 정리돼 있어야 한다.

### 병렬 가능 작업
- `F-04.1` region 패키지화와 `F-04.2` keyword 패키지화는 병렬 가능하다.
- `F-04.3` 조합성 검증은 region/keyword package API가 고정된 뒤 수행한다.

## Feature/UserStory/Task 실행 계획
### [F-04.1] region selector 패키지화
| UserStory | Task ID | 실행 항목 | 산출물 | 검증 |
| --- | --- | --- | --- | --- |
| `US-04.1` region 도메인 로직 이동 | `T-031` | region 타입, selection policy, search model, async abort/race 제어를 `packages/selector-region`으로 이동한다. | region domain module | region 전용 상태와 비동기 제어가 host/core 밖으로 빠져야 한다. |
| `US-04.1` region 도메인 로직 이동 | `T-032` | region package 내부에서 검색 인덱스 cache와 error message 정책을 소유하게 만든다. | region package 내부 cache/error 정책 | region 검색 캐시와 에러 문구가 package 자체의 책임이어야 한다. |
| `US-04.2` region React panel/factory | `T-033` | `RegionSearchInput`, `RegionDetailPanel`, `createRegionSelector`를 region package 공개 API로 재구성한다. | region public API | 소비자가 region selector를 package API만으로 구성할 수 있어야 한다. |
| `US-04.2` region React panel/factory | `T-034` | 계층 탐색, 상호배타, 검색 선택, no-result/error 시나리오를 region package test로 고정한다. | region integration test | 핵심 UX 회귀가 region package 단위에서 검증돼야 한다. |

### [F-04.2] keyword selector 패키지화
| UserStory | Task ID | 실행 항목 | 산출물 | 검증 |
| --- | --- | --- | --- | --- |
| `US-04.3` keyword 상태머신 이동 | `T-035` | `keywordInputModel`, invalid token 정책, detail panel을 `packages/selector-keyword`로 이동한다. | keyword domain module | keyword 입력 상태머신이 host 외부 package 책임이어야 한다. |
| `US-04.3` keyword 상태머신 이동 | `T-036` | `createKeywordSelector`와 token event wiring을 keyword package 공개 API로 재구성한다. | keyword public API | 소비자가 keyword selector를 package API로만 조립할 수 있어야 한다. |
| `US-04.4` keyword package 검증 | `T-037` | Enter/Blur/Backspace, normalization, duplicate/max length/max token 테스트를 keyword package에 재배치한다. | keyword package test | 입력 상태머신의 정책 검증이 keyword package 내부에 위치해야 한다. |
| `US-04.4` keyword package 검증 | `T-038` | keyword selector가 React host를 통해 동일하게 동작하는 integration test를 작성한다. | keyword-host integration test | package와 generic host 결합이 회귀 없이 동작해야 한다. |

### [F-04.3] selector 조합성 검증
| UserStory | Task ID | 실행 항목 | 산출물 | 검증 |
| --- | --- | --- | --- | --- |
| `US-04.5` multi-selector 조합 | `T-039` | 동일 `selector.type`을 가진 복수 selector가 서로 다른 `selector.id`로 공존하는 테스트를 추가한다. | same-type multi-selector test | 동일 type 중복 허용 정책이 실제 조합 시나리오에서 통과해야 한다. |
| `US-04.5` multi-selector 조합 | `T-040` | region + keyword + custom selector 조합에서 value merge와 selector ownership 분리가 유지되는지 검증한다. | multi-selector integration test | 서로 다른 selector package가 ownership 충돌 없이 공존해야 한다. |

## 완료 조건(DoD)
- region/keyword의 도메인 로직과 panel UI가 각 package 안으로 이동한다.
- `createRegionSelector`, `createKeywordSelector`가 공식 package API로 동작한다.
- same-type multi-selector와 custom selector 조합이 `selector.id` 중심 ownership 정책을 만족한다.

## 테스트 및 검증
### Unit
- region selection policy
- keyword input state machine
- invalid token/normalization 규칙

### Integration
- hierarchy load
- whole/detail mutual exclusion
- search preview selection
- async abort/race
- no-result/error
- Enter/Blur/Backspace
- duplicate/max length/max token
- keyword-host integration
- region + keyword + custom selector 조합

### Regression
- host generic화 이후에도 region/keyword UX가 유지되는지 확인
- same-type multi-selector가 duplicate type 정책 제거 이후 정상 동작하는지 확인

## 리스크 / 차단요인 / 인계 조건
### 리스크 / 차단요인
| ID | 리스크/차단요인 | 영향 | 완화 방안 |
| --- | --- | --- | --- |
| `R-01` | region/keyword 로직 일부가 host나 core에 남아 있으면 package 경계가 흐려짐 | package 추출 실패 | 도메인 상태, 패널 UI, 에러/캐시 정책의 소유권을 package로 명시하고 import boundary를 점검한다. |
| `R-02` | async abort/race 제어가 region package 밖에 남아 있으면 런타임 책임이 분산됨 | 비동기 회귀 | region package test에 abort/race 시나리오를 포함해 package 내부 책임으로 고정한다. |
| `R-03` | same-type multi-selector 검증이 없으면 `selector.id` 정책이 문서상으로만 남음 | ownership 충돌 | multi-selector 조합 검증 항목을 반드시 release gate 선행 조건으로 취급한다. |

### 인계 조건
- `E-05`는 demo와 문서에서 이 Epic의 package API만 사용한다.
- `E-06`는 region/keyword integration 및 multi-selector 조합 테스트를 release blocking 체크에 포함한다.
