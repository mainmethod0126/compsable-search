# 이터레이션 체크리스트

## 메타
- 이터레이션명: iteration-03-p1-style-and-api-hardening
- 기간: 2026-03-16 ~ 2026-03-27
- 마지막 갱신: 2026-02-19

## 진행률
- 완료율: 33/33 (100%)

## 1. 착수 준비
- [x] 계획서와 범위가 확정되었다. (완료: 2026-02-19, 근거: `iteration-plan.md`, `execution-log.md`)
- [x] 선행 의존성/차단 이슈를 확인했다. (완료: 2026-02-19, 근거: `iteration-plan.md` 5장 의존성/리스크 재검토)
- [x] 담당자와 우선순위를 합의했다. (완료: 2026-02-19, 근거: `iteration-plan.md` 4.1/2.2 기준으로 작업 반영)

## 2. 구현
- [x] [T-037] 정의한다: 소비자/내부 타입 경계 분리 범위와 수용 기준 (backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/consumer-and-internal-type-boundary-separation/define-scope-and-acceptance/task.md) (완료: 2026-02-19, 근거: `.agents/iterations/iteration-03-p1-style-and-api-hardening/execution-log.md` 정의 섹션)
- [x] [T-038] 구현한다: 소비자/내부 타입 경계 분리 핵심 시나리오 (backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/consumer-and-internal-type-boundary-separation/implement-main-scenario/task.md) (완료: 2026-02-19, 근거: `src/components/publicTypes.ts`, `src/components/internalTypes.ts`, `src/components/ComposableSearch.tsx`)
- [x] [T-039] 검증한다: 소비자/내부 타입 경계 분리 회귀와 실패 시나리오 (backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/consumer-and-internal-type-boundary-separation/validate-regression-and-failure-flow/task.md) (완료: 2026-02-19, 근거: `src/components/publicTypeContract.test.ts`, `npm test` 통과)
- [x] [T-040] 준비한다: 소비자/내부 타입 경계 분리 관측과 릴리스 운영 (backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/consumer-and-internal-type-boundary-separation/prepare-observability-and-rollout/task.md) (완료: 2026-02-19, 근거: `.agents/iterations/iteration-03-p1-style-and-api-hardening/release-runbook.md`)
- [x] [T-041] 정의한다: selector 공통 타입 유틸 정리 범위와 수용 기준 (backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/selector-common-type-utilities-refinement/define-scope-and-acceptance/task.md) (완료: 2026-02-19, 근거: `.agents/iterations/iteration-03-p1-style-and-api-hardening/execution-log.md` 정의 섹션)
- [x] [T-042] 구현한다: selector 공통 타입 유틸 정리 핵심 시나리오 (backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/selector-common-type-utilities-refinement/implement-main-scenario/task.md) (완료: 2026-02-19, 근거: `src/components/selectorTypeUtils.ts`, `src/components/index.ts`)
- [x] [T-043] 검증한다: selector 공통 타입 유틸 정리 회귀와 실패 시나리오 (backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/selector-common-type-utilities-refinement/validate-regression-and-failure-flow/task.md) (완료: 2026-02-19, 근거: `src/components/selectorTypeUtils.test.ts`, `npm test` 통과)
- [x] [T-044] 준비한다: selector 공통 타입 유틸 정리 관측과 릴리스 운영 (backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/selector-common-type-utilities-refinement/prepare-observability-and-rollout/task.md) (완료: 2026-02-19, 근거: `.agents/iterations/iteration-03-p1-style-and-api-hardening/release-runbook.md`)
- [x] [T-045] 정의한다: 하위 호환성 규칙 문서화 범위와 수용 기준 (backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/backward-compatibility-rule-documentation/define-scope-and-acceptance/task.md) (완료: 2026-02-19, 근거: `docs/public-api-compatibility-rules.md` 범위/수용 기준 명시)
- [x] [T-046] 작성한다: 하위 호환성 규칙 문서화 핵심 시나리오 (backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/backward-compatibility-rule-documentation/implement-main-scenario/task.md) (완료: 2026-02-19, 근거: `docs/public-api-compatibility-rules.md` 작성)
- [x] [T-047] 검증한다: 하위 호환성 규칙 문서화 회귀와 실패 시나리오 (backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/backward-compatibility-rule-documentation/validate-regression-and-failure-flow/task.md) (완료: 2026-02-19, 근거: `src/components/publicTypeContract.test.ts`, `npm test` 통과)
- [x] [T-048] 준비한다: 하위 호환성 규칙 문서화 관측과 릴리스 운영 (backlog/public-api-contract-and-extensibility/public-type-contract-refactoring/backward-compatibility-rule-documentation/prepare-observability-and-rollout/task.md) (완료: 2026-02-19, 근거: `.agents/iterations/iteration-03-p1-style-and-api-hardening/release-runbook.md`)
- [x] [T-097] 정의한다: 스타일 스코프 격리 전략 적용 범위와 수용 기준 (backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/style-scope-isolation-strategy-implementation/define-scope-and-acceptance/task.md) (완료: 2026-02-19, 근거: `.agents/iterations/iteration-03-p1-style-and-api-hardening/execution-log.md` 정의 섹션)
- [x] [T-098] 구현한다: 스타일 스코프 격리 전략 적용 핵심 시나리오 (backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/style-scope-isolation-strategy-implementation/implement-main-scenario/task.md) (완료: 2026-02-19, 근거: `src/index.css`, `src/App.css`, `src/App.tsx`)
- [x] [T-099] 검증한다: 스타일 스코프 격리 전략 적용 회귀와 실패 시나리오 (backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/style-scope-isolation-strategy-implementation/validate-regression-and-failure-flow/task.md) (완료: 2026-02-19, 근거: `src/styleIsolation.test.ts`, `npm test` 통과)
- [x] [T-100] 준비한다: 스타일 스코프 격리 전략 적용 관측과 릴리스 운영 (backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/style-scope-isolation-strategy-implementation/prepare-observability-and-rollout/task.md) (완료: 2026-02-19, 근거: `.agents/iterations/iteration-03-p1-style-and-api-hardening/release-runbook.md`)
- [x] [T-101] 정의한다: 소비자 앱 충돌 회귀 검증 범위와 수용 기준 (backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/consumer-app-style-conflict-regression-validation/define-scope-and-acceptance/task.md) (완료: 2026-02-19, 근거: `.agents/iterations/iteration-03-p1-style-and-api-hardening/execution-log.md` 정의 섹션)
- [x] [T-102] 구현한다: 소비자 앱 충돌 회귀 검증 핵심 시나리오 (backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/consumer-app-style-conflict-regression-validation/implement-main-scenario/task.md) (완료: 2026-02-19, 근거: `src/styleIsolation.test.ts` 충돌 회귀 시나리오 구현)
- [x] [T-103] 검증한다: 소비자 앱 충돌 회귀 검증 회귀와 실패 시나리오 (backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/consumer-app-style-conflict-regression-validation/validate-regression-and-failure-flow/task.md) (완료: 2026-02-19, 근거: `src/styleIsolation.test.ts`, `npm test` 통과)
- [x] [T-104] 준비한다: 소비자 앱 충돌 회귀 검증 관측과 릴리스 운영 (backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/consumer-app-style-conflict-regression-validation/prepare-observability-and-rollout/task.md) (완료: 2026-02-19, 근거: `.agents/iterations/iteration-03-p1-style-and-api-hardening/release-runbook.md`)
- [x] [T-105] 정의한다: 릴리스 런북과 롤백 절차 정리 범위와 수용 기준 (backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/release-runbook-and-rollback-procedure/define-scope-and-acceptance/task.md) (완료: 2026-02-19, 근거: `.agents/iterations/iteration-03-p1-style-and-api-hardening/execution-log.md` 정의 섹션)
- [x] [T-106] 작성한다: 릴리스 런북과 롤백 절차 정리 핵심 시나리오 (backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/release-runbook-and-rollback-procedure/implement-main-scenario/task.md) (완료: 2026-02-19, 근거: `.agents/iterations/iteration-03-p1-style-and-api-hardening/release-runbook.md` 작성)
- [x] [T-107] 검증한다: 릴리스 런북과 롤백 절차 정리 회귀와 실패 시나리오 (backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/release-runbook-and-rollback-procedure/validate-regression-and-failure-flow/task.md) (완료: 2026-02-19, 근거: `npm test`, `npm run lint`, `npm run build` 통과)
- [x] [T-108] 준비한다: 릴리스 런북과 롤백 절차 정리 관측과 릴리스 운영 (backlog/library-quality-hardening-and-release-readiness/style-isolation-and-release-operations-readiness/release-runbook-and-rollback-procedure/prepare-observability-and-rollout/task.md) (완료: 2026-02-19, 근거: `.agents/iterations/iteration-03-p1-style-and-api-hardening/release-runbook.md`)

