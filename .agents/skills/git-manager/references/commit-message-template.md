# 커밋 메시지 템플릿

## 1. 제목 형식

`<type>(<scope>): <summary>`

예시:
- `feat(search): add removable condition chips`
- `fix(region): prevent duplicated 읍면동 selection`
- `docs(prd): align Korean and English release scope`

## 2. type 가이드

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `refactor`: 기능 변경 없는 구조 개선
- `docs`: 문서 변경
- `test`: 테스트 추가/수정
- `chore`: 빌드/도구/설정 변경
- `ci`: CI/CD 설정 변경
- `perf`: 성능 개선

## 3. summary 작성 규칙

- 영어 명령형 동사로 시작한다(`add`, `fix`, `remove`, `align`, `rename`).
- 72자 이내로 작성한다.
- 마침표를 붙이지 않는다.

## 4. 본문 템플릿(선택)

```text
Why:
- [문제 또는 배경]

What:
- [핵심 변경 1]
- [핵심 변경 2]

Impact:
- [사용자/시스템 영향]
```

## 5. Footer 템플릿(선택)

- Breaking change가 있으면 아래 형식을 사용한다:

```text
BREAKING CHANGE: [호환성 깨짐 내용]
```
