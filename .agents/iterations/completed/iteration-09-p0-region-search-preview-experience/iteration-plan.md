# 이터레이션 계획서

## 1. 메타
- 이터레이션명: iteration-09-p0-region-search-preview-experience
- 기간: 2026-02-23 ~ 2026-03-06
- 작성일: 2026-02-24
- 기준 문서:
- PRD.md
- PRD.en.md
- .agents/issues/completed/region-search-feature/issue.md
- .agents/issues/completed/region-search-feature/plan.md
- backlog/region-search-preview-experience/epic.md
- backlog/region-search-preview-experience/uiux-specification-and-handoff/feature.md
- backlog/region-search-preview-experience/region-search-model-and-selection-integration/feature.md
- backlog/region-search-preview-experience/uiux-specification-and-handoff/region-search-uiux-foundation/userstory.md
- backlog/region-search-preview-experience/region-search-model-and-selection-integration/build-region-search-index-and-matching-policy/userstory.md
- backlog/region-search-preview-experience/region-search-model-and-selection-integration/integrate-region-search-preview-and-selection-flow/userstory.md
- backlog/region-search-preview-experience/region-search-model-and-selection-integration/prepare-observability-rollout-and-release-safety/userstory.md
- backlog/region-search-preview-experience/uiux-specification-and-handoff/region-search-uiux-foundation/create-wireframe-for-region-search-input/task.md
- backlog/region-search-preview-experience/uiux-specification-and-handoff/region-search-uiux-foundation/build-clickable-prototype-for-region-search-preview/task.md
- backlog/region-search-preview-experience/uiux-specification-and-handoff/region-search-uiux-foundation/validate-usability-and-refine-copy-and-accessibility/task.md
- backlog/region-search-preview-experience/uiux-specification-and-handoff/region-search-uiux-foundation/finalize-design-handoff-for-region-search-components/task.md
- backlog/region-search-preview-experience/region-search-model-and-selection-integration/build-region-search-index-and-matching-policy/define-region-search-matching-policy-and-edge-cases/task.md
- backlog/region-search-preview-experience/region-search-model-and-selection-integration/build-region-search-index-and-matching-policy/implement-region-search-index-and-filter-model/task.md
- backlog/region-search-preview-experience/region-search-model-and-selection-integration/build-region-search-index-and-matching-policy/validate-unit-tests-for-region-search-model/task.md
- backlog/region-search-preview-experience/region-search-model-and-selection-integration/integrate-region-search-preview-and-selection-flow/implement-region-search-input-and-preview-list-ui/task.md
- backlog/region-search-preview-experience/region-search-model-and-selection-integration/integrate-region-search-preview-and-selection-flow/integrate-preview-selection-with-condition-policy-and-callbacks/task.md
- backlog/region-search-preview-experience/region-search-model-and-selection-integration/integrate-region-search-preview-and-selection-flow/verify-integration-and-regression-for-region-search-flow/task.md
- backlog/region-search-preview-experience/region-search-model-and-selection-integration/prepare-observability-rollout-and-release-safety/instrument-search-flow-observability-and-error-signals/task.md
- backlog/region-search-preview-experience/region-search-model-and-selection-integration/prepare-observability-rollout-and-release-safety/review-security-accessibility-and-large-profile-performance/task.md
- backlog/region-search-preview-experience/region-search-model-and-selection-integration/prepare-observability-rollout-and-release-safety/document-release-runbook-and-rollback-and-post-release-checks/task.md
- .agents/iterations/completed/iteration-08-p0-selected-condition-scroll-containment/iteration-plan.md
- .agents/iterations/completed/iteration-08-p0-selected-condition-scroll-containment/checklist.md

## 2. 목표
- 비즈니스/사용자 목표:
  - 최종 사용자가 `cs-selector-area` 바깥 아래(다음 형제 영역) 검색 입력에서 지역명을 부분 입력해 시/도/시군구/읍면동 계층을 직접 전부 탐색하지 않고도 빠르게 조건을 선택할 수 있게 한다.
  - 지역 검색 미리보기 선택 흐름을 통해 선택 조건 칩 조작의 완료 시간을 단축한다.
