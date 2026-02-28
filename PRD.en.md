# react-composable-search PRD

## 1. Product Summary

`react-composable-search` is a React component that provides a composable search-condition UI. The current implementation exposes the following three sections in one container.

- Selector area: renders `region` and `keyword` triggers
- Detailed Conditions area: renders either a 3-level region panel (Sido, Sigungu, Eup/Myeon/Dong) or a keyword input panel
- Selected Conditions area: renders selected chips with single-delete and clear-all

The current implementation includes hierarchical region selection, region search preview selection, a keyword token input state machine, and safe callback execution (exception isolation).

## 2. Problem Statement

Search-condition UIs are repeatedly reimplemented across domains. Region filters are especially complex because they require hierarchical traversal, whole-selection options, mutual exclusivity rules, and chip synchronization. Keyword input also needs consistent normalization, deduplication, and limit enforcement.

Problems to solve:

- Standardize reusable region/keyword condition selection
- Separate domain data dependency through injected data sources
- Provide a single combined onChange payload for region + keyword
- Ensure callback exceptions do not break UI interaction flow

## 3. Target Users and Core Use Cases

### 3.1 Target Users

- React frontend engineers who need fast integration
- Component maintainers who manage API contracts and regressions
- End users who combine region and keyword filters

### 3.2 Core Use Cases

- US-001: A developer renders both `region` and `keyword` via `selectorsProps`.
- US-002: An end user opens the region panel and selects Sido -> Sigungu -> Eup/Myeon/Dong.
- US-003: An end user toggles Sido-whole in Sigungu column or checkboxes in Eup/Myeon/Dong column.
- US-004: An end user searches in region input and clicks a preview item to apply a condition immediately.
- US-005: An end user opens the keyword panel and commits tokens via Enter/Blur.
- US-006: An end user removes the last keyword token with Backspace when input is empty.
- US-007: An end user removes chips individually or clears all chips.
- US-008: A developer receives combined region+keyword payload from `region.options.onChange`.
- US-009: A developer handles invalid keyword commits using `keyword.options.onInvalidToken`.
- US-010: A developer is protected from UI breakage even when callbacks throw.

## 4. Goals

- G-001 (`Must`): Provide region/keyword condition selection in one component
- G-002 (`Must`): Reflect condition changes immediately in chips and callback payloads
- G-003 (`Must`): Automatically resolve conflicts between whole/detail region conditions
- G-004 (`Must`): Provide keyword normalization, deduplication, max count, and max length rules
- G-005 (`Should`): Keep public API/types concise and backward-compatible
- G-006 (`Should`): Keep user interaction flow resilient under callback exceptions

## 5. Non-Goals

- NG-001: Search-result API, paging, sorting
- NG-002: Built-in async region loading/error UI
- NG-003: Built-in server-state library integration
- NG-004: Advanced keyboard navigation completion (roving tabindex, etc.)
- NG-005: Full i18n system

## 6. Scope of This Release

### 6.1 In Scope

- Selector rendering and single-panel toggle (`region`/`keyword`)
- Region-panel search input, preview list, and click-to-select
- 3-level region columns (two selectable columns + one checkable column) with whole/detail mutual exclusivity
- Descendant-selection visual indicator (`has-descendant-selected`)
- Keyword panel (label/guide/counter/error message)
- Keyword state machine (normalization, duplicate/length/count constraints, Enter/Blur/Backspace)
- Selected chips, single delete, clear all
- Combined `region.options.onChange` payload (region + keyword)
- Safe callback execution (exception isolation with `console.error`)

### 6.2 Out of Scope

- Dedicated "no search result" UI when query returns zero matches
- Keyword autocomplete/suggestion API
- Fully controlled external-state mode
- Automated package-release pipeline

## 7. Functional Requirements

