# composable-search

`ComposableSearch`는 Generic Selector 기반 검색 조건 UI 컴포넌트입니다.  
0.5 기준 공개 계약은 `selectors` 필수 + 렌더 전 구성 검증입니다.

## 1) 설치

```bash
npm install compsable-search react react-dom
```

- `react`, `react-dom` peer dependency: `^18.3.0 || ^19.0.0`
- 스타일은 앱 엔트리에서 1회 import:

```tsx
import 'compsable-search/style.css'
```

## 2) 최소 예제

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

export function SearchExample() {
  const [value, setValue] = useState<ComposableSearchValue>([])

  const selectors = useMemo<ComposableSearchProps['selectors']>(
    () => [
      createSelector<DemoSelectorProps, 'region', SelectionItem>({
        id: 'region-main',
        type: 'region',
        props: {
          options: { placeholder: '지역 선택' },
          items: [{ id: '11', label: '서울특별시' }],
        },
        driver: regionDriver,
      }),
      createSelector<DemoSelectorProps, 'keyword', SelectionItem>({
        id: 'keyword-main',
        type: 'keyword',
        props: {
          options: { placeholder: '키워드 선택' },
          items: [{ id: 'kw:원룸', label: '원룸' }],
        },
        driver: keywordDriver,
      }),
    ],
    [],
  )

  return (
    <ComposableSearch
      selectors={selectors}
      value={value}
      onValueChange={(nextValue, meta) => {
        setValue(nextValue)
        console.log(meta.reason ?? 'replace', meta.source, meta.selectorType)
      }}
    />
  )
}
```

## 3) 검증 API

`selectors`는 필수이며, 아래 2개 API로 렌더 전 검증을 권장합니다.

- `validateComposableSearchConfiguration(config)`:
  - 반환: `{ isValid: boolean, issues: ComposableSearchConfigurationIssue[] }`
- `assertComposableSearchConfiguration(config)`:
  - 첫 번째 이슈를 `ComposableSearchConfigurationError`로 즉시 throw

`ComposableSearch` 내부도 렌더 시작 시 `assertComposableSearchConfiguration`을 호출하므로, 다음 케이스는 즉시 오류입니다.

- `selectors` 누락/빈 배열
- duplicate `selector.type`
- `plugin.type`과 selector type 불일치

오류 코드와 해결 가이드:

| 코드 | 발생 조건 | 해결 가이드 |
| --- | --- | --- |
| `MISSING_SELECTORS` | `selectors` 누락 | `selectors` 필드를 필수로 전달하고 최소 1개의 selector를 등록 |
| `EMPTY_SELECTORS` | `selectors: []` | `region`, `keyword` 또는 커스텀 selector를 1개 이상 등록 |
| `DUPLICATE_SELECTOR_TYPE` | 동일 `selector.type` 중복 | 중복 type selector를 제거하거나 type을 분리 |
| `PLUGIN_SELECTOR_TYPE_MISMATCH` | `plugin.type`에 매칭 selector 없음 | plugin type 또는 selector 구성을 일치 |

## 4) 마이그레이션

0.4.x에서 0.5로 올릴 때는 아래 순서로 정리합니다.

1. 레거시 키 제거: `selectorsProps`, `onChange`, `placeHolder`
2. 표준 키로 통일: `selectors`, `onValueChange`, `placeholder`
3. `validateComposableSearchConfiguration` 또는 `assertComposableSearchConfiguration` 추가
4. duplicate selector type / plugin-selector mismatch가 즉시 오류로 처리되는지 확인

관련 문서:

- [API 사용 가이드](docs/api-usage-guide.md)
- [공개 API 호환 규칙](docs/public-api-compatibility-rules.md)
- [0.5.0 마이그레이션 노트](docs/migration-notes/0.5.0-migration.md)
