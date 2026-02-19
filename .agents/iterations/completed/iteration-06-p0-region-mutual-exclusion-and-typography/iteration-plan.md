# 이터레이션 계획서

## 1. 메타
- 이터레이션명: iteration-06-p0-region-mutual-exclusion-and-typography
- 기간: 2026-04-27 ~ 2026-05-08
- 작성일: 2026-02-19
- 기준 문서:
- PRD.md
- PRD.en.md
- backlog/core-region-selection-mvp/epic.md
- backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/feature.md
- backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-whole-and-district-mutual-exclusion/userstory.md
- backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-item-typography-consistency/userstory.md
- backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-whole-and-district-mutual-exclusion/define-scope-and-acceptance/task.md
- backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-whole-and-district-mutual-exclusion/implement-main-scenario/task.md
- backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-whole-and-district-mutual-exclusion/validate-regression-and-failure-flow/task.md
- backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-whole-and-district-mutual-exclusion/prepare-observability-and-rollout/task.md
- backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-item-typography-consistency/define-scope-and-acceptance/task.md
- backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-item-typography-consistency/implement-main-scenario/task.md
- backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-item-typography-consistency/validate-regression-and-failure-flow/task.md
- backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-item-typography-consistency/prepare-observability-and-rollout/task.md
- .agents/iterations/iteration-05-p2-keyword-model-evolution/iteration-plan.md
- .agents/iterations/iteration-05-p2-keyword-model-evolution/checklist.md

## 2. 목표
- 비즈니스/사용자 목표:
  - 동일 시/도 범위에서 `전체`와 개별 시/군/구 조건이 동시에 남는 모순 상태를 제거해 검색 결과 신뢰도를 높인다.
  - 체크박스 기반 지역 텍스트와 일반 지역 item 텍스트의 시각 이질감을 해소해 선택 맥락 인지성을 높인다.
- 기술 목표:
  - FR-019/AC-019, FR-021/AC-021을 충족하도록 상호 배타 및 자동 선택 금지 상태 전이를 확정/구현/검증한다.
  - FR-022/AC-022를 충족하도록 공통 타이포그래피 기준을 적용하고 상태 스타일 분리 원칙을 고정한다.
- 이번 이터레이션 성공 기준:
  - 포함 범위 Task(T-145~T-152)가 체크리스트에서 근거와 함께 완료 처리된다.
  - AC-019, AC-021, AC-022 핵심 시나리오가 테스트/검증 기록으로 추적 가능하게 충족된다.

## 3. 범위
### 3.1 포함 범위
| 우선순위 | Epic | Feature | UserStory | Task | 근거 문서 |
| --- | --- | --- | --- | --- | --- |
| P0 | [E-01] | [F-02] | [US-037] | [T-145] 정의한다: 시/도 전체-하위 시/군/구 상호 배타 범위와 수용 기준 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-whole-and-district-mutual-exclusion/define-scope-and-acceptance/task.md |
| P0 | [E-01] | [F-02] | [US-037] | [T-146] 구현한다: 시/도 전체-하위 시/군/구 상호 배타 핵심 시나리오 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-whole-and-district-mutual-exclusion/implement-main-scenario/task.md |
| P0 | [E-01] | [F-02] | [US-037] | [T-147] 검증한다: 시/도 전체-하위 시/군/구 상호 배타 회귀와 실패 시나리오 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-whole-and-district-mutual-exclusion/validate-regression-and-failure-flow/task.md |
| P0 | [E-01] | [F-02] | [US-037] | [T-148] 준비한다: 시/도 전체-하위 시/군/구 상호 배타 관측과 릴리스 운영 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-whole-and-district-mutual-exclusion/prepare-observability-and-rollout/task.md |
| P1 | [E-01] | [F-02] | [US-038] | [T-149] 정의한다: 지역 항목 타이포그래피 일관성 범위와 수용 기준 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-item-typography-consistency/define-scope-and-acceptance/task.md |
| P1 | [E-01] | [F-02] | [US-038] | [T-150] 구현한다: 지역 항목 타이포그래피 일관성 핵심 시나리오 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-item-typography-consistency/implement-main-scenario/task.md |
| P1 | [E-01] | [F-02] | [US-038] | [T-151] 검증한다: 지역 항목 타이포그래피 일관성 회귀와 실패 시나리오 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-item-typography-consistency/validate-regression-and-failure-flow/task.md |
| P1 | [E-01] | [F-02] | [US-038] | [T-152] 준비한다: 지역 항목 타이포그래피 일관성 관측과 릴리스 운영 | backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-item-typography-consistency/prepare-observability-and-rollout/task.md |

### 3.2 제외 범위
- [US-039]/[T-153~T-156] 범위는 이전 이터레이션에서 완료된 상태로 보고, 본 이터레이션에서는 회귀 영향 확인만 수행한다.
- E-02/E-03/E-04의 신규 개선 작업은 본 이터레이션 범위에서 제외한다.
- 키워드 입력 고도화, 성능 최적화(대량 토큰), 신규 API 확장은 제외한다.

