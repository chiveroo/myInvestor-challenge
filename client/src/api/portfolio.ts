import type { PortfolioResponse } from '@/types'
import { apiFetch } from './client'

export function getPortfolio(): Promise<PortfolioResponse> {
  return apiFetch<PortfolioResponse>('/api/portfolio')
}
