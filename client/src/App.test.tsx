import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App navigation', () => {
  it('switches between Fondos and Cartera views', async () => {
    const user = userEvent.setup()

    render(<App />)

    expect(screen.getByRole('heading', { name: /fondos de inversión/i })).toBeInTheDocument()

    const navigation = screen.getAllByRole('navigation', { name: /navegación principal/i })[0]
    await user.click(within(navigation).getByRole('button', { name: 'Cartera' }))

    const portfolioTitle = await screen.findByRole('heading', { name: 'Cartera' })
    const fundsTab = screen.getByRole('tab', { name: 'Fondos' })

    expect(screen.queryByRole('heading', { name: /detalle de la cartera/i })).not.toBeInTheDocument()
    expect(portfolioTitle.compareDocumentPosition(fundsTab) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(within(navigation).getByRole('button', { name: 'Cartera' })).toHaveAttribute('aria-current', 'page')

    await user.click(within(navigation).getByRole('button', { name: 'Fondos' }))

    expect(await screen.findByRole('heading', { name: /fondos de inversión/i })).toBeInTheDocument()
  })
})
