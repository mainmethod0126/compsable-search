import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCallback, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_KEYWORD_SELECTOR_DRIVER } from '../src/drivers/keywordDriver'
import type {
  KeywordSelectOptions,
  SelectionItem,
  SelectedKeywordCondition,
} from '../src/types'

interface KeywordPanelHarnessProps {
  options?: KeywordSelectOptions
  initialSelectedItems?: SelectionItem[]
  onSelectedItemsChange?: (nextItems: SelectionItem[]) => void
  emitError?: (error: unknown) => void
}

function createKeywordToken(
  keyword: string,
  selectorId = 'keyword-main',
): SelectedKeywordCondition {
  return {
    id: `keyword:${keyword}`,
    displayName: `키워드: ${keyword}`,
    selectorId,
    selectorType: 'keyword',
    keyword,
    normalizedKeyword: keyword,
  }
}

function KeywordPanelHarness({
  options,
  initialSelectedItems = [],
  onSelectedItemsChange = () => undefined,
  emitError = () => undefined,
}: KeywordPanelHarnessProps) {
  const [selectedItems, setSelectedItemsState] = useState<SelectionItem[]>(
    initialSelectedItems,
  )

  const setSelectedItems = useCallback(
    (nextItems: SelectionItem[]) => {
      setSelectedItemsState(nextItems)
      onSelectedItemsChange(nextItems)
    },
    [onSelectedItemsChange],
  )

  return (
    <>
      {DEFAULT_KEYWORD_SELECTOR_DRIVER.renderPanel({
        selectorId: 'keyword-main',
        selectorType: 'keyword',
        props: { options },
        selectedItems,
        setSelectedItems,
        closePanel: () => undefined,
        emitError,
      })}
    </>
  )
}

describe('keywordDriver token event wiring', () => {
  it('Enter 입력을 토큰 추가로 연결한다', async () => {
    const user = userEvent.setup()
    const onSelectedItemsChange = vi.fn()

    render(
      <KeywordPanelHarness
        onSelectedItemsChange={onSelectedItemsChange}
        options={{ label: '키워드 입력' }}
      />,
    )

    const input = screen.getByRole('textbox', { name: '키워드 입력' })

    await user.type(input, '  React   Query  {Enter}')

    expect(onSelectedItemsChange).toHaveBeenLastCalledWith([
      expect.objectContaining({
        id: 'keyword:react query',
        selectorId: 'keyword-main',
        selectorType: 'keyword',
        keyword: 'react query',
      }),
    ])
    expect(
      screen.getByRole('button', { name: '키워드: react query' }),
    ).toBeInTheDocument()
  })

  it('Blur 입력을 현재 토큰 확정으로 연결한다', async () => {
    const user = userEvent.setup()
    const onSelectedItemsChange = vi.fn()

    render(
      <KeywordPanelHarness
        onSelectedItemsChange={onSelectedItemsChange}
        options={{ label: '키워드 입력' }}
      />,
    )

    const input = screen.getByRole('textbox', { name: '키워드 입력' })

    await user.type(input, '  vite  ')
    fireEvent.blur(input)

    expect(onSelectedItemsChange).toHaveBeenLastCalledWith([
      expect.objectContaining({
        id: 'keyword:vite',
        keyword: 'vite',
      }),
    ])
    expect(screen.getByRole('button', { name: '키워드: vite' })).toBeInTheDocument()
  })

  it('입력이 비어 있을 때 Backspace를 누르면 마지막 토큰을 제거한다', async () => {
    const user = userEvent.setup()
    const onSelectedItemsChange = vi.fn()

    render(
      <KeywordPanelHarness
        initialSelectedItems={[createKeywordToken('react'), createKeywordToken('query')]}
        onSelectedItemsChange={onSelectedItemsChange}
        options={{ label: '키워드 입력' }}
      />,
    )

    const input = screen.getByRole('textbox', { name: '키워드 입력' })

    await user.click(input)
    await user.keyboard('{Backspace}')

    expect(onSelectedItemsChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: 'keyword:react' }),
    ])
    expect(
      screen.queryByRole('button', { name: '키워드: query' }),
    ).not.toBeInTheDocument()
  })

  it('중복 토큰은 invalid token 정책과 에러 메시지에 연결된다', async () => {
    const user = userEvent.setup()
    const onInvalidToken = vi.fn()

    render(
      <KeywordPanelHarness
        initialSelectedItems={[createKeywordToken('react')]}
        options={{
          label: '키워드 입력',
          onInvalidToken,
        }}
      />,
    )

    await user.type(
      screen.getByRole('textbox', { name: '키워드 입력' }),
      ' React {Enter}',
    )

    expect(onInvalidToken).toHaveBeenCalledWith('duplicate-token', {
      inputValue: ' React ',
      normalizedValue: 'react',
      maxTokens: 5,
      maxTokenLength: 20,
    })
    expect(screen.getByRole('alert')).toHaveTextContent('이미 추가된 키워드입니다.')
  })

  it('최대 길이와 최대 토큰 수 초과를 invalid token 정책으로 보고한다', async () => {
    const user = userEvent.setup()
    const onInvalidToken = vi.fn()

    const { unmount } = render(
      <KeywordPanelHarness
        options={{
          label: '키워드 입력',
          maxTokenLength: 5,
          onInvalidToken,
        }}
      />,
    )

    await user.type(
      screen.getByRole('textbox', { name: '키워드 입력' }),
      'react-query{Enter}',
    )

    expect(onInvalidToken).toHaveBeenLastCalledWith('token-too-long', {
      inputValue: 'react-query',
      normalizedValue: 'react-query',
      maxTokens: 5,
      maxTokenLength: 5,
    })

    unmount()

    render(
      <KeywordPanelHarness
        initialSelectedItems={[createKeywordToken('react')]}
        options={{
          label: '키워드 입력',
          maxTokens: 1,
          onInvalidToken,
        }}
      />,
    )

    await user.clear(screen.getByRole('textbox', { name: '키워드 입력' }))
    await user.type(
      screen.getByRole('textbox', { name: '키워드 입력' }),
      'query{Enter}',
    )

    expect(onInvalidToken).toHaveBeenLastCalledWith('max-token-reached', {
      inputValue: 'query',
      normalizedValue: 'query',
      maxTokens: 1,
      maxTokenLength: 20,
    })
    expect(screen.getByRole('alert')).toHaveTextContent(
      '키워드는 최대 1개까지 추가할 수 있습니다.',
    )
  })

  it('onInvalidToken 예외는 emitError로 격리한다', async () => {
    const user = userEvent.setup()
    const emitError = vi.fn()
    const callbackError = new Error('invalid token callback failed')

    render(
      <KeywordPanelHarness
        options={{
          label: '키워드 입력',
          maxTokenLength: 3,
          onInvalidToken: () => {
            throw callbackError
          },
        }}
        emitError={emitError}
      />,
    )

    await user.type(
      screen.getByRole('textbox', { name: '키워드 입력' }),
      'react{Enter}',
    )

    expect(emitError).toHaveBeenCalledWith(callbackError)
  })
})
