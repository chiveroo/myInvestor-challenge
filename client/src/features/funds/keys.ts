import type { SortState } from '@/types'

export const fundKeys = {
  all: ['funds'] as const,
  lists: () => [...fundKeys.all, 'list'] as const,
  list: (page: number, sort: SortState | null) =>
    [...fundKeys.lists(), page, sort] as const,
}
