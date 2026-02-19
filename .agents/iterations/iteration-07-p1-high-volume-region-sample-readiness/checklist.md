# 이터레이션 체크리스트

## 메타
- 이터레이션명: iteration-07-p1-high-volume-region-sample-readiness
- 기간: 2026-05-11 ~ 2026-05-22
- 마지막 갱신: 2026-02-19

## 진행률
- 완료율: 21/21 (100%)

## 1. 착수 준비
- [x] 계획서와 범위가 확정되었다. (완료: 2026-02-19, 근거: .agents/iterations/iteration-07-p1-high-volume-region-sample-readiness/execution-log.md)
- [x] 선행 의존성/차단 이슈를 확인했다. (완료: 2026-02-19, 근거: .agents/iterations/iteration-07-p1-high-volume-region-sample-readiness/execution-log.md)
- [x] 담당자와 우선순위를 합의했다. (완료: 2026-02-19, 근거: .agents/iterations/iteration-07-p1-high-volume-region-sample-readiness/execution-log.md)

## 2. 구현
- [x] [T-157] 정의한다: 프로파일 규모와 생성 규칙 수용 기준 (backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/profile-spec-and-deterministic-generator/define-scope-and-acceptance/task.md) (완료: 2026-02-19, 근거: .agents/iterations/iteration-07-p1-high-volume-region-sample-readiness/profile-spec.md)
- [x] [T-158] 구현한다: 결정적 샘플 생성 유틸과 DemoService 연동 (backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/profile-spec-and-deterministic-generator/implement-main-scenario/task.md) (완료: 2026-02-19, 근거: src/DemoService.ts)
- [x] [T-159] 검증한다: 코드 유일성과 계층 정합성 테스트 (backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/profile-spec-and-deterministic-generator/validate-regression-and-failure-flow/task.md) (완료: 2026-02-19, 근거: src/DemoService.test.ts)
- [x] [T-160] 준비한다: 샘플 생성 규칙 운영 가이드와 변경 체크리스트 (backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/profile-spec-and-deterministic-generator/prepare-observability-and-rollout/task.md) (완료: 2026-02-19, 근거: .agents/iterations/iteration-07-p1-high-volume-region-sample-readiness/sample-generation-guide.md)
- [x] [T-161] 정의한다: 프로파일 전환 UX와 레이아웃 보호 기준 (backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/demo-profile-switch-and-list-ux-hardening/define-scope-and-acceptance/task.md) (완료: 2026-02-19, 근거: .agents/iterations/iteration-07-p1-high-volume-region-sample-readiness/profile-switch-ux-policy.md)
- [x] [T-162] 구현한다: 데모 프로파일 전환 UI와 상태 연동 (backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/demo-profile-switch-and-list-ux-hardening/implement-main-scenario/task.md) (완료: 2026-02-19, 근거: src/App.tsx)
- [x] [T-163] 검증한다: 대량 리스트 상호작용과 콜백 계약 회귀 (backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/demo-profile-switch-and-list-ux-hardening/validate-regression-and-failure-flow/task.md) (완료: 2026-02-19, 근거: src/components/ComposableSearch.test.tsx)
- [x] [T-164] 준비한다: 데스크톱/모바일 수동 점검 체크리스트 (backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/demo-profile-switch-and-list-ux-hardening/prepare-observability-and-rollout/task.md) (완료: 2026-02-19, 근거: .agents/iterations/iteration-07-p1-high-volume-region-sample-readiness/manual-qa-checklist.md)
- [x] [T-165] 정의한다: 자동 검증 매트릭스와 성능 기준선 정책 (backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/large-sample-regression-testing-and-observability/define-scope-and-acceptance/task.md) (완료: 2026-02-19, 근거: .agents/iterations/iteration-07-p1-high-volume-region-sample-readiness/validation-matrix.md)
- [x] [T-166] 구현한다: 대량 샘플 통합 테스트와 계측 로깅 (backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/large-sample-regression-testing-and-observability/implement-main-scenario/task.md) (완료: 2026-02-19, 근거: src/App.tsx)
- [x] [T-167] 검증한다: CI 안정성과 플래키 억제 전략 (backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/large-sample-regression-testing-and-observability/validate-regression-and-failure-flow/task.md) (완료: 2026-02-19, 근거: .agents/iterations/iteration-07-p1-high-volume-region-sample-readiness/validation-matrix.md)
- [x] [T-168] 준비한다: 관측 지표와 롤백 런북 (backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/large-sample-regression-testing-and-observability/prepare-observability-and-rollout/task.md) (완료: 2026-02-19, 근거: .agents/iterations/iteration-07-p1-high-volume-region-sample-readiness/release-runbook.md)

