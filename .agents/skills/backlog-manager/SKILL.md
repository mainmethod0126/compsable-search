---
name: backlog-manager
description: PRD 문서를 실행 가능한 개발 백로그로 전환한다. `prd.md`/`prd.en.md` 또는 동등한 요구사항 문서를 입력으로 받아 Epic, Feature, UserStory, Task로 계층 분해하고 우선순위, 의존성, 수용 기준, 완료 정의, 리스크 완화 작업까지 명시한다. 결과물을 Epic/Feature/UserStory/Task 디렉토리+`.md` 계층으로 생성해야 할 때 사용한다. UI/UX 관련 요구가 포함되면 기능 구현 전에 UI/UX 선행 백로그(와이어프레임, 프로토타입, 사용성 검증, 디자인 핸드오프)를 포함해야 할 때 사용한다. GitHub MCP를 사용할 수 있으면 Epic/Feature/UserStory/Task를 GitHub 이슈 계층으로 등록하고 링크/라벨/추적성을 유지해야 할 때 사용한다.
---

# Backlog Manager 스킬

## 목적

- PRD의 문제 정의와 사용자 가치를 기준으로 구현 단위를 재구성한다.
- 각 Feature를 독립적으로 배포 가능한 Task 묶음으로 분해한다.
- 각 Feature를 사용자 가치 단위 UserStory로 분해하고 Task는 UserStory 하위로 배치한다.
- UI/UX 관련 Feature는 기능 구현 전에 UI/UX만 다루는 선행 UserStory/Task를 포함한다.
- 기능 구현 외에 아키텍처, 데이터, 보안, 운영, 테스트, 롤아웃 작업을 누락 없이 포함한다.
- Epic/Feature/UserStory/Task를 디렉토리 계층과 문서(`epic.md`, `feature.md`, `userstory.md`, `task.md`)로 생성한다.
- GitHub MCP가 사용 가능한 경우 백로그를 GitHub 이슈로 일관되게 등록한다.

## 배경지식 기준

- Distinguished Engineer 수준의 실무 맥락을 기본값으로 적용한다.
- 분해 시 다음 관점을 항상 적용한다: 시스템 경계, 장애 모드, 성능 병목, 데이터 정합성, 보안/규제, 운영 자동화, 관측 가능성, 배포/롤백 전략.
- 모호한 요구사항은 추측하지 말고 `TBD`와 확인 질문으로 남긴다.

## 입력 확인

1. PRD에서 목표 사용자, 핵심 시나리오, 성공 지표(KPI), 범위/제약을 추출한다.
2. 비기능 요구(성능, 보안, 가용성, 비용)를 식별하고 누락 시 `TBD`로 표기한다.
3. 외부 연동, 데이터 스키마 변경, 마이그레이션 필요 여부를 식별한다.
4. UI/UX 영향 여부를 식별한다. 화면/정보구조/사용자 플로우/상호작용/카피/접근성 변경이 있으면 `UI/UX 관련 Feature`로 분류한다.
5. GitHub MCP 사용 가능 여부와 대상 저장소(`owner/repo`), 기본 라벨/마일스톤/프로젝트 필드를 확인한다. 미확정 값은 `TBD`로 남긴다.

## 작업 절차

1. `references/prd-to-backlog-template.md` 형식으로 Epic/Feature/UserStory/Task 초안을 작성한다.
2. 각 Epic을 사용자 가치 단위 Feature로 분해한다.
3. 각 Feature를 `UI/UX 관련` 여부로 분류한다.
   - UI/UX 관련 Feature면 기능 구현 UserStory보다 먼저 `UI/UX 선행 UserStory`를 생성한다.
   - UI/UX 선행 UserStory는 화면 구조, 사용자 플로우, 상호작용, 접근성, 카피 기준 확정을 목표로 한다.
4. 각 Feature를 사용자 관점 UserStory로 분해한다.
5. 각 UserStory를 Task로 분해한다.
   - Task는 1명의 담당자가 소유 가능한 크기로 작성한다.
   - Task는 동사로 시작하고 결과물이 검증 가능해야 한다.
   - Task마다 `유형`(제품/디자인/UIUX/백엔드/프론트엔드/데이터/인프라/보안/테스트/운영)과 `선행조건`을 기록한다.
   - UI/UX 선행 UserStory에는 최소 다음 Task를 포함한다.
     - 와이어프레임 또는 시안 작성
     - 클릭 가능한 프로토타입 제작
     - 사용성 검증(인터뷰/UT)과 개선 반영
     - 디자인 확정/핸드오프(컴포넌트 규격, 상태 정의, 카피, 접근성 기준) 문서화
   - 기능 구현 Task의 `선행조건`에는 `디자인 확정/핸드오프` Task ID를 명시한다.
6. `references/de-checklist.md`를 사용해 누락 작업을 보완한다.
7. 우선순위를 지정한다.
   - `P0`: 출시 차단 항목
   - `P1`: MVP 필수
   - `P2`: 출시 후 가능
8. 실행 순서를 정리한다.
   - UI/UX 선행 -> 기능 구현 -> 통합/검증 -> 출시/모니터링 순으로 배치한다.
9. 각 Task에 완료 조건을 작성한다.
   - 산출물
   - 검증 방법(테스트/지표/리뷰)
   - 완료 정의(Definition of Done)
