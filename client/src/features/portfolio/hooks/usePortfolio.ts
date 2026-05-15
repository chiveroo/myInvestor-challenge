import { useQuery } from '@tanstack/react-query'
import { getPortfolio } from '@/api/portfolio'
import type { Category, PortfolioPosition, PortfolioResponse } from '@/types'
import { portfolioKeys } from '../keys'

function sortPortfolioAlphabetically(positions: PortfolioPosition[]) {
  return [...positions].sort((left, right) => left.name.localeCompare(right.name, 'es'))
}

const CATEGORY_ORDER: Category[] = ['GLOBAL', 'TECH', 'HEALTH', 'MONEY_MARKET']

export interface PortfolioCategoryGroup {
  category: Category
  positions: PortfolioPosition[]
}

function groupPortfolioByCategory(positions: PortfolioPosition[]): PortfolioCategoryGroup[] {
  const grouped = positions.reduce<Map<Category, PortfolioPosition[]>>((acc, position) => {
    const current = acc.get(position.category) ?? []
    acc.set(position.category, [...current, position])
    return acc
  }, new Map())

  return CATEGORY_ORDER.filter(category => grouped.has(category)).map(category => ({
    category,
    positions: grouped.get(category) ?? [],
  }))
}

export function usePortfolio() {
  return useQuery({
    queryKey: portfolioKeys.list(),
    queryFn: getPortfolio,
    select: (response: PortfolioResponse) => {
      const sortedPositions = sortPortfolioAlphabetically(response.data)

      return {
        ...response,
        data: sortedPositions,
        groupedData: groupPortfolioByCategory(sortedPositions),
      }
    },
  })
}
