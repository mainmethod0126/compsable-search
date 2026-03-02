export type MaybePromise<TValue> = TValue | PromiseLike<TValue>

export type AsyncLoaderRaceStrategy = 'last-write-wins' | 'sequence'

export interface AsyncLoaderContext {
  signal: AbortSignal
  sequence: number
}

export type AsyncLoaderExecutor<TInput, TValue> = (
  input: TInput,
  context: AsyncLoaderContext,
) => MaybePromise<TValue>

export interface AsyncLoaderOptions {
  raceStrategy?: AsyncLoaderRaceStrategy
}

export interface AsyncLoaderRunOptions {
  signal?: AbortSignal
}

interface AsyncLoaderResultBase {
  status: 'success' | 'error' | 'aborted'
  sequence: number
  isLatest: boolean
}

export interface AsyncLoaderSuccessResult<TValue> extends AsyncLoaderResultBase {
  status: 'success'
  value: TValue
}

export interface AsyncLoaderErrorResult extends AsyncLoaderResultBase {
  status: 'error'
  error: unknown
}

export interface AsyncLoaderAbortedResult extends AsyncLoaderResultBase {
  status: 'aborted'
  reason: unknown
}

export type AsyncLoaderResult<TValue> =
  | AsyncLoaderSuccessResult<TValue>
  | AsyncLoaderErrorResult
  | AsyncLoaderAbortedResult

export interface AsyncLoader<TInput, TValue> {
  run(
    input: TInput,
    options?: AsyncLoaderRunOptions,
  ): Promise<AsyncLoaderResult<TValue>>
  cancel(reason?: unknown): void
  getLatestSequence(): number
  getInFlightSequence(): number | null
}

export interface SequenceGate {
  next(): number
  isLatest(sequence: number): boolean
  getLatest(): number
}

interface LinkedAbortController {
  controller: AbortController
  unlink: () => void
}

interface InFlightRequest {
  sequence: number
  controller: AbortController
}

export function createSequenceGate(initialSequence = 0): SequenceGate {
  let latestSequence = initialSequence

  return {
    next: () => {
      latestSequence += 1
      return latestSequence
    },
    isLatest: (sequence: number) => sequence === latestSequence,
    getLatest: () => latestSequence,
  }
}

export function isStaleResult<TValue>(
  result: AsyncLoaderResult<TValue>,
): boolean {
  return !result.isLatest
}

function createLinkedAbortController(
  externalSignal?: AbortSignal,
): LinkedAbortController {
  const controller = new AbortController()

  if (!externalSignal) {
    return {
      controller,
      unlink: () => {},
    }
  }

  if (externalSignal.aborted) {
    controller.abort(externalSignal.reason)
    return {
      controller,
      unlink: () => {},
    }
  }

  const onAbort = () => {
    controller.abort(externalSignal.reason)
  }

  externalSignal.addEventListener('abort', onAbort, { once: true })

  return {
    controller,
    unlink: () => externalSignal.removeEventListener('abort', onAbort),
  }
}

function isAbortLikeError(error: unknown): boolean {
  if (error instanceof DOMException) {
    return error.name === 'AbortError'
  }

  if (typeof error !== 'object' || error === null) {
    return false
  }

  return 'name' in error && error.name === 'AbortError'
}

function resolveAbortReason(signal: AbortSignal, error: unknown): unknown {
  if (signal.aborted && signal.reason !== undefined) {
    return signal.reason
  }

  return error
}

function createSupersededReason(
  canceledSequence: number,
  latestSequence: number,
): Readonly<{
  type: 'superseded'
  canceledSequence: number
  latestSequence: number
}> {
  return {
    type: 'superseded',
    canceledSequence,
    latestSequence,
  }
}

function createManualCancelReason(
  sequence: number,
): Readonly<{
  type: 'manual-cancel'
  sequence: number
}> {
  return {
    type: 'manual-cancel',
    sequence,
  }
}

export function createAsyncLoader<TInput, TValue>(
  executor: AsyncLoaderExecutor<TInput, TValue>,
  options: AsyncLoaderOptions = {},
): AsyncLoader<TInput, TValue> {
  const raceStrategy = options.raceStrategy ?? 'last-write-wins'
  const sequenceGate = createSequenceGate()
  let inFlightRequest: InFlightRequest | null = null

  const run: AsyncLoader<TInput, TValue>['run'] = async (
    input,
    runOptions = {},
  ) => {
    const nextSequence = sequenceGate.next()

    if (raceStrategy === 'last-write-wins' && inFlightRequest) {
      inFlightRequest.controller.abort(
        createSupersededReason(inFlightRequest.sequence, nextSequence),
      )
    }

    const linkedAbortController = createLinkedAbortController(runOptions.signal)
    inFlightRequest = {
      sequence: nextSequence,
      controller: linkedAbortController.controller,
    }

    try {
      const value = await Promise.resolve(
        executor(input, {
          signal: linkedAbortController.controller.signal,
          sequence: nextSequence,
        }),
      )

      return {
        status: 'success',
        value,
        sequence: nextSequence,
        isLatest: sequenceGate.isLatest(nextSequence),
      }
    } catch (error) {
      if (
        linkedAbortController.controller.signal.aborted ||
        isAbortLikeError(error)
      ) {
        return {
          status: 'aborted',
          reason: resolveAbortReason(linkedAbortController.controller.signal, error),
          sequence: nextSequence,
          isLatest: sequenceGate.isLatest(nextSequence),
        }
      }

      return {
        status: 'error',
        error,
        sequence: nextSequence,
        isLatest: sequenceGate.isLatest(nextSequence),
      }
    } finally {
      linkedAbortController.unlink()
      if (inFlightRequest?.sequence === nextSequence) {
        inFlightRequest = null
      }
    }
  }

  const cancel: AsyncLoader<TInput, TValue>['cancel'] = (reason) => {
    if (!inFlightRequest) {
      return
    }

    inFlightRequest.controller.abort(
      reason ?? createManualCancelReason(inFlightRequest.sequence),
    )
  }

  return {
    run,
    cancel,
    getLatestSequence: () => sequenceGate.getLatest(),
    getInFlightSequence: () => inFlightRequest?.sequence ?? null,
  }
}
