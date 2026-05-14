import styled from 'styled-components';

const TabList = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['6']};
`;

const Tab = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing['2']} ${theme.spacing['1']}`};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme, $active }) =>
    $active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.text)};
  background: transparent;
  border: none;

  @media (prefers-reduced-motion: no-preference) {
    transition: color ${({ theme }) => theme.transitions.fast};
  }

  &:hover:not(:disabled) {
    background: transparent;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: ${({ theme }) => theme.focus.ringWidth} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.ringOffset};
    border-radius: ${({ theme }) => theme.radii.sm};
  }
`;

const TabLabelStack = styled.span`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['1']};
`;

const TabIndicatorSlot = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: ${({ theme }) => theme.spacing['2']};
`;

const TabIndicator = styled.span`
  width: ${({ theme }) => theme.spacing['2']};
  height: ${({ theme }) => theme.spacing['2']};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.primary};
`;

export function PortfolioTabs() {
  return (
    <TabList role="tablist" aria-label="Secciones de la cartera">
      <Tab
        id="portfolio-tab-funds"
        role="tab"
        type="button"
        aria-selected="true"
        aria-controls="portfolio-panel-funds"
        $active
      >
        <TabLabelStack data-testid="tab-label-stack">
          <span>Fondos</span>
          <TabIndicatorSlot data-testid="tab-indicator-slot">
            <TabIndicator data-testid="active-tab-indicator" aria-hidden="true" />
          </TabIndicatorSlot>
        </TabLabelStack>
      </Tab>
      <Tab
        id="portfolio-tab-orders"
        role="tab"
        type="button"
        aria-selected="false"
        aria-controls="portfolio-panel-orders"
        disabled
      >
        <TabLabelStack data-testid="tab-label-stack">
          <span>Órdenes</span>
          <TabIndicatorSlot data-testid="tab-indicator-slot" aria-hidden="true" />
        </TabLabelStack>
      </Tab>
    </TabList>
  );
}
