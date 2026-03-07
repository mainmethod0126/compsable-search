import { describe, expect, it } from 'vitest'
import { ComposableSearch } from '../src/index'

describe('@compsable-search/react facade', () => {
  it('exports the React host component', () => {
    expect(typeof ComposableSearch).toBe('function')
  })
})
