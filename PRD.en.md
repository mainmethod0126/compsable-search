# react-composable-search PRD

## 1. Product Summary

`react-composable-search` is a React component for composing search-condition selectors. The current implementation provides one container with three areas.

- Top Selector area: renders `region` and `keyword` selector triggers
- Middle Detailed Conditions area: renders a 3-level region UI (Sido, Sigungu, Eup/Myeon/Dong)
- Bottom Selected Conditions area: renders selected chips, single delete, and clear-all

This PRD is reverse-engineered from the current repository implementation (`src/components/**`, `src/App.tsx`, `src/DemoService.tsx`) and is written with enough detail to reproduce the same product behavior.

## 2. Problem Statement

Search UIs are repeatedly reimplemented because filter composition differs by domain. Region filters in particular require recurring logic: hierarchical traversal (Sido -> Sigungu -> Eup/Myeon/Dong), multi-select, selected-chip rendering, and parent/child conflict handling.

Problems to solve:

- Standardize repeated condition-selection patterns into reusable components
- Externalize region data dependencies through injected data functions
- Keep selection state behavior consistent (toggle, single delete, clear all)
- Maintain a small and predictable integration API for library consumers

## 3. Target Users and Core Use Cases

### 3.1 Target Users

- React frontend engineers integrating search-condition UI quickly
- Library maintainers managing API stability and regressions
- End users selecting and removing region conditions

### 3.2 Core Use Cases

- US-001: A developer passes `selectorsProps` (`region`, `keyword`) and renders the full condition UI.
- US-002: An end user opens the region detail area and selects in sequence: Sido -> Sigungu -> Eup/Myeon/Dong.
- US-003: An end user toggles Eup/Myeon/Dong checkboxes to add/remove conditions.
- US-004: An end user removes a single condition via a chip delete button.
- US-005: An end user removes all conditions via the clear-all button.

## 4. Goals

- G-001 (`Must`): Run region-selection UI with only externally injected data functions.
- G-002 (`Must`): Reflect selected conditions immediately as chips with single-delete and clear-all.
- G-003 (`Must`): Prevent duplicate conditions and keep ID-based toggle behavior consistent.
- G-004 (`Should`): Keep consumer-facing API concise.
- G-005 (`Should`): Enable full UI and state-flow reproduction from PRD only.

## 5. Non-Goals

- NG-001: Search-result listing/pagination/sorting API behavior
- NG-002: Built-in server-state management (e.g., React Query)
- NG-003: Region source data collection/normalization
- NG-004: Full localization system
- NG-005: Advanced accessibility completion (arrow-key navigation, roving tabindex)

## 6. Scope of This Release

### 6.1 In Scope

- `ComposableSearch` container and 3-section layout
- `region` selector and detail-area toggle
- 3-column region UI (`SelectableRegionColumn` x2 + `CheckableRegionColumn` x1)
- Selected chips, chip delete, clear-all
- `keyword` selector trigger rendering (placeholder + optional click)
- Demo behavior with `DemoService` data

### 6.2 Out of Scope

- npm-ready entry and bundle packaging completion
- Standardized search submit event/button
- Actual `keyword` input/autocomplete/tokenization
- Async loading/error UI for region data

## 7. Functional Requirements

