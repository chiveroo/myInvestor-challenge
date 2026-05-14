import { IconButton } from '@/components/atoms/IconButton';
import { X } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import styled, { css, keyframes, useTheme } from 'styled-components';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  'aria-label'?: string;
}

const ANIMATION_MS = 220;

export function Dialog({ isOpen, onClose, title, children, 'aria-label': ariaLabel }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [animatingOut, setAnimatingOut] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      const raf = requestAnimationFrame(() => setAnimatingOut(true));
      const timer = setTimeout(() => {
        dialog.close();
        setAnimatingOut(false);
      }, ANIMATION_MS);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === ref.current) onClose();
  }

  return (
    <StyledDialog
      ref={ref}
      aria-label={ariaLabel ?? title}
      aria-modal="true"
      $closing={animatingOut}
      onClick={handleBackdropClick}
    >
      <Header>
        <Title>{title}</Title>
        <IconButton aria-label="Cerrar diálogo" onClick={onClose}>
          <X size={theme.iconSize.md} />
        </IconButton>
      </Header>
      <Body>{children}</Body>
    </StyledDialog>
  );
}

// ── Animations ────────────────────────────────────────────────────────────────

const fadeScaleIn = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

const fadeScaleOut = keyframes`
  from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  to   { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
`;

const backdropIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const backdropOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

// ── Styled ────────────────────────────────────────────────────────────────────

const StyledDialog = styled.dialog<{ $closing: boolean }>`
  padding: 0;
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  max-width: min(90vw, 480px);
  width: 100%;
  background: ${({ theme }) => theme.colors.background};

  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${({ $closing }) =>
      $closing
        ? css`
            ${fadeScaleOut} ${ANIMATION_MS}ms ease forwards
          `
        : css`
            ${fadeScaleIn} ${ANIMATION_MS}ms ease forwards
          `};
  }

  &::backdrop {
    background: ${({ theme }) => theme.colors.backgroundOverlay};
    backdrop-filter: blur(2px);

    @media (prefers-reduced-motion: no-preference) {
      animation: ${({ $closing }) =>
        $closing
          ? css`
              ${backdropOut} ${ANIMATION_MS}ms ease forwards
            `
          : css`
              ${backdropIn} ${ANIMATION_MS}ms ease forwards
            `};
    }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing['5']} ${theme.spacing['6']}`};
  border-bottom: ${({ theme }) => theme.borderWidth.base} solid
    ${({ theme }) => theme.colors.border};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const Body = styled.div`
  padding: ${({ theme }) => theme.spacing['6']};
`;
