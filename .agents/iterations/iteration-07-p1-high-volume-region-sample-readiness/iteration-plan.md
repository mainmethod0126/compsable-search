# 이터레이션 계획서

## 1. 메타
- 이터레이션명: iteration-07-p1-high-volume-region-sample-readiness
- 기간: 2026-05-11 ~ 2026-05-22
- 작성일: 2026-02-19
- 기준 문서:
- PRD.md
- PRD.en.md
- backlog/high-volume-region-sample-readiness/epic.md
- backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/feature.md
- backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/profile-spec-and-deterministic-generator/userstory.md
- backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/demo-profile-switch-and-list-ux-hardening/userstory.md
- backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/large-sample-regression-testing-and-observability/userstory.md
- backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/profile-spec-and-deterministic-generator/define-scope-and-acceptance/task.md
- backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/profile-spec-and-deterministic-generator/implement-main-scenario/task.md
- backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/profile-spec-and-deterministic-generator/validate-regression-and-failure-flow/task.md
- backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/profile-spec-and-deterministic-generator/prepare-observability-and-rollout/task.md
- backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/demo-profile-switch-and-list-ux-hardening/define-scope-and-acceptance/task.md
- backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/demo-profile-switch-and-list-ux-hardening/implement-main-scenario/task.md
- backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/demo-profile-switch-and-list-ux-hardening/validate-regression-and-failure-flow/task.md
- backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/demo-profile-switch-and-list-ux-hardening/prepare-observability-and-rollout/task.md
- backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/large-sample-regression-testing-and-observability/define-scope-and-acceptance/task.md
- backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/large-sample-regression-testing-and-observability/implement-main-scenario/task.md
- backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/large-sample-regression-testing-and-observability/validate-regression-and-failure-flow/task.md
- backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/large-sample-regression-testing-and-observability/prepare-observability-and-rollout/task.md
- .agents/iterations/completed/iteration-06-p0-region-mutual-exclusion-and-typography/iteration-plan.md
- .agents/iterations/completed/iteration-06-p0-region-mutual-exclusion-and-typography/checklist.md

## 2. 목표
- 비즈니스/사용자 목표:
  - 대량 지역 샘플(`small/medium/large`) 기준으로 UI/UX 결함을 조기에 재현하고 릴리스 전 차단한다.
  - QA/개발이 동일 프로파일 조건에서 반복 검증할 수 있는 운영 가능한 워크플로우를 확립한다.
- 기술 목표:
  - 결정적 샘플 생성 규칙과 `region.code` 유일성 보장을 코드/테스트로 고정한다.
  - 데모 프로파일 전환 UI, 대량 리스트 상호작용 안정성, 콜백 계약 회귀 방지 자동화를 완료한다.
  - 대량 시나리오 CI 안정성, 성능 기준선, 롤백 런북을 포함한 운영 준비를 완료한다.
- 이번 이터레이션 성공 기준:
  - 포함 범위 Task(T-157~T-168)가 체크리스트에서 근거와 함께 완료 처리된다.
  - `small/medium/large` 전환, 대량 리스트 조작, 콜백 계약 검증이 자동/수동 검증에 모두 반영된다.
  - 대량 시나리오의 테스트 안정성과 운영 관측/롤백 절차가 문서화되어 릴리스 판단에 사용 가능하다.

