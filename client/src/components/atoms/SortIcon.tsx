import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { useTheme } from 'styled-components'
import type { SortDirection } from '@/types'

interface SortIconProps {
  direction: SortDirection | null
}

export function SortIcon({ direction }: SortIconProps) {
  const theme = useTheme()
  const size = theme.iconSize.sm

  if (direction === 'asc') return <ChevronUp size={size} aria-hidden="true" />
  if (direction === 'desc') return <ChevronDown size={size} aria-hidden="true" />
  return <ChevronsUpDown size={size} aria-hidden="true" />
}