- 기술 목표:
  - 지역 계층을 검색 가능한 인덱스로 변환하고 부분 일치/경로 미리보기/선택 매핑 규칙을 코드와 테스트로 고정한다.
  - 검색 컴포넌트를 `cs-detailed-area` 바깥 좌상단(`cs-selector-area` 바깥 아래(다음 형제 영역))에 배치하고 DOM 계약을 테스트로 고정한다.
  - 기존 `selectionPolicy`, `callbackPipeline`, `ComposableSearch` 회귀를 깨지 않으면서 검색 UI를 확장한다.
  - 릴리스 전 관측/보안/접근성/롤백 준비를 문서화해 운영 리스크를 줄인다.
- 이번 이터레이션 성공 기준:
  - 포함 범위 Task(T-173~T-185)가 체크리스트에서 추적 가능하게 관리된다.
  - 핵심 구현/검증 구간(T-178~T-182) 완료 후 `npm run test` 기준 회귀 실패가 없어야 한다.
  - 검색 결과 정렬/개수/아이콘 주입/노출 정책을 정책 문서로 확정하고, 잔여 항목은 명시적으로 분리한다.

## 3. 범위
### 3.1 포함 범위
| 우선순위 | Epic | Feature | UserStory | Task | 근거 문서 |
| --- | --- | --- | --- | --- | --- |
| P0 | [E-06] | [F-14] | [US-044] | [T-173] 작성한다: 지역 검색 입력/미리보기 와이어프레임 | backlog/region-search-preview-experience/uiux-specification-and-handoff/region-search-uiux-foundation/create-wireframe-for-region-search-input/task.md |
| P0 | [E-06] | [F-14] | [US-044] | [T-174] 제작한다: 지역 검색 미리보기 클릭 프로토타입 | backlog/region-search-preview-experience/uiux-specification-and-handoff/region-search-uiux-foundation/build-clickable-prototype-for-region-search-preview/task.md |
| P0 | [E-06] | [F-14] | [US-044] | [T-175] 검증한다: 사용성 테스트와 카피/접근성 개선 | backlog/region-search-preview-experience/uiux-specification-and-handoff/region-search-uiux-foundation/validate-usability-and-refine-copy-and-accessibility/task.md |
| P0 | [E-06] | [F-14] | [US-044] | [T-176] 확정한다: 지역 검색 컴포넌트 디자인 핸드오프 | backlog/region-search-preview-experience/uiux-specification-and-handoff/region-search-uiux-foundation/finalize-design-handoff-for-region-search-components/task.md |
| P0 | [E-06] | [F-15] | [US-045] | [T-177] 정의한다: 지역 검색 매칭 정책과 경계 조건 | backlog/region-search-preview-experience/region-search-model-and-selection-integration/build-region-search-index-and-matching-policy/define-region-search-matching-policy-and-edge-cases/task.md |
| P0 | [E-06] | [F-15] | [US-045] | [T-178] 구현한다: 지역 검색 인덱스와 필터 모델 | backlog/region-search-preview-experience/region-search-model-and-selection-integration/build-region-search-index-and-matching-policy/implement-region-search-index-and-filter-model/task.md |
| P0 | [E-06] | [F-15] | [US-045] | [T-179] 검증한다: 지역 검색 모델 단위 테스트 | backlog/region-search-preview-experience/region-search-model-and-selection-integration/build-region-search-index-and-matching-policy/validate-unit-tests-for-region-search-model/task.md |
| P0 | [E-06] | [F-15] | [US-046] | [T-180] 구현한다: 지역 검색 입력과 미리보기 목록 UI | backlog/region-search-preview-experience/region-search-model-and-selection-integration/integrate-region-search-preview-and-selection-flow/implement-region-search-input-and-preview-list-ui/task.md |
| P0 | [E-06] | [F-15] | [US-046] | [T-181] 연동한다: 미리보기 선택과 조건 정책/콜백 파이프라인 | backlog/region-search-preview-experience/region-search-model-and-selection-integration/integrate-region-search-preview-and-selection-flow/integrate-preview-selection-with-condition-policy-and-callbacks/task.md |
| P0 | [E-06] | [F-15] | [US-046] | [T-182] 검증한다: 지역 검색 플로우 통합/회귀 테스트 | backlog/region-search-preview-experience/region-search-model-and-selection-integration/integrate-region-search-preview-and-selection-flow/verify-integration-and-regression-for-region-search-flow/task.md |
| P1 | [E-06] | [F-15] | [US-047] | [T-183] 계측한다: 검색 플로우 관측 지표와 오류 신호 | backlog/region-search-preview-experience/region-search-model-and-selection-integration/prepare-observability-rollout-and-release-safety/instrument-search-flow-observability-and-error-signals/task.md |
| P1 | [E-06] | [F-15] | [US-047] | [T-184] 점검한다: 보안/접근성/대용량 성능 리스크 | backlog/region-search-preview-experience/region-search-model-and-selection-integration/prepare-observability-rollout-and-release-safety/review-security-accessibility-and-large-profile-performance/task.md |
| P1 | [E-06] | [F-15] | [US-047] | [T-185] 문서화한다: 릴리스 런북, 롤백, 배포 후 검증 | backlog/region-search-preview-experience/region-search-model-and-selection-integration/prepare-observability-rollout-and-release-safety/document-release-runbook-and-rollback-and-post-release-checks/task.md |

