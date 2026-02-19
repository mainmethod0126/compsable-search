import type { SearchSelectionItem } from './types'

interface SelectedConditionBasketProps {
  selectedConditions: SearchSelectionItem[]
  onRemoveCondition: (conditionId: string) => void
  onClearAllConditions: () => void
}

export function SelectedConditionBasket({
  selectedConditions,
  onRemoveCondition,
  onClearAllConditions,
}: SelectedConditionBasketProps) {
  return (
    <section className="cs-selected-condition-basket">
      <header className="cs-selected-condition-header">
        <h3 className="cs-selected-condition-title">선택된 조건</h3>
        <button
          className="cs-clear-button"
          disabled={selectedConditions.length === 0}
          type="button"
          onClick={onClearAllConditions}
        >
          전체 삭제
        </button>
      </header>
      <ul className="cs-selected-condition-list">
        {selectedConditions.map((condition) => (
          <li key={condition.id}>
            <div className="cs-selected-condition-chip">
              <span>{condition.displayName}</span>
              <button
                aria-label={`${condition.displayName} 삭제`}
                className="cs-chip-remove-button"
                type="button"
                onClick={() => onRemoveCondition(condition.id)}
              >
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

