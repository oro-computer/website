import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const ivory = 'rgb(250, 248, 244)'
const graphite = 'rgb(17, 16, 15)'

test('theme follows live system changes and persists explicit choices across pages and reloads', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  const theme = page.locator('[data-theme-toggle]')
  await expect(theme).toHaveAccessibleName('Switch to dark theme')
  await expect(theme).toHaveAttribute('title', 'Switch to dark theme')
  await expect(theme.locator('svg:not([hidden])')).toHaveAttribute('data-theme-icon', 'dark')
  await expect(page.locator('body')).toHaveCSS('background-color', ivory)
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('body')).toHaveCSS('background-color', graphite)
  await theme.press('Enter')
  await expect(page.locator('body')).toHaveCSS('background-color', ivory)
  await page.goto('/runtime/docs/')
  await expect(theme).toHaveAccessibleName('Switch to dark theme')
  await expect(page.locator('body')).toHaveCSS('background-color', ivory)
  await page.reload()
  await expect(theme).toHaveAccessibleName('Switch to dark theme')
  await theme.press('Space')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('body')).toHaveCSS('background-color', graphite)
  expect(await page.evaluate(() => localStorage.getItem('oro-theme'))).toBe('dark')
  await expect(theme).toHaveAccessibleName('Switch to light theme')
  await expect(theme.locator('svg:not([hidden])')).toHaveAttribute('data-theme-icon', 'light')
  await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute('content', '#11100F')
})

test('saved theme is applied before the global client loads', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.addInitScript(() => localStorage.setItem('oro-theme', 'light'))
  await page.route('**/globals/global.client-*.js', route => route.abort())
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('body')).toHaveCSS('background-color', ivory)
  await expect(page.locator('[data-theme-toggle]')).toBeHidden()
})

test('blocked storage retains working controls', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', {
    get() { throw new DOMException('Storage blocked', 'SecurityError') },
  }))
  const errors: Error[] = []
  page.on('pageerror', error => errors.push(error))
  await page.goto('/')
  await expect(page.locator('body')).toHaveCSS('background-color', ivory)
  const theme = page.locator('[data-theme-toggle]')
  await theme.click()
  await expect(page.locator('body')).toHaveCSS('background-color', graphite)
  await theme.click()
  await expect(page.locator('body')).toHaveCSS('background-color', ivory)
  expect(errors).toEqual([])
})

test('invalid saved preferences follow the system', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.addInitScript(() => localStorage.setItem('oro-theme', 'invalid'))
  await page.goto('/')
  await expect(page.locator('[data-theme-toggle]')).toHaveAccessibleName('Switch to dark theme')
  await expect(page.locator('html')).not.toHaveAttribute('data-theme')
  await expect(page.locator('body')).toHaveCSS('background-color', ivory)
})

for (const scheme of ['light', 'dark'] as const) {
  test(`${scheme} control boundaries and focus indicators meet 3:1 contrast`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme })
    await page.goto('/runtime/docs/guides/hello-world/')
    for (const selector of ['[data-theme-toggle]', '.docs-search', '.site-search-trigger']) {
      const control = page.locator(selector)
      await control.focus()
      await expect(control).not.toHaveCSS('outline-style', 'none')
      const contrast = await control.evaluate(element => {
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = 1
        const ctx = canvas.getContext('2d')!
        const ancestors: Element[] = []
        for (let node = element.parentElement; node; node = node.parentElement) ancestors.unshift(node)
        const background = () => {
          ctx.fillStyle = '#fff'
          ctx.fillRect(0, 0, 1, 1)
          for (const node of ancestors) {
            ctx.fillStyle = getComputedStyle(node).backgroundColor
            ctx.fillRect(0, 0, 1, 1)
          }
        }
        const luminance = () => Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3)
          .map(channel => channel / 255)
          .map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4)
          .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index]!, 0)
        background()
        const base = luminance()
        const style = getComputedStyle(element)
        return [style.borderTopColor, style.outlineColor].map(color => {
          background()
          ctx.fillStyle = color
          ctx.fillRect(0, 0, 1, 1)
          const value = luminance()
          return (Math.max(base, value) + .05) / (Math.min(base, value) + .05)
        })
      })
      for (const ratio of contrast) expect(ratio, selector).toBeGreaterThanOrEqual(3)
    }
  })

  test(`${scheme} theme works without JavaScript, including code and small screens`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: scheme, viewport: { width: 320, height: 844 } })
    try {
      const page = await context.newPage()
      for (const path of ['/', '/runtime/docs/guides/hello-world/', '/runtime/learn/getting-started/']) {
        await page.goto(`${baseURL}${path}`)
        await expect(page.locator('body')).toHaveCSS('background-color', scheme === 'light' ? ivory : graphite)
        await expect(page.locator('[data-theme-toggle]')).toBeHidden()
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
        // axe uses page timers, which are disabled in this context. Check the
        // rendered prose and syntax colors directly; the full axe matrix runs above.
        const unreadable = await page.evaluate(() => {
          const canvas = document.createElement('canvas')
          canvas.width = canvas.height = 1
          const ctx = canvas.getContext('2d')!
          const luminance = () => Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3)
            .map(channel => channel / 255)
            .map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4)
            .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index]!, 0)
          return Array.from(document.querySelectorAll('main p, main h1, main code, main code span'))
            .filter(element => element.getClientRects().length && element.textContent?.trim())
            .flatMap(element => {
              const ancestors: Element[] = []
              for (let node: Element | null = element; node; node = node.parentElement) ancestors.unshift(node)
              ctx.fillStyle = '#fff'
              ctx.fillRect(0, 0, 1, 1)
              for (const node of ancestors) {
                ctx.fillStyle = getComputedStyle(node).backgroundColor
                ctx.fillRect(0, 0, 1, 1)
              }
              const base = luminance()
              ctx.fillStyle = getComputedStyle(element).color
              ctx.fillRect(0, 0, 1, 1)
              const value = luminance()
              const ratio = (Math.max(base, value) + .05) / (Math.min(base, value) + .05)
              return ratio < 4.5 ? [{ text: element.textContent!.slice(0, 60), ratio }] : []
            })
        })
        expect(unreadable).toEqual([])
      }
    } finally { await context.close() }
  })

  test(`${scheme} search, menus, tabs, and copy controls remain readable`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme })
    await page.goto('/runtime/docs/guides/hello-world/')
    const theme = page.locator('[data-theme-toggle]')
    await theme.focus()
    expect(await theme.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none')
    await page.getByRole('button', { name: 'Ask AI', exact: true }).click()
    let result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(result.violations.map(({ id, nodes }) => ({ id, details: nodes.map(node => node.failureSummary) }))).toEqual([])
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Search site', exact: true }).click()
    const search = page.getByRole('dialog')
    await expect(search).toBeVisible()
    await page.locator('#site-search-input').fill('sqlite')
    await expect(page.locator('#site-search-results a').first()).toBeVisible()
    result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(result.violations.map(({ id, nodes }) => ({ id, details: nodes.map(node => node.failureSummary) }))).toEqual([])
    await page.keyboard.press('Escape')
    await page.goto('/silk/docs/usage/getting-started/')
    for (const tab of await page.getByRole('tab').all()) {
      await tab.click()
      result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      expect(result.violations.map(({ id, nodes }) => ({ id, details: nodes.map(node => node.failureSummary) }))).toEqual([])
    }
  })
}