| ID | Priority | Requirement | Detailed Specification | Linked Acceptance Criteria |
| --- | --- | --- | --- | --- |
| FR-001 | Must | Container structure | `ComposableSearch` must render selector/detailed/selected sections in order. `className` and `style` must be merged on root. | AC-001 |
| FR-002 | Must | Selector order preservation | Selectors must render in the same order as `selectorsProps`. | AC-002 |
| FR-003 | Must | Region trigger toggle | Clicking `region` trigger must toggle detailed area open/close state. | AC-003 |
| FR-004 | Must | Detailed content injection | Detailed area must render ReactNode provided by `setDetailedConditionsContent`. Initial value is a placeholder node. | AC-004 |
| FR-005 | Must | Initial Sido loading | On Region selector mount, call `findAllSidos()` and populate Sido column children. | AC-005 |
| FR-006 | Must | Column initial current rule | `SelectableRegionColumn` sets current to `parent` if present; otherwise first child. It immediately invokes `onSelectedRegion`. | AC-006 |
| FR-007 | Must | Load Sigungu after Sido | On Sido selection, call `findAllSigungus(sidoCode)` and update Sigungu column. Parent label is `displayName + " 전체"`. | AC-007 |
| FR-008 | Must | Load Eup/Myeon/Dong after Sigungu | On Sigungu selection, call `findAllEupmyeondongs(sigunguCode)` and update checkbox column. Parent label is `displayName + " 전체"`. | AC-008 |
| FR-009 | Must | Eup/Myeon/Dong toggle | Checkbox change must toggle by condition ID (`eupmyeondong.code`). Added condition label format is `sido>sigungu>eupmyeondong`. | AC-009 |
| FR-010 | Must | Duplicate prevention | Same ID must not be duplicated. Re-select removes existing item. | AC-010 |
| FR-011 | Should | Parent/child conflict rule | A "whole region" condition (`sigungu.code === eupmyeondong.code`) is mutually exclusive with detail conditions in the same Sigungu. | AC-011 |
| FR-012 | Must | Selected chip rendering | Selected condition array must render as chips with delete buttons. | AC-012 |
| FR-013 | Must | Single delete | Clicking chip delete removes only matching `conditionId`. | AC-013 |
| FR-014 | Must | Clear all | Clicking clear-all removes all conditions. Button is disabled when condition count is zero. | AC-014 |
| FR-015 | Must | Empty-list rendering | Region columns must render `No items to display.` when data is empty. | AC-015 |
| FR-016 | Should | Visual state markers | `current` item uses highlighted background; `selected` item uses highlighted text style. | AC-016 |
| FR-017 | Could | Region options callbacks | Keep extension points: `options.onChange`, `options.onSelectedEupmyeondong`, `options.onClick`. | AC-017 |
| FR-018 | Must | Keyword trigger | `keyword` selector renders icon + placeholder button and invokes `options.onClick` when provided. | AC-018 |

## 8. Component and API Requirements

### 8.1 Data Models

| Type | Fields | Constraints |
| --- | --- | --- |
| `Region` | `displayName: string`, `name: string`, `code: string` | `code` is selection ID and must be unique within relevant level. |
| `SelectedCondition` | `id: string`, `displayName: string` | Minimal chip rendering unit |
| `SeletedRegionCondition` | `SelectedCondition + sido + sigungu + eupmyeondong` | Region-specific condition type |
| `SeletedKeywordCondition` | Extension of `SelectedCondition` | Keyword condition type (input UI not implemented yet) |

### 8.2 `ComposableSearchProps`

| Field | Type | Required | Default | Behavior |
| --- | --- | --- | --- | --- |
| `selectorsProps` | `ComposableSelectProps[]` | No | `undefined` | Selector render source |
| `className` | `string` | No | `''` | Merged into root className |
| `style` | `CSSProperties` | No | `undefined` | Applied to root inline style |
| `placeHolder` | `string` | No | `undefined` | Currently unused |

### 8.3 `ComposableSelectProps` (Union)

- `RegionSelectProps`
- `KeywordSelectProps`

### 8.4 Consumer-facing Region API (target contract)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | `'region'` | Yes | Selector discriminator |
| `findAllSidos` | `() => Region[]` | Yes | Supplies Sido list |
| `findAllSigungus` | `(sidoCode: string) => Region[]` | Yes | Supplies Sigungu list |
| `findAllEupmyeondongs` | `(sigunguCode: string) => Region[]` | Yes | Supplies Eup/Myeon/Dong list |
| `options.placeHolder` | `string` | No | Trigger text |
| `options.onChange` | `(selectedItems: ComposableSelectItem[]) => void` | No | Selection-change extension point |
| `options.onSelectedEupmyeondong` | `(selected: Region) => void` | No | Eup/Myeon/Dong extension point |
| `options.onClick` | `() => void` | No | Trigger click extension point |

### 8.5 Consumer-facing Keyword API

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | `'keyword'` | Yes | Selector discriminator |
| `options.placeHolder` | `string` | No | Button text |
| `options.onClick` | `() => void` | No | Click callback |

### 8.6 State Transition Rules

- ST-001: Detailed area open/close is controlled by one boolean (`isOpenDetailedConditionArea`).
- ST-002: `selectedConditions` is internally managed and not externally exposed.
- ST-003: Region checkbox toggles add/remove by ID.
- ST-004: Clear-all sets `selectedConditions = []`.

## 9. Non-Functional Requirements

| ID | Priority | Requirement | Measurement / Pass Criteria |
| --- | --- | --- | --- |
| NFR-001 | Must | Minimal dependencies | Runtime deps remain only `react`, `react-dom`. |
| NFR-002 | Must | npm-distribution-oriented design | Component must run via externally injected data functions and must not mutate global runtime. |
| NFR-003 | Must | Minimize style conflicts | Prefer component-scoped class styling and avoid global selector pollution. |
| NFR-004 | Should | Baseline accessibility | Buttons use `type="button"`; delete button includes `aria-label`. |
| NFR-005 | Should | Empty-data safety | Empty arrays must render empty-state UI without runtime errors. |
| NFR-006 | Could | Large-list handling | Up to 200 chips should remain interactable without noticeable lag. |

