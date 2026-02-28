# ComposableSearch API 사용 가이드 (0.3)

## 1. 핵심 변경

`0.3`의 기본 사용 방식은 아래 조합입니다.

- 상태: `value`(controlled) 또는 `defaultValue`(uncontrolled)
- 변경 이벤트: `onValueChange(nextValue, meta)`
- 선택기 구성: `selectors` + `createRegionSelector`/`createKeywordSelector`

`selectorsProps`, `onChange`, `placeHolder`는 하위 호환을 위해 유지되지만 deprecated입니다.

## 2. 0.3 권장 예제

```tsx
import { useMemo, useState } from 'react'
import {
  ComposableSearch,
  createKeywordSelector,
  createRegionSelector,
  type ComposableSearchProps,
  type Region,
  type SearchSelectionItem,
} from './src/components'

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

export function SearchPanel() {
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
          guideText: 'Enter로 키워드 확정, 입력이 비었을 때 Backspace로 마지막 키워드 삭제',
          maxTokens: 5,
          maxTokenLength: 20,
          normalization: {
            casePolicy: 'lower',
          },
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
    console.log('onValueChange', {
      source: meta.source,
      selectorType: meta.selectorType,
      selectorId: meta.selectorId,
      nextValue,
    })
  }

  return (
    <ComposableSearch
      value={value}
      onValueChange={handleValueChange}
      selectors={selectors}
      placeholder="조건 선택"
    />
  )
}
```

## 3. `value`/`defaultValue`/`onValueChange`

- `value`를 전달하면 controlled 모드입니다.
- `value` 없이 `defaultValue`를 전달하면 uncontrolled 모드입니다.
- `onValueChange`는 두 모드 모두에서 호출됩니다.

```tsx
const handleValueChange: NonNullable<ComposableSearchProps['onValueChange']> = (
  nextValue,
  meta,
) => {
  // nextValue: SearchSelectionItem[]
  // meta.source: 'region' | 'keyword' | 'external' | 'initialize'
  // meta.selectorType: 'region' | 'keyword' | undefined
  // meta.selectorId: string | undefined
}

<ComposableSearch
  defaultValue={[]}
  onValueChange={handleValueChange}
  selectors={selectors}
/>
```

## 4. `selectors`와 selector 팩토리

- `selectors`는 `SelectorInstance[]`를 받습니다.
- `createRegionSelector(id, props)` / `createKeywordSelector(id, props)`를 사용하면 타입 안전하게 생성할 수 있습니다.
- 동일 `type`이 여러 개면 first-wins 정책으로 첫 번째 항목만 상세 패널/선택 로직에서 사용됩니다.

## 5. `placeholder` 표준화와 `placeHolder` deprecated

- 표준 필드: `placeholder`
- deprecated 필드: `placeHolder` (`0.3.x` 하위 호환)
- 렌더링 우선순위:
  - `options.placeholder`
  - `options.placeHolder`
  - 내부 기본값 (`지역 선택` / `키워드 선택`)

권장 패턴:

```tsx
createKeywordSelector('keyword-main', {
  options: {
    placeholder: '키워드 선택',
    // placeHolder: '키워드 선택', // deprecated
  },
})
```

## 6. `adaptLegacySelectorsProps` 사용법

`selectorsProps` 기반 코드를 즉시 전면 교체하기 어렵다면 어댑터로 점진 이관할 수 있습니다.

```tsx
import {
  ComposableSearch,
  adaptLegacySelectorsProps,
  type ComposableSearchProps,
} from './src/components'

const legacySelectorsProps: NonNullable<ComposableSearchProps['selectorsProps']> = [
  {
    type: 'region',
    findAllSidos,
    findAllSigungus,
    findAllEupmyeondongs,
    options: {
      placeHolder: '지역 선택',
    },
  },
  {
    type: 'keyword',
    options: {
      placeHolder: '키워드 선택',
    },
  },
]

<ComposableSearch
  selectors={adaptLegacySelectorsProps(legacySelectorsProps)}
  onValueChange={(nextValue, meta) => {
    console.log(nextValue, meta)
  }}
/>
```

## 7. 레거시 API 상태

- `selectorsProps`: deprecated, `selectors`로 이관 권장
- `onChange`: deprecated, `onValueChange`로 이관 권장
- `placeHolder`: deprecated, `placeholder`로 이관 권장

상세 전환 절차는 `docs/migration-notes/0.3.0-migration.md`를 참고하세요.
