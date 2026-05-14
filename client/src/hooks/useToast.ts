import { useContext } from 'react'
import { ToastContext } from '@/context/toastContext'
import type { AddToast } from '@/context/toastContext'

export function useToast(): AddToast {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
