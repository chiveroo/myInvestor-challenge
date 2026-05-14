import type { Currency } from '@/types'

const ES_LOCALE = 'es-ES'

export function formatMoney(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(ES_LOCALE, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// value is a decimal: 0.12 → "12,00 %"
export function formatPercent(value: number): string {
  return new Intl.NumberFormat(ES_LOCALE, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
