import { theme } from '@/styles/theme';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from '../Dialog';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

describe('Dialog', () => {
  it('renders title and children when open', () => {
    render(
      <Dialog isOpen onClose={vi.fn()} title="Comprar fondo">
        <p>Contenido</p>
      </Dialog>,
      { wrapper: Wrapper }
    );
    expect(screen.getByText('Comprar fondo')).toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Dialog isOpen onClose={onClose} title="Test">
        <p>body</p>
      </Dialog>,
      { wrapper: Wrapper }
    );
    await user.click(screen.getByRole('button', { name: /cerrar/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('keeps the dialog mounted but closed when isOpen is false', () => {
    const { container } = render(
      <Dialog isOpen={false} onClose={vi.fn()} title="Oculto">
        <p>Invisible</p>
      </Dialog>,
      { wrapper: Wrapper }
    );

    expect(screen.queryByRole('dialog', { name: 'Oculto' })).not.toBeInTheDocument();
    expect(container.querySelector('dialog')).not.toHaveAttribute('open');
  });

  it('has accessible aria-label', () => {
    render(
      <Dialog isOpen onClose={vi.fn()} title="Comprar" aria-label="Comprar fondo">
        <p>body</p>
      </Dialog>,
      { wrapper: Wrapper }
    );
    expect(screen.getByRole('dialog', { name: 'Comprar fondo' })).toBeInTheDocument();
  });
});
