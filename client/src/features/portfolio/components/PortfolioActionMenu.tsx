import { ActionsMenu } from '@/components/molecules/ActionsMenu';
import type { PortfolioPosition } from '@/types';
import { getPortfolioActionItems, PORTFOLIO_ACTIONS_HELPER } from './portfolioHelpers';

interface PortfolioActionMenuProps {
  position: PortfolioPosition;
}

export function PortfolioActionMenu({ position }: PortfolioActionMenuProps) {
  return (
    <ActionsMenu
      triggerLabel={`Acciones para ${position.name}`}
      menuLabel={`Menú de acciones para ${position.name}`}
      helperText={PORTFOLIO_ACTIONS_HELPER}
      items={getPortfolioActionItems()}
    />
  );
}
