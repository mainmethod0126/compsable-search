# react-composable-search PRD

## 1. 제품 요약

`react-composable-search`는 React 애플리케이션에서 검색 조건 선택 UI를 조합형으로 구성하기 위한 컴포넌트다. 현재 구현은 다음 3개 영역을 하나의 컨테이너로 제공한다.

- 상단 Selector 영역: `region`, `keyword` 타입 트리거 렌더링
- 중단 Detailed Conditions 영역: 지역 3단계(시/도, 시/군/구, 읍/면/동) 선택 UI 렌더링
- 하단 Selected Conditions 영역: 선택된 조건 칩 목록, 개별 삭제, 전체 삭제

본 PRD는 현재 저장소 구현(`src/components/**`, `src/App.tsx`, `src/DemoService.tsx`)을 역으로 분석해 작성했으며, 동일 제품 재구현이 가능하도록 상세 동작과 제약을 명시한다.

## 2. 문제 정의

검색 UI는 도메인마다 조건 조합 방식이 다르기 때문에 프로젝트별로 중복 구현이 발생한다. 특히 지역 조건은 계층 구조(시/도 -> 시/군/구 -> 읍/면/동), 다중 선택, 선택 결과 표시(칩), 상위/하위 조건 충돌 처리 등 반복되는 로직이 많다.

해결해야 할 문제는 다음과 같다.

- 동일한 패턴의 조건 선택 UI를 재사용 가능한 컴포넌트로 표준화
- 데이터 소스 주입 방식으로 지역 데이터 의존성을 외부화
- 선택 상태를 UI 일관성 있게 관리(토글, 삭제, 전체 삭제)
- 라이브러리 사용자가 최소 API로 통합할 수 있도록 단순한 계약 유지

## 3. 대상 사용자 및 핵심 사용 사례

### 3.1 대상 사용자

- React 프론트엔드 개발자: 검색 조건 UI를 빠르게 통합하려는 사용자
- 컴포넌트 라이브러리 유지보수자: API 안정성과 회귀 방지를 관리하는 사용자
- 최종 사용자(서비스 이용자): 지역 조건을 탐색/선택하고 조건을 해제하는 사용자

### 3.2 핵심 사용 사례

- US-001: 개발자는 `selectorsProps`에 `region`, `keyword` 설정을 전달해 검색 조건 UI를 한 번에 렌더링한다.
- US-002: 최종 사용자는 지역 선택 트리거를 눌러 상세 영역을 열고 시/도 -> 시/군/구 -> 읍/면/동을 순차 선택한다.
- US-003: 최종 사용자는 시/군/구 컬럼의 `시/도 전체` 체크박스 또는 읍/면/동 체크박스를 토글해 조건을 추가/제거한다.
- US-004: 최종 사용자는 하단 칩의 삭제 버튼으로 개별 조건을 제거한다.
- US-005: 최종 사용자는 전체 삭제 버튼으로 모든 조건을 일괄 제거한다.
- US-006: 최종 사용자는 체크박스 기반 지역 항목과 일반 지역 항목 텍스트가 동일한 타이포그래피로 표시되어 시각적으로 자연스러운 선택 경험을 얻는다.
- US-007: 최종 사용자는 `강남구 > 역삼동`뿐 아니라 시/군/구 또는 읍/면/동의 `전체` 항목(예: `서울특별시 전체`, `강남구 전체`)이 선택된 경우에도 상위 컬럼에서 하위 선택 존재를 색상 차이로 즉시 인지한다.

## 4. 목표

- G-001 (`Must`): 외부 데이터 함수만 주입하면 지역 선택 UI를 동작시킨다.
- G-002 (`Must`): 선택 조건을 칩 형태로 즉시 반영하고 개별/전체 삭제를 지원한다.
- G-003 (`Must`): 선택 상태 토글 시 중복 조건이 누적되지 않도록 ID 기반 일관성을 보장한다.
- G-004 (`Should`): 라이브러리 소비자 API를 간결하게 유지한다.
- G-005 (`Should`): 구현자가 PRD만으로 동일한 화면 구조와 상태 전이를 재현할 수 있어야 한다.

