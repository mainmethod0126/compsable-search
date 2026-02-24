# [E-06] 지역 검색 미리보기 선택 경험 구현

## 메타
- ID: `E-06`
- 우선순위: `P0`
- 상태: `Done`
- GitHub Issue: `TBD`

## 문제와 사용자 가치
- 해결 문제:
  - 현재 지역 조건 선택은 3단 컬럼 순차 탐색에 의존해 원하는 지역을 빠르게 찾기 어렵다.
  - 부분 일치 검색과 미리보기 선택이 없어 대량 지역 데이터에서 탐색 시간이 길어진다.
- 사용자 가치:
  - 최종 사용자는 지역명을 일부만 입력해도 원하는 후보를 즉시 확인하고 바로 선택할 수 있다.
  - 소비자 애플리케이션은 기존 선택 정책/콜백 계약을 유지한 채 검색 기반 UX를 추가할 수 있다.
- KPI/성공지표:
  - 지역 검색 관련 수용 기준(AC-RS-001~AC-RS-010) 검증 통과율 `100%`
  - `npm run test` 전체 통과율 `100%` (신규 + 기존 회귀)
  - large 프로파일 수동 스모크에서 입력/미리보기 반응 지연으로 인한 기능 차단 이슈 `0건` (정량 임계값 `TBD`)

## 범위
- 포함:
  - `cs-selector-area` 하위 좌상단(`cs-detailed-area` 바깥) 지역 검색 입력 UI 추가
  - 좌측 SVG 아이콘 슬롯을 포함한 검색 입력 컴포넌트 분리
  - 시/도/시군구/읍면동 전체를 대상으로 한 부분 일치 미리보기 생성
  - 미리보기 클릭 시 선택 조건 칩 반영 및 기존 콜백 계약 유지
  - DOM 배치 계약(`selector-area` 하위, `detailed-area` 외부) 테스트 고정
  - 단위/통합/회귀 테스트, 운영 관측/롤백 문서 반영
- 제외:
  - 초성 검색/오탈자 보정/퍼지 검색 알고리즘
  - 원격 API 연동 기반 비동기 검색
  - 디자인 시스템 전면 재구성

## 하위 Feature
- [F-14] 지역 검색 UI/UX 선행 확정과 핸드오프 (`./uiux-specification-and-handoff/feature.md`)
- [F-15] 지역 검색 모델과 미리보기 선택 연동 구현 (`./region-search-model-and-selection-integration/feature.md`)

## 관련 정보
- 기준 PRD: `.agents/issues/completed/region-search-feature/plan.md`, `.agents/issues/completed/region-search-feature/issue.md`
- 비고/TBD:
  - GitHub 등록 대상 저장소(`owner/repo`)와 라벨 정책은 `TBD`
  - 검색 결과 기본 노출 개수/정렬 우선순위는 `TBD`로 유지하고 하위 Task에서 확정한다.



