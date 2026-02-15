import { useMemo, useState } from 'react'
import { RegionDetailPanel } from './RegionDetailPanel'
import { SelectedConditionBasket } from './SelectedConditionBasket'
import { toggleRegionCondition } from './selectionPolicy'
import type {
  ComposableSearchProps,
  ComposableSelectProps,
  Region,
  RegionSelectOptions,
  RegionSelectProps,
  SelectedRegionCondition,
} from './types'
import './ComposableSearch.css'

const DETAILED_CONDITION_PLACEHOLDER = '상세 조건을 선택해 주세요.'
const REGION_PLACEHOLDER = '지역 선택'
const KEYWORD_PLACEHOLDER = '키워드 선택'

function resolveRegionSelector(
  selectorsProps: ComposableSelectProps[],
): RegionSelectProps | undefined {
  return selectorsProps.find(
    (selector): selector is RegionSelectProps => selector.type === 'region',
  )
}

function resolveClassName(className?: string): string {
  return ['cs-composable-search', className].filter(Boolean).join(' ')
}

export function ComposableSearch({
  selectorsProps = [],
  className,
  style,
}: ComposableSearchProps) {
  const [isOpenDetailedConditionArea, setIsOpenDetailedConditionArea] =
    useState(false)
  const [selectedConditions, setSelectedConditions] = useState<
    SelectedRegionCondition[]
  >([])

  const regionSelector = useMemo(
    () => resolveRegionSelector(selectorsProps),
    [selectorsProps],
  )

  const handleToggleRegionTrigger = (selector: RegionSelectProps) => {
    setIsOpenDetailedConditionArea((previous) => !previous)
    selector.options?.onClick?.()
  }

  const handleToggleRegionCondition = (
    nextCondition: SelectedRegionCondition,
    selectedRegion: Region,
    options?: RegionSelectOptions,
  ) => {
    setSelectedConditions((previous) => {
      const next = toggleRegionCondition(previous, nextCondition)
      options?.onChange?.(next)
      return next
    })
    options?.onSelectedEupmyeondong?.(selectedRegion)
  }

  const handleRemoveCondition = (
    conditionId: string,
    options?: RegionSelectOptions,
  ) => {
    setSelectedConditions((previous) => {
      const next = previous.filter((condition) => condition.id !== conditionId)
      options?.onChange?.(next)
      return next
    })
  }

  const handleClearAllConditions = (options?: RegionSelectOptions) => {
    setSelectedConditions(() => {
      const next: SelectedRegionCondition[] = []
      options?.onChange?.(next)
      return next
    })
  }

  const detailedContent = regionSelector ? (
    <RegionDetailPanel
      selector={regionSelector}
      selectedConditions={selectedConditions}
      onToggleRegionCondition={handleToggleRegionCondition}
    />
  ) : (
    <p className="cs-detailed-placeholder">{DETAILED_CONDITION_PLACEHOLDER}</p>
  )

  return (
    <section className={resolveClassName(className)} style={style}>
      <div className="cs-selector-area" data-testid="cs-selector-area">
        {selectorsProps.map((selector, index) => {
          if (selector.type === 'region') {
            const buttonLabel = selector.options?.placeHolder ?? REGION_PLACEHOLDER

            return (
              <button
                key={`selector-region-${index}`}
                className="cs-selector-trigger"
                type="button"
                onClick={() => handleToggleRegionTrigger(selector)}
              >
                <span aria-hidden="true" className="cs-selector-icon">
                  R
                </span>
                <span>{buttonLabel}</span>
              </button>
            )
          }

          const buttonLabel = selector.options?.placeHolder ?? KEYWORD_PLACEHOLDER

          return (
            <button
              key={`selector-keyword-${index}`}
              className="cs-selector-trigger"
              type="button"
              onClick={() => selector.options?.onClick?.()}
            >
              <span aria-hidden="true" className="cs-selector-icon">
                K
              </span>
              <span>{buttonLabel}</span>
            </button>
          )
        })}
      </div>
      <div
        className="cs-detailed-area"
        data-state={isOpenDetailedConditionArea ? 'open' : 'closed'}
        data-testid="cs-detailed-area"
      >
        {detailedContent}
      </div>
      <div className="cs-selected-area" data-testid="cs-selected-area">
        <SelectedConditionBasket
          selectedConditions={selectedConditions}
          onRemoveCondition={(conditionId) =>
            handleRemoveCondition(conditionId, regionSelector?.options)
          }
          onClearAllConditions={() =>
            handleClearAllConditions(regionSelector?.options)
          }
        />
      </div>
    </section>
  )
}
