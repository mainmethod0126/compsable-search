# 이터레이션 체크리스트

## 메타
- 이터레이션명: iteration-09-p0-region-search-preview-experience
- 기간: 2026-02-23 ~ 2026-03-06
- 마지막 갱신: 2026-02-20

## 진행률
- 완료율: 0/22 (0%)

## 1. 착수 준비
- [ ] 계획서와 범위가 확정되었다.
- [ ] 선행 의존성/차단 이슈를 확인했다.
- [ ] 담당자와 우선순위를 합의했다.

## 2. 구현
- [ ] [T-173] 작성한다: 지역 검색 입력/미리보기 와이어프레임 (backlog/region-search-preview-experience/uiux-specification-and-handoff/region-search-uiux-foundation/create-wireframe-for-region-search-input/task.md)
- [ ] [T-174] 제작한다: 지역 검색 미리보기 클릭 프로토타입 (backlog/region-search-preview-experience/uiux-specification-and-handoff/region-search-uiux-foundation/build-clickable-prototype-for-region-search-preview/task.md) (차단: T-173 완료 전 착수 불가)
- [ ] [T-175] 검증한다: 사용성 테스트와 카피/접근성 개선 (backlog/region-search-preview-experience/uiux-specification-and-handoff/region-search-uiux-foundation/validate-usability-and-refine-copy-and-accessibility/task.md) (차단: T-174 완료 전 착수 불가)
- [ ] [T-176] 확정한다: 지역 검색 컴포넌트 디자인 핸드오프 (backlog/region-search-preview-experience/uiux-specification-and-handoff/region-search-uiux-foundation/finalize-design-handoff-for-region-search-components/task.md) (차단: T-175 완료 전 착수 불가)
- [ ] [T-177] 정의한다: 지역 검색 매칭 정책과 경계 조건 (backlog/region-search-preview-experience/region-search-model-and-selection-integration/build-region-search-index-and-matching-policy/define-region-search-matching-policy-and-edge-cases/task.md) (차단: T-176 완료 전 착수 불가)
- [ ] [T-178] 구현한다: 지역 검색 인덱스와 필터 모델 (backlog/region-search-preview-experience/region-search-model-and-selection-integration/build-region-search-index-and-matching-policy/implement-region-search-index-and-filter-model/task.md) (차단: T-176, T-177 완료 전 착수 불가)
- [ ] [T-179] 검증한다: 지역 검색 모델 단위 테스트 (backlog/region-search-preview-experience/region-search-model-and-selection-integration/build-region-search-index-and-matching-policy/validate-unit-tests-for-region-search-model/task.md) (차단: T-178 완료 전 착수 불가)
- [ ] [T-180] 구현한다: 지역 검색 입력과 미리보기 목록 UI (backlog/region-search-preview-experience/region-search-model-and-selection-integration/integrate-region-search-preview-and-selection-flow/implement-region-search-input-and-preview-list-ui/task.md) (차단: T-176, T-178 완료 전 착수 불가)
- [ ] [T-181] 연동한다: 미리보기 선택과 조건 정책/콜백 파이프라인 (backlog/region-search-preview-experience/region-search-model-and-selection-integration/integrate-region-search-preview-and-selection-flow/integrate-preview-selection-with-condition-policy-and-callbacks/task.md) (차단: T-176, T-180 완료 전 착수 불가)
- [ ] [T-182] 검증한다: 지역 검색 플로우 통합/회귀 테스트 (backlog/region-search-preview-experience/region-search-model-and-selection-integration/integrate-region-search-preview-and-selection-flow/verify-integration-and-regression-for-region-search-flow/task.md) (차단: T-181 완료 전 착수 불가)
- [ ] [T-183] 계측한다: 검색 플로우 관측 지표와 오류 신호 (backlog/region-search-preview-experience/region-search-model-and-selection-integration/prepare-observability-rollout-and-release-safety/instrument-search-flow-observability-and-error-signals/task.md) (차단: T-181 완료 전 착수 불가)
- [ ] [T-184] 점검한다: 보안/접근성/대용량 성능 리스크 (backlog/region-search-preview-experience/region-search-model-and-selection-integration/prepare-observability-rollout-and-release-safety/review-security-accessibility-and-large-profile-performance/task.md) (차단: T-181 완료 전 착수 불가)
- [ ] [T-185] 문서화한다: 릴리스 런북, 롤백, 배포 후 검증 (backlog/region-search-preview-experience/region-search-model-and-selection-integration/prepare-observability-rollout-and-release-safety/document-release-runbook-and-rollback-and-post-release-checks/task.md) (차단: T-182, T-183, T-184 완료 전 착수 불가)

## 2.1 일자별/담당역할별 착수 큐
| 일자 | 담당 역할 | 당일 우선 착수 Task | 비고 |
| --- | --- | --- | --- |
| 2026-02-23 (월) | 프로덕트 디자이너 | T-173 | 와이어프레임 확정 |
| 2026-02-24 (화) | 프로덕트 디자이너 | T-174 | 프로토타입 제작 |
| 2026-02-25 (수) | 프로덕트 디자이너 | T-175 | 사용성/접근성 개선 |
| 2026-02-26 (목) | 프로덕트 디자이너, FE Tech Lead | T-176, T-177 | 핸드오프 + 정책 확정 |
| 2026-02-27 (금) | FE 엔지니어 | T-178 | 검색 모델 구현 |
| 2026-03-02 (월) | FE 엔지니어 | T-179, T-180 | 모델 검증 + UI 구현 |
| 2026-03-03 (화) | FE 엔지니어 | T-181 | 선택/콜백 연동 |
| 2026-03-04 (수) | QA, FE 엔지니어 | T-182, T-183 | 통합 회귀 + 관측 준비 |
| 2026-03-05 (목) | QA | T-184 | 보안/접근성/성능 점검 |
| 2026-03-06 (금) | FE Tech Lead, QA | T-185 | 런북/롤백 최종화 |

## 2.2 역할별 책임 범위
| 담당 역할 | 책임 Task |
| --- | --- |
| 프로덕트 디자이너 | T-173, T-174, T-175, T-176 |
| 프론트엔드 테크리드 | T-177, T-185 |
| 프론트엔드 엔지니어 | T-178, T-179, T-180, T-181, T-183 |
| QA 엔지니어 | T-182, T-184 |

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

