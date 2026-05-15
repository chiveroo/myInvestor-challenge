import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from 'styled-components'
import { ToastProvider } from '@/components/organisms/ToastProvider'
import { theme } from '@/styles/theme'
import { server } from '@/test/msw/server'
import { mockPortfolio } from '@/test/msw/fixtures'
import { portfolioKeys } from '../keys'
import { SellDialog } from '../components/SellDialog'
import { fundKeys } from '@/features/funds/keys'

const position = mockPortfolio[1]!

function renderSellDialogWithClient(queryClient: QueryClient, onClose = vi.fn()) {
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <ToastProvider>
          <SellDialog position={position} isOpen onClose={onClose} />
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('SellDialog', () => {
  it('renders dialog with position name and available amount', () => {
    renderSellDialogWithClient(new QueryClient())

    expect(screen.getByRole('dialog', { name: /vender fondo/i })).toBeInTheDocument()
    expect(screen.getByText(/alpha strategy fund/i)).toBeInTheDocument()
    expect(screen.getByText(/importe disponible/i).nextElementSibling).toHaveTextContent(/2100,00[\s\u00a0]?€/i)
  })

  it('clamps the entered amount to the maximum available before submitting', async () => {
    const user = userEvent.setup()
    let requestedQuantity: number | null = null

    server.use(
      http.post('http://localhost/api/funds/:id/sell', async ({ request }) => {
        const body = (await request.json()) as { quantity: number }
        requestedQuantity = body.quantity
        return HttpResponse.json({ message: 'Venta realizada con éxito' })
      })
    )

    renderSellDialogWithClient(new QueryClient())

    const amountInput = screen.getByLabelText(/importe/i)

    await user.type(amountInput, '5000')
    await user.tab()

    expect(amountInput).toHaveValue('2.100,00 €')

    await user.click(screen.getByRole('button', { name: /vender ahora/i }))

    await waitFor(() => expect(requestedQuantity).toBe(8.5))
  })

  it('normalizes negative amounts so they cannot be submitted', async () => {
    const user = userEvent.setup()

    renderSellDialogWithClient(new QueryClient())

    const amountInput = screen.getByLabelText(/importe/i)

    await user.type(amountInput, '-50')
    await user.tab()

    expect(amountInput).toHaveValue('0,00 €')
    expect(screen.getByRole('button', { name: /vender ahora/i })).toBeDisabled()
    expect(await screen.findByRole('alert')).toHaveTextContent('El importe debe ser mayor que 0 €.')
  })

  it('submits successfully, invalidates portfolio and funds, and closes the dialog', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    })
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

    renderSellDialogWithClient(queryClient, onClose)

    await user.type(screen.getByLabelText(/importe/i), '1050')
    await user.click(screen.getByRole('button', { name: /vender ahora/i }))

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce())
    expect(await screen.findByRole('status')).toHaveTextContent('Orden de venta enviada para Alpha Strategy Fund.')

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: portfolioKeys.list() })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: fundKeys.lists() })
  })

  it('calls onSuccess payload after successful sell', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ThemeProvider theme={theme}>
          <ToastProvider>
            <SellDialog position={position} isOpen onClose={vi.fn()} onSuccess={onSuccess} />
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    )

    await user.type(screen.getByLabelText(/importe/i), '1050')
    await user.click(screen.getByRole('button', { name: /vender ahora/i }))

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith({ amount: 1050, quantity: 1050 / (position.totalValue.amount / position.quantity) })
    )
  })
})
