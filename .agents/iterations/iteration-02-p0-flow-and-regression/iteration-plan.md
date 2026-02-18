# 이터레이션 계획서

## 1. 메타
- 이터레이션명: iteration-02-p0-flow-and-regression
- 기간: 2026-03-02 ~ 2026-03-13
- 작성일: 2026-02-15
- 기준 문서:
- PRD.md
- PRD.en.md
- backlog/core-region-selection-mvp/epic.md
- backlog/library-quality-hardening-and-release-readiness/epic.md
- backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/feature.md
- backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/feature.md
- backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/feature.md
- backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-loading-and-transition/userstory.md
- backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/district-and-town-loading-exception-handling/userstory.md
- backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-selection-toggle-synchronization/userstory.md
- backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-chip-rendering/userstory.md
- backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/single-and-bulk-removal-interaction/userstory.md
- backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/deduplication-and-empty-state-handling/userstory.md
- backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/core-scenario-test-specification/userstory.md
- backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/automated-regression-pipeline-setup/userstory.md
- backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/release-gate-checklist-operationalization/userstory.md

## 2. 목표
- 비즈니스/사용자 목표:
  - 지역 선택 핵심 플로우를 완결(F-02, F-03)하고 회귀 자동화 체계(F-08)를 구축해 0.1.0-alpha 게이트의 실행 가능성을 높인다.
- 기술 목표:
  - E-01의 남은 P0 범위(F-02, F-03)를 완료해 코어 지역 선택 MVP를 기능적으로 닫는다.
  - FR-020(시/군/구 컬럼 `시/도 전체` 직접 체크) 반영으로 FR-011 UX 중복 단계를 제거하고 상태 전이 단순성을 확보한다.
  - E-03/F-08을 완료해 PRD 핵심 시나리오와 QA 시나리오의 회귀 검증 표준 경로를 확보한다.
- 이번 이터레이션 성공 기준:
  - 포함 범위 Task(T-013~T-036, T-085~T-096)가 체크리스트에서 근거와 함께 완료 처리된다.
  - AC-020(시/군/구 `서울특별시 전체` 직접 체크 + 읍/면/동 중복 미노출)이 검증 시나리오에 반영된다.
  - F-02, F-03, F-08 수용 기준의 핵심 항목이 코드/테스트/운영 문서로 추적 가능하게 충족된다.

