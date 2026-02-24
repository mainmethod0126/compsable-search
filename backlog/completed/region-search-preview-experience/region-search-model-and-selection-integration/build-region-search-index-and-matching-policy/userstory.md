# [US-045] 지역 검색 인덱스와 매칭 정책 구축

## 메타
- ID: `US-045`
- 소속 Feature: `[F-15] 지역 검색 모델과 미리보기 선택 연동 구현` (`../feature.md`)
- 소속 Epic: `[E-06] 지역 검색 미리보기 선택 경험 구현` (`../../epic.md`)
- 우선순위: `P0`
- 상태: `Done`
- GitHub Issue: `TBD`

## 사용자 스토리
- As a: 프론트엔드 엔지니어
- I want: 계층형 지역 데이터를 검색 가능한 인덱스로 변환하고 부분 일치 정책을 고정하고 싶다.
- So that: UI 구현 전에 예측 가능한 검색 결과와 매핑 규칙을 테스트로 보장할 수 있다.

## 수용 기준
- [x] 시/도/시군구/읍면동 레벨을 모두 포함하는 검색 인덱스 구조가 정의된다.
- [x] 한 글자 입력(`수`, `서`) 부분 일치 케이스가 테스트로 보장된다.
- [x] 상위 레벨 선택 항목 매핑(시도/시군구 클릭 시 조건 구성) 규칙이 문서화되고 테스트된다.
- [x] 검색 모델 단위 테스트가 Red -> Green -> Refactor 흐름으로 통과한다.

## 하위 Task
- [T-177] 정의한다: 지역 검색 매칭 정책과 경계 조건 (`./define-region-search-matching-policy-and-edge-cases/task.md`)
- [T-178] 구현한다: 지역 검색 인덱스와 필터 모델 (`./implement-region-search-index-and-filter-model/task.md`)
- [T-179] 검증한다: 지역 검색 모델 단위 테스트 (`./validate-unit-tests-for-region-search-model/task.md`)



