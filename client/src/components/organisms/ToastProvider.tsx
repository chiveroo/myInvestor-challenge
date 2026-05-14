import { useCallback, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes } from 'styled-components'
import { ToastContext } from '@/context/toastContext'
import type { AddToast, ToastItem, ToastVariant } from '@/context/toastContext'

// ── Styles ────────────────────────────────────────────────────────────────────

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(0.5rem); }
  to   { opacity: 1; transform: translateY(0); }
`

const ToastList = styled.ol`
  position: fixed;
  bottom: calc(${({ theme }) => theme.sizes.bottomNavHeight} + ${({ theme }) => theme.spacing['4']});
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['2']};
  list-style: none;
  z-index: ${({ theme }) => theme.zIndex.toast};
  pointer-events: none;
  width: max-content;
  max-width: calc(100vw - ${({ theme }) => theme.spacing['8']});

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    bottom: ${({ theme }) => theme.spacing['6']};
    left: calc(
      ${({ theme }) => theme.spacing['4']} + ${({ theme }) => theme.sizes.sidebarWidth} +
        ${({ theme }) => theme.spacing['4']}
    );
    transform: none;
  }
`

const ToastEl = styled.li<{ $variant: ToastVariant }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2']};
  padding: ${({ theme }) => theme.spacing['3']} ${({ theme }) => theme.spacing['4']};
  background: ${({ theme, $variant }) => theme.colors.toast[$variant].bg};
  color: ${({ theme, $variant }) => theme.colors.toast[$variant].text};
  border: ${({ theme }) => theme.borderWidth.base} solid
    ${({ theme, $variant }) => theme.colors.toast[$variant].border};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  box-shadow: ${({ theme }) => theme.shadows.md};
  pointer-events: auto;
  white-space: nowrap;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${slideIn} ${({ theme }) => theme.transitions.normal} ease both;
  }
`

// ── Provider ──────────────────────────────────────────────────────────────────

const TOAST_DURATION_MS = 4_000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback<AddToast>((message, variant = 'info') => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, TOAST_DURATION_MS)
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {createPortal(
        <ToastList
          aria-live={toasts.some(t => t.variant === 'error') ? 'assertive' : 'polite'}
          aria-atomic="false"
        >
          {toasts.map(t => (
            <ToastEl
              key={t.id}
              $variant={t.variant}
              role={t.variant === 'error' ? 'alert' : 'status'}
            >
              {t.message}
            </ToastEl>
          ))}
        </ToastList>,
        document.body
      )}
    </ToastContext.Provider>
  )
}