| ID | Priority | Requirement | Detailed Specification | Linked Acceptance Criteria |
| --- | --- | --- | --- | --- |
| FR-001 | Must | Container structure | `ComposableSearch` renders selector/detailed/selected in order. | AC-001 |
| FR-002 | Must | Selector order preservation | Preserve the exact order of `selectorsProps`. | AC-001 |
| FR-003 | Must | Single-panel toggle | `region` and `keyword` panels are mutually exclusive and toggle on trigger click. | AC-002 |
| FR-004 | Must | Region search placement | When region panel is open, region search area appears below selector and outside detailed area. | AC-003 |
| FR-005 | Must | Initial Sido loading | Build Sido column using `findAllSidos()` from region data source. | AC-004 |
| FR-006 | Must | No auto current selection | `SelectableRegionColumn` must not auto-assign `current` before explicit user click. | AC-005 |
| FR-007 | Must | Update Sigungu after Sido selection | On Sido select, update Sigungu via `findAllSigungus(sidoCode)` and expose Sido-whole checkbox. | AC-006 |
| FR-008 | Must | Update Eup/Myeon/Dong after Sigungu selection | On Sigungu select, call `findAllEupmyeondongs(sigunguCode)` and prepend `Sigungu whole` item. | AC-007 |
| FR-009 | Must | Region toggle behavior | Region check items toggle by `condition.id` and never keep duplicates. | AC-008 |
| FR-010 | Must | Mutual exclusivity rules | Whole/detail in same Sigungu and Sido-whole/child in same Sido cannot coexist. | AC-008 |
| FR-011 | Should | Descendant indicator | Apply `has-descendant-selected` visual state to ancestors when descendants are selected. | AC-009 |
| FR-012 | Must | Empty-state differentiation | Render different guidance for no-parent-selected vs truly empty data. | AC-010 |
| FR-013 | Must | Chip synchronization | Render selected conditions as chips with single delete and clear all. | AC-011 |
| FR-014 | Must | Region search indexing/filtering | Flatten region tree, support partial match, and apply result limit (`searchResultLimit`, default 20). | AC-012 |
| FR-015 | Must | Search-result mapping | Map Sido/Sigungu/Eup-Myeon-Dong results to `SelectedRegionCondition`, toggle condition, and clear query. | AC-012 |
| FR-016 | Must | Keyword panel rendering | Clicking keyword trigger opens keyword panel with label/guide/counter. | AC-013 |
| FR-017 | Must | Keyword normalization/constraints | Apply trim, whitespace collapsing, case policy, and duplicate/length/count limits. | AC-013 |
| FR-018 | Must | Keyword input events | Enter/Blur commits input, and Backspace on empty input removes last token. | AC-013 |
| FR-019 | Should | Invalid-token callback | On invalid commit, call `onInvalidToken(error, context)`. | AC-013 |
| FR-020 | Must | Combined onChange payload | `region.options.onChange` uses `SearchSelectionItem[]` and emits region items before keyword items. | AC-014 |
| FR-021 | Must | Callback exception isolation | UI state updates must continue even if region/keyword callbacks throw. | AC-015 |
| FR-022 | Should | Typography consistency | Checkbox labels and normal region items keep the same typography contract. | AC-016 |
| FR-023 | Should | Fixed list viewport | Region columns keep a fixed vertical viewport showing about 6 items at 36px item height. Columns with Sido-whole toggle keep `1 whole item + 5 list items`. | AC-017 |
| FR-024 | Must | Region-selection confirmation callback | `onSelectedEupmyeondong` fires only on newly added region conditions, not on deselection. | AC-018 |

## 8. Component and API Requirements

### 8.1 Data Models

| Type | Fields | Constraints |
| --- | --- | --- |
| `Region` | `displayName`, `name`, `code` | `code` must be unique without collision. |
| `SelectedRegionCondition` | `id`, `displayName`, `sido`, `sigungu`, `eupmyeondong` | Region condition item |
| `SelectedKeywordCondition` | `id`, `displayName`, `keyword`, `normalizedKeyword` | Keyword condition item |
| `SearchSelectionItem` | `SelectedRegionCondition \| SelectedKeywordCondition` | onChange payload item |

