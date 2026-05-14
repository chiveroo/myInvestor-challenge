import type { ActionsMenuItem } from '@/components/molecules/ActionsMenu';
import type { PortfolioPosition } from '@/types';
import { formatMoney } from '@/utils/format';

const ES_LOCALE = 'es-ES';

export const PORTFOLIO_ACTIONS_HELPER =
  'Disponible próximamente. Estas acciones aún no están operativas.';

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

export function getPortfolioActionItems(): ActionsMenuItem[] {
  return [
    {
      key: 'sell',
      label: 'Vender',
      disabled: true,
    },
    {
      key: 'transfer',
      label: 'Traspasar',
      disabled: true,
    },
  ];
}