## 2.1 일자별/담당역할별 착수 큐
| 일자 | 담당 역할 | 당일 우선 착수 Task | 비고 |
| --- | --- | --- | --- |
| 2026-03-16 (월) | 프론트엔드 테크리드 | T-037, T-041, T-045, T-097, T-101, T-105 | 정의 Task 일괄 완료로 병렬 구현 준비 |
| 2026-03-17 (화) | 프론트엔드 엔지니어 | T-038, T-042, T-098 | API/스타일 구현 트랙 |
| 2026-03-17 (화) | 기술 문서 엔지니어 | T-046, T-106 | 호환성 규칙/런북 문서화 |
| 2026-03-18 (수) | QA 엔지니어 | T-102, T-039, T-043 | 구현 완료분 기준 검증 시작 |
| 2026-03-19 (목) | QA 엔지니어 | T-047, T-099, T-103, T-107 | 검증 트랙 병렬 진행 |
| 2026-03-20 (금) | 릴리스 엔지니어 | T-040, T-044, T-048, T-100, T-104, T-108 | 검증 완료분 기준 운영 준비 |

## 2.2 역할별 책임 범위
| 담당 역할 | 책임 Task |
| --- | --- |
| 프론트엔드 테크리드 | T-037, T-041, T-045, T-097, T-101, T-105 |
| 프론트엔드 엔지니어 | T-038, T-042, T-098 |
| 기술 문서 엔지니어 | T-046, T-106 |
| QA 엔지니어 | T-039, T-043, T-047, T-099, T-102, T-103, T-107 |
| 릴리스 엔지니어 | T-040, T-044, T-048, T-100, T-104, T-108 |

