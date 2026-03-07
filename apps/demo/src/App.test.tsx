import { render, screen } from '@testing-library/react'
import App from './App'

describe('demo App', () => {
  it('renders the workspace demo title', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'Composable Search Demo' }),
    ).toBeInTheDocument()
  })
})
