import type { FundsResponse, SortState } from '@/types'
import { apiFetch } from './client'

interface GetFundsParams {
  page: number
  limit: number
  sort?: SortState | null
}

export async function getFunds({ page, limit, sort }: GetFundsParams): Promise<FundsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  if (sort) {
    params.set('sort', `${sort.field}:${sort.direction}`)
  }

  return apiFetch<FundsResponse>(`/api/funds?${params}`)
}
