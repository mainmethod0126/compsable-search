# 이터레이션 계획서

## 1. 메타
- 이터레이션명: iteration-05-p2-keyword-model-evolution
- 기간: 2026-04-13 ~ 2026-04-24
- 작성일: 2026-02-15
- 기준 문서:
- PRD.md
- PRD.en.md
- backlog/keyword-input-model-evolution/epic.md
- backlog/keyword-input-model-evolution/keyword-input-interaction-model/feature.md
- backlog/keyword-input-model-evolution/keyword-condition-state-and-chip-integration/feature.md
- backlog/keyword-input-model-evolution/keyword-api-contract-and-consumer-guide/feature.md
- backlog/keyword-input-model-evolution/keyword-input-interaction-model/keyword-input-state-machine-design/userstory.md
- backlog/keyword-input-model-evolution/keyword-input-interaction-model/token-creation-and-normalization-rules/userstory.md
- backlog/keyword-input-model-evolution/keyword-input-interaction-model/keyboard-interaction-ux-definition/userstory.md
- backlog/keyword-input-model-evolution/keyword-condition-state-and-chip-integration/keyword-condition-data-model-linking/userstory.md
- backlog/keyword-input-model-evolution/keyword-condition-state-and-chip-integration/selected-condition-chip-rendering-integration/userstory.md
- backlog/keyword-input-model-evolution/keyword-condition-state-and-chip-integration/combined-state-consistency-validation/userstory.md
- backlog/keyword-input-model-evolution/keyword-api-contract-and-consumer-guide/keyword-public-api-type-finalization/userstory.md
- backlog/keyword-input-model-evolution/keyword-api-contract-and-consumer-guide/consumer-guide-and-example-refinement/userstory.md
- backlog/keyword-input-model-evolution/keyword-api-contract-and-consumer-guide/migration-note-authoring/userstory.md

## 2. 목표
- 비즈니스/사용자 목표:
  - 키워드 입력/토큰/상태/가이드까지 포함한 E-04 범위를 완결해 region+keyword 조합 검색 UX를 제품 수준으로 끌어올린다.
- 기술 목표:
  - F-10에서 키워드 입력 모델(상태 머신/정규화/키보드 UX)을 확정한다.
  - F-11에서 키워드 조건을 기존 selected condition 모델과 통합한다.
  - F-12에서 공개 API 타입/가이드/마이그레이션 문서를 코드와 동기화한다.
- 이번 이터레이션 성공 기준:
  - 포함 범위 Task(T-109~T-144)가 체크리스트에서 근거와 함께 완료 처리된다.
  - F-10/F-11/F-12 수용 기준 핵심 항목이 코드/테스트/문서에서 추적 가능하게 충족된다.

