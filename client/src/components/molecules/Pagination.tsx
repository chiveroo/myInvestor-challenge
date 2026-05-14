import styled from 'styled-components'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTheme } from 'styled-components'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing['3']};
  padding: ${({ theme }) => theme.spacing['4']} ${({ theme }) => theme.spacing['0']};
`

const PageButton = styled.button<{ $variant?: 'nav' }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['1']};
  padding: ${({ theme }) => theme.spacing['2']} ${({ theme }) => theme.spacing['3']};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.primary};
  border: ${({ theme }) => theme.borderWidth.base} solid ${({ theme }) => theme.colors.border};

  @media (prefers-reduced-motion: no-preference) {
    transition: background-color ${({ theme }) => theme.transitions.fast},
                border-color ${({ theme }) => theme.transitions.fast};
  }

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.backgroundSubtle};
    border-color: ${({ theme }) => theme.colors.borderStrong};
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

const PageInfo = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
`

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const theme = useTheme()
  const iconSize = theme.iconSize.md

  if (totalPages <= 1) return null

  return (
    <Nav aria-label="Paginación">
      <PageButton
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeft size={iconSize} aria-hidden="true" />
        Anterior
      </PageButton>

      <PageInfo aria-live="polite" aria-atomic="true">
        Página {page} de {totalPages}
      </PageInfo>

      <PageButton
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
      >
        Siguiente
        <ChevronRight size={iconSize} aria-hidden="true" />
      </PageButton>
    </Nav>
  )
}