## 3. 범위
### 3.1 포함 범위
| 우선순위 | Epic | Feature | UserStory | Task | 근거 문서 |
| --- | --- | --- | --- | --- | --- |
| P0 | [E-01] | [F-02] | [US-004] | [T-013] 정의한다: 1단계 지역 로딩과 전이 처리 범위와 수용 기준 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-loading-and-transition/define-scope-and-acceptance/task.md |
| P0 | [E-01] | [F-02] | [US-004] | [T-014] 구현한다: 1단계 지역 로딩과 전이 처리 핵심 시나리오 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-loading-and-transition/implement-main-scenario/task.md |
| P0 | [E-01] | [F-02] | [US-004] | [T-015] 검증한다: 1단계 지역 로딩과 전이 처리 회귀와 실패 시나리오 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-loading-and-transition/validate-regression-and-failure-flow/task.md |
| P0 | [E-01] | [F-02] | [US-004] | [T-016] 준비한다: 1단계 지역 로딩과 전이 처리 관측과 릴리스 운영 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-loading-and-transition/prepare-observability-and-rollout/task.md |
| P0 | [E-01] | [F-02] | [US-005] | [T-017] 정의한다: 2~3단계 지역 로딩 예외 처리 범위와 수용 기준 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/district-and-town-loading-exception-handling/define-scope-and-acceptance/task.md |
| P0 | [E-01] | [F-02] | [US-005] | [T-018] 구현한다: 2~3단계 지역 로딩 예외 처리 핵심 시나리오 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/district-and-town-loading-exception-handling/implement-main-scenario/task.md |
| P0 | [E-01] | [F-02] | [US-005] | [T-019] 검증한다: 2~3단계 지역 로딩 예외 처리 회귀와 실패 시나리오 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/district-and-town-loading-exception-handling/validate-regression-and-failure-flow/task.md |
| P0 | [E-01] | [F-02] | [US-005] | [T-020] 준비한다: 2~3단계 지역 로딩 예외 처리 관측과 릴리스 운영 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/district-and-town-loading-exception-handling/prepare-observability-and-rollout/task.md |
| P0 | [E-01] | [F-02] | [US-006] | [T-021] 정의한다: 지역 선택 체크 토글 동기화 범위와 수용 기준 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-selection-toggle-synchronization/define-scope-and-acceptance/task.md |
| P0 | [E-01] | [F-02] | [US-006] | [T-022] 구현한다: 지역 선택 체크 토글 동기화 핵심 시나리오 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-selection-toggle-synchronization/implement-main-scenario/task.md |
| P0 | [E-01] | [F-02] | [US-006] | [T-023] 검증한다: 지역 선택 체크 토글 동기화 회귀와 실패 시나리오 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-selection-toggle-synchronization/validate-regression-and-failure-flow/task.md |
| P0 | [E-01] | [F-02] | [US-006] | [T-024] 준비한다: 지역 선택 체크 토글 동기화 관측과 릴리스 운영 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-selection-toggle-synchronization/prepare-observability-and-rollout/task.md |
| P0 | [E-01] | [F-03] | [US-007] | [T-025] 정의한다: 선택 조건 칩 렌더링 범위와 수용 기준 | backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-chip-rendering/define-scope-and-acceptance/task.md |
| P0 | [E-01] | [F-03] | [US-007] | [T-026] 구현한다: 선택 조건 칩 렌더링 핵심 시나리오 | backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-chip-rendering/implement-main-scenario/task.md |
| P0 | [E-01] | [F-03] | [US-007] | [T-027] 검증한다: 선택 조건 칩 렌더링 회귀와 실패 시나리오 | backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-chip-rendering/validate-regression-and-failure-flow/task.md |
| P0 | [E-01] | [F-03] | [US-007] | [T-028] 준비한다: 선택 조건 칩 렌더링 관측과 릴리스 운영 | backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-chip-rendering/prepare-observability-and-rollout/task.md |
| P0 | [E-01] | [F-03] | [US-008] | [T-029] 정의한다: 개별/전체 삭제 상호작용 범위와 수용 기준 | backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/single-and-bulk-removal-interaction/define-scope-and-acceptance/task.md |
| P0 | [E-01] | [F-03] | [US-008] | [T-030] 구현한다: 개별/전체 삭제 상호작용 핵심 시나리오 | backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/single-and-bulk-removal-interaction/implement-main-scenario/task.md |
| P0 | [E-01] | [F-03] | [US-008] | [T-031] 검증한다: 개별/전체 삭제 상호작용 회귀와 실패 시나리오 | backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/single-and-bulk-removal-interaction/validate-regression-and-failure-flow/task.md |
| P0 | [E-01] | [F-03] | [US-008] | [T-032] 준비한다: 개별/전체 삭제 상호작용 관측과 릴리스 운영 | backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/single-and-bulk-removal-interaction/prepare-observability-and-rollout/task.md |
| P0 | [E-01] | [F-03] | [US-009] | [T-033] 정의한다: 중복 방지와 빈 상태 처리 범위와 수용 기준 | backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/deduplication-and-empty-state-handling/define-scope-and-acceptance/task.md |
| P0 | [E-01] | [F-03] | [US-009] | [T-034] 구현한다: 중복 방지와 빈 상태 처리 핵심 시나리오 | backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/deduplication-and-empty-state-handling/implement-main-scenario/task.md |
| P0 | [E-01] | [F-03] | [US-009] | [T-035] 검증한다: 중복 방지와 빈 상태 처리 회귀와 실패 시나리오 | backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/deduplication-and-empty-state-handling/validate-regression-and-failure-flow/task.md |
| P0 | [E-01] | [F-03] | [US-009] | [T-036] 준비한다: 중복 방지와 빈 상태 처리 관측과 릴리스 운영 | backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/deduplication-and-empty-state-handling/prepare-observability-and-rollout/task.md |
| P0 | [E-03] | [F-08] | [US-022] | [T-085] 정의한다: 핵심 시나리오 테스트 명세화 범위와 수용 기준 | backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/core-scenario-test-specification/define-scope-and-acceptance/task.md |
| P0 | [E-03] | [F-08] | [US-022] | [T-086] 작성한다: 핵심 시나리오 테스트 명세화 핵심 시나리오 | backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/core-scenario-test-specification/implement-main-scenario/task.md |
| P0 | [E-03] | [F-08] | [US-022] | [T-087] 검증한다: 핵심 시나리오 테스트 명세화 회귀와 실패 시나리오 | backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/core-scenario-test-specification/validate-regression-and-failure-flow/task.md |
| P0 | [E-03] | [F-08] | [US-022] | [T-088] 준비한다: 핵심 시나리오 테스트 명세화 관측과 릴리스 운영 | backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/core-scenario-test-specification/prepare-observability-and-rollout/task.md |
| P0 | [E-03] | [F-08] | [US-023] | [T-089] 정의한다: 자동 회귀 파이프라인 구축 범위와 수용 기준 | backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/automated-regression-pipeline-setup/define-scope-and-acceptance/task.md |
| P0 | [E-03] | [F-08] | [US-023] | [T-090] 구축한다: 자동 회귀 파이프라인 구축 핵심 시나리오 | backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/automated-regression-pipeline-setup/implement-main-scenario/task.md |
| P0 | [E-03] | [F-08] | [US-023] | [T-091] 검증한다: 자동 회귀 파이프라인 구축 회귀와 실패 시나리오 | backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/automated-regression-pipeline-setup/validate-regression-and-failure-flow/task.md |
| P0 | [E-03] | [F-08] | [US-023] | [T-092] 준비한다: 자동 회귀 파이프라인 구축 관측과 릴리스 운영 | backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/automated-regression-pipeline-setup/prepare-observability-and-rollout/task.md |
| P0 | [E-03] | [F-08] | [US-024] | [T-093] 정의한다: 릴리스 게이트 체크리스트 운영화 범위와 수용 기준 | backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/release-gate-checklist-operationalization/define-scope-and-acceptance/task.md |
| P0 | [E-03] | [F-08] | [US-024] | [T-094] 구축한다: 릴리스 게이트 체크리스트 운영화 핵심 시나리오 | backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/release-gate-checklist-operationalization/implement-main-scenario/task.md |
| P0 | [E-03] | [F-08] | [US-024] | [T-095] 검증한다: 릴리스 게이트 체크리스트 운영화 회귀와 실패 시나리오 | backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/release-gate-checklist-operationalization/validate-regression-and-failure-flow/task.md |
| P0 | [E-03] | [F-08] | [US-024] | [T-096] 준비한다: 릴리스 게이트 체크리스트 운영화 관측과 릴리스 운영 | backlog/library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/release-gate-checklist-operationalization/prepare-observability-and-rollout/task.md |

