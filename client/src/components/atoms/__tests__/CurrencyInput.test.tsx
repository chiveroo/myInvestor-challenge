import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { describe, expect, it, vi } from 'vitest'
import { theme } from '@/styles/theme'
import { CurrencyInput } from '../CurrencyInput'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

describe('CurrencyInput', () => {
  it('renders label and input', () => {
    render(<CurrencyInput label="Importe" name="amount" />, { wrapper: Wrapper })
    expect(screen.getByLabelText('Importe')).toBeInTheDocument()
  })

  it('calls onValueChange with parsed number on input', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(<CurrencyInput label="Importe" name="amount" onValueChange={onValueChange} />, { wrapper: Wrapper })
    await user.type(screen.getByLabelText('Importe'), '500')
    expect(onValueChange).toHaveBeenCalledWith(500)
  })

  it('formats value to currency on blur', async () => {
    const user = userEvent.setup()
    render(<CurrencyInput label="Importe" name="amount" />, { wrapper: Wrapper })
    const input = screen.getByLabelText('Importe')
    await user.type(input, '1500')
    fireEvent.blur(input)
    expect(input).toHaveValue('1.500,00 €')
  })

  it('clears the visible value when the controlled value resets', async () => {
    const user = userEvent.setup()

    function ControlledField() {
      const [value, setValue] = useState<number | undefined>(undefined)

      return (
        <>
          <CurrencyInput label="Importe" name="amount" value={value} onValueChange={setValue} />
          <button type="button" onClick={() => setValue(undefined)}>
            Limpiar
          </button>
        </>
      )
    }

    render(<ControlledField />, { wrapper: Wrapper })

    const input = screen.getByLabelText('Importe')
    await user.type(input, '2500')
    fireEvent.blur(input)
    expect(input).toHaveValue('2.500,00 €')

    await user.click(screen.getByRole('button', { name: 'Limpiar' }))
    expect(input).toHaveValue('')
  })

  it('shows error message with role="alert" and aria-invalid', () => {
    render(<CurrencyInput label="Importe" name="amount" error="Importe inválido" />, { wrapper: Wrapper })
    expect(screen.getByRole('alert')).toHaveTextContent('Importe inválido')
    expect(screen.getByLabelText('Importe')).toHaveAttribute('aria-invalid', 'true')
  })

  it('is disabled when disabled prop is passed', () => {
    render(<CurrencyInput label="Importe" name="amount" disabled />, { wrapper: Wrapper })
    expect(screen.getByLabelText('Importe')).toBeDisabled()
  })
})
