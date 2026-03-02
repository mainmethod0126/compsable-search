import { describe, expect, it } from 'vitest'
import {
  createAsyncLoader,
  createSequenceGate,
  isStaleResult,
  type MaybePromise,
} from './asyncLoader'

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve
  })

  return { promise, resolve }
}

describe('asyncLoader', () => {
  it('MaybePromise 기반으로 sync/async 로더 결과를 모두 처리한다', async () => {
    const loader = createAsyncLoader<number, number>((input): MaybePromise<number> => {
      if (input % 2 === 0) {
        return input * 2
      }
      return Promise.resolve(input * 3)
    })

    const syncResult = await loader.run(2)
    const asyncResult = await loader.run(3)

    expect(syncResult).toMatchObject({
      status: 'success',
      value: 4,
      isLatest: true,
    })
    expect(asyncResult).toMatchObject({
      status: 'success',
      value: 9,
      isLatest: true,
    })
  })

  it('수동 취소 시 abort 결과를 반환하고 reason을 유지한다', async () => {
    const loader = createAsyncLoader<void, string>((_input, { signal }) => {
      return new Promise<string>((_resolve, reject) => {
        signal.addEventListener(
          'abort',
          () => {
            reject(signal.reason)
          },
          { once: true },
        )
      })
    })

    const pending = loader.run(undefined)
    loader.cancel('manual-cancel')

    const result = await pending
    expect(result.status).toBe('aborted')
    if (result.status !== 'aborted') {
      throw new Error('aborted status expected')
    }
    expect(result.reason).toBe('manual-cancel')
    expect(result.isLatest).toBe(true)
  })

  it('외부 AbortSignal 취소를 전달한다', async () => {
    const externalController = new AbortController()
    const loader = createAsyncLoader<void, string>((_input, { signal }) => {
      return new Promise<string>((_resolve, reject) => {
        signal.addEventListener(
          'abort',
          () => {
            reject(new DOMException('aborted', 'AbortError'))
          },
          { once: true },
        )
      })
    })

    const pending = loader.run(undefined, { signal: externalController.signal })
    externalController.abort('external-cancel')

    const result = await pending
    expect(result.status).toBe('aborted')
    if (result.status !== 'aborted') {
      throw new Error('aborted status expected')
    }
    expect(result.reason).toBe('external-cancel')
  })

  it('abort가 아닌 예외는 error 결과로 구분한다', async () => {
    const loader = createAsyncLoader<void, string>(() => {
      throw new Error('network-failed')
    })

    const result = await loader.run(undefined)
    expect(result.status).toBe('error')
    if (result.status !== 'error') {
      throw new Error('error status expected')
    }
    expect(result.error).toBeInstanceOf(Error)
    expect((result.error as Error).message).toBe('network-failed')
  })

  it('sequence 전략에서 이전 요청은 stale로 구분한다', async () => {
    const firstDeferred = createDeferred<number>()
    const secondDeferred = createDeferred<number>()
    const loader = createAsyncLoader<number, number>(
      (input) => (input === 1 ? firstDeferred.promise : secondDeferred.promise),
      { raceStrategy: 'sequence' },
    )

    const firstPending = loader.run(1)
    const secondPending = loader.run(2)

    firstDeferred.resolve(100)
    secondDeferred.resolve(200)

    const firstResult = await firstPending
    const secondResult = await secondPending

    expect(firstResult.status).toBe('success')
    expect(firstResult.isLatest).toBe(false)
    expect(isStaleResult(firstResult)).toBe(true)

    expect(secondResult.status).toBe('success')
    expect(secondResult.isLatest).toBe(true)
    expect(isStaleResult(secondResult)).toBe(false)
  })

  it('last-write-wins 전략에서 이전 in-flight 요청을 abort 처리한다', async () => {
    const loader = createAsyncLoader<number, number>(
      (input, { signal }) => {
        if (input === 1) {
          return new Promise<number>((_resolve, reject) => {
            signal.addEventListener(
              'abort',
              () => {
                reject(signal.reason)
              },
              { once: true },
            )
          })
        }

        return Promise.resolve(200)
      },
      { raceStrategy: 'last-write-wins' },
    )

    const firstPending = loader.run(1)
    const secondResult = await loader.run(2)
    const firstResult = await firstPending

    expect(firstResult.status).toBe('aborted')
    expect(firstResult.isLatest).toBe(false)
    expect(secondResult).toMatchObject({
      status: 'success',
      value: 200,
      isLatest: true,
    })
  })

  it('sequence gate 유틸이 최신 sequence 판별을 제공한다', () => {
    const gate = createSequenceGate()
    const first = gate.next()
    const second = gate.next()

    expect(gate.getLatest()).toBe(second)
    expect(gate.isLatest(first)).toBe(false)
    expect(gate.isLatest(second)).toBe(true)
  })
})
