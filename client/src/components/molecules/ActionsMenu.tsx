import { IconButton } from '@/components/atoms/IconButton';
import { MoreVertical, ShoppingCart } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { useTheme } from 'styled-components';

export interface ActionsMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
}

interface ActionsMenuProps {
  triggerLabel?: string;
  menuLabel?: string;
  helperText?: string;
  items?: ActionsMenuItem[];
  fundId?: string;
  fundName?: string;
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

  &:disabled {
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: not-allowed;
  }

  &:disabled:hover {
    background-color: transparent;
  }

  &:focus-visible {
    outline: ${({ theme }) => theme.focus.ringWidth} solid ${({ theme }) => theme.colors.primary};
    outline-offset: -${({ theme }) => theme.focus.ringOffset};
  }
`;

const HelperItem = styled.li`
  padding: ${({ theme }) => theme.spacing['2']} ${({ theme }) => theme.spacing['4']};
  border-top: ${({ theme }) => theme.borderWidth.base} solid ${({ theme }) => theme.colors.border};
`;

const HelperText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

function getPxFromToken(token: string) {
  if (token.endsWith('rem')) {
    return Number.parseFloat(token) * 16;
  }

  if (token.endsWith('px')) {
    return Number.parseFloat(token);
  }

  return Number.parseFloat(token) || 0;
}

function useMenuGapPx() {
  const theme = useTheme();

  return getPxFromToken(theme.spacing['1']);
}

export function ActionsMenu({
  triggerLabel,
  menuLabel,
  helperText,
  items,
  fundId,
  fundName,
  onBuy,
}: ActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopoverPos>({ right: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLUListElement>(null);
  const theme = useTheme();
  const iconSize = theme.iconSize.md;
  const gapPx = useMenuGapPx();

  const resolvedTriggerLabel = triggerLabel ?? `Acciones para ${fundName}`;
  const resolvedMenuLabel = menuLabel ?? `Menú de acciones para ${fundName}`;
  const resolvedItems = useMemo<ActionsMenuItem[]>(() => {
    if (items?.length) {
      return items;
    }

    if (!fundName) {
      return [];
    }

    return [
      {
        key: 'buy',
        label: 'Comprar',
        icon: <ShoppingCart size={iconSize} aria-hidden="true" />,
        onSelect: () => {
          if (fundId) {
            onBuy?.(fundId);
          }
        },
      },
    ];
  }, [fundId, fundName, iconSize, items, onBuy]);

  function handleToggle() {
    setOpen((value) => !value);
  }

  useEffect(() => {
    if (!open) return;

    if (!wrapperRef.current || !popoverRef.current) {
      return;
    }

    const rect = wrapperRef.current.getBoundingClientRect();
    const popoverHeight = popoverRef.current.getBoundingClientRect().height;
    const right = window.innerWidth - rect.right;

    if (rect.top >= popoverHeight + gapPx) {
      setPos({ bottom: window.innerHeight - rect.top + gapPx, right });
      return;
    }

    setPos({ top: rect.bottom + gapPx, right });
  }, [gapPx, open]);

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
        aria-label={resolvedTriggerLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={handleToggle}
      >
        <MoreVertical size={iconSize} />
      </IconButton>

      {open &&
        createPortal(
          <Popover ref={popoverRef} $pos={pos} role="menu" aria-label={resolvedMenuLabel}>
            {resolvedItems.map((item) => (
              <MenuItem key={item.key} role="none">
                <MenuButton
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) {
                      return;
                    }

                    item.onSelect?.();
                    setOpen(false);
                  }}
                >
                  {item.icon}
                  {item.label}
                </MenuButton>
              </MenuItem>
            ))}

            {helperText ? (
              <HelperItem role="none">
                <HelperText>{helperText}</HelperText>
              </HelperItem>
            ) : null}
          </Popover>,
          document.body
        )}
    </Wrapper>
  );
}
