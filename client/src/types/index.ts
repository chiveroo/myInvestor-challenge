export type Currency = 'EUR' | 'USD'

export type Category = 'GLOBAL' | 'TECH' | 'HEALTH' | 'MONEY_MARKET'

export interface Amount {
  amount: number
  currency: Currency
}

export interface Profitability {
  YTD: number
  oneYear: number
  threeYears: number
  fiveYears: number
}

export interface Fund {
  id: string
  name: string
  symbol: string
  value: Amount
  category: Category
  profitability: Profitability
}

export interface Pagination {
  page: number
  limit: number
  totalFunds: number
  totalPages: number
}

export interface FundsResponse {
  pagination: Pagination
  data: Fund[]
}

// Sort field matches the server's accepted sort fields
export type SortField =
  | 'name'
  | 'currency'
  | 'value'
  | 'category'
  | 'profitability.YTD'
  | 'profitability.oneYear'
  | 'profitability.threeYears'
  | 'profitability.fiveYears'

export type SortDirection = 'asc' | 'desc'

export interface SortState {
  field: SortField
  direction: SortDirection
}

