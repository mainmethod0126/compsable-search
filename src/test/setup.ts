import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'

type MatcherRegistry = {
  extend: (nextMatchers: Record<string, unknown>) => void
}

const expectRegistry = (
  globalThis as typeof globalThis & { expect?: MatcherRegistry }
).expect

expectRegistry?.extend(matchers)

afterEach(() => {
  cleanup()
})
