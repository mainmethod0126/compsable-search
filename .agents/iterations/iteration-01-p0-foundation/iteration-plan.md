# 이터레이션 계획서

## 1. 메타
- 이터레이션명: `iteration-01-p0-foundation`
- 기간: `2026-02-16 ~ 2026-02-27`
- 작성일: `2026-02-15`
- 기준 문서:
- `PRD.md`
- `PRD.en.md`
- `backlog/core-region-selection-mvp/epic.md`
- `backlog/core-region-selection-mvp/search-container-and-selector-orchestration/feature.md`
- `backlog/library-quality-hardening-and-release-readiness/epic.md`
- `backlog/library-quality-hardening-and-release-readiness/build-blocker-and-code-hygiene-fix/feature.md`
- `backlog/core-region-selection-mvp/search-container-and-selector-orchestration/selector-layout-order-preservation/userstory.md`
- `backlog/core-region-selection-mvp/search-container-and-selector-orchestration/region-trigger-detail-panel-toggle/userstory.md`
- `backlog/core-region-selection-mvp/search-container-and-selector-orchestration/selector-content-injection-contract/userstory.md`
- `backlog/library-quality-hardening-and-release-readiness/build-blocker-and-code-hygiene-fix/build-failure-root-cause-and-fixes/userstory.md`
- `backlog/library-quality-hardening-and-release-readiness/build-blocker-and-code-hygiene-fix/render-warning-and-debug-log-cleanup/userstory.md`
- `backlog/library-quality-hardening-and-release-readiness/build-blocker-and-code-hygiene-fix/code-hygiene-gate-hardening/userstory.md`

## 2. 목표
- 비즈니스/사용자 목표:
  - `ComposableSearch`의 핵심 진입 UX(레이아웃/토글/콘텐츠 주입)와 릴리스 기초 품질(빌드/경고/코드 위생)을 동시에 안정화해 `0.1.0-alpha` 게이트 준비 상태를 만든다.
- 기술 목표:
  - `E-01/F-01`과 `E-03/F-07`의 `P0` Task를 완결해 후행 Feature(`F-02`, `F-03`, `F-08`, `F-09`, `F-04`, `F-10`) 착수 가능 상태를 확보한다.
  - 빌드/린트 기준선을 유지하고(2026-02-15 기준 `npm run build`, `npm run lint` 통과), 회귀 검증 및 운영 준비 산출물 초안을 만든다.
- 이번 이터레이션 성공 기준:
  - 포함 범위의 Task(`T-001~T-012`, `T-073~T-084`)가 체크리스트에서 근거와 함께 완료 처리된다.
  - `F-01`, `F-07` 수용 기준의 핵심 항목이 코드/테스트/문서에서 추적 가능하게 충족된다.

