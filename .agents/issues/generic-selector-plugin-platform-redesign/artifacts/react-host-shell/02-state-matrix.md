# T-022 Shell State Matrix

## 상태 목록
| 상태 축 | 값 | 의미 | shell 반영 위치 |
| --- | --- | --- | --- |
| shell focus | `idle` | 기본 대기 상태 | `.cs-shell[data-shell-state="idle"]` |
| shell focus | `open` | panel open, 포커스 아님 | `.cs-shell[data-shell-state="open"]` |
| shell focus | `focus` | shell 내부 포커스, panel closed | `.cs-shell[data-shell-state="focus"]` |
| shell focus | `focus-open` | shell 내부 포커스 + panel open | `.cs-shell[data-shell-state="focus-open"]` |
| shell keyboard | `keyboard` | 키보드 상호작용 감지, panel closed | `.cs-shell[data-shell-state="keyboard"]` |
| shell keyboard | `keyboard-open` | 키보드 상호작용 감지 + panel open | `.cs-shell[data-shell-state="keyboard-open"]` |
| trigger list | `empty` | selector 없음 | `.cs-shell__trigger-area[data-shell-state="empty"]` |
| trigger list | `ready` | selector 목록 표시 가능 | `.cs-shell__trigger-area[data-shell-state="ready"]` |
| panel host | `empty` | active panel 없음 | `.cs-shell__panel-host[data-panel-state="empty"]` |
| panel host | `open` | active panel 렌더링 중 | `.cs-shell__panel-host[data-panel-state="open"]` |
| selected basket | `empty` | 선택값 없음 | `.cs-shell__selected-basket[data-selection-state="empty"]` |
| selected basket | `filled` | 선택값 존재 | `.cs-shell__selected-basket[data-selection-state="filled"]` |
| trigger button | `data-active="true"` | active selector | `.cs-shell__trigger` |
| trigger button | `data-open="true"` | panel open selector | `.cs-shell__trigger` |
| trigger button | `data-selected="true"` | selection count > 0 | `.cs-shell__trigger` |
| count badge | `data-count-state="filled"` | count > 0 | `.cs-shell__trigger-count` |

## empty / loading / error / focus / keyboard 매핑
| UX 상태 | host 책임 | selector package 책임 | 매핑 규칙 |
| --- | --- | --- | --- |
| empty | active panel이 없을 때 empty panel 표시 | 필요 없음 | host가 `data-panel-state="empty"`로 표시 |
| loading | host는 컨테이너만 유지 | selector panel 내부 skeleton/spinner 제공 | panel host 구조는 유지하고 package panel 안에서 처리 |
| error | host는 `emitError`/`onSelectorError` 경로 제공 | selector panel 내부 메시지/복구 UI 제공 | host는 ownership 판단 없이 오류 보고만 수행 |
| focus | host root가 focus capture | selector는 세부 focus ring 자유 구현 | shell은 `data-shell-state`만 바꾼다 |
| keyboard | host root가 key/pointer 입력 모드를 추적 | selector는 세부 키보드 UX 제공 | shell은 `keyboard*` 상태만 제공 |

## 반응형 규칙
| breakpoint | 규칙 |
| --- | --- |
| mobile `< 720px` | trigger area, panel host, selected basket을 세로 적층한다. |
| tablet `>= 720px` | trigger area를 좌측, panel host를 우측에 두고 selected basket은 하단 전체 폭을 사용한다. |
| desktop `>= 1080px` | trigger area / panel host / selected basket 3열 배치를 사용한다. |

## 검증 포인트
- keyboard와 focus는 selector package가 아니라 host shell에서만 계산한다.
- loading/error는 package 내부에 남기고 host는 상태 이름과 수용 컨테이너만 고정한다.
- selected basket 비움/채움은 controller value 기준으로만 결정한다.
