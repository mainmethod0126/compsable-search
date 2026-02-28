# react-composable-search PRD

## 1. 제품 요약

`react-composable-search`는 검색 조건 선택 UI를 조합형으로 제공하는 React 컴포넌트다. 현재 구현은 하나의 컨테이너에서 다음 3개 영역을 제공한다.

- Selector 영역: `region`, `keyword` 트리거 렌더링
- Detailed Conditions 영역: 지역 3단 컬럼(시/도, 시/군/구, 읍/면/동) 또는 키워드 입력 패널 렌더링
- Selected Conditions 영역: 선택 조건 칩 목록, 개별 삭제, 전체 삭제

현재 구현은 지역 계층 선택, 지역 검색 미리보기 선택, 키워드 토큰 입력 상태머신, 콜백 안전 실행(예외 격리)을 포함한다.

## 2. 문제 정의

검색 조건 UI는 도메인별로 반복 구현되며, 특히 지역 필터는 계층 탐색/전체 선택/상호 배타 규칙/칩 동기화가 복잡하다. 또한 키워드 입력은 정규화/중복 방지/최대 개수 제한을 일관되게 유지하기 어렵다.

해결해야 할 문제:

- 재사용 가능한 지역/키워드 조건 선택 컴포넌트 표준화
- 외부 데이터 소스 주입 방식으로 도메인 데이터 의존성 분리
- 지역 + 키워드 조합 상태를 단일 onChange payload로 제공
- 콜백 예외가 발생해도 UI 흐름을 중단하지 않는 안정성 확보

## 3. 대상 사용자 및 핵심 사용 사례

### 3.1 대상 사용자

- React 프론트엔드 개발자: 검색 조건 UI를 빠르게 통합
- 컴포넌트 유지보수자: API 계약/회귀를 관리
- 최종 사용자: 지역과 키워드 조건을 조합해 탐색

### 3.2 핵심 사용 사례

- US-001: 개발자는 `selectorsProps`로 `region`, `keyword`를 조합해 한 번에 렌더링한다.
- US-002: 사용자는 `region` 트리거로 지역 패널을 열고 시/도 -> 시/군/구 -> 읍/면/동을 선택한다.
- US-003: 사용자는 시/군/구 컬럼의 시/도 전체 체크박스 또는 읍/면/동 체크박스를 토글한다.
- US-004: 사용자는 지역 검색 입력창에서 검색 후 미리보기 항목을 클릭해 조건을 즉시 반영한다.
- US-005: 사용자는 `keyword` 트리거로 키워드 입력 패널을 열고 Enter/Blur로 토큰을 확정한다.
- US-006: 사용자는 입력이 비어 있을 때 Backspace로 마지막 키워드 토큰을 삭제한다.
- US-007: 사용자는 하단 칩에서 개별 삭제 또는 전체 삭제를 수행한다.
- US-008: 개발자는 `region.options.onChange`에서 지역+키워드 통합 payload를 받는다.
- US-009: 개발자는 `keyword.options.onInvalidToken`으로 키워드 입력 오류를 후처리한다.
- US-010: 개발자는 콜백 내부 예외가 발생해도 UI가 계속 동작함을 보장받는다.

## 4. 목표

- G-001 (`Must`): 지역/키워드 조건 선택 UI를 단일 컴포넌트로 제공
- G-002 (`Must`): 조건 변경을 칩 UI와 callback payload에 즉시 반영
- G-003 (`Must`): 지역 전체/상세 조건 충돌을 자동 해소
- G-004 (`Must`): 키워드 토큰 정규화/중복 방지/개수·길이 제한 제공
- G-005 (`Should`): 공개 타입/API를 단순하고 하위 호환 가능하게 유지
- G-006 (`Should`): 콜백 예외 발생 시에도 사용자 상호작용 흐름 유지

## 5. 비목표

- NG-001: 검색 결과 조회 API, 페이징, 정렬 제공
- NG-002: 비동기 지역 로딩/에러 상태 UI 내장
- NG-003: 서버 상태 관리 라이브러리 내장
- NG-004: 고급 키보드 탐색(roving tabindex 등) 완성
- NG-005: 완전한 i18n 시스템 제공

## 6. 이번 릴리스 범위

### 6.1 포함 범위

