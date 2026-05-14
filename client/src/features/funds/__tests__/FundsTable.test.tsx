import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/renderWithProviders'
import { FundsTable } from '../components/FundsTable'

describe('FundsTable', () => {
  it('shows skeleton rows while loading', () => {
    renderWithProviders(<FundsTable />)
    // Fund names not visible during loading
    expect(screen.queryByText('Global Equity Fund')).not.toBeInTheDocument()
    // Table is present and marked busy
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true')
  })

  it('renders fund rows after data loads', async () => {
    renderWithProviders(<FundsTable />)
    expect(await screen.findByText('Global Equity Fund')).toBeInTheDocument()
    expect(screen.getByText('GEF')).toBeInTheDocument()
    expect(screen.getByText('Tech Growth Fund')).toBeInTheDocument()
  })

  it('renders category badges', async () => {
    renderWithProviders(<FundsTable />)
    await screen.findByText('Global Equity Fund')
    expect(screen.getAllByText('Global').length).toBeGreaterThan(0)
    expect(screen.getByText('Tecnología')).toBeInTheDocument()
  })

  it('cycles sort: none → asc → desc → none when clicking the Nombre header', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FundsTable />)
    await screen.findByText('Global Equity Fund')

    const th = screen.getByRole('columnheader', { name: /nombre/i })
    const btn = within(th).getByRole('button')

    expect(th).toHaveAttribute('aria-sort', 'none')

    await user.click(btn)
    expect(th).toHaveAttribute('aria-sort', 'ascending')

    await user.click(btn)
    expect(th).toHaveAttribute('aria-sort', 'descending')

    await user.click(btn)
    expect(th).toHaveAttribute('aria-sort', 'none')
  })

  it('shows error card with retry button when the API fails', async () => {
    server.use(
      http.get('http://localhost/api/funds', () => HttpResponse.error())
    )
    renderWithProviders(<FundsTable />)
    const alert = await screen.findByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(screen.getByText(/no se pudo cargar/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
  })

  it('shows pagination when there are multiple pages', async () => {
    server.use(
      http.get('http://localhost/api/funds', () =>
        HttpResponse.json({
          pagination: { page: 1, limit: 10, totalFunds: 20, totalPages: 2 },
          data: [
            {
              id: '1', name: 'Global Equity Fund', symbol: 'GEF',
              value: { amount: 120.45, currency: 'EUR' }, category: 'GLOBAL',
              profitability: { YTD: 0.05, oneYear: 0.12, threeYears: 0.35, fiveYears: 0.5 },
            },
          ],
        })
      )
    )
    renderWithProviders(<FundsTable />)
    await screen.findByText('Global Equity Fund')
    expect(screen.getByText(/página 1 de 2/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /página siguiente/i })).toBeInTheDocument()
  })
})
