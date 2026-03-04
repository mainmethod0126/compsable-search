# ComposableSearch API 사용 가이드 (0.5)

## 1. 설치

```bash
npm install compsable-search react react-dom
```

- `react`, `react-dom` peer dependency: `^18.3.0 || ^19.0.0`
- 스타일은 앱 엔트리에서 1회 import:

```tsx
import 'compsable-search/style.css'
```

## 2. 최소 예제

0.5 공개 계약의 기본 조합은 아래 3개입니다.

- `selectors` (필수, 최소 1개)
- 상태: `value` 또는 `defaultValue`
- 변경 이벤트: `onValueChange(nextValue, meta)`

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
  options?: {
    placeholder?: string
    searchErrorMessage?: string
  }
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

export function SearchPanel() {
  const [value, setValue] = useState<ComposableSearchValue>([])

  const selectors = useMemo<ComposableSearchProps['selectors']>(
    () => [
      createSelector<DemoSelectorProps, 'region', SelectionItem>({
        id: 'region-main',
        type: 'region',
        props: {
          options: {
            placeholder: '지역 선택',
            searchErrorMessage: '검색 중 오류가 발생했습니다.',
          },
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

`onValueChange`의 `meta.source`는 `selector | external`만 사용합니다.

## 3. 검증 API

### 3.1 `validateComposableSearchConfiguration`

렌더 전에 구성 오류를 수집할 때 사용합니다.

```tsx
import { validateComposableSearchConfiguration } from 'compsable-search'

const result = validateComposableSearchConfiguration({
  selectors,
  plugins,
})

if (!result.isValid) {
  console.error(result.issues)
}
```

반환 타입:

- `isValid: boolean`
- `issues: ComposableSearchConfigurationIssue[]`

### 3.2 `assertComposableSearchConfiguration`

구성이 유효하지 않으면 `ComposableSearchConfigurationError`를 즉시 throw합니다.

```tsx
import {
  assertComposableSearchConfiguration,
  ComposableSearchConfigurationError,
} from 'compsable-search'

try {
  assertComposableSearchConfiguration({ selectors, plugins })
} catch (error) {
  if (error instanceof ComposableSearchConfigurationError) {
    console.error(error.code, error.causeContext, error.guide)
  }
  throw error
}
```

`ComposableSearch` 컴포넌트 자체도 렌더 시작 시 같은 검증을 수행하므로, 잘못된 구성은 즉시 오류로 처리됩니다.

- duplicate `selector.type` 감지 시 즉시 오류
- `plugin.type`과 selector type 불일치 시 즉시 오류

### 3.3 에러 코드 4종 및 해결 가이드

| 코드 | 발생 조건 | 주요 cause 필드 | 해결 가이드 |
| --- | --- | --- | --- |
| `MISSING_SELECTORS` | `selectors` 누락 | `{ selectors: undefined }` | `selectors` 필드를 필수로 전달하고 최소 1개 selector를 등록 |
| `EMPTY_SELECTORS` | `selectors`가 빈 배열 | `{ selectorsLength: 0 }` | `region`, `keyword` 또는 커스텀 selector를 1개 이상 등록 |
| `DUPLICATE_SELECTOR_TYPE` | 동일 `selector.type` 중복 | `{ selectorType, selectorIds, duplicateCount }` | 중복 type selector를 제거하거나 type을 분리 |
| `PLUGIN_SELECTOR_TYPE_MISMATCH` | plugin type과 selector type 불일치 | `{ pluginId, pluginType, availableSelectorTypes }` | plugin type 또는 selector 구성을 일치 |

## 4. 마이그레이션

### 4.1 0.4.x -> 0.5 변경 포인트

| 항목 | 0.4.x | 0.5 |
| --- | --- | --- |
| selector 입력 | `selectors` 권장 + 레거시 키 혼재 가능 | `selectors`만 사용 (`selectors` 필수) |
| 값 변경 핸들러 | `onValueChange`/레거시 `onChange` 혼재 가능 | `onValueChange`만 사용 |
| 옵션 키 | `placeholder`/레거시 `placeHolder` 혼재 가능 | `placeholder`만 사용 |
| 중복 selector type | first-wins 기반 처리 | 즉시 오류(`DUPLICATE_SELECTOR_TYPE`) |
| plugin-selector type 불일치 | 런타임에서 우회 가능 | 즉시 오류(`PLUGIN_SELECTOR_TYPE_MISMATCH`) |

### 4.2 적용 체크리스트

- [ ] `selectors`를 항상 전달하고 빈 배열을 제거했다.
- [ ] `onValueChange`만 사용한다.
- [ ] selector 옵션 키를 `placeholder`로 통일했다.
- [ ] `validateComposableSearchConfiguration` 또는 `assertComposableSearchConfiguration`을 렌더 전 경로에 추가했다.
- [ ] duplicate selector type / plugin-selector type mismatch를 테스트에서 실패 케이스로 검증했다.

상세 전환 절차는 `docs/migration-notes/0.5.0-migration.md`를 참고하세요.
