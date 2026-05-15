import { useRef } from 'react'
import styled from 'styled-components'
import type { KeyboardEvent } from 'react'

type PortfolioTabValue = 'funds' | 'orders'

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

interface PortfolioTabsProps {
  activeTab: PortfolioTabValue
  onChangeTab: (tab: PortfolioTabValue) => void
}

export function PortfolioTabs({ activeTab, onChangeTab }: PortfolioTabsProps) {
  const fundsTabRef = useRef<HTMLButtonElement>(null)
  const ordersTabRef = useRef<HTMLButtonElement>(null)

  function activateTab(tab: PortfolioTabValue) {
    onChangeTab(tab)
    const nextTab = tab === 'funds' ? fundsTabRef.current : ordersTabRef.current
    nextTab?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const sequence: PortfolioTabValue[] = ['funds', 'orders']
    const currentIndex = sequence.indexOf(activeTab)

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      activateTab(sequence[(currentIndex + 1) % sequence.length]!)
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      activateTab(sequence[(currentIndex - 1 + sequence.length) % sequence.length]!)
    }

    if (event.key === 'Home') {
      event.preventDefault()
      activateTab('funds')
    }

    if (event.key === 'End') {
      event.preventDefault()
      activateTab('orders')
    }
  }

  return (
    <TabList role="tablist" aria-label="Secciones de la cartera" onKeyDown={handleKeyDown}>
      <Tab
        ref={fundsTabRef}
        id="portfolio-tab-funds"
        role="tab"
        type="button"
        aria-selected={activeTab === 'funds'}
        aria-controls="portfolio-panel-funds"
        tabIndex={activeTab === 'funds' ? 0 : -1}
        $active={activeTab === 'funds'}
        onClick={() => activateTab('funds')}
      >
        <TabLabelStack data-testid="tab-label-stack">
          <span>Fondos</span>
          <TabIndicatorSlot data-testid="tab-indicator-slot">
            {activeTab === 'funds' ? <TabIndicator data-testid="active-tab-indicator" aria-hidden="true" /> : null}
          </TabIndicatorSlot>
        </TabLabelStack>
      </Tab>
      <Tab
        ref={ordersTabRef}
        id="portfolio-tab-orders"
        role="tab"
        type="button"
        aria-selected={activeTab === 'orders'}
        aria-controls="portfolio-panel-orders"
        tabIndex={activeTab === 'orders' ? 0 : -1}
        $active={activeTab === 'orders'}
        onClick={() => activateTab('orders')}
      >
        <TabLabelStack data-testid="tab-label-stack">
          <span>Órdenes</span>
          <TabIndicatorSlot data-testid="tab-indicator-slot">
            {activeTab === 'orders' ? <TabIndicator data-testid="active-tab-indicator" aria-hidden="true" /> : null}
          </TabIndicatorSlot>
        </TabLabelStack>
      </Tab>
    </TabList>
  )
}
