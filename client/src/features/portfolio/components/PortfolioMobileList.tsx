import type { PortfolioPosition } from '@/types';
import { formatMoney } from '@/utils/format';
import { LineChart } from 'lucide-react';
import styled from 'styled-components';
import { PortfolioActionMenu } from './PortfolioActionMenu';
import { formatQuantitySummary, getMobileUnitValueLabel } from './portfolioHelpers';

const MobileList = styled.div`
  display: grid;
  padding: ${({ theme }) => theme.spacing['2']} ${({ theme }) => theme.spacing['4']};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const MobileCard = styled.article`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['3']};
  padding: ${({ theme }) => theme.spacing['4']} 0;
  border-bottom: ${({ theme }) => theme.borderWidth.base} solid
    ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: auto minmax(0, 1fr) auto auto;
    gap: ${({ theme }) => theme.spacing['2']};
  }
`;

const MobileAvatar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.spacing['12']};
  height: ${({ theme }) => theme.spacing['12']};
  background: ${({ theme }) => theme.colors.backgroundSubtle};
  border-radius: ${({ theme }) => theme.radii.full};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: ${({ theme }) => theme.spacing['10']};
    height: ${({ theme }) => theme.spacing['10']};
  }
`;

const MobileDetails = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing['1']};
  min-width: 0;
`;

const Name = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const HelperText = styled.span`
  display: block;
  margin-top: ${({ theme }) => theme.spacing['1']};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const MobileValueBlock = styled.div`
  display: grid;
  justify-items: end;
  gap: ${({ theme }) => theme.spacing['1']};
  flex-shrink: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    justify-items: end;
  }
`;

const ValueSummary = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }
`;

const QuantitySummary = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
`;

const MobileMenuSlot = styled.div`
  display: flex;
  align-items: flex-start;
`;

function PortfolioMobileRow({ position, onSell }: { position: PortfolioPosition; onSell: (position: PortfolioPosition) => void }) {
  const mobileUnitValueLabel = getMobileUnitValueLabel(position);

  return (
    <MobileCard role="group" aria-label={`Posición en ${position.name}`}>
      <MobileAvatar aria-hidden="true">
        <LineChart size={20} />
      </MobileAvatar>

      <MobileDetails>
        <Name>{position.name}</Name>
        {mobileUnitValueLabel ? <HelperText>{mobileUnitValueLabel}</HelperText> : null}
      </MobileDetails>

      <MobileValueBlock aria-label={`Resumen de ${position.name}`}>
        <ValueSummary>
          {formatMoney(position.totalValue.amount, position.totalValue.currency)}
        </ValueSummary>
        <QuantitySummary>{formatQuantitySummary(position.quantity)}</QuantitySummary>
      </MobileValueBlock>

      <MobileMenuSlot>
        <PortfolioActionMenu position={position} onSell={onSell} />
      </MobileMenuSlot>
    </MobileCard>
  );
}

interface PortfolioMobileListProps {
  positions: PortfolioPosition[];
  onSell: (position: PortfolioPosition) => void;
}

export function PortfolioMobileList({ positions, onSell }: PortfolioMobileListProps) {
  return (
    <MobileList>
      {positions.map((position) => (
        <PortfolioMobileRow key={position.id} position={position} onSell={onSell} />
      ))}
    </MobileList>
  );
}
