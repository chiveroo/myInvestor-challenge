import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    -webkit-text-size-adjust: 100%;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    text-wrap: balance;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  ul, ol {
    list-style: none;
  }

  img, svg {
    display: block;
    max-width: 100%;
  }

  input, select, textarea {
    font-family: inherit;
  }

  dialog {
    border: none;
    border-radius: ${({ theme }) => theme.radii.lg};
    padding: 0;
    max-width: 90vw;

    &::backdrop {
      background: ${({ theme }) => theme.colors.backgroundOverlay};
    }
  }

  /* Keyboard focus — WCAG 2.2 SC 2.4.13 */
  :focus {
    outline: none;
  }

  :focus-visible {
    outline: ${({ theme }) => theme.focus.ringWidth} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.ringOffset};
  }

  @media (prefers-reduced-motion: no-preference) {
    html {
      scroll-behavior: smooth;
    }
  }
`
