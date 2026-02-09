---
name: git-manager
description: 이 저장소에서 Git 변경사항을 분석해 브랜치 이름과 커밋 메시지를 생성한다. 기본적으로 `project-commander`의 선행 트리아지 후 배정된 요청을 처리하며, 사용자가 브랜치 네이밍, 커밋 메시지 작성, 변경 요약, 커밋 분할 기준 정리, 릴리스용 변경 로그 초안을 요청할 때 사용한다.
---

# Git 매니저 스킬

## 진입 정책을 적용한다

- 모든 처리 요청은 `project-commander`를 통해 시작하는 것을 기본 규칙으로 둔다.
- 이 스킬은 `project-commander`가 배정한 작업을 우선 처리한다.
- 사용자가 이 스킬을 직접 지정하면 즉시 처리하되, 필요 시 목표/범위/완료 조건을 먼저 확인한다.

## 다음 워크플로를 수행한다

1. 요청에서 목표를 식별한다(브랜치명 제안, 커밋 메시지 제안, 커밋 분할, 변경 요약).
2. 현재 Git 상태를 확인한다(`git status --short --branch`).
3. 변경 파일과 diff를 확인한다(`git diff --name-status`, `git diff --staged --name-status`).
4. 변경 성격을 분류한다(`feat`/`fix`/`refactor`/`docs`/`test`/`chore`/`ci`/`perf`).
5. 규칙에 맞는 브랜치 이름과 커밋 메시지 후보를 생성한다.
6. 결과를 근거(핵심 파일, 영향 범위, 위험 요소)와 함께 제시한다.

다음 파일을 먼저 읽는다:
- `package.json`
- `PRD.md`
- `PRD.en.md`
- 구현 영향이 있는 경우 변경된 `src/` 하위 파일

필요하면 다음 참조 파일을 읽는다:
- `references/branch-naming-rules.md`
- `references/commit-message-template.md`
- `references/git-review-checklist.md`

## 브랜치 네이밍 규칙을 적용한다

- 기본 형식은 `references/branch-naming-rules.md`를 따른다.
- 브랜치 타입은 변경의 주목적 기준으로 선택한다(`feature`, `fix`, `refactor`, `docs`, `chore`, `release`).
- 브랜치 이름은 소문자 kebab-case로 작성한다.
- 이슈 번호가 있으면 접두사로 포함한다(예: `feature/123-search-filter-ui`).
- 의미 없는 단어(`update`, `misc`, `temp`)를 단독 요약으로 사용하지 않는다.

## 커밋 메시지 규칙을 적용한다

- 기본 형식은 Conventional Commits를 사용한다.
- 제목 형식은 `<type>(<scope>): <summary>`를 우선한다.
- 제목(summary)은 영어 명령형으로 작성하고 72자 이내를 유지한다.
- 본문은 필요한 경우에만 작성하고 `Why`/`What`/`Impact` 중심으로 요약한다.
- 호환성 깨짐이 있으면 `BREAKING CHANGE:`를 footer에 명시한다.

## 커밋 분할 규칙을 적용한다

- 목적이 다른 변경(기능/리팩터링/포맷/문서)은 분리 커밋을 우선한다.
- 자동 포맷 변경과 기능 변경이 섞이면 분리 후보를 제시한다.
- staged/unstaged가 섞여 있으면 각각에 대한 메시지 후보를 구분해 제시한다.

## 출력 형식을 고정한다

- 결과에 다음 항목을 포함한다:
  - 변경 요약(파일 단위)
  - 브랜치 이름 후보(2~3개)
  - 커밋 메시지 후보(최소 2개)
  - 커밋 분할 제안(필요 시)
- 변경이 없거나 Git 저장소가 아니면 그 사실을 먼저 명시한다.

## 결과 체크리스트

- 브랜치 후보가 네이밍 규칙을 충족하는가
- 커밋 제목이 Conventional Commit 형식을 충족하는가
- 메시지와 실제 변경 파일의 의미가 일치하는가
- 분할 제안이 있으면 각 커밋의 목적이 독립적인가
