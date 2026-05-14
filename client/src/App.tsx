import logoUrl from '@/assets/logo.svg';
import type { AppView } from '@/components/organisms/AppNav';
import { AppNav } from '@/components/organisms/AppNav';
import { ToastProvider } from '@/components/organisms/ToastProvider';
import { FundsTable } from '@/features/funds/components/FundsTable';
import { PortfolioView } from '@/features/portfolio/components/PortfolioView';
import { GlobalStyle } from '@/styles/global';
import { theme } from '@/styles/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    to bottom,
    ${({ theme }) => theme.colors.backgroundHero} 0%,
    ${({ theme }) => theme.colors.background} 28vh
  );
`;

const MobileHero = styled.div`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing['10']} ${({ theme }) => theme.spacing['4']}
    ${({ theme }) => theme.spacing['6']};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const LogoImg = styled.img`
  height: ${({ theme }) => theme.sizes.logoHeight};
  width: auto;
`;

const ContentArea = styled.div`
  padding: ${({ theme }) => theme.spacing['4']};
  padding-bottom: calc(
    ${({ theme }) => theme.sizes.bottomNavHeight} + ${({ theme }) => theme.spacing['4']}
  );

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    /* sidebar left-offset (spacing[4]) + sidebar width + gap (spacing[4]) */
    margin-left: calc(
      ${({ theme }) => theme.spacing['4']} + ${({ theme }) => theme.sizes.sidebarWidth} +
        ${({ theme }) => theme.spacing['4']}
    );
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: ${({ theme }) => theme.spacing['6']} ${({ theme }) => theme.spacing['6']}
      ${({ theme }) => theme.spacing['12']};

    & > * {
      width: 100%;
      max-width: ${({ theme }) => theme.sizes.contentMaxWidth};
    }
  }
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing['6']};
`;

function App() {
  const [currentView, setCurrentView] = useState<AppView>('funds');

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <ToastProvider>
          <PageWrapper>
            <AppNav currentView={currentView} onNavigate={setCurrentView} />
            <MobileHero>
              <LogoImg src={logoUrl} alt="myInvestor" />
            </MobileHero>
            <ContentArea>
              <PageTitle>
                {currentView === 'funds' ? 'Fondos de inversión' : 'Mi Cartera'}
              </PageTitle>
              {currentView === 'funds' ? <FundsTable /> : <PortfolioView />}
            </ContentArea>
          </PageWrapper>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
