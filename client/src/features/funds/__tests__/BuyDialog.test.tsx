import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/renderWithProviders'
import { BuyDialog } from '../components/BuyDialog'
import { mockFunds } from '@/test/msw/fixtures'

const fund = mockFunds[0]!

describe('BuyDialog', () => {
  it('renders dialog with fund name in title', () => {
    renderWithProviders(<BuyDialog fund={fund} isOpen onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: /comprar fondo/i })).toBeInTheDocument()
    expect(screen.getByText(/Global Equity Fund/i)).toBeInTheDocument()
  })

  it('submit button is disabled when amount is empty', () => {
    renderWithProviders(<BuyDialog fund={fund} isOpen onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /comprar ahora/i })).toBeDisabled()
  })

  it('shows validation error when amount exceeds 10.000 €', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BuyDialog fund={fund} isOpen onClose={vi.fn()} />)
    await user.type(screen.getByLabelText(/importe/i), '15000')
    await user.click(screen.getByRole('button', { name: /comprar ahora/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No puedes invertir más de 10.000 € en una sola compra.'
    )
  })

  it('shows validation error for negative values', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BuyDialog fund={fund} isOpen onClose={vi.fn()} />)
    await user.type(screen.getByLabelText(/importe/i), '-50')
    await user.click(screen.getByRole('button', { name: /comprar ahora/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('El importe debe ser mayor que 0 €.')
  })

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<BuyDialog fund={fund} isOpen onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('submits successfully and calls onClose', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<BuyDialog fund={fund} isOpen onClose={onClose} />)
    await user.type(screen.getByLabelText(/importe/i), '500')
    await user.click(screen.getByRole('button', { name: /comprar ahora/i }))
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce())
    expect(await screen.findByRole('status')).toHaveTextContent('Orden de compra enviada para Global Equity Fund.')
  })

  it('shows fund value liquidativo as reference', () => {
    renderWithProviders(<BuyDialog fund={fund} isOpen onClose={vi.fn()} />)
    expect(screen.getByText(/120,45/)).toBeInTheDocument()
  })

  it('clears the amount when cancelling and reopening the dialog', async () => {
    const user = userEvent.setup()

    const { rerender } = renderWithProviders(<BuyDialog fund={fund} isOpen onClose={vi.fn()} />)
    const input = screen.getByLabelText(/importe/i)

    await user.type(input, '750')
    expect(input).toHaveValue('750')

    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    rerender(<BuyDialog fund={fund} isOpen={false} onClose={vi.fn()} />)
    rerender(<BuyDialog fund={fund} isOpen onClose={vi.fn()} />)

    expect(screen.getByLabelText(/importe/i)).toHaveValue('')
  })

  it('clears the amount after a successful purchase when reopening the dialog', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    const { rerender } = renderWithProviders(<BuyDialog fund={fund} isOpen onClose={onClose} />)
    await user.type(screen.getByLabelText(/importe/i), '500')
    await user.click(screen.getByRole('button', { name: /comprar ahora/i }))

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce())

    rerender(<BuyDialog fund={fund} isOpen={false} onClose={onClose} />)
    rerender(<BuyDialog fund={fund} isOpen onClose={onClose} />)

    expect(screen.getByLabelText(/importe/i)).toHaveValue('')
  })

  it('shows generic error toast and keeps inline server error when the request fails', async () => {
    const user = userEvent.setup()

    server.use(
      http.post('http://localhost/api/funds/:id/buy', () =>
        HttpResponse.json({ message: 'No disponible' }, { status: 500, statusText: 'Server Error' })
      )
    )

    renderWithProviders(<BuyDialog fund={fund} isOpen onClose={vi.fn()} />)

    await user.type(screen.getByLabelText(/importe/i), '500')
    await user.click(screen.getByRole('button', { name: /comprar ahora/i }))

    expect(await screen.findByText('500: Server Error')).toBeInTheDocument()
    expect(await screen.findByText('No hemos podido procesar la compra. Inténtalo de nuevo.')).toBeInTheDocument()
  })

  it('close button is accessible via keyboard', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<BuyDialog fund={fund} isOpen onClose={onClose} />)
    const closeBtn = screen.getByRole('button', { name: /cerrar/i })
    closeBtn.focus()
    await user.keyboard('{Enter}')
    expect(onClose).toHaveBeenCalledOnce()
  })
})
