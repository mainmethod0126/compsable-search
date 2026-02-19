import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App consumer integration sample', () => {
  it('region/keyword 콜백 이벤트를 로그로 누적하고 초기화할 수 있다', async () => {
    const user = userEvent.setup()
    render(<App />)

    const eventLog = screen.getByTestId('demo-event-log')
    const clearLogButton = within(eventLog).getByRole('button', {
      name: '로그 초기화',
    })
    expect(
      within(eventLog).getByText('아직 이벤트가 없습니다.'),
    ).toBeInTheDocument()
    expect(clearLogButton).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '지역 선택' }))
    await user.click(screen.getByRole('button', { name: '서울특별시' }))
    await user.click(screen.getByRole('button', { name: '강남구' }))
    await user.click(screen.getByRole('checkbox', { name: '역삼동' }))
    await user.click(screen.getByRole('button', { name: '키워드 선택' }))

    expect(within(eventLog).getByText('region.onClick')).toBeInTheDocument()
    expect(
      within(eventLog).getByText('region.onSelectedEupmyeondong(1168010100)'),
    ).toBeInTheDocument()
    expect(
      within(eventLog).getByText(
        'region.onChange(count=1) [1168010100]',
      ),
    ).toBeInTheDocument()
    expect(within(eventLog).getByText('keyword.onClick')).toBeInTheDocument()
    expect(clearLogButton).toBeEnabled()

    await user.click(clearLogButton)
    expect(
      within(eventLog).getByText('아직 이벤트가 없습니다.'),
    ).toBeInTheDocument()
    expect(clearLogButton).toBeDisabled()
  })
})
