# 공개 API 하위 호환 규칙 (0.3.x)

## 메타

- 문서 버전: `v0.3`
- 적용 범위: `0.3.x`
- 마지막 갱신: `2026-02-28`

## 1. 기본 원칙

- `0.3.x`의 표준 공개 계약은 `value/defaultValue/onValueChange + selectors` 조합이다.
- 기존 소비자 코드의 점진 전환을 위해 deprecated API(`selectorsProps`, `onChange`, `placeHolder`)를 유지한다.
- deprecated API는 대체 경로를 문서에 항상 함께 제공한다.
- 런타임 동작 변경이 필요한 경우, 동일 major 내에서는 additive 변경을 우선한다.

## 2. 안정 계약 (0.3 표준)

- 상태/이벤트
  - `ComposableSearchProps.value?: ComposableSearchValue`
  - `ComposableSearchProps.defaultValue?: ComposableSearchValue`
  - `ComposableSearchProps.onValueChange?: (nextValue, meta) => void`
- selector 구성
  - `ComposableSearchProps.selectors?: SelectorInstance[]`
  - `createRegionSelector(id, props)`
  - `createKeywordSelector(id, props)`
- 레거시 변환 유틸
  - `adaptLegacySelectorsProps(selectorsProps): SelectorInstance[]`
- placeholder 표준
  - `RegionSelectOptions.placeholder`
  - `KeywordSelectOptions.placeholder`

## 3. deprecated 계약 (0.3.x 유지)

- `ComposableSearchProps.selectorsProps`
- `ComposableSearchProps.onChange`
- `ComposableSearchProps.placeHolder`
- `RegionSelectOptions.placeHolder`
- `KeywordSelectOptions.placeHolder`

규칙:

- 신규 문서/예제는 deprecated API를 기본 경로로 제시하지 않는다.
- deprecated API를 설명할 때는 반드시 대체 필드를 바로 옆에 명시한다.

## 4. 허용/금지 변경 규칙

| 구분 | 허용 | 금지 |
| --- | --- | --- |
| 타입 필드 | optional 필드 추가, 신규 타입 export 추가 | 기존 필드 삭제/이름 변경, optional -> required 변경 |
| 상태/이벤트 | `onValueChange` 메타 확장(additive) | `onValueChange` 호출 누락, `nextValue` 의미 변경 |
| selector API | `selectors` 관련 보조 유틸 추가 | `createRegionSelector`/`createKeywordSelector` 시그니처 파괴 |
| 레거시 변환 | `adaptLegacySelectorsProps` 비파괴 개선 | 동일 입력에서 비결정적 id/타입 결과 반환 |
| placeholder | `placeholder` 우선 정책 유지 | `placeHolder`를 `placeholder`보다 우선 처리 |
| 중복 selector 처리 | first-wins + 개발 경고 유지 | first-wins 제거 또는 무경고 회귀 |

## 5. compat 제거 정책

- `selectorsProps`, `onChange`, `placeHolder` 제거 목표 버전: **TBD**
- 제거 전 조건:
1. 최소 한 개 minor 릴리스 이상 deprecation 안내 유지
2. 마이그레이션 문서(`docs/migration-notes/0.3.0-migration.md`) 최신화
3. 코드 매핑표 및 자동 치환 가능한 예시 제공

## 6. 검증 게이트

- 타입/계약 회귀: `npm test`
- 정적 검증: `npm run lint`
- 빌드 검증: `npm run build`
