# 이터레이션 체크리스트

## 메타
- 이터레이션명: iteration-02-p0-flow-and-regression
- 기간: 2026-03-02 ~ 2026-03-13
- 마지막 갱신: 2026-02-19

## 진행률
- 완료율: 2/51 (4%)

## 1. 착수 준비
- [ ] 계획서와 범위가 확정되었다.
- [ ] 선행 의존성/차단 이슈를 확인했다.
- [ ] 담당자와 우선순위를 합의했다.
- [x] FR-011/FR-020 정책 변경(시/군/구 `시/도 전체` 직접 체크, 읍/면/동 중복 제거) 문서 동기화를 완료했다. (완료: 2026-02-18, 근거: `PRD.md`, `PRD.en.md`, `backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/**`)
- [x] FR-023 확장 정책 변경(하위 `전체` 선택 시 상위 item 파란 계열 하이라이팅) 문서 동기화를 완료했다. (완료: 2026-02-19, 근거: `PRD.md`, `PRD.en.md`, `backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/parent-region-descendant-selection-indicator/**`, `.agents/iterations/iteration-02-p0-flow-and-regression/*`)

## 2. 구현
- [ ] [T-013] 정의한다: 1단계 지역 로딩과 전이 처리 범위와 수용 기준 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-loading-and-transition/define-scope-and-acceptance/task.md)
- [ ] [T-014] 구현한다: 1단계 지역 로딩과 전이 처리 핵심 시나리오 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-loading-and-transition/implement-main-scenario/task.md)
- [ ] [T-015] 검증한다: 1단계 지역 로딩과 전이 처리 회귀와 실패 시나리오 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-loading-and-transition/validate-regression-and-failure-flow/task.md)
- [ ] [T-016] 준비한다: 1단계 지역 로딩과 전이 처리 관측과 릴리스 운영 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-loading-and-transition/prepare-observability-and-rollout/task.md)
- [ ] [T-017] 정의한다: 2~3단계 지역 로딩 예외 처리 범위와 수용 기준 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/district-and-town-loading-exception-handling/define-scope-and-acceptance/task.md)
- [ ] [T-018] 구현한다: 2~3단계 지역 로딩 예외 처리 핵심 시나리오 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/district-and-town-loading-exception-handling/implement-main-scenario/task.md)
- [ ] [T-019] 검증한다: 2~3단계 지역 로딩 예외 처리 회귀와 실패 시나리오 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/district-and-town-loading-exception-handling/validate-regression-and-failure-flow/task.md)
- [ ] [T-020] 준비한다: 2~3단계 지역 로딩 예외 처리 관측과 릴리스 운영 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/district-and-town-loading-exception-handling/prepare-observability-and-rollout/task.md)
- [ ] [T-021] 정의한다: 지역 선택 체크 토글 동기화 범위와 수용 기준 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-selection-toggle-synchronization/define-scope-and-acceptance/task.md)
- [ ] [T-022] 구현한다: 지역 선택 체크 토글 동기화 핵심 시나리오 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-selection-toggle-synchronization/implement-main-scenario/task.md)
- [ ] [T-023] 검증한다: 지역 선택 체크 토글 동기화 회귀와 실패 시나리오 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-selection-toggle-synchronization/validate-regression-and-failure-flow/task.md)
- [ ] [T-024] 준비한다: 지역 선택 체크 토글 동기화 관측과 릴리스 운영 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-selection-toggle-synchronization/prepare-observability-and-rollout/task.md)
- [ ] [T-153] 정의한다: 하위 선택 상위 색상 인디케이터 범위와 상태 우선순위 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/parent-region-descendant-selection-indicator/define-scope-and-acceptance/task.md)
- [ ] [T-154] 구현한다: 하위 선택 상위 색상 인디케이터 핵심 시나리오 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/parent-region-descendant-selection-indicator/implement-main-scenario/task.md)
- [ ] [T-155] 검증한다: 하위 선택 상위 색상 인디케이터 회귀와 실패 시나리오 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/parent-region-descendant-selection-indicator/validate-regression-and-failure-flow/task.md)
- [ ] [T-156] 준비한다: 하위 선택 상위 색상 인디케이터 관측과 릴리스 운영 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/parent-region-descendant-selection-indicator/prepare-observability-and-rollout/task.md)
- [ ] [T-025] 정의한다: 선택 조건 칩 렌더링 범위와 수용 기준 (backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-chip-rendering/define-scope-and-acceptance/task.md)
- [ ] [T-026] 구현한다: 선택 조건 칩 렌더링 핵심 시나리오 (backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-chip-rendering/implement-main-scenario/task.md)
- [ ] [T-027] 검증한다: 선택 조건 칩 렌더링 회귀와 실패 시나리오 (backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-chip-rendering/validate-regression-and-failure-flow/task.md)
- [ ] [T-028] 준비한다: 선택 조건 칩 렌더링 관측과 릴리스 운영 (backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-chip-rendering/prepare-observability-and-rollout/task.md)
- [ ] [T-029] 정의한다: 개별/전체 삭제 상호작용 범위와 수용 기준 (backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/single-and-bulk-removal-interaction/define-scope-and-acceptance/task.md)
- [ ] [T-030] 구현한다: 개별/전체 삭제 상호작용 핵심 시나리오 (backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/single-and-bulk-removal-interaction/implement-main-scenario/task.md)
- [ ] [T-031] 검증한다: 개별/전체 삭제 상호작용 회귀와 실패 시나리오 (backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/single-and-bulk-removal-interaction/validate-regression-and-failure-flow/task.md)
- [ ] [T-032] 준비한다: 개별/전체 삭제 상호작용 관측과 릴리스 운영 (backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/single-and-bulk-removal-interaction/prepare-observability-and-rollout/task.md)
- [ ] [T-033] 정의한다: 중복 방지와 빈 상태 처리 범위와 수용 기준 (backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/deduplication-and-empty-state-handling/define-scope-and-acceptance/task.md)
- [ ] [T-034] 구현한다: 중복 방지와 빈 상태 처리 핵심 시나리오 (backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/deduplication-and-empty-state-handling/implement-main-scenario/task.md)
- [ ] [T-035] 검증한다: 중복 방지와 빈 상태 처리 회귀와 실패 시나리오 (backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/deduplication-and-empty-state-handling/validate-regression-and-failure-flow/task.md)
- [ ] [T-036] 준비한다: 중복 방지와 빈 상태 처리 관측과 릴리스 운영 (backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/deduplication-and-empty-state-handling/prepare-observability-and-rollout/task.md)
- [ ] [T-085] 정의한다: 핵심 시나리오 테스트 명세화 범위와 수용 기준 (backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/core-scenario-test-specification/define-scope-and-acceptance/task.md)
- [ ] [T-086] 작성한다: 핵심 시나리오 테스트 명세화 핵심 시나리오 (backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/core-scenario-test-specification/implement-main-scenario/task.md)
- [ ] [T-087] 검증한다: 핵심 시나리오 테스트 명세화 회귀와 실패 시나리오 (backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/core-scenario-test-specification/validate-regression-and-failure-flow/task.md)
- [ ] [T-088] 준비한다: 핵심 시나리오 테스트 명세화 관측과 릴리스 운영 (backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/core-scenario-test-specification/prepare-observability-and-rollout/task.md)
- [ ] [T-089] 정의한다: 자동 회귀 파이프라인 구축 범위와 수용 기준 (backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/automated-regression-pipeline-setup/define-scope-and-acceptance/task.md)
- [ ] [T-090] 구축한다: 자동 회귀 파이프라인 구축 핵심 시나리오 (backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/automated-regression-pipeline-setup/implement-main-scenario/task.md)
- [ ] [T-091] 검증한다: 자동 회귀 파이프라인 구축 회귀와 실패 시나리오 (backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/automated-regression-pipeline-setup/validate-regression-and-failure-flow/task.md)
- [ ] [T-092] 준비한다: 자동 회귀 파이프라인 구축 관측과 릴리스 운영 (backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/automated-regression-pipeline-setup/prepare-observability-and-rollout/task.md)
- [ ] [T-093] 정의한다: 릴리스 게이트 체크리스트 운영화 범위와 수용 기준 (backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/release-gate-checklist-operationalization/define-scope-and-acceptance/task.md)
- [ ] [T-094] 구축한다: 릴리스 게이트 체크리스트 운영화 핵심 시나리오 (backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/release-gate-checklist-operationalization/implement-main-scenario/task.md)
- [ ] [T-095] 검증한다: 릴리스 게이트 체크리스트 운영화 회귀와 실패 시나리오 (backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/release-gate-checklist-operationalization/validate-regression-and-failure-flow/task.md)
- [ ] [T-096] 준비한다: 릴리스 게이트 체크리스트 운영화 관측과 릴리스 운영 (backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/release-gate-checklist-operationalization/prepare-observability-and-rollout/task.md)

