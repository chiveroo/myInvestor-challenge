import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ActionsMenu } from '../ActionsMenu'
import { renderWithProviders } from '@/test/renderWithProviders'

describe('ActionsMenu', () => {
  const menuItems = [
    {
      key: 'buy',
      label: 'Comprar',
      onSelect: vi.fn(),
    },
    {
      key: 'sell',
      label: 'Vender',
      disabled: true,
    },
  ]

  it('renders a trigger button with a descriptive accessible label', () => {
    renderWithProviders(
      <ActionsMenu
        triggerLabel="Acciones para Global Equity Fund"
        menuLabel="Menú de acciones para Global Equity Fund"
        items={menuItems}
      />
    )

    const trigger = screen.getByRole('button', { name: /acciones para global equity fund/i })

    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the menu with every configured action when the trigger is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ActionsMenu
        triggerLabel="Acciones para Tech Fund"
        menuLabel="Menú de acciones para Tech Fund"
        items={menuItems}
      />
    )

    await user.click(screen.getByRole('button', { name: /acciones para tech fund/i }))

    expect(screen.getByRole('menu', { name: /menú de acciones para tech fund/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /comprar/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /vender/i })).toBeDisabled()
  })

  it('sets aria-expanded="true" while the menu is open', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ActionsMenu
        triggerLabel="Acciones para Tech Fund"
        menuLabel="Menú de acciones para Tech Fund"
        items={menuItems}
      />
    )

    const trigger = screen.getByRole('button', { name: /acciones para tech fund/i })
    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes the menu when Escape is pressed', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ActionsMenu
        triggerLabel="Acciones para Tech Fund"
        menuLabel="Menú de acciones para Tech Fund"
        items={menuItems}
      />
    )

    await user.click(screen.getByRole('button', { name: /acciones para tech fund/i }))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('calls onSelect for enabled items when a menu option is clicked', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <ActionsMenu
        triggerLabel="Acciones para Test Fund"
        menuLabel="Menú de acciones para Test Fund"
        items={[
          {
            key: 'buy',
            label: 'Comprar',
            onSelect,
          },
        ]}
      />
    )

    await user.click(screen.getByRole('button', { name: /acciones para test fund/i }))
    await user.click(screen.getByRole('menuitem', { name: /comprar/i }))

    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('closes the menu after clicking a menu item', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ActionsMenu
        triggerLabel="Acciones para Test Fund"
        menuLabel="Menú de acciones para Test Fund"
        items={[
          {
            key: 'buy',
            label: 'Comprar',
            onSelect: vi.fn(),
          },
        ]}
      />
    )

    await user.click(screen.getByRole('button', { name: /acciones para test fund/i }))
    await user.click(screen.getByRole('menuitem', { name: /comprar/i }))

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('renders helper text inside the menu when provided', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <ActionsMenu
        triggerLabel="Acciones para Test Fund"
        menuLabel="Menú de acciones para Test Fund"
        helperText="Disponible próximamente. Estas acciones aún no están operativas."
        items={menuItems}
      />
    )

    await user.click(screen.getByRole('button', { name: /acciones para test fund/i }))

    expect(screen.getByText(/disponible próximamente/i)).toBeInTheDocument()
  })

  it('closes the menu when the page scrolls', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <ActionsMenu
        triggerLabel="Acciones para Scroll Fund"
        menuLabel="Menú de acciones para Scroll Fund"
        items={menuItems}
      />
    )

    await user.click(screen.getByRole('button', { name: /acciones para scroll fund/i }))
    expect(screen.getByRole('menu', { name: /menú de acciones para scroll fund/i })).toBeInTheDocument()

    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })

    await waitFor(() => {
      expect(screen.queryByRole('menu', { name: /menú de acciones para scroll fund/i })).not.toBeInTheDocument()
    })
  })
})
