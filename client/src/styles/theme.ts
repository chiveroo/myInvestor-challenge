export const theme = {
  colors: {
    primary: '#3B6BCB',
    primaryHover: '#2D5CC2',

    background: '#FFFFFF',
    backgroundSubtle: '#F5F5F7',
    backgroundOverlay: 'rgba(0, 0, 0, 0.4)',

    text: '#1A1A1A',
    textSecondary: '#6B6B6B',
    textMuted: '#9E9E9E',
    textInverse: '#FFFFFF',

    border: '#E8E8E8',
    borderStrong: '#CCCCCC',

    positive: '#43AE96',
    negative: '#E84040',
    neutral: '#9E9E9E',

    // Category badge colors — WCAG AA contrast verified
    category: {
      GLOBAL: { bg: '#EBF0FB', text: '#2D5CC2' },
      TECH: { bg: '#F0EBFB', text: '#6B3FC5' },
      HEALTH: { bg: '#EBFBF3', text: '#1E8C5A' },
      MONEY_MARKET: { bg: '#FBF7EB', text: '#8C6B1E' },
      default: { bg: '#F0F0F0', text: '#5A5A5A' },
    },
  },

  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.8125rem', // 13px
      base: '0.875rem', // 14px
      md: '1rem',      // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
    },
  },

  spacing: {
    '0': '0',
    '1': '0.25rem',
    '2': '0.5rem',
    '3': '0.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '8': '2rem',
    '10': '2.5rem',
    '12': '3rem',
    '16': '4rem',
  },

  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
    md: '0 4px 12px rgba(0, 0, 0, 0.10)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },

  breakpoints: {
    sm: '480px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },

  zIndex: {
    dropdown: 100,
    modal: 200,
    toast: 300,
  },
} as const

export type Theme = typeof theme
