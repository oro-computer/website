import { test, expect, type Request } from '@playwright/test'

const registry = 'https://registry.npmjs.org/@oro-computer/runtime/latest'
const npm = 'https://www.npmjs.com/package/@oro-computer/runtime'

test('Runtime entry points show npm’s latest release and keep downloads on npm', async ({ page }) => {
  let version = '8.3.2'
  let requests = 0
  await page.route(registry, async route => {
    requests += 1
    await route.fulfill({ json: { name: '@oro-computer/runtime', version } })
  })
  for (const path of [
    '/runtime/', '/runtime/docs/',
    '/runtime/docs/guides/from-zero-to-first-run/', '/runtime/learn/getting-started/',
  ]) {
    await page.goto(path)
    const release = page.locator('[data-runtime-release]')
    await expect(release).toHaveText(`Latest release: v${version}`)
    await expect(release).toHaveAttribute('href', npm)
    await expect(page.getByRole('link', { name: 'Download', exact: true })).toHaveAttribute('href', npm)
    await expect(page.locator('main pre').first()).toContainText('npm install --global @oro-computer/runtime@latest')
  }
  expect(requests).toBe(4)

  // A new publication is visible on the next visit without rebuilding the site.
  version = '8.4.0'
  await page.reload()
  await expect(page.locator('[data-runtime-release]')).toHaveText('Latest release: v8.4.0')
})

for (const failure of ['http', 'invalid-json', 'invalid-version', 'wrong-package', 'network']) {
  test(`npm release links remain usable after ${failure} failure`, async ({ page }) => {
    const errors: Error[] = []
    page.on('pageerror', error => errors.push(error))
    await page.route(registry, async route => {
      if (failure === 'network') await route.abort()
      else if (failure === 'http') await route.fulfill({ status: 503, body: 'Unavailable' })
      else if (failure === 'invalid-json') await route.fulfill({ contentType: 'application/json', body: '{' })
      else await route.fulfill({ json: {
        name: failure === 'wrong-package' ? 'another-package' : '@oro-computer/runtime',
        version: failure === 'invalid-version' ? '<script>invalid</script>' : '8.3.2',
      } })
    })
    const options = { predicate: (request: Request) => request.url() === registry }
    const settled = failure === 'network'
      ? page.waitForEvent('requestfailed', options)
      : page.waitForEvent('requestfinished', options)
    await page.goto('/runtime/')
    await settled
    await page.evaluate(() => new Promise<void>(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    }))
    const release = page.locator('[data-runtime-release]')
    await expect(release).toHaveText('Latest release on npm')
    await expect(release).toHaveAttribute('href', npm)
    expect(errors).toEqual([])
  })
}

test('npm downloads and install instructions work without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto(`${baseURL}/runtime/docs/`)
    await expect(page.locator('[data-runtime-release]')).toHaveText('Latest release on npm')
    await expect(page.locator('[data-runtime-release]')).toHaveAttribute('href', npm)
    await expect(page.locator('main pre').first()).toContainText('@oro-computer/runtime@latest')
  } finally {
    await context.close()
  }
})

test('pages without release labels do not request npm metadata', async ({ page }) => {
  let requests = 0
  await page.route(registry, async route => {
    requests += 1
    await route.abort()
  })
  await page.goto('/silk/')
  expect(requests).toBe(0)
})
