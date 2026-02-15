# 이터레이션 계획서

## 1. 메타
- 이터레이션명: iteration-03-p1-style-and-api-hardening
- 기간: 2026-03-16 ~ 2026-03-27
- 작성일: 2026-02-15
- 기준 문서:
- PRD.md
- PRD.en.md
- backlog/public-api-contract-and-extensibility/epic.md
- backlog/library-quality-hardening-and-release-readiness/epic.md
- backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/feature.md
- backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/feature.md
- backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/consumer-and-internal-type-boundary-separation/userstory.md
- backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/selector-common-type-utilities-refinement/userstory.md
- backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/backward-compatibility-rule-documentation/userstory.md
- backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/style-scope-isolation-strategy-implementation/userstory.md
- backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/consumer-app-style-conflict-regression-validation/userstory.md
- backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/release-runbook-and-rollback-procedure/userstory.md

## 2. 목표
- 비즈니스/사용자 목표:
  - 소비자 API 타입 계약을 안정화(F-04)하고 스타일/운영 준비를 강화(F-09)해 외부 통합 리스크를 낮춘다.
- 기술 목표:
  - 공개 타입 경계를 정리하고 하위 호환 규칙을 문서화해 F-05/F-06의 기반을 만든다.
  - 스타일 스코프 격리 및 런북/롤백 절차를 완성해 릴리스 운영 품질을 높인다.
- 이번 이터레이션 성공 기준:
  - 포함 범위 Task(T-037~T-048, T-097~T-108)가 체크리스트에서 근거와 함께 완료 처리된다.
  - F-04, F-09 수용 기준 핵심 항목이 코드/테스트/문서로 추적 가능하게 충족된다.

