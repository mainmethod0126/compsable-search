# 이터레이션 계획서

## 1. 메타
- 이터레이션명: iteration-04-p1-callback-and-consumer-validation
- 기간: 2026-03-30 ~ 2026-04-10
- 작성일: 2026-02-15
- 기준 문서:
- PRD.md
- PRD.en.md
- backlog/public-api-contract-and-extensibility/epic.md
- backlog/public-api-contract-and-extensibility/option-callback-wiring/feature.md
- backlog/public-api-contract-and-extensibility/consumer-integration-example-and-contract-validation/feature.md
- backlog/public-api-contract-and-extensibility/option-callback-wiring/onchange-event-pipeline-wiring/userstory.md
- backlog/public-api-contract-and-extensibility/option-callback-wiring/onselectedeupmyeondong-invocation-guarantee/userstory.md
- backlog/public-api-contract-and-extensibility/option-callback-wiring/onclick-hook-point-standardization/userstory.md
- backlog/public-api-contract-and-extensibility/consumer-integration-example-and-contract-validation/consumer-integration-sample-refresh/userstory.md
- backlog/public-api-contract-and-extensibility/consumer-integration-example-and-contract-validation/contract-based-validation-test-suite/userstory.md
- backlog/public-api-contract-and-extensibility/consumer-integration-example-and-contract-validation/api-usage-guide-synchronization/userstory.md

## 2. 목표
- 비즈니스/사용자 목표:
  - 소비자 애플리케이션이 공개 콜백 API를 안정적으로 수신하고, 통합 예제/가이드/계약 검증으로 적용 실패를 줄인다.
- 기술 목표:
  - F-05를 완료해 onChange/onSelectedEupmyeondong/onClick 실행 경로를 표준화한다.
  - F-06을 완료해 소비자 샘플, 계약 테스트, API 가이드를 코드와 동기화한다.
- 이번 이터레이션 성공 기준:
  - 포함 범위 Task(T-049~T-072)가 체크리스트에서 근거와 함께 완료 처리된다.
  - F-05/F-06 수용 기준의 핵심 항목이 코드/테스트/문서에서 추적 가능하게 충족된다.

