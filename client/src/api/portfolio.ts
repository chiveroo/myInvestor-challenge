import type { PortfolioResponse } from '@/types'
import { apiFetch } from './client'

export async function getPortfolio(): Promise<PortfolioResponse> {
  return apiFetch<PortfolioResponse>('/api/portfolio')
}