## 5. 비목표

- NG-001: 검색 결과 목록/페이징/정렬 API 호출 기능
- NG-002: 서버 상태 관리(React Query 등) 내장
- NG-003: 지역 데이터 원본 수집/정제 기능
- NG-004: 완전한 다국어(localization) 시스템
- NG-005: 고급 접근성(키보드 화살표 네비게이션, roving tabindex) 완성

## 6. 이번 릴리스 범위

### 6.1 포함 범위

- `ComposableSearch` 컨테이너 및 3개 하위 영역 렌더링
- `region` 타입 selector 및 상세 영역 토글
- 3단 지역 컬럼 UI(`SelectableRegionColumn` 2개 + `CheckableRegionColumn` 1개)
- 선택 조건 칩 렌더링, 칩 삭제, 전체 삭제
- `keyword` 타입 selector 트리거 렌더링(placeholder + optional click)
- 데모 데이터(`DemoService`) 기반 동작 예시

### 6.2 제외 범위

- npm 배포용 엔트리/번들 설정 완성
- 검색 실행 버튼/submit 이벤트 표준화
- `keyword` 조건 입력/자동완성/토큰화
- 비동기 로딩 상태(loading/error) UI

## 7. 기능 요구사항

| ID | 우선순위 | 요구사항 | 상세 명세 | 연결 수용 기준 |
| --- | --- | --- | --- | --- |
| FR-001 | Must | 컨테이너 구조 | `ComposableSearch`는 selector/detailed/selected 영역을 순서대로 렌더링한다. `className`, `style`은 루트 컨테이너에 병합 적용한다. | AC-001 |
| FR-002 | Must | Selector 순서 보존 | `selectorsProps` 배열 순서대로 selector를 렌더링한다. | AC-002 |
| FR-003 | Must | Region 트리거 토글 | `region` selector 버튼 클릭 시 detailed 영역 open/close 상태를 토글한다. | AC-003 |
| FR-004 | Must | Detailed 영역 콘텐츠 주입 | 상세 영역 콘텐츠는 `setDetailedConditionsContent`로 주입된 ReactNode를 렌더링한다. 초기값은 placeholder 노드다. | AC-004 |
| FR-005 | Must | 시/도 초기 로딩 | Region selector 마운트 시 `findAllSidos()`를 호출해 시/도 컬럼 children을 구성한다. | AC-005 |
| FR-006 | Must | 컬럼 current 자동 선택 금지 규칙 | `SelectableRegionColumn`은 초기 렌더/상위 선택 변경/목록 갱신 시 `current`를 자동 할당하거나 `onSelectedRegion`을 자동 호출하지 않는다. 사용자가 항목을 직접 클릭한 경우에만 `current`를 설정하고 `onSelectedRegion`을 호출한다. | AC-006 |
| FR-007 | Must | 시/도 선택 후 시/군/구 로딩 및 시/도 전체 체크 제공 | 시/도 선택 시 `findAllSigungus(sidoCode)`로 시/군/구 컬럼을 갱신한다. 동시에 시/군/구 컬럼에서 `displayName + " 전체"`를 체크박스로 직접 선택/해제할 수 있어야 한다. | AC-007, AC-020 |
| FR-008 | Must | 시/군/구 선택 후 읍/면/동 로딩 | 시/군/구 선택 시 `findAllEupmyeondongs(sigunguCode)`로 읍/면/동 체크 컬럼을 갱신한다. 단, 시/군/구 컬럼에서 이미 노출된 `시/도 전체` 항목은 읍/면/동 컬럼에 중복 노출하지 않는다. | AC-008 |
| FR-009 | Must | 읍/면/동 선택 토글 | 체크박스 변경 시 조건 ID(`eupmyeondong.code`) 기준으로 토글한다. 추가 시 `displayName`은 `시도>시군구>읍면동` 포맷을 사용한다. | AC-009 |
| FR-010 | Must | 중복 방지 | 동일 ID 조건은 중복 저장하지 않는다. 다시 선택하면 제거한다. | AC-010 |
| FR-011 | Should | 상위/하위 지역 충돌 규칙 | `sigungu.code === eupmyeondong.code`인 "전체 지역" 조건은 같은 시/군/구의 상세 조건과 상호 배타적으로 동작한다. | AC-011 |
| FR-012 | Must | 선택 조건 칩 표시 | 선택 조건 배열을 칩 목록으로 렌더링하고 각 칩은 삭제 버튼을 가진다. | AC-012 |
| FR-013 | Must | 개별 삭제 | 칩 삭제 버튼 클릭 시 해당 `conditionId`를 제거한다. | AC-013 |
| FR-014 | Must | 전체 삭제 | 전체 삭제 버튼 클릭 시 모든 조건을 제거한다. 조건이 없으면 버튼은 disabled 상태다. | AC-014 |
| FR-015 | Must | 빈 목록/미선택 안내 문구 | 지역 컬럼의 빈 상태는 원인별 한국어 안내를 구분한다. 상위 지역이 아직 선택되지 않은 경우 `상위 지역을 먼저 선택해 주세요.`를, 상위 선택 이후 데이터가 빈 경우 `표시할 지역이 없습니다.`를 렌더링한다. | AC-015 |
| FR-016 | Should | 시각 상태 표기 | `current` 항목은 강조 배경, `selected` 항목은 강조 텍스트로 구분한다. | AC-016 |
| FR-017 | Could | Region options 콜백 | `options.onChange`, `options.onSelectedEupmyeondong`, `options.onClick` 확장 포인트를 제공한다. | AC-017 |
| FR-018 | Must | Keyword 트리거 | `keyword` selector는 아이콘 + placeholder 버튼을 렌더링하고 `options.onClick`이 있으면 호출한다. | AC-018 |
| FR-019 | Must | 시/도 전체와 하위 시/군/구 상호 배타 규칙 | 시/도 "전체" 조건 선택 시 동일 시/도의 개별 시/군/구 조건은 자동 해제되며, 반대로 개별 시/군/구 조건 선택 시 동일 시/도 "전체" 조건은 자동 해제된다. 특히 개별 시/군/구가 먼저 선택된 상태에서 시/도 "전체"를 체크하면 기존 개별 시/군/구 조건이 즉시 해제되어야 한다. 예: `서울특별시 전체`와 `서울특별시 강남구`는 동시 선택 불가, `부산광역시 해운대구` 선택 후 `부산광역시 전체` 체크 시 `부산광역시 전체`만 유지. | AC-019 |
| FR-020 | Must | 시/군/구에서 시/도 전체 바로 선택 | 사용자는 시/군/구 컬럼의 `시/도 전체` 체크박스를 바로 토글해 조건을 추가/해제할 수 있으며, 동일 목적의 추가 체크 단계를 읍/면/동에서 다시 수행하지 않는다. | AC-020 |
| FR-021 | Must | 시/군/구 자동 선택 금지(명시 선택 전) | 시/군/구 컬럼은 시/도 선택 변경 또는 `시/도 전체` 체크/해제로 목록이 갱신된 직후에도 첫 항목(예: `강남구`)을 `current`/선택으로 자동 지정하지 않는다. 사용자가 시/군/구 항목을 직접 클릭하기 전까지 시/군/구 `current`와 읍/면/동 목록은 비선택 상태를 유지한다. | AC-021 |
| FR-022 | Should | 지역 항목 타이포그래피 일관성 | 시/군/구 컬럼의 `시/도 전체` 체크박스 라벨 텍스트와 일반 지역 item 텍스트(시/도/시/군/구/읍/면/동)는 동일한 타이포그래피 기준(`font-family`, `font-size`, `font-weight`, `line-height`)을 사용해야 한다. 선택/강조 상태는 색상·배경으로 구분하되 타이포그래피 값은 일관되게 유지한다. | AC-022 |
| FR-023 | Must | 하위 선택의 상위 지역 색상 표시 | 읍/면/동(예: `역삼동`)이 선택된 경우뿐 아니라 시/군/구 또는 읍/면/동 컬럼에서 `전체` 항목(예: `서울특별시 전체`, `강남구 전체`)이 하위 선택으로 선택된 경우에도 해당 경로의 상위 항목(시/도의 `서울특별시`, 시/군/구의 `강남구`)은 `current`/직접 `selected`와 구분되는 별도 색상 상태(`has-descendant-selected`)로 표시되어야 한다. 색상 시스템은 파랑 계열을 유지하되 `current`와 `has-descendant-selected`의 진하기/채도와 보조 시각 단서(예: 보더 스타일)를 명확히 분리해야 한다. 이 상태는 하위 선택이 1개 이상 존재하는 동안 유지되고, 마지막 하위 선택 해제 시 기본 상태로 복귀한다. | AC-023 |