### 3.2 제외 범위
- 초성 검색, 오탈자 보정, 퍼지 검색 알고리즘 도입은 제외한다.
- 원격 API 연동/비동기 검색 및 서버·DB 변경 작업은 제외한다.
- 글로벌 디자인 시스템 개편/테마 재설계는 제외한다.
- GitHub MCP 기반 이슈 등록 자동화는 저장소 정보 확정 전까지 제외한다.

## 4. 일정/마일스톤
- M1: 범위 확정 (2026-02-23)
- M2: 구현 완료 (2026-03-03)
- M3: 검증 완료 (2026-03-05)
- M4: 배포/릴리스 판단 (2026-03-06)

### 4.1 일자별/담당역할별 착수 순서
| 일자 | 담당 역할 | 즉시 착수 Task | 선행/완료 조건 |
| --- | --- | --- | --- |
| 2026-02-23 (월) | 프로덕트 디자이너 | T-173 | 이슈/플랜 리뷰 완료 |
| 2026-02-24 (화) | 프로덕트 디자이너 | T-174 | T-173 완료 |
| 2026-02-25 (수) | 프로덕트 디자이너 | T-175 | T-174 완료 |
| 2026-02-26 (목) | 프로덕트 디자이너, 프론트엔드 테크리드 | T-176, T-177 | T-175 완료 후 핸드오프/정책 확정 병렬 진행 (`cs-selector-area` 바깥 아래(다음 형제 영역) + `cs-detailed-area` 외부 계약 포함) |
| 2026-02-27 (금) | 프론트엔드 엔지니어 | T-178 | T-176, T-177 완료 |
| 2026-03-02 (월) | 프론트엔드 엔지니어 | T-179, T-180 | T-178 완료 후 단위 검증과 `selector-area` 바깥 아래(다음 형제 영역) UI 구현 병렬 진행 |
| 2026-03-03 (화) | 프론트엔드 엔지니어 | T-181 | T-180 완료 |
| 2026-03-04 (수) | QA 엔지니어, 프론트엔드 엔지니어 | T-182, T-183 | T-181 완료 후 통합 검증(배치 DOM 계약 포함)/관측 준비 |
| 2026-03-05 (목) | QA 엔지니어 | T-184 | T-181 완료 |
| 2026-03-06 (금) | 프론트엔드 테크리드, QA 엔지니어 | T-185, 릴리스 게이트 리뷰 | T-182, T-183, T-184 완료 |

### 4.2 병렬 실행 트랙
| 트랙 | 범위 | 담당 역할 중심 | 목표 완료일 |
| --- | --- | --- | --- |
| Track-A | UI/UX 선행 (T-173~T-176) | 프로덕트 디자이너 + FE Tech Lead | 2026-02-26 |
| Track-B | 검색 모델/연동 구현 (T-177~T-181) | FE Tech Lead + FE 엔지니어 | 2026-03-03 |
| Track-C | 검증/운영 준비 (T-182~T-185) | QA 엔지니어 + FE 엔지니어 | 2026-03-06 |

