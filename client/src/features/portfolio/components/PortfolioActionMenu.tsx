import { ActionsMenu } from '@/components/molecules/ActionsMenu';
import type { PortfolioPosition } from '@/types';
import { getPortfolioActionItems, PORTFOLIO_ACTIONS_HELPER } from './portfolioHelpers';

interface PortfolioActionMenuProps {
  position: PortfolioPosition;
  onSell: (position: PortfolioPosition) => void;
}

export function PortfolioActionMenu({ position, onSell }: PortfolioActionMenuProps) {
  return (
    <ActionsMenu
      triggerLabel={`Acciones para ${position.name}`}
      menuLabel={`Menú de acciones para ${position.name}`}
      helperText={PORTFOLIO_ACTIONS_HELPER}
      items={getPortfolioActionItems(() => onSell(position))}
    />
  );
}
