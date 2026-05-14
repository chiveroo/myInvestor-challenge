import styled from 'styled-components'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { useTheme } from 'styled-components'
import type { SortDirection } from '@/types'

interface SortIconProps {
  direction: SortDirection | null
}

const Wrapper = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  line-height: 0;
`

export function SortIcon({ direction }: SortIconProps) {
  const theme = useTheme()
  const size = theme.iconSize.sm

  return (
    <Wrapper>
      {direction === 'asc' && <ChevronUp size={size} aria-hidden="true" />}
      {direction === 'desc' && <ChevronDown size={size} aria-hidden="true" />}
      {direction === null && <ChevronsUpDown size={size} aria-hidden="true" />}
    </Wrapper>
  )
}
