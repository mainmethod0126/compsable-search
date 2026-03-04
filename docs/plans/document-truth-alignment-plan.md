# 문서 기준 정합화 플랜 (V2 고정 + 레거시 타입 호환 전용)

## 요약
1. 기준 계약은 문서로 고정하되, 이번 결정에 따라 `meta.source`는 V2(`selector | external`)로 통일합니다.
2. `selectorsProps`, `onChange`, `placeHolder`는 **타입 호환만 유지**하고 런타임에서는 사용하지 않는 정책으로 명확히 고정합니다.
3. 문서-타입-런타임-테스트를 한 번에 정렬해 “문서가 곧 실행 가능한 계약” 상태를 만듭니다.

## 결정 고정 사항
1. `onValueChange(meta.source)`의 표준값은 `selector | external`입니다.
2. deprecated API(`selectorsProps`, `onChange`, `placeHolder`)는 타입 호환만 유지합니다.
3. deprecated API는 런타임 자동 변환/호출을 하지 않습니다.
4. 런타임은 deprecated 사용 시 개발 경고를 출력합니다.
5. duplicate selector type 정책은 first-wins + 경고 유지로 고정합니다.

## 공개 API / 타입 변경 (결정 완료)
| 항목 | 현재 | 변경 |
|---|---|---|
| `ChangeMeta.source` | `selector \| external \| region \| keyword` | `selector \| external`로 축소 |
| `ComposableSearchProps.selectors` | 필수 | optional로 완화 (`selectors?: ...`) |
| `ComposableSearchProps.selectorsProps` | 미노출 | `@deprecated`로 타입에 복원 (런타임 미사용) |
| `ComposableSearchProps.onChange` | 미노출 | `@deprecated`로 타입에 복원 (런타임 미사용) |
| `RegionSelectOptions.placeHolder` | 타입 존재 | `@deprecated` 명시 유지 (런타임 미사용) |
| `KeywordSelectOptions.placeHolder` | 타입 존재 | `@deprecated` 명시 유지 (런타임 미사용) |
| compat 유틸 `adaptLegacySelectorsProps` | 빈 모듈 | 빈 모듈 유지 + 문서에서 “제거됨”으로 명시 |

## 구현 계획

### 1) 문서 계약 정리 (소스 오브 트루스 확정)
1. [public-api-compatibility-rules.md](d:/Project/compsable-search/docs/public-api-compatibility-rules.md)를 최신 정책으로 재작성합니다.
2. `ChangeMeta.source`를 `selector | external`로 명시합니다.
3. deprecated 항목은 “타입 호환만, 런타임 미지원”으로 명시합니다.
4. `adaptLegacySelectorsProps` 보장 문구를 제거하고 “V2에서 제거됨”으로 바꿉니다.
5. first-wins + 개발 경고 정책을 명시합니다.
6. [api-usage-guide.md](d:/Project/compsable-search/docs/api-usage-guide.md)의 “region|keyword 이관 허용” 문구를 삭제합니다.
7. [0.3.0-migration.md](d:/Project/compsable-search/docs/migration-notes/0.3.0-migration.md)의 메타 설명을 V2 기준으로 정렬합니다.
8. [README.md](d:/Project/compsable-search/README.md), [api-usage-guide.md](d:/Project/compsable-search/docs/api-usage-guide.md), [0.3.0-migration.md](d:/Project/compsable-search/docs/migration-notes/0.3.0-migration.md) 예제에서 `as unknown as` 캐스팅을 제거합니다.
9. [keyword-input-model-evolution.md](d:/Project/compsable-search/docs/migration-notes/keyword-input-model-evolution.md)의 `onChange` 중심 설명을 `onValueChange` 중심으로 치환합니다.

### 2) 타입 계층 정렬
1. [publicTypes.ts](d:/Project/compsable-search/src/components/publicTypes.ts)에서 `ChangeMeta.source`를 `ValueChangeSource`로 통일합니다.
2. `ComposableSearchProps`에 deprecated 타입 필드(`selectorsProps`, `onChange`)를 `@deprecated` 주석과 함께 추가합니다.
3. `selectors`를 optional로 변경하고 문서상 “권장 필수”로 안내합니다.
4. `placeHolder` 필드에 `@deprecated` 주석을 추가해 IDE에서 바로 경고되게 합니다.
5. [types.ts](d:/Project/compsable-search/src/components/types.ts), [index.ts](d:/Project/compsable-search/src/index.ts), [components/index.ts](d:/Project/compsable-search/src/components/index.ts)의 재-export 타입 정합성을 맞춥니다.