## 3. 범위
### 3.1 포함 범위
| 우선순위 | Epic | Feature | UserStory | Task | 근거 문서 |
| --- | --- | --- | --- | --- | --- |
| P1 | [E-02] | [F-04] | [US-010] | [T-037] 정의한다: 소비자/내부 타입 경계 분리 범위와 수용 기준 | backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/consumer-and-internal-type-boundary-separation/define-scope-and-acceptance/task.md |
| P1 | [E-02] | [F-04] | [US-010] | [T-038] 구현한다: 소비자/내부 타입 경계 분리 핵심 시나리오 | backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/consumer-and-internal-type-boundary-separation/implement-main-scenario/task.md |
| P1 | [E-02] | [F-04] | [US-010] | [T-039] 검증한다: 소비자/내부 타입 경계 분리 회귀와 실패 시나리오 | backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/consumer-and-internal-type-boundary-separation/validate-regression-and-failure-flow/task.md |
| P1 | [E-02] | [F-04] | [US-010] | [T-040] 준비한다: 소비자/내부 타입 경계 분리 관측과 릴리스 운영 | backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/consumer-and-internal-type-boundary-separation/prepare-observability-and-rollout/task.md |
| P1 | [E-02] | [F-04] | [US-011] | [T-041] 정의한다: selector 공통 타입 유틸 정리 범위와 수용 기준 | backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/selector-common-type-utilities-refinement/define-scope-and-acceptance/task.md |
| P1 | [E-02] | [F-04] | [US-011] | [T-042] 구현한다: selector 공통 타입 유틸 정리 핵심 시나리오 | backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/selector-common-type-utilities-refinement/implement-main-scenario/task.md |
| P1 | [E-02] | [F-04] | [US-011] | [T-043] 검증한다: selector 공통 타입 유틸 정리 회귀와 실패 시나리오 | backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/selector-common-type-utilities-refinement/validate-regression-and-failure-flow/task.md |
| P1 | [E-02] | [F-04] | [US-011] | [T-044] 준비한다: selector 공통 타입 유틸 정리 관측과 릴리스 운영 | backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/selector-common-type-utilities-refinement/prepare-observability-and-rollout/task.md |
| P1 | [E-02] | [F-04] | [US-012] | [T-045] 정의한다: 하위 호환성 규칙 문서화 범위와 수용 기준 | backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/backward-compatibility-rule-documentation/define-scope-and-acceptance/task.md |
| P1 | [E-02] | [F-04] | [US-012] | [T-046] 작성한다: 하위 호환성 규칙 문서화 핵심 시나리오 | backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/backward-compatibility-rule-documentation/implement-main-scenario/task.md |
| P1 | [E-02] | [F-04] | [US-012] | [T-047] 검증한다: 하위 호환성 규칙 문서화 회귀와 실패 시나리오 | backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/backward-compatibility-rule-documentation/validate-regression-and-failure-flow/task.md |
| P1 | [E-02] | [F-04] | [US-012] | [T-048] 준비한다: 하위 호환성 규칙 문서화 관측과 릴리스 운영 | backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/backward-compatibility-rule-documentation/prepare-observability-and-rollout/task.md |
| P1 | [E-03] | [F-09] | [US-025] | [T-097] 정의한다: 스타일 스코프 격리 전략 적용 범위와 수용 기준 | backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/style-scope-isolation-strategy-implementation/define-scope-and-acceptance/task.md |
| P1 | [E-03] | [F-09] | [US-025] | [T-098] 구현한다: 스타일 스코프 격리 전략 적용 핵심 시나리오 | backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/style-scope-isolation-strategy-implementation/implement-main-scenario/task.md |
| P1 | [E-03] | [F-09] | [US-025] | [T-099] 검증한다: 스타일 스코프 격리 전략 적용 회귀와 실패 시나리오 | backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/style-scope-isolation-strategy-implementation/validate-regression-and-failure-flow/task.md |
| P1 | [E-03] | [F-09] | [US-025] | [T-100] 준비한다: 스타일 스코프 격리 전략 적용 관측과 릴리스 운영 | backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/style-scope-isolation-strategy-implementation/prepare-observability-and-rollout/task.md |
| P1 | [E-03] | [F-09] | [US-026] | [T-101] 정의한다: 소비자 앱 충돌 회귀 검증 범위와 수용 기준 | backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/consumer-app-style-conflict-regression-validation/define-scope-and-acceptance/task.md |
| P1 | [E-03] | [F-09] | [US-026] | [T-102] 구현한다: 소비자 앱 충돌 회귀 검증 핵심 시나리오 | backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/consumer-app-style-conflict-regression-validation/implement-main-scenario/task.md |
| P1 | [E-03] | [F-09] | [US-026] | [T-103] 검증한다: 소비자 앱 충돌 회귀 검증 회귀와 실패 시나리오 | backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/consumer-app-style-conflict-regression-validation/validate-regression-and-failure-flow/task.md |
| P1 | [E-03] | [F-09] | [US-026] | [T-104] 준비한다: 소비자 앱 충돌 회귀 검증 관측과 릴리스 운영 | backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/consumer-app-style-conflict-regression-validation/prepare-observability-and-rollout/task.md |
| P1 | [E-03] | [F-09] | [US-027] | [T-105] 정의한다: 릴리스 런북과 롤백 절차 정리 범위와 수용 기준 | backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/release-runbook-and-rollback-procedure/define-scope-and-acceptance/task.md |
| P1 | [E-03] | [F-09] | [US-027] | [T-106] 작성한다: 릴리스 런북과 롤백 절차 정리 핵심 시나리오 | backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/release-runbook-and-rollback-procedure/implement-main-scenario/task.md |
| P1 | [E-03] | [F-09] | [US-027] | [T-107] 검증한다: 릴리스 런북과 롤백 절차 정리 회귀와 실패 시나리오 | backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/release-runbook-and-rollback-procedure/validate-regression-and-failure-flow/task.md |
| P1 | [E-03] | [F-09] | [US-027] | [T-108] 준비한다: 릴리스 런북과 롤백 절차 정리 관측과 릴리스 운영 | backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/release-runbook-and-rollback-procedure/prepare-observability-and-rollout/task.md |

### 3.2 제외 범위
- [E-02/F-05], [E-02/F-06]: F-04 결과를 반영해 다음 이터레이션에서 착수한다.
- [E-04/F-10~F-12]: 우선순위 P2 범위로 유지한다.

## 4. 일정/마일스톤
- M1: 범위 확정 (2026-03-16)
- M2: 구현 완료 (2026-03-21)
- M3: 검증 완료 (2026-03-25)
- M4: 배포/릴리스 판단 (2026-03-27)