## 5. 의존성 및 리스크
| 구분 | 내용 | 영향도 | 대응 방안 | 담당 |
| --- | --- | --- | --- | --- |
| 의존성 | F-15 구현 Task는 `T-176` 디자인 핸드오프 완료에 의존 | High | T-176 승인 전 구현 착수를 차단하고 체크리스트에 차단 사유를 명시한다. 핸드오프에 `cs-selector-area` 바깥 아래(다음 형제 영역) 배치 계약 포함 여부를 체크한다. | FE Tech Lead |
| 의존성 | T-178은 T-177 정책 확정 결과(정렬/개수/매핑)에 의존 | High | 정책 미확정 항목을 `TBD`로 분리하고 우선 결정 회의에서 닫는다 | FE Tech Lead |
| 의존성 | T-180은 T-177의 노출 정책/DOM 배치 계약 확정 결과에 의존 | High | T-177 산출물에 `cs-selector-area` 바깥 아래(다음 형제 영역), `cs-detailed-area` 외부 기준을 테스트 가능한 문장으로 고정한다 | FE Tech Lead |
| 의존성 | T-182~T-185는 T-181 구현 완료에 의존 | High | 구현 완료 커밋 해시를 검증 게이트 입력으로 고정한다 | QA 엔지니어 |
| 리스크 | 검색 결과 정렬/최대 노출 개수/노출 정책 미확정으로 UX 불일치 가능 | High | T-177에서 우선순위/개수/정렬/노출 정책을 문서화하고 승인 기록을 남긴다 | PO |
| 리스크 | `cs-selector-area` 바깥 아래(다음 형제 영역) 배치 해석 불일치로 구현/테스트 기준이 어긋날 가능 | High | T-176에서 배치 계약을 확정하고 T-182에서 DOM 배치 계약 시나리오를 필수 검증한다 | FE Tech Lead |
| 리스크 | large 프로파일에서 입력 반응 지연 발생 가능 | Medium | T-184에서 대용량 수동 스모크를 수행하고 필요 시 결과 제한/최적화 후속 Task 등록 | FE 엔지니어 |
| 리스크 | 미리보기 클릭 연동 시 기존 상호배타/콜백 계약 회귀 가능 | High | T-182에서 기존 회귀 테스트 세트를 필수 실행하고 실패 시 릴리스 차단 | QA 엔지니어 |
| 리스크 | 접근성 기준 미적용 시 릴리스 품질 저하 가능 | Medium | T-175, T-184에서 키보드/라벨/대비 체크를 강제한다 | 프로덕트 디자이너 |

## 6. 완료 기준 (Exit Criteria)
- [x] 커밋 범위의 Task(T-173~T-185)가 체크리스트에서 근거와 함께 완료 처리된다. (근거: checklist.md 22/22)
- [x] `npm run test` 기준 통합/회귀 테스트가 통과한다. (근거: `11 files, 72 tests` 통과)
- [x] 운영 준비(관측/롤백/런북) 문서가 준비되고 릴리스 게이트에서 검토된다. (근거: observability-plan.md, release-runbook.md)
- [x] 미해결 `TBD`가 릴리스 허용 범위 내로 정리된다. (근거: region-search-policy.md, risk-review.md)

## 7. 오픈 이슈
- 확정: 검색 결과 기본 노출 개수는 기본 `20`, 옵션(`searchResultLimit`)으로 조정한다.
- 확정: 정렬 우선순위는 매칭 시작 위치 -> 레벨(`읍/면/동` > `시/군/구` > `시/도`) -> 경로 가나다 순으로 적용한다.
- 확정: 검색 UI는 region selector가 존재하면 항상 노출한다.
- 확정: 아이콘 주입은 `RegionSelectOptions.searchInputIcon`을 제공하고 미지정 시 기본 SVG를 사용한다.
- 확정: `cs-selector-area` 바깥 아래(다음 형제 영역) + `cs-detailed-area` 외부 배치 계약을 통합 테스트로 고정한다.
- 잔여: 디바운스/키보드 내비게이션 고도화는 후속 최적화 항목으로 분리한다.
- 잔여: GitHub 등록 대상 저장소(`owner/repo`) 및 라벨 정책은 조직 정책 확정 후 반영한다.



