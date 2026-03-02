import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

async function selectFirstRegionPath(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /지역 선택/ }))

  const sidoColumn = screen.getByTestId('cs-region-column-sido')
  await user.click(within(sidoColumn).getAllByRole('button')[0])

  const sigunguColumn = screen.getByTestId('cs-region-column-sigungu')
  await user.click(within(sigunguColumn).getAllByRole('button')[0])

  const eupmyeondongColumn = screen.getByTestId('cs-region-column-eupmyeondong')
  await user.click(within(eupmyeondongColumn).getAllByRole('checkbox')[0])
}

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

    await selectFirstRegionPath(user)
    await user.click(screen.getByRole('button', { name: '키워드 선택' }))

    expect(within(eventLog).getByText('region.onClick')).toBeInTheDocument()
    expect(
      within(eventLog).getByText(/region\.onSelectedEupmyeondong\(/),
    ).toBeInTheDocument()
    expect(
      within(eventLog).getByText(/onValueChange\(.*selectorType=region.*count=1\)/),
    ).toBeInTheDocument()
    expect(within(eventLog).getByText('keyword.onClick')).toBeInTheDocument()
    expect(clearLogButton).toBeEnabled()

    await user.click(clearLogButton)
    expect(
      within(eventLog).getByText('아직 이벤트가 없습니다.'),
    ).toBeInTheDocument()
    expect(clearLogButton).toBeDisabled()
  })

  it('프로파일 전환 시 데모 상태를 초기화하고 선택 조건을 초기 상태로 되돌린다', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectFirstRegionPath(user)

    const clearAllButton = screen.getByRole('button', { name: '전체 삭제' })
    expect(clearAllButton).toBeEnabled()

    const profileSelect = screen.getByLabelText('샘플 프로파일')
    await user.selectOptions(profileSelect, 'medium')

    expect(profileSelect).toHaveValue('medium')
    expect(screen.getByRole('button', { name: '전체 삭제' })).toBeDisabled()
    expect(screen.getByText('현재 프로파일: medium')).toBeInTheDocument()
    expect(screen.getByText('아직 이벤트가 없습니다.')).toBeInTheDocument()
  })

  it('패널 오픈/첫 선택 성능 기준선과 콜백 횟수를 프로파일 단위로 기록한다', async () => {
    const user = userEvent.setup()
    render(<App />)

    const metricPanel = screen.getByTestId('demo-performance-metrics')
    expect(within(metricPanel).getByText('패널 오픈: 미측정')).toBeInTheDocument()
    expect(
      within(metricPanel).getByText('첫 선택 반영: 미측정'),
    ).toBeInTheDocument()

    await selectFirstRegionPath(user)

    await waitFor(() => {
      expect(
        within(metricPanel).queryByText('패널 오픈: 미측정'),
      ).not.toBeInTheDocument()
      expect(
        within(metricPanel).queryByText('첫 선택 반영: 미측정'),
      ).not.toBeInTheDocument()
    })

    expect(
      within(metricPanel).getByText(/region\.onClick 호출: 1회/),
    ).toBeInTheDocument()
    expect(
      within(metricPanel).getByText(/onValueChange\(region\) 호출: 1회/),
    ).toBeInTheDocument()
    expect(
      within(metricPanel).getByText(/region\.onSelectedEupmyeondong 호출: 1회/),
    ).toBeInTheDocument()
  })
})