## 8. 컴포넌트 및 API 요구사항

### 8.1 데이터 모델

| 타입 | 필드 | 제약 |
| --- | --- | --- |
| `Region` | `displayName: string`, `name: string`, `code: string` | `code`는 선택 ID로 사용되므로 같은 레벨에서 유일해야 한다. |
| `SelectedCondition` | `id: string`, `displayName: string` | 칩 렌더링 최소 단위 |
| `SeletedRegionCondition` | `SelectedCondition + sido + sigungu + eupmyeondong` | 지역 조건 전용 타입 |
| `SeletedKeywordCondition` | `SelectedCondition` 확장 | 키워드 조건(현재 UI 입력 미구현) |

### 8.2 `ComposableSearchProps`

| 필드 | 타입 | 필수 | 기본값 | 동작 |
| --- | --- | --- | --- | --- |
| `selectorsProps` | `ComposableSelectProps[]` | 아니오 | `undefined` | selector 렌더링 대상 |
| `className` | `string` | 아니오 | `''` | 루트 className에 병합 |
| `style` | `CSSProperties` | 아니오 | `undefined` | 루트 inline style |
| `placeHolder` | `string` | 아니오 | `undefined` | 현재 구현에서는 미사용 |

### 8.3 `ComposableSelectProps` (Union)

