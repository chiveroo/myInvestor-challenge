import type { ActionsMenuItem } from '@/components/molecules/ActionsMenu';
import type { PortfolioPosition } from '@/types';
import { formatMoney } from '@/utils/format';

const ES_LOCALE = 'es-ES';

export const PORTFOLIO_ACTIONS_HELPER =
  'Traspasar estará disponible próximamente.';

export function formatQuantity(quantity: number) {
  return new Intl.NumberFormat(ES_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(quantity);
}

export function formatQuantitySummary(quantity: number) {
  return `${formatQuantity(quantity)} participaciones`;
}

export function getUnitValueAmount(position: PortfolioPosition) {
  if (!Number.isFinite(position.quantity) || position.quantity <= 0) {
    return null;
  }

  const unitValue = position.totalValue.amount / position.quantity;

  if (!Number.isFinite(unitValue)) {
    return null;
  }

  return unitValue;
}

export function getDesktopUnitValueLabel(position: PortfolioPosition) {
  const unitValue = getUnitValueAmount(position);

  if (unitValue === null) {
    return null;
  }

  return `Valor por participación · ${formatMoney(unitValue, position.totalValue.currency)}`;
}

export function getMobileUnitValueLabel(position: PortfolioPosition) {
  const unitValue = getUnitValueAmount(position);

  if (unitValue === null) {
    return null;
  }

  return formatMoney(unitValue, position.totalValue.currency);
}

export function getPortfolioActionItems(onSell: () => void): ActionsMenuItem[] {
  return [
    {
      key: 'sell',
      label: 'Vender',
      onSelect: onSell,
    },
    {
      key: 'transfer',
      label: 'Traspasar',
      disabled: true,
    },
  ];
}
