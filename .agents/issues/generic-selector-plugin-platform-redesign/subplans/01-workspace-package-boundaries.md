# [E-01] Workspace와 패키지 경계 재구성

## 문서 메타
- 이슈 제목: `Generic Selector/Plugin 플랫폼 전면 재설계`
- 하위 플랜: `E-01 Workspace와 패키지 경계 재구성`
- 이슈 소스: `사용자 요청`
- 기준일: `2026-03-07`
- 상태: `Final`
- 출력 경로: `.agents/issues/generic-selector-plugin-platform-redesign/subplans/01-workspace-package-boundaries.md`
- Task 구간: `001-008`

## 상위 계획과의 연결
- 상위 인덱스 문서: [../plan.md](../plan.md)
- 이 Epic의 역할: monorepo workspace, publishable package, build/test/lint/pack 체인을 먼저 고정해 이후 Epic의 구현 기반을 만든다.
- 선행 Epic: 없음
- 후속 Epic:
  - `E-02`는 이 Epic과 병렬 일부 가능하지만 package topology가 나오면 즉시 그 구조를 따른다.
  - `E-05`, `E-06`는 이 Epic의 산출물을 공식 truth source로 사용한다.

## 이번 Epic의 목표 / 비목표
### 목표
- 루트 저장소를 `private + workspaces` 기준으로 재구성한다.
- `packages/core`, `packages/react`, `packages/selector-region`, `packages/selector-keyword`, `apps/demo`의 빌드/배포 경계를 명시한다.
- workspace 전체에 대해 `lint/test/build/pack`이 반복 가능하게 동작하는 검증 체인을 만든다.

### 비목표
- core/react/selector package 내부 로직 구현
- 공개 타입 정책 변경
- 문서 전면 교체와 release 운영 문서 작성

## 선행조건 / 병렬 가능 작업
### 선행조건
- 없음

### 병렬 가능 작업
- `F-01.2`는 `F-01.1`의 기본 workspace 스캐폴드가 나온 뒤 병렬화할 수 있다.
- 상위 계획 기준으로 `E-02/F-02.1`과 병렬 진행 가능하다.

## Feature/UserStory/Task 실행 계획
### [F-01.1] 루트 workspace 전환
| UserStory | Task ID | 실행 항목 | 산출물 | 검증 |
| --- | --- | --- | --- | --- |
| `US-01.1` 루트 오케스트레이션 정의 | `T-001` | 루트 `package.json`을 `private + workspaces` 구조로 전환하고 aggregate `lint/test/build/pack` 스크립트를 정의한다. | 루트 workspace manifest, 공통 스크립트 계약 | 루트에서 workspace 전체 스크립트가 경로 하드코딩 없이 실행 가능해야 한다. |
| `US-01.1` 루트 오케스트레이션 정의 | `T-002` | 루트 `tsconfig`/vite 설정을 orchestration 전용으로 축소하고 package references를 정리한다. | 루트 TypeScript/vite orchestration 설정 | 패키지별 build graph가 루트 설정에서 참조 가능하고 앱 설정과 라이브러리 설정이 섞이지 않아야 한다. |
| `US-01.2` publishable package 스캐폴드 구축 | `T-003` | `packages/core`, `packages/react`, `packages/selector-region`, `packages/selector-keyword`의 `package.json`, `exports`, `types`, `build` 설정을 만든다. | 각 package의 publishable manifest와 build entry | 각 패키지가 독립적으로 이름, 엔트리, 타입, 빌드 출력을 설명해야 한다. |
| `US-01.2` publishable package 스캐폴드 구축 | `T-004` | 현재 root 앱 엔트리를 `apps/demo`로 이동하고 demo용 `vite.config.ts`와 앱 엔트리를 독립화한다. | demo 앱 엔트리, demo 전용 Vite 설정 | demo가 루트 앱 엔트리에 의존하지 않고 별도 앱으로 실행 가능해야 한다. |

### [F-01.2] 패키지 빌드/검증 체인
| UserStory | Task ID | 실행 항목 | 산출물 | 검증 |
| --- | --- | --- | --- | --- |
| `US-01.3` 패키지별 산출물 계약 | `T-005` | 각 패키지에 `build`, `test`, `lint`, `typecheck` 스크립트를 정의한다. | package별 검증 스크립트 계약 | 각 패키지가 동일한 명령 체계를 갖고 루트에서 집계 호출 가능해야 한다. |
| `US-01.3` 패키지별 산출물 계약 | `T-006` | 루트에서 workspace 전체 명령이 순차 실행되도록 CI용 스크립트를 고정한다. | CI/로컬 공용 aggregate 스크립트 | 루트 명령 한 번으로 package별 검증이 예측 가능한 순서로 수행돼야 한다. |
| `US-01.4` 배포 산출물 smoke 준비 | `T-007` | `npm pack --workspaces` smoke를 추가하고 tarball 산출물 검사 스크립트를 정의한다. | pack smoke 명령과 tarball 검사 규칙 | workspace tarball 생성과 기본 검사가 자동화돼야 한다. |
| `US-01.4` 배포 산출물 smoke 준비 | `T-008` | package별 ESM/CJS/d.ts/style export 존재 여부를 자동 검증한다. | export smoke 검증 스크립트 | 모든 publishable package가 예상 export surface를 실제로 제공해야 한다. |

## 완료 조건(DoD)
- 루트가 workspace 기준 저장소로 동작한다.
- publishable package 4개와 demo 앱 1개의 역할이 manifest와 디렉토리 구조에서 드러난다.
- `lint/test/build/pack` 검증 체인이 workspace 전체 기준으로 재현 가능하다.
- 이후 Epic이 더 이상 root monolith 엔트리를 기준으로 설계하지 않아도 된다.

## 테스트 및 검증
### Unit
- package manifest와 exports 경로 정합성 정적 검증

### Integration
- workspace 루트에서 package별 `build/test/lint/typecheck` 집계 실행
- `apps/demo` 독립 실행/빌드 검증

### Regression
- 기존 루트 진입점이 남아 있더라도 새 workspace 경로가 canonical임을 확인
- `npm pack --workspaces` 결과물에 누락된 엔트리가 없는지 검사

## 리스크 / 차단요인 / 인계 조건
### 리스크 / 차단요인
| ID | 리스크/차단요인 | 영향 | 완화 방안 |
| --- | --- | --- | --- |
| `R-01` | 루트 설정과 package 설정이 중복돼 build graph가 꼬일 수 있음 | 이후 Epic의 빌드 실패 | 루트는 orchestration 전용, package는 publish/build 전용으로 역할을 분리한다. |
| `R-02` | demo가 root source import를 계속 사용하면 package 검증이 무력화됨 | `E-05`, `E-06` 게이트 실패 | demo 엔트리 이동과 package-only import 전환을 같은 Epic에서 잠근다. |
| `R-03` | `npm pack --workspaces` smoke가 없으면 배포 전 누락이 늦게 발견됨 | RC 단계 차단 | pack smoke와 tarball 검사 스크립트를 이 Epic에서 미리 추가한다. |

### 인계 조건
- `E-02`는 workspace 경로와 package 이름을 이 문서 기준으로만 사용한다.
- `E-05`는 demo가 workspace package-only 소비 모델이라는 전제를 이 문서 산출물에 의존한다.
- `E-06`는 이 Epic에서 정의한 `pack/export` 검증 체인을 release gate에 그대로 승계한다.
