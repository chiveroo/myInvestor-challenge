import { useState } from 'react';
import styled from 'styled-components';
import type { PortfolioPosition } from '@/types';
import { usePortfolio } from '../hooks/usePortfolio';
import { SellDialog } from './SellDialog';
import { TransferDialog } from './TransferDialog';
import { PortfolioDesktopTable } from './PortfolioDesktopTable';
import { PortfolioMobileList } from './PortfolioMobileList';
import { PortfolioEmptyState, PortfolioErrorState, PortfolioSkeleton } from './PortfolioStates';
import { PortfolioTabs } from './PortfolioTabs';

const Section = styled.section`
  width: 100%;
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['6']};
`;

const TabPanel = styled.div<{ $stale?: boolean }>`
  opacity: ${({ $stale }) => ($stale ? 0.7 : 1)};

  @media (prefers-reduced-motion: no-preference) {
    transition: opacity ${({ theme }) => theme.transitions.fast};
  }
`;

export function PortfolioView() {
  const { data, isLoading, isError, refetch, isFetching } = usePortfolio();
  const [selectedSellPosition, setSelectedSellPosition] = useState<PortfolioPosition | null>(null);
  const [selectedTransferPosition, setSelectedTransferPosition] = useState<PortfolioPosition | null>(null);

  function handleSell(position: PortfolioPosition) {
    setSelectedSellPosition(position);
  }

  function handleCloseSellDialog() {
    setSelectedSellPosition(null);
  }

  function handleTransfer(position: PortfolioPosition) {
    setSelectedTransferPosition(position);
  }

  function handleCloseTransferDialog() {
    setSelectedTransferPosition(null);
  }

  if (isLoading) {
    return (
      <Section>
        <Header>
          <PortfolioTabs />
        </Header>
        <TabPanel role="tabpanel" id="portfolio-panel-funds" aria-labelledby="portfolio-tab-funds">
          <PortfolioSkeleton />
        </TabPanel>
      </Section>
    );
  }

  if (isError) {
    return (
      <Section>
        <Header>
          <PortfolioTabs />
        </Header>
        <PortfolioErrorState onRetry={() => refetch()} />
      </Section>
    );
  }

  if (!data?.data.length) {
    return (
      <Section>
        <Header>
          <PortfolioTabs />
        </Header>
        <PortfolioEmptyState />
      </Section>
    );
  }

  return (
    <Section>
      <Header>
        <PortfolioTabs />
      </Header>

      <TabPanel
        role="tabpanel"
        id="portfolio-panel-funds"
        aria-labelledby="portfolio-tab-funds"
        $stale={isFetching}
      >
        <PortfolioDesktopTable positions={data.data} onSell={handleSell} onTransfer={handleTransfer} />
        <PortfolioMobileList positions={data.data} onSell={handleSell} onTransfer={handleTransfer} />
      </TabPanel>

      {selectedSellPosition ? (
        <SellDialog position={selectedSellPosition} isOpen onClose={handleCloseSellDialog} />
      ) : null}

      {selectedTransferPosition ? (
        <TransferDialog
          position={selectedTransferPosition}
          positions={data.data}
          isOpen
          onClose={handleCloseTransferDialog}
        />
      ) : null}
    </Section>
  );
}
