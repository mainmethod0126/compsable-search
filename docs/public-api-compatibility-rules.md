# 공개 API 하위 호환 규칙 (0.2.x)

## 메타
- 문서 버전: `v0.2`
- 적용 범위: `0.2.x`
- 마지막 갱신: `2026-02-28`
- 관련 Feature:
  - `[F-04] 공개 타입 계약 리팩터링`
  - `[F-12] 키워드 API 계약과 소비자 가이드 정리`

## 1. 호환성 기본 원칙
- `0.2.x`에서는 region-only 모델을 유지하던 소비자 코드의 점진적 전환을 지원한다.
- 기존 소비자 코드가 타입 체크에서 즉시 깨지지 않도록 하위 호환 별칭과 callback 시그니처 완화(bivariance)를 유지한다.
- `ComposableSearchProps.onChange` 추가는 additive 변경으로 취급하며 non-breaking 범위에서 제공한다.
- 조건 변경 콜백 우선순위는 `props.onChange` 우선, 미지정 시 `region.options.onChange` fallback으로 고정한다.
- 파괴적 변경이 필요한 경우 `0.2.0` 이상에서만 수행하고, 최소 한 릴리스 전에 대체 경로를 제공한다.
- 공개 계약과 내부 구현 계약을 분리하되, 기존 공개 진입점(`src/components/types.ts`)은 별칭으로 유지한다.
- `0.2.x` 전체 구간에서 레거시 경로(`src/components/types.ts`) 제거는 금지한다.

## 2. 공개 계약 안정 영역
- 런타임 export:
  - `ComposableSearch`
  - `isRegionSelector`, `isKeywordSelector`, `resolveSelectorByType`
- 공개 타입 export:
  - `ComposableSearchProps`, `ComposableSelectProps`
  - `Region`, `RegionDataSource`, `RegionSelectProps`, `RegionSelectOptions`
  - `KeywordSelectProps`, `KeywordSelectOptions`, `KeywordNormalizationPolicy`
  - `SearchSelectionItem`, `SelectedKeywordCondition`
  - `SelectedCondition`, `SelectedRegionCondition`
  - `RegionSelectionItem`
- 하위 호환 별칭:
  - `ComposableSelectItem` (`RegionSelectionItem` 전환 기간 호환용)

## 3. 변경 허용/금지 규칙
| 구분 | 허용 | 금지 |
| --- | --- | --- |
| 타입 필드 | optional 필드 추가, 신규 타입 추가 export | 기존 필드 삭제/이름 변경, optional -> required 변경 |
| 콜백 계약 | `ComposableSearchProps.onChange` 신규 추가, `onChange` payload에 keyword 조건 추가(`SearchSelectionItem[]`) | callback 호출 자체 누락, `props.onChange` 우선순위 역전, 기존 region payload 의미 역전 |
| selector 타입 | `type` literal 기반 확장 유틸 추가 | 기존 `region`/`keyword` 의미 변경 |
| selector 중복 처리 | 동일 `type` 중복 입력 시 first-wins + 개발 경고(`console.warn`) 유지 | first-wins 제거, 무경고 동작으로의 회귀 |
| 지역 검색 메시지 | `searchNoResultMessage` 노출 조건(검색 query 존재 + 결과 0건) 명시/유지 | query가 없거나 결과가 있을 때 동일 메시지 오노출 |
| import 경로 | 신규 권장 경로(`publicTypes`) 추가 | 기존 경로(`types.ts`) 제거 |

## 4. 예외 규칙
- 보안/치명적 결함 수정으로 불가피한 파괴적 변경이 필요한 경우:
1. 변경 사유와 영향 범위를 릴리스 노트에 명시한다.
2. 자동 마이그레이션 가이드 또는 치환 예제를 함께 제공한다.
3. `MINOR` 이상 버전으로만 배포한다.

## 5. 검증 게이트
- 타입 계약 회귀:
  - `npm test` (`src/components/publicTypeContract.test.ts`, `src/components/apiUsageGuideContract.test.ts`, `src/components/selectorTypeUtils.test.ts` 포함)
- 정적 품질:
  - `npm run lint`
- 빌드/번들:
  - `npm run build`

## 6. 미확정(TBD)
- `0.3.0`에서 `ComposableSelectItem` 완전 제거 시점
- 대량 키워드 입력(토큰 수 100+)에 대한 성능 기준과 API 정책
- `onChange` payload에서 정렬 정책을 커스터마이즈하는 확장 포인트 여부
