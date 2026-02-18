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
- US-003: An end user toggles either the Sido-whole checkbox in the Sigungu column or Eup/Myeon/Dong checkboxes to add/remove conditions.
- US-004: An end user removes a single condition via a chip delete button.
- US-005: An end user removes all conditions via the clear-all button.
- US-006: An end user gets a visually natural selection experience because checkbox-based region labels and normal region-item labels use consistent typography.
- US-007: When a child region like `Gangnam-gu > Yeoksam-dong` is selected, an end user can immediately recognize in upper columns (Sido `Seoul`, Sigungu `Gangnam-gu`) that a descendant is selected through a distinct color cue.

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
| FR-006 | Must | No automatic current selection in selectable columns | `SelectableRegionColumn` must not auto-assign `current` or auto-invoke `onSelectedRegion` on initial render, parent change, or list refresh. `current` assignment and `onSelectedRegion` invocation must happen only after explicit user click. | AC-006 |
| FR-007 | Must | Load Sigungu after Sido and provide Sido-whole checkbox | On Sido selection, call `findAllSigungus(sidoCode)` and update Sigungu column. The Sigungu column must also allow direct checkbox toggle for `displayName + " 전체"`. | AC-007, AC-020 |
| FR-008 | Must | Load Eup/Myeon/Dong after Sigungu | On Sigungu selection, call `findAllEupmyeondongs(sigunguCode)` and update checkbox column. The Sido-whole option already exposed in the Sigungu column must not be duplicated in Eup/Myeon/Dong. | AC-008 |
| FR-009 | Must | Eup/Myeon/Dong toggle | Checkbox change must toggle by condition ID (`eupmyeondong.code`). Added condition label format is `sido>sigungu>eupmyeondong`. | AC-009 |
| FR-010 | Must | Duplicate prevention | Same ID must not be duplicated. Re-select removes existing item. | AC-010 |
| FR-011 | Should | Parent/child conflict rule | A "whole region" condition (`sigungu.code === eupmyeondong.code`) is mutually exclusive with detail conditions in the same Sigungu. | AC-011 |
| FR-012 | Must | Selected chip rendering | Selected condition array must render as chips with delete buttons. | AC-012 |
| FR-013 | Must | Single delete | Clicking chip delete removes only matching `conditionId`. | AC-013 |
| FR-014 | Must | Clear all | Clicking clear-all removes all conditions. Button is disabled when condition count is zero. | AC-014 |
| FR-015 | Must | Empty-state guidance by context | Region-column empty states must use Korean guidance by cause: show `상위 지역을 먼저 선택해 주세요.` when parent region is not selected yet, and show `표시할 지역이 없습니다.` when data is genuinely empty after parent selection. | AC-015 |
| FR-016 | Should | Visual state markers | `current` item uses highlighted background; `selected` item uses highlighted text style. | AC-016 |
| FR-017 | Could | Region options callbacks | Keep extension points: `options.onChange`, `options.onSelectedEupmyeondong`, `options.onClick`. | AC-017 |
| FR-018 | Must | Keyword trigger | `keyword` selector renders icon + placeholder button and invokes `options.onClick` when provided. | AC-018 |
| FR-019 | Must | Mutual exclusivity between Sido whole and child Sigungu | Selecting a Sido "whole" condition must clear child Sigungu conditions in the same Sido, and selecting a child Sigungu must clear the Sido "whole" condition in that same scope. In particular, if a child Sigungu is already selected and the user checks Sido "whole", the existing child Sigungu condition must be removed immediately. Example: `Seoul whole` and `Seoul Gangnam-gu` cannot coexist; after selecting `Busan Haeundae-gu`, checking `Busan whole` must leave only `Busan whole`. | AC-019 |
| FR-020 | Must | Direct Sido-whole selection from Sigungu column | Users must be able to add/remove Sido-whole condition directly from Sigungu column checkbox without repeating the same "whole" selection step in Eup/Myeon/Dong. | AC-020 |
| FR-021 | Must | No auto-selection of Sigungu before explicit user action | In the Sigungu column, right after list refresh triggers (Sido change or Sido-whole check/uncheck), the first item (e.g., `Gangnam-gu`) must not be auto-assigned as `current`/selected. Until a user explicitly clicks a Sigungu item, both Sigungu `current` and Eup/Myeon/Dong list must remain unselected. | AC-021 |
| FR-022 | Should | Typography consistency across region items | Checkbox label text (`Sido whole`, Eup/Myeon/Dong) and normal region-item text (Sido/Sigungu/Eup/Myeon/Dong) must use the same typography baseline (`font-family`, `font-size`, `font-weight`, `line-height`). Selection emphasis must rely on color/background changes, while typography values stay consistent. | AC-022 |
| FR-023 | Must | Ancestor color indicator for descendant selection | When a Eup/Myeon/Dong item (e.g., `Yeoksam-dong`) is selected, its ancestor items in that path (Sido `Seoul`, Sigungu `Gangnam-gu`) must be rendered with a separate visual color state (`has-descendant-selected`) that is distinct from `current`/direct `selected`. The visual system may stay in a blue family, but `current` and `has-descendant-selected` must be clearly separated by tone/saturation and auxiliary cues (e.g., border style). This state persists while at least one descendant is selected and returns to default immediately after the last descendant is removed. | AC-023 |

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
| AC-006 | Column node changes (including initial render) | Sido/Sigungu `SelectableRegionColumn` must keep `current` unselected and must not auto-call `onSelectedRegion` until explicit user click. | FR-006 |
| AC-007 | Select Sido item | `findAllSigungus(selectedSido.code)` is called and Sigungu list refreshes. | FR-007 |
| AC-008 | Select Sigungu item | `findAllEupmyeondongs(selectedSigungu.code)` is called and Eup/Myeon/Dong list refreshes. | FR-008 |
| AC-009 | Check Eup/Myeon/Dong item | one chip is added with `>`-joined full path label. | FR-009 |
| AC-010 | Toggle same item again | existing chip is removed; no duplicates remain. | FR-010 |
| AC-011 | Mix whole + detail in same Sigungu | mutual exclusivity is maintained in that Sigungu scope. | FR-011 |
| AC-012 | Select 3 conditions | 3 chips are rendered in selected area. | FR-012 |
| AC-013 | Click chip delete | only that chip is removed. | FR-013 |
| AC-014 | Click clear-all | all chips removed; button becomes disabled. | FR-014 |
| AC-015 | Sigungu or Eup/Myeon/Dong column is empty | Show `상위 지역을 먼저 선택해 주세요.` when parent region is not selected; show `표시할 지역이 없습니다.` when result data is empty after parent selection. | FR-015 |
| AC-016 | Compare current vs selected states | current has highlighted background; selected has highlighted text. | FR-016 |
| AC-017 | Provide `options.onChange` | callback extension point exists and can be wired to selection updates. | FR-017 |
| AC-018 | Click keyword trigger | `options.onClick` fires when provided. | FR-018 |
| AC-019 | Switch between `Seoul whole` ↔ `Seoul Gangnam-gu`, and `Busan Haeundae-gu` -> `Busan whole` | Only the last-selected condition remains, and conflicting conditions in the same Sido scope are automatically cleared. Right after selecting `Busan whole`, the previously selected `Haeundae-gu` condition must be removed. | FR-019 |
| AC-020 | Check `Seoul whole` in Sigungu column | Condition is added/removed immediately, and the same `Seoul whole` checkbox option is not duplicated in Eup/Myeon/Dong column. | FR-007, FR-020 |
| AC-021 | Immediately after selecting `Seoul` or after checking then unchecking `Seoul whole` in Sigungu (without explicitly clicking `Gangnam-gu`) | `Gangnam-gu` must not become `current`/selected automatically; Sigungu `current` remains empty. `Gangnam-gu` `current` and Eup/Myeon/Dong refresh happen only after explicit user click on `Gangnam-gu`. | FR-021 |
| AC-022 | Compare checkbox items (e.g., `Seoul whole`, `Yeoksam-dong`) with normal region items (e.g., `Seoul`, `Gangnam-gu`) in the same region-selection context | Compared texts have identical `font-family`, `font-size`, `font-weight`, and `line-height`. Under `selected/current/hover`, typography remains unchanged and only color/background changes. | FR-022 |
| AC-023 | With `Seoul > Gangnam-gu > Yeoksam-dong` selected, inspect Sido and Sigungu columns | `Seoul` in the Sido column and `Gangnam-gu` in the Sigungu column are shown with a distinct descendant-selection color. Even if both states use blue tones, `current` and `has-descendant-selected` must be immediately distinguishable via tone/saturation or border-style differences, and the state must revert immediately when `Yeoksam-dong` is deselected. | FR-023 |

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
- QA-006: Differentiate no-parent-selected vs empty-data states and render the correct Korean empty-state guidance
- QA-007: Validate mutual exclusivity between Sido whole and child Sigungu (examples: `Seoul whole` <-> `Seoul Gangnam-gu`, and selecting `Busan whole` after `Busan Haeundae-gu` removes `Haeundae-gu` immediately)
- QA-008: Checking `Seoul whole` directly in Sigungu is applied immediately, and the same whole option is not duplicated in Eup/Myeon/Dong
- QA-009: On Sigungu list refresh (Sido change, and checking then unchecking `Seoul whole`), `Gangnam-gu` must not be auto-selected/current; the state remains unselected until explicit Sigungu click
- QA-010: Typography (`font-family/font-size/font-weight/line-height`) is identical across Sigungu Sido-whole checkbox text, Eup/Myeon/Dong checkbox text, and normal region-item text
- QA-011: With `Seoul > Gangnam-gu > Yeoksam-dong` selected, Sido `Seoul` and Sigungu `Gangnam-gu` show a dedicated descendant-selection color (`has-descendant-selected`) and are distinguishable from `current` through blue-tone/border-style differences, and both revert when `Yeoksam-dong` is removed

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
- OI-010 (`Must`): After selecting Sido-whole in Sigungu, the same Sido-whole checkbox is redundantly exposed again in Eup/Myeon/Dong, causing unnecessary duplicate selection steps.
- OI-011 (`Must`): On Sigungu list refreshes (Sido change, checking then unchecking `Seoul whole`, etc.), the first Sigungu (`Gangnam-gu`) is auto-selected/current, changing child state before explicit user intent.
- OI-012 (`Should`): Typography differs between checkbox label text and normal region-item text in region selection, making the UI feel visually inconsistent.
- OI-013 (`Must`): Even when a child region like `Gangnam-gu > Yeoksam-dong` is selected, upper-column items (Sido `Seoul`, Sigungu `Gangnam-gu`) do not show a dedicated descendant-selection color, making current selection context hard to scan.

