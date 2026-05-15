export const ordersKeys = {
  all: ['orders'] as const,
  history: () => [...ordersKeys.all, 'history'] as const,
}

export const ORDERS_STORAGE_KEY = 'myinvestor_orders'