## 3. 범위
### 3.1 포함 범위
| 우선순위 | Epic | Feature | UserStory | Task | 근거 문서 |
| --- | --- | --- | --- | --- | --- |
| P0 | [E-05] | [F-13] | [US-040] | [T-157] 정의한다: 프로파일 규모와 생성 규칙 수용 기준 | backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/profile-spec-and-deterministic-generator/define-scope-and-acceptance/task.md |
| P0 | [E-05] | [F-13] | [US-040] | [T-158] 구현한다: 결정적 샘플 생성 유틸과 DemoService 연동 | backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/profile-spec-and-deterministic-generator/implement-main-scenario/task.md |
| P0 | [E-05] | [F-13] | [US-040] | [T-159] 검증한다: 코드 유일성과 계층 정합성 테스트 | backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/profile-spec-and-deterministic-generator/validate-regression-and-failure-flow/task.md |
| P1 | [E-05] | [F-13] | [US-040] | [T-160] 준비한다: 샘플 생성 규칙 운영 가이드와 변경 체크리스트 | backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/profile-spec-and-deterministic-generator/prepare-observability-and-rollout/task.md |
| P0 | [E-05] | [F-13] | [US-041] | [T-161] 정의한다: 프로파일 전환 UX와 레이아웃 보호 기준 | backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/demo-profile-switch-and-list-ux-hardening/define-scope-and-acceptance/task.md |
| P0 | [E-05] | [F-13] | [US-041] | [T-162] 구현한다: 데모 프로파일 전환 UI와 상태 연동 | backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/demo-profile-switch-and-list-ux-hardening/implement-main-scenario/task.md |
| P0 | [E-05] | [F-13] | [US-041] | [T-163] 검증한다: 대량 리스트 상호작용과 콜백 계약 회귀 | backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/demo-profile-switch-and-list-ux-hardening/validate-regression-and-failure-flow/task.md |
| P1 | [E-05] | [F-13] | [US-041] | [T-164] 준비한다: 데스크톱/모바일 수동 점검 체크리스트 | backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/demo-profile-switch-and-list-ux-hardening/prepare-observability-and-rollout/task.md |
| P1 | [E-05] | [F-13] | [US-042] | [T-165] 정의한다: 자동 검증 매트릭스와 성능 기준선 정책 | backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/large-sample-regression-testing-and-observability/define-scope-and-acceptance/task.md |
| P1 | [E-05] | [F-13] | [US-042] | [T-166] 구현한다: 대량 샘플 통합 테스트와 계측 로깅 | backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/large-sample-regression-testing-and-observability/implement-main-scenario/task.md |
| P1 | [E-05] | [F-13] | [US-042] | [T-167] 검증한다: CI 안정성과 플래키 억제 전략 | backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/large-sample-regression-testing-and-observability/validate-regression-and-failure-flow/task.md |
| P1 | [E-05] | [F-13] | [US-042] | [T-168] 준비한다: 관측 지표와 롤백 런북 | backlog/high-volume-region-sample-readiness/deterministic-region-sample-profiles-and-validation/large-sample-regression-testing-and-observability/prepare-observability-and-rollout/task.md |

### 3.2 제외 범위
- 실데이터 행정구역 정합성 100% 보장 작업은 제외한다.
- virtualization 프레임워크 도입은 별도 후속 이슈로 분리한다.
- API 서버/DB 연동으로 데이터 소스를 전환하는 작업은 제외한다.
- E-01~E-04의 신규 범위 확장은 본 이터레이션에서 제외한다.

## 4. 일정/마일스톤
- M1: 범위 확정 (2026-05-11)
- M2: 구현 완료 (2026-05-15)
- M3: 검증 완료 (2026-05-20)
- M4: 배포/릴리스 판단 (2026-05-22)

