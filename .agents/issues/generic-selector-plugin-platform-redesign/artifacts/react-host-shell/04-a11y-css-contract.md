# T-024 A11y Checklist + CSS Contract

## 접근성 체크리스트
- trigger는 실제 `<button>`을 사용한다.
- trigger는 `aria-controls`와 `aria-expanded`를 제공한다.
- active trigger는 `aria-pressed`로 상태를 반영한다.
- panel host empty state는 `role="status"`로 읽힌다.
- selected basket remove 버튼은 item 이름을 포함한 `aria-label`을 가진다.
- focus ring은 `:focus-visible` 기준으로만 노출한다.
- keyboard mode는 host root에서 추적하고 `data-shell-state="keyboard*"`로 반영한다.
- clear-all 버튼은 선택값이 없을 때 `disabled` 상태가 된다.

## CSS Custom Property Contract
| 토큰 | 의미 |
| --- | --- |
| `--cs-shell-gap` | shell 영역 간 gap |
| `--cs-shell-radius` | card/trigger radius |
| `--cs-shell-border-color` | 기본 border 색 |
| `--cs-shell-surface` | 기본 surface |
| `--cs-shell-surface-muted` | muted surface |
| `--cs-shell-surface-accent` | active/hover accent surface |
| `--cs-shell-text-primary` | 기본 텍스트 |
| `--cs-shell-text-secondary` | 보조 텍스트 |
| `--cs-shell-text-muted` | 약한 텍스트 |
| `--cs-shell-accent` | 강조색 |
| `--cs-shell-accent-strong` | 강한 강조색 |
| `--cs-shell-danger` | 삭제/위험 액션 색 |
| `--cs-shell-shadow` | card shadow |

## Class Contract
| class | 역할 |
| --- | --- |
| `.cs-shell` | host root |
| `.cs-shell__trigger-area` | trigger area container |
| `.cs-shell__trigger` | selector trigger button |
| `.cs-shell__trigger-label` | trigger text |
| `.cs-shell__trigger-count` | selection count badge |
| `.cs-shell__trigger-indicator` | active indicator |
| `.cs-shell__panel-host` | panel host container |
| `.cs-shell__panel-card` | open panel card |
| `.cs-shell__panel-header` | panel header |
| `.cs-shell__panel-title` | panel title |
| `.cs-shell__panel-body` | panel content wrapper |
| `.cs-shell__panel-empty` | empty panel wrapper |
| `.cs-shell__panel-empty-title` | empty title |
| `.cs-shell__panel-empty-description` | empty description |
| `.cs-shell__selected-basket` | selected basket container |
| `.cs-shell__selected-header` | basket header |
| `.cs-shell__selected-title` | basket title |
| `.cs-shell__clear-button` | clear-all button |
| `.cs-shell__selected-list` | chip list |
| `.cs-shell__selected-item` | chip item |
| `.cs-shell__selected-label` | chip label |
| `.cs-shell__selected-remove` | chip remove button |
| `.cs-shell__selected-empty` | empty basket message |

## Data Attribute Contract
| selector | 값 |
| --- | --- |
| `.cs-shell[data-shell-state]` | `idle`, `open`, `focus`, `focus-open`, `keyboard`, `keyboard-open` |
| `.cs-shell__trigger-area[data-shell-state]` | `empty`, `ready` |
| `.cs-shell__panel-host[data-panel-state]` | `empty`, `open` |
| `.cs-shell__selected-basket[data-selection-state]` | `empty`, `filled` |
| `.cs-shell__trigger[data-active]` | `true`, `false` |
| `.cs-shell__trigger[data-open]` | `true`, `false` |
| `.cs-shell__trigger[data-selected]` | `true`, `false` |
| `.cs-shell__trigger-count[data-count-state]` | `empty`, `filled` |

## 구현 규칙
- selector package는 위 class/token/data-state 이름을 재정의하지 않는다.
- loading/error UI가 필요하면 selector package panel 내부에서 구현하고, host는 `.cs-shell__panel-body` 안의 레이아웃만 유지한다.
- shell root 상태 이름은 host 구현이 계산하며, selector package가 직접 덮어쓰지 않는다.
