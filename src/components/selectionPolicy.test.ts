import {
  resolveDescendantSelectedAncestorCodeSet,
  toggleRegionCondition,
} from './selectionPolicy'
import type { Region, SelectedRegionCondition } from './types'

const SEOUL: Region = {
  displayName: '서울특별시',
  name: '서울특별시',
  code: '11',
}
const BUSAN: Region = {
  displayName: '부산광역시',
  name: '부산광역시',
  code: '26',
}
const GANGNAM: Region = {
  displayName: '강남구',
  name: '강남구',
  code: '11680',
}
const HAEUNDAE: Region = {
  displayName: '해운대구',
  name: '해운대구',
  code: '26350',
}
const SEOUL_WHOLE: Region = {
  displayName: '서울특별시 전체',
  name: '서울특별시',
  code: '11',
}
const BUSAN_WHOLE: Region = {
  displayName: '부산광역시 전체',
  name: '부산광역시',
  code: '26',
}
const HAEUNDAE_WHOLE: Region = {
  displayName: '해운대구 전체',
  name: '해운대구',
  code: '26350',
}
const YEOKSAM: Region = {
  displayName: '역삼동',
  name: '역삼동',
  code: '1168010100',
}

function createCondition(
  sido: Region,
  sigungu: Region,
  eupmyeondong: Region,
): SelectedRegionCondition {
  return {
    id: eupmyeondong.code,
    displayName: `${sido.displayName}>${sigungu.displayName}>${eupmyeondong.displayName}`,
    sido,
    sigungu,
    eupmyeondong,
  }
}

const seoulGangnamCondition = createCondition(SEOUL, GANGNAM, YEOKSAM)
const busanWholeCondition = createCondition(BUSAN, BUSAN_WHOLE, BUSAN_WHOLE)
const busanHaeundaeWholeCondition = createCondition(
  BUSAN,
  HAEUNDAE,
  HAEUNDAE_WHOLE,
)
const seoulWholeCondition = createCondition(SEOUL, SEOUL_WHOLE, SEOUL_WHOLE)

describe('toggleRegionCondition', () => {
  it('해운대구 조건이 선택된 상태에서 부산광역시 전체를 선택하면 부산 하위 조건이 제거된다', () => {
    const result = toggleRegionCondition(
      [busanHaeundaeWholeCondition],
      busanWholeCondition,
    )

    expect(result).toEqual([busanWholeCondition])
  })

  it('부산광역시 전체가 선택된 상태에서 해운대구 조건을 선택하면 부산 전체 조건이 제거된다', () => {
    const result = toggleRegionCondition(
      [busanWholeCondition],
      busanHaeundaeWholeCondition,
    )

    expect(result).toEqual([busanHaeundaeWholeCondition])
  })

  it('시도 전체 상호 배타는 동일 시도 범위에만 적용되고 타 시도 조건은 유지된다', () => {
    const result = toggleRegionCondition(
      [seoulGangnamCondition, seoulWholeCondition],
      busanWholeCondition,
    )

    expect(result).toEqual([seoulGangnamCondition, seoulWholeCondition, busanWholeCondition])
  })
})

describe('resolveDescendantSelectedAncestorCodeSet', () => {
  it('읍/면/동 상세 조건이 선택되면 상위 시/도/시군구 코드를 반환한다', () => {
    const result = resolveDescendantSelectedAncestorCodeSet([
      seoulGangnamCondition,
    ])

    expect(result.sidoCodeSet).toEqual(new Set(['11']))
    expect(result.sigunguCodeSet).toEqual(new Set(['11680']))
  })

  it('시군구/읍면동 전체 선택은 상위 하위선택 인디케이터 대상으로 포함한다', () => {
    const result = resolveDescendantSelectedAncestorCodeSet([
      seoulWholeCondition,
      busanHaeundaeWholeCondition,
    ])

    expect(result.sidoCodeSet).toEqual(new Set(['11', '26']))
    expect(result.sigunguCodeSet).toEqual(new Set(['26350']))
  })
})