### 8.2 `ComposableSearchProps`

| Field | Type | Required | Default | Note |
| --- | --- | --- | --- | --- |
| `selectorsProps` | `ComposableSelectProps[]` | No | `[]` | Selector composition |
| `className` | `string` | No | `undefined` | Merged to root class |
| `style` | `CSSProperties` | No | `undefined` | Root inline style |
| `placeHolder` | `string` | No | `undefined` | Currently unused (backward-compatible field) |

### 8.3 Region API

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | `'region'` | Yes | Selector type |
| `findAllSidos` | `() => Region[]` | Yes | Sido list |
| `findAllSigungus` | `(sidoCode: string) => Region[]` | Yes | Sigungu list |
| `findAllEupmyeondongs` | `(sigunguCode: string) => Region[]` | Yes | Eup/Myeon/Dong list |
| `options.placeHolder` | `string` | No | Region trigger text |
| `options.searchInputLabel` | `string` | No | Search input accessibility label |
| `options.searchInputPlaceholder` | `string` | No | Search input placeholder |
| `options.searchIdleMessage` | `string` | No | Message when query is empty |
| `options.searchNoResultMessage` | `string` | No | Present in type, currently not used in UI |
| `options.searchResultLimit` | `number` | No | Max search results (default 20) |
| `options.searchInputIcon` | `ReactNode` | No | Custom search icon |
| `options.onChange` | `(selectedItems: SearchSelectionItem[]) => void` | No | Selection-change callback |
| `options.onSelectedEupmyeondong` | `(selected: Region) => void` | No | Callback for newly added region condition |
| `options.onClick` | `() => void` | No | Region trigger click callback |

### 8.4 Keyword API

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | `'keyword'` | Yes | Selector type |
| `options.placeHolder` | `string` | No | Keyword trigger text |
| `options.label` | `string` | No | Input label |
| `options.inputPlaceholder` | `string` | No | Input placeholder |
| `options.guideText` | `string` | No | Guide text |
| `options.maxTokens` | `number` | No | Max token count (default 5) |
| `options.maxTokenLength` | `number` | No | Max token length (default 20) |
| `options.normalization.trim` | `boolean` | No | Trim boundary spaces |
| `options.normalization.collapseWhitespace` | `boolean` | No | Collapse sequential whitespaces |
| `options.normalization.casePolicy` | `'preserve' \| 'lower'` | No | Case normalization policy |
| `options.onInvalidToken` | `(error, context) => void` | No | Validation-failure callback |
| `options.onClick` | `() => void` | No | Keyword trigger click callback |

### 8.5 State Transition Rules

- ST-001: Detailed panel state is managed by `activePanelMode: 'none' | 'region' | 'keyword'`.
- ST-002: Region conditions and keyword tokens are managed internally and rendered together as chips.
- ST-003: Region toggles, keyword commit/remove, and clear-all update combined onChange payload.
- ST-004: `CLEAR_ALL` resets both region and keyword conditions.

## 9. Non-Functional Requirements

| ID | Priority | Requirement | Pass Criteria |
| --- | --- | --- | --- |
| NFR-001 | Must | Minimal runtime dependency | Runtime dependencies remain `react`, `react-dom`. |
| NFR-002 | Must | Style scope isolation | Use `cs-` namespaced class styles. |
| NFR-003 | Must | Callback fault tolerance | UI transition continues even when callbacks throw. |
| NFR-004 | Should | Baseline accessibility | Action buttons use `type="button"` and inputs have labels. |
| NFR-005 | Should | Stability under large data | No functional regression with many chips/large region trees. |

## 10. Acceptance Criteria

