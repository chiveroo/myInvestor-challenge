import { act, fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '@/styles/theme'
import { useToast } from '@/hooks/useToast'
import { ToastProvider } from '../ToastProvider'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  )
}

function ToastTrigger({ message, variant }: { message: string; variant?: 'info' | 'success' | 'error' }) {
  const addToast = useToast()
  return <button onClick={() => addToast(message, variant)}>trigger</button>
}

describe('ToastProvider', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('renders children with no visible toast initially', () => {
    render(<ToastTrigger message="Hello" />, { wrapper: Wrapper })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows the toast message after trigger', () => {
    render(<ToastTrigger message="Operación completada" />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Operación completada')).toBeInTheDocument()
  })

  it('uses role="status" for info toasts', () => {
    render(<ToastTrigger message="Info" variant="info" />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('uses role="alert" for error toasts', () => {
    render(<ToastTrigger message="Error" variant="error" />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('auto-dismisses after 4 seconds', () => {
    render(<ToastTrigger message="Bye soon" />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Bye soon')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(4_000))
    expect(screen.queryByText('Bye soon')).not.toBeInTheDocument()
  })

  it('does not dismiss before 4 seconds', () => {
    render(<ToastTrigger message="Still here" />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button'))

    act(() => vi.advanceTimersByTime(3_999))
    expect(screen.getByText('Still here')).toBeInTheDocument()
  })

  it('stacks multiple toasts', () => {
    render(
      <>
        <ToastTrigger message="First" />
        <ToastTrigger message="Second" />
      </>,
      { wrapper: Wrapper }
    )
    const [btnFirst, btnSecond] = screen.getAllByRole('button')
    fireEvent.click(btnFirst)
    fireEvent.click(btnSecond)

    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('throws when useToast is called outside ToastProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() =>
      render(
        <ThemeProvider theme={theme}>
          <ToastTrigger message="Orphan" />
        </ThemeProvider>
      )
    ).toThrow('useToast must be used inside <ToastProvider>')
    consoleError.mockRestore()
  })
})
