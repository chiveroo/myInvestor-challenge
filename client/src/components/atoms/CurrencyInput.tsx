import { forwardRef, useCallback, useEffect, useId, useState, type InputHTMLAttributes } from 'react'
import styled from 'styled-components'

interface CurrencyInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  label: string
  name: string
  error?: string
  value?: number
  onValueChange?: (value: number | undefined) => void
}

function formatDisplay(value: number): string {
  const sign = value < 0 ? '-' : ''
  const [whole, decimal] = Math.abs(value).toFixed(2).split('.')
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `${sign}${groupedWhole},${decimal} €`
}

function formatEditable(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    useGrouping: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

function parseAmount(raw: string): number | undefined {
  const clean = raw.replace(/[^\d,.-]/g, '')

  if (!clean || clean === '-' || clean === ',' || clean === '.' || clean === '-,' || clean === '-.') {
    return undefined
  }

  const normalized = clean.includes(',')
    ? clean.replace(/\./g, '').replace(',', '.')
    : clean.includes('.') && /\.\d{1,2}$/.test(clean)
      ? clean
      : clean.replace(/\./g, '')

  const n = Number.parseFloat(normalized)
  return Number.isNaN(n) ? undefined : n
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput(
    {
      label,
      name,
      error,
      disabled,
      placeholder = '0,00 €',
      value,
      onValueChange,
      onBlur,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) {
    const id = useId()
    const errorId = `${id}-error`
    const [display, setDisplay] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const [internalValue, setInternalValue] = useState<number | undefined>(value)
    const isControlled = onValueChange !== undefined
    const currentValue = isControlled ? value : internalValue

    useEffect(() => {
      if (currentValue === undefined || Number.isNaN(currentValue)) {
        setDisplay('')
        return
      }

      if (!isFocused) {
        setDisplay(formatDisplay(currentValue))
      }
    }, [currentValue, isFocused])

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^\d,.-]/g, '')
        const parsed = parseAmount(raw)

        setDisplay(raw)
        if (isControlled) {
          onValueChange?.(parsed)
          return
        }

        setInternalValue(parsed)
      },
      [isControlled, onValueChange]
    )

    const handleFocus = useCallback(() => {
      setIsFocused(true)
      setDisplay(currentValue === undefined ? '' : formatEditable(currentValue))
    }, [currentValue])

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      const numeric = parseAmount(display)

      if (numeric === undefined) {
        setDisplay('')
        if (isControlled) {
          onValueChange?.(undefined)
        } else {
          setInternalValue(undefined)
        }
        onBlur?.(e)
        return
      }

      setDisplay(formatDisplay(numeric))
      if (isControlled) {
        onValueChange?.(numeric)
      } else {
        setInternalValue(numeric)
      }
      onBlur?.(e)
    }, [display, isControlled, onBlur, onValueChange])

    const describedBy = [ariaDescribedBy, error ? errorId : undefined].filter(Boolean).join(' ') || undefined

    return (
      <Wrapper>
        <Label htmlFor={id}>{label}</Label>
        <StyledInput
          ref={ref}
          id={id}
          name={name}
          type="text"
          inputMode="decimal"
          value={display}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          $hasError={!!error}
        />
        {error && (
          <ErrorText id={errorId} role="alert">
            {error}
          </ErrorText>
        )}
      </Wrapper>
    )
  }
)

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['1']};
`

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const StyledInput = styled.input<{ $hasError: boolean }>`
  padding: ${({ theme }) => theme.spacing['3']} ${({ theme }) => theme.spacing['4']};
  border: ${({ theme }) => theme.borderWidth.md} solid
    ${({ theme, $hasError }) => ($hasError ? theme.colors.negative : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.background};
  width: 100%;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus-visible {
    outline: ${({ theme }) => theme.focus.ringWidth} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.ringOffset};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`

const ErrorText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.negative};
`