| ID | Scenario | Expected Result | Linked Requirements |
| --- | --- | --- | --- |
| AC-001 | Render with `selectorsProps = [region, keyword]` | Three sections render in order and selector order is preserved. | FR-001, FR-002 |
| AC-002 | Alternate clicking region/keyword triggers | Only one detail panel is open at a time, and reclick closes it. | FR-003 |
| AC-003 | Open region panel | Search area is below selector and outside detailed area. | FR-004 |
| AC-004 | Immediately after opening region panel | Sido column renders `findAllSidos()` results. | FR-005 |
| AC-005 | Initial render and after list refresh | Sido/Sigungu `current` is not auto-selected. | FR-006 |
| AC-006 | Select Sido and toggle Sido-whole | Sigungu list updates and Sido-whole toggle works. | FR-007 |
| AC-007 | Select Sigungu | Eup/Myeon/Dong list updates with `Sigungu whole` at top. | FR-008 |
| AC-008 | Cross-toggle whole/detail | Conflicting conditions are automatically removed and no duplicates remain. | FR-009, FR-010 |
| AC-009 | Select/deselect descendants | Ancestor `has-descendant-selected` state appears/disappears correctly. | FR-011 |
| AC-010 | No parent selected vs empty data | Different empty-state messages are shown per cause. | FR-012 |
| AC-011 | Delete chip / clear all | Chip UI stays synchronized with selection state. | FR-013 |
| AC-012 | Type region query and click preview result | Partial-match + limit rule applies; selecting result updates condition and clears query. | FR-014, FR-015 |
| AC-013 | Keyword input with Enter/Blur/Backspace | Token commit/removal, normalization, duplicate/length/count limits, error UI and onInvalidToken work. | FR-016, FR-017, FR-018, FR-019 |
| AC-014 | Select both region and keyword conditions | `onChange` receives combined payload containing both. | FR-020 |
| AC-015 | Throw inside callbacks | Error is logged while UI flow and selection state continue. | FR-021 |
| AC-016 | Compare checkbox labels and normal items | Typography contract remains consistent. | FR-022 |
| AC-017 | Inspect region list viewport | Fixed viewport shows about six 36px items. | FR-023 |
| AC-018 | Add then remove region condition | `onSelectedEupmyeondong` fires only on add. | FR-024 |

## 11. QA and Validation Plan

### 11.1 Static Validation

- `npm test`
- `npm run lint`
- `npm run build`

### 11.2 Runtime Validation Scenarios

- QA-001: Selector order and panel toggle
- QA-002: Sido -> Sigungu -> Eup/Myeon/Dong loading and selection
- QA-003: Whole/detail mutual exclusivity
- QA-004: Descendant indicator (`has-descendant-selected`)
- QA-005: Region search preview selection
- QA-006: Keyword token normalization/constraints/invalid callback
- QA-007: Chip single-delete/clear-all and onChange payload
- QA-008: UI continuity when callbacks throw
- QA-009: Style scope/typography/fixed item-height checks

### 11.3 Validation Status as of 2026-02-28

- `npm test` passed (`11 files`, `74 tests`)
- `npm run lint` passed
- `npm run build` failed
- Failure cause: TypeScript TS18048 at `src/components/ComposableSearch.tsx:345`, `:346`, `:347`, `:349` (`regionSelector` possibly `undefined`)

## 12. Release and Versioning Plan

- Versioning policy: SemVer (`MAJOR.MINOR.PATCH`)
- Current target: `0.2.x` stabilization
- Release gates:
  - Required: pass `npm test`, `npm run lint`, `npm run build`
  - Required: keep `PRD.md` and `PRD.en.md` synchronized
  - Recommended: manual demo(App) scenario check

## 13. Risks and Open Issues

- OI-001 (`Must`): `npm run build` fails with TS18048 due `regionSelector` nullability handling in `ComposableSearch.tsx`.
- OI-002 (`Should`): `RegionSelectOptions.searchNoResultMessage` exists in public type but is currently unused in UI rendering path.
- OI-003 (`Could`): `ComposableSearchProps.placeHolder` is kept for compatibility but not used at runtime.
- OI-004 (`Should`): Some layout rules rely on CSS `:has(...)`; browser support policy should be explicitly reviewed for legacy environments.
