# 공개 API 하위 호환 규칙 (0.1.x)

## 메타
- 문서 버전: `v0.1`
- 적용 범위: `0.1.x`
- 마지막 갱신: `2026-02-19`
- 관련 Feature: `[F-04] 공개 타입 계약 리팩터링`

## 1. 호환성 기본 원칙
- `0.1.x`에서는 기존 소비자 코드가 타입 체크/런타임에서 깨지지 않는 변경만 허용한다.
- 파괴적 변경이 필요한 경우 `0.2.0` 이상에서만 수행하고, 최소 한 릴리스 전에 대체 경로를 제공한다.
- 공개 계약과 내부 구현 계약을 분리하되, 기존 공개 진입점(`src/components/types.ts`)은 별칭으로 유지한다.

## 2. 공개 계약 안정 영역
- 런타임 export:
  - `ComposableSearch`
  - `isRegionSelector`, `isKeywordSelector`, `resolveSelectorByType`
- 공개 타입 export:
  - `ComposableSearchProps`, `ComposableSelectProps`
  - `Region`, `RegionDataSource`, `RegionSelectProps`, `RegionSelectOptions`
  - `KeywordSelectProps`, `KeywordSelectOptions`
  - `SelectedCondition`, `SelectedRegionCondition`
  - `RegionSelectionItem`
- 하위 호환 별칭:
  - `ComposableSelectItem` (`RegionSelectionItem` 전환 기간 호환용)

## 3. 변경 허용/금지 규칙
| 구분 | 허용 | 금지 |
| --- | --- | --- |
| 타입 필드 | optional 필드 추가, 신규 타입 추가 export | 기존 필드 삭제/이름 변경, optional -> required 변경 |
| 콜백 계약 | 기존 인자 의미 유지 + 부가 정보 확장 | 콜백 호출 시점/횟수 변경, 인자 의미 역전 |
| selector 타입 | `type` literal 기반 확장 유틸 추가 | 기존 `region`/`keyword` 의미 변경 |
| import 경로 | 신규 권장 경로(`publicTypes`) 추가 | 기존 경로(`types.ts`) 제거 |

## 4. 예외 규칙
- 보안/치명적 결함 수정으로 불가피한 파괴적 변경이 필요한 경우:
1. 변경 사유와 영향 범위를 릴리스 노트에 명시한다.
2. 자동 마이그레이션 가이드 또는 치환 예제를 함께 제공한다.
3. `MINOR` 이상 버전으로만 배포한다.

## 5. 검증 게이트
- 타입 계약 회귀:
  - `npm test` (`src/components/publicTypeContract.test.ts`, `src/components/selectorTypeUtils.test.ts` 포함)
- 정적 품질:
  - `npm run lint`
- 빌드/번들:
  - `npm run build`

## 6. 미확정(TBD)
- `0.2.0`에서 `ComposableSelectItem` 완전 제거 시점
- selector 확장(`keyword` 입력 모델) 추가 시 공통 타입 유틸의 generic 확장 범위
