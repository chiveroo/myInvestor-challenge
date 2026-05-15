import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { OrdersTab } from '../components/OrdersTab'

describe('OrdersTab', () => {
  it('shows empty state', () => {
    renderWithProviders(<OrdersTab orders={[]} />)
    expect(screen.getByText(/aún no hay órdenes registradas/i)).toBeInTheDocument()
  })

  it('renders orders with transfer destination', () => {
    renderWithProviders(
      <OrdersTab
        orders={[
          {
            id: '1',
            createdAt: '2026-01-01T10:00:00.000Z',
            type: 'transfer',
            fundId: 'f1',
            fundName: 'Alpha Strategy Fund',
            quantity: 2.5,
            destinationFundId: 'f2',
            destinationFundName: 'US Opportunities',
          },
        ]}
      />
    )

    expect(screen.getByText('Alpha Strategy Fund')).toBeInTheDocument()
    expect(screen.getByText('Traspaso')).toBeInTheDocument()
    expect(screen.getByText(/2,50 participaciones a US Opportunities/i)).toBeInTheDocument()
  })

  it('does not expose destructive history actions', () => {
    renderWithProviders(
      <OrdersTab
        orders={[
          {
            id: '1',
            createdAt: '2026-01-01T10:00:00.000Z',
            type: 'buy',
            fundId: 'f1',
            fundName: 'Global Equity Fund',
            amount: 200,
            currency: 'EUR',
          },
        ]}
      />
    )

    expect(screen.queryByRole('button', { name: /limpiar historial/i })).not.toBeInTheDocument()
    expect(screen.getByText('Compra')).toBeInTheDocument()
  })
})
