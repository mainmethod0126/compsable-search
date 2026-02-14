---
name: iteration-master
description: PRD와 백로그(Epic/Feature/UserStory/Task)를 분석해 이터레이션(스프린트) 계획과 실행 체크리스트를 생성/갱신한다. `PRD.md`, `PRD.en.md`, `backlog/**/epic.md|feature.md|userstory.md|task.md`를 근거로 범위, 우선순위, 의존성, 완료 조건을 정리해야 할 때 사용한다. 작업 완료 시 체크리스트를 `[ ]`에서 `[x]`로 갱신하고 완료 근거를 기록하는 운영이 필요할 때도 사용한다.
---

# Iteration Master 스킬

## 목적

- PRD와 백로그를 근거로 실행 가능한 이터레이션 계획을 만든다.
- 작업자 실행용 체크리스트를 만들고, 완료 시점에 체크 상태와 근거를 갱신한다.

## 입력 확인

1. 아래 문서를 우선 수집한다.
- `PRD.md`
- `PRD.en.md`
- `backlog/**/epic.md`
- `backlog/**/feature.md`
- `backlog/**/userstory.md`
- `backlog/**/task.md`
2. 기존 이터레이션 문서가 있으면 함께 수집한다.
- `iterations/**/iteration-plan.md`
- `iterations/**/checklist.md`
3. 누락 문서는 추측하지 말고 `TBD`로 남긴다.

## 워크플로

### 1) 이터레이션 후보 범위 선정

- PRD의 목표/수용 기준과 백로그의 `P0/P1`, 의존성, 리스크를 기준으로 후보를 고른다.
- 계층 추적성을 유지한다.
- `Epic -> Feature -> UserStory -> Task` 연결이 끊기지 않게 한다.
- 이터레이션에 넣는 각 항목은 원본 경로를 기록한다.

### 2) 실행 가능성 검토

- 작업량이 과한 경우 범위를 조정한다.
- 선행조건이 미완료인 Task는 차단 상태로 분리한다.
- 병렬 가능 작업과 순차 작업을 구분한다.
- 테스트/검증/운영 준비 Task가 빠지지 않게 보정한다.

### 3) 계획서 생성/갱신

- 계획서는 `references/iteration-plan-template.md` 형식을 사용한다.
- 기본 경로는 아래 규칙을 따른다.
- `iterations/{iteration-name}/iteration-plan.md`
- `{iteration-name}`은 소문자 `kebab-case`를 사용한다.
- 계획서에는 최소한 아래를 포함한다.
- 이터레이션 목표와 기간
- 포함/제외 범위
- 커밋된 UserStory/Task 목록과 우선순위
- 의존성, 리스크, 대응책
- 완료 기준(Exit Criteria)

### 4) 체크리스트 생성/갱신

- 체크리스트는 `references/iteration-checklist-template.md` 형식을 사용한다.
- 기본 경로는 아래 규칙을 따른다.
- `iterations/{iteration-name}/checklist.md`
- 각 체크 항목은 실행 가능 단위로 작성한다.
- 원본 Task ID와 문서 경로를 함께 적는다.
- 완료 처리 규칙:
- 작업 전: `- [ ]`
- 작업 완료: `- [x]`
- 완료 시 각 항목 끝에 완료일과 근거를 추가한다.
- 예시: `- [x] [T-018] ... (완료: 2026-02-14, 근거: npm run build 통과)`
- 이미 완료한 항목은 삭제하지 않는다.

### 5) 진행률 반영

- 체크리스트 진행률을 문서 상단에 숫자로 갱신한다.
- 계산식: `완료 항목 수 / 전체 항목 수 * 100`
- 범위 변경 시 계획서와 체크리스트를 동시에 갱신한다.

## 출력 규격

1. 이터레이션 계획서
- 파일: `iterations/{iteration-name}/iteration-plan.md`
- 필수 섹션:
- 메타(이름, 기간, 작성일, 기준 문서)
- 목표
- 포함 범위(UserStory/Task 매핑)
- 제외 범위
- 일정/마일스톤
- 리스크 및 대응
- 완료 기준(Exit Criteria)

2. 이터레이션 체크리스트
- 파일: `iterations/{iteration-name}/checklist.md`
- 필수 섹션:
- 진행률
- 착수 준비
- 구현
- 검증
- 배포/운영
- 완료 로그

## 체크리스트 상태 갱신 규칙

- 완료 요청을 받으면 해당 항목만 `[x]`로 변경한다.
- 완료 근거가 없으면 항목을 완료 처리하지 않는다.
- 근거 예시: 테스트 통과, PR 링크, 리뷰 승인, 배포 확인 로그.
- 차단 상태는 `- [ ]`를 유지하고 항목 끝에 `(차단: 사유)`를 추가한다.

## 참조 파일

- 계획서 템플릿: `references/iteration-plan-template.md`
- 체크리스트 템플릿: `references/iteration-checklist-template.md`
