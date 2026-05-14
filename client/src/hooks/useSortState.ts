import { useCallback, useState } from 'react'

type SortDirection = 'asc' | 'desc'

interface SortState<TField extends string> {
  field: TField
  direction: SortDirection
}

export function useSortState<TField extends string>() {
  const [sort, setSort] = useState<SortState<TField> | null>(null)

  const toggleSort = useCallback((field: TField) => {
    setSort(prev => {
      if (prev?.field !== field) return { field, direction: 'asc' }
      if (prev.direction === 'asc') return { field, direction: 'desc' }
      return null
    })
  }, [])

  return { sort, toggleSort }
}
