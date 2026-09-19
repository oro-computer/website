import { test, expect, type Route } from '@playwright/test'

test('search retries a failed index after the pending query was cleared', async ({ page }) => {
  let requests = 0
  let resolveFirst!: (route: Route) => void
  const first = new Promise<Route>((resolve) => { resolveFirst = resolve })
  await page.route('**/runtime/docs/search.json', async (route) => {
    requests += 1
    if (requests === 1) {
      resolveFirst(route)
      return
    }
    await route.fulfill({ json: { items: [
      { title: 'Retry result', url: '/runtime/docs/', summary: 'Recovered', text: 'retry' },
    ] } })
  })
  await page.goto('/runtime/docs/guides/hello-world/')
  const search = page.getByRole('searchbox', { name: 'Search documentation' })
  await search.fill('first')
  const pending = await first
  await search.fill('')
  const response = page.waitForResponse('**/runtime/docs/search.json')
  await pending.fulfill({ status: 503, body: 'Unavailable' })
  await (await response).finished()
  // Let the fetch rejection settle before creating a new input event.
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  }))
  await expect(page.locator('[data-docs-results]')).toBeHidden()
  await search.fill('retry')
  await expect(page.getByRole('link', { name: 'Retry result Recovered' })).toBeVisible()
  expect(requests).toBe(2)
})

test('Ask AI escapes the scrolling nav and supports keyboard dismissal', async ({ page }) => {
  await page.goto('/runtime/docs/guides/hello-world/')
  const trigger = page.getByRole('button', { name: 'Ask AI', exact: true })
  await trigger.click()
  const panel = page.locator('#ask-ai-panel')
  await expect(panel).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  expect(await panel.evaluate((element) => {
    const bounds = element.getBoundingClientRect()
    const item = element.querySelector('a')!
    const target = item.getBoundingClientRect()
    return !element.closest('.nav') && bounds.left >= 0 && bounds.right <= innerWidth &&
      item.contains(document.elementFromPoint(target.x + target.width / 2, target.y + target.height / 2)) &&
      document.documentElement.scrollWidth <= innerWidth
  })).toBe(true)
  await trigger.press('ArrowDown')
  await expect(page.getByRole('link', { name: 'ChatGPT New tab' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.click()
  await page.locator('.prose h1').click()
  await expect(panel).toBeHidden()
})

test('section navigation selects only the most specific Docs destination', async ({ page }) => {
  for (const [route, label] of [
    ['/runtime/docs/cli/oroc/', 'CLI'],
    ['/runtime/docs/javascript/overview/', 'JavaScript APIs'],
    ['/runtime/docs/guides/hello-world/', 'Docs'],
  ]) {
    await page.goto(route)
    const current = page.locator('.site-subnav-links [aria-current="page"]')
    await expect(current).toHaveCount(1)
    await expect(current).toHaveText(label)
  }
})