10. `references/backlog-directory-template.md` 규칙으로 디렉토리 산출물을 생성/갱신한다.
   - 루트 디렉토리: `backlog/`
   - Epic 디렉토리: `backlog/{epic-title-en}/epic.md`
   - Feature 디렉토리: `backlog/{epic-title-en}/{feature-title-en}/feature.md`
   - UserStory 디렉토리: `backlog/{epic-title-en}/{feature-title-en}/{userstory-title-en}/userstory.md`
   - Task 디렉토리: `backlog/{epic-title-en}/{feature-title-en}/{userstory-title-en}/{task-title-en}/task.md`
   - 디렉토리명은 반드시 영문 소문자 슬러그(`kebab-case`)를 사용한다.
   - 허용 문자 집합은 `[a-z0-9-]`만 사용한다.
   - 한국어 제목은 의미를 보존해 영어로 번역한 뒤 슬러그로 변환한다.
   - 경로에 사용할 수 없는 문자(`\ / : * ? " < > |`) 및 공백은 `-`로 치환한다.
   - 동일 계층에서 제목 충돌 시 디렉토리명 뒤에 `__{ID}`를 붙여 고유성을 보장한다.
11. GitHub MCP가 가능하면 `references/github-mcp-publishing.md` 규칙으로 게시 계획을 수립한다.
12. Epic -> Feature -> UserStory -> Task 순서로 이슈를 등록한다.
   - 제목에 안정 ID(`[E-01]`, `[F-03]`, `[US-010]`, `[T-014]`)를 유지한다.
   - 백로그 계층과 대칭되는 라벨(`epic`, `feature`, `userstory`, `task`)을 이슈 유형에 맞게 정확히 1개 지정한다.
   - 라벨은 최소 `epic|feature|userstory|task` + `priority:*` + `area:*`를 지정한다.
   - UI/UX 선행 Task에는 `area:uiux`를 적용한다.
   - 본문에 상위/하위/선행 이슈 링크를 기록한다.
13. 등록 결과를 산출물에 반영한다.
   - 각 Epic/Feature/UserStory/Task 문서에 GitHub 이슈 번호와 URL을 기록한다.
   - 등록 실패 항목은 원인과 재시도 계획을 `TBD`로 남긴다.

## 출력 규격

- 기본 산출물
  - `backlog/` 디렉토리 계층(디렉토리명은 영어, 문서 본문은 한국어)
- 선택 산출물
  - `backlog/index.md`(요약 문서, 요청 시에만 생성)
- 기존 산출물이 있으면 변경된 Epic/Feature/UserStory/Task 중심으로 갱신한다.
- 디렉토리 산출물 최소 조건
  - Epic마다 `backlog/{epic-title-en}/epic.md`가 존재한다.
  - Feature마다 `backlog/{epic-title-en}/{feature-title-en}/feature.md`가 존재한다.
  - UserStory마다 `backlog/{epic-title-en}/{feature-title-en}/{userstory-title-en}/userstory.md`가 존재한다.
  - Task마다 `backlog/{epic-title-en}/{feature-title-en}/{userstory-title-en}/{task-title-en}/task.md`가 존재한다.
- `backlog/index.md`를 생성하는 경우 섹션 순서를 유지한다.
  1. 문서 메타(버전, 기준 PRD, 작성일)
  2. Epic 개요
  3. Feature 목록
  4. UserStory 목록
  5. Task 백로그
  6. 의존성 그래프(텍스트)
  7. 리스크와 완화 계획
  8. 오픈 이슈(`TBD`)
  9. GitHub 등록 매핑(선택)
  10. 디렉토리 산출물 매핑

## 품질 게이트

- Epic마다 KPI 또는 사용자 결과와의 연결을 명시한다.
- Feature마다 최소 1개 이상의 수용 기준을 작성한다.
- UserStory마다 최소 1개 이상의 사용자 관점 수용 기준을 작성한다.
- Task마다 담당 역할, 우선순위, 예상 난이도(High/Medium/Low), 검증 방법을 작성한다.
- UI/UX 관련 Feature는 `UI/UX 선행 UserStory`와 `디자인 확정/핸드오프 Task`가 없으면 실패로 간주한다.
- UI/UX 관련 기능 구현 Task가 `디자인 확정/핸드오프 Task`를 선행조건으로 갖지 않으면 실패로 간주한다.
- 운영 준비 항목(관측, 알람, 롤백, 런북) 중 누락이 있으면 완료로 간주하지 않는다.
- Epic/Feature/UserStory/Task 모든 항목이 디렉토리+`.md` 문서로 1:1 매핑되어야 한다.
- 각 `epic.md`/`feature.md`/`userstory.md`/`task.md`는 상위/하위 문서 상대 경로를 포함해야 한다.
- GitHub MCP 사용 시 Epic/Feature/UserStory/Task 모두 이슈 URL이 누락 없이 연결되어야 한다.
- GitHub MCP 사용 시 이슈 계층 라벨(`epic`,`feature`,`userstory`,`task`)과 문서 계층이 불일치하면 실패로 간주한다.

## 참조 문서

- 템플릿이 필요하면 `references/prd-to-backlog-template.md`를 먼저 읽는다.
- 누락 점검이 필요하면 `references/de-checklist.md`를 읽는다.
- 디렉토리 문서 템플릿이 필요하면 `references/backlog-directory-template.md`를 읽는다.
- GitHub 등록이 필요하면 `references/github-mcp-publishing.md`를 읽는다.