## 3. 검증
- [x] 기능 검증 시나리오를 실행했다. (완료: 2026-02-19, 근거: `npm test` + 신규 회귀 테스트 3건 추가)
- [x] 회귀 테스트를 수행했다. (완료: 2026-02-19, 근거: `src/components/publicTypeContract.test.ts`, `src/components/selectorTypeUtils.test.ts`, `src/styleIsolation.test.ts`)
- [x] 수용 기준(AC/DoD) 충족을 확인했다. (완료: 2026-02-19, 근거: `execution-log.md`, `docs/public-api-compatibility-rules.md`)

## 4. 배포/운영
- [x] 배포 체크리스트를 점검했다. (완료: 2026-02-19, 근거: `release-runbook.md` 1장)
- [x] 모니터링/알람 기준을 확인했다. (완료: 2026-02-19, 근거: `release-runbook.md` 2장)
- [x] 롤백 절차를 점검했다. (완료: 2026-02-19, 근거: `release-runbook.md` 4장)

## 5. 완료 로그
- 형식:
- `- [x] [T-xxx] {task-title} (완료: YYYY-MM-DD, 근거: {테스트/PR/리뷰 링크})`
- 예시:
- [x] [T-018] 구현한다: 2~3단계 지역 로딩 예외 처리 핵심 시나리오 (완료: 2026-02-14, 근거: npm run build 통과)

## 상태 갱신 규칙
- 완료 처리: `- [ ]`를 `- [x]`로 변경한다.
- 근거 필수: 완료일과 검증 근거를 항목 끝에 기록한다.
- 차단 상태: 체크 해제 상태 유지 + `(차단: 사유)`를 추가한다.
- 범위 변경: 계획서(`iteration-plan.md`)와 체크리스트(`checklist.md`)를 함께 갱신한다.