### 4.1 일자별/담당역할별 착수 순서
| 일자 | 담당 역할 | 즉시 착수 Task | 선행/완료 조건 |
| --- | --- | --- | --- |
| 2026-05-11 (월) | 프론트엔드 테크리드, PO | T-157 | 프로파일 수량/규칙/TBD 확정 |
| 2026-05-12 (화) | 프론트엔드 엔지니어 | T-158 | T-157 완료 후 생성 유틸 + DemoService 연동 |
| 2026-05-13 (수) | QA 엔지니어, 프론트엔드 엔지니어 | T-159, T-161 | T-158 완료 후 테스트/UX 기준 병렬 확정 |
| 2026-05-14 (목) | 프론트엔드 엔지니어 | T-162 | T-161 완료 후 전환 UI/상태 연동 구현 |
| 2026-05-15 (금) | QA 엔지니어, 프론트엔드 엔지니어 | T-163, T-160 | T-162/T-159 완료 후 회귀 검증 + 운영 가이드 정리 |
| 2026-05-18 (월) | QA 엔지니어 | T-164, T-165 | T-163 완료 후 수동 체크리스트/검증 매트릭스 확정 |
| 2026-05-19 (화) | 프론트엔드 엔지니어, QA 엔지니어 | T-166 | T-165 완료 후 대량 테스트/계측 구현 |
| 2026-05-20 (수) | QA 엔지니어 | T-167 | T-166 완료 후 CI 안정성/플래키 억제 검증 |
| 2026-05-21 (목) | 릴리스 엔지니어, QA 엔지니어 | T-168 | T-167 완료 후 관측/롤백 런북 확정 |
| 2026-05-22 (금) | FE Lead, QA, 릴리스 | 릴리스 게이트 리뷰 | 완료 로그/오픈 이슈/다음 입력 정리 |

### 4.2 병렬 실행 트랙
| 트랙 | 범위 | 담당 역할 중심 | 목표 완료일 |
| --- | --- | --- | --- |
| Track-A | US-040 (T-157~T-160) | FE Tech Lead + FE 엔지니어 + QA | 2026-05-15 |
| Track-B | US-041 (T-161~T-164) | FE 엔지니어 + QA | 2026-05-18 |
| Track-C | US-042 (T-165~T-168) | QA + FE 엔지니어 + 릴리스 | 2026-05-22 |

## 5. 의존성 및 리스크
| 구분 | 내용 | 영향도 | 대응 방안 | 담당 |
| --- | --- | --- | --- | --- |
| 의존성 | T-158은 T-157의 프로파일/코드 규칙 확정에 의존 | High | T-157 산출물을 구현 게이트로 설정하고 미확정 항목은 `TBD`로 분리 | FE Lead |
| 의존성 | T-162는 T-161의 UX/레이아웃 보호 기준 확정에 의존 | High | 뷰포트별 실패 기준을 체크리스트에 고정 후 구현 착수 | FE 엔지니어 |
| 의존성 | T-166은 T-165의 테스트 매트릭스/성능 기준선 정책 확정에 의존 | Medium | 측정 시점/판정 기준을 문서로 먼저 합의 | QA |
| 리스크 | `large` 항목 수 증가로 테스트 시간 증가 및 flaky 발생 가능성 | High | T-167에서 대량 시나리오 분리 실행 전략 및 반복 검증 기준 확정 | QA |
| 리스크 | 프로파일 전환 시 선택 상태 초기화/유지 정책 불일치 회귀 가능성 | Medium | T-163에서 전환 직후 상태 검증 케이스를 필수 회귀에 포함 | FE 엔지니어 |
| 리스크 | 관측/롤백 문서 미정비 시 장애 대응 지연 가능성 | Medium | T-168을 릴리스 게이트 통과의 필수 조건으로 설정 | 릴리스 엔지니어 |

## 6. 완료 기준 (Exit Criteria)
- [ ] 커밋 범위의 Task(T-157~T-168)가 체크리스트에서 근거와 함께 완료 처리된다.
- [ ] 프로파일 전환/대량 리스트 조작/콜백 계약 시나리오 테스트가 통과한다.
- [ ] 대량 시나리오 CI 안정성 검증 결과와 성능 기준선 기록이 확보된다.
- [ ] 운영 준비(모니터링/롤백/런북)가 준비되고 릴리스 게이트에서 승인된다.

## 7. 오픈 이슈
- `large` 프로파일 최종 목표 항목 수(1천/5천/1만) 확정 필요 (TBD)
- 성능 기준선의 절대값(ms) vs 상대 개선율(%) 방식 확정 필요 (TBD)
- virtualization 도입 여부와 분리 시점(후속 이터레이션) 확정 필요 (TBD)
