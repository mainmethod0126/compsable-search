# composable-search

`ComposableSearch`는 `region`/`keyword` 선택기를 조합해 검색 조건 UI를 구성하는 React 컴포넌트입니다.
`0.3`부터는 `selectors` + `value/defaultValue/onValueChange` 계약을 기본으로 사용합니다.

## 빠른 시작 (0.3 권장)

```tsx
import { useMemo, useState } from 'react'
import {
  ComposableSearch,
  createKeywordSelector,
  createRegionSelector,
  type ComposableSearchProps,
  type Region,
  type SearchSelectionItem,
} from 'compsable-search'

const SIDOS: Region[] = [
  { displayName: '서울특별시', name: '서울특별시', code: '11' },
  { displayName: '부산광역시', name: '부산광역시', code: '26' },
]

const SIGUNGUS_BY_SIDO: Record<string, Region[]> = {
  '11': [
    { displayName: '강남구', name: '강남구', code: '11680' },
    { displayName: '송파구', name: '송파구', code: '11710' },
  ],
  '26': [{ displayName: '해운대구', name: '해운대구', code: '26350' }],
}

const EUPMYEONDONGS_BY_SIGUNGU: Record<string, Region[]> = {
  '11680': [{ displayName: '역삼동', name: '역삼동', code: '1168010100' }],
  '11710': [{ displayName: '잠실동', name: '잠실동', code: '1171010100' }],
  '26350': [{ displayName: '우동', name: '우동', code: '2635010500' }],
}

export function SearchExample() {
  const [value, setValue] = useState<SearchSelectionItem[]>([])

  const selectors = useMemo(
    () => [
      createRegionSelector('region-main', {
        findAllSidos: () => SIDOS,
        findAllSigungus: (sidoCode) => SIGUNGUS_BY_SIDO[sidoCode] ?? [],
        findAllEupmyeondongs: (sigunguCode) =>
          EUPMYEONDONGS_BY_SIGUNGU[sigunguCode] ?? [],
        options: {
          placeholder: '지역 선택',
          searchInputPlaceholder: '지역명 입력',
          searchNoResultMessage: '검색 결과가 없습니다.',
        },
      }),
      createKeywordSelector('keyword-main', {
        options: {
          placeholder: '키워드 선택',
          label: '키워드 입력',
          inputPlaceholder: '키워드를 입력해 주세요.',
          maxTokens: 5,
          maxTokenLength: 20,
          normalization: { casePolicy: 'lower' },
        },
      }),
    ],
    [],
  )

  const handleValueChange: NonNullable<ComposableSearchProps['onValueChange']> = (
    nextValue,
    meta,
  ) => {
    setValue(nextValue)
    console.log('변경 소스', meta.source, meta.selectorType, meta.selectorId)
  }

  return (
    <ComposableSearch
      value={value}
      onValueChange={handleValueChange}
      selectors={selectors}
    />
  )
}
```

## 상태 관리 패턴

- Controlled: `value` + `onValueChange`를 함께 사용합니다.
- Uncontrolled: `defaultValue`를 전달하고 `onValueChange`로 변경 이벤트만 수신합니다.

```tsx
<ComposableSearch
  defaultValue={[]}
  onValueChange={(nextValue, meta) => {
    console.log(nextValue, meta)
  }}
  selectors={selectors}
/>
```

## selector 구성

- `0.3` 권장: `selectors`에 `SelectorInstance[]`를 전달합니다.
- 동일 `type`(`region`/`keyword`)이 중복되면 first-wins 정책으로 첫 번째 selector만 상세 패널/로직에 사용됩니다.

## placeholder 정책

- `ComposableSearchProps.placeholder`/`ComposableSearchProps.placeHolder`는 제거되었습니다.
- selector 옵션 표준 필드: `options.placeholder`
- deprecated selector 옵션: `options.placeHolder` (`0.3.x` 하위 호환용)
- 렌더 우선순위: `options.placeholder` > `options.placeHolder` > 내부 기본값

## 레거시 호환

`selectorsProps`를 아직 사용 중이면 `adaptLegacySelectorsProps`로 `selectors`로 변환해 점진 이관할 수 있습니다.

```tsx
import { adaptLegacySelectorsProps, ComposableSearch } from 'compsable-search'

const selectorsProps = [
  {
    type: 'keyword' as const,
    options: { placeholder: '키워드 선택' },
  },
]

<ComposableSearch selectors={adaptLegacySelectorsProps(selectorsProps)} />
```

## 관련 문서

- API 사용 가이드: `docs/api-usage-guide.md`
- 0.3 마이그레이션: `docs/migration-notes/0.3.0-migration.md`
- 공개 API 호환 규칙: `docs/public-api-compatibility-rules.md`
