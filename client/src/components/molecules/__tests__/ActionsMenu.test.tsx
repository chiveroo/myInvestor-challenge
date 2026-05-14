import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ActionsMenu } from '../ActionsMenu'
import { renderWithProviders } from '@/test/renderWithProviders'

describe('ActionsMenu', () => {
  it('renders a trigger button with a descriptive accessible label', () => {
    renderWithProviders(<ActionsMenu fundId="1" fundName="Global Equity Fund" />)
    const trigger = screen.getByRole('button', { name: /acciones para global equity fund/i })
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the menu when the trigger is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ActionsMenu fundId="1" fundName="Tech Fund" />)

    await user.click(screen.getByRole('button', { name: /acciones para tech fund/i }))

    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /comprar/i })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /ver detalle/i })).not.toBeInTheDocument()
  })

  it('sets aria-expanded="true" while the menu is open', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ActionsMenu fundId="1" fundName="Tech Fund" />)

    const trigger = screen.getByRole('button', { name: /acciones para tech fund/i })
    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes the menu when Escape is pressed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ActionsMenu fundId="1" fundName="Tech Fund" />)

    await user.click(screen.getByRole('button', { name: /acciones para tech fund/i }))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('calls onBuy with the fund id when Comprar is clicked', async () => {
    const onBuy = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<ActionsMenu fundId="fund-42" fundName="Test Fund" onBuy={onBuy} />)

    await user.click(screen.getByRole('button', { name: /acciones para test fund/i }))
    await user.click(screen.getByRole('menuitem', { name: /comprar/i }))

    expect(onBuy).toHaveBeenCalledOnce()
    expect(onBuy).toHaveBeenCalledWith('fund-42')
  })

  it('closes the menu after clicking a menu item', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ActionsMenu fundId="1" fundName="Test Fund" onBuy={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /acciones para test fund/i }))
    await user.click(screen.getByRole('menuitem', { name: /comprar/i }))

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
