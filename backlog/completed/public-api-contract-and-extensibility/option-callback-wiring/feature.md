# [F-05] 옵션 콜백 실행 경로 연결

## 메타
- ID: `F-05`
- 소속 Epic: `[E-02] 소비자 API 계약 안정화와 확장 포인트 연결` (`../epic.md`)
- 우선순위: `P1`
- 상태: `Done`
- GitHub Issue: `TBD`

## 사용자 가치
- 가치:
  - 소비자 애플리케이션은 옵션 콜백을 통해 검색 조건 변화와 사용자 행동을 안정적으로 수신할 수 있다.
  - 유지보수자는 콜백 실행 경로가 끊기지 않는 것을 자동 검증해 릴리스 리스크를 낮출 수 있다.
- 수용 기준:
  - [x] 조건 변경 시 `options.onChange`가 표준 payload로 호출된다.
  - [x] 읍/면/동 확정 시 `options.onSelectedEupmyeondong` 호출이 보장된다.
  - [x] selector 클릭 상호작용에서 `options.onClick`이 누락 없이 실행된다.
  - [x] 콜백 오류가 발생해도 UI 흐름이 중단되지 않고 오류 처리 정책이 일관되게 적용된다.

## 하위 UserStory
- [US-013] `onChange` 이벤트 파이프라인 연결 (`./onchange-event-pipeline-wiring/userstory.md`)
- [US-014] `onSelectedEupmyeondong` 호출 보장 (`./onselectedeupmyeondong-invocation-guarantee/userstory.md`)
- [US-015] `onClick` 실행 지점 표준화 (`./onclick-hook-point-standardization/userstory.md`)

## 의존성
- 선행:
  - `[F-04] 공개 타입 계약 리팩터링` (`../public-type-contract-refactoring/feature.md`)
- 후행:
  - `[F-06] 소비자 통합 예제와 계약 검증 강화` (`../consumer-integration-example-and-contract-validation/feature.md`)
  - `[F-11] 키워드 조건 상태와 칩 연동` (`../../keyword-input-model-evolution/keyword-condition-state-and-chip-integration/feature.md`)


