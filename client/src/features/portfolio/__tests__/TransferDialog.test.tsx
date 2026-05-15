import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from 'styled-components'
import { ToastProvider } from '@/components/organisms/ToastProvider'
import { theme } from '@/styles/theme'
import { server } from '@/test/msw/server'
import { mockPortfolio } from '@/test/msw/fixtures'
import { portfolioKeys } from '../keys'
import { fundKeys } from '@/features/funds/keys'
import { TransferDialog } from '../components/TransferDialog'

const sourcePosition = mockPortfolio[1]!

function renderTransferDialogWithClient(queryClient: QueryClient, onClose = vi.fn()) {
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <ToastProvider>
          <TransferDialog positions={mockPortfolio} position={sourcePosition} isOpen onClose={onClose} />
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('TransferDialog', () => {
  it('renders dialog with destination options excluding the current fund', () => {
    renderTransferDialogWithClient(new QueryClient())

    expect(screen.getByRole('dialog', { name: /traspasar fondo/i })).toBeInTheDocument()
    expect(screen.getByText(/alpha strategy fund/i)).toBeInTheDocument()
    expect(screen.getByText(/participaciones disponibles/i).nextElementSibling).toHaveTextContent(/8,50 participaciones/i)
    expect(screen.getByText(/valor actual de la posición/i).nextElementSibling).toHaveTextContent(/2100,00[\s\u00a0]?€/i)
    expect(screen.getByText(/la misma cantidad de participaciones al fondo origen y al destino/i)).toBeInTheDocument()

    const destinationSelect = screen.getByRole('combobox', { name: /fondo de destino/i })
    const destinationOptions = within(destinationSelect).getAllByRole('option')

    expect(destinationOptions.map(option => option.textContent)).toEqual([
      'Renta Variable Global',
      'US Opportunities',
    ])
  })

  it('clamps the entered quantity to the maximum available before submitting the transfer request', async () => {
    const user = userEvent.setup()
    let requestedBody: { fromFundId: string; toFundId: string; quantity: number } | null = null

    server.use(
      http.post('http://localhost/api/funds/transfer', async ({ request }) => {
        requestedBody = (await request.json()) as { fromFundId: string; toFundId: string; quantity: number }
        return HttpResponse.json({ message: 'Traspaso realizado con éxito' })
      })
    )

    renderTransferDialogWithClient(new QueryClient())

    const quantityInput = screen.getByLabelText(/participaciones a traspasar/i)

    await user.clear(quantityInput)
    await user.type(quantityInput, '5000')

    await waitFor(() => expect(quantityInput).toHaveValue(8.5))

    await user.click(screen.getByRole('button', { name: /traspasar ahora/i }))

    await waitFor(() =>
      expect(requestedBody).toEqual({
        fromFundId: sourcePosition.id,
        toFundId: mockPortfolio[0]!.id,
        quantity: 8.5,
      })
    )
  })

  it('normalizes negative amounts so they cannot be submitted', async () => {
    const user = userEvent.setup()

    renderTransferDialogWithClient(new QueryClient())

    const quantityInput = screen.getByLabelText(/participaciones a traspasar/i)

    await user.clear(quantityInput)
    await user.type(quantityInput, '-50')

    await waitFor(() => expect(quantityInput).toHaveValue(0))
    expect(screen.getByRole('button', { name: /traspasar ahora/i })).toBeDisabled()
    expect(await screen.findByRole('alert')).toHaveTextContent('La cantidad debe ser mayor que 0 participaciones.')
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

    renderTransferDialogWithClient(queryClient, onClose)

    await user.selectOptions(screen.getByRole('combobox', { name: /fondo de destino/i }), mockPortfolio[2]!.id)
    await user.clear(screen.getByLabelText(/participaciones a traspasar/i))
    await user.type(screen.getByLabelText(/participaciones a traspasar/i), '3.25')
    await user.click(screen.getByRole('button', { name: /traspasar ahora/i }))

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce())
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Orden de traspaso enviada de 3,25 participaciones de Alpha Strategy Fund a US Opportunities.'
    )
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: portfolioKeys.list() })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: fundKeys.lists() })
  })

  it('calls onSuccess payload after successful transfer', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ThemeProvider theme={theme}>
          <ToastProvider>
            <TransferDialog positions={mockPortfolio} position={sourcePosition} isOpen onClose={vi.fn()} onSuccess={onSuccess} />
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    )

    await user.selectOptions(screen.getByRole('combobox', { name: /fondo de destino/i }), mockPortfolio[2]!.id)
    await user.clear(screen.getByLabelText(/participaciones a traspasar/i))
    await user.type(screen.getByLabelText(/participaciones a traspasar/i), '3.25')
    await user.click(screen.getByRole('button', { name: /traspasar ahora/i }))

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith({
        quantity: 3.25,
        destinationFundId: mockPortfolio[2]!.id,
        destinationFundName: mockPortfolio[2]!.name,
      })
    )
  })
})
