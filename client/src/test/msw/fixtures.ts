import type { Fund, PortfolioPosition } from '@/types'

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

export const mockPortfolio: PortfolioPosition[] = [
  {
    id: 'portfolio-2',
    name: 'Renta Variable Global',
    quantity: 14.24,
    category: 'GLOBAL',
    totalValue: { amount: 4250.18, currency: 'EUR' },
  },
  {
    id: 'portfolio-1',
    name: 'Alpha Strategy Fund',
    quantity: 8.5,
    category: 'TECH',
    totalValue: { amount: 2100, currency: 'EUR' },
  },
  {
    id: 'portfolio-3',
    name: 'US Opportunities',
    quantity: 5.2,
    category: 'GLOBAL',
    totalValue: { amount: 930.4, currency: 'USD' },
  },
]
