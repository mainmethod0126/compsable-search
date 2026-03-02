# composable-search

`ComposableSearch`는 V2(Generic Selector) 계약으로 검색 조건 UI를 구성하는 React 컴포넌트입니다.

핵심 계약은 다음 3가지입니다.

- `selectors`: `SelectorDefinition[]`
- 상태: `value` 또는 `defaultValue`
- 변경 이벤트: `onValueChange(nextValue, meta)`

## 빠른 시작 (V2 Generic Selector)

```tsx
import { useMemo, useState } from 'react'
import {
  ComposableSearch,
  createSelector,
  type ComposableSearchProps,
  type ComposableSearchValue,
  type SelectionItem,
  type SelectorDriver,
} from 'compsable-search'

interface DemoSelectorProps {
  options?: { placeholder?: string }
  items: Array<{ id: string; label: string }>
}

const regionDriver: SelectorDriver<DemoSelectorProps, 'region', SelectionItem> = {
  type: 'region',
  getTriggerLabel: (props) => props.options?.placeholder ?? '지역 선택',
  loadItems: async (_context, props) =>
    props.items.map((item) => ({
      id: item.id,
      displayName: item.label,
      selectorId: 'region-main',
      selectorType: 'region',
    })),
  renderPanel: () => null,
}

const keywordDriver: SelectorDriver<DemoSelectorProps, 'keyword', SelectionItem> = {
  type: 'keyword',
  getTriggerLabel: (props) => props.options?.placeholder ?? '키워드 선택',
  loadItems: (_context, props) =>
    props.items.map((item) => ({
      id: item.id,
      displayName: item.label,
      selectorId: 'keyword-main',
      selectorType: 'keyword',
    })),
  renderPanel: () => null,
}

type SelectorEntry = NonNullable<ComposableSearchProps['selectors']>[number]

export function SearchExample() {
  const [value, setValue] = useState<ComposableSearchValue>([])

  const selectors = useMemo<NonNullable<ComposableSearchProps['selectors']>>(
    () => [
      createSelector({
        id: 'region-main',
        type: 'region',
        props: {
          options: { placeholder: '지역 선택' },
          items: [{ id: '11', label: '서울특별시' }],
        },
        driver: regionDriver,
      }) as unknown as SelectorEntry,
      createSelector({
        id: 'keyword-main',
        type: 'keyword',
        props: {
          options: { placeholder: '키워드 선택' },
          items: [{ id: 'kw:원룸', label: '원룸' }],
        },
        driver: keywordDriver,
      }) as unknown as SelectorEntry,
    ],
    [],
  )

  return (
    <ComposableSearch
      value={value}
      selectors={selectors}
      onValueChange={(nextValue, meta) => {
        setValue(nextValue)
        console.log(meta.reason ?? 'replace', meta.source, meta.selectorType)
      }}
    />
  )
}
```

## 관련 문서

- API 사용 가이드: `docs/api-usage-guide.md`
- 0.x breaking 전환 가이드: `docs/migration-notes/0.3.0-migration.md`
- 공개 API 호환 규칙: `docs/public-api-compatibility-rules.md`