## 3. 범위
### 3.1 포함 범위
| 우선순위 | Epic | Feature | UserStory | Task | 근거 문서 |
| --- | --- | --- | --- | --- | --- |
| P1 | [E-02] | [F-05] | [US-013] | [T-049] 정의한다: `onChange` 이벤트 파이프라인 연결 범위와 수용 기준 | backlog/public-api-contract-and-extensibility/option-callback-wiring/onchange-event-pipeline-wiring/define-scope-and-acceptance/task.md |
| P1 | [E-02] | [F-05] | [US-013] | [T-050] 구축한다: `onChange` 이벤트 파이프라인 연결 핵심 시나리오 | backlog/public-api-contract-and-extensibility/option-callback-wiring/onchange-event-pipeline-wiring/implement-main-scenario/task.md |
| P1 | [E-02] | [F-05] | [US-013] | [T-051] 검증한다: `onChange` 이벤트 파이프라인 연결 회귀와 실패 시나리오 | backlog/public-api-contract-and-extensibility/option-callback-wiring/onchange-event-pipeline-wiring/validate-regression-and-failure-flow/task.md |
| P1 | [E-02] | [F-05] | [US-013] | [T-052] 준비한다: `onChange` 이벤트 파이프라인 연결 관측과 릴리스 운영 | backlog/public-api-contract-and-extensibility/option-callback-wiring/onchange-event-pipeline-wiring/prepare-observability-and-rollout/task.md |
| P1 | [E-02] | [F-05] | [US-014] | [T-053] 정의한다: `onSelectedEupmyeondong` 호출 보장 범위와 수용 기준 | backlog/public-api-contract-and-extensibility/option-callback-wiring/onselectedeupmyeondong-invocation-guarantee/define-scope-and-acceptance/task.md |
| P1 | [E-02] | [F-05] | [US-014] | [T-054] 구현한다: `onSelectedEupmyeondong` 호출 보장 핵심 시나리오 | backlog/public-api-contract-and-extensibility/option-callback-wiring/onselectedeupmyeondong-invocation-guarantee/implement-main-scenario/task.md |
| P1 | [E-02] | [F-05] | [US-014] | [T-055] 검증한다: `onSelectedEupmyeondong` 호출 보장 회귀와 실패 시나리오 | backlog/public-api-contract-and-extensibility/option-callback-wiring/onselectedeupmyeondong-invocation-guarantee/validate-regression-and-failure-flow/task.md |
| P1 | [E-02] | [F-05] | [US-014] | [T-056] 준비한다: `onSelectedEupmyeondong` 호출 보장 관측과 릴리스 운영 | backlog/public-api-contract-and-extensibility/option-callback-wiring/onselectedeupmyeondong-invocation-guarantee/prepare-observability-and-rollout/task.md |
| P1 | [E-02] | [F-05] | [US-015] | [T-057] 정의한다: `onClick` 실행 지점 표준화 범위와 수용 기준 | backlog/public-api-contract-and-extensibility/option-callback-wiring/onclick-hook-point-standardization/define-scope-and-acceptance/task.md |
| P1 | [E-02] | [F-05] | [US-015] | [T-058] 구현한다: `onClick` 실행 지점 표준화 핵심 시나리오 | backlog/public-api-contract-and-extensibility/option-callback-wiring/onclick-hook-point-standardization/implement-main-scenario/task.md |
| P1 | [E-02] | [F-05] | [US-015] | [T-059] 검증한다: `onClick` 실행 지점 표준화 회귀와 실패 시나리오 | backlog/public-api-contract-and-extensibility/option-callback-wiring/onclick-hook-point-standardization/validate-regression-and-failure-flow/task.md |
| P1 | [E-02] | [F-05] | [US-015] | [T-060] 준비한다: `onClick` 실행 지점 표준화 관측과 릴리스 운영 | backlog/public-api-contract-and-extensibility/option-callback-wiring/onclick-hook-point-standardization/prepare-observability-and-rollout/task.md |
| P1 | [E-02] | [F-06] | [US-016] | [T-061] 정의한다: 소비자 통합 샘플 갱신 범위와 수용 기준 | backlog/public-api-contract-and-extensibility/consumer-integration-example-and-contract-validation/consumer-integration-sample-refresh/define-scope-and-acceptance/task.md |
| P1 | [E-02] | [F-06] | [US-016] | [T-062] 구현한다: 소비자 통합 샘플 갱신 핵심 시나리오 | backlog/public-api-contract-and-extensibility/consumer-integration-example-and-contract-validation/consumer-integration-sample-refresh/implement-main-scenario/task.md |
| P1 | [E-02] | [F-06] | [US-016] | [T-063] 검증한다: 소비자 통합 샘플 갱신 회귀와 실패 시나리오 | backlog/public-api-contract-and-extensibility/consumer-integration-example-and-contract-validation/consumer-integration-sample-refresh/validate-regression-and-failure-flow/task.md |
| P1 | [E-02] | [F-06] | [US-016] | [T-064] 준비한다: 소비자 통합 샘플 갱신 관측과 릴리스 운영 | backlog/public-api-contract-and-extensibility/consumer-integration-example-and-contract-validation/consumer-integration-sample-refresh/prepare-observability-and-rollout/task.md |
| P1 | [E-02] | [F-06] | [US-017] | [T-065] 정의한다: 계약 기반 검증 테스트 추가 범위와 수용 기준 | backlog/public-api-contract-and-extensibility/consumer-integration-example-and-contract-validation/contract-based-validation-test-suite/define-scope-and-acceptance/task.md |
| P1 | [E-02] | [F-06] | [US-017] | [T-066] 구현한다: 계약 기반 검증 테스트 추가 핵심 시나리오 | backlog/public-api-contract-and-extensibility/consumer-integration-example-and-contract-validation/contract-based-validation-test-suite/implement-main-scenario/task.md |
| P1 | [E-02] | [F-06] | [US-017] | [T-067] 검증한다: 계약 기반 검증 테스트 추가 회귀와 실패 시나리오 | backlog/public-api-contract-and-extensibility/consumer-integration-example-and-contract-validation/contract-based-validation-test-suite/validate-regression-and-failure-flow/task.md |
| P1 | [E-02] | [F-06] | [US-017] | [T-068] 준비한다: 계약 기반 검증 테스트 추가 관측과 릴리스 운영 | backlog/public-api-contract-and-extensibility/consumer-integration-example-and-contract-validation/contract-based-validation-test-suite/prepare-observability-and-rollout/task.md |
| P1 | [E-02] | [F-06] | [US-018] | [T-069] 정의한다: API 사용 가이드 동기화 범위와 수용 기준 | backlog/public-api-contract-and-extensibility/consumer-integration-example-and-contract-validation/api-usage-guide-synchronization/define-scope-and-acceptance/task.md |
| P1 | [E-02] | [F-06] | [US-018] | [T-070] 작성한다: API 사용 가이드 동기화 핵심 시나리오 | backlog/public-api-contract-and-extensibility/consumer-integration-example-and-contract-validation/api-usage-guide-synchronization/implement-main-scenario/task.md |
| P1 | [E-02] | [F-06] | [US-018] | [T-071] 검증한다: API 사용 가이드 동기화 회귀와 실패 시나리오 | backlog/public-api-contract-and-extensibility/consumer-integration-example-and-contract-validation/api-usage-guide-synchronization/validate-regression-and-failure-flow/task.md |
| P1 | [E-02] | [F-06] | [US-018] | [T-072] 준비한다: API 사용 가이드 동기화 관측과 릴리스 운영 | backlog/public-api-contract-and-extensibility/consumer-integration-example-and-contract-validation/api-usage-guide-synchronization/prepare-observability-and-rollout/task.md |

