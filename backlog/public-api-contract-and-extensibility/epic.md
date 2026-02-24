# [E-02] 소비자 API 계약 안정화와 확장 포인트 연결

## 메타
- ID: `E-02`
- 우선순위: `P1`
- 상태: `Done`
- GitHub Issue: `TBD`

## 문제와 사용자 가치
- 해결 문제:
  - `RegionSelectProps`의 소비자 주입 계약과 내부 주입 계약이 명확히 분리되지 않아 타입 불일치 위험이 있다.
  - `options.onChange`, `options.onSelectedEupmyeondong`, `options.onClick` 콜백이 실행 경로에 완전하게 연결되지 않았다.
- 사용자 가치:
  - 라이브러리 소비자는 타입 추론 가능한 안정 API로 통합 리스크를 줄일 수 있다.
  - 유지보수자는 확장 포인트 동작을 명시적으로 검증해 회귀를 줄일 수 있다.
- KPI/성공지표:
  - 소비자 샘플 타입 체크 실패 `0건`
  - 옵션 콜백(`onChange`, `onSelectedEupmyeondong`, `onClick`) 동작 검증 시나리오 통과율 `100%`
  - API 문서-구현 불일치 이슈 `0건`

## 범위
- 포함:
  - `RegionSelectProps`/`KeywordSelectProps` 계약 정리 및 타입 경계 명확화
  - region/keyword 옵션 콜백 실행 경로 연결
  - 공개 API 기준 사용 예시 및 검증 케이스 정리
- 제외:
  - 서버 상태 관리 내장
  - 도메인별 커스텀 DSL 추가
  - 런타임 외부 의존성 확대

## 하위 Feature
- [F-04] 공개 타입 계약 리팩터링 (`./public-type-contract-refactoring/feature.md`)
- [F-05] 옵션 콜백 실행 경로 연결 (`./option-callback-wiring/feature.md`)
- [F-06] 소비자 통합 예제와 계약 검증 강화 (`./consumer-integration-example-and-contract-validation/feature.md`)

## 관련 정보
- 기준 PRD: `PRD.md`, `PRD.en.md`
- 비고/TBD:
  - 외부 노출 타입의 하위 호환 범위(`0.1.x` 보장 범위) 확정 필요