- `RegionSelectProps`
- `KeywordSelectProps`

### 8.4 소비자 노출 Region API(목표 계약)

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `type` | `'region'` | 예 | selector 타입 구분자 |
| `findAllSidos` | `() => Region[]` | 예 | 시/도 목록 공급 |
| `findAllSigungus` | `(sidoCode: string) => Region[]` | 예 | 시/군/구 목록 공급 |
| `findAllEupmyeondongs` | `(sigunguCode: string) => Region[]` | 예 | 읍/면/동 목록 공급 |
| `options.placeHolder` | `string` | 아니오 | 트리거 표시 텍스트 |
| `options.onChange` | `(selectedItems: ComposableSelectItem[]) => void` | 아니오 | 선택 변경 확장 포인트 |
| `options.onSelectedEupmyeondong` | `(selected: Region) => void` | 아니오 | 읍/면/동 선택 확장 포인트 |
| `options.onClick` | `() => void` | 아니오 | 트리거 클릭 확장 포인트 |

### 8.5 소비자 노출 Keyword API

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `type` | `'keyword'` | 예 | selector 타입 구분자 |
| `options.placeHolder` | `string` | 아니오 | 버튼 텍스트 |
| `options.onClick` | `() => void` | 아니오 | 클릭 이벤트 |

### 8.6 상태 전이 규칙

- ST-001: detailed 영역은 단일 boolean 상태(`isOpenDetailedConditionArea`)로 열림/닫힘 제어
- ST-002: `selectedConditions`는 내부 상태로 관리되며 외부로 직접 노출되지 않음
- ST-003: 지역 체크박스 토글 시 ID 기반 추가/삭제
- ST-004: 전체 삭제 시 `selectedConditions = []`

## 9. 비기능 요구사항

