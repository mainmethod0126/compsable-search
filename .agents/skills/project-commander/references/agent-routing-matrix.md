# 에이전트 라우팅 매트릭스

## 0. 전역 진입 규칙

- 모든 처리의 시작점은 `project-commander`로 고정한다.
- 직접 실행형 에이전트 호출이 필요한 경우에도 최소 트리아지(목표/범위/완료 조건) 결과를 먼저 확정한다.
- 트리아지 결과가 없으면 실행형 에이전트는 임의 확장 대신 확인 질문을 우선한다.

## 1. 핵심 기준

- 작업의 주목적(기획, 구현, 검증, 배포, 운영)을 먼저 판별한다.
- 결과물 유형(문서, 코드, 계획, 배포 산출물)을 기준으로 담당을 정한다.
- 기술 난이도와 리스크가 높을수록 상위 기술 역할을 우선 배정한다.

## 2. 라우팅 표

| 작업 유형 | 주 담당 에이전트 | 협업 에이전트 | 주 산출물 |
| --- | --- | --- | --- |
| PRD 작성/개선/번역 | `pd` | `technical-fellow`, `tester` | `PRD.md`, `PRD.en.md` |
| PRD 기반 실행 계획 | `task-manager` | `pd`, `project-commander` | `.agents/plans/*.md` |
| 복잡 구현/난제 해결 | `distinguished-engineer` | `tester`, `git-manager` | 코드 변경 + 검증 근거 |
| 기술 전략/아키텍처 의사결정 | `technical-fellow` | `distinguished-engineer`, `pd` | 전략 문서 |
| 테스트 설계/회귀 검증 | `tester` | `distinguished-engineer`, `task-manager` | 테스트 계획/리포트 |
| CI/CD/배포/운영 안정화 | `devops-engineer` | `publisher`, `tester` | 배포 전략/운영 런북 |
| 웹 퍼블리싱/배포 준비 | `publisher` | `devops-engineer` | 배포 아티팩트/리포트 |
| 브랜치/커밋 메시지 정리 | `git-manager` | `distinguished-engineer` | 브랜치명/커밋 메시지 후보 |
| 작업 선정/지시/통제 | `project-commander` | 전체 | 디스패치 계획 |

## 3. 배정 원칙

- 모호한 요청은 `project-commander`가 먼저 트리아지한다.
- 단일 책임으로 해결 가능하면 1개 에이전트에 집중 배정한다.
- 협업이 필요한 경우 주 담당의 결과물을 다음 담당의 입력으로 명시한다.
