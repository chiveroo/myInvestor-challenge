import { useState } from 'react'
import { useSortState } from '@/hooks/useSortState'
import { useDisclosure } from '@/hooks/useDisclosure'
import styled, { css, keyframes } from 'styled-components'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useFunds } from '../hooks/useFunds'
import { BuyDialog } from './BuyDialog'
import { useOrderHistory } from '@/features/orders/hooks/useOrderHistory'
import { SortableHeader } from '@/components/molecules/SortableHeader'
import { ProfitabilityCell } from '@/components/molecules/ProfitabilityCell'
import { ActionsMenu } from '@/components/molecules/ActionsMenu'
import { Pagination } from '@/components/molecules/Pagination'
import { Badge } from '@/components/atoms/Badge'
import { formatMoney } from '@/utils/format'
import type { Fund, SortField } from '@/types'

const Section = styled.section`
  width: 100%;
`

const ScrollWrapper = styled.div<{ $stale: boolean }>`
  overflow-x: auto;
  background: ${({ theme }) => theme.colors.background};
  border: ${({ theme }) => theme.borderWidth.base} solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};

  @media (prefers-reduced-motion: no-preference) {
    transition: opacity ${({ theme }) => theme.transitions.fast};
  }
  opacity: ${({ $stale }) => ($stale ? 0.6 : 1)};
`

const Table = styled.table`
  width: 100%;
  min-width: ${({ theme }) => theme.sizes.tableMinWidth};
  border-collapse: separate;
  border-spacing: 0;

  tbody tr:last-child td {
    border-bottom: none;
  }
`

const Thead = styled.thead`
  background: ${({ theme }) => theme.colors.backgroundSubtle};
`

const stickyRight = css`
  position: sticky;
  right: 0;
  box-shadow: inset ${({ theme }) => theme.borderWidth.base} 0 0 ${({ theme }) => theme.colors.border};
`

const StickyTh = styled.th<{ $compact?: boolean }>`
  padding: ${({ theme, $compact }) =>
    $compact
      ? `${theme.spacing['3']} ${theme.spacing['2']}`
      : `${theme.spacing['3']} ${theme.spacing['4']}`};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
  z-index: 2;
  background: ${({ theme }) => theme.colors.backgroundSubtle};
  ${({ $compact }) => $compact && 'width: 1%;'}
  ${stickyRight}
`

const Td = styled.td<{ $align?: 'left' | 'center' | 'right' }>`
  padding: ${({ theme }) => theme.spacing['3']} ${({ theme }) => theme.spacing['4']};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  border-bottom: ${({ theme }) => theme.borderWidth.base} solid ${({ theme }) => theme.colors.border};
  white-space: nowrap;
  vertical-align: middle;
  text-align: ${({ $align }) => $align ?? 'center'};
`

const StickyTd = styled.td<{ $compact?: boolean }>`
  padding: ${({ theme, $compact }) =>
    $compact
      ? `${theme.spacing['2']} ${theme.spacing['2']}`
      : `${theme.spacing['3']} ${theme.spacing['4']}`};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  border-bottom: ${({ theme }) => theme.borderWidth.base} solid ${({ theme }) => theme.colors.border};
  white-space: nowrap;
  vertical-align: middle;
  text-align: center;
  background: ${({ theme }) => theme.colors.background};
  ${stickyRight}
`

const FundName = styled.span`
  display: block;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
`

const FundSymbol = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: ${({ theme }) => theme.spacing['0.5']};
`

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`

const SkeletonBlock = styled.span<{ $width?: string }>`
  display: block;
  height: ${({ theme }) => theme.spacing['3']};
  width: ${({ $width }) => $width ?? '100%'};
  background: ${({ theme }) => theme.colors.backgroundSubtle};
  border-radius: ${({ theme }) => theme.radii.sm};

  @media (prefers-reduced-motion: no-preference) {
    animation: ${pulse} 1.5s ease-in-out infinite;
  }
`

const ErrorCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['3']};
  padding: ${({ theme }) => theme.spacing['8']} ${({ theme }) => theme.spacing['4']};
  border: ${({ theme }) => theme.borderWidth.base} solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: center;
