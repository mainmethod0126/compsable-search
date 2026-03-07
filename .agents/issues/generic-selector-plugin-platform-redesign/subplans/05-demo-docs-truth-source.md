# [E-05] Demo와 문서 Truth Source 재정렬

## 문서 메타
- 이슈 제목: `Generic Selector/Plugin 플랫폼 전면 재설계`
- 하위 플랜: `E-05 Demo와 문서 Truth Source 재정렬`
- 이슈 소스: `사용자 요청`
- 기준일: `2026-03-07`
- 상태: `Final`
- 출력 경로: `.agents/issues/generic-selector-plugin-platform-redesign/subplans/05-demo-docs-truth-source.md`
- Task 구간: `041-048`

## 상위 계획과의 연결
- 상위 인덱스 문서: [../plan.md](../plan.md)
- 이 Epic의 역할: 새 workspace/package 구조를 demo와 문서에 반영해 코드와 문서의 truth source를 일치시킨다.
- 선행 Epic:
  - `E-01`~`E-04`의 공개 구조와 package API가 고정돼 있어야 한다.
- 후속 Epic:
  - `E-06`는 이 Epic의 snippet smoke와 contract test를 릴리스 게이트에 직접 사용한다.

## 이번 Epic의 목표 / 비목표
### 목표
- `apps/demo`가 root source import 없이 workspace package만 소비하게 만든다.
- `README.md`, `PRD.md`, API/release 문서를 새 플랫폼 구조 기준으로 다시 쓴다.
- 문서 스니펫과 public API contract test를 1:1로 맞춘다.

### 비목표
- core/react/selector package 내부 기능 추가
- release/no-release 운영 판정
- legacy compat 경로 유지

## 선행조건 / 병렬 가능 작업
### 선행조건
- `E-01`의 workspace/package 경계
- `E-03`의 React export surface
- `E-04`의 region/keyword package 공개 API

### 병렬 가능 작업
- `F-05.1` demo 재구성과 `F-05.2` 문서 전면 교체는 병렬 가능하다.
- `F-05.3`는 demo와 문서의 새 계약이 나온 뒤 결합 검증 단계로 진행한다.

## Feature/UserStory/Task 실행 계획
### [F-05.1] demo 앱 재구성
| UserStory | Task ID | 실행 항목 | 산출물 | 검증 |
| --- | --- | --- | --- | --- |
| `US-05.1` published-package 소비 demo | `T-041` | `apps/demo`가 root source import 없이 workspace package만 소비하도록 수정한다. | package-only demo import 경로 | demo가 실제 publishable package 소비자와 같은 경로로 동작해야 한다. |
| `US-05.1` published-package 소비 demo | `T-042` | demo에 region, keyword, custom selector, same-type multi-selector 시나리오를 추가한다. | 확장된 demo 시나리오 | 새 플랫폼 구조의 대표 사용 사례가 demo 하나로 검증돼야 한다. |

### [F-05.2] 문서 전면 교체
| UserStory | Task ID | 실행 항목 | 산출물 | 검증 |
| --- | --- | --- | --- | --- |
| `US-05.2` canonical docs rewrite | `T-043` | `README.md`를 workspace 설치/최소 예제/패키지별 역할 중심으로 전면 교체한다. | 새 README | README가 root monolith가 아니라 workspace package 구조를 설명해야 한다. |
| `US-05.2` canonical docs rewrite | `T-044` | `PRD.md`를 새 플랫폼 구조 기준으로 다시 쓰고 기존 단일 패키지 설명은 archive 처리 대상으로 분리한다. | 새 PRD 및 archive 방향 | PRD가 더 이상 단일 패키지 모델을 현재 구조로 설명하지 않아야 한다. |
| `US-05.3` API/release docs cleanup | `T-045` | `docs/api-usage-guide.md`, `docs/public-api-compatibility-rules.md`를 새 validation/package topology 기준으로 재작성한다. | API/release 문서 갱신 | 문서가 `selector.id` 유일성, package topology, generic host 계약을 반영해야 한다. |
| `US-05.3` API/release docs cleanup | `T-046` | legacy compat/0.5 migration을 전제로 한 문서를 삭제 또는 `docs/archive`로 이동한다. | archive 정리 결과 | 현재 truth source를 흐리는 문서가 active docs 영역에서 제거돼야 한다. |

### [F-05.3] 문서-코드 동기화 게이트
| UserStory | Task ID | 실행 항목 | 산출물 | 검증 |
| --- | --- | --- | --- | --- |
| `US-05.4` snippet/contract smoke | `T-047` | README/API guide 코드 스니펫 compile smoke를 추가한다. | snippet compile smoke | 문서 예제가 실제 타입/빌드 계약과 동기화돼야 한다. |
| `US-05.4` snippet/contract smoke | `T-048` | package별 public API contract test 위치를 재배치하고 문서와 1:1로 맞춘다. | public API contract test 재배치 | 문서와 테스트가 같은 계약을 설명해야 한다. |

## 완료 조건(DoD)
- demo가 root source import 없이 workspace package만 소비한다.
- README, PRD, API 문서가 새 플랫폼 구조를 canonical truth source로 설명한다.
- snippet smoke와 public API contract test가 문서 예제를 자동 검증한다.

## 테스트 및 검증
### Unit
- public API contract test
- 문서 스니펫 타입/컴파일 smoke

### Integration
- demo에서 region/keyword/custom/same-type multi-selector 시나리오 실행
- README/API guide 예제가 실제 package import로 동작하는지 확인

### Regression
- legacy compat/0.5 가정이 active docs에 남아 있지 않은지 확인
- 문서 설명과 release blocking 조건이 상위 `plan.md`와 충돌하지 않는지 확인

## 리스크 / 차단요인 / 인계 조건
### 리스크 / 차단요인
| ID | 리스크/차단요인 | 영향 | 완화 방안 |
| --- | --- | --- | --- |
| `R-01` | demo가 여전히 root source import를 사용하면 publishable package 검증이 왜곡됨 | release gate 오탐/미탐 | demo import 경로를 package-only로 고정하고 build를 별도 smoke로 묶는다. |
| `R-02` | 문서 rewrite 없이 코드만 바뀌면 소비자가 폐기된 계약을 따라가게 됨 | 도입 실패 | README/PRD/API 문서를 한 Epic에서 함께 재작성한다. |
| `R-03` | 문서 예제가 테스트되지 않으면 다시 빠르게 드리프트함 | 문서 신뢰도 하락 | snippet compile smoke와 public API contract test를 강제한다. |

### 인계 조건
- `E-06`는 이 Epic의 demo build, snippet smoke, contract test를 RC 증적에 포함한다.
- 이후 backlog/iteration 문서화는 이 Epic의 canonical docs를 기준으로만 작성한다.