## 3. 범위
### 3.1 포함 범위
| 우선순위 | Epic | Feature | UserStory | Task | 근거 문서 |
| --- | --- | --- | --- | --- | --- |
| P2 | [E-04] | [F-10] | [US-028] | [T-109] 정의한다: 키워드 입력 상태 머신 설계 범위와 수용 기준 | backlog/keyword-input-model-evolution/keyword-input-interaction-model/keyword-input-state-machine-design/define-scope-and-acceptance/task.md |
| P2 | [E-04] | [F-10] | [US-028] | [T-110] 구현한다: 키워드 입력 상태 머신 설계 핵심 시나리오 | backlog/keyword-input-model-evolution/keyword-input-interaction-model/keyword-input-state-machine-design/implement-main-scenario/task.md |
| P2 | [E-04] | [F-10] | [US-028] | [T-111] 검증한다: 키워드 입력 상태 머신 설계 회귀와 실패 시나리오 | backlog/keyword-input-model-evolution/keyword-input-interaction-model/keyword-input-state-machine-design/validate-regression-and-failure-flow/task.md |
| P2 | [E-04] | [F-10] | [US-028] | [T-112] 준비한다: 키워드 입력 상태 머신 설계 관측과 릴리스 운영 | backlog/keyword-input-model-evolution/keyword-input-interaction-model/keyword-input-state-machine-design/prepare-observability-and-rollout/task.md |
| P2 | [E-04] | [F-10] | [US-029] | [T-113] 정의한다: 토큰 생성/정규화 규칙 구현 범위와 수용 기준 | backlog/keyword-input-model-evolution/keyword-input-interaction-model/token-creation-and-normalization-rules/define-scope-and-acceptance/task.md |
| P2 | [E-04] | [F-10] | [US-029] | [T-114] 구현한다: 토큰 생성/정규화 규칙 구현 핵심 시나리오 | backlog/keyword-input-model-evolution/keyword-input-interaction-model/token-creation-and-normalization-rules/implement-main-scenario/task.md |
| P2 | [E-04] | [F-10] | [US-029] | [T-115] 검증한다: 토큰 생성/정규화 규칙 구현 회귀와 실패 시나리오 | backlog/keyword-input-model-evolution/keyword-input-interaction-model/token-creation-and-normalization-rules/validate-regression-and-failure-flow/task.md |
| P2 | [E-04] | [F-10] | [US-029] | [T-116] 준비한다: 토큰 생성/정규화 규칙 구현 관측과 릴리스 운영 | backlog/keyword-input-model-evolution/keyword-input-interaction-model/token-creation-and-normalization-rules/prepare-observability-and-rollout/task.md |
| P2 | [E-04] | [F-10] | [US-030] | [T-117] 정의한다: 키보드 상호작용 UX 정의 범위와 수용 기준 | backlog/keyword-input-model-evolution/keyword-input-interaction-model/keyboard-interaction-ux-definition/define-scope-and-acceptance/task.md |
| P2 | [E-04] | [F-10] | [US-030] | [T-118] 구현한다: 키보드 상호작용 UX 정의 핵심 시나리오 | backlog/keyword-input-model-evolution/keyword-input-interaction-model/keyboard-interaction-ux-definition/implement-main-scenario/task.md |
| P2 | [E-04] | [F-10] | [US-030] | [T-119] 검증한다: 키보드 상호작용 UX 정의 회귀와 실패 시나리오 | backlog/keyword-input-model-evolution/keyword-input-interaction-model/keyboard-interaction-ux-definition/validate-regression-and-failure-flow/task.md |
| P2 | [E-04] | [F-10] | [US-030] | [T-120] 준비한다: 키보드 상호작용 UX 정의 관측과 릴리스 운영 | backlog/keyword-input-model-evolution/keyword-input-interaction-model/keyboard-interaction-ux-definition/prepare-observability-and-rollout/task.md |
| P2 | [E-04] | [F-11] | [US-031] | [T-121] 정의한다: 키워드 조건 데이터 모델 연결 범위와 수용 기준 | backlog/keyword-input-model-evolution/keyword-condition-state-and-chip-integration/keyword-condition-data-model-linking/define-scope-and-acceptance/task.md |
| P2 | [E-04] | [F-11] | [US-031] | [T-122] 구현한다: 키워드 조건 데이터 모델 연결 핵심 시나리오 | backlog/keyword-input-model-evolution/keyword-condition-state-and-chip-integration/keyword-condition-data-model-linking/implement-main-scenario/task.md |
| P2 | [E-04] | [F-11] | [US-031] | [T-123] 검증한다: 키워드 조건 데이터 모델 연결 회귀와 실패 시나리오 | backlog/keyword-input-model-evolution/keyword-condition-state-and-chip-integration/keyword-condition-data-model-linking/validate-regression-and-failure-flow/task.md |
| P2 | [E-04] | [F-11] | [US-031] | [T-124] 준비한다: 키워드 조건 데이터 모델 연결 관측과 릴리스 운영 | backlog/keyword-input-model-evolution/keyword-condition-state-and-chip-integration/keyword-condition-data-model-linking/prepare-observability-and-rollout/task.md |
| P2 | [E-04] | [F-11] | [US-032] | [T-125] 정의한다: 선택 조건 칩 렌더링 통합 범위와 수용 기준 | backlog/keyword-input-model-evolution/keyword-condition-state-and-chip-integration/selected-condition-chip-rendering-integration/define-scope-and-acceptance/task.md |
| P2 | [E-04] | [F-11] | [US-032] | [T-126] 구현한다: 선택 조건 칩 렌더링 통합 핵심 시나리오 | backlog/keyword-input-model-evolution/keyword-condition-state-and-chip-integration/selected-condition-chip-rendering-integration/implement-main-scenario/task.md |
| P2 | [E-04] | [F-11] | [US-032] | [T-127] 검증한다: 선택 조건 칩 렌더링 통합 회귀와 실패 시나리오 | backlog/keyword-input-model-evolution/keyword-condition-state-and-chip-integration/selected-condition-chip-rendering-integration/validate-regression-and-failure-flow/task.md |
| P2 | [E-04] | [F-11] | [US-032] | [T-128] 준비한다: 선택 조건 칩 렌더링 통합 관측과 릴리스 운영 | backlog/keyword-input-model-evolution/keyword-condition-state-and-chip-integration/selected-condition-chip-rendering-integration/prepare-observability-and-rollout/task.md |
| P2 | [E-04] | [F-11] | [US-033] | [T-129] 정의한다: 조합 상태 정합성 검증 범위와 수용 기준 | backlog/keyword-input-model-evolution/keyword-condition-state-and-chip-integration/combined-state-consistency-validation/define-scope-and-acceptance/task.md |
| P2 | [E-04] | [F-11] | [US-033] | [T-130] 구현한다: 조합 상태 정합성 검증 핵심 시나리오 | backlog/keyword-input-model-evolution/keyword-condition-state-and-chip-integration/combined-state-consistency-validation/implement-main-scenario/task.md |
| P2 | [E-04] | [F-11] | [US-033] | [T-131] 검증한다: 조합 상태 정합성 검증 회귀와 실패 시나리오 | backlog/keyword-input-model-evolution/keyword-condition-state-and-chip-integration/combined-state-consistency-validation/validate-regression-and-failure-flow/task.md |
| P2 | [E-04] | [F-11] | [US-033] | [T-132] 준비한다: 조합 상태 정합성 검증 관측과 릴리스 운영 | backlog/keyword-input-model-evolution/keyword-condition-state-and-chip-integration/combined-state-consistency-validation/prepare-observability-and-rollout/task.md |
| P2 | [E-04] | [F-12] | [US-034] | [T-133] 정의한다: 키워드 공개 API 타입 확정 범위와 수용 기준 | backlog/keyword-input-model-evolution/keyword-api-contract-and-consumer-guide/keyword-public-api-type-finalization/define-scope-and-acceptance/task.md |
| P2 | [E-04] | [F-12] | [US-034] | [T-134] 구현한다: 키워드 공개 API 타입 확정 핵심 시나리오 | backlog/keyword-input-model-evolution/keyword-api-contract-and-consumer-guide/keyword-public-api-type-finalization/implement-main-scenario/task.md |
| P2 | [E-04] | [F-12] | [US-034] | [T-135] 검증한다: 키워드 공개 API 타입 확정 회귀와 실패 시나리오 | backlog/keyword-input-model-evolution/keyword-api-contract-and-consumer-guide/keyword-public-api-type-finalization/validate-regression-and-failure-flow/task.md |
| P2 | [E-04] | [F-12] | [US-034] | [T-136] 준비한다: 키워드 공개 API 타입 확정 관측과 릴리스 운영 | backlog/keyword-input-model-evolution/keyword-api-contract-and-consumer-guide/keyword-public-api-type-finalization/prepare-observability-and-rollout/task.md |
| P2 | [E-04] | [F-12] | [US-035] | [T-137] 정의한다: 소비자 가이드와 예제 정비 범위와 수용 기준 | backlog/keyword-input-model-evolution/keyword-api-contract-and-consumer-guide/consumer-guide-and-example-refinement/define-scope-and-acceptance/task.md |
| P2 | [E-04] | [F-12] | [US-035] | [T-138] 작성한다: 소비자 가이드와 예제 정비 핵심 시나리오 | backlog/keyword-input-model-evolution/keyword-api-contract-and-consumer-guide/consumer-guide-and-example-refinement/implement-main-scenario/task.md |
| P2 | [E-04] | [F-12] | [US-035] | [T-139] 검증한다: 소비자 가이드와 예제 정비 회귀와 실패 시나리오 | backlog/keyword-input-model-evolution/keyword-api-contract-and-consumer-guide/consumer-guide-and-example-refinement/validate-regression-and-failure-flow/task.md |
| P2 | [E-04] | [F-12] | [US-035] | [T-140] 준비한다: 소비자 가이드와 예제 정비 관측과 릴리스 운영 | backlog/keyword-input-model-evolution/keyword-api-contract-and-consumer-guide/consumer-guide-and-example-refinement/prepare-observability-and-rollout/task.md |
| P2 | [E-04] | [F-12] | [US-036] | [T-141] 정의한다: 마이그레이션 노트 작성 범위와 수용 기준 | backlog/keyword-input-model-evolution/keyword-api-contract-and-consumer-guide/migration-note-authoring/define-scope-and-acceptance/task.md |
| P2 | [E-04] | [F-12] | [US-036] | [T-142] 작성한다: 마이그레이션 노트 작성 핵심 시나리오 | backlog/keyword-input-model-evolution/keyword-api-contract-and-consumer-guide/migration-note-authoring/implement-main-scenario/task.md |
| P2 | [E-04] | [F-12] | [US-036] | [T-143] 검증한다: 마이그레이션 노트 작성 회귀와 실패 시나리오 | backlog/keyword-input-model-evolution/keyword-api-contract-and-consumer-guide/migration-note-authoring/validate-regression-and-failure-flow/task.md |
| P2 | [E-04] | [F-12] | [US-036] | [T-144] 준비한다: 마이그레이션 노트 작성 관측과 릴리스 운영 | backlog/keyword-input-model-evolution/keyword-api-contract-and-consumer-guide/migration-note-authoring/prepare-observability-and-rollout/task.md |

