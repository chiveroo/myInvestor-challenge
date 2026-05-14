import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getFunds } from '@/api/funds'
import type { SortState } from '@/types'
import { fundKeys } from '../keys'

const PAGE_SIZE = 10

export function useFunds(page: number, sort: SortState | null) {
  return useQuery({
    queryKey: fundKeys.list(page, sort),
    queryFn: () => getFunds({ page, limit: PAGE_SIZE, sort }),
    placeholderData: keepPreviousData,
  })
}
