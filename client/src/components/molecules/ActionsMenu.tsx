import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Eye, MoreVertical, ShoppingCart } from 'lucide-react'
import { useTheme } from 'styled-components'
import { IconButton } from '@/components/atoms/IconButton'

interface ActionsMenuProps {
  fundId: string
  fundName: string
  onBuy?: (fundId: string) => void
}

const Wrapper = styled.div`
  position: relative;
`

const Popover = styled.ul`
  position: absolute;
  right: 0;
  top: calc(100% + ${({ theme }) => theme.spacing['1']});
  min-width: ${({ theme }) => theme.sizes.dropdownMinWidth};
  background: ${({ theme }) => theme.colors.background};
  border: ${({ theme }) => theme.borderWidth.base} solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing['1']} ${({ theme }) => theme.spacing['0']};
`

const MenuItem = styled.li``

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2']};
  width: 100%;
  padding: ${({ theme }) => theme.spacing['2']} ${({ theme }) => theme.spacing['4']};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.primary};
  text-align: left;

  @media (prefers-reduced-motion: no-preference) {
    transition: background-color ${({ theme }) => theme.transitions.fast};
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundSubtle};
  }

  &:focus-visible {
    outline: ${({ theme }) => theme.focus.ringWidth} solid ${({ theme }) => theme.colors.primary};
    outline-offset: -${({ theme }) => theme.focus.ringOffset};
  }
`

export function ActionsMenu({ fundId, fundName, onBuy }: ActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const theme = useTheme()
  const iconSize = theme.iconSize.md

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open])

  return (
    <Wrapper ref={wrapperRef}>
      <IconButton
        aria-label={`Acciones para ${fundName}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(v => !v)}
      >
        <MoreVertical size={iconSize} />
      </IconButton>

      {open && (
        <Popover role="menu" aria-label={`Menú de acciones para ${fundName}`}>
          <MenuItem role="none">
            <MenuButton
              role="menuitem"
              onClick={() => { onBuy?.(fundId); setOpen(false) }}
            >
              <ShoppingCart size={iconSize} aria-hidden="true" />
              Comprar
            </MenuButton>
          </MenuItem>
          <MenuItem role="none">
            <MenuButton
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <Eye size={iconSize} aria-hidden="true" />
              Ver detalle
            </MenuButton>
          </MenuItem>
        </Popover>
      )}
    </Wrapper>
  )
}
