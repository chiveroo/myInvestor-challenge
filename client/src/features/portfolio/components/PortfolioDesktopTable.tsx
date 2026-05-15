import type { PortfolioPosition } from '@/types';
import { Badge } from '@/components/atoms/Badge';
import { formatMoney } from '@/utils/format';
import styled from 'styled-components';
import type { PortfolioCategoryGroup } from '../hooks/usePortfolio';
import { PortfolioActionMenu } from './PortfolioActionMenu';
import { formatQuantity, getDesktopUnitValueLabel } from './portfolioHelpers';

const DesktopTableWrap = styled.div`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: block;
    overflow-x: auto;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const CategorySection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing['6']};

  &:last-child {
    margin-bottom: 0;
  }
`;

const CategoryHeading = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing['3']};
`;

const Thead = styled.thead`
  background: ${({ theme }) => theme.colors.backgroundSubtle};
`;

const Th = styled.th<{ $align?: 'left' | 'right' }>`
  padding: ${({ theme }) => theme.spacing['4']};
  text-align: ${({ $align }) => $align ?? 'left'};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
`;

const Td = styled.td<{ $align?: 'left' | 'right' }>`
  padding: ${({ theme }) => theme.spacing['4']};
  text-align: ${({ $align }) => $align ?? 'left'};
  border-top: ${({ theme }) => theme.borderWidth.base} solid ${({ theme }) => theme.colors.border};
  vertical-align: top;
`;

const ActionsCell = styled(Td)`
  width: 1%;
  white-space: nowrap;
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

interface PortfolioDesktopTableProps {
  groupedPositions: PortfolioCategoryGroup[]
  allPositions: PortfolioPosition[]
  onSell: (position: PortfolioPosition) => void
  onTransfer: (position: PortfolioPosition) => void
}

export function PortfolioDesktopTable({
  groupedPositions,
  allPositions,
  onSell,
  onTransfer,
}: PortfolioDesktopTableProps) {
  return (
    <DesktopTableWrap>
      {groupedPositions.map(group => (
        <CategorySection key={group.category} aria-labelledby={`portfolio-desktop-category-${group.category}`}>
          <CategoryHeading id={`portfolio-desktop-category-${group.category}`}>
            <Badge label={group.category} variant={group.category} />
          </CategoryHeading>

          <Table aria-label={`Posiciones de la categoría ${group.category}`}>
            <Thead>
              <tr>
                <Th>Fondo</Th>
                <Th $align="right">Participaciones</Th>
                <Th $align="right">Valor total</Th>
                <Th>Acciones</Th>
              </tr>
            </Thead>
            <tbody>
              {group.positions.map((position) => (
                <tr key={position.id}>
                  <Td>
                    <Name>{position.name}</Name>
                    <HelperText>{getDesktopUnitValueLabel(position) ?? 'Posición en fondos'}</HelperText>
                  </Td>
                  <Td $align="right">{formatQuantity(position.quantity)}</Td>
                  <Td $align="right">
                    {formatMoney(position.totalValue.amount, position.totalValue.currency)}
                  </Td>
                  <ActionsCell>
                    <PortfolioActionMenu
                      position={position}
                      positions={allPositions}
                      onSell={onSell}
                      onTransfer={onTransfer}
                    />
                  </ActionsCell>
                </tr>
              ))}
            </tbody>
          </Table>
        </CategorySection>
      ))}
    </DesktopTableWrap>
  );
}