## 4. 일정/마일스톤
- M1: 범위 확정 (2026-04-27)
- M2: 구현 완료 (2026-05-01)
- M3: 검증 완료 (2026-05-06)
- M4: 배포/릴리스 판단 (2026-05-08)

### 4.1 일자별/담당역할별 착수 순서
| 일자 | 담당 역할 | 즉시 착수 Task | 선행/완료 조건 |
| --- | --- | --- | --- |
| 2026-04-27 (월) | 프론트엔드 테크리드 | T-145, T-149 | 정의 Task 착수 및 범위/판정 기준 확정 |
| 2026-04-28 (화) | 프론트엔드 엔지니어 | T-146 | T-145 완료 후 상호 배타/자동 선택 금지 로직 구현 |
| 2026-04-29 (수) | 프론트엔드 엔지니어 | T-150 | T-149 완료 후 공통 타이포그래피 규칙 구현 |
| 2026-04-30 (목) | QA 엔지니어 | T-147 | T-146 완료 후 AC-019/AC-021 회귀 검증 착수 |
| 2026-05-01 (금) | QA 엔지니어 | T-151 | T-150 완료 후 AC-022 검증 착수 |
| 2026-05-04 (월) | 릴리스 엔지니어 | T-148 | T-147 완료 후 상호 배타 운영 체크리스트/런북 반영 |
| 2026-05-05 (화) | 릴리스 엔지니어 | T-152 | T-151 완료 후 타이포그래피 운영 체크리스트/런북 반영 |
| 2026-05-06 (수) | QA 엔지니어, 릴리스 엔지니어 | 통합 회귀/스모크 점검 | 두 트랙 운영 준비/검증 증적 정리 |
| 2026-05-07 (목) | 프론트엔드 테크리드, 릴리스 엔지니어 | 릴리스 게이트 리뷰 | 오픈 이슈/잔여 리스크 정리 |
| 2026-05-08 (금) | FE Lead, QA, 릴리스 | M4 게이트 판정/인계 | 완료 로그 및 다음 이터레이션 입력 정리 |

### 4.2 병렬 실행 트랙
| 트랙 | 범위 | 담당 역할 중심 | 목표 완료일 |
| --- | --- | --- | --- |
| Track-A | US-037 (T-145~T-148) | FE Tech Lead + FE 엔지니어 + QA + 릴리스 | 2026-05-04 |
| Track-B | US-038 (T-149~T-152) | FE Tech Lead + FE 엔지니어 + QA + 릴리스 | 2026-05-05 |
| Track-C | 통합 회귀/릴리스 판단 | QA + 릴리스 + FE Lead | 2026-05-08 |

## 5. 의존성 및 리스크
| 구분 | 내용 | 영향도 | 대응 방안 | 담당 |
| --- | --- | --- | --- | --- |
| 의존성 | T-146은 T-145의 충돌 매트릭스/판정 기준 확정에 의존 | High | T-145 산출물을 구현 체크리스트의 게이트 조건으로 고정 | FE Lead |
| 의존성 | T-150은 T-149의 타이포그래피 기준 합의에 의존 | Medium | 공통 스타일 기준을 코드 리뷰 체크리스트에 명시 | FE Lead |
| 리스크 | 상호 배타 로직 변경으로 칩 상태/체크 상태 불일치 회귀 가능성 | High | T-147에서 순/역순 선택 + 교차 시/도 반례를 자동화 테스트로 고정 | QA |
| 리스크 | 타이포그래피 정비가 `current/selected/hover` 상태 표현을 약화시킬 가능성 | Medium | T-151에서 상태별 시각 속성 분리 검증을 필수화 | QA |
| 리스크 | 운영 문서 미반영 시 릴리스 후 이상 징후 탐지 지연 가능성 | Medium | T-148/T-152에서 스모크/롤백 항목 업데이트를 릴리스 게이트 조건으로 설정 | 릴리스 |

## 6. 완료 기준 (Exit Criteria)
- [x] 커밋 범위의 Task(T-145~T-152)가 체크리스트에서 근거와 함께 완료 처리된다. (근거: `checklist.md` 완료율 17/17)
- [x] AC-019/AC-021/AC-022 시나리오를 포함한 테스트/검증 결과가 통과한다. (근거: `execution-log.md` 검증 섹션)
- [x] `npm test`, `npm run lint`, `npm run build`가 릴리스 후보 기준에서 통과한다. (근거: `execution-log.md` 실행 명령/결과)
- [x] 운영 준비(스모크 체크리스트/관측/롤백/런북)가 업데이트되고 승인된다. (근거: `release-runbook.md`)

## 7. 오픈 이슈
- 타이포그래피 정합성 검증의 브라우저 범위(Chromium 외 브라우저 포함 여부) 확정 필요 (TBD)
- AC-019/AC-021 자동화 테스트의 CI 게이트 강제 수준(필수/권고) 확정 필요 (TBD)
- 본 이터레이션 완료 후 버전 태깅(`0.1.x` vs `0.2.0`) 정책 확정 필요 (TBD)
