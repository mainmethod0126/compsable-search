import type { SelectedRegionCondition } from './types'

function isWholeRegionCondition(condition: SelectedRegionCondition): boolean {
  return condition.sigungu.code === condition.eupmyeondong.code
}

function isSidoWholeCondition(condition: SelectedRegionCondition): boolean {
  return (
    isWholeRegionCondition(condition) && condition.sido.code === condition.sigungu.code
  )
}

function isSameSido(
  left: SelectedRegionCondition,
  right: SelectedRegionCondition,
): boolean {
  return left.sido.code === right.sido.code
}

function isSameSigungu(
  left: SelectedRegionCondition,
  right: SelectedRegionCondition,
): boolean {
  return left.sigungu.code === right.sigungu.code
}

export interface DescendantSelectedAncestorCodeSet {
  sidoCodeSet: Set<string>
  sigunguCodeSet: Set<string>
}

export function resolveDescendantSelectedAncestorCodeSet(
  selectedConditions: SelectedRegionCondition[],
): DescendantSelectedAncestorCodeSet {
  const sidoCodeSet = new Set<string>()
  const sigunguCodeSet = new Set<string>()

  selectedConditions.forEach((condition) => {
    sidoCodeSet.add(condition.sido.code)

    if (!isSidoWholeCondition(condition)) {
      sigunguCodeSet.add(condition.sigungu.code)
    }
  })

  return {
    sidoCodeSet,
    sigunguCodeSet,
  }
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

  if (isSidoWholeCondition(nextCondition)) {
    const filtered = previous.filter(
      (condition) => !isSameSido(condition, nextCondition),
    )
    return [...filtered, nextCondition]
  }

  const withoutSidoWhole = previous.filter(
    (condition) =>
      !(
        isSidoWholeCondition(condition) && isSameSido(condition, nextCondition)
      ),
  )

  if (isWholeRegionCondition(nextCondition)) {
    const filtered = withoutSidoWhole.filter(
      (condition) => !isSameSigungu(condition, nextCondition),
    )
    return [...filtered, nextCondition]
  }

  const filtered = withoutSidoWhole.filter((condition) => {
    if (!isSameSigungu(condition, nextCondition)) {
      return true
    }

    return !isWholeRegionCondition(condition)
  })

  return [...filtered, nextCondition]
}
