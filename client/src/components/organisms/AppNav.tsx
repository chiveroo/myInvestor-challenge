import styled from 'styled-components'
import { useTheme } from 'styled-components'
import { BarChart2, Wallet } from 'lucide-react'
import logoUrl from '@/assets/logo.svg'

interface NavItem {
  label: string
  icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' }>
  href: string
  active?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Fondos', icon: BarChart2, href: '#fondos', active: true },
  { label: 'Cartera', icon: Wallet, href: '#cartera' },
]

// ── Atoms ─────────────────────────────────────────────────────────────────────

const LogoImg = styled.img`
  height: ${({ theme }) => theme.sizes.logoHeight};
  width: auto;
`

// ── Desktop floating sidebar ──────────────────────────────────────────────────

const Sidebar = styled.nav`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: ${({ theme }) => theme.spacing['6']};
    left: ${({ theme }) => theme.spacing['4']};
    width: ${({ theme }) => theme.sizes.sidebarWidth};
    background: ${({ theme }) => theme.colors.background};
    border-radius: ${({ theme }) => theme.radii.xl};
    box-shadow: ${({ theme }) => theme.shadows.md};
    padding: ${({ theme }) => theme.spacing['4']} ${({ theme }) => theme.spacing['3']};
    gap: ${({ theme }) => theme.spacing['1']};
    z-index: ${({ theme }) => theme.zIndex.nav};
  }
`

const SidebarLogoWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  padding: ${({ theme }) => theme.spacing['1']} ${({ theme }) => theme.spacing['2']}
    ${({ theme }) => theme.spacing['4']};
  border-bottom: ${({ theme }) => theme.borderWidth.base} solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing['2']};
`

const SidebarItem = styled.a<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['3']};
  padding: ${({ theme }) => theme.spacing['3']};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.textSecondary)};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme, $active }) =>
    $active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme, $active }) => ($active ? theme.colors.backgroundHero : 'transparent')};

  @media (prefers-reduced-motion: no-preference) {
    transition: background-color ${({ theme }) => theme.transitions.fast},
      color ${({ theme }) => theme.transitions.fast};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundSubtle};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: ${({ theme }) => theme.focus.ringWidth} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.ringOffset};
    border-radius: ${({ theme }) => theme.radii.md};
  }
`

// ── Mobile bottom nav ─────────────────────────────────────────────────────────

const BottomNav = styled.nav`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing['4']};
  left: ${({ theme }) => theme.spacing['4']};
  right: ${({ theme }) => theme.spacing['4']};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.full};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  display: flex;
  align-items: stretch;
  padding: ${({ theme }) => theme.spacing['1']};
  z-index: ${({ theme }) => theme.zIndex.nav};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`

const BottomNavItem = styled.a<{ $active?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing['0.5']};
  padding: ${({ theme }) => theme.spacing['2']} ${({ theme }) => theme.spacing['1']};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme, $active }) => ($active ? theme.colors.backgroundHero : 'transparent')};

  @media (prefers-reduced-motion: no-preference) {
    transition: color ${({ theme }) => theme.transitions.fast},
      background-color ${({ theme }) => theme.transitions.fast};
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: ${({ theme }) => theme.focus.ringWidth} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.ringOffset};
  }
`

// ── Component ─────────────────────────────────────────────────────────────────

export function AppNav() {
  const theme = useTheme()

  return (
    <>
      <Sidebar aria-label="Navegación principal">
        <SidebarLogoWrapper>
          <LogoImg src={logoUrl} alt="myInvestor" />
        </SidebarLogoWrapper>
        {NAV_ITEMS.map(({ label, icon: Icon, href, active }) => (
          <SidebarItem key={label} href={href} $active={active}>
            <Icon size={theme.iconSize.md} aria-hidden={true} />
            {label}
          </SidebarItem>
        ))}
      </Sidebar>

      <BottomNav aria-label="Navegación principal">
        {NAV_ITEMS.map(({ label, icon: Icon, href, active }) => (
          <BottomNavItem key={label} href={href} $active={active}>
            <Icon size={theme.iconSize.lg} aria-hidden={true} />
            {label}
          </BottomNavItem>
        ))}
      </BottomNav>
    </>
  )
}