### 3.2 제외 범위
- E-02/E-03 후속 개선 항목: E-04 완료 후 회귀 결과를 바탕으로 재우선순위화한다.
- 신규 요구사항/실험성 키워드 고급 기능: 본 이터레이션 범위에서 제외한다.

## 4. 일정/마일스톤
- M1: 범위 확정 (2026-04-13)
- M2: 구현 완료 (2026-04-18)
- M3: 검증 완료 (2026-04-22)
- M4: 배포/릴리스 판단 (2026-04-24)

### 4.1 일자별/담당역할별 착수 순서
| 일자 | 담당 역할 | 즉시 착수 Task | 선행/완료 조건 |
| --- | --- | --- | --- |
| 2026-04-13 (월) | 프론트엔드 테크리드 | T-109, T-113, T-117, T-121, T-125, T-129, T-133, T-137, T-141 | 각 UserStory 정의 Task 착수 |
| 2026-04-14 (화) | 프론트엔드 엔지니어 | T-110, T-114, T-118, T-122, T-126, T-134 | F-10/F-11/F-12 구현 트랙 시작 |
| 2026-04-14 (화) | 기술 문서 엔지니어 | T-138, T-142 | T-137, T-141 완료 후 착수 |
| 2026-04-15 (수) | QA 엔지니어 | T-111, T-115, T-119, T-123, T-130 | 구현 완료분 기준 검증/정합성 구현 착수 |
| 2026-04-16 (목) | QA 엔지니어 | T-127, T-131, T-135, T-139, T-143 | F-11/F-12 검증 트랙 확대 |
| 2026-04-17 (금) | 릴리스 엔지니어 | T-112, T-116, T-120, T-124, T-128, T-132 | F-10/F-11 운영 준비 |
| 2026-04-20 (월) | 릴리스 엔지니어 | T-136, T-140, T-144 | F-12 운영 준비 |
| 2026-04-21 (화) | QA 엔지니어, 릴리스 엔지니어 | 통합 회귀/문서-구현 정합성 점검 | 실패 케이스 재검증 포함 |
| 2026-04-23 (목) | 프론트엔드 테크리드, 릴리스 엔지니어 | 릴리스 게이트 리뷰/오픈 이슈 정리 | 다음 릴리스 입력 조건 확정 |
| 2026-04-24 (금) | FE Lead, QA, 릴리스 | M4 게이트 판정/다음 이터레이션 인계 | 완료 로그/증적 정리 |

