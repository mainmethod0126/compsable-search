# [US-040] 프로파일 정의와 결정적 샘플 생성기 구축

## 메타
- ID: `US-040`
- 소속 Feature: `[F-13] 결정적 지역 샘플 프로파일과 대량 검증 워크플로우` (`../feature.md`)
- 소속 Epic: `[E-05] 대량 지역 샘플 확장과 검증 가능성 확보` (`../../epic.md`)
- 우선순위: `P0`
- 상태: `Done`
- GitHub Issue: `TBD`

## 사용자 스토리
- As a: 프론트엔드 엔지니어
- I want: `small`, `medium`, `large` 프로파일 규격과 결정적 지역 샘플 생성 규칙을 명확히 정의하고 구현하길 원한다.
- So that: 테스트와 데모가 같은 데이터 조건을 공유하고 `region.code` 충돌을 사전에 차단할 수 있다.

## 수용 기준
- [x] 프로파일별 목표 수량과 용도가 문서화되고 미확정 값은 `TBD`로 분리된다.
- [x] 동일 프로파일 입력에 대해 항상 동일한 데이터셋이 생성된다.
- [x] 생성 데이터에서 `region.code`가 전역 유일하며 부모-자식 연결 규칙이 유지된다.
- [x] `DemoService`가 새 생성 규칙을 사용해 프로파일 기반 데이터를 노출한다.
- [x] 프로파일/생성 규칙 변경 시 검토해야 할 체크리스트가 문서로 제공된다.

## 하위 Task
- [T-157] 정의한다: 프로파일 규모와 생성 규칙 수용 기준 (`./define-scope-and-acceptance/task.md`)
- [T-158] 구현한다: 결정적 샘플 생성 유틸과 DemoService 연동 (`./implement-main-scenario/task.md`)
- [T-159] 검증한다: 코드 유일성과 계층 정합성 테스트 (`./validate-regression-and-failure-flow/task.md`)
- [T-160] 준비한다: 샘플 생성 규칙 운영 가이드와 변경 체크리스트 (`./prepare-observability-and-rollout/task.md`)


