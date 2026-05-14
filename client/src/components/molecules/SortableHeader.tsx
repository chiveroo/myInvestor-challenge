import styled from 'styled-components'
import { SortIcon } from '@/components/atoms/SortIcon'
import type { SortField, SortState } from '@/types'

interface SortableHeaderProps {
  label: string
  field: SortField
  currentSort: SortState | null
  onSort: (field: SortField) => void
  align?: 'left' | 'right'
}

const Th = styled.th<{ $align: 'left' | 'right' }>`
  padding: ${({ theme }) => theme.spacing['3']} ${({ theme }) => theme.spacing['4']};
  text-align: ${({ $align }) => $align};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
  user-select: none;
`

const SortButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['1']};
  color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.textSecondary};
  font-size: inherit;
  font-weight: inherit;

  @media (prefers-reduced-motion: no-preference) {
    transition: color ${({ theme }) => theme.transitions.fast};
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: ${({ theme }) => theme.focus.ringWidth} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.ringOffset};
    border-radius: ${({ theme }) => theme.radii.sm};
  }
`

export function SortableHeader({ label, field, currentSort, onSort, align = 'left' }: SortableHeaderProps) {
  const isActive = currentSort?.field === field
  const direction = isActive ? currentSort.direction : null
  const ariaSort = isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'

  return (
    <Th scope="col" $align={align} aria-sort={ariaSort}>
      <SortButton
        type="button"
        $active={isActive}
        onClick={() => onSort(field)}
        aria-label={`Ordenar por ${label}`}
      >
        {label}
        <SortIcon direction={direction} />
      </SortButton>
    </Th>
  )
}
