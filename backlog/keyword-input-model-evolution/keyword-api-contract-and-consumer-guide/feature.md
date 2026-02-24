# [F-12] 키워드 API 계약과 소비자 가이드 정리

## 메타
- ID: `F-12`
- 소속 Epic: `[E-04] 키워드 조건 입력 모델 확장` (`../epic.md`)
- 우선순위: `P2`
- 상태: `Done`
- GitHub Issue: `TBD`

## 사용자 가치
- 가치:
  - 라이브러리 소비자는 키워드 기능을 공개 계약과 예제 기반으로 빠르게 통합할 수 있다.
  - 유지보수자는 버전 전환 가이드를 통해 기능 확장에 따른 통합 마찰을 줄일 수 있다.
- 수용 기준:
  - [x] 키워드 관련 공개 타입/props/이벤트 계약이 문서와 코드에 일치한다.
  - [x] region + keyword 조합 통합 예제와 사용 가이드가 최신 동작 기준으로 제공된다.
  - [x] trigger-only 모델에서 입력 모델로의 마이그레이션 노트가 제공된다.
  - [x] 키워드 API 계약 검증 테스트가 CI에 포함된다.

## 하위 UserStory
- [US-034] 키워드 공개 API 타입 확정 (`./keyword-public-api-type-finalization/userstory.md`)
- [US-035] 소비자 가이드와 예제 정비 (`./consumer-guide-and-example-refinement/userstory.md`)
- [US-036] 마이그레이션 노트 작성 (`./migration-note-authoring/userstory.md`)

## 의존성
- 선행:
  - `[F-06] 소비자 통합 예제와 계약 검증 강화` (`../../public-api-contract-and-extensibility/consumer-integration-example-and-contract-validation/feature.md`)
  - `[F-10] 키워드 입력 상호작용 모델 정의` (`../keyword-input-interaction-model/feature.md`)
  - `[F-11] 키워드 조건 상태와 칩 연동` (`../keyword-condition-state-and-chip-integration/feature.md`)
- 후행:
  - `TBD`