| ID | 우선순위 | 요구사항 | 측정/판정 기준 |
| --- | --- | --- | --- |
| NFR-001 | Must | 의존성 최소화 | 런타임 의존성은 `react`, `react-dom`만 사용 |
| NFR-002 | Must | npm 배포 전제 설계 | 컴포넌트가 외부 데이터 함수 주입 방식으로 동작하고 전역 런타임 수정 금지 |
| NFR-003 | Must | 스타일 충돌 최소화 | 컴포넌트 전용 class 기반 스타일을 사용하고 전역 selector 오염을 피함 |
| NFR-004 | Should | 접근성 기본 제공 | 버튼에 `type="button"`, 삭제 버튼 `aria-label` 제공 |
| NFR-005 | Should | 빈 데이터 안전성 | 데이터가 빈 배열이어도 런타임 오류 없이 빈 상태 UI 렌더링 |
| NFR-006 | Could | 대량 조건 성능 | 조건 200개까지 칩 렌더링/삭제 조작이 체감 지연 없이 동작 |

## 10. 수용 기준

| ID | 시나리오 | 기대 결과 | 연결 요구사항 |
| --- | --- | --- | --- |
| AC-001 | `ComposableSearch` 렌더링 | selector, detailed, selected 영역이 순서대로 나타난다. | FR-001 |
| AC-002 | `selectorsProps = [region, keyword]` | region selector가 먼저, keyword selector가 다음에 렌더링된다. | FR-002 |
| AC-003 | region 버튼 2회 클릭 | detailed 영역이 open -> closed로 토글된다. | FR-003 |
| AC-004 | RegionSelect 마운트 후 | detailed 영역 내용이 지역 3단 컬럼으로 대체된다. | FR-004 |
| AC-005 | 초기 마운트 | `findAllSidos()` 결과가 시/도 컬럼 children으로 표시된다. | FR-005 |
| AC-006 | 컬럼 노드 변경(초기 렌더 포함) | 시/도/시/군/구 `SelectableRegionColumn`은 사용자 직접 클릭 전까지 `current`가 비선택 상태이며, `onSelectedRegion` 자동 호출이 발생하지 않는다. | FR-006 |
| AC-007 | 시/도 선택 | `findAllSigungus(selectedSido.code)`가 호출되고 시/군/구 목록이 갱신된다. | FR-007 |
| AC-008 | 시/군/구 선택 | `findAllEupmyeondongs(selectedSigungu.code)`가 호출되고 읍/면/동 목록이 갱신된다. | FR-008 |
| AC-009 | 읍/면/동 체크 | 선택 조건이 칩으로 추가되고 경로 문자열이 `>` 구분자로 표시된다. | FR-009 |
| AC-010 | 동일 읍/면/동 재체크 | 기존 칩이 제거되어 중복이 남지 않는다. | FR-010 |
| AC-011 | 전체 지역 조건 + 상세 조건 혼합 | 동일 시/군/구 내에서 상호 배타 상태를 유지한다. | FR-011 |
| AC-012 | 조건 3개 선택 | 하단 영역에 칩 3개가 렌더링된다. | FR-012 |
| AC-013 | 칩 삭제 버튼 클릭 | 해당 칩 1개만 제거된다. | FR-013 |
| AC-014 | 전체 삭제 버튼 클릭 | 모든 칩이 제거되고 버튼은 disabled 된다. | FR-014 |
| AC-015 | 시/군/구 또는 읍/면/동 컬럼이 빈 상태 | 상위 지역 미선택 상태에서는 `상위 지역을 먼저 선택해 주세요.`가 표시되고, 상위 선택 이후 실제 빈 데이터에서는 `표시할 지역이 없습니다.`가 표시된다. | FR-015 |
| AC-016 | current/selected 항목 비교 | current는 배경 강조, selected는 텍스트 강조 스타일이 적용된다. | FR-016 |
| AC-017 | `options.onChange` 전달 | 콜백 확장 포인트가 존재하며 선택 모델 업데이트 시 연동 가능하다. | FR-017 |
| AC-018 | keyword 버튼 클릭 | `options.onClick`이 정의된 경우 호출된다. | FR-018 |
| AC-019 | `서울특별시 전체` ↔ `서울특별시 강남구`, `부산광역시 해운대구` → `부산광역시 전체` 전환 | 마지막에 선택한 조건만 유지되고 동일 시/도 범위의 상충 조건은 자동 해제된다. `부산광역시 전체` 선택 직후 기존 `해운대구` 조건이 제거되어야 한다. | FR-019 |
| AC-020 | 시/군/구 컬럼에서 `서울특별시 전체` 체크 | 조건이 즉시 추가/해제되고, 읍/면/동 컬럼에는 동일한 `서울특별시 전체` 체크 옵션이 중복 노출되지 않는다. | FR-007, FR-020 |
| AC-021 | `서울특별시` 선택 직후 또는 시/군/구 컬럼에서 `서울특별시 전체` 체크 후 해제(사용자가 `강남구`를 직접 클릭하지 않음) | `강남구`가 자동 `current`/선택되지 않고 시/군/구 `current`는 비선택 상태를 유지한다. 사용자가 `강남구`를 직접 클릭했을 때만 `강남구` `current` 및 읍/면/동 목록 갱신이 발생한다. | FR-021 |
| AC-022 | 동일 컬럼 맥락에서 체크박스 항목(예: `서울특별시 전체`, `역삼동`)과 일반 지역 item(예: `서울특별시`, `강남구`)을 비교 | 비교 대상 텍스트의 `font-family`, `font-size`, `font-weight`, `line-height`가 동일하다. `selected/current/hover` 상태에서도 타이포그래피는 유지되고 색상/배경만 변경된다. | FR-022 |
| AC-023 | `서울특별시 > 강남구 > 역삼동` 또는 `서울특별시 > 강남구 전체`를 선택한 상태에서 시/도/시/군/구 컬럼을 확인 | 시/도 컬럼의 `서울특별시`와 시/군/구 컬럼의 `강남구`가 하위 선택 존재를 나타내는 별도 색상으로 표시된다. `current`와 `has-descendant-selected`는 모두 파랑 계열을 사용하더라도 진하기/채도 또는 보더 스타일 차이로 즉시 구분되어야 하며, `역삼동`/`강남구 전체` 해제 시 즉시 기본 색상으로 복귀한다. | FR-023 |

