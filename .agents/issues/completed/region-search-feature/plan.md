# Plan - 지역 검색 기능

## 문서 메타
- 이슈 제목: `지역 검색 기능`
- 이슈 소스: `.agents/issues/completed/region-search-feature/issue.md`
- 작성일: `2026-02-24`
- 작성자: `codex (planner skill)`
- 상태: `Final`
- 출력 경로: `.agents/issues/completed/region-search-feature/plan.md`

## 문제 정의
### 현재 동작
- `src/components/ComposableSearch.tsx`는 `cs-selector-area`(트리거 버튼), `cs-detailed-area`(상세 패널), `cs-selected-area`(조건 칩) 3영역만 렌더링한다.
- 지역 선택 UX는 `src/components/RegionDetailPanel.tsx` 내부 3컬럼(`시/도`, `시/군/구`, `읍/면/동`) 탐색만 지원하며, 지역명 검색 입력/미리보기 UI가 없다.
- 현재 구조에서는 지역 검색 컴포넌트를 `cs-detailed-area` 바깥 좌상단(`cs-selector-area` 바깥 아래(다음 형제 영역))으로 배치하는 명시적 슬롯/계약이 없다.

### 기대 동작
- 지역 검색 컴포넌트가 `cs-detailed-area` 바깥 상단 왼쪽에 위치하고, DOM 기준으로 `cs-selector-area` 바깥 아래(다음 형제 영역)에 배치된다.
- 검색 입력은 별도 컴포넌트로 분리하고, 좌측 SVG 아이콘 삽입을 지원한다.
- 입력 문자열과 부분 일치하는 지역(시/도, 시/군/구, 읍/면/동)을 즉시 미리보기 목록으로 노출한다.
- 미리보기는 경로 문자열(`서울특별시 > 광진구`, `충남 > 서산시`, `경기도 > 수원시 장안구 > 조원동`)로 표시한다.
- 미리보기 항목 클릭 시 기존 선택 정책(`toggleRegionCondition`) 및 콜백 계약(`onChange`, `onSelectedEupmyeondong`)을 유지한 채 `선택된 조건`에 반영한다.

### 재현 조건
- 환경: `React 19 + Vite + Vitest`
- 절차:
1. `ComposableSearch`를 렌더링한다.
2. `지역 선택` 트리거를 클릭한다.
3. 현재는 컬럼 탐색만 가능하며, `cs-selector-area` 바깥 아래(다음 형제 영역)의 지역 검색 입력/미리보기 UI는 존재하지 않는다.

### 영향 범위
- 레이아웃/UI: `src/components/ComposableSearch.tsx`, `src/components/ComposableSearch.css`, 신규 지역 검색 컴포넌트
- 도메인 로직: 지역 트리 평탄화 인덱스, 부분 일치 검색, 미리보기 -> `SelectedRegionCondition` 매핑
- 테스트: `src/components/ComposableSearch.test.tsx`, `src/components/callbackContract.test.tsx`, 신규 검색 모델 단위 테스트
- 회귀 영향: 기존 지역 컬럼 선택/상호배타 정책, keyword 패널 표시 흐름, callback 계약

## 성공 기준 / 비목표
### 성공 기준
- [x] 지역 검색 컴포넌트가 `cs-detailed-area` 내부가 아니라 외부에 존재하고, `cs-selector-area` 바깥 아래(다음 형제 영역) 좌상단에 렌더링된다.
- [x] 검색 입력이 별도 컴포넌트로 분리되며 좌측 SVG 아이콘 슬롯 계약을 제공한다.
- [x] `수`, `서` 입력 시 계층 레벨 무관 부분 일치 미리보기가 즉시 노출된다.
- [x] 미리보기 텍스트가 경로 형식을 준수한다.
- [x] 미리보기 클릭 시 조건 칩이 1회 반영되고 기존 중복/상호배타 정책이 유지된다.
- [x] 테스트(`npm run test`)와 정적 검증(`npm run lint`)이 모두 통과한다.

### 비목표
- 초성/오타 보정/유사어 검색 같은 고급 검색 알고리즘
- 원격 API 검색 연동
- 전체 레이아웃 디자인 시스템 재정의