### 3.2 제외 범위
- [E-04/F-10~F-12]: 우선순위 P2로 다음 이터레이션 후보로 유지한다.
- [E-03] 후속 하드닝 범위: API 계약 안정화 완료 후 재평가한다.

## 4. 일정/마일스톤
- M1: 범위 확정 (2026-03-30)
- M2: 구현 완료 (2026-04-04)
- M3: 검증 완료 (2026-04-08)
- M4: 배포/릴리스 판단 (2026-04-10)

### 4.1 일자별/담당역할별 착수 순서
| 일자 | 담당 역할 | 즉시 착수 Task | 선행/완료 조건 |
| --- | --- | --- | --- |
| 2026-03-30 (월) | 프론트엔드 테크리드 | T-049, T-053, T-057, T-061, T-065, T-069 | 각 UserStory 정의 Task 착수 |
| 2026-03-31 (화) | DevOps 엔지니어 | T-050 | T-049 완료 후 착수 |
| 2026-03-31 (화) | 프론트엔드 엔지니어 | T-054, T-058, T-062 | T-053, T-057, T-061 완료 후 착수 |
| 2026-03-31 (화) | 기술 문서 엔지니어 | T-070 | T-069 완료 후 착수 |
| 2026-04-01 (수) | QA 엔지니어 | T-051, T-055, T-059, T-066 | 구현 완료분 기준 검증/테스트 구현 착수 |
| 2026-04-02 (목) | QA 엔지니어 | T-063, T-067, T-071 | F-06 검증 트랙 본격화 |
| 2026-04-03 (금) | 릴리스 엔지니어 | T-052, T-056, T-060 | F-05 검증 완료분 기준 운영 준비 |
| 2026-04-04 (토) | 릴리스 엔지니어 | T-064, T-068, T-072 | F-06 검증 완료분 기준 운영 준비 |
| 2026-04-07 (월) | QA 엔지니어, 릴리스 엔지니어 | 통합 회귀/문서-구현 정합성 점검 | 실패 케이스 재검증 포함 |
| 2026-04-09 (목) | 프론트엔드 테크리드, 릴리스 엔지니어 | 릴리스 게이트 리뷰/오픈 이슈 정리 | iteration-05 입력 조건 확정 |
| 2026-04-10 (금) | FE Lead, QA, 릴리스 | M4 게이트 판정/다음 이터레이션 인계 | 완료 로그/증적 정리 |

### 4.2 병렬 실행 트랙
| 트랙 | 범위 | 담당 역할 중심 | 목표 완료일 |
| --- | --- | --- | --- |
| Track-A | E-02/F-05 (T-049~T-060) | FE Tech Lead + FE 엔지니어 + DevOps + QA + 릴리스 | 2026-04-03 |
| Track-B | E-02/F-06 (T-061~T-072) | FE Tech Lead + FE 엔지니어 + 기술 문서 + QA + 릴리스 | 2026-04-04 |
| Track-C | 통합 검증/릴리스 판단 | QA + 릴리스 + FE Lead | 2026-04-10 |

## 5. 의존성 및 리스크
| 구분 | 내용 | 영향도 | 대응 방안 | 담당 |
| --- | --- | --- | --- | --- |
| 의존성 | F-05는 F-04 완료 산출물에 의존 | High | iteration-03의 타입 계약 변경사항을 착수 전 검토 체크로 고정 | FE Lead |
| 의존성 | F-06는 F-04/F-05에 의존 | High | F-05 검증 완료 후 F-06 통합 검증 게이트 운영 | QA/FE Lead |
| 리스크 | 콜백 오류 처리 정책 불일치로 런타임 회귀 가능 | Medium | T-051/T-055/T-059에 실패 흐름 시나리오 명시 | QA |
| 리스크 | 문서-구현 불일치 재발 가능 | Medium | T-070/T-071에서 코드 샘플 검증을 완료 기준에 포함 | 기술 문서/QA |
| 리스크 | 계약 테스트 범위 부족으로 미탐지 회귀 가능 | Medium | T-066/T-067에 필수/선택 props 케이스 최소 세트 고정 | QA Lead |

## 6. 완료 기준 (Exit Criteria)
- [ ] 커밋 범위의 Task가 모두 체크리스트에서 완료 처리된다.
- [ ] 필수 테스트/검증 결과가 통과한다.
- [ ] 운영 준비(모니터링/롤백/런북)가 준비된다.
- [ ] 미해결 이슈가 릴리스 허용 범위 내로 정리된다.

## 7. 오픈 이슈
- E-04(F-10~F-12) 착수 순서와 최소 범위 확정 (TBD)
- 콜백 payload 버전 호환 정책(0.1.x) 명문화 (TBD)
- 소비자 샘플 CI 실행 환경 표준화 (TBD)