## 11. QA 및 검증 계획

### 11.1 정적 검증

- TypeScript 빌드: `npm run build`
- 린트: `npm run lint`
- 공개 API 타입 검증: 소비자 예제 코드에서 `ComposableSearchProps`/`RegionSelectProps`/`KeywordSelectProps` 확인

### 11.2 동작 검증 시나리오

- QA-001: 초기 진입 시 시/도 목록 표시
- QA-002: 시/도 변경 시 시/군/구 갱신
- QA-003: 시/군/구 변경 시 읍/면/동 갱신
- QA-004: 읍/면/동 다중 선택/해제
- QA-005: 칩 개별 삭제/전체 삭제
- QA-006: 상위 지역 미선택 상태와 빈 데이터 반환 상태를 구분해 한국어 빈 상태 안내 문구를 렌더링
- QA-007: 시/도 전체와 하위 시/군/구 상호 배타 동작 검증(예: `서울특별시 전체` ↔ `서울특별시 강남구`, `부산광역시 해운대구` 선택 후 `부산광역시 전체` 체크 시 해운대구 자동 해제)
- QA-008: 시/군/구 컬럼 `서울특별시 전체` 직접 체크 시 즉시 반영되고 읍/면/동 컬럼에 동일 전체 옵션이 중복 노출되지 않음
- QA-009: 시/군/구 컬럼 목록 갱신(시/도 선택 변경, `서울특별시 전체` 체크 후 해제) 시 `강남구`가 자동 `current`/선택되지 않고, 사용자가 시/군/구를 직접 클릭하기 전까지 비선택 상태가 유지됨
- QA-010: 시/군/구 `시/도 전체` 체크박스 텍스트, 읍/면/동 체크박스 텍스트, 일반 지역 item 텍스트의 타이포그래피(`font-family/font-size/font-weight/line-height`)가 동일하게 적용됨
- QA-011: `서울특별시 > 강남구 > 역삼동` 및 `서울특별시 > 강남구 전체` 선택 시 시/도 컬럼 `서울특별시`와 시/군/구 컬럼 `강남구`가 하위 선택 존재를 나타내는 별도 색상(`has-descendant-selected`)으로 표시되고, `current`와는 파랑 계열 내 진하기/보더 스타일 차이로 구분되며, 마지막 하위 선택(`역삼동` 또는 `강남구 전체`) 해제 시 원복됨

