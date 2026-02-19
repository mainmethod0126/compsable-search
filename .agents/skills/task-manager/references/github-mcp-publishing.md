# GitHub MCP 게시 가이드

## 1. 전제 조건

- GitHub MCP 서버가 현재 세션에서 사용 가능해야 한다.
- 대상 저장소(`owner/repo`)와 이슈 생성 권한이 확인되어야 한다.
- 미정 정보(라벨 정책, 마일스톤, 프로젝트 필드)는 `TBD`로 남기고 임의 추정하지 않는다.

## 2. 이슈 계층 모델

- Epic: 최상위 사용자 가치 단위. Feature 이슈를 하위로 연결한다.
- Feature: Epic을 구현 가능한 기능 단위로 쪼갠다. UserStory 이슈를 하위로 연결한다.
- UserStory: 사용자 시나리오 단위다. Task 이슈를 하위로 연결한다.
- Task: 단일 담당자가 완료 가능한 실행 단위다. 반드시 UserStory 하위로 연결한다.

## 3. 필수 라벨 체계

| 라벨 축 | 값 |
|---|---|
| `계층` | `epic`, `feature`, `userstory`, `task` |
| `priority` | `priority:p0`, `priority:p1`, `priority:p2` |
| `area` | `area:product`, `area:backend`, `area:frontend`, `area:data`, `area:infra`, `area:security`, `area:test`, `area:ops` |

- 최소 라벨: `계층 라벨 1개` + `priority:*` + `area:*` 1개 이상
- 조직 표준 라벨이 있으면 우선 적용하고, 충돌 시 `TBD`를 남긴다.
- 계층 대칭 라벨 규칙
  - Epic 이슈 -> `epic`
  - Feature 이슈 -> `feature`
  - UserStory 이슈 -> `userstory`
  - Task 이슈 -> `task`
  - 하나의 이슈에 계층 라벨을 2개 이상 붙이면 실패로 간주한다.

## 4. 등록 순서

1. Epic 이슈를 먼저 생성한다.
2. Feature 이슈를 생성하며 상위 Epic 링크를 본문에 기록한다.
3. UserStory 이슈를 생성하며 상위 Feature 링크를 본문에 기록한다.
4. Task 이슈를 생성하며 상위 UserStory 링크와 선행 Task 링크를 본문에 기록한다.
5. 생성된 URL/번호를 대응되는 `epic.md`/`feature.md`/`userstory.md`/`task.md`에 즉시 반영한다.
6. Epic/Feature/UserStory 본문에 하위 이슈 체크리스트를 추가해 탐색 비용을 줄인다.

## 5. 제목 규칙

- Epic: `[E-xx] {Epic 이름}`
- Feature: `[F-xx] {Feature 이름}`
- UserStory: `[US-xxx] {UserStory 이름}`
- Task: `[T-xxx] {동사로 시작하는 Task 제목}`

ID와 이름은 문서와 GitHub에서 동일하게 유지한다.

## 6. 본문 템플릿

```markdown
## 배경
- 문제:
- 사용자 가치/KPI:

## 범위
- 포함:
- 제외:

## 수용 기준
- [ ] ...

## 의존성
- 상위: #123
- 선행: #124, #130

## 완료 조건(DoD)
- [ ] 산출물
- [ ] 검증(테스트/지표/리뷰)
```

## 7. 실패 처리

- 일부 이슈 생성 실패 시 성공/실패 목록을 분리 기록한다.
- 실패한 항목은 대응 문서(`epic.md`/`feature.md`/`userstory.md`/`task.md`)에 `TBD(실패 원인)`으로 남긴다.
- 재시도 전 권한/레이트리밋/필수 필드 누락 여부를 먼저 점검한다.

## 8. MCP 미사용 시 대체

- GitHub MCP가 없으면 `backlog/` 문서 산출까지만 완료한다.
- 후속 업로드를 위해 Epic/Feature/UserStory/Task별 제목, 본문, 라벨 후보를 문서에 포함한다.
