import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

async function openBuyDialog(page: Page) {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /fondos de inversión/i })).toBeVisible()
  await expect(page.getByRole('table', { name: /listado de fondos de inversión/i })).toBeVisible()
  await expect(page.getByText('Global Equity Fund')).toBeVisible()

  await page.getByRole('button', { name: /acciones para global equity fund/i }).click()
  await page.getByRole('menuitem', { name: 'Comprar' }).click()

  await expect(page.getByRole('dialog', { name: /comprar fondo/i })).toBeVisible()
}

test('opens the buy dialog and passes an accessibility smoke scan', async ({ page }) => {
  await openBuyDialog(page)

  const dialog = page.getByRole('dialog', { name: /comprar fondo/i })

  const accessibilityScanResults = await new AxeBuilder({ page }).include(await dialog.evaluate(node => {
    const tagName = node.tagName.toLowerCase()
    const ariaLabel = node.getAttribute('aria-label')

    return ariaLabel ? `${tagName}[aria-label="${ariaLabel}"]` : tagName
  })).analyze()
  const criticalViolations = accessibilityScanResults.violations.filter(
    violation => violation.impact === 'critical'
  )

  expect(criticalViolations).toEqual([])
  await expect(page.getByLabel('Importe')).toBeVisible()
  await expect(page.getByRole('button', { name: /comprar ahora/i })).toBeDisabled()
})

test('buys a fund and exposes the new portfolio position actions', async ({ page }) => {
  await openBuyDialog(page)

  await page.getByLabel('Importe').fill('120,45')
  await page.getByRole('button', { name: /comprar ahora/i }).click()

  await expect(page.getByRole('status')).toContainText('Orden de compra enviada para Global Equity Fund.')
  await expect(page.getByRole('dialog', { name: /comprar fondo/i })).not.toBeVisible()

  await page.getByRole('navigation', { name: /navegación principal/i }).first().getByRole('button', { name: 'Cartera' }).click()

  await expect(page.getByRole('heading', { name: 'Mi Cartera' })).toBeVisible()

  const positionRow = page.getByRole('row', {
    name: /global equity fund.*acciones para global equity fund/i,
  })
  await expect(positionRow).toBeVisible()

  await positionRow.getByRole('button', { name: /acciones para global equity fund/i }).click()

  const actionMenu = page.getByRole('menu', { name: /menú de acciones para global equity fund/i })
  await expect(actionMenu.getByRole('menuitem', { name: 'Vender' })).toBeEnabled()
  await expect(actionMenu.getByRole('menuitem', { name: 'Traspasar' })).toBeEnabled()
})