### 3.2 제외 범위
- [E-03/F-09]: F-08 완료 후 후속 실행(스타일 충돌 완화/운영 고도화)으로 이월.
- [E-02/F-04~F-06]: 우선순위 P1이며 E-01 완료 결과를 반영해야 하므로 이월.
- [E-04/F-10~F-12]: 우선순위 P2로 0.2.0 후보 범위 유지.

## 4. 일정/마일스톤
- M1: 범위 확정 (2026-03-02)
- M2: 구현 완료 (2026-03-07)
- M3: 검증 완료 (2026-03-11)
- M4: 배포/릴리스 판단 (2026-03-13)

### 4.1 일자별/담당역할별 착수 순서
| 일자 | 담당 역할 | 즉시 착수 Task | 선행/완료 조건 |
| --- | --- | --- | --- |
| 2026-03-02 (월) | 프론트엔드 테크리드 | T-013, T-017, T-021, T-025, T-029, T-033, T-085, T-089, T-093 | 각 UserStory 정의 Task 착수 |
| 2026-03-03 (화) | 프론트엔드 엔지니어 | T-014, T-018, T-022, T-026, T-030, T-034 | 선행 정의 Task 완료분부터 순차 착수 |
| 2026-03-03 (화) | 기술 문서 엔지니어 | T-086 | T-085 완료 후 착수 |
| 2026-03-03 (화) | DevOps 엔지니어 | T-090, T-094 | T-089, T-093 완료 후 착수 |
| 2026-03-04 (수) | 프론트엔드 엔지니어, DevOps 엔지니어 | 구현 Task 지속 (T-014/018/022/026/030/034/090/094) | 구현 집중일 |
| 2026-03-05 (목) | QA 엔지니어 | T-087, T-091, T-095 착수 | T-086, T-090, T-094 완료 필요 |
| 2026-03-06 (금) | QA 엔지니어 | T-015, T-019, T-023, T-027, T-031, T-035 착수 | T-014, T-018, T-022, T-026, T-030, T-034 완료 필요 |
| 2026-03-09 (월) | QA 엔지니어 | 검증 Task 전체 마무리 | 실패 케이스 재현/재검증 포함 |
| 2026-03-10 (화) | 릴리스 엔지니어 | T-016, T-020, T-024, T-028, T-032, T-036, T-088, T-092, T-096 | 각 검증 Task 완료분 기준 착수 |
| 2026-03-11 (수) | QA 엔지니어, 릴리스 엔지니어 | 통합 회귀/수용 기준 증적 정리 | PRD AC/QA-001~QA-006 기준 |
| 2026-03-12 (목) | 프론트엔드 테크리드, 릴리스 엔지니어 | 릴리스 게이트 리뷰/잔여 리스크 정리 | M4 전 최종 판단 자료 확정 |
| 2026-03-13 (금) | FE Lead, QA, DevOps, 릴리스 | M4 게이트 판정/iteration-03 인계 | 체크리스트 완료 로그와 오픈 이슈 확정 |

