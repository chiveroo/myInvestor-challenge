import { useQuery } from '@tanstack/react-query'
import { getPortfolio } from '@/api/portfolio'
import type { PortfolioPosition, PortfolioResponse } from '@/types'
import { portfolioKeys } from '../keys'

function sortPortfolioAlphabetically(positions: PortfolioPosition[]) {
  return [...positions].sort((left, right) => left.name.localeCompare(right.name, 'es'))
}

export function usePortfolio() {
  return useQuery({
    queryKey: portfolioKeys.list(),
    queryFn: getPortfolio,
    select: (response: PortfolioResponse) => ({
      ...response,
      data: sortPortfolioAlphabetically(response.data),
    }),
  })
}
