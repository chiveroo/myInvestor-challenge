import { createContext } from 'react'

export type ToastVariant = 'info' | 'success' | 'error'

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

export type AddToast = (message: string, variant?: ToastVariant) => void

export const ToastContext = createContext<AddToast | null>(null)
