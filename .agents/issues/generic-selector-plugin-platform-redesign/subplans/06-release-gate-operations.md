# [E-06] 릴리스 게이트와 운영 준비

## 문서 메타
- 이슈 제목: `Generic Selector/Plugin 플랫폼 전면 재설계`
- 하위 플랜: `E-06 릴리스 게이트와 운영 준비`
- 이슈 소스: `사용자 요청`
- 기준일: `2026-03-07`
- 상태: `Final`
- 출력 경로: `.agents/issues/generic-selector-plugin-platform-redesign/subplans/06-release-gate-operations.md`
- Task 구간: `049-054`

## 상위 계획과의 연결
- 상위 인덱스 문서: [../plan.md](../plan.md)
- 이 Epic의 역할: workspace/package 구조, core/react/selector package, demo/docs 정렬 결과를 release/no-release 판단 기준과 운영 관측 절차로 묶는다.
- 선행 Epic:
  - `E-01`~`E-05` 완료
- 후속 Epic:
  - 없음. 본 Epic은 최종 RC 승인과 운영 인수 조건을 닫는 단계다.

## 이번 Epic의 목표 / 비목표
### 목표
- workspace 기준 품질 게이트와 publish blocking 기준을 명문화한다.
- rollback/dist-tag/tarball deprecate 절차를 정의한다.
- selector lifecycle 및 plugin error 관측 포인트를 고정하고 RC 증적 문서를 완성한다.

### 비목표
- 새로운 기능 추가
- 미정 정책을 남긴 채 릴리스 진행
- 문서와 코드가 불일치한 상태의 예외 승인

## 선행조건 / 병렬 가능 작업
### 선행조건
- `E-01`~`E-05`가 생성한 package/test/demo/docs truth source가 모두 준비돼 있어야 한다.

### 병렬 가능 작업
- release readiness 문서화와 운영 관측 설계는 일부 병렬 가능하다.
- 최종 RC 증적 수집은 모든 게이트가 고정된 뒤 마지막 단계로 수행한다.

## Feature/UserStory/Task 실행 계획
### [F-06.1] release readiness
| UserStory | Task ID | 실행 항목 | 산출물 | 검증 |
| --- | --- | --- | --- | --- |
| `US-06.1` 품질 게이트 고정 | `T-049` | workspace 기준 `lint/test/build/pack/demo build` 체크리스트를 작성한다. | release checklist | 최종 승인 전에 실행할 명령과 합격 기준이 문서화돼야 한다. |
| `US-06.1` 품질 게이트 고정 | `T-050` | 각 패키지별 publish blocking 이슈와 owner를 릴리스 문서에 명시한다. | publish blocking 목록, owner 매핑 | package별 출하 차단 기준과 책임자가 명확해야 한다. |

### [F-06.2] rollback과 운영 관측
| UserStory | Task ID | 실행 항목 | 산출물 | 검증 |
| --- | --- | --- | --- | --- |
| `US-06.2` 운영 준비 | `T-051` | rollback 기준, dist-tag 대응, tarball deprecate 절차를 문서화한다. | rollback/dist-tag/deprecate 절차서 | 문제 발생 시 재배포가 아니라 즉시 되돌리는 절차가 명확해야 한다. |
| `US-06.2` 운영 준비 | `T-052` | selector init/dispose, panel open, selection change, plugin error에 대한 관측 포인트를 정의한다. | observability spec | 런타임 이상 징후를 selector/plugin 수준에서 분류 가능해야 한다. |
| `US-06.3` 최종 증적 수집 | `T-053` | 최종 RC 증적 문서에 lint/test/build/pack/demo build 결과를 기록한다. | RC evidence 문서 | 실제 실행 결과가 문서에 남아 승인 근거로 사용 가능해야 한다. |
| `US-06.3` 최종 증적 수집 | `T-054` | 잔여 `TBD`가 `0건`인지 검토하고 release/no-release 판단 기준을 고정한다. | 최종 승인 판정 기록 | 미결정 항목 없이 출하 여부를 판단할 수 있어야 한다. |

## 완료 조건(DoD)
- 릴리스 전에 반드시 통과해야 하는 명령, 문서, owner, blocking 조건이 정리돼 있다.
- rollback/dist-tag/deprecate 절차가 문서화돼 운영자가 즉시 실행 가능하다.
- selector lifecycle과 plugin error 관측 포인트가 정의돼 있다.
- RC evidence와 최종 release/no-release 판정 기준이 문서로 남아 있다.

## 테스트 및 검증
### Unit
- 없음. 본 Epic은 운영/릴리스 문서화와 증적 수집이 중심이다.

### Integration
- `npm run lint -ws`
- `npm run test -ws`
- `npm run build -ws`
- `npm pack --workspaces`
- `apps/demo` production build

### Regression
- release blocking 조건이 상위 `plan.md`, demo/docs truth source, package import boundary와 충돌하지 않는지 확인
- `TBD`가 남아 있는 상태에서 승인 문서가 완료 처리되지 않는지 확인

## 리스크 / 차단요인 / 인계 조건
### 리스크 / 차단요인
| ID | 리스크/차단요인 | 영향 | 완화 방안 |
| --- | --- | --- | --- |
| `R-01` | 품질 게이트가 문서화되지 않으면 RC 단계에서 사람마다 다른 기준으로 판단함 | 출하 판단 불일치 | checklist와 blocking owner를 명시적으로 고정한다. |
| `R-02` | rollback 절차가 없으면 breaking release 대응이 늦어짐 | 운영 리스크 확대 | dist-tag, tarball deprecate, rollback 트리거를 사전에 문서화한다. |
| `R-03` | observability 포인트가 없으면 selector/plugin 오류의 원인 분류가 불가능함 | 사후 분석 실패 | selector init/dispose, panel, selection, plugin error 이벤트를 공통 관측 포인트로 정의한다. |

### 인계 조건
- 본 Epic 완료 시점이 실제 릴리스 승인 가능 시점이다.
- 후속 backlog/iteration 문서는 RC evidence와 release/no-release 판정 결과를 입력으로 삼는다.