## 2.1 일자별/담당역할별 착수 큐
| 일자 | 담당 역할 | 당일 우선 착수 Task | 비고 |
| --- | --- | --- | --- |
| 2026-03-02 (월) | 프론트엔드 테크리드 | T-013, T-017, T-021, T-025, T-029, T-033, T-085, T-089, T-093 | 정의 Task 일괄 완료로 병렬 구현 준비 |
| 2026-03-03 (화) | 프론트엔드 엔지니어 | T-014, T-018, T-022, T-026, T-030, T-034 | 코어 지역 기능 구현 트랙 |
| 2026-03-03 (화) | 기술 문서 엔지니어 | T-086 | 핵심 시나리오 테스트 명세 작성 |
| 2026-03-03 (화) | DevOps 엔지니어 | T-090, T-094 | 자동 회귀/게이트 운영화 구축 |
| 2026-03-04 (수) | 프론트엔드 테크리드 | T-153 | FR-023 하위 `전체` 하이라이팅 범위/우선순위 확정 |
| 2026-03-05 (목) | 프론트엔드 엔지니어 | T-154 | T-153 완료 후 구현 착수 |
| 2026-03-05 (목) | QA 엔지니어 | T-087, T-091, T-095 | 회귀 자동화 검증 선시작 |
| 2026-03-06 (금) | QA 엔지니어 | T-015, T-019, T-023, T-027, T-031, T-035 | 코어 지역 플로우 검증 전개 |
| 2026-03-07 (토) | QA 엔지니어 | T-155 | T-154 완료본 기준 FR-023 확장 케이스 검증 |
| 2026-03-10 (화) | 릴리스 엔지니어 | T-016, T-020, T-024, T-028, T-032, T-036, T-088, T-092, T-096 | 검증 완료분 기준 운영 준비 |
| 2026-03-10 (화) | 릴리스 엔지니어 | T-156 | T-155 완료분 기준 운영/런북 반영 |

## 2.2 역할별 책임 범위
| 담당 역할 | 책임 Task |
| --- | --- |
| 프론트엔드 테크리드 | T-013, T-017, T-021, T-025, T-029, T-033, T-085, T-089, T-093, T-153 |
| 프론트엔드 엔지니어 | T-014, T-018, T-022, T-026, T-030, T-034, T-154 |
| 기술 문서 엔지니어 | T-086 |
| DevOps 엔지니어 | T-090, T-094 |
| QA 엔지니어 | T-015, T-019, T-023, T-027, T-031, T-035, T-087, T-091, T-095, T-155 |
| 릴리스 엔지니어 | T-016, T-020, T-024, T-028, T-032, T-036, T-088, T-092, T-096, T-156 |

## 3. 검증
- [ ] 기능 검증 시나리오를 실행했다.
- [ ] 회귀 테스트를 수행했다.
- [ ] 수용 기준(AC/DoD) 충족을 확인했다.

## 4. 배포/운영
- [ ] 배포 체크리스트를 점검했다.
- [ ] 모니터링/알람 기준을 확인했다.
- [ ] 롤백 절차를 점검했다.

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

