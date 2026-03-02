# ComposableSearch API 사용 가이드 (V2 Generic Selector)

## 1. 핵심 계약

V2 기본 사용 조합:

- `selectors`
- `value` 또는 `defaultValue`
- `onValueChange`

`onValueChange`의 `meta`는 다음 정보를 제공합니다.

- `reason`: `add | remove | replace | clear` (optional)
- `source`: `selector | external` (+ 이관 구간에서 `region | keyword` 입력 가능)
- `selectorId?`
- `selectorType?`

## 2. 기본 예제

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

export function SearchPanel() {
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

## 3. 상태 관리 패턴

- Controlled: `value + onValueChange`
- Uncontrolled: `defaultValue + onValueChange`

```tsx
<ComposableSearch
  defaultValue={[]}
  selectors={selectors}
  onValueChange={(nextValue, meta) => {
    console.log(nextValue, meta.reason ?? 'replace', meta.source)
  }}
/>
```

## 4. RegionDataSource sync/async 계약

```tsx
import type { RegionDataSource } from 'compsable-search'

const syncDataSource: RegionDataSource = {
  findAllSidos: () => [],
  findAllSigungus: () => [],
  findAllEupmyeondongs: () => [],
}

const asyncDataSource: RegionDataSource = {
  findAllSidos: async () => [],
  findAllSigungus: async () => [],
  findAllEupmyeondongs: async () => [],
}
```

각 메서드는 optional `context` 인자(`AbortSignal`)를 받을 수 있습니다.
