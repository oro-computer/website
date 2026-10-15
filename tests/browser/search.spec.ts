import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('search supports both shortcuts, focus restoration, dismissal, and mobile layout', async ({ page }) => {
  await page.goto('/silk/docs/')
  const trigger = page.getByRole('button', { name: 'Search site', exact: true })
  const dialog = page.getByRole('dialog', { name: 'Search Oro Computer' })
  await expect(trigger).toBeVisible()
  await trigger.focus()
  for (const shortcut of ['Control+k', 'Meta+k']) {
    await page.keyboard.press(shortcut)
    await expect(dialog).toBeVisible()
    await expect(page.getByRole('combobox')).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(trigger).toBeFocused()
  }
  await trigger.click()
  expect(await dialog.evaluate(element => {
    const box = element.getBoundingClientRect()
    return box.left >= 0 && box.right <= innerWidth && box.top >= 0 && box.bottom <= innerHeight
  })).toBe(true)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Close search', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('combobox')).toBeFocused()
  await page.mouse.click(2, 2)
  await expect(dialog).not.toBeVisible()
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('site-search-open'))).toBe(false)
})

test('global results search full text across collections and navigate with the keyboard', async ({ page }) => {
  let requests = 0
  page.on('request', request => { if (request.url().endsWith('/search.json')) requests++ })
  await page.goto('/')
  expect(requests).toBe(0)
  await page.getByRole('button', { name: 'Search site', exact: true }).click()
  const input = page.getByRole('combobox')
  await input.fill('silk filesystem')
  const results = page.getByRole('option')
  await expect(results.first()).toContainText('Silk Docs')
  await expect(results.first()).toHaveAttribute('aria-selected', 'true')
  expect(await page.locator('#site-search').evaluate(element => element.getBoundingClientRect().bottom <= innerHeight)).toBe(true)
  await page.keyboard.press('ArrowDown')
  await expect(results.nth(1)).toHaveAttribute('aria-selected', 'true')
  const target = await results.nth(1).getAttribute('href')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(new RegExp(target! + '$'))
  await page.getByRole('button', { name: 'Search site', exact: true }).click()
  await input.fill('runtime sqlite')
  await expect(results.first()).toContainText('Runtime Docs')
  await input.fill('xyz-no-matching-page-93858')
  await expect(results).toHaveCount(0)
  await expect(page.locator('.site-search-message')).toContainText('No results')
  await input.fill('')
  await expect(results).toHaveCount(4)
  await page.keyboard.press('Escape')
  await page.keyboard.press('Control+k')
  await expect(results).toHaveCount(4)
  expect(requests).toBe(2) // One lazy load per page, including after navigation.
})

test('failed loading can retry and uses the latest query, safely rendering text', async ({ page }) => {
  let requests = 0
  await page.route('**/search.json', async route => {
    requests++
    if (requests === 1) await route.fulfill({ status: 503 })
    else await route.fulfill({ json: { items: [
      { url: '/docs/', title: '<img src=x onerror=alert(1)>', summary: 'Latest query', section: 'Guides', text: 'needle' },
      { url: '//evil.test/', title: 'needle', summary: '', section: '', text: '' },
    ] } })
  })
  await page.goto('/')
  await page.keyboard.press('Control+k')
  await page.getByRole('combobox').fill('needle')
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByRole('option')).toHaveCount(1)
  await expect(page.getByRole('option')).toContainText('<img src=x onerror=alert(1)>')
  await expect(page.locator('#site-search-results img')).toHaveCount(0)
  await page.keyboard.press('Escape')
  await page.keyboard.press('Control+k')
  expect(requests).toBe(2)
})

test('search meets WCAG AA with quick links, results, and no results', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Search site', exact: true }).click()
  for (const query of ['', 'sqlite', 'no-results-93858']) {
    await page.getByRole('combobox').fill(query)
    if (query) await expect(page.locator('#site-search-results')).toHaveAttribute('aria-busy', 'false')
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(result.violations.map(({ id, nodes }) => ({ id, details: nodes.map(node => node.failureSummary) }))).toEqual([])
  }
})

test('a late search response preserves the latest query and Escape dismisses a populated search', async ({ page }) => {
  let release!: () => void
  const responseReady = new Promise<void>(resolve => { release = resolve })
  await page.route('**/search.json', async route => {
    await responseReady
    await route.fulfill({ json: { items: [
      { url: '/docs/', title: 'Latest needle', summary: 'A matching page', section: 'Guides', text: '' },
    ] } })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Search site', exact: true }).focus()
  await page.keyboard.press('Control+k')
  const input = page.getByRole('combobox')
  await input.fill('old query')
  await input.fill('latest needle')
  await expect(page.locator('#site-search-results')).toHaveAttribute('aria-busy', 'true')
  release()
  await expect(page.getByRole('option')).toContainText('Latest needle')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Search site', exact: true })).toBeFocused()
})

test('shortcut hint follows the operating system and search is hidden without JavaScript', async ({ browser, baseURL, viewport }) => {
  for (const platform of ['MacIntel', 'Linux x86_64']) {
    const context = await browser.newContext({ viewport })
    await context.addInitScript(value => Object.defineProperty(navigator, 'platform', { value }), platform)
    const page = await context.newPage()
    await page.goto(baseURL!)
    const trigger = page.getByRole('button', { name: 'Search site', exact: true })
    await expect(trigger).toHaveAttribute('aria-keyshortcuts', platform === 'MacIntel' ? 'Meta+K' : 'Control+K')
    await context.close()
  }
  const context = await browser.newContext({ javaScriptEnabled: false, viewport })
  const page = await context.newPage()
  await page.goto(baseURL!)
  await expect(page.locator('.site-search-trigger')).toBeHidden()
  await expect(page.locator('#site-search')).toBeHidden()
  await context.close()
})
