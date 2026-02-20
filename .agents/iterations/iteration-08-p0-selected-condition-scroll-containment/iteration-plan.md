# 이터레이션 계획서

## 1. 메타
- 이터레이션명: iteration-08-p0-selected-condition-scroll-containment
- 기간: 2026-05-25 ~ 2026-05-29
- 작성일: 2026-02-20
- 기준 문서:
- PRD.md
- PRD.en.md
- .agents/issues/add-scroll-feature-to-selection-condition-area/plan.md
- backlog/core-region-selection-mvp/epic.md
- backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/feature.md
- backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-scroll-containment/userstory.md
- backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-scroll-containment/define-scope-and-acceptance/task.md
- backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-scroll-containment/implement-main-scenario/task.md
- backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-scroll-containment/validate-regression-and-failure-flow/task.md
- backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-scroll-containment/prepare-observability-and-rollout/task.md

## 2. 목표
- 비즈니스/사용자 목표:
  - 선택 조건 칩이 대량으로 누적되어도 상세 패널 접근성과 삭제 흐름이 유지되는 UI를 제공한다.
  - 모바일/데스크톱에서 선택 조건 영역이 과도하게 레이아웃을 밀어내지 않도록 사용자 경험을 안정화한다.
- 기술 목표:
  - `SelectedConditionBasket`의 스크롤 viewport 분리 구조와 CSS 높이 상한/overflow 정책을 반영한다.
  - 삭제/전체삭제/`onChange` 동기화 계약과 스타일 계약 회귀를 자동화 테스트로 고정한다.
  - 관측 포인트와 롤백 절차를 운영 문서로 준비한다.
- 이번 이터레이션 성공 기준:
  - 포함 범위 Task(T-169~T-172)가 체크리스트에 근거와 함께 완료 처리된다.
  - `ComposableSearch.test.tsx`, `styleIsolation.test.ts` 기준 회귀 검증이 통과한다.
  - 스크롤 임계치/높이 정책/헤더 고정 여부 `TBD`가 의사결정 오너와 함께 정리된다.

## 3. 범위
### 3.1 포함 범위
| 우선순위 | Epic | Feature | UserStory | Task | 근거 문서 |
| --- | --- | --- | --- | --- | --- |
| P0 | [E-01] | [F-03] | [US-043] | [T-169] 정의한다: 선택 조건 영역 스크롤 UX 기준과 수용 기준 | backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-scroll-containment/define-scope-and-acceptance/task.md |
| P0 | [E-01] | [F-03] | [US-043] | [T-170] 구현한다: 선택 조건 영역 스크롤 viewport와 레이아웃 보호 규칙 | backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-scroll-containment/implement-main-scenario/task.md |
| P0 | [E-01] | [F-03] | [US-043] | [T-171] 검증한다: 스크롤 도입 후 삭제/동기화 회귀와 스타일 계약 | backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-scroll-containment/validate-regression-and-failure-flow/task.md |
| P1 | [E-01] | [F-03] | [US-043] | [T-172] 준비한다: 스크롤 릴리스 관측과 수동 검증 체크리스트 | backlog/core-region-selection-mvp/selected-condition-chip-and-dedup-management/selected-condition-scroll-containment/prepare-observability-and-rollout/task.md |

### 3.2 제외 범위
- `US-007`, `US-008`, `US-009`의 기능 확장(신규 정책 추가)은 이번 이터레이션에서 제외한다.
- 데이터 모델/토글 정책 변경, virtualization 도입, API/서버 연동 변경은 제외한다.
- 지역 상세 컬럼 스크롤 정책 재설계는 별도 이슈로 분리한다.

## 4. 일정/마일스톤
- M1: 범위 확정 (2026-05-25)
- M2: 구현 완료 (2026-05-27)
- M3: 검증 완료 (2026-05-28)
- M4: 배포/릴리스 판단 (2026-05-29)

### 4.1 일자별/담당역할별 착수 순서
| 일자 | 담당 역할 | 즉시 착수 Task | 선행/완료 조건 |
| --- | --- | --- | --- |
| 2026-05-25 (월) | 프론트엔드 엔지니어, PO | T-169 | 스크롤 정책/임계치/`TBD` 오너 확정 |
| 2026-05-26 (화) | 프론트엔드 엔지니어 | T-170 | T-169 완료 후 TSX/CSS 반영 |
| 2026-05-27 (수) | QA 엔지니어, 프론트엔드 엔지니어 | T-171 | T-170 완료 후 테스트/스타일 계약 검증 |
| 2026-05-28 (목) | QA 엔지니어, 프론트엔드 엔지니어 | T-172 | T-171 완료 후 운영 체크리스트/롤백 문서 확정 |
| 2026-05-29 (금) | FE Lead, QA | 릴리스 게이트 리뷰 | 체크리스트/오픈 이슈/후속 입력 정리 |

### 4.2 병렬 실행 트랙
| 트랙 | 범위 | 담당 역할 중심 | 목표 완료일 |
| --- | --- | --- | --- |
| Track-A | 정의/구현 (T-169, T-170) | 프론트엔드 엔지니어 + PO | 2026-05-27 |
| Track-B | 검증/운영 준비 (T-171, T-172) | QA 엔지니어 + 프론트엔드 엔지니어 | 2026-05-29 |

## 5. 의존성 및 리스크
| 구분 | 내용 | 영향도 | 대응 방안 | 담당 |
| --- | --- | --- | --- | --- |
| 의존성 | T-170은 T-169의 스크롤 임계치/높이 정책 확정에 의존 | High | T-169 산출물을 구현 게이트로 고정하고 미확정 항목은 `TBD`로 분리 | 프론트엔드 엔지니어 |
| 의존성 | T-171은 T-170 구현 완료와 테스트 대상 코드 확정에 의존 | High | 구현 변경 파일을 고정 후 테스트 보강 범위를 조기 합의 | QA 엔지니어 |
| 의존성 | T-172는 T-171 검증 결과와 실패 패턴 분석에 의존 | Medium | 검증 로그를 운영 체크리스트 입력으로 강제 | QA 엔지니어 |
| 리스크 | 높이 상한이 과도하면 칩 가시성이 낮아지고 사용성 저하 가능 | Medium | 데스크톱/모바일 별 최소 가시 칩 수 기준을 T-169에서 합의 | PO |
| 리스크 | overflow 컨텍스트 변경으로 삭제 버튼 포커스/클릭 회귀 가능 | High | T-171에서 키보드/마우스 경로 회귀 케이스를 필수화 | 프론트엔드 엔지니어 |
| 리스크 | 운영 문서 미흡 시 배포 후 장애 대응 지연 가능 | Medium | T-172 산출물을 릴리스 게이트 통과의 필수 조건으로 지정 | QA 엔지니어 |

## 6. 완료 기준 (Exit Criteria)
- [x] 커밋 범위의 Task(T-169~T-172)가 체크리스트에서 근거와 함께 완료 처리된다.
- [x] 기능/스타일 회귀 테스트 결과가 통과한다.
- [x] 운영 준비(관측/롤백/수동 검증)가 문서로 준비된다.
- [x] 미해결 이슈가 릴리스 허용 범위 내로 정리된다.

## 7. 오픈 이슈
- 스크롤 임계치: 콘텐츠 높이 상한 기반으로 확정 (`desktop 144px`, `mobile 112px`)
- 높이 정책: 브레이크포인트별 px 상한 적용으로 확정
- 헤더 sticky: 미적용으로 확정 (재검토 오너: `FE Lead`, `PO`)