### 4.1 일자별/담당역할별 착수 순서
| 일자 | 담당 역할 | 즉시 착수 Task | 선행/완료 조건 |
| --- | --- | --- | --- |
| 2026-03-16 (월) | 프론트엔드 테크리드 | T-037, T-041, T-045, T-097, T-101, T-105 | 각 UserStory 정의 Task 착수 |
| 2026-03-17 (화) | 프론트엔드 엔지니어 | T-038, T-042, T-098 | 선행 정의 Task 완료분부터 순차 착수 |
| 2026-03-17 (화) | 기술 문서 엔지니어 | T-046, T-106 | T-045, T-105 완료 후 착수 |
| 2026-03-18 (수) | QA 엔지니어 | T-102, T-039, T-043 | 구현/작성 완료본 기준 검증 착수 |
| 2026-03-19 (목) | QA 엔지니어 | T-047, T-099, T-103, T-107 | 검증 트랙 병렬 진행 |
| 2026-03-20 (금) | 릴리스 엔지니어 | T-040, T-044, T-048, T-100, T-104, T-108 | 검증 완료 Task 기준 운영 준비 착수 |
| 2026-03-23 (월) | QA 엔지니어, 릴리스 엔지니어 | 통합 회귀/문서 정합성 점검 | 실패 케이스 재검증 포함 |
| 2026-03-26 (목) | 프론트엔드 테크리드, 릴리스 엔지니어 | 릴리스 게이트 리뷰/오픈 이슈 정리 | iteration-04 입력 조건 확정 |
| 2026-03-27 (금) | FE Lead, QA, 릴리스 | M4 게이트 판정/다음 이터레이션 인계 | 완료 로그/증적 정리 |

### 4.2 병렬 실행 트랙
| 트랙 | 범위 | 담당 역할 중심 | 목표 완료일 |
| --- | --- | --- | --- |
| Track-A | E-02/F-04 (T-037~T-048) | FE Tech Lead + FE 엔지니어 + 기술 문서 + QA + 릴리스 | 2026-03-24 |
| Track-B | E-03/F-09 (T-097~T-108) | FE Tech Lead + FE 엔지니어 + 기술 문서 + QA + 릴리스 | 2026-03-24 |
| Track-C | 통합 검증/릴리스 판단 | QA + 릴리스 + FE Lead | 2026-03-27 |

## 5. 의존성 및 리스크
| 구분 | 내용 | 영향도 | 대응 방안 | 담당 |
| --- | --- | --- | --- | --- |
| 의존성 | F-04는 F-01/F-03 완료 산출물에 의존 | High | iteration-01/02 완료 로그를 선행 확인 항목으로 고정 | FE Lead |
| 의존성 | F-09는 F-07/F-08 완료 산출물에 의존 | High | iteration-01/02의 테스트/운영 증적을 재사용 | QA/릴리스 |
| 리스크 | 하위 호환 규칙 문서화 미흡 시 F-05/F-06 재작업 가능 | Medium | T-046/T-047 완료 시 API 계약 diff 리뷰 필수화 | FE Lead |
| 리스크 | 스타일 격리 변경이 소비자 앱에 예기치 않은 영향 | Medium | T-102/T-103에서 호스트 앱 회귀 케이스를 우선 검증 | QA |
| 리스크 | 런북/롤백 절차 문서 최신성 저하 | Low | T-106/T-108 완료 시 체크리스트와 동기화 검수 | 릴리스 엔지니어 |

## 6. 완료 기준 (Exit Criteria)
- [ ] 커밋 범위의 Task가 모두 체크리스트에서 완료 처리된다.
- [ ] 필수 테스트/검증 결과가 통과한다.
- [ ] 운영 준비(모니터링/롤백/런북)가 준비된다.
- [ ] 미해결 이슈가 릴리스 허용 범위 내로 정리된다.

## 7. 오픈 이슈
- F-05/F-06 착수 시점과 병렬 가능 범위 확정 (TBD)
- 스타일 충돌 검증 대상 소비자 앱 샘플 표준 확정 (TBD)
- E-04(키워드 모델) 착수 기준선 확정 (TBD)

