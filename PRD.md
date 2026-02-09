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
- US-003: 최종 사용자는 읍/면/동 체크박스를 토글해 조건을 추가/제거한다.
- US-004: 최종 사용자는 하단 칩의 삭제 버튼으로 개별 조건을 제거한다.
- US-005: 최종 사용자는 전체 삭제 버튼으로 모든 조건을 일괄 제거한다.

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
| FR-006 | Must | 컬럼 초기 current 규칙 | `SelectableRegionColumn`은 parent가 있으면 parent를 current로, 없으면 첫 child를 current로 설정하고 `onSelectedRegion`을 즉시 호출한다. | AC-006 |
| FR-007 | Must | 시/도 선택 후 시/군/구 로딩 | 시/도 선택 시 `findAllSigungus(sidoCode)`로 시/군/구 컬럼을 갱신한다. parent 라벨은 `displayName + " 전체"`로 만든다. | AC-007 |
| FR-008 | Must | 시/군/구 선택 후 읍/면/동 로딩 | 시/군/구 선택 시 `findAllEupmyeondongs(sigunguCode)`로 읍/면/동 체크 컬럼을 갱신한다. parent 라벨은 `displayName + " 전체"`다. | AC-008 |
| FR-009 | Must | 읍/면/동 선택 토글 | 체크박스 변경 시 조건 ID(`eupmyeondong.code`) 기준으로 토글한다. 추가 시 `displayName`은 `시도>시군구>읍면동` 포맷을 사용한다. | AC-009 |
| FR-010 | Must | 중복 방지 | 동일 ID 조건은 중복 저장하지 않는다. 다시 선택하면 제거한다. | AC-010 |
| FR-011 | Should | 상위/하위 지역 충돌 규칙 | `sigungu.code === eupmyeondong.code`인 "전체 지역" 조건은 같은 시/군/구의 상세 조건과 상호 배타적으로 동작한다. | AC-011 |
| FR-012 | Must | 선택 조건 칩 표시 | 선택 조건 배열을 칩 목록으로 렌더링하고 각 칩은 삭제 버튼을 가진다. | AC-012 |
| FR-013 | Must | 개별 삭제 | 칩 삭제 버튼 클릭 시 해당 `conditionId`를 제거한다. | AC-013 |
| FR-014 | Must | 전체 삭제 | 전체 삭제 버튼 클릭 시 모든 조건을 제거한다. 조건이 없으면 버튼은 disabled 상태다. | AC-014 |
| FR-015 | Must | 빈 목록 표시 | 각 지역 컬럼 데이터가 비어 있으면 `No items to display.` 문구를 렌더링한다. | AC-015 |
| FR-016 | Should | 시각 상태 표기 | `current` 항목은 강조 배경, `selected` 항목은 강조 텍스트로 구분한다. | AC-016 |
| FR-017 | Could | Region options 콜백 | `options.onChange`, `options.onSelectedEupmyeondong`, `options.onClick` 확장 포인트를 제공한다. | AC-017 |
| FR-018 | Must | Keyword 트리거 | `keyword` selector는 아이콘 + placeholder 버튼을 렌더링하고 `options.onClick`이 있으면 호출한다. | AC-018 |

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
| AC-006 | 컬럼 노드 변경 | parent 존재 시 parent, 미존재 시 첫 child가 current로 설정된다. | FR-006 |
| AC-007 | 시/도 선택 | `findAllSigungus(selectedSido.code)`가 호출되고 시/군/구 목록이 갱신된다. | FR-007 |
| AC-008 | 시/군/구 선택 | `findAllEupmyeondongs(selectedSigungu.code)`가 호출되고 읍/면/동 목록이 갱신된다. | FR-008 |
| AC-009 | 읍/면/동 체크 | 선택 조건이 칩으로 추가되고 경로 문자열이 `>` 구분자로 표시된다. | FR-009 |
| AC-010 | 동일 읍/면/동 재체크 | 기존 칩이 제거되어 중복이 남지 않는다. | FR-010 |
| AC-011 | 전체 지역 조건 + 상세 조건 혼합 | 동일 시/군/구 내에서 상호 배타 상태를 유지한다. | FR-011 |
| AC-012 | 조건 3개 선택 | 하단 영역에 칩 3개가 렌더링된다. | FR-012 |
| AC-013 | 칩 삭제 버튼 클릭 | 해당 칩 1개만 제거된다. | FR-013 |
| AC-014 | 전체 삭제 버튼 클릭 | 모든 칩이 제거되고 버튼은 disabled 된다. | FR-014 |
| AC-015 | 컬럼 데이터 빈 배열 | `No items to display.` 문구가 표시된다. | FR-015 |
| AC-016 | current/selected 항목 비교 | current는 배경 강조, selected는 텍스트 강조 스타일이 적용된다. | FR-016 |
| AC-017 | `options.onChange` 전달 | 콜백 확장 포인트가 존재하며 선택 모델 업데이트 시 연동 가능하다. | FR-017 |
| AC-018 | keyword 버튼 클릭 | `options.onClick`이 정의된 경우 호출된다. | FR-018 |

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
- QA-006: 빈 데이터 반환 시 예외 없이 빈 상태 렌더링

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