### 4.2 병렬 실행 트랙
| 트랙 | 범위 | 담당 역할 중심 | 목표 완료일 |
| --- | --- | --- | --- |
| Track-A | E-01/F-02 (T-013~T-024) | FE Tech Lead + FE 엔지니어 + QA + 릴리스 | 2026-03-10 |
| Track-B | E-01/F-03 (T-025~T-036) | FE Tech Lead + FE 엔지니어 + QA + 릴리스 | 2026-03-10 |
| Track-C | E-03/F-08 (T-085~T-096) | FE Tech Lead + 기술 문서 + DevOps + QA + 릴리스 | 2026-03-10 |
| Track-D | 통합 검증/릴리스 판단 | QA + 릴리스 + FE Lead | 2026-03-13 |

## 5. 의존성 및 리스크
| 구분 | 내용 | 영향도 | 대응 방안 | 담당 |
| --- | --- | --- | --- | --- |
| 의존성 | F-02는 F-01 산출물 확정이 선행 | High | iteration-01 산출물 리뷰 완료를 M1 조건으로 고정 | FE Lead |
| 의존성 | F-03는 F-02 완료가 선행 | High | Track-A 완료 게이트 후 Track-B 검증 본격화 | FE Lead |
| 의존성 | F-08은 F-07 완료가 선행 | High | iteration-01의 빌드/린트 증적을 기준선으로 승계 | DevOps/QA |
| 리스크 | FR-011/FR-020 UX 전환 반영 시 테스트 케이스 누락 가능성 | Medium | T-023/QA 시나리오에 `시/군/구 전체 직접 체크`와 `읍/면/동 중복 미노출` 케이스를 필수 포함 | PM/FE/QA |
| 리스크 | 테스트 자동화 파이프라인 환경 편차(CI/로컬) | Medium | 실패 로그 포맷 표준화와 재현 스크립트 동시 관리 | DevOps |
| 리스크 | 36개 Task 범위로 인한 검증 병목 | Medium | QA 착수 시점을 2회 분할(3/5, 3/6)하고 재검증 버퍼 확보 | QA Lead |

## 6. 완료 기준 (Exit Criteria)
- [ ] 커밋 범위의 Task가 모두 체크리스트에서 완료 처리된다.
- [ ] 필수 테스트/검증 결과가 통과한다.
- [ ] 운영 준비(모니터링/롤백/런북)가 준비된다.
- [ ] 미해결 이슈가 릴리스 허용 범위 내로 정리된다.

## 7. 오픈 이슈
- FR-020 반영 후 `시/도 전체` 칩 라벨 포맷(2단 vs 3단 경로) 확정 (TBD)
- 회귀 자동화 파이프라인의 비밀값/실행 권한 정책 (TBD)
- iteration-03에서 F-09와 E-02 중 우선 착수 축 결정 (TBD)

