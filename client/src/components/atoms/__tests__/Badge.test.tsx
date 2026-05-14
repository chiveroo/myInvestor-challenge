import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from '../Badge'
import { renderWithProviders } from '@/test/renderWithProviders'

describe('Badge', () => {
  it('translates known categories to Spanish', () => {
    const cases = [
      { label: 'GLOBAL',       expected: 'Global' },
      { label: 'TECH',         expected: 'Tecnología' },
      { label: 'HEALTH',       expected: 'Salud' },
      { label: 'MONEY_MARKET', expected: 'Monetarios' },
    ] as const

    for (const { label, expected } of cases) {
      const { unmount } = renderWithProviders(<Badge label={label} variant={label} />)
      expect(screen.getByText(expected)).toBeInTheDocument()
      unmount()
    }
  })

  it('falls back to the raw label when no translation exists', () => {
    // @ts-expect-error — intentional unknown category for resilience test
    renderWithProviders(<Badge label="UNKNOWN_CATEGORY" variant="default" />)
    expect(screen.getByText('UNKNOWN_CATEGORY')).toBeInTheDocument()
  })

  it('renders as inline text visible to assistive technologies', () => {
    renderWithProviders(<Badge label="GLOBAL" variant="GLOBAL" />)
    const badge = screen.getByText('Global')
    // Not hidden from screen readers — badge carries semantic category info
    expect(badge).toBeVisible()
    expect(badge).not.toHaveAttribute('aria-hidden', 'true')
  })
})
