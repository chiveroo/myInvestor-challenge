import { theme } from '@/styles/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

export function renderWithProviders(ui: ReactNode, options?: Omit<RenderOptions, 'wrapper'>) {
  const queryClient = createQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
