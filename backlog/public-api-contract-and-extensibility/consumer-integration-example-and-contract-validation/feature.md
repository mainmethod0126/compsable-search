# [F-06] 소비자 통합 예제와 계약 검증 강화

## 메타
- ID: `F-06`
- 소속 Epic: `[E-02] 소비자 API 계약 안정화와 확장 포인트 연결` (`../epic.md`)
- 우선순위: `P1`
- 상태: `TBD`
- GitHub Issue: `TBD`

## 사용자 가치
- 가치:
  - 개발자는 실제 통합 예제로 공개 API를 빠르게 적용하고 실패 지점을 조기에 파악할 수 있다.
  - 문서와 구현 간 불일치를 회귀 테스트로 지속 감시해 유지보수 비용을 줄일 수 있다.
- 수용 기준:
  - [ ] region/keyword 조합 시나리오를 포함한 소비자 통합 예제가 최신 공개 API 기준으로 동작한다.
  - [ ] API 문서 코드 예제가 CI에서 타입 체크 또는 실행 검증된다.
  - [ ] 계약 기반 테스트(필수/선택 props, 콜백 payload)가 추가되어 회귀를 탐지한다.
  - [ ] API 문서-구현 불일치 이슈가 `0건`으로 유지된다.

## 하위 UserStory
- [US-016] 소비자 통합 샘플 갱신 (`./consumer-integration-sample-refresh/userstory.md`)
- [US-017] 계약 기반 검증 테스트 추가 (`./contract-based-validation-test-suite/userstory.md`)
- [US-018] API 사용 가이드 동기화 (`./api-usage-guide-synchronization/userstory.md`)

## 의존성
- 선행:
  - `[F-04] 공개 타입 계약 리팩터링` (`../public-type-contract-refactoring/feature.md`)
  - `[F-05] 옵션 콜백 실행 경로 연결` (`../option-callback-wiring/feature.md`)
- 후행:
  - `[F-12] 키워드 API 계약과 소비자 가이드 정리` (`../../keyword-input-model-evolution/keyword-api-contract-and-consumer-guide/feature.md`)
