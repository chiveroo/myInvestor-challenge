import styled from 'styled-components'
import { formatMoney } from '@/utils/format'
import type { OrderHistoryEntry } from '@/types'

interface OrdersTabProps {
  orders: OrderHistoryEntry[]
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))

const formatQuantity = (quantity: number) =>
  new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(quantity)

const ORDER_LABELS: Record<OrderHistoryEntry['type'], string> = {
  buy: 'Compra',
  sell: 'Venta',
  transfer: 'Traspaso',
}

export function OrdersTab({ orders }: OrdersTabProps) {
  if (orders.length === 0) {
    return (
      <EmptyState role="status" aria-live="polite">
        Aún no hay órdenes registradas.
      </EmptyState>
    )
  }

  return (
    <Wrapper>
      <Header>
        <Title>Historial de órdenes</Title>
      </Header>

      <List aria-label="Historial de órdenes">
        {orders.map(order => (
          <ListItem key={order.id}>
            <TopRow>
              <OrderBadge $type={order.type}>{ORDER_LABELS[order.type]}</OrderBadge>
              <DateText>{formatDate(order.createdAt)}</DateText>
            </TopRow>

            <MainText>{order.fundName}</MainText>

            {order.type === 'transfer' ? (
              <DetailText>
                {formatQuantity(order.quantity)} participaciones a {order.destinationFundName}
              </DetailText>
            ) : (
              <DetailText>{formatMoney(order.amount, order.currency)}</DetailText>
            )}
          </ListItem>
        ))}
      </List>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['4']};
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['3']};
`

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['3']};
  list-style: none;
  padding: 0;
  margin: 0;
`

const ListItem = styled.li`
  background: ${({ theme }) => theme.colors.background};
  border: ${({ theme }) => theme.borderWidth.base} solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing['4']};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`

const OrderBadge = styled.span<{ $type: OrderHistoryEntry['type'] }>`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing['0.5']} ${({ theme }) => theme.spacing['2']};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  white-space: nowrap;
  background: ${({ theme, $type }) => {
    if ($type === 'buy') return theme.colors.toast.success.bg
    if ($type === 'sell') return theme.colors.toast.error.bg
    return theme.colors.toast.info.bg
  }};
  color: ${({ theme, $type }) => {
    if ($type === 'buy') return theme.colors.toast.success.text
    if ($type === 'sell') return theme.colors.toast.error.text
    return theme.colors.toast.info.text
  }};
  border: ${({ theme, $type }) => {
    if ($type === 'buy') return `${theme.borderWidth.base} solid ${theme.colors.toast.success.border}`
    if ($type === 'sell') return `${theme.borderWidth.base} solid ${theme.colors.toast.error.border}`
    return `${theme.borderWidth.base} solid ${theme.colors.toast.info.border}`
  }};
`

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2']};
`

const DateText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`

const MainText = styled.p`
  margin-top: ${({ theme }) => theme.spacing['3']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`

const DetailText = styled.p`
  margin-top: ${({ theme }) => theme.spacing['1']};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const EmptyState = styled.p`
  padding: ${({ theme }) => theme.spacing['6']};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: ${({ theme }) => theme.borderWidth.base} dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
`
