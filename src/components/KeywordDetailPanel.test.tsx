import { render, screen } from '@testing-library/react'
import type { KeyboardEventHandler } from 'react'
import { KeywordDetailPanel } from './KeywordDetailPanel'

interface PanelOverrides {
  label?: string
  guideText?: string
  errorMessage?: string | null
}

function createPanelProps({
  label = '키워드 입력',
  guideText = 'Enter로 키워드를 확정하세요.',
  errorMessage = null,
}: PanelOverrides = {}) {
  const onInputKeyDown: KeyboardEventHandler<HTMLInputElement> = () => undefined

  return {
    label,
    guideText,
    inputPlaceholder: '키워드를 입력하세요',
    inputValue: '',
    tokenCount: 0,
    maxTokens: 10,
    errorMessage,
    onInputChange: () => undefined,
    onInputFocus: () => undefined,
    onInputBlur: () => undefined,
    onInputKeyDown,
  }
}

describe('KeywordDetailPanel', () => {
  it('에러가 없으면 입력은 힌트만 aria-describedby로 참조한다', () => {
    render(
      <KeywordDetailPanel
        {...createPanelProps({
          label: '키워드 입력 A',
          guideText: '가이드 A',
          errorMessage: null,
        })}
      />,
    )

    const input = screen.getByRole('textbox', { name: '키워드 입력 A' })
    const describedBy = input.getAttribute('aria-describedby')

    expect(describedBy).toBeTruthy()
    const [hintId] = (describedBy ?? '').split(/\s+/)
    expect(hintId).toBeTruthy()
    expect(document.getElementById(hintId)).toHaveTextContent('가이드 A')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('에러가 있으면 입력은 힌트와 에러를 모두 aria-describedby로 참조한다', () => {
    render(
      <KeywordDetailPanel
        {...createPanelProps({
          label: '키워드 입력 B',
          guideText: '가이드 B',
          errorMessage: '에러 B',
        })}
      />,
    )

    const input = screen.getByRole('textbox', { name: '키워드 입력 B' })
    const describedBy = input.getAttribute('aria-describedby')

    expect(describedBy).toBeTruthy()
    const [hintId, errorId] = (describedBy ?? '').split(/\s+/)
    expect(hintId).toBeTruthy()
    expect(errorId).toBeTruthy()
    expect(document.getElementById(hintId)).toHaveTextContent('가이드 B')
    expect(document.getElementById(errorId)).toHaveTextContent('에러 B')
    expect(document.getElementById(errorId)).toHaveAttribute('role', 'alert')
  })

  it('동일 페이지에 두 패널이 있어도 id가 충돌하지 않고 각 입력이 자신의 힌트/에러에 연결된다', () => {
    const { container } = render(
      <>
        <KeywordDetailPanel
          {...createPanelProps({
            label: '키워드 입력 패널 A',
            guideText: '가이드 A',
            errorMessage: '에러 A',
          })}
        />
        <KeywordDetailPanel
          {...createPanelProps({
            label: '키워드 입력 패널 B',
            guideText: '가이드 B',
            errorMessage: '에러 B',
          })}
        />
      </>,
    )

    const inputA = screen.getByRole('textbox', { name: '키워드 입력 패널 A' })
    const inputB = screen.getByRole('textbox', { name: '키워드 입력 패널 B' })
    const idsA = (inputA.getAttribute('aria-describedby') ?? '').split(/\s+/)
    const idsB = (inputB.getAttribute('aria-describedby') ?? '').split(/\s+/)

    expect(idsA).toHaveLength(2)
    expect(idsB).toHaveLength(2)
    expect(document.getElementById(idsA[0])).toHaveTextContent('가이드 A')
    expect(document.getElementById(idsA[1])).toHaveTextContent('에러 A')
    expect(document.getElementById(idsB[0])).toHaveTextContent('가이드 B')
    expect(document.getElementById(idsB[1])).toHaveTextContent('에러 B')
    expect(inputA).not.toHaveAttribute('id', inputB.getAttribute('id') ?? '')

    const allIds = Array.from(container.querySelectorAll('[id]')).map(
      (element) => element.id,
    )

    expect(new Set(allIds).size).toBe(allIds.length)
  })
})
