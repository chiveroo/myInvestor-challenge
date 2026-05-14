import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styled, { css } from 'styled-components'

export type ButtonVariant = 'primary' | 'ghost' | 'danger'
export type ButtonSize = 'md' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const variantStyles = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.textInverse};
    border: ${({ theme }) => theme.borderWidth.base} solid ${({ theme }) => theme.colors.primary};
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.primaryHover};
      border-color: ${({ theme }) => theme.colors.primaryHover};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.textSecondary};
    border: ${({ theme }) => theme.borderWidth.base} solid ${({ theme }) => theme.colors.border};
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.backgroundSubtle};
      color: ${({ theme }) => theme.colors.text};
    }
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.negative};
    color: ${({ theme }) => theme.colors.textInverse};
    border: ${({ theme }) => theme.borderWidth.base} solid ${({ theme }) => theme.colors.negative};
    &:hover:not(:disabled) {
      opacity: 0.88;
    }
  `,
}

const sizeStyles = {
  md: css`
    padding: ${({ theme }) => theme.spacing['3']} ${({ theme }) => theme.spacing['5']};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    min-height: 2.5rem;
  `,
  sm: css`
    padding: ${({ theme }) => theme.spacing['2']} ${({ theme }) => theme.spacing['3']};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    min-height: 2rem;
  `,
}

const StyledButton = styled.button<{ $variant: ButtonVariant; $size: ButtonSize }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing['2']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  white-space: nowrap;
  transition: background ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast},
    color ${({ theme }) => theme.transitions.fast};

  &:focus-visible {
    outline: ${({ theme }) => theme.focus.ringWidth} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.ringOffset};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  ${({ $variant }) => variantStyles[$variant]}
  ${({ $size }) => sizeStyles[$size]}
`

export function Button({ variant = 'primary', size = 'md', children, ...props }: ButtonProps) {
  return (
    <StyledButton $variant={variant} $size={size} {...props}>
      {children}
    </StyledButton>
  )
}
