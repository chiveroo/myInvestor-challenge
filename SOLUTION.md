# 💼 myInvestor — Prueba técnica

Solución a la prueba técnica de Front-end. La aplicación cubre el flujo completo de inversión en fondos: listado, compra, detalle de cartera, venta y traspaso entre fondos.

> El enunciado original sigue disponible en [`README.md`](./README.md).

---

## 🚀 Cómo correr el proyecto

### Requisitos

- **Node** `^24.5.0`
- **Yarn** `^4.5.1` como gestor recomendado, porque el repo incluye `packageManager` y `yarn.lock`.
- El cliente también puede arrancarse con `npm` si se trabaja dentro de `client/`, pero para evitar lockfiles mezclados la ruta reproducible de la entrega es Yarn.

### Pasos

```bash
# 1. Instalar dependencias (raíz)
yarn install

# 2. Levantar el backend (puerto 3000)
yarn start

# 3. En otra terminal, levantar el cliente (puerto 5173)
cd client
yarn dev
```

Abre [http://localhost:5173](http://localhost:5173). El cliente proxea `/api/*` al backend (`http://localhost:3000`), configurado en [`client/vite.config.ts`](./client/vite.config.ts).

### Scripts útiles (en `client/`)

```bash
yarn dev          # Vite dev server
yarn build        # Build de producción
yarn lint         # ESLint
yarn typecheck    # tsc --noEmit
yarn test         # Vitest (unit + integration)
yarn test:watch   # Vitest en modo watch
yarn e2e          # Playwright (smoke + a11y con axe)
```

---

## ✅ Funcionalidades implementadas

### Tarea 1 — Listado de fondos

- Tabla responsive con scroll horizontal en móvil
- ✨ **Bonus:** Paginación
- ✨ **Bonus:** Ordenación asc / desc por columna
- ✨ **Bonus:** Diseño responsive (mobile-first)
- Action menu por fila con la acción "Comprar"

### Tarea 2 — Compra de fondo

- Diálogo modal con valor liquidativo y categoría del fondo
- ✨ **Bonus:** Etiqueta nativa `<dialog>` con `showModal()` — focus trap, Escape y backdrop por el navegador
- ✨ **Bonus:** `CurrencyInput` con formato válido
- ✨ **Bonus:** Validación con Zod
- Mutación con TanStack Query, invalida `fundKeys.lists()` y `portfolioKeys.list()` tras éxito
- Toast de éxito / error

### Tarea 3 — Detalle de cartera

- Pestañas "Fondos" / "Órdenes" (la de Órdenes queda como placeholder — ver mejoras)
- ✨ **Bonus:** Diseño responsive
- Action menu con "Vender" y "Traspasar"

### Tarea 4 — Venta de fondo

- Diálogo modal pre-rellenable con la posición seleccionada
- ✨ **Bonus:** Validación con `buildSellDialogSchema` — máximo = participaciones disponibles, mínimo > 0

### Tarea 5 — Traspaso entre fondos

- Selector del fondo destino (solo fondos ya comprados, excluye el origen)
- ✨ **Bonus:** Validación con `buildTransferDialogSchema` — las 4 reglas:
  - Cantidad > 0
  - Cantidad ≤ posición actual
  - Fondo destino ≠ origen
  - Solo fondos comprados como destino

---

## 🧱 Decisiones técnicas

### Stack

| Capa         | Tecnología                                   | Por qué                                                                            |
| ------------ | -------------------------------------------- | ---------------------------------------------------------------------------------- |
| Framework    | React 19 + Vite 8                            | DX y HMR rápidos; React 19 estable                                                 |
| Lenguaje     | TypeScript 6 + `erasableSyntaxOnly`          | Type-safety fuerte, checks de no-unused y preparación para runtime nativo          |
| Estilos      | styled-components 6                          | Theme tipado, transient props, sin runtime CSS overhead vs alternativas            |
| Server state | TanStack Query 5                             | Cache + invalidación declarativa, `keepPreviousData` para paginación sin parpadeos |
| Formularios  | react-hook-form + Zod                        | Validación type-safe, mínimas re-renders, schemas reutilizables                    |
| Iconos       | lucide-react                                 | SVG tree-shakable, accesible                                                       |
| Tests        | Vitest + Testing Library + MSW               | Unit + integration con red mockeada                                                |
| E2E          | Playwright + axe-core                        | Smoke + auditoría a11y automatizada                                                |

### Arquitectura — Atomic Design

```
src/
├── components/
│   ├── atoms/           # Badge, Button, CurrencyInput, IconButton, SortIcon
│   ├── molecules/       # ActionsMenu, Pagination, ProfitabilityCell, SortableHeader
│   └── organisms/       # AppNav, Dialog, ToastProvider
├── features/
│   ├── funds/           # FundsTable, BuyDialog + hooks/keys
│   └── portfolio/       # PortfolioView, SellDialog, TransferDialog + helpers
├── hooks/               # useDisclosure, useSortState, useToast
├── context/             # toastContext
├── api/                 # client.ts (fetch wrapper), funds.ts, portfolio.ts
├── types/               # Modelos compartidos (Fund, PortfolioPosition, …)
├── styles/              # theme.ts, global.ts, styled.d.ts (module augmentation)
└── utils/               # format.ts
```

**Reglas autoimpuestas:**

- Atoms / molecules **no** contienen lógica de negocio ni llamadas a API
- Cada feature posee su `keys.ts` (query key factory), sus `hooks/` y sus `components/`
- Toda decoración visual sale de `theme.ts` — **cero `px` o colores hardcoded**
- Fast Refresh: cada archivo exporta **solo** componentes O **solo** hooks/types/context (nunca mezcla)

### Design system (`theme.ts`)

Tokens centralizados de:

- Color (incluyendo paleta de toasts y badges de categoría con contraste WCAG AA)
- Spacing (escala 0–16 en `rem`)
- Typography (familia, tamaños, pesos, line-heights)
- Radii, shadows, breakpoints, iconSize, transitions, focus rings, z-index

El theme está **tipado** vía `styled.d.ts` con module augmentation, así styled-components autocompleta `theme.colors.primary` etc.

### Accesibilidad

- Todos los diálogos usan `<dialog>` nativo → focus trap y Escape gratis
- `aria-label`, `aria-modal`, `aria-invalid`, `aria-describedby` en inputs con error
- Toasts con `role="status"` (info/success) y `role="alert"` (error) → `aria-live` polite/assertive
- Iconos decorativos con `aria-hidden="true"`; icon-buttons siempre con `aria-label`
- Focus rings visibles vía `:focus-visible` con tokens dedicados
- Auditoría automatizada con axe-core en Playwright (`tests/e2e/app-smoke.spec.ts`)

### Testing

- **17 archivos** · **99 tests** · `93.57%` statements / `82.31%` branches
- Thresholds en CI: 80 / 75 / 80 / 80 (configurado en `vite.config.ts`)
- Tests semánticos priorizando `getByRole`, `getByLabelText` y `getByText`; `data-testid` queda reservado para casos puntuales de layout responsive donde no hay una señal accesible estable.

---

## 🤔 Qué mejoraría con más tiempo

Por orden de prioridad:

1. **Histórico de órdenes** — La pestaña "Órdenes" del detalle de cartera queda como placeholder. La forma natural sería un `useOrderHistory` hook con persistencia (localStorage o backend), feed cronológico con filtros por tipo (compra/venta/traspaso).

2. **Agrupación por categoría en cartera** — La cartera ya se muestra ordenada alfabéticamente; faltaría enriquecerla con categorías reales sin inferirlas por nombre.

3. **Swipe actions en móvil** — Bonus de la cartera. Implementarlo con un gesture handler tipo `framer-motion` o `react-swipeable`.

4. **Skeleton loaders más finos** — Hoy hay skeleton en la tabla de fondos; faltarían en cartera, en el dialog de compra al precargar el fondo, etc.

5. **Más cobertura E2E** — Ahora hay un smoke + axe. Faltarían escenarios de compra/venta/traspaso end-to-end con backend real.

6. **Internacionalización** — Todo el texto está en español hardcoded. Si esto fuese a escalar internacionalmente, extraería a `i18next` con namespaces por feature.

7. **Error boundary global** — Hoy los errores de query se manejan a nivel de componente. Un `<ErrorBoundary>` raíz con reporting a Sentry sería el siguiente paso.

8. **CI/CD** — Pipeline de GitHub Actions corriendo `lint + typecheck + test + e2e` en cada PR, con preview deployments.