### 11.3 2026-02-09 기준 현행 구현 검증 결과

- `npm.cmd run build` 실패
- 실패 원인: `src/components/ComposableSearch.tsx` 구문 오류 (`onSelectedWholeRegionCondition` 내부 미완성 함수 선언)

## 12. 릴리스 및 버저닝 계획

- 버전 정책: SemVer (`MAJOR.MINOR.PATCH`)
- 제안 초기 릴리스: `0.1.0-alpha`
- `0.1.0-alpha` 게이트
- 필수: TypeScript 빌드 통과
- 필수: FR-001~FR-010, FR-012~FR-015 수동 검증 통과
- 필수: PRD/PRD.en 동기화 완료
- `0.1.x`: 버그 수정(선택 로직, 타입 계약, 렌더 경고)
- `0.2.0`: keyword 실제 입력 모델 및 외부 상태 연동 API 추가 검토

## 13. 리스크 및 오픈 이슈

- OI-001 (`Must`): `ComposableSearch.tsx` 내 미완성 코드로 빌드가 실패한다.
- OI-002 (`Must`): `RegionSelectProps` 타입이 소비자 주입 props와 내부 주입 props를 완전히 분리하지 못해 타입 계약 불일치 위험이 있다.
- OI-003 (`Should`): `onSelectedWholeRegionCondition`은 정의되어 있으나 호출 경로가 없어 죽은 코드 상태다.
- OI-004 (`Should`): `options.onSelectedEupmyeondong`, `options.onClick`(region), `options.onChange`가 실사용 경로에 완전히 연결되지 않았다.
- OI-005 (`Should`): `SelectedConditionBasket` map 렌더에 `key` prop이 없어 React 경고 가능성이 있다.
- OI-006 (`Should`): `SelectableRegionColumn`의 `console.log`가 프로덕션 번들에 남아 있다.
- OI-007 (`Should`): `index.css`의 전역 `button`, `body`, `:root` 스타일은 라이브러리 소비자 환경과 충돌할 수 있다.
- OI-008 (`Could`): 법정동 샘플 코드에 자릿수 이상치(`44182031000`, `55011033000`, `5Terms013010800`)가 포함되어 데이터 품질 리스크가 있다.
- OI-009 (`Could`): `ComposableSearchProps.placeHolder`는 현재 미사용 필드다.
- OI-010 (`Must`): 시/군/구 컬럼에서 `시/도 전체`를 선택한 뒤 읍/면/동 컬럼에 동일한 `시/도 전체` 체크 옵션이 중복 노출되어 선택 단계가 불필요하게 중복된다.
- OI-011 (`Must`): 시/군/구 컬럼 목록 갱신(시/도 선택 변경, `서울특별시 전체` 체크 후 해제 등) 시 첫 시/군/구(`강남구`)가 자동 `current`/선택되어 사용자의 명시적 선택 이전에 하위 상태가 변경된다.
- OI-012 (`Should`): 시/군/구 `시/도 전체` 체크박스/읍·면·동 체크박스 라벨 텍스트와 일반 지역 item 텍스트의 폰트/사이즈가 일치하지 않아 지역 선택 UI가 시각적으로 부자연스럽다.
- OI-013 (`Must`): `강남구 > 역삼동`뿐 아니라 시/군/구/읍/면/동의 `전체` 항목(예: `서울특별시 전체`, `강남구 전체`)이 하위 선택으로 잡힌 경우에도 상위 컬럼(시/도 `서울특별시`, 시/군/구 `강남구`)에 하위 선택 존재를 나타내는 별도 색상 표시가 누락되어 현재 선택 맥락 파악이 어렵다.
