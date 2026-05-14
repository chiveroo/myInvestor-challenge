import { IconButton } from '@/components/atoms/IconButton';
import { MoreVertical, ShoppingCart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { useTheme } from 'styled-components';

interface ActionsMenuProps {
  fundId: string;
  fundName: string;
  onBuy?: (fundId: string) => void;
}

interface PopoverPos {
  top?: number;
  bottom?: number;
  right: number;
}

const Wrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

// position: fixed escapes all overflow containers and stacking contexts
const Popover = styled.ul<{ $pos: PopoverPos }>`
  position: fixed;
  right: ${({ $pos }) => $pos.right}px;
  ${({ $pos }) => ($pos.top !== undefined ? `top: ${$pos.top}px;` : '')}
  ${({ $pos }) => ($pos.bottom !== undefined ? `bottom: ${$pos.bottom}px;` : '')}
  min-width: ${({ theme }) => theme.sizes.dropdownMinWidth};
  background: ${({ theme }) => theme.colors.background};
  border: ${({ theme }) => theme.borderWidth.base} solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing['1']} ${({ theme }) => theme.spacing['0']};
`;

const MenuItem = styled.li``;

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
`;

const POPOVER_HEIGHT_APPROX = 44; // ~1 item × 44px
const GAP_PX = 4; // spacing['1'] = 0.25rem = 4px

export function ActionsMenu({ fundId, fundName, onBuy }: ActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopoverPos>({ right: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLUListElement>(null);
  const theme = useTheme();
  const iconSize = theme.iconSize.md;

  function handleToggle() {
    if (!open && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const right = window.innerWidth - rect.right;
      // Prefer upward; fall back to downward only when not enough space above
      if (rect.top >= POPOVER_HEIGHT_APPROX) {
        setPos({ bottom: window.innerHeight - rect.top + GAP_PX, right });
      } else {
        setPos({ top: rect.bottom + GAP_PX, right });
      }
    }
    setOpen((v) => !v);
  }

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const insideWrapper = wrapperRef.current?.contains(target) ?? false;
      const insidePopover = popoverRef.current?.contains(target) ?? false;
      if (!insideWrapper && !insidePopover) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // capture:true catches scroll on any element (including the overflow table wrapper)
    function handleScroll() {
      setOpen(false);
    }
    window.addEventListener('scroll', handleScroll, { capture: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, [open]);

  return (
    <Wrapper ref={wrapperRef}>
      <IconButton
        aria-label={`Acciones para ${fundName}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={handleToggle}
      >
        <MoreVertical size={iconSize} />
      </IconButton>

      {open &&
        createPortal(
          <Popover
            ref={popoverRef}
            $pos={pos}
            role="menu"
            aria-label={`Menú de acciones para ${fundName}`}
          >
            <MenuItem role="none">
              <MenuButton
                role="menuitem"
                onClick={() => {
                  onBuy?.(fundId);
                  setOpen(false);
                }}
              >
                <ShoppingCart size={iconSize} aria-hidden="true" />
                Comprar
              </MenuButton>
            </MenuItem>
          </Popover>,
          document.body
        )}
    </Wrapper>
  );
}
