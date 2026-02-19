# [F-11] 키워드 조건 상태와 칩 연동

## 메타
- ID: `F-11`
- 소속 Epic: `[E-04] 키워드 조건 입력 모델 확장` (`../epic.md`)
- 우선순위: `P2`
- 상태: `TBD`
- GitHub Issue: `TBD`

## 사용자 가치
- 가치:
  - 최종 사용자는 region 조건과 keyword 조건을 하나의 선택 조건 영역에서 일관되게 관리할 수 있다.
  - 소비자 애플리케이션은 조합 검색 상태를 단일 계약으로 수신해 UI/비즈니스 로직을 단순화할 수 있다.
- 수용 기준:
  - [ ] 키워드 토큰이 `selected condition` 모델에 region 조건과 일관된 형태로 저장된다.
  - [ ] 키워드 칩 추가/삭제/전체 삭제가 기존 region 칩 정책과 충돌 없이 동작한다.
  - [ ] 조건 변경 시 `onChange` payload가 region + keyword 조합 상태를 정확히 반영한다.
  - [ ] region/keyword 동시 사용 시 중복, 정렬, 우선순위 정책이 명시된다.

## 하위 UserStory
- [US-031] 키워드 조건 데이터 모델 연결 (`./keyword-condition-data-model-linking/userstory.md`)
- [US-032] 선택 조건 칩 렌더링 통합 (`./selected-condition-chip-rendering-integration/userstory.md`)
- [US-033] 조합 상태 정합성 검증 (`./combined-state-consistency-validation/userstory.md`)

## 의존성
- 선행:
  - `[F-03] 선택 조건 칩/삭제/중복 방지 처리` (`../../core-region-selection-mvp/selected-condition-chip-and-dedup-management/feature.md`)
  - `[F-05] 옵션 콜백 실행 경로 연결` (`../../public-api-contract-and-extensibility/option-callback-wiring/feature.md`)
  - `[F-10] 키워드 입력 상호작용 모델 정의` (`../keyword-input-interaction-model/feature.md`)
- 후행:
  - `[F-12] 키워드 API 계약과 소비자 가이드 정리` (`../keyword-api-contract-and-consumer-guide/feature.md`)
