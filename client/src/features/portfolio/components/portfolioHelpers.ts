import type { ReactNode } from 'react'
import type { ActionsMenuItem } from '@/components/molecules/ActionsMenu'
import type { PortfolioPosition } from '@/types'
import { formatMoney } from '@/utils/format'

const ES_LOCALE = 'es-ES'

export const PORTFOLIO_TRANSFER_DISABLED_HELPER =
  'Necesitas al menos dos fondos comprados para traspasar.'

export function formatQuantity(quantity: number) {
  return new Intl.NumberFormat(ES_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(quantity)
}

export function formatQuantitySummary(quantity: number) {
  return `${formatQuantity(quantity)} participaciones`
}

export function getUnitValueAmount(position: PortfolioPosition) {
  if (!Number.isFinite(position.quantity) || position.quantity <= 0) {
    return null
  }

  const unitValue = position.totalValue.amount / position.quantity

  if (!Number.isFinite(unitValue)) {
    return null
  }

  return unitValue
}

export function getDesktopUnitValueLabel(position: PortfolioPosition) {
  const unitValue = getUnitValueAmount(position)

  if (unitValue === null) {
    return null
  }

  return `Valor por participación · ${formatMoney(unitValue, position.totalValue.currency)}`
}

export function getMobileUnitValueLabel(position: PortfolioPosition) {
  const unitValue = getUnitValueAmount(position)

  if (unitValue === null) {
    return null
  }

  return formatMoney(unitValue, position.totalValue.currency)
}

export function getTransferDestinationPositions(
  position: PortfolioPosition,
  positions: PortfolioPosition[],
) {
  return positions.filter(candidate => candidate.id !== position.id)
}

interface GetPortfolioActionItemsParams {
  canTransfer: boolean
  onSell: () => void
  onTransfer: () => void
  sellIcon: ReactNode
  transferIcon: ReactNode
}

export function getPortfolioActionItems({
  canTransfer,
  onSell,
  onTransfer,
  sellIcon,
  transferIcon,
}: GetPortfolioActionItemsParams): ActionsMenuItem[] {
  return [
    {
      key: 'sell',
      label: 'Vender',
      icon: sellIcon,
      onSelect: onSell,
    },
    {
      key: 'transfer',
      label: 'Traspasar',
      icon: transferIcon,
      onSelect: onTransfer,
      disabled: !canTransfer,
    },
  ]
}
