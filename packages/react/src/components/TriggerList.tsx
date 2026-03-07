import type { TriggerListProps } from '../types'

export function TriggerList({
  activeSelectorId,
  items,
  onTriggerClick,
}: TriggerListProps) {
  return (
    <div
      aria-label="Selector trigger area"
      className="cs-shell__trigger-area"
      data-shell-state={items.length === 0 ? 'empty' : 'ready'}
      role="tablist"
    >
      {items.map((item) => {
        const panelId = `cs-panel-${item.id}`
        const isSelected = item.selectedCount > 0

        return (
          <button
            key={item.id}
            aria-label={item.label}
            aria-controls={panelId}
            aria-expanded={item.isOpen}
            aria-selected={item.isActive}
            className="cs-shell__trigger"
            data-selection-state={isSelected ? 'selected' : 'empty'}
            data-shell-state={item.isActive ? 'active' : 'idle'}
            role="tab"
            type="button"
            onClick={() => onTriggerClick(item.id)}
          >
            <span className="cs-shell__trigger-label">{item.label}</span>
            <span
              aria-live="polite"
              className="cs-shell__trigger-count"
              data-selection-state={isSelected ? 'selected' : 'empty'}
            >
              {item.selectedCount}
            </span>
            {activeSelectorId === item.id ? (
              <span className="cs-shell__trigger-indicator" aria-hidden="true" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
