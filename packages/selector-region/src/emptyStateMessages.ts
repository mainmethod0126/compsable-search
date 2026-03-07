export const EMPTY_STATE_MESSAGES = {
  PARENT_NOT_SELECTED: '상위 지역을 먼저 선택해 주세요.',
  NO_ITEMS: '표시할 지역이 없습니다.',
} as const

export function resolveChildColumnEmptyMessage(hasParentSelection: boolean): string {
  return hasParentSelection
    ? EMPTY_STATE_MESSAGES.NO_ITEMS
    : EMPTY_STATE_MESSAGES.PARENT_NOT_SELECTED
}
