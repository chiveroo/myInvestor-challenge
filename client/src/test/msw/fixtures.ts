import type { Fund } from '@/types'

export const mockFunds: Fund[] = [
  {
    id: '1',
    name: 'Global Equity Fund',
    symbol: 'GEF',
    value: { amount: 120.45, currency: 'EUR' },
    category: 'GLOBAL',
    profitability: { YTD: 0.05, oneYear: 0.12, threeYears: 0.35, fiveYears: 0.5 },
  },
  {
    id: '2',
    name: 'Tech Growth Fund',
    symbol: 'TGF',
    value: { amount: 210.32, currency: 'EUR' },
    category: 'TECH',
    profitability: { YTD: 0.08, oneYear: 0.18, threeYears: 0.42, fiveYears: 0.65 },
  },
  {
    id: '3',
    name: 'Health Innovation Fund',
    symbol: 'HIF',
    value: { amount: 95.78, currency: 'EUR' },
    category: 'HEALTH',
    profitability: { YTD: 0.03, oneYear: 0.09, threeYears: 0.28, fiveYears: 0.41 },
  },
]
