import type { SelectedRegionCondition } from './types'

function isWholeRegionCondition(condition: SelectedRegionCondition): boolean {
  return condition.sigungu.code === condition.eupmyeondong.code
}

function isSameSigungu(
  left: SelectedRegionCondition,
  right: SelectedRegionCondition,
): boolean {
  return left.sigungu.code === right.sigungu.code
}

export function toggleRegionCondition(
  previous: SelectedRegionCondition[],
  nextCondition: SelectedRegionCondition,
): SelectedRegionCondition[] {
  const alreadySelected = previous.some(
    (condition) => condition.id === nextCondition.id,
  )

  if (alreadySelected) {
    return previous.filter((condition) => condition.id !== nextCondition.id)
  }

  if (isWholeRegionCondition(nextCondition)) {
    const filtered = previous.filter(
      (condition) => !isSameSigungu(condition, nextCondition),
    )
    return [...filtered, nextCondition]
  }

  const filtered = previous.filter((condition) => {
    if (!isSameSigungu(condition, nextCondition)) {
      return true
    }

    return !isWholeRegionCondition(condition)
  })

  return [...filtered, nextCondition]
}

