import styled from 'styled-components'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useTheme } from 'styled-components'
import { formatPercent } from '@/utils/format'

interface ProfitabilityCellProps {
  value: number
}

type Sentiment = 'positive' | 'negative' | 'neutral'

function getSentiment(value: number): Sentiment {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}

const Cell = styled.span<{ $sentiment: Sentiment }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['0.5']};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, $sentiment }) => {
    if ($sentiment === 'positive') return theme.colors.positive
    if ($sentiment === 'negative') return theme.colors.negative
    return theme.colors.neutral
  }};
`

const IconWrapper = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  line-height: 0;
`

export function ProfitabilityCell({ value }: ProfitabilityCellProps) {
  const theme = useTheme()
  const sentiment = getSentiment(value)
  const iconSize = theme.iconSize.sm

  return (
    <Cell $sentiment={sentiment}>
      {sentiment === 'positive' && (
        <IconWrapper><ArrowUp size={iconSize} aria-hidden="true" /></IconWrapper>
      )}
      {sentiment === 'negative' && (
        <IconWrapper><ArrowDown size={iconSize} aria-hidden="true" /></IconWrapper>
      )}
      {formatPercent(value)}
    </Cell>
  )
}
