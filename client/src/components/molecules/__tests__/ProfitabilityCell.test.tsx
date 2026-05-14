import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfitabilityCell } from '../ProfitabilityCell'
import { renderWithProviders } from '@/test/renderWithProviders'

describe('ProfitabilityCell', () => {
  it('shows formatted percentage for a positive value', () => {
    renderWithProviders(<ProfitabilityCell value={0.05} />)
    // 0.05 → "5,00 %" in es-ES locale
    expect(screen.getByText(/5,00/)).toBeInTheDocument()
  })

  it('shows formatted percentage for a negative value', () => {
    renderWithProviders(<ProfitabilityCell value={-0.02} />)
    expect(screen.getByText(/-2,00/)).toBeInTheDocument()
  })

  it('shows formatted percentage for zero', () => {
    renderWithProviders(<ProfitabilityCell value={0} />)
    expect(screen.getByText(/0,00/)).toBeInTheDocument()
  })

  it('renders an arrow-up icon (aria-hidden) for positive values', () => {
    const { container } = renderWithProviders(<ProfitabilityCell value={0.12} />)
    const svg = container.querySelector('svg[aria-hidden="true"]')
    expect(svg).toBeInTheDocument()
    // lucide ArrowUp has a path with "M12 19V5"
    expect(svg?.querySelector('path[d*="M12 19V5"]')).toBeInTheDocument()
  })

  it('renders an arrow-down icon (aria-hidden) for negative values', () => {
    const { container } = renderWithProviders(<ProfitabilityCell value={-0.02} />)
    const svg = container.querySelector('svg[aria-hidden="true"]')
    expect(svg).toBeInTheDocument()
    // lucide ArrowDown has a path with "M12 5v14"
    expect(svg?.querySelector('path[d*="M12 5v14"]')).toBeInTheDocument()
  })

  it('renders no directional icon for zero', () => {
    const { container } = renderWithProviders(<ProfitabilityCell value={0} />)
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })
})
