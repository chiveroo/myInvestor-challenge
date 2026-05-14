import { ArrowRightLeft, TrendingDown } from 'lucide-react'
import { ActionsMenu } from '@/components/molecules/ActionsMenu'
import type { PortfolioPosition } from '@/types'
import {
  getPortfolioActionItems,
  getTransferDestinationPositions,
  PORTFOLIO_TRANSFER_DISABLED_HELPER,
} from './portfolioHelpers'

interface PortfolioActionMenuProps {
  position: PortfolioPosition
  positions: PortfolioPosition[]
  onSell: (position: PortfolioPosition) => void
  onTransfer: (position: PortfolioPosition) => void
}

export function PortfolioActionMenu({ position, positions, onSell, onTransfer }: PortfolioActionMenuProps) {
  const transferDestinations = getTransferDestinationPositions(position, positions)
  const canTransfer = transferDestinations.length > 0

  return (
    <ActionsMenu
      triggerLabel={`Acciones para ${position.name}`}
      menuLabel={`Menú de acciones para ${position.name}`}
      helperText={canTransfer ? undefined : PORTFOLIO_TRANSFER_DISABLED_HELPER}
      items={getPortfolioActionItems({
        canTransfer,
        onSell: () => onSell(position),
        onTransfer: () => onTransfer(position),
        sellIcon: <TrendingDown size={16} aria-hidden="true" />,
        transferIcon: <ArrowRightLeft size={16} aria-hidden="true" />,
      })}
    />
  )
}