## 3. 범위
### 3.1 포함 범위
| 우선순위 | Epic | Feature | UserStory | Task | 근거 문서 |
| --- | --- | --- | --- | --- | --- |
| P0 | `[E-01]` | `[F-01]` | `[US-001]` | `[T-001]` 정의한다: Selector 레이아웃과 순서 보존 범위와 수용 기준 | `backlog/core-region-selection-mvp/search-container-and-selector-orchestration/selector-layout-order-preservation/define-scope-and-acceptance/task.md` |
| P0 | `[E-01]` | `[F-01]` | `[US-001]` | `[T-002]` 구현한다: Selector 레이아웃과 순서 보존 핵심 시나리오 | `backlog/core-region-selection-mvp/search-container-and-selector-orchestration/selector-layout-order-preservation/implement-main-scenario/task.md` |
| P0 | `[E-01]` | `[F-01]` | `[US-001]` | `[T-003]` 검증한다: Selector 레이아웃과 순서 보존 회귀와 실패 시나리오 | `backlog/core-region-selection-mvp/search-container-and-selector-orchestration/selector-layout-order-preservation/validate-regression-and-failure-flow/task.md` |
| P0 | `[E-01]` | `[F-01]` | `[US-001]` | `[T-004]` 준비한다: Selector 레이아웃과 순서 보존 관측과 릴리스 운영 | `backlog/core-region-selection-mvp/search-container-and-selector-orchestration/selector-layout-order-preservation/prepare-observability-and-rollout/task.md` |
| P0 | `[E-01]` | `[F-01]` | `[US-002]` | `[T-005]` 정의한다: Region 트리거 상세 패널 토글 범위와 수용 기준 | `backlog/core-region-selection-mvp/search-container-and-selector-orchestration/region-trigger-detail-panel-toggle/define-scope-and-acceptance/task.md` |
| P0 | `[E-01]` | `[F-01]` | `[US-002]` | `[T-006]` 구현한다: Region 트리거 상세 패널 토글 핵심 시나리오 | `backlog/core-region-selection-mvp/search-container-and-selector-orchestration/region-trigger-detail-panel-toggle/implement-main-scenario/task.md` |
| P0 | `[E-01]` | `[F-01]` | `[US-002]` | `[T-007]` 검증한다: Region 트리거 상세 패널 토글 회귀와 실패 시나리오 | `backlog/core-region-selection-mvp/search-container-and-selector-orchestration/region-trigger-detail-panel-toggle/validate-regression-and-failure-flow/task.md` |
| P0 | `[E-01]` | `[F-01]` | `[US-002]` | `[T-008]` 준비한다: Region 트리거 상세 패널 토글 관측과 릴리스 운영 | `backlog/core-region-selection-mvp/search-container-and-selector-orchestration/region-trigger-detail-panel-toggle/prepare-observability-and-rollout/task.md` |
| P0 | `[E-01]` | `[F-01]` | `[US-003]` | `[T-009]` 정의한다: Selector 콘텐츠 주입 계약 범위와 수용 기준 | `backlog/core-region-selection-mvp/search-container-and-selector-orchestration/selector-content-injection-contract/define-scope-and-acceptance/task.md` |
| P0 | `[E-01]` | `[F-01]` | `[US-003]` | `[T-010]` 구현한다: Selector 콘텐츠 주입 계약 핵심 시나리오 | `backlog/core-region-selection-mvp/search-container-and-selector-orchestration/selector-content-injection-contract/implement-main-scenario/task.md` |
| P0 | `[E-01]` | `[F-01]` | `[US-003]` | `[T-011]` 검증한다: Selector 콘텐츠 주입 계약 회귀와 실패 시나리오 | `backlog/core-region-selection-mvp/search-container-and-selector-orchestration/selector-content-injection-contract/validate-regression-and-failure-flow/task.md` |
| P0 | `[E-01]` | `[F-01]` | `[US-003]` | `[T-012]` 준비한다: Selector 콘텐츠 주입 계약 관측과 릴리스 운영 | `backlog/core-region-selection-mvp/search-container-and-selector-orchestration/selector-content-injection-contract/prepare-observability-and-rollout/task.md` |
| P0 | `[E-03]` | `[F-07]` | `[US-019]` | `[T-073]` 정의한다: 빌드 실패 원인 분석과 수정 범위와 수용 기준 | `backlog/library-quality-hardening-and-release-readiness/build-blocker-and-code-hygiene-fix/build-failure-root-cause-and-fixes/define-scope-and-acceptance/task.md` |
| P0 | `[E-03]` | `[F-07]` | `[US-019]` | `[T-074]` 구축한다: 빌드 실패 원인 분석과 수정 핵심 시나리오 | `backlog/library-quality-hardening-and-release-readiness/build-blocker-and-code-hygiene-fix/build-failure-root-cause-and-fixes/implement-main-scenario/task.md` |
| P0 | `[E-03]` | `[F-07]` | `[US-019]` | `[T-075]` 검증한다: 빌드 실패 원인 분석과 수정 회귀와 실패 시나리오 | `backlog/library-quality-hardening-and-release-readiness/build-blocker-and-code-hygiene-fix/build-failure-root-cause-and-fixes/validate-regression-and-failure-flow/task.md` |
| P0 | `[E-03]` | `[F-07]` | `[US-019]` | `[T-076]` 준비한다: 빌드 실패 원인 분석과 수정 관측과 릴리스 운영 | `backlog/library-quality-hardening-and-release-readiness/build-blocker-and-code-hygiene-fix/build-failure-root-cause-and-fixes/prepare-observability-and-rollout/task.md` |
| P0 | `[E-03]` | `[F-07]` | `[US-020]` | `[T-077]` 정의한다: 렌더 경고와 디버그 로그 정리 범위와 수용 기준 | `backlog/library-quality-hardening-and-release-readiness/build-blocker-and-code-hygiene-fix/render-warning-and-debug-log-cleanup/define-scope-and-acceptance/task.md` |
| P0 | `[E-03]` | `[F-07]` | `[US-020]` | `[T-078]` 구현한다: 렌더 경고와 디버그 로그 정리 핵심 시나리오 | `backlog/library-quality-hardening-and-release-readiness/build-blocker-and-code-hygiene-fix/render-warning-and-debug-log-cleanup/implement-main-scenario/task.md` |
| P0 | `[E-03]` | `[F-07]` | `[US-020]` | `[T-079]` 검증한다: 렌더 경고와 디버그 로그 정리 회귀와 실패 시나리오 | `backlog/library-quality-hardening-and-release-readiness/build-blocker-and-code-hygiene-fix/render-warning-and-debug-log-cleanup/validate-regression-and-failure-flow/task.md` |
| P0 | `[E-03]` | `[F-07]` | `[US-020]` | `[T-080]` 준비한다: 렌더 경고와 디버그 로그 정리 관측과 릴리스 운영 | `backlog/library-quality-hardening-and-release-readiness/build-blocker-and-code-hygiene-fix/render-warning-and-debug-log-cleanup/prepare-observability-and-rollout/task.md` |
| P0 | `[E-03]` | `[F-07]` | `[US-021]` | `[T-081]` 정의한다: 코드 위생 게이트 강화 범위와 수용 기준 | `backlog/library-quality-hardening-and-release-readiness/build-blocker-and-code-hygiene-fix/code-hygiene-gate-hardening/define-scope-and-acceptance/task.md` |
| P0 | `[E-03]` | `[F-07]` | `[US-021]` | `[T-082]` 구축한다: 코드 위생 게이트 강화 핵심 시나리오 | `backlog/library-quality-hardening-and-release-readiness/build-blocker-and-code-hygiene-fix/code-hygiene-gate-hardening/implement-main-scenario/task.md` |
| P0 | `[E-03]` | `[F-07]` | `[US-021]` | `[T-083]` 검증한다: 코드 위생 게이트 강화 회귀와 실패 시나리오 | `backlog/library-quality-hardening-and-release-readiness/build-blocker-and-code-hygiene-fix/code-hygiene-gate-hardening/validate-regression-and-failure-flow/task.md` |
| P0 | `[E-03]` | `[F-07]` | `[US-021]` | `[T-084]` 준비한다: 코드 위생 게이트 강화 관측과 릴리스 운영 | `backlog/library-quality-hardening-and-release-readiness/build-blocker-and-code-hygiene-fix/code-hygiene-gate-hardening/prepare-observability-and-rollout/task.md` |

