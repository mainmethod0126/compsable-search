import { describe, expect, it } from 'vitest'
import * as legacyAdapterModule from './adaptLegacySelectorsProps'
import * as compatModule from './index'

describe('compat contract (V2)', () => {
  it('adaptLegacySelectorsProps 모듈은 더 이상 런타임 API를 노출하지 않는다', () => {
    expect(Object.keys(legacyAdapterModule)).toEqual([])
    expect('adaptLegacySelectorsProps' in legacyAdapterModule).toBe(false)
  })

  it('compat 엔트리포인트는 빈 export를 유지한다', () => {
    expect(Object.keys(compatModule)).toEqual([])
  })
})
