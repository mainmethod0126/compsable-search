import '@testing-library/jest-dom/vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { SelectionItem, SelectorPlugin } from '@compsable-search/core'
import {
  ComposableSearch,
  type ComposableSearchProps,
  type ReactHostSelectorDefinition,
  type SelectorPanelProps,
} from '../src/index'

interface DemoSelectionItem extends SelectionItem {
  payload: {
    selectorType: string
  }
}

interface DemoSelectorProps {
  addButtonLabel: string
  displayName: string
  panelTitle: string
  triggerLabel: string
}

function DemoPanel({
  closePanel,
  props,
  selectedItems,
  selectorId,
  selectorType,
  setSelectedItems,
}: SelectorPanelProps<DemoSelectorProps, DemoSelectionItem>) {
  return (
    <div>
      <p>{props.panelTitle}</p>
      <p data-testid={`${selectorId}-selected-count`}>{selectedItems.length}</p>
      <button
        type="button"
        onClick={() =>
          setSelectedItems([
            {
              id: `${selectorId}:item`,
              displayName: props.displayName,
              selectorId,
              payload: {
                selectorType,
              },
            },
          ])
        }
      >
        {props.addButtonLabel}
      </button>
      <button type="button" onClick={closePanel}>
        패널 닫기
      </button>
    </div>
  )
}

function createTestSelector(
  id: string,
  type: string,
  triggerLabel: string,
): ReactHostSelectorDefinition<DemoSelectorProps, string, DemoSelectionItem> {
  return {
    id,
    type,
    props: {
      addButtonLabel: `${triggerLabel} 추가`,
      displayName: `${triggerLabel} 항목`,
      panelTitle: `${triggerLabel} 패널`,
      triggerLabel,
    },
    driver: {
      type,
      getTriggerLabel: (props) => props.triggerLabel,
      renderPanel: (panelProps) => <DemoPanel {...panelProps} />,
    },
  }
}

function renderComposableSearch(
  props: Partial<ComposableSearchProps<DemoSelectionItem>> = {},
) {
  const selectors = [
    createTestSelector('region-main', 'region', '지역 선택'),
    createTestSelector('keyword-main', 'keyword', '키워드 선택'),
  ] satisfies ComposableSearchProps<DemoSelectionItem>['selectors']

  return render(<ComposableSearch selectors={selectors} {...props} />)
}

describe('ComposableSearch generic host', () => {
  it('panel switching을 generic trigger/panel shell에서 처리한다', async () => {
    const user = userEvent.setup()

    renderComposableSearch()

    const regionTrigger = screen.getByRole('tab', { name: /지역 선택/ })
    const keywordTrigger = screen.getByRole('tab', { name: /키워드 선택/ })

    await user.click(regionTrigger)

    expect(regionTrigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('지역 선택 패널')).toBeInTheDocument()

    await user.click(keywordTrigger)

    expect(regionTrigger).toHaveAttribute('aria-expanded', 'false')
    expect(keywordTrigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.queryByText('지역 선택 패널')).not.toBeInTheDocument()
    expect(screen.getByText('키워드 선택 패널')).toBeInTheDocument()
  })

  it('selection sync와 clear-all을 selected basket에서 유지한다', async () => {
    const user = userEvent.setup()

    renderComposableSearch()

    await user.click(screen.getByRole('tab', { name: /지역 선택/ }))
    await user.click(screen.getByRole('button', { name: '지역 선택 추가' }))
    await user.click(screen.getByRole('tab', { name: /키워드 선택/ }))
    await user.click(screen.getByRole('button', { name: '키워드 선택 추가' }))

    const basket = screen.getByText('선택된 항목').closest('section')
    if (!basket) {
      throw new Error('selected basket section not found')
    }

    expect(within(basket).getByText('지역 선택 항목')).toBeInTheDocument()
    expect(within(basket).getByText('키워드 선택 항목')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '전체 삭제' }))

    expect(
      within(basket).getByText('선택된 항목이 없습니다.'),
    ).toBeInTheDocument()
  })

  it('onValueChange meta에 selectorType을 연결한다', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    renderComposableSearch({ onValueChange })

    await user.click(screen.getByRole('tab', { name: /지역 선택/ }))
    await user.click(screen.getByRole('button', { name: '지역 선택 추가' }))

    expect(onValueChange).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          id: 'region-main:item',
          selectorId: 'region-main',
        }),
      ],
      expect.objectContaining({
        reason: 'add',
        source: 'selector',
        selectorId: 'region-main',
        selectorType: 'region',
      }),
    )
  })

  it('plugin event dispatch를 core controller 경유로 유지한다', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    const onPanelOpenChange = vi.fn()
    const plugins: readonly SelectorPlugin[] = [
      {
        id: 'telemetry',
        target: { kind: 'all' },
        onSelectionChange,
        onPanelOpenChange,
      },
    ]

    renderComposableSearch({ plugins })

    await user.click(screen.getByRole('tab', { name: /지역 선택/ }))
    await user.click(screen.getByRole('button', { name: '지역 선택 추가' }))

    expect(onPanelOpenChange).toHaveBeenCalledWith(
      expect.objectContaining({
        currentSelectorId: 'region-main',
        isOpen: true,
        reason: 'open',
      }),
    )
    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          selectorId: 'region-main',
          reason: 'add',
        }),
      }),
    )
  })
})
