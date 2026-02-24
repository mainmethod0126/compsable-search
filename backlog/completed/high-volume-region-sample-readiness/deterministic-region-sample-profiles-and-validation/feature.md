# [F-13] 결정적 지역 샘플 프로파일과 대량 검증 워크플로우

## 메타
- ID: `F-13`
- 소속 Epic: `[E-05] 대량 지역 샘플 확장과 검증 가능성 확보` (`../epic.md`)
- 우선순위: `P1`
- 상태: `Done`
- GitHub Issue: `TBD`

## 사용자 가치
- 가치:
  - 개발/QA는 정해진 프로파일(`small`, `medium`, `large`) 기반으로 동일 조건의 테스트와 데모 점검을 반복할 수 있다.
  - 사용자는 데이터 규모가 커져도 선택 패널의 조작 가능성과 콜백 계약 일관성을 유지할 수 있다.
- 수용 기준:
  - [x] 프로파일 3종(`small`, `medium`, `large`)이 정의되고 데모에서 앱 재시작 없이 전환된다.
  - [x] 생성 데이터는 결정적이며 동일 프로파일 호출 시 항상 동일한 결과를 반환한다.
  - [x] `region.code` 중복이 방지되고, 중복 발생 시 테스트가 실패해 조기 탐지된다.
  - [x] `large` 프로파일에서 가로 overflow, 클릭 불가, 선택 상태 불일치가 발생하지 않는다.
  - [x] `onClick`, `onChange`, `onSelectedEupmyeondong` 계약이 대량 샘플에서도 회귀 없이 유지된다.

## 하위 UserStory
- [US-040] 프로파일 정의와 결정적 샘플 생성기 구축 (`./profile-spec-and-deterministic-generator/userstory.md`)
- [US-041] 데모 프로파일 전환과 대량 리스트 UX 안정화 (`./demo-profile-switch-and-list-ux-hardening/userstory.md`)
- [US-042] 대량 샘플 자동 회귀 검증과 관측 준비 (`./large-sample-regression-testing-and-observability/userstory.md`)

## 의존성
- 선행:
  - `[F-02] 계층형 지역 로딩과 선택 상태 전이` (`../../core-region-selection-mvp/hierarchical-region-loading-and-state-transition/feature.md`)
  - `[F-08] 회귀 검증 체계와 QA 시나리오 자동화` (`../../library-quality-hardening-and-release-readiness/regression-validation-and-qa-automation/feature.md`)
- 후행:
  - `TBD`


