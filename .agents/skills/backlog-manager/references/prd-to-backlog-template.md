# PRD -> Epic/Feature/UserStory/Task 요약 템플릿 (선택)

> 이 문서는 선택 산출물 `backlog/index.md`가 필요할 때만 사용한다.

## 1. 문서 메타

- 기준 PRD: `[파일명 또는 버전]`
- 작성일: `YYYY-MM-DD`
- 작성자/검토자: `[역할]`
- 릴리스 목표일: `YYYY-MM-DD` 또는 `TBD`
- 대상 저장소: `owner/repo` 또는 `TBD`

## 2. Epic 개요

| Epic ID | Epic 이름 | 해결하려는 문제 | KPI/성공지표 | 우선순위 | 문서 경로 | GitHub Issue |
|---|---|---|---|---|---|---|
| E-01 |  |  |  | P0/P1/P2 | `backlog/{epic-title-en}/epic.md` | `#번호` 또는 `TBD` |
| E-02 |  |  |  | P0/P1/P2 | `backlog/{epic-title-en}/epic.md` | `#번호` 또는 `TBD` |

## 3. Feature 목록

| Feature ID | Epic ID | Feature 이름 | 사용자 가치 | 수용 기준(요약) | 우선순위 | 문서 경로 | GitHub Issue |
|---|---|---|---|---|---|---|---|
| F-01 | E-01 |  |  |  | P0/P1/P2 | `backlog/{epic-title-en}/{feature-title-en}/feature.md` | `#번호` 또는 `TBD` |
| F-02 | E-01 |  |  |  | P0/P1/P2 | `backlog/{epic-title-en}/{feature-title-en}/feature.md` | `#번호` 또는 `TBD` |

## 4. UserStory 목록

| UserStory ID | Feature ID | UserStory 이름 | 사용자 시나리오 | 수용 기준(요약) | 우선순위 | 문서 경로 | GitHub Issue |
|---|---|---|---|---|---|---|---|
| US-001 | F-01 |  | As a ... I want ... so that ... |  | P0/P1/P2 | `backlog/{epic-title-en}/{feature-title-en}/{userstory-title-en}/userstory.md` | `#번호` 또는 `TBD` |
| US-002 | F-01 |  | As a ... I want ... so that ... |  | P0/P1/P2 | `backlog/{epic-title-en}/{feature-title-en}/{userstory-title-en}/userstory.md` | `#번호` 또는 `TBD` |

## 5. Task 백로그

| Task ID | UserStory ID | 제목(동사 시작) | 유형 | 담당 역할 | 우선순위 | 난이도 | 선행조건 | 검증 방법 | 완료 정의(DoD) | 문서 경로 | GitHub Issue |
|---|---|---|---|---|---|---|---|---|---|---|---|
| T-001 | US-001 |  | 제품/디자인/UIUX/백엔드/프론트엔드/데이터/인프라/보안/테스트/운영 |  | P0/P1/P2 | H/M/L |  |  |  | `backlog/{epic-title-en}/{feature-title-en}/{userstory-title-en}/{task-title-en}/task.md` | `#번호` 또는 `TBD` |
| T-002 | US-001 |  | 제품/디자인/UIUX/백엔드/프론트엔드/데이터/인프라/보안/테스트/운영 |  | P0/P1/P2 | H/M/L |  |  |  | `backlog/{epic-title-en}/{feature-title-en}/{userstory-title-en}/{task-title-en}/task.md` | `#번호` 또는 `TBD` |

- UI/UX 관련 Feature는 기능 구현 전에 다음 선행 Task를 반드시 포함한다.
  - 와이어프레임 또는 시안 작성
  - 클릭 가능한 프로토타입 제작
  - 사용성 검증과 개선 반영
  - 디자인 확정/핸드오프 문서화
- UI/UX 관련 기능 구현 Task의 `선행조건`에는 `디자인 확정/핸드오프` Task ID를 명시한다.

## 6. 의존성 그래프(텍스트)

```text
F-01 -> US-001 -> T-001
US-001 -> T-004 -> T-009
US-002 -> T-006 -> T-010
```

## 7. 리스크와 완화 계획

| 리스크 | 영향 | 가능성 | 완화 Task | 오너 |
|---|---|---|---|---|
|  | High/Medium/Low | High/Medium/Low | T-xxx |  |

## 8. 오픈 이슈 / TBD

- `TBD-01`: [확인할 내용]
- `TBD-02`: [의사결정 필요 사항]

## 9. GitHub 등록 준비(선택)

- 라벨 정책: `epic|feature|userstory|task` + `priority:*` + `area:*`
- 마일스톤: `[이름 또는 TBD]`
- 프로젝트 보드: `[이름 또는 TBD]`
- 등록 순서: Epic -> Feature -> UserStory -> Task

## 10. 품질 점검

- Epic -> KPI 연결이 모두 명시되어 있는가
- Feature 수용 기준이 테스트 가능한 문장인가
- UserStory 수용 기준이 사용자 관점에서 테스트 가능한 문장인가
- UI/UX 관련 Feature에 UI/UX 선행 UserStory/Task(시안, 프로토타입, 사용성 검증, 디자인 핸드오프)가 포함되어 있는가
- UI/UX 관련 기능 구현 Task가 디자인 핸드오프 Task를 선행조건으로 참조하는가
- 운영/배포/롤백/관측 작업이 Task에 포함되어 있는가
- 보안/개인정보/권한 관련 검토 Task가 포함되어 있는가
- GitHub MCP 사용 시 모든 항목의 이슈 번호/URL 매핑이 누락 없이 기록되어 있는가
- Epic/Feature/UserStory/Task의 문서 경로가 실제 디렉토리 구조와 1:1 매핑되는가
- GitHub MCP 사용 시 각 이슈가 계층 대칭 라벨(`epic`,`feature`,`userstory`,`task`)을 정확히 1개씩 가지는가

## 11. 디렉토리 산출물 매핑

```text
backlog/
  {epic-title-en}/
    epic.md
    {feature-title-en}/
      feature.md
      {userstory-title-en}/
        userstory.md
        {task-title-en}/
          task.md
```

- 디렉토리 이름은 반드시 영문 소문자 슬러그(`kebab-case`)를 사용한다.
- 허용 문자 집합은 `[a-z0-9-]`만 사용한다.
- 한국어 제목은 의미를 보존해 영어로 번역한 뒤 슬러그로 변환한다.
- 파일 시스템 금지 문자(`\ / : * ? " < > |`)와 공백은 `-`로 치환한다.
- 동일 계층에서 중복 제목이 있으면 디렉토리명 뒤에 `__{ID}`를 붙인다.
- 각 문서는 상위/하위 문서의 상대 경로를 포함한다.