### 4.2 병렬 실행 트랙
| 트랙 | 범위 | 담당 역할 중심 | 목표 완료일 |
| --- | --- | --- | --- |
| Track-A | E-04/F-10 (T-109~T-120) | FE Tech Lead + FE 엔지니어 + QA + 릴리스 | 2026-04-17 |
| Track-B | E-04/F-11 (T-121~T-132) | FE Tech Lead + FE 엔지니어 + QA + 릴리스 | 2026-04-18 |
| Track-C | E-04/F-12 (T-133~T-144) | FE Tech Lead + FE 엔지니어 + 기술 문서 + QA + 릴리스 | 2026-04-20 |
| Track-D | 통합 검증/릴리스 판단 | QA + 릴리스 + FE Lead | 2026-04-24 |

## 5. 의존성 및 리스크
| 구분 | 내용 | 영향도 | 대응 방안 | 담당 |
| --- | --- | --- | --- | --- |
| 의존성 | F-11은 F-10 결과(입력 모델/토큰 규칙)에 의존 | High | F-10 핵심 구현 완료를 F-11 검증 착수 게이트로 설정 | FE Lead |
| 의존성 | F-12는 F-10/F-11/F-06 완료 산출물에 의존 | High | API 타입/가이드 작업을 코드 변경과 동기화 리뷰로 묶어 진행 | FE Lead/기술 문서 |
| 리스크 | 키워드/지역 조합 상태 충돌로 onChange payload 불일치 가능 | Medium | T-130/T-131에 조합 상태 검증 시나리오 고정 | QA |
| 리스크 | 문서-구현 불일치 재발 가능 | Medium | T-138/T-139/T-142/T-143 완료 조건에 샘플 실행 검증 포함 | 기술 문서/QA |
| 리스크 | 입력 UX(키보드/정규화) 정책 미합의로 재작업 가능 | Medium | T-109/T-113/T-117 정의 단계에서 정책 명시 및 승인 로그 남김 | FE Tech Lead |

## 6. 완료 기준 (Exit Criteria)
- [ ] 커밋 범위의 Task가 모두 체크리스트에서 완료 처리된다.
- [ ] 필수 테스트/검증 결과가 통과한다.
- [ ] 운영 준비(모니터링/롤백/런북)가 준비된다.
- [ ] 미해결 이슈가 릴리스 허용 범위 내로 정리된다.

## 7. 오픈 이슈
- 0.2.0 최소 UX 범위(단순 입력 vs 자동완성) 최종 결정 (TBD)
- 키워드 조건 대량 입력 성능 기준(토큰 수 한계) 확정 (TBD)
- E-04 완료 후 릴리스 버전 정책(0.2.0 여부) 결정 (TBD)
