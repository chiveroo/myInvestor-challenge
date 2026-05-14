import type { Category } from '@/types';
import styled from 'styled-components';

interface BadgeProps {
  label: string;
  variant: Category | 'default';
}

const CATEGORY_LABELS: Record<string, string> = {
  GLOBAL: 'Global',
  TECH: 'Tecnología',
  HEALTH: 'Salud',
  MONEY_MARKET: 'Monetarios',
};

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
`;

export function Badge({ label, variant }: BadgeProps) {
  const displayLabel = CATEGORY_LABELS[label] ?? label;
  return <Pill $variant={variant}>{displayLabel}</Pill>;
}
