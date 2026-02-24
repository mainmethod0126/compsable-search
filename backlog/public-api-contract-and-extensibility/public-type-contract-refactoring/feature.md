# [F-04] 공개 타입 계약 리팩터링

## 메타
- ID: `F-04`
- 소속 Epic: `[E-02] 소비자 API 계약 안정화와 확장 포인트 연결` (`../epic.md`)
- 우선순위: `P1`
- 상태: `Done`
- GitHub Issue: `TBD`

## 사용자 가치
- 가치:
  - 라이브러리 소비자는 내부 구현 세부사항과 분리된 안정 공개 타입으로 안전하게 통합할 수 있다.
  - 유지보수자는 타입 경계를 기준으로 변경 영향 범위를 명확히 제어할 수 있다.
- 수용 기준:
  - [x] `RegionSelectProps`에서 소비자 주입 계약과 내부 주입 계약이 명시적으로 분리된다.
  - [x] `KeywordSelectProps`를 포함한 selector 타입 경계가 공개 API 기준으로 일관되게 정리된다.
  - [x] 소비자 샘플 프로젝트에서 타입 체크 실패가 발생하지 않는다.
  - [x] `0.1.x` 하위 호환 범위와 예외 규칙이 문서에 명시된다.

## 하위 UserStory
- [US-010] 소비자/내부 타입 경계 분리 (`./consumer-and-internal-type-boundary-separation/userstory.md`)
- [US-011] selector 공통 타입 유틸 정리 (`./selector-common-type-utilities-refinement/userstory.md`)
- [US-012] 하위 호환성 규칙 문서화 (`./backward-compatibility-rule-documentation/userstory.md`)

## 의존성
- 선행:
  - `[F-01] 검색 컨테이너와 Selector 오케스트레이션` (`../../core-region-selection-mvp/search-container-and-selector-orchestration/feature.md`)
  - `[F-03] 선택 조건 칩/삭제/중복 방지 처리` (`../../core-region-selection-mvp/selected-condition-chip-and-dedup-management/feature.md`)
- 후행:
  - `[F-05] 옵션 콜백 실행 경로 연결` (`../option-callback-wiring/feature.md`)
  - `[F-06] 소비자 통합 예제와 계약 검증 강화` (`../consumer-integration-example-and-contract-validation/feature.md`)