## 10. Acceptance Criteria

| ID | Scenario | Expected Result | Linked Requirements |
| --- | --- | --- | --- |
| AC-001 | Render `ComposableSearch` | selector, detailed, selected sections appear in order. | FR-001 |
| AC-002 | `selectorsProps = [region, keyword]` | region renders first, keyword second. | FR-002 |
| AC-003 | Click region trigger twice | detailed area toggles open then closed. | FR-003 |
| AC-004 | After RegionSelect mount | detailed area is replaced by 3-column region UI. | FR-004 |
| AC-005 | Initial mount | Sido column shows `findAllSidos()` results. | FR-005 |
| AC-006 | Column node changes | current becomes parent if available, else first child. | FR-006 |
| AC-007 | Select Sido item | `findAllSigungus(selectedSido.code)` is called and Sigungu list refreshes. | FR-007 |
| AC-008 | Select Sigungu item | `findAllEupmyeondongs(selectedSigungu.code)` is called and Eup/Myeon/Dong list refreshes. | FR-008 |
| AC-009 | Check Eup/Myeon/Dong item | one chip is added with `>`-joined full path label. | FR-009 |
| AC-010 | Toggle same item again | existing chip is removed; no duplicates remain. | FR-010 |
| AC-011 | Mix whole + detail in same Sigungu | mutual exclusivity is maintained in that Sigungu scope. | FR-011 |
| AC-012 | Select 3 conditions | 3 chips are rendered in selected area. | FR-012 |
| AC-013 | Click chip delete | only that chip is removed. | FR-013 |
| AC-014 | Click clear-all | all chips removed; button becomes disabled. | FR-014 |
| AC-015 | Column gets empty list | `No items to display.` is shown. | FR-015 |
| AC-016 | Compare current vs selected states | current has highlighted background; selected has highlighted text. | FR-016 |
| AC-017 | Provide `options.onChange` | callback extension point exists and can be wired to selection updates. | FR-017 |
| AC-018 | Click keyword trigger | `options.onClick` fires when provided. | FR-018 |

## 11. QA and Validation Plan

### 11.1 Static Validation

- TypeScript build: `npm run build`
- Lint: `npm run lint`
- Public API typing check in consumer examples for `ComposableSearchProps`, `RegionSelectProps`, `KeywordSelectProps`

### 11.2 Runtime Validation Scenarios

- QA-001: Initial entry shows Sido list
- QA-002: Changing Sido updates Sigungu list
- QA-003: Changing Sigungu updates Eup/Myeon/Dong list
- QA-004: Multi-select/unselect Eup/Myeon/Dong
- QA-005: Single chip delete and clear-all
- QA-006: Empty data functions still render safe empty UI

### 11.3 Current Validation Status as of February 9, 2026

- `npm.cmd run build` fails
- Failure cause: syntax error in `src/components/ComposableSearch.tsx` (unfinished function declaration inside `onSelectedWholeRegionCondition`)

## 12. Release and Versioning Plan

- Versioning policy: SemVer (`MAJOR.MINOR.PATCH`)
- Proposed initial release: `0.1.0-alpha`
- `0.1.0-alpha` gates
- Required: TypeScript build passes
- Required: Manual validation passes for FR-001~FR-010, FR-012~FR-015
- Required: `PRD.md` and `PRD.en.md` remain synchronized
- `0.1.x`: bug fixes (selection logic, typing contract, render warnings)
- `0.2.0`: evaluate real keyword input model and external state API

## 13. Risks and Open Issues

- OI-001 (`Must`): Build fails because of unfinished code in `ComposableSearch.tsx`.
- OI-002 (`Must`): `RegionSelectProps` does not cleanly separate consumer props from internal injected props, risking type-contract mismatch.
- OI-003 (`Should`): `onSelectedWholeRegionCondition` is defined but not used (dead code path).
- OI-004 (`Should`): `options.onSelectedEupmyeondong`, `options.onClick` (region), and `options.onChange` are not fully wired to active runtime behavior.
- OI-005 (`Should`): `SelectedConditionBasket` map render lacks `key` prop and can trigger React warnings.
- OI-006 (`Should`): `console.log` remains in `SelectableRegionColumn`.
- OI-007 (`Should`): Global selectors in `index.css` (`button`, `body`, `:root`) may conflict with host application styles.
- OI-008 (`Could`): Demo legal-dong sample codes include abnormal values (`44182031000`, `55011033000`, `5Terms013010800`), introducing data-quality risk.
- OI-009 (`Could`): `ComposableSearchProps.placeHolder` is currently unused.