`

const RetryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['1']};
  padding: ${({ theme }) => theme.spacing['2']} ${({ theme }) => theme.spacing['4']};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textInverse};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};

  @media (prefers-reduced-motion: no-preference) {
    transition: opacity ${({ theme }) => theme.transitions.fast};
  }

  &:hover { opacity: 0.9; }

  &:focus-visible {
    outline: ${({ theme }) => theme.focus.ringWidth} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.ringOffset};
    border-radius: ${({ theme }) => theme.radii.md};
  }
`

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <tr key={i}>
          <Td $align="left"><SkeletonBlock $width="9rem" /></Td>
          <Td><SkeletonBlock $width="4.5rem" /></Td>
          <Td><SkeletonBlock $width="4rem" /></Td>
          <Td><SkeletonBlock $width="3.5rem" /></Td>
          <Td><SkeletonBlock $width="3.5rem" /></Td>
          <Td><SkeletonBlock $width="3.5rem" /></Td>
          <Td><SkeletonBlock $width="3.5rem" /></Td>
          <StickyTd $compact><SkeletonBlock $width="1.5rem" /></StickyTd>
        </tr>
      ))}
    </>
  )
}

function FundRow({ fund, onBuy }: { fund: Fund; onBuy: (fund: Fund) => void }) {
  return (
    <tr>
      <Td $align="left">
        <FundName>{fund.name}</FundName>
        <FundSymbol>{fund.symbol}</FundSymbol>
      </Td>
      <Td><Badge label={fund.category} variant={fund.category} /></Td>
      <Td>{formatMoney(fund.value.amount, fund.value.currency)}</Td>
      <Td><ProfitabilityCell value={fund.profitability.YTD} /></Td>
      <Td><ProfitabilityCell value={fund.profitability.oneYear} /></Td>
      <Td><ProfitabilityCell value={fund.profitability.threeYears} /></Td>
      <Td><ProfitabilityCell value={fund.profitability.fiveYears} /></Td>
      <StickyTd $compact>
        <ActionsMenu fundId={fund.id} fundName={fund.name} onBuy={() => onBuy(fund)} />
      </StickyTd>
    </tr>
  )
}

export function FundsTable() {
  const [page, setPage] = useState(1)
  const { sort, toggleSort } = useSortState<SortField>()
  const buyDisclosure = useDisclosure()
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null)
  const { recordBuy } = useOrderHistory()

  function handleBuy(fund: Fund) {
    setSelectedFund(fund)
    buyDisclosure.open()
  }

  const { data, isLoading, isPlaceholderData, isError, refetch } = useFunds(page, sort)

  function handleSort(field: SortField) {
    toggleSort(field)
    setPage(1)
  }

  if (isError) {
    return (
      <Section>
        <ErrorCard role="alert">
          <AlertCircle size={24} aria-hidden="true" />
          <p>No se pudo cargar el listado de fondos.<br />Comprueba tu conexión e inténtalo de nuevo.</p>
          <RetryButton onClick={() => refetch()}>
            <RefreshCw size={14} aria-hidden="true" />
            Reintentar
          </RetryButton>
        </ErrorCard>
      </Section>
    )
  }

  return (
    <Section>
      <ScrollWrapper $stale={isPlaceholderData}>
        <Table
          aria-label="Listado de fondos de inversión"
          aria-busy={isLoading}
        >
          <Thead>
            <tr>
              <SortableHeader label="Nombre"    field="name"                       currentSort={sort} onSort={handleSort} align="left" />
              <SortableHeader label="Categoría" field="category"                   currentSort={sort} onSort={handleSort} align="center" />
              <SortableHeader label="Valor liq." field="value"                     currentSort={sort} onSort={handleSort} align="center" />
              <SortableHeader label="YTD"        field="profitability.YTD"         currentSort={sort} onSort={handleSort} align="center" />
              <SortableHeader label="1A"         field="profitability.oneYear"     currentSort={sort} onSort={handleSort} align="center" />
              <SortableHeader label="3A"         field="profitability.threeYears"  currentSort={sort} onSort={handleSort} align="center" />
              <SortableHeader label="5A"         field="profitability.fiveYears"   currentSort={sort} onSort={handleSort} align="center" />
              <StickyTh $compact scope="col">Acciones</StickyTh>
            </tr>
          </Thead>
          <tbody>
            {isLoading
              ? <SkeletonRows />
              : data?.data.map(fund => <FundRow key={fund.id} fund={fund} onBuy={handleBuy} />)
            }
          </tbody>
        </Table>
      </ScrollWrapper>

      {data?.pagination && (
        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={p => setPage(p)}
        />
      )}

      {selectedFund && (
        <BuyDialog
          fund={selectedFund}
          isOpen={buyDisclosure.isOpen}
          onClose={buyDisclosure.close}
          onSuccess={({ amount, quantity }) =>
            recordBuy({
              fundId: selectedFund.id,
              fundName: selectedFund.name,
              amount,
              currency: selectedFund.value.currency,
              quantity,
            })
          }
        />
      )}
    </Section>
  )
}