- Selector 영역 렌더링 및 단일 패널 토글(`region`/`keyword`)
- 지역 패널 내 검색 입력/미리보기 목록/항목 클릭 선택
- 3단 지역 컬럼(선택형 2개 + 체크형 1개) 및 전체/상세 상호 배타 규칙
- 하위 선택 존재 색상 상태(`has-descendant-selected`) 표시
- 키워드 입력 패널(라벨/가이드/카운터/오류 문구)
- 키워드 상태머신(정규화, 중복/길이/최대개수 제한, Enter/Blur/Backspace)
- 선택 조건 칩 렌더링, 개별 삭제, 전체 삭제
- `region.options.onChange` 통합 payload(지역 + 키워드) 전달
- 콜백 안전 실행(예외 격리 및 `console.error` 로깅)

### 6.2 제외 범위

- 검색 결과가 0건일 때 전용 "검색 결과 없음" UI 노출
- 키워드 자동완성/추천어 API
- 외부 상태 완전 제어 모드(fully controlled component)
- 패키지 배포 파이프라인 자동화

## 7. 기능 요구사항

| ID | 우선순위 | 요구사항 | 상세 명세 | 연결 수용 기준 |
| --- | --- | --- | --- | --- |
| FR-001 | Must | 컨테이너 구조 | `ComposableSearch`는 selector/detailed/selected 영역을 순서대로 렌더링한다. | AC-001 |
| FR-002 | Must | Selector 순서 보존 | `selectorsProps` 배열 순서를 그대로 렌더링한다. | AC-001 |
| FR-003 | Must | 단일 패널 토글 | `region`과 `keyword` 패널은 동시에 열리지 않으며 트리거 클릭으로 토글된다. | AC-002 |
| FR-004 | Must | 지역 검색 UI 배치 | 지역 패널 오픈 시 검색 입력 영역은 selector 아래, detailed 영역 바깥에 표시된다. | AC-003 |
| FR-005 | Must | 시/도 초기 로딩 | region 데이터 소스에서 `findAllSidos()`를 호출해 시/도 컬럼을 구성한다. | AC-004 |
| FR-006 | Must | 자동 current 선택 금지 | `SelectableRegionColumn`은 사용자 클릭 전 `current`를 자동 지정하지 않는다. | AC-005 |
| FR-007 | Must | 시/도 선택 후 시/군/구 갱신 | 시/도 선택 시 `findAllSigungus(sidoCode)`로 시/군/구를 갱신하고, 시/도 전체 체크를 제공한다. | AC-006 |
| FR-008 | Must | 시/군/구 선택 후 읍/면/동 갱신 | 시/군/구 선택 시 `findAllEupmyeondongs(sigunguCode)`를 호출하고, 목록 선두에 `시/군/구 전체`를 삽입한다. | AC-007 |
| FR-009 | Must | 지역 토글 동작 | 지역 체크 항목은 `condition.id` 기준으로 추가/해제 토글되며 중복을 남기지 않는다. | AC-008 |
| FR-010 | Must | 상호 배타 규칙 | 같은 시/군/구 범위의 전체/상세 조건, 같은 시/도 범위의 시/도 전체/하위 조건은 동시 유지되지 않는다. | AC-008 |
| FR-011 | Should | 하위 선택 인디케이터 | 하위 선택 존재 시 상위 시/도/시군구 항목에 `has-descendant-selected` 시각 상태를 적용한다. | AC-009 |
| FR-012 | Must | 빈 상태 문구 구분 | 상위 미선택과 실제 빈 데이터 상태를 구분해 안내 문구를 렌더링한다. | AC-010 |
| FR-013 | Must | 칩 동기화 | 선택 조건은 칩으로 렌더링되며 개별 삭제/전체 삭제를 지원한다. | AC-011 |
| FR-014 | Must | 지역 검색 인덱스/필터 | 지역 트리를 평탄화해 검색 인덱스를 생성하고 부분 일치 + 결과 제한(`searchResultLimit`, 기본 20)을 적용한다. | AC-012 |
| FR-015 | Must | 검색 결과 선택 매핑 | 시/도/시군구/읍면동 검색 결과를 `SelectedRegionCondition`으로 매핑해 토글하고, 검색어를 초기화한다. | AC-012 |
| FR-016 | Must | 키워드 패널 렌더링 | `keyword` 트리거 클릭 시 키워드 입력 패널(라벨/가이드/카운터)을 렌더링한다. | AC-013 |
| FR-017 | Must | 키워드 정규화/제한 | trim, 공백 축약, 대소문자 정책과 중복/길이/최대 개수 제한을 적용한다. | AC-013 |
| FR-018 | Must | 키워드 입력 이벤트 | Enter/Blur는 입력 확정, 입력 비어 있을 때 Backspace는 마지막 토큰 삭제를 수행한다. | AC-013 |
| FR-019 | Should | 키워드 오류 콜백 | 유효하지 않은 토큰 확정 시 `onInvalidToken(error, context)`를 호출한다. | AC-013 |
| FR-020 | Must | 통합 onChange payload | `region.options.onChange` payload는 `SearchSelectionItem[]`이며 지역 조건 후 키워드 조건 순서로 전달된다. | AC-014 |
| FR-021 | Must | 콜백 예외 격리 | region/keyword 콜백에서 예외가 발생해도 UI 상태 갱신은 계속되어야 한다. | AC-015 |
| FR-022 | Should | 타이포그래피 일관성 | 체크박스 라벨과 일반 지역 item 텍스트는 동일한 타이포그래피 계약을 유지한다. | AC-016 |
| FR-023 | Should | 리스트 뷰포트 고정 | 지역 컬럼은 아이템 높이 36px 기준 약 6개가 보이는 고정 세로 뷰포트를 유지한다. 시/도 전체 토글이 있는 컬럼은 `전체 1개 + 리스트 5개` 구성을 유지한다. | AC-017 |
| FR-024 | Must | 지역 선택 확정 콜백 | 새 지역 조건이 추가될 때만 `onSelectedEupmyeondong`이 호출되며, 해제 시에는 호출되지 않는다. | AC-018 |

