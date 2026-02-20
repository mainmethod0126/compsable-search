# 이터레이션 체크리스트

## 메타
- 이터레이션명: iteration-08-p0-selected-condition-scroll-containment
- 기간: 2026-05-25 ~ 2026-05-29
- 마지막 갱신: 2026-02-20

## 진행률
- 완료율: 13/13 (100%)

## 1. 착수 준비
- [x] 계획서와 범위가 확정되었다. (완료: 2026-02-20, 근거: .agents/iterations/iteration-08-p0-selected-condition-scroll-containment/execution-log.md)
- [x] 선행 의존성/차단 이슈를 확인했다. (완료: 2026-02-20, 근거: .agents/iterations/iteration-08-p0-selected-condition-scroll-containment/execution-log.md)
- [x] 담당자와 우선순위를 합의했다. (완료: 2026-02-20, 근거: .agents/iterations/iteration-08-p0-selected-condition-scroll-containment/execution-log.md)

## 2. 구현
- [x] [T-169] 정의한다: 선택 조건 영역 스크롤 UX 기준과 수용 기준 (backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-scroll-containment/define-scope-and-acceptance/task.md) (완료: 2026-02-20, 근거: .agents/iterations/iteration-08-p0-selected-condition-scroll-containment/scroll-ux-policy.md)
- [x] [T-170] 구현한다: 선택 조건 영역 스크롤 viewport와 레이아웃 보호 규칙 (backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-scroll-containment/implement-main-scenario/task.md) (완료: 2026-02-20, 근거: src/components/SelectedConditionBasket.tsx, src/components/ComposableSearch.css)
- [x] [T-171] 검증한다: 스크롤 도입 후 삭제/동기화 회귀와 스타일 계약 (backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-scroll-containment/validate-regression-and-failure-flow/task.md) (완료: 2026-02-20, 근거: src/components/ComposableSearch.test.tsx, src/styleIsolation.test.ts)
- [x] [T-172] 준비한다: 스크롤 릴리스 관측과 수동 검증 체크리스트 (backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-scroll-containment/prepare-observability-and-rollout/task.md) (완료: 2026-02-20, 근거: .agents/iterations/iteration-08-p0-selected-condition-scroll-containment/manual-qa-checklist.md, .agents/iterations/iteration-08-p0-selected-condition-scroll-containment/release-runbook.md)

## 2.1 일자별/담당역할별 착수 큐
| 일자 | 담당 역할 | 당일 우선 착수 Task | 비고 |
| --- | --- | --- | --- |
| 2026-05-25 (월) | 프론트엔드 엔지니어, PO | T-169 | 임계치/높이 정책/`TBD` 오너 확정 |
| 2026-05-26 (화) | 프론트엔드 엔지니어 | T-170 | TSX/CSS 구현 |
| 2026-05-27 (수) | QA 엔지니어, 프론트엔드 엔지니어 | T-171 | 테스트/스타일 계약 검증 |
| 2026-05-28 (목) | QA 엔지니어, 프론트엔드 엔지니어 | T-172 | 운영 체크리스트/롤백 문서 확정 |

## 2.2 역할별 책임 범위
| 담당 역할 | 책임 Task |
| --- | --- |
| 프론트엔드 엔지니어, PO | T-169 |
| 프론트엔드 엔지니어 | T-170 |
| QA 엔지니어, 프론트엔드 엔지니어 | T-171, T-172 |

## 3. 검증
- [x] 기능 검증 시나리오를 실행했다. (완료: 2026-02-20, 근거: npm run test -- src/components/ComposableSearch.test.tsx src/styleIsolation.test.ts)
- [x] 회귀 테스트를 수행했다. (완료: 2026-02-20, 근거: npm test)
- [x] 수용 기준(AC/DoD) 충족을 확인했다. (완료: 2026-02-20, 근거: .agents/iterations/iteration-08-p0-selected-condition-scroll-containment/execution-log.md)

## 4. 배포/운영
- [x] 배포 체크리스트를 점검했다. (완료: 2026-02-20, 근거: .agents/iterations/iteration-08-p0-selected-condition-scroll-containment/release-runbook.md)
- [x] 모니터링/알람 기준을 확인했다. (완료: 2026-02-20, 근거: .agents/iterations/iteration-08-p0-selected-condition-scroll-containment/release-runbook.md)
- [x] 롤백 절차를 점검했다. (완료: 2026-02-20, 근거: .agents/iterations/iteration-08-p0-selected-condition-scroll-containment/release-runbook.md)

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
