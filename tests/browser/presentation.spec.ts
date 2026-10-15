import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const routes = [
  '/', '/runtime/', '/silk/', '/docs/',
  '/runtime/learn/', '/silk/learn/',
  '/runtime/learn/getting-started/', '/silk/learn/getting-started/',
  '/runtime/docs/guides/hello-world/', '/runtime/docs/javascript/sqlite/',
  '/runtime/docs/cli/build/', '/runtime/docs/config/reference/', '/silk/docs/usage/getting-started/',
  '/silk/docs/usage/github-actions/', '/silk/docs/man/silk_abi_get_version.3/',
  '/silk/wiki/', '/blog/', '/blog/2026/hello-world/',
]

for (const route of routes) test(`dark presentation and WCAG AA: ${route}`, async ({ page }) => {
  await page.goto(route)
  expect(await page.locator('body').evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(17, 16, 15)')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target), details: nodes.map(node => node.failureSummary) }))).toEqual([])
})

test('primary actions retain contrast when hovered and keyboard focused', async ({ page }) => {
  await page.goto('/')
  const action = page.getByRole('link', { name: 'Explore Runtime' })
  for (const state of ['default', 'hover', 'focus']) {
    if (state === 'hover') await action.hover()
    if (state === 'focus') {
      await page.mouse.move(0, 0)
      await action.focus()
      expect(await action.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none')
    }
    const results = await new AxeBuilder({ page }).include('.home-hero .hero-actions').withRules(['color-contrast']).analyze()
    expect(results.violations, state).toEqual([])
  }
})

test('specification and nested code reflow on narrow phones', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 })
  await page.goto('/silk/spec/2026/')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(await page.locator('pre:not([tabindex="0"])').count()).toBe(0)
  expect(await page.locator('table:not(.table-scroll table)').count()).toBe(0)
  const sample = page.locator('pre').first()
  await sample.focus()
  await expect(sample).toBeFocused()
})

test('retired initiatives have no public pages or discovery entries', async ({ request, page }) => {
  await page.goto('/')
  for (const product of ['slg', 'sage', 'virtnosis']) {
    for (const suffix of ['/', '/docs/', '/llms.txt', '/docs/search.json'])
      expect((await request.get(`/${product}${suffix}`)).status()).toBe(404)
    expect(await page.locator(`a[href^="/${product}/"]`).count()).toBe(0)
    for (const path of ['/sitemap.xml', '/llms.txt'])
      expect(await (await request.get(path)).text()).not.toContain(`/${product}/`)
  }
})

test('linked headings clear the header with and without JavaScript', async ({ browser, baseURL, viewport }) => {
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({ viewport, javaScriptEnabled, reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto(baseURL + '/runtime/docs/guides/hello-world/#2-add-orotoml')
    await expect.poll(() => page.evaluate(() => {
      const heading = document.getElementById('2-add-orotoml')!.getBoundingClientRect()
      const header = document.querySelector<HTMLElement>('.site-top')!
      const edge = getComputedStyle(header).position === 'sticky' ? header.getBoundingClientRect().bottom : 0
      return heading.top >= edge && heading.top < innerHeight
    }), { message: `Heading must remain visible (JavaScript: ${javaScriptEnabled})` }).toBe(true)
    if (javaScriptEnabled) {
      await page.setViewportSize({ width: 760, height: 844 })
      await page.locator('[id="2-add-orotoml"]').evaluate(element => element.scrollIntoView())
      await expect.poll(() => page.locator('[id="2-add-orotoml"]').evaluate(element => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0)
    }
    await context.close()
  }
})

test('homepage caption stays legible on a narrow phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 })
  await page.goto('/')
  const caption = page.locator('.art-caption')
  expect(await caption.evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(14)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('selected navigation has a contrasting visual indicator', async ({ page }) => {
  await page.goto('/runtime/docs/guides/hello-world/')
  const selected = page.locator('.site-subnav-links [aria-current="page"]')
  const contrast = await selected.evaluate(element => {
    const rgba = (value: string) => value.match(/[\d.]+/g)!.map(Number)
    const over = (foreground: number[], background: number[]) => {
      const alpha = foreground[3] ?? 1
      return [0, 1, 2].map(index => foreground[index]! * alpha + background[index]! * (1 - alpha))
    }
    const ancestors: Element[] = []
    for (let node: Element | null = element; node; node = node.parentElement) ancestors.unshift(node)
    const background = ancestors.reduce((color, node) => over(rgba(getComputedStyle(node).backgroundColor), color), [255, 255, 255])
    const border = over(rgba(getComputedStyle(element).borderTopColor), background)
    const luminance = (color: number[]) => color.map(channel => {
      const s = channel / 255
      return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4
    }).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index]!, 0)
    const light = luminance(border), dark = luminance(background)
    return (Math.max(light, dark) + .05) / (Math.min(light, dark) + .05)
  })
  expect(contrast).toBeGreaterThanOrEqual(3)
  const current = page.locator('.docs-nav a[data-active="true"]')
  await expect(current).toHaveCSS('box-shadow', 'none')
  await expect(current).toHaveCSS('border-radius', '0px')
  await expect(current).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  expect(await current.evaluate(element => getComputedStyle(element, '::before').width)).toBe('2px')
})
