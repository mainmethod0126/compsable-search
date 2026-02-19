# 키워드 입력 상태머신 명세

## 메타
- 문서 버전: `v0.2`
- 갱신일: `2026-02-19`
- 관련 범위: `[US-028]`, `[US-029]`, `[US-030]`

## 1. 상태 정의
- `idle`: 입력값 없음, 토큰 없음 또는 토큰만 유지되는 기본 상태
- `typing`: 입력창에 확정 전 텍스트가 존재하는 상태
- `token-committed`: 토큰 확정 직후 또는 토큰이 1개 이상 존재하는 안정 상태
- `max-token-reached`: 토큰 개수가 `maxTokens`에 도달한 상태

## 2. 이벤트 정의
- `FOCUS`: 입력창 포커스 진입
- `BLUR`: 입력창 포커스 이탈(현재 입력 확정 시도)
- `INPUT_CHANGED`: 입력값 변경
- `COMMIT_INPUT`: Enter 기반 확정
- `BACKSPACE`: 입력 비어 있을 때 마지막 토큰 제거
- `REMOVE_TOKEN`: 칩 삭제 버튼으로 특정 토큰 제거
- `CLEAR_ALL`: 전체 삭제

## 3. 전이 규칙
| 현재 상태 | 이벤트 | 전이 결과 | 사이드 이펙트 |
| --- | --- | --- | --- |
| `idle` | `INPUT_CHANGED`(비어있지 않음) | `typing` | 없음 |
| `typing` | `COMMIT_INPUT` 또는 `BLUR` (유효 토큰) | `token-committed` 또는 `max-token-reached` | 토큰 추가 |
| `typing` | `COMMIT_INPUT` 또는 `BLUR` (중복/길이초과/빈값) | `typing` 또는 `idle` | 오류 코드 설정 |
| `token-committed` | `INPUT_CHANGED` | `typing` | 없음 |
| `token-committed` | `BACKSPACE`(입력 비어 있음) | `token-committed` 또는 `idle` | 마지막 토큰 제거 |
| `max-token-reached` | `COMMIT_INPUT` | `max-token-reached` | 추가 차단 + 오류 코드 설정 |
| `max-token-reached` | `REMOVE_TOKEN`/`BACKSPACE` | `token-committed` 또는 `idle` | 토큰 제거 |
| 모든 상태 | `CLEAR_ALL` | `idle` | 입력/토큰/오류 초기화 |

## 4. 정규화/검증 규칙
- 기본 정규화:
  - 앞뒤 공백 제거
  - 연속 공백 단일화
  - 소문자 변환(`casePolicy = lower`)
- 기본 제약:
  - `maxTokens = 5`
  - `maxTokenLength = 20`
- 오류 코드:
  - `empty-token`
  - `duplicate-token`
  - `token-too-long`
  - `max-token-reached`

## 5. 허용되지 않는 전이 정책
- 최대 토큰 도달 이후 `COMMIT_INPUT`은 무시되지 않고 `max-token-reached` 오류 상태로 안내한다.
- 중복 토큰 입력은 기존 토큰을 유지하고 `duplicate-token` 오류 상태로 유지한다.

## 6. 테스트 매핑 (1:1)
| 규칙 | 테스트 |
| --- | --- |
| Enter 확정 + 정규화 | `src/components/keywordInputModel.test.ts` 첫 번째 케이스 |
| 중복 차단 | `src/components/keywordInputModel.test.ts` 두 번째 케이스 |
| 최대 토큰 제한 | `src/components/keywordInputModel.test.ts` 세 번째 케이스 |
| 빈 입력 Backspace 삭제 | `src/components/keywordInputModel.test.ts` 네 번째 케이스 |
| Blur 확정 | `src/components/keywordInputModel.test.ts` 다섯 번째 케이스 |
| UI 키보드/오류 메시지 | `src/components/ComposableSearch.test.tsx` 키워드 관련 4개 케이스 |
| 조합 payload 정합성 | `src/components/callbackContract.test.tsx` `region + keyword` 케이스 |
