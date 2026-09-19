import { test, expect } from '@playwright/test'
test('static articles, navigation, metadata and the specification work without JavaScript', async ({
  browser,
  baseURL,
  viewport,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport })
  const page = await context.newPage()
  for (const route of [
    '/runtime/docs/guides/hello-world/',
    '/silk/docs/std/overview/',
    '/silk/wiki/',
    '/silk/spec/2026/',
    '/sage/docs/',
    '/slg/docs/',
    '/virtnosis/docs/',
  ]) {
    await page.goto(baseURL + route)
    await expect(page.locator('.prose h1')).toBeVisible()
    expect(await page.locator('.docs-sidebar a').count()).toBeGreaterThan(0)
    expect(await page.locator('.prose').innerText()).not.toContain('Loading…')
  }
  await context.close()
})
test('legacy queries and aliases preserve fragments', async ({ page }) => {
  await page.goto('/runtime/docs/?p=guides%2Fhello-world#next')
  await expect(page).toHaveURL(/\/runtime\/docs\/guides\/hello-world\/#next$/)
  await page.goto('/silk/docs/?p=spec/2026#language-cheat-sheet')
  await expect(page).toHaveURL(/\/silk\/spec\/2026\/#language-cheat-sheet$/)
  await page.goto('/silk/docs/guides/toy-logger-module/?ref=legacy#main')
  await expect(page).toHaveURL(
    /\/silk\/docs\/guides\/practical-logger-module\/\?ref=legacy#main$/,
  )
  await page.goto('/silk/docs/spec/2026/?ref=legacy#language-cheat-sheet')
  await expect(page).toHaveURL(
    /\/silk\/spec\/2026\/\?ref=legacy#language-cheat-sheet$/,
  )
  await page.goto('/silk/wiki/?p=start#main')
  await expect(page).toHaveURL(/\/silk\/wiki\/#main$/)
})
test('search and Ask AI enhance static content without fetching Markdown to render it', async ({
  page,
}) => {
  const errors: string[] = []
  const markdownRequests: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('request', (r) => {
    if (r.url().endsWith('.md')) markdownRequests.push(r.url())
  })
  await page.goto('/runtime/docs/guides/hello-world/')
  await page
    .getByRole('searchbox', { name: 'Search documentation' })
    .fill('secure storage')
  const result = page.locator('[data-docs-results] a').first()
  await expect(result).toBeVisible()
  await result.click()
  await expect(page.locator('.prose h1')).toBeVisible()
  await page.getByText('Ask AI', { exact: true }).click()
  await expect(page.locator('[data-ask-ai-view-markdown]')).toHaveAttribute(
    'href',
    /\/runtime\/docs\/source\/.*\.md$/,
  )
  expect(markdownRequests).toEqual([])
  expect(errors).toEqual([])
})
test('tabs support keyboard navigation and code copying', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (text: string) => {
          ;(window as any).copiedText = text
        },
      },
    }),
  )
  await page.goto('/runtime/docs/guides/hello-world/')
  const tabs = page.getByRole('tab')
  if (await tabs.count()) {
    await tabs.first().focus()
    await tabs.first().press('ArrowRight')
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
  }
  const copy = page.locator('.docs-code button').first()
  await copy.click()
  await expect(copy).toHaveAttribute('aria-label', 'Copied')
  expect(await page.evaluate(() => (window as any).copiedText)).toContain(
    'hello/',
  )
  // Silk hello-world includes the authored Markdown tab markers.
  await page.goto('/silk/docs/guides/hello-world/')
  const tab = page.getByRole('tab').first()
  await expect(tab).toBeVisible()
  await tab.focus()
  await tab.press('End')
  await expect(
    page.locator('[data-tabs]').first().getByRole('tab').last(),
  ).toHaveAttribute('aria-selected', 'true')
})
test('spec heading filtering and responsive sidebar controls', async ({
  page,
}, testInfo) => {
  await page.goto('/silk/spec/2026/')
  await page
    .getByRole('searchbox', { name: 'Search specification headings' })
    .fill('operators')
  const links = page.locator('.spec-toc a:visible')
  expect(await links.count()).toBeGreaterThan(0)
  for (const text of await links.allTextContents())
    expect(text.toLowerCase()).toContain('operators')
  await page.goto('/runtime/docs/guides/hello-world/')
  if (testInfo.project.name === 'mobile') {
    await expect(page.locator('[data-docs-nav]')).not.toBeVisible()
    await page.getByRole('button', { name: 'Browse documentation' }).click()
    await expect(page.locator('[data-docs-nav]')).toBeVisible()
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})
test('fragment navigation reveals a tabbed section',async({page})=>{
 await page.goto('/silk/docs/guides/hello-world/')
 const group=page.locator('[data-tabs]').first()
 const anchor=group.locator('.tabs-panel').last().locator('.docs-tab-anchor')
 const id=await anchor.getAttribute('id')
 expect(id).toBeTruthy()
 await page.evaluate(id=>{location.hash=id!},id)
 await expect(group.getByRole('tab').last()).toHaveAttribute('aria-selected','true')
 await expect(anchor).toBeInViewport()
})
