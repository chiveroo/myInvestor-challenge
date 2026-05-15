import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ordersKeys, ORDERS_STORAGE_KEY } from '../keys'
import type { BuyOrderHistoryEntry, OrderHistoryEntry, SellOrderHistoryEntry, TransferOrderHistoryEntry } from '@/types'

function loadOrders(): OrderHistoryEntry[] {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as OrderHistoryEntry[]) : []
  } catch {
    return []
  }
}

function persistOrders(orders: OrderHistoryEntry[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
}

function prependOrder(current: OrderHistoryEntry[] | undefined, next: OrderHistoryEntry): OrderHistoryEntry[] {
  return [next, ...(current ?? [])]
}

export function useOrderHistory() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ordersKeys.history(),
    queryFn: loadOrders,
    staleTime: Number.POSITIVE_INFINITY,
  })

  function updateOrders(updater: (current: OrderHistoryEntry[]) => OrderHistoryEntry[]) {
    queryClient.setQueryData<OrderHistoryEntry[]>(ordersKeys.history(), current => {
      const base = current ?? []
      const next = updater(base)
      persistOrders(next)
      return next
    })
  }

  function recordBuy(order: Omit<BuyOrderHistoryEntry, 'id' | 'createdAt' | 'type'>) {
    const entry: BuyOrderHistoryEntry = {
      ...order,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      type: 'buy',
    }

    updateOrders(current => prependOrder(current, entry))
  }

  function recordSell(order: Omit<SellOrderHistoryEntry, 'id' | 'createdAt' | 'type'>) {
    const entry: SellOrderHistoryEntry = {
      ...order,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      type: 'sell',
    }

    updateOrders(current => prependOrder(current, entry))
  }

  function recordTransfer(order: Omit<TransferOrderHistoryEntry, 'id' | 'createdAt' | 'type'>) {
    const entry: TransferOrderHistoryEntry = {
      ...order,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      type: 'transfer',
    }

    updateOrders(current => prependOrder(current, entry))
  }

  function clearOrders() {
    updateOrders(() => [])
  }

  return {
    orders: query.data ?? [],
    recordBuy,
    recordSell,
    recordTransfer,
    clearOrders,
  }
}