## 원인 가설과 검증 계획
| ID | 가설 | 근거 | 검증 방법 | 우선순위 |
| --- | --- | --- | --- | --- |
| H1 | 지역 계층 전체를 검색 가능한 공통 인덱스로 변환하는 로직이 없다 | 현재 코드는 컬럼 탐색 중심이며 검색 모델 파일이 없다 | `buildRegionSearchIndex`, `filterRegionSearchResults` Red 테스트 추가 후 Green 구현 | P0 |
| H2 | `cs-selector-area` 바깥 아래(다음 형제 영역)에 지역 검색 UI를 넣을 레이아웃 계약이 없다 | `ComposableSearch.tsx`의 selector 영역은 트리거 버튼만 렌더링 | 레이아웃 테스트에서 검색 컴포넌트 부모/위치를 고정하고 컴포넌트 트리 수정 | P0 |
| H3 | 미리보기 항목(시/도/시군구/읍면동)을 `SelectedRegionCondition`으로 변환하는 규칙이 불명확하다 | 현재 선택 엔진은 컬럼 탐색 컨텍스트(선택된 상위 지역)에 의존 | 레벨별 매핑 테스트를 먼저 작성하고 `toggleRegionCondition` 회귀 검증 | P0 |
| H4 | 키 입력마다 전체 탐색을 반복하면 large 데이터셋에서 지연이 커질 수 있다 | `findAll*` API 호출이 반복되면 매 입력 O(N) 누적 | 인덱스 메모이제이션 적용 및 large 프로파일 스모크 테스트 | P1 |
| H5 | 외부 배치 변경으로 기존 selector/detailed/selected 순서 계약 테스트가 깨질 수 있다 | 기존 테스트가 영역 순서만 검증하고 중간 신규 영역을 고려하지 않음 | DOM 순서/계약 테스트 업데이트 및 회귀 실행 | P1 |

## 해결 대안 비교
| 대안 | 핵심 아이디어 | 장점 | 리스크 | 구현/검증 비용 |
| --- | --- | --- | --- | --- |
| A | 지역 검색 컴포넌트를 `cs-selector-area` 바깥 아래 형제 영역으로 배치하고, 검색 인덱스를 별도 모델로 분리 | 이슈의 위치 요구와 정확히 일치, 검색 UI/로직 분리 용이 | selector 영역 혼잡 가능성, 노출 조건 정책 필요 | Medium |
| B | 검색 컴포넌트를 `cs-selector-area`와 `cs-detailed-area` 사이의 새 sibling 영역에 배치 | 시각적으로 분리되어 유지보수 쉬움 | "`cs-selector-area` 바깥 아래(다음 형제 영역)" 해석과 충돌 가능 | Medium |
| C | 검색 컴포넌트를 `RegionDetailPanel` 내부 상단 고정(sticky) 배치 | 기존 지역 패널 로직 재사용이 쉬움 | `cs-detailed-area` 바깥 요구를 위반 | Low |

## 권장 해결안
- 선택 대안: `A`
- 선택 근거:
- 이슈 문구의 위치 제약(`cs-detailed-area` 바깥 + `cs-selector-area` 바깥 아래(다음 형제 영역))을 가장 직접적으로 만족한다.
- 검색 컴포넌트와 검색 모델을 분리하면 TDD 적용이 쉽고 회귀 범위를 명확히 통제할 수 있다.
- 기존 선택 엔진(`toggleRegionCondition`)을 재사용해 동작 일관성을 유지할 수 있다.
- 기각한 대안과 사유:
- `B`: 기능은 가능하나 위치 해석이 모호해 요구 오해 리스크가 남는다.
- `C`: 명시 요구와 배치가 충돌하므로 채택 불가.

## 실행 계획
| 단계 | 작업 | 담당 역할 | 선행조건 | 산출물 | 완료 조건(DoD) |
| --- | --- | --- | --- | --- | --- |
| 1 | 배치/노출 정책 확정(`cs-selector-area` 바깥 아래(다음 형제 영역) DOM 계약, 표시 조건, 결과 개수 제한) | FE | 이슈 검토 | 정책 메모 + 테스트 시나리오 목록 | TBD 최소화, 테스트 케이스 변환 가능 |
| 2 | Red: 레이아웃/검색 모델 테스트 추가 | FE | 1단계 완료 | `ComposableSearch.test.tsx` 업데이트, `regionSearchModel.test.ts` 신규 | 신규 테스트가 현재 코드에서 실패함을 확인 |
| 3 | Green: 검색 모델 구현(인덱스, 부분 일치, 경로 라벨, 결과 제한) | FE | 2단계 완료 | `src/components/regionSearchModel.ts` 신규 | unit 테스트 통과, 정적 분석 경고 없음 |
| 4 | UI 컴포넌트 구현(아이콘 슬롯 지원 입력 + 미리보기 리스트) | FE | 3단계 완료 | `src/components/RegionSearchInput.tsx` 신규(필요 시 보조 컴포넌트 포함) | 접근성 라벨/포커스/키보드 동작 검증 통과 |
| 5 | `ComposableSearch` 통합: `cs-selector-area` 바깥 아래(다음 형제 영역) 좌상단 렌더 + 이벤트 연결 | FE | 4단계 완료 | `ComposableSearch.tsx`, `ComposableSearch.css` 수정 | 위치 요구 충족, region/keyword 기존 트리거 동작 유지 |
| 6 | 미리보기 클릭 -> 조건 칩 반영 및 callback 계약 통합 | FE | 5단계 완료 | 선택 매핑 로직/핸들러 수정 | 칩 반영 1회, `onChange`/`onSelectedEupmyeondong` 계약 유지 |
| 7 | 회귀 검증/문서 갱신 | FE/QA | 6단계 완료 | 테스트 실행 결과, 필요 시 가이드 문서 업데이트 | `npm run test`, `npm run lint` 통과 및 회귀 없음 |

