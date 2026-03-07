import { describe, expect, it } from 'vitest'
import {
  DEFAULT_REGION_SEARCH_RESULT_LIMIT,
  createRegionSelector,
} from '../src/index'

describe('@compsable-search/selector-region facade', () => {
  it('exports the region selector factory', () => {
    const selector = createRegionSelector('region-main', {
      findAllSidos: () => [],
      findAllSigungus: () => [],
      findAllEupmyeondongs: () => [],
      options: {
        placeholder: '지역 선택',
      },
    })

    expect(selector.id).toBe('region-main')
    expect(selector.type).toBe('region')
    expect(DEFAULT_REGION_SEARCH_RESULT_LIMIT).toBeGreaterThan(0)
  })
})