## 8. 컴포넌트 및 API 요구사항

### 8.1 데이터 모델

| 타입 | 필드 | 제약 |
| --- | --- | --- |
| `Region` | `displayName`, `name`, `code` | `code`는 식별자이며 충돌 없이 유일해야 한다. |
| `SelectedRegionCondition` | `id`, `displayName`, `sido`, `sigungu`, `eupmyeondong` | 지역 선택 항목 |
| `SelectedKeywordCondition` | `id`, `displayName`, `keyword`, `normalizedKeyword` | 키워드 선택 항목 |
| `SearchSelectionItem` | `SelectedRegionCondition \| SelectedKeywordCondition` | onChange payload 타입 |

### 8.2 `ComposableSearchProps`

| 필드 | 타입 | 필수 | 기본값 | 비고 |
| --- | --- | --- | --- | --- |
| `selectorsProps` | `ComposableSelectProps[]` | 아니오 | `[]` | selector 조합 |
| `className` | `string` | 아니오 | `undefined` | 루트 병합 class |
| `style` | `CSSProperties` | 아니오 | `undefined` | 루트 inline style |
| `placeHolder` | `string` | 아니오 | `undefined` | 현재 미사용(하위 호환 필드) |

### 8.3 Region API

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `type` | `'region'` | 예 | selector 타입 |
| `findAllSidos` | `() => Region[]` | 예 | 시/도 목록 |
| `findAllSigungus` | `(sidoCode: string) => Region[]` | 예 | 시/군/구 목록 |
| `findAllEupmyeondongs` | `(sigunguCode: string) => Region[]` | 예 | 읍/면/동 목록 |
| `options.placeHolder` | `string` | 아니오 | region 트리거 텍스트 |
| `options.searchInputLabel` | `string` | 아니오 | 검색 input 접근성 라벨 |
| `options.searchInputPlaceholder` | `string` | 아니오 | 검색 input placeholder |
| `options.searchIdleMessage` | `string` | 아니오 | 검색어 없을 때 안내 |
| `options.searchNoResultMessage` | `string` | 아니오 | 타입에는 있으나 현재 UI 미사용 |
| `options.searchResultLimit` | `number` | 아니오 | 검색 결과 최대 개수(기본 20) |
| `options.searchInputIcon` | `ReactNode` | 아니오 | 검색 아이콘 커스터마이즈 |
| `options.onChange` | `(selectedItems: SearchSelectionItem[]) => void` | 아니오 | 선택 변경 콜백 |
| `options.onSelectedEupmyeondong` | `(selected: Region) => void` | 아니오 | 신규 지역 조건 추가 시 콜백 |
| `options.onClick` | `() => void` | 아니오 | region 트리거 클릭 콜백 |

