# 백로그 디렉토리/문서 템플릿

## 1. 디렉토리 구조

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

- 디렉토리명은 반드시 영문 소문자 슬러그(`kebab-case`)를 사용한다.
- 허용 문자 집합은 `[a-z0-9-]`만 사용한다.
- 한국어 제목은 의미를 보존해 영어로 번역한 뒤 슬러그로 변환한다.
- 파일 시스템 금지 문자(`\ / : * ? " < > |`)와 공백은 `-`로 치환한다.
- 동일 계층에서 제목이 중복되면 디렉토리명 뒤에 `__{ID}`를 붙인다.

## 2. `epic.md` 템플릿

```markdown
# [E-xx] {Epic 제목}

## 메타
- ID: `E-xx`
- 우선순위: `P0/P1/P2`
- 상태: `TBD`
- GitHub Issue: `TBD`

## 문제와 사용자 가치
- 해결 문제:
- 사용자 가치:
- KPI/성공지표:

## 범위
- 포함:
- 제외:

## 하위 Feature
- [F-xx] {Feature 제목} (`./{Feature 제목}/feature.md`)

## 관련 정보
- 기준 PRD:
- 비고/TBD:
```

## 3. `feature.md` 템플릿

```markdown
# [F-xx] {Feature 제목}

## 메타
- ID: `F-xx`
- 소속 Epic: `[E-xx] {Epic 제목}` (`../epic.md`)
- 우선순위: `P0/P1/P2`
- 상태: `TBD`
- GitHub Issue: `TBD`

## 사용자 가치
- 가치:
- 수용 기준:

## 하위 UserStory
- [US-xxx] {UserStory 제목} (`./{UserStory 제목}/userstory.md`)

## 의존성
- 선행:
- 후행:
```

## 4. `userstory.md` 템플릿

```markdown
# [US-xxx] {UserStory 제목}

## 메타
- ID: `US-xxx`
- 소속 Feature: `[F-xx] {Feature 제목}` (`../feature.md`)
- 소속 Epic: `[E-xx] {Epic 제목}` (`../../epic.md`)
- 우선순위: `P0/P1/P2`
- 상태: `TBD`
- GitHub Issue: `TBD`

## 사용자 스토리
- As a:
- I want:
- So that:

## 수용 기준
- [ ] ...

## 하위 Task
- [T-xxx] {Task 제목} (`./{Task 제목}/task.md`)
```

## 5. `task.md` 템플릿

```markdown
# [T-xxx] {동사로 시작하는 Task 제목}

## 메타
- ID: `T-xxx`
- 소속 UserStory: `[US-xxx] {UserStory 제목}` (`../userstory.md`)
- 소속 Feature: `[F-xx] {Feature 제목}` (`../../feature.md`)
- 소속 Epic: `[E-xx] {Epic 제목}` (`../../../epic.md`)
- 유형: `제품/백엔드/프론트엔드/데이터/인프라/보안/테스트/운영`
- 담당 역할:
- 우선순위: `P0/P1/P2`
- 난이도: `High/Medium/Low`
- GitHub Issue: `TBD`

## 작업 내용
- 목표:
- 구현 항목:
- 선행조건:

## 검증과 완료 조건
- 검증 방법(테스트/리뷰/지표):
- 산출물:
- 완료 정의(DoD):
```

## 6. 작성 규칙

- `backlog/index.md`를 사용하는 경우 요약 표와 디렉토리 문서 ID/제목/우선순위를 일치시킨다.
- 각 문서에서 상위/하위 문서 상대 경로가 실제 경로와 일치해야 한다.
- 내용이 미확정이면 추측하지 말고 `TBD`로 남긴다.
