import type { SelectedBasketProps } from '../types'

export function SelectedBasket({
  clearAllButtonLabel,
  emptySelectionMessage,
  items,
  removeSelectionAriaLabel,
  title,
  onClearAll,
  onRemoveItem,
}: SelectedBasketProps) {
  return (
    <section
      className="cs-shell__selected-basket"
      data-selection-state={items.length === 0 ? 'empty' : 'selected'}
    >
      <header className="cs-shell__selected-header">
        <h2 className="cs-shell__selected-title">{title}</h2>
        <button
          className="cs-shell__clear-button"
          disabled={items.length === 0}
          type="button"
          onClick={onClearAll}
        >
          {clearAllButtonLabel}
        </button>
      </header>
      {items.length === 0 ? (
        <p className="cs-shell__selected-empty">{emptySelectionMessage}</p>
      ) : (
        <ul className="cs-shell__selected-list">
          {items.map((item) => (
            <li
              key={`${item.selectorId}:${item.id}`}
              className="cs-shell__selected-item"
            >
              <span className="cs-shell__selected-label">{item.displayName}</span>
              <button
                aria-label={removeSelectionAriaLabel(item.displayName)}
                className="cs-shell__selected-remove"
                type="button"
                onClick={() => onRemoveItem(item.selectorId, item.id)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