### 8.4 Keyword API

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `type` | `'keyword'` | 예 | selector 타입 |
| `options.placeHolder` | `string` | 아니오 | keyword 트리거 텍스트 |
| `options.label` | `string` | 아니오 | input 라벨 |
| `options.inputPlaceholder` | `string` | 아니오 | input placeholder |
| `options.guideText` | `string` | 아니오 | 하단 가이드 문구 |
| `options.maxTokens` | `number` | 아니오 | 최대 토큰 수(기본 5) |
| `options.maxTokenLength` | `number` | 아니오 | 최대 토큰 길이(기본 20) |
| `options.normalization.trim` | `boolean` | 아니오 | 앞뒤 공백 제거 여부 |
| `options.normalization.collapseWhitespace` | `boolean` | 아니오 | 연속 공백 1칸 축약 여부 |
| `options.normalization.casePolicy` | `'preserve' \| 'lower'` | 아니오 | 대소문자 정책 |
| `options.onInvalidToken` | `(error, context) => void` | 아니오 | 유효성 실패 콜백 |
| `options.onClick` | `() => void` | 아니오 | keyword 트리거 클릭 콜백 |

### 8.5 상태 전이 규칙

- ST-001: 상세 패널 상태는 `activePanelMode: 'none' | 'region' | 'keyword'`로 관리된다.
- ST-002: 지역 조건과 키워드 토큰은 내부 상태로 관리되고 화면 하단 칩 목록에서 통합 표시된다.
- ST-003: region toggle/keyword commit/remove/clear-all 이벤트마다 통합 payload 기준 onChange가 갱신된다.
- ST-004: `CLEAR_ALL`은 지역/키워드 조건을 모두 초기화한다.

## 9. 비기능 요구사항

| ID | 우선순위 | 요구사항 | 판정 기준 |
| --- | --- | --- | --- |
| NFR-001 | Must | 최소 런타임 의존성 | 런타임 의존성은 `react`, `react-dom` |
| NFR-002 | Must | 스타일 스코프 격리 | `cs-` 네임스페이스 기반 클래스 스타일 사용 |
| NFR-003 | Must | 콜백 내결함성 | callback throw 시에도 UI 상태 전이는 지속 |
| NFR-004 | Should | 기본 접근성 | 주요 액션 버튼 `type="button"`, 입력 라벨 제공 |
| NFR-005 | Should | 대량 데이터 안정성 | 다수 칩/대규모 지역 데이터에서도 기능 회귀 없이 동작 |

## 10. 수용 기준