## 2.1 일자별/담당역할별 착수 큐
| 일자 | 담당 역할 | 당일 우선 착수 Task | 비고 |
| --- | --- | --- | --- |
| 2026-05-11 (월) | 프론트엔드 테크리드, PO | T-157 | 프로파일 규모/규칙 합의 |
| 2026-05-12 (화) | 프론트엔드 엔지니어 | T-158 | 생성 유틸/데모 데이터 경로 구현 |
| 2026-05-13 (수) | QA 엔지니어, 프론트엔드 엔지니어 | T-159, T-161 | 규칙 검증 + UX 기준 확정 |
| 2026-05-14 (목) | 프론트엔드 엔지니어 | T-162 | 전환 UI/상태 연동 구현 |
| 2026-05-15 (금) | QA 엔지니어, 프론트엔드 엔지니어 | T-163, T-160 | 회귀 검증 + 운영 가이드 정리 |
| 2026-05-18 (월) | QA 엔지니어 | T-164, T-165 | 수동 체크리스트 + 자동 매트릭스 확정 |
| 2026-05-19 (화) | 프론트엔드 엔지니어, QA 엔지니어 | T-166 | 대량 통합 테스트/계측 구현 |
| 2026-05-20 (수) | QA 엔지니어 | T-167 | CI 안정성/플래키 검증 |
| 2026-05-21 (목) | 릴리스 엔지니어, QA 엔지니어 | T-168 | 관측/롤백 런북 확정 |

## 2.2 역할별 책임 범위
| 담당 역할 | 책임 Task |
| --- | --- |
| 프론트엔드 테크리드, PO | T-157 |
| 프론트엔드 엔지니어 | T-158, T-162, T-166 |
| QA 엔지니어 | T-159, T-163, T-164, T-165, T-167 |
| 릴리스 엔지니어 | T-168 |
| 프론트엔드 엔지니어, QA 엔지니어(공동) | T-160 |

## 3. 검증
- [x] 기능 검증 시나리오를 실행했다. (완료: 2026-02-19, 근거: .agents/iterations/iteration-07-p1-high-volume-region-sample-readiness/execution-log.md)
- [x] 회귀 테스트를 수행했다. (완료: 2026-02-19, 근거: .agents/iterations/iteration-07-p1-high-volume-region-sample-readiness/execution-log.md)
- [x] 수용 기준(AC/DoD) 충족을 확인했다. (완료: 2026-02-19, 근거: .agents/iterations/iteration-07-p1-high-volume-region-sample-readiness/execution-log.md)

## 4. 배포/운영
- [x] 배포 체크리스트를 점검했다. (완료: 2026-02-19, 근거: .agents/iterations/iteration-07-p1-high-volume-region-sample-readiness/release-runbook.md)
- [x] 모니터링/알람 기준을 확인했다. (완료: 2026-02-19, 근거: .agents/iterations/iteration-07-p1-high-volume-region-sample-readiness/release-runbook.md)
- [x] 롤백 절차를 점검했다. (완료: 2026-02-19, 근거: .agents/iterations/iteration-07-p1-high-volume-region-sample-readiness/release-runbook.md)

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