## 테스트 및 검증 계획
### Unit
- 인덱스 생성 시 모든 레벨(시/도/시군구/읍면동)의 검색 토큰/경로 라벨 생성 검증
- 부분 일치(`수`, `서`) 검색 결과와 결과 제한 정책 검증
- 미리보기 항목 -> `SelectedRegionCondition` 매핑(레벨별) 검증

### Integration
- 지역 검색 컴포넌트가 `cs-selector-area` 바깥 아래(다음 형제 영역)에 있고 `cs-detailed-area` 밖에 존재함을 DOM 테스트로 검증
- 입력 시 미리보기 노출/빈 결과 처리/결과 클릭 후 칩 생성 검증
- 클릭 후 `onChange`, `onSelectedEupmyeondong` 호출 횟수/페이로드 계약 검증

### Regression
- 기존 지역 컬럼 선택, 전체 선택, 상호배타, 칩 삭제 플로우 재검증
- keyword 트리거/패널 노출 및 token 정책 테스트 재검증
- selector/detailed/selected 레이아웃 순서 계약 테스트를 신규 영역 추가에 맞게 갱신 후 검증

### 필요 시 추가
- 성능: large 프로파일에서 연속 입력 시 프레임 드랍/체감 지연 스모크 테스트
- 보안: 텍스트 렌더링 시 `dangerouslySetInnerHTML` 미사용 유지

## 배포 / 롤백 / 운영 관측
### 배포 전략
- 기능 브랜치에서 `npm run lint` -> `npm run test` 순으로 게이트 통과 후 머지
- 릴리스 노트에 "지역 검색(부분 일치 미리보기, selector 영역 배치)" 항목 추가

### 롤백 전략
- 트리거: 위치 계약 위반, 선택 정책 회귀, callback 오류 증가
- 절차:
1. 기능 도입 커밋 revert
2. 회귀 테스트 재실행으로 기준선 복구 확인
3. 필요 시 직전 안정 태그 재배포

### 운영 관측
- 핵심 지표: 검색 입력 후 결과 표시 시간, 결과 클릭 후 칩 반영 성공률
- 로그/트레이싱 포인트: `callbackPipeline`의 `CALLBACK_ERROR_PREFIX` 발생 빈도
- 알람 조건: CI 테스트 실패, callback 오류 로그 급증

## 리스크 및 완화
| 리스크 | 영향도 | 가능성 | 완화 방안 | 소유자 |
| --- | --- | --- | --- | --- |
| `cs-selector-area 바깥 아래(다음 형제 영역)` 해석 불일치로 배치 기준이 바뀔 수 있음 | H | M | DOM 계약을 테스트로 고정하고 PR 설명에 기준 명시 | FE |
| 검색 결과 과다로 미리보기 렌더 성능 저하 | M | M | 결과 개수 제한, 인덱스 메모이제이션, large 스모크 | FE |
| 상위 레벨(시도/시군구) 클릭 매핑이 정책과 충돌 | H | M | 레벨별 매핑 단위 테스트 + selectionPolicy 회귀 테스트 | FE/QA |
| 기존 selector/keyword UI와 시각 충돌 | M | M | 반응형 CSS 검증 및 스냅샷/DOM 테스트 보강 | FE |
| callback 계약 중복 호출/누락 | H | L | 호출 횟수 검증 테스트 추가(`callbackContract.test.tsx`) | FE/QA |

## 오픈 이슈(TBD)
- 지역 검색 컴포넌트의 기본 노출 정책: 항상 노출 vs region 패널 활성 시만 노출
- 미리보기 기본 노출 개수와 정렬 우선순위(입력 위치, 계층 우선, 가나다)
- 시/도 또는 시/군/구 항목 클릭 시 `displayName`의 "전체" 표기 정책
- 아이콘 주입 방식: 내부 기본 SVG 고정 vs 외부 prop 주입
- 키보드 UX 정책(Arrow 탐색, Enter 선택, Escape 닫기) 적용 범위