| ID | 시나리오 | 기대 결과 | 연결 요구사항 |
| --- | --- | --- | --- |
| AC-001 | `selectorsProps = [region, keyword]`로 렌더링 | 3개 영역이 순서대로 렌더링되고 selector 순서를 보존한다. | FR-001, FR-002 |
| AC-002 | region/keyword 트리거를 번갈아 클릭 | 항상 하나의 상세 패널만 열리고 재클릭 시 닫힌다. | FR-003 |
| AC-003 | region 패널 열기 | 검색 입력 영역이 selector 아래에 표시되고 detailed 영역 바깥에 유지된다. | FR-004 |
| AC-004 | region 패널 오픈 직후 | `findAllSidos()` 결과가 시/도 컬럼에 렌더링된다. | FR-005 |
| AC-005 | 초기 렌더/목록 갱신 직후 | 시/도/시군구 `current`가 자동 선택되지 않는다. | FR-006 |
| AC-006 | 시/도 선택 및 시/도 전체 토글 | 시/군/구 목록이 갱신되고 시/도 전체 체크가 동작한다. | FR-007 |
| AC-007 | 시/군/구 선택 | 읍/면/동 목록이 갱신되고 선두에 `시/군/구 전체`가 표시된다. | FR-008 |
| AC-008 | 전체/상세를 교차 토글 | 동일 범위에서 상충 조건이 자동 해제되며 중복이 남지 않는다. | FR-009, FR-010 |
| AC-009 | 하위 조건 선택/해제 | 상위 컬럼의 `has-descendant-selected` 상태가 반영/해제된다. | FR-011 |
| AC-010 | 상위 미선택 vs 빈 데이터 | 서로 다른 빈 상태 문구가 원인에 맞게 표시된다. | FR-012 |
| AC-011 | 칩 삭제/전체 삭제 | 조건 칩이 상태와 동기화되어 개별/전체 삭제가 동작한다. | FR-013 |
| AC-012 | 지역 검색어 입력 후 결과 클릭 | 부분 일치+limit 규칙이 적용되고 선택 시 조건 반영 후 검색어가 초기화된다. | FR-014, FR-015 |
| AC-013 | 키워드 입력(Enter/Blur/Backspace) | 토큰 확정/삭제, 정규화, 중복·길이·개수 제한, 오류 메시지와 onInvalidToken이 동작한다. | FR-016, FR-017, FR-018, FR-019 |
| AC-014 | 지역+키워드를 함께 선택 | `onChange` payload에 두 조건이 함께 전달된다. | FR-020 |
| AC-015 | callback에서 예외 throw | 에러 로그는 기록되지만 UI 흐름/선택 상태는 유지된다. | FR-021 |
| AC-016 | 체크박스 라벨과 일반 item 비교 | 동일 타이포그래피 계약을 유지한다. | FR-022 |
| AC-017 | 지역 컬럼 스크롤 뷰포트 확인 | 아이템 높이 36px 기준 약 6개 노출 레이아웃이 유지된다. | FR-023 |
| AC-018 | 지역 선택 확정/해제 | 신규 선택 시에만 `onSelectedEupmyeondong`이 호출된다. | FR-024 |

## 11. QA 및 검증 계획

### 11.1 정적 검증

- `npm test`
- `npm run lint`
- `npm run build`

### 11.2 동작 검증 시나리오

- QA-001: selector 순서/패널 토글 검증
- QA-002: 시/도 -> 시/군/구 -> 읍/면/동 로딩/선택 검증
- QA-003: 전체/상세 상호 배타 규칙 검증
- QA-004: 하위 선택 인디케이터(`has-descendant-selected`) 검증
- QA-005: 지역 검색 미리보기 선택 검증
- QA-006: 키워드 토큰 정규화/제약/오류 콜백 검증
- QA-007: 칩 개별 삭제/전체 삭제 및 onChange payload 검증
- QA-008: callback 예외 발생 시 UI 지속 동작 검증
- QA-009: 스타일 스코프/타이포그래피/고정 아이템 높이 검증

### 11.3 2026-02-28 기준 구현 검증 결과

- `npm test` 통과 (`11 files`, `74 tests`)
- `npm run lint` 통과
- `npm run build` 실패
- 실패 원인: TypeScript TS18048 (`src/components/ComposableSearch.tsx:345`, `:346`, `:347`, `:349`)에서 `regionSelector`가 `undefined` 가능성으로 판정됨

## 12. 릴리스 및 버저닝 계획

- 버전 정책: SemVer (`MAJOR.MINOR.PATCH`)
- 현재 기준 타깃: `0.2.x` 안정화
- 릴리스 게이트:
  - 필수: `npm test`, `npm run lint`, `npm run build` 통과
  - 필수: PRD/PRD.en 동기화
  - 권장: 데모(App) 시나리오 수동 점검

## 13. 리스크 및 오픈 이슈

- OI-001 (`Must`): `npm run build`가 TS18048 타입 오류로 실패한다(`ComposableSearch.tsx` `regionSelector` nullability 처리 필요).
- OI-002 (`Should`): `RegionSelectOptions.searchNoResultMessage`가 공개 타입에 존재하지만 현재 UI 렌더 경로에서 사용되지 않는다.
- OI-003 (`Could`): `ComposableSearchProps.placeHolder`는 하위 호환 필드로 남아 있으나 런타임에서 사용되지 않는다.
- OI-004 (`Should`): CSS `:has(...)` 셀렉터를 활용한 일부 레이아웃 규칙은 구형 브라우저 지원 범위를 별도 검토해야 한다.
