import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '@/App'
import { expectNoA11yViolations } from '@/test/a11y'

describe('App', () => {
  it('renders the project heading', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: /mathestudiatics/i })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<App />)

    await expectNoA11yViolations(container)
  })
})
