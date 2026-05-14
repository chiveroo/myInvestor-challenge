import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styled from 'styled-components'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string
  children: ReactNode
}

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.spacing['8']};
  height: ${({ theme }) => theme.spacing['8']};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.primary};

  @media (prefers-reduced-motion: no-preference) {
    transition: background-color ${({ theme }) => theme.transitions.fast};
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  }

  &:focus-visible {
    outline: ${({ theme }) => theme.focus.ringWidth} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.ringOffset};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

export function IconButton({ children, ...props }: IconButtonProps) {
  return <Button type="button" {...props}>{children}</Button>
}
