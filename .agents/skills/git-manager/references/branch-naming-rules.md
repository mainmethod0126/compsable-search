# 브랜치 네이밍 규칙

## 1. 기본 형식

- 기본 패턴: `<type>/<summary>`
- 이슈 연동 패턴: `<type>/<issue-id>-<summary>`
- `summary`는 소문자 kebab-case를 사용한다.

예시:
- `feature/search-chip-keyword`
- `fix/214-region-toggle-bug`
- `refactor/composable-search-state`

## 2. type 선택 기준

- `feature`: 사용자 기능 추가/확장
- `fix`: 버그 수정
- `refactor`: 동작 변경 없는 구조 개선
- `docs`: 문서 수정
- `chore`: 설정/도구/의존성/빌드 정리
- `release`: 릴리스 준비 또는 버전 태깅 관련 작업

## 3. summary 작성 규칙

- 변경 핵심을 3~6 단어로 압축한다.
- 동사+대상 형태를 우선한다(예: `add-region-filter`).
- 의미 없는 일반어를 피한다(예: `update`, `work`, `misc`).
- 특수문자/공백/대문자를 사용하지 않는다.

## 4. 권장 길이

- 전체 브랜치 이름 길이는 48자 내외를 권장한다.
- 길어질 경우 scope를 줄이고 핵심 명사만 남긴다.