### 3.2 제외 범위
- `[E-01/F-02]`, `[E-01/F-03]`: `F-01` 산출물 확정 후 진행해야 하므로 다음 이터레이션으로 이월.
- `[E-03/F-08]`, `[E-03/F-09]`: `F-07` 완료 후 착수 가능한 후행 범위이므로 이월.
- `[E-02/F-04~F-06]`: 우선순위 `P1`, 그리고 `F-04`가 `F-01/F-03`에 의존하므로 이번 범위 제외.
- `[E-04/F-10~F-12]`: 우선순위 `P2`, `0.2.0` 후보 범위로 분리.

## 4. 일정/마일스톤
- M1: 범위 확정 (`2026-02-16`)
- M2: 구현 완료 (`2026-02-21`)
- M3: 검증 완료 (`2026-02-25`)
- M4: 배포/릴리스 판단 (`2026-02-27`)

### 4.1 일자별/담당역할별 착수 순서
| 일자 | 담당 역할 | 즉시 착수 Task | 선행/완료 조건 |
| --- | --- | --- | --- |
| 2026-02-16 (월) | 프론트엔드 테크리드 | `T-001`, `T-005`, `T-009`, `T-073`, `T-077`, `T-081` | 각 UserStory의 정의 Task 착수 (선행조건 충족) |
| 2026-02-17 (화) | 프론트엔드 엔지니어 | `T-002`, `T-006`, `T-010`, `T-078` | `T-001/005/009/077` 완료분부터 순차 시작 |
| 2026-02-17 (화) | DevOps 엔지니어 | `T-074`, `T-082` | `T-073`, `T-081` 완료 시 착수 |
| 2026-02-18 (수) | 프론트엔드 엔지니어 | `T-002`, `T-006`, `T-010`, `T-078` 지속 | 구현 집중일 (코드/테스트 초안) |
| 2026-02-19 (목) | DevOps 엔지니어 | `T-074`, `T-082` 마무리 | 빌드/게이트 자동화 변경 완료 |
| 2026-02-19 (목) | QA 엔지니어 | `T-075`, `T-079`, `T-083` 착수 | 각 구현 Task 완료본 기준 검증 시작 |
| 2026-02-20 (금) | QA 엔지니어 | `T-003`, `T-007`, `T-011` 착수 | `T-002`, `T-006`, `T-010` 완료분 기준 |
| 2026-02-23 (월) | QA 엔지니어 | `T-003`, `T-007`, `T-011`, `T-075`, `T-079`, `T-083` 마무리 | 검증 실패 항목 재현/재검증 포함 |
| 2026-02-24 (화) | 릴리스 엔지니어 | `T-004`, `T-008`, `T-012` | `T-003`, `T-007`, `T-011` 완료 필요 |
| 2026-02-24 (화) | 릴리스 엔지니어 | `T-076`, `T-080`, `T-084` | `T-075`, `T-079`, `T-083` 완료 필요 |
| 2026-02-25 (수) | QA 엔지니어, 릴리스 엔지니어 | 통합 회귀/수용 기준 증적 정리 | PRD AC/QA 시나리오 기준 통합 검증 |
| 2026-02-26 (목) | 프론트엔드 테크리드, 릴리스 엔지니어 | 릴리스 게이트 리뷰, 잔여 이슈 정리 | 미해결 리스크 허용 범위 판단 |
| 2026-02-27 (금) | FE Lead, QA, DevOps, 릴리스 | M4 게이트 판정/다음 이터레이션 인계 | 체크리스트 완료 로그 및 오픈 이슈 확정 |

