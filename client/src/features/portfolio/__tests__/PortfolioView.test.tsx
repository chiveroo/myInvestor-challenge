import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import { PortfolioView } from '../components/PortfolioView'
import { renderWithProviders } from '@/test/renderWithProviders'
import { server } from '@/test/msw/server'
import { ORDERS_STORAGE_KEY } from '@/features/orders/keys'

describe('PortfolioView', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows persisted orders when opening órdenes tab', async () => {
    const user = userEvent.setup()

    window.localStorage.setItem(
      ORDERS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'order-1',
          createdAt: '2026-01-01T10:00:00.000Z',
          type: 'transfer',
          fundId: 'portfolio-1',
          fundName: 'Alpha Strategy Fund',
          quantity: 2.5,
          destinationFundId: 'portfolio-2',
          destinationFundName: 'Renta Variable Global',
        },
      ])
    )

    renderWithProviders(<PortfolioView />)

    await user.click(await screen.findByRole('tab', { name: 'Órdenes' }))

    expect(await screen.findByText(/2,50 participaciones a Renta Variable Global/i)).toBeInTheDocument()
  })

  it('shows skeleton state while loading', () => {
    renderWithProviders(<PortfolioView />)

    expect(screen.queryByRole('heading', { name: 'Cartera' })).not.toBeInTheDocument()
    expect(screen.getByRole('tablist', { name: /secciones de la cartera/i })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: /posición en alpha strategy fund/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /acciones para alpha strategy fund/i })).not.toBeInTheDocument()
  })

  it('renders tabs without the cartera title and keeps fondos active by default', async () => {
    renderWithProviders(<PortfolioView />)

    await screen.findByRole('tab', { name: 'Fondos' })

    expect(screen.queryByRole('heading', { name: 'Cartera' })).not.toBeInTheDocument()
    expect(screen.queryByText(/consulta tus posiciones actuales/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/cartera · fondos/i)).not.toBeInTheDocument()

    const tablist = screen.getByRole('tablist', { name: /secciones de la cartera/i })
    const fundsTab = within(tablist).getByRole('tab', { name: 'Fondos' })
    const ordersTab = within(tablist).getByRole('tab', { name: 'Órdenes' })
    const fundsTabStack = within(fundsTab).getByTestId('tab-label-stack')
    const ordersTabStack = within(ordersTab).getByTestId('tab-label-stack')
    const fundsIndicatorSlot = within(fundsTabStack).getByTestId('tab-indicator-slot')
    const ordersIndicatorSlot = within(ordersTabStack).getByTestId('tab-indicator-slot')

    expect(fundsTab).toHaveAttribute('aria-selected', 'true')
    expect(ordersTab).toBeEnabled()
    expect(within(fundsTabStack).getByText('Fondos')).toBeInTheDocument()
    expect(within(ordersTabStack).getByText('Órdenes')).toBeInTheDocument()
    expect(within(fundsIndicatorSlot).getByTestId('active-tab-indicator')).toBeInTheDocument()
    expect(within(fundsIndicatorSlot).getByTestId('active-tab-indicator')).toHaveAttribute('aria-hidden', 'true')
    expect(within(ordersIndicatorSlot).queryByTestId('active-tab-indicator')).not.toBeInTheDocument()
    expect(screen.getByRole('tabpanel', { name: 'Fondos' })).toBeInTheDocument()
  })

  it('switches to órdenes tab when selected', async () => {
    const user = userEvent.setup()

    renderWithProviders(<PortfolioView />)

    await screen.findByRole('tab', { name: 'Fondos' })
    const ordersTab = screen.getByRole('tab', { name: 'Órdenes' })

    await user.click(ordersTab)

    expect(ordersTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: 'Órdenes' })).toBeInTheDocument()
  })

  it('renders sorted positions from the portfolio', async () => {
    renderWithProviders(<PortfolioView />)

    const groups = await screen.findAllByRole('group')
    const names = groups.map((group) => group.getAttribute('aria-label')?.replace('Posición en ', ''))

    expect(names).toEqual([
      'Alpha Strategy Fund',
      'Renta Variable Global',
      'US Opportunities',
    ])
  })

  it('shows derived unit value for each portfolio position on mobile without the helper label', async () => {
    renderWithProviders(<PortfolioView />)

    const card = await screen.findByRole('group', { name: /posición en alpha strategy fund/i })

    expect(within(card).getByText(/247,06/u)).toBeInTheDocument()
    expect(within(card).queryByText(/valor por participación/i)).not.toBeInTheDocument()
  })

  it('hides derived unit value when quantity does not allow safe division', async () => {
    server.use(
      http.get(
        'http://localhost/api/portfolio',
        () => HttpResponse.json({ data: [{ id: 'portfolio-4', name: 'Cash Reserve', quantity: 0, totalValue: { amount: 0, currency: 'EUR' } }] })
      )
    )

    renderWithProviders(<PortfolioView />)

    const card = await screen.findByRole('group', { name: /posición en cash reserve/i })

    expect(within(card).queryByText(/valor por participación/i)).not.toBeInTheDocument()
  })

  it('shows sell and transfer enabled with icons inside the contextual menu when there is a valid destination', async () => {
    const user = userEvent.setup()

    renderWithProviders(<PortfolioView />)

    const firstCard = await screen.findByRole('group', { name: /posición en alpha strategy fund/i })
    await user.click(within(firstCard).getByRole('button', { name: /acciones para alpha strategy fund/i }))

    const menu = await screen.findByRole('menu', { name: /menú de acciones para alpha strategy fund/i })
    const sellItem = within(menu).getByRole('menuitem', { name: 'Vender' })
    const transferItem = within(menu).getByRole('menuitem', { name: 'Traspasar' })

    expect(sellItem).toBeEnabled()
    expect(transferItem).toBeEnabled()
    expect(sellItem.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument()
    expect(transferItem.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument()
    expect(within(menu).queryByText(/traspasar estará disponible próximamente/i)).not.toBeInTheDocument()
  })

  it('shows error state with retry action when the request fails', async () => {
    server.use(http.get('http://localhost/api/portfolio', () => HttpResponse.error()))

    renderWithProviders(<PortfolioView />)

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
  })

  it('shows empty state when there are no positions', async () => {
    server.use(http.get('http://localhost/api/portfolio', () => HttpResponse.json({ data: [] })))

    renderWithProviders(<PortfolioView />)

    expect(await screen.findByText(/aún no tienes posiciones en fondos/i)).toBeInTheDocument()
  })

  it('opens the sell dialog from the mobile card contextual menu', async () => {
    const user = userEvent.setup()

    renderWithProviders(<PortfolioView />)

    const card = await screen.findByRole('group', { name: /posición en alpha strategy fund/i })
    const trigger = within(card).getByRole('button', { name: /acciones para alpha strategy fund/i })

    expect(screen.queryByRole('menu', { name: /menú de acciones para alpha strategy fund/i })).not.toBeInTheDocument()

    await user.click(trigger)

    const menu = await screen.findByRole('menu', { name: /menú de acciones para alpha strategy fund/i })

    expect(within(menu).getByRole('menuitem', { name: 'Vender' })).toBeEnabled()
    expect(within(menu).getByRole('menuitem', { name: 'Traspasar' })).toBeEnabled()

    await user.click(within(menu).getByRole('menuitem', { name: 'Vender' }))

    expect(await screen.findByRole('dialog', { name: /vender fondo/i })).toBeInTheDocument()
  })

  it('opens the transfer dialog from the portfolio contextual menu', async () => {
    const user = userEvent.setup()

    renderWithProviders(<PortfolioView />)

    const firstCard = await screen.findByRole('group', { name: /posición en alpha strategy fund/i })

    await user.click(within(firstCard).getByRole('button', { name: /acciones para alpha strategy fund/i }))

    const menu = await screen.findByRole('menu', { name: /menú de acciones para alpha strategy fund/i })

    await user.click(within(menu).getByRole('menuitem', { name: 'Traspasar' }))

    expect(await screen.findByRole('dialog', { name: /traspasar fondo/i })).toBeInTheDocument()
  })

  it('disables transfer and explains the reason when the user only owns one fund', async () => {
    const user = userEvent.setup()

    server.use(
      http.get(
        'http://localhost/api/portfolio',
        () =>
          HttpResponse.json({
            data: [{ id: 'portfolio-1', name: 'Alpha Strategy Fund', quantity: 8.5, totalValue: { amount: 2100, currency: 'EUR' } }],
          })
      )
    )

    renderWithProviders(<PortfolioView />)

    const onlyCard = await screen.findByRole('group', { name: /posición en alpha strategy fund/i })

    await user.click(within(onlyCard).getByRole('button', { name: /acciones para alpha strategy fund/i }))

    const menu = await screen.findByRole('menu', { name: /menú de acciones para alpha strategy fund/i })

    expect(within(menu).getByRole('menuitem', { name: 'Vender' })).toBeEnabled()
    expect(within(menu).getByRole('menuitem', { name: 'Traspasar' })).toBeDisabled()
    expect(within(menu).getByText(/necesitas al menos dos fondos comprados para traspasar/i)).toBeInTheDocument()
  })

  it('renders each mobile position with left name, right value block, and far-right menu', async () => {
    renderWithProviders(<PortfolioView />)

    const card = await screen.findByRole('group', { name: /posición en alpha strategy fund/i })
    const summary = within(card).getByLabelText(/resumen de alpha strategy fund/i)

    expect(within(card).queryByText('Participaciones')).not.toBeInTheDocument()
    expect(within(card).queryByText('Valor total')).not.toBeInTheDocument()
    expect(within(card).getByText('Alpha Strategy Fund')).toBeInTheDocument()
    expect(within(summary).getByText(/2100,00/u)).toBeInTheDocument()
    expect(within(summary).getByText('8,50 participaciones')).toBeInTheDocument()
    expect(within(card).getByRole('button', { name: /acciones para alpha strategy fund/i })).toBeInTheDocument()
  })

  it('does not show obsolete swipe guidance copy in mobile cards', async () => {
    renderWithProviders(<PortfolioView />)

    await screen.findByRole('group', { name: /posición en alpha strategy fund/i })

    expect(screen.queryByText(/desliza para ver acciones/i)).not.toBeInTheDocument()
  })
})
