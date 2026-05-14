import { Button } from '@/components/atoms/Button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
`;

const DesktopTableWrap = styled.div`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: block;
    overflow-x: auto;
  }
`;

const MobileList = styled.div`
  display: grid;
  padding: ${({ theme }) => theme.spacing['2']} ${({ theme }) => theme.spacing['4']};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
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

const HelperText = styled.span`
  display: block;
  margin-top: ${({ theme }) => theme.spacing['1']};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const SkeletonBlock = styled.span<{ $width?: string }>`
  display: block;
  height: ${({ theme }) => theme.spacing['3']};
  width: ${({ $width }) => $width ?? '100%'};
  background: ${({ theme }) => theme.colors.backgroundSubtle};
  border-radius: ${({ theme }) => theme.radii.sm};

  @media (prefers-reduced-motion: no-preference) {
    animation: ${pulse} 1.4s ease-in-out infinite;
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
`;

const MobileAvatar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.spacing['12']};
  height: ${({ theme }) => theme.spacing['12']};
  background: ${({ theme }) => theme.colors.backgroundSubtle};
  border-radius: ${({ theme }) => theme.radii.full};
`;

const MobileDetails = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing['1']};
  min-width: 0;
`;

const MobileValueBlock = styled.div`
  display: grid;
  justify-items: end;
  gap: ${({ theme }) => theme.spacing['1']};
`;

const ErrorCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['3']};
  padding: ${({ theme }) => theme.spacing['8']} ${({ theme }) => theme.spacing['4']};
  background: ${({ theme }) => theme.colors.background};
  border: ${({ theme }) => theme.borderWidth.base} solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2']};
  padding: ${({ theme }) => theme.spacing['8']} ${({ theme }) => theme.spacing['4']};
  background: ${({ theme }) => theme.colors.background};
  border: ${({ theme }) => theme.borderWidth.base} solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  text-align: center;
`;

const EmptyTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const EmptyDescription = styled.p`
  max-width: ${({ theme }) => theme.sizes.contentMaxWidth};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export function PortfolioSkeleton() {
  return (
    <>
      <DesktopTableWrap>
        <Table aria-label="Posiciones de la cartera" aria-busy="true">
          <Thead>
            <tr>
              <Th>Fondo</Th>
              <Th $align="right">Participaciones</Th>
              <Th $align="right">Valor total</Th>
              <Th>Acciones</Th>
            </tr>
          </Thead>
          <tbody>
            {Array.from({ length: 4 }, (_, index) => (
              <tr key={index}>
                <Td>
                  <SkeletonBlock $width="12rem" />
                </Td>
                <Td $align="right">
                  <SkeletonBlock $width="5rem" />
                </Td>
                <Td $align="right">
                  <SkeletonBlock $width="6rem" />
                </Td>
                <Td>
                  <SkeletonBlock $width="10rem" />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </DesktopTableWrap>

      <MobileList>
        {Array.from({ length: 3 }, (_, index) => (
          <MobileCard key={index}>
            <MobileAvatar aria-hidden="true">
              <SkeletonBlock $width="1.5rem" />
            </MobileAvatar>
            <MobileDetails>
              <SkeletonBlock $width="9rem" />
              <HelperText>
                <SkeletonBlock $width="6rem" />
              </HelperText>
            </MobileDetails>
            <MobileValueBlock>
              <SkeletonBlock $width="6rem" />
              <SkeletonBlock $width="5rem" />
            </MobileValueBlock>
            <SkeletonBlock $width="1.5rem" />
          </MobileCard>
        ))}
      </MobileList>
    </>
  );
}

interface PortfolioErrorStateProps {
  onRetry: () => void;
}

export function PortfolioErrorState({ onRetry }: PortfolioErrorStateProps) {
  return (
    <ErrorCard role="alert">
      <AlertCircle size={24} aria-hidden="true" />
      <p>No se ha podido cargar tu cartera de fondos. Comprueba tu conexión e inténtalo de nuevo.</p>
      <Button onClick={onRetry}>
        <RefreshCw size={16} aria-hidden="true" />
        Reintentar
      </Button>
    </ErrorCard>
  );
}

export function PortfolioEmptyState() {
  return (
    <EmptyState>
      <EmptyTitle>Aún no tienes posiciones en fondos</EmptyTitle>
      <EmptyDescription>
        Cuando realices tu primera compra, aquí verás el detalle de la cartera y las acciones
        disponibles para cada posición.
      </EmptyDescription>
    </EmptyState>
  );
}
