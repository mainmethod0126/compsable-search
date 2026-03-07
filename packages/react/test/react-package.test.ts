import { describe, expect, it } from 'vitest'
import * as reactPackage from '../src/index'

describe('@compsable-search/react facade', () => {
  it('runtime export를 ComposableSearch로 제한한다', () => {
    expect(Object.keys(reactPackage)).toEqual(['ComposableSearch'])
    expect(typeof reactPackage.ComposableSearch).toBe('function')
  })
})
