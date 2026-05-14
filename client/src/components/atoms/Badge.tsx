import styled from 'styled-components'
import type { Category } from '@/types'

interface BadgeProps {
  label: string
  variant: Category | 'default'
}

const Pill = styled.span<{ $variant: Category | 'default' }>`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing['0.5']} ${({ theme }) => theme.spacing['2']};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  white-space: nowrap;
  background-color: ${({ theme, $variant }) => theme.colors.category[$variant].bg};
  color: ${({ theme, $variant }) => theme.colors.category[$variant].text};
`

export function Badge({ label, variant }: BadgeProps) {
  return <Pill $variant={variant}>{label}</Pill>
}
