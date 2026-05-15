import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import type { FC, PropsWithChildren } from 'react'
import { useOrderHistory } from '../hooks/useOrderHistory'
import { ORDERS_STORAGE_KEY } from '../keys'

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const Wrapper: FC<PropsWithChildren> = ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )

  return Wrapper
}

describe('useOrderHistory', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('returns empty history by default', () => {
    const { result } = renderHook(() => useOrderHistory(), { wrapper: createWrapper() })
    expect(result.current.orders).toEqual([])
  })

  it('loads persisted history', async () => {
    window.localStorage.setItem(
      ORDERS_STORAGE_KEY,
      JSON.stringify([{ id: '1', createdAt: '2026-01-01T10:00:00.000Z', type: 'buy', fundId: 'f1', fundName: 'Fund 1', amount: 100, currency: 'EUR' }])
    )

    const { result } = renderHook(() => useOrderHistory(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.orders).toHaveLength(1))
  })

  it('persists buy/sell/transfer with newest first', async () => {
    vi
      .spyOn(globalThis.crypto, 'randomUUID')
      .mockReturnValueOnce('00000000-0000-0000-0000-000000000001')
      .mockReturnValueOnce('00000000-0000-0000-0000-000000000002')
      .mockReturnValueOnce('00000000-0000-0000-0000-000000000003')

    const { result } = renderHook(() => useOrderHistory(), { wrapper: createWrapper() })

    act(() => {
      result.current.recordBuy({ fundId: 'f1', fundName: 'Fund 1', amount: 100, currency: 'EUR', quantity: 1 })
      result.current.recordSell({ fundId: 'f2', fundName: 'Fund 2', amount: 200, currency: 'EUR', quantity: 2 })
      result.current.recordTransfer({
        fundId: 'f3',
        fundName: 'Fund 3',
        quantity: 3.5,
        destinationFundId: 'f4',
        destinationFundName: 'Fund 4',
      })
    })

    const persisted = JSON.parse(window.localStorage.getItem(ORDERS_STORAGE_KEY) ?? '[]')
    expect(persisted.map((order: { id: string }) => order.id)).toEqual([
      '00000000-0000-0000-0000-000000000003',
      '00000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000001',
    ])
    expect(persisted[0]).toMatchObject({ type: 'transfer', quantity: 3.5, destinationFundName: 'Fund 4' })
    expect(persisted).toHaveLength(3)
  })

  it('clears orders', () => {
    const { result } = renderHook(() => useOrderHistory(), { wrapper: createWrapper() })

    act(() => {
      result.current.recordBuy({ fundId: 'f1', fundName: 'Fund 1', amount: 100, currency: 'EUR' })
      result.current.clearOrders()
    })

    expect(result.current.orders).toEqual([])
    expect(window.localStorage.getItem(ORDERS_STORAGE_KEY)).toBe('[]')
  })

  it('returns empty when localStorage is invalid json', () => {
    window.localStorage.setItem(ORDERS_STORAGE_KEY, '{invalid')
    const { result } = renderHook(() => useOrderHistory(), { wrapper: createWrapper() })
    expect(result.current.orders).toEqual([])
  })
})