### 3) 런타임 정책 고정 (deprecated 무시 + 경고)
1. [ComposableSearch.tsx](d:/Project/compsable-search/src/components/ComposableSearch.tsx)에서 `selectors`가 없으면 `[]`로 안전 처리합니다.
2. `selectorsProps`가 전달되면 무시하고 개발 경고 1회 출력합니다.
3. `onChange`가 전달되면 무시하고 개발 경고 1회 출력합니다.
4. `selectors`와 `selectorsProps`가 함께 오면 `selectors`만 사용하고 경고 1회 출력합니다.
5. duplicate selector type 탐지 시 개발 경고를 출력하고 first selector를 사용합니다.
6. `onValueChange` emit은 기존대로 유지하며 `meta.source`는 `selector | external`만 내보냅니다.

### 4) 테스트 계약 재정의
1. [publicTypeContract.test.ts](d:/Project/compsable-search/src/components/publicTypeContract.test.ts)를 수정해 deprecated 타입 필드 존재를 검증합니다.
2. [apiUsageGuideContract.test.ts](d:/Project/compsable-search/src/components/apiUsageGuideContract.test.ts)를 수정해 문서 예제가 캐스팅 없이 타입 통과함을 검증합니다.
3. [ComposableSearch.test.tsx](d:/Project/compsable-search/src/components/ComposableSearch.test.tsx)에 deprecated 런타임 무시 + 경고 시나리오를 추가합니다.
4. duplicate selector type 경고 + first-wins 동작 테스트를 추가합니다.
5. [compat/adaptLegacySelectorsProps.test.ts](d:/Project/compsable-search/src/components/compat/adaptLegacySelectorsProps.test.ts)는 “제거된 런타임 API” 계약으로 유지합니다.
6. `meta.source`가 `region|keyword`를 더 이상 허용하지 않음을 타입 테스트로 고정합니다.

### 5) 검증 및 릴리스 게이트
1. `npm run lint`
2. `npm run test`
3. `npm run build:lib`
4. `npm run verify:package`
5. `npm run verify:esm-consumer`
6. `npm run verify:cjs-consumer`
7. 문서 계약 검증: 예제 코드 copy-paste 타입 체크(캐스팅 없이 통과) 결과를 PR 체크리스트에 기록합니다.

## 테스트 시나리오 (명시)
1. `selectors`만 전달 시 기존 동작과 동일해야 합니다.
2. `selectorsProps`만 전달 시 렌더는 깨지지 않지만 selector는 생성되지 않고 deprecation 경고가 떠야 합니다.
3. `onChange`만 전달 시 콜백이 호출되지 않고 deprecation 경고가 떠야 합니다.
4. `selectors + selectorsProps` 동시 전달 시 `selectors` 결과만 반영되어야 합니다.
5. 동일 type selector 2개 이상일 때 first selector만 사용되고 경고는 type당 1회만 떠야 합니다.
6. `onValueChange.meta.source`는 `selector` 또는 `external`만 관찰되어야 합니다.
7. README/가이드/마이그레이션 예제는 `as unknown as` 없이 타입 체크를 통과해야 합니다.

## 리스크와 완화
1. 레거시 사용자 혼란 리스크: deprecated가 “타입만”이라는 점을 문서 첫 섹션과 경고 메시지에 중복 표기합니다.
2. silent failure 리스크: `selectorsProps` 사용 시 경고 문구에 정확한 마이그레이션 예시(`selectors`, `onValueChange`)를 포함합니다.
3. 문서 분산 리스크: 계약 문구는 [public-api-compatibility-rules.md](d:/Project/compsable-search/docs/public-api-compatibility-rules.md)에서 단일 소스화하고 다른 문서는 링크 참조로 축소합니다.

## 가정 및 기본값
1. 기준 릴리스 라인은 `0.3.x` 유지(파괴적 런타임 변경 없음)로 가정합니다.
2. deprecated는 제거하지 않고 최소 1 minor 동안 타입 shim을 유지합니다.
3. `adaptLegacySelectorsProps`는 재도입하지 않습니다.
4. 경고 출력은 개발 환경 기준(`process.env.NODE_ENV !== 'production'`)으로 제한합니다.
5. 이번 플랜 범위는 “정합화”이며 신규 기능 추가(`loadItems` 런타임 오케스트레이션)는 포함하지 않습니다.
