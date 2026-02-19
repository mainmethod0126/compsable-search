# 이터레이션 체크리스트

## 메타
- 이터레이션명: iteration-06-p0-region-mutual-exclusion-and-typography
- 기간: 2026-04-27 ~ 2026-05-08
- 마지막 갱신: 2026-02-19

## 진행률
- 완료율: 0/17 (0%)

## 1. 착수 준비
- [ ] 계획서와 범위가 확정되었다.
- [ ] 선행 의존성/차단 이슈를 확인했다.
- [ ] 담당자와 우선순위를 합의했다.

## 2. 구현
- [ ] [T-145] 정의한다: 시/도 전체-하위 시/군/구 상호 배타 범위와 수용 기준 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-whole-and-district-mutual-exclusion/define-scope-and-acceptance/task.md)
- [ ] [T-146] 구현한다: 시/도 전체-하위 시/군/구 상호 배타 핵심 시나리오 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-whole-and-district-mutual-exclusion/implement-main-scenario/task.md)
- [ ] [T-147] 검증한다: 시/도 전체-하위 시/군/구 상호 배타 회귀와 실패 시나리오 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-whole-and-district-mutual-exclusion/validate-regression-and-failure-flow/task.md)
- [ ] [T-148] 준비한다: 시/도 전체-하위 시/군/구 상호 배타 관측과 릴리스 운영 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/province-whole-and-district-mutual-exclusion/prepare-observability-and-rollout/task.md)
- [ ] [T-149] 정의한다: 지역 항목 타이포그래피 일관성 범위와 수용 기준 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-item-typography-consistency/define-scope-and-acceptance/task.md)
- [ ] [T-150] 구현한다: 지역 항목 타이포그래피 일관성 핵심 시나리오 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-item-typography-consistency/implement-main-scenario/task.md)
- [ ] [T-151] 검증한다: 지역 항목 타이포그래피 일관성 회귀와 실패 시나리오 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-item-typography-consistency/validate-regression-and-failure-flow/task.md)
- [ ] [T-152] 준비한다: 지역 항목 타이포그래피 일관성 관측과 릴리스 운영 (backlog/core-region-selection-mvp/hierarchical-region-loading-and-state-transition/region-item-typography-consistency/prepare-observability-and-rollout/task.md)

## 2.1 일자별/담당역할별 착수 큐
| 일자 | 담당 역할 | 당일 우선 착수 Task | 비고 |
| --- | --- | --- | --- |
| 2026-04-27 (월) | 프론트엔드 테크리드 | T-145, T-149 | 정의 Task 완료 후 구현 트랙 입력 확정 |
| 2026-04-28 (화) | 프론트엔드 엔지니어 | T-146 | 상호 배타/자동 선택 금지 구현 |
| 2026-04-29 (수) | 프론트엔드 엔지니어 | T-150 | 공통 타이포그래피 스타일 구현 |
| 2026-04-30 (목) | QA 엔지니어 | T-147 | AC-019/AC-021 회귀 검증 |
| 2026-05-01 (금) | QA 엔지니어 | T-151 | AC-022 및 상태 스타일 회귀 검증 |
| 2026-05-04 (월) | 릴리스 엔지니어 | T-148 | 상호 배타 운영 체크리스트/런북 반영 |
| 2026-05-05 (화) | 릴리스 엔지니어 | T-152 | 타이포그래피 운영 체크리스트/런북 반영 |

## 2.2 역할별 책임 범위
| 담당 역할 | 책임 Task |
| --- | --- |
| 프론트엔드 테크리드 | T-145, T-149 |
| 프론트엔드 엔지니어 | T-146, T-150 |
| QA 엔지니어 | T-147, T-151 |
| 릴리스 엔지니어 | T-148, T-152 |

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