### 4.2 병렬 실행 트랙
| 트랙 | 범위 | 담당 역할 중심 | 목표 완료일 |
| --- | --- | --- | --- |
| Track-A | `E-03/F-07` (`T-073~T-084`) | FE Tech Lead + DevOps + QA + 릴리스 | 2026-02-24 |
| Track-B | `E-01/F-01` (`T-001~T-012`) | FE Tech Lead + FE 엔지니어 + QA + 릴리스 | 2026-02-24 |
| Track-C | 통합 검증/릴리스 판단 | QA + 릴리스 + FE Lead | 2026-02-27 |

## 5. 의존성 및 리스크
| 구분 | 내용 | 영향도 | 대응 방안 | 담당 |
| --- | --- | --- | --- | --- |
| 의존성 | `F-02`, `F-03`, `F-04`, `F-10`은 `F-01` 결과물에 의존 | High | `F-01` 범위 고정 후 인터페이스 결정 사항을 즉시 문서화 | FE Lead |
| 의존성 | `F-08`, `F-09`는 `F-07` 완료가 선행 | High | `F-07` 완료 정의에 lint/build/경고 기준과 증적을 포함 | FE Lead |
| 리스크 | PRD 11.3의 과거 빌드 실패 기록(2026-02-09)과 현재 상태(2026-02-15 build/lint 통과) 간 기준선 불일치 | Medium | 계획서 기준으로 최신 검증 결과를 유지하고, 완료 로그에 실제 실행 결과를 남김 | QA |
| 리스크 | `FR-011` 세부 UX 정책이 `TBD`라서 후속 `F-02` 구현 시 재작업 가능 | Medium | 이번 이터레이션 검증 단계에서 정책 선택지와 영향도를 오픈 이슈로 명시 | PM/FE |
| 리스크 | 24개 Task 동시 진행으로 병목 가능 | Medium | UserStory 단위 병렬(정의/구현/검증 트랙 분리)과 중간 점검 게이트 운영 | FE Lead |
| 리스크 | 관측/알람 임계값 정책이 저장소 단위로 미확정(`TBD`) | Low | `prepare` Task에서 임계값 미확정 항목을 명시적 `TBD`로 문서화 | DevOps/QA |

## 6. 완료 기준 (Exit Criteria)
- [x] 커밋 범위의 Task가 모두 체크리스트에서 완료 처리된다.
- [x] 필수 테스트/검증 결과가 통과한다.
- [x] 운영 준비(모니터링/롤백/런북)가 준비된다.
- [x] 미해결 이슈가 릴리스 허용 범위 내로 정리된다.

## 7. 오픈 이슈
- `FR-011`(전체 지역 vs 하위 지역 상호 배타) 세부 UX 정책 확정 필요 (`TBD`)
- 관측/알람 임계값과 소유 팀 정의 필요 (`TBD`)
- `0.1.0-alpha` 게이트에서 요구하는 수동 검증 증적의 저장 위치 표준화 필요 (`TBD`)
