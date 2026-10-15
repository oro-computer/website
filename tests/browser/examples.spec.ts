import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFile } from 'node:fs/promises'
import { load } from 'cheerio'
import { markdown } from '#lib/markdown.ts'

async function blocks(product: string, lesson: string) {
  const $ = load(markdown().render(await readFile(`src/${product}/learn/${lesson}/page.md`, 'utf8')))
  return $('h3').toArray().map(heading => ({ name: $(heading).text(), code: $(heading).next('pre').find('code').text() }))
}
const get = (items: Awaited<ReturnType<typeof blocks>>, name: string) => items.find(item => item.name === name)!.code

const chapters = [
  ['runtime', 'getting-started'], ['runtime', 'project-layout'], ['runtime', 'configuration'],
  ['runtime', 'windows-and-messaging'], ['runtime', 'desktop-integrations'],
  ['silk', 'getting-started'], ['silk', 'language-tour'], ['silk', 'modules-and-packages'],
  ['silk', 'types-and-optionals'], ['silk', 'results-and-errors'],
]
for (const [product, chapter] of chapters) test(`readable, accessible lesson: ${product}/${chapter}`, async ({ page }) => {
  await page.goto(`/${product}/learn/${chapter}/`)
  await expect(page.locator('main h1')).toHaveCount(1)
  await expect(page.locator('main')).toContainText('Before you start:')
  await expect(page.locator('main')).toContainText('Expected result:')
  await expect(page.locator('main')).toContainText('Try')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(await page.locator('.learn-code button[data-copy-init="true"]').count()).toBeGreaterThan(0)
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(result.violations.map(({ id, nodes }) => ({ id, details: nodes.map(node => node.failureSummary) }))).toEqual([])
})

test('Learn copy controls copy the complete file, preserving markup and imports', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: {
    writeText: async (text: string) => { (window as any).copied = text },
  } }))
  await page.goto('/runtime/learn/getting-started/')
  const file = page.locator('.learn-code').filter({ has: page.locator('.learn-code-title', { hasText: /^src\/index\.html$/ }) })
  await file.getByRole('button').click()
  await expect(file.getByRole('button')).toHaveAttribute('aria-label', 'Copied')
  expect(await page.evaluate(() => (window as any).copied)).toBe(get(await blocks('runtime', 'getting-started'), 'src/index.html'))
})

// Run the actual published application code with only the native bridge replaced.
// These checks cover UI/storage/message logic; native host validation is separate.
test('Field Notes saves, restores, previews safely, and survives denied capabilities', async ({ page }) => {
  const first = await blocks('runtime', 'getting-started')
  const windows = await blocks('runtime', 'windows-and-messaging')
  const integrations = await blocks('runtime', 'desktop-integrations')
  let html = get(first, 'src/index.html')
  html = html.replace('</form>', '</form>' + get(windows, 'src/index.html — insert after the form') + get(integrations, 'src/index.html — insert after Preview draft'))
  let main = get(first, 'src/main.js') + '\n' + get(windows, 'src/main.js — append preview handling')
  main = main.replace(/form\.addEventListener\('submit', \(event\) => \{[\s\S]*?\n\}\)/, '')
  main += '\n' + get(integrations, 'src/main.js — append after removing the old submit listener')
  const bundle = new Map([
    ['index.html', html], ['main.js', main],
    ['preview.html', get(windows, 'src/preview.html')], ['preview.js', get(windows, 'src/preview.js')],
  ])
  await page.addInitScript(() => {
    const state = { posted: [] as any[], windows: 0, notification: false, permission: 'denied', clipboardFailure: false, storageFailure: false, clipboard: '' }
    ;(window as any).demo = state
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (state.storageFailure) throw new Error('Storage full')
      setItem.call(this, key, value)
    }
    const preview = {
      focus: async () => {},
      postMessage: async (data: unknown) => { state.posted.push(data) },
    }
    ;(window as any).native = {
      getCurrentWindow: async () => ({ setTitle: async (title: string) => { document.title = title } }),
      getWindow: async (index: number) => index === 0 ? preview : state.windows ? preview : undefined,
      createWindow: async () => { state.windows++; return preview },
    }
    ;(window as any).capabilities = {
      Notification: { requestPermission: async () => state.permission },
      showNotification: async () => { state.notification = true; throw new Error('OS unavailable') },
      canWriteText: () => true,
      writeText: async (text: string) => { if (state.clipboardFailure) throw new Error('Clipboard unavailable'); state.clipboard = text },
    }
  })
  await page.route('**/__learn-demo__/*', async route => {
    const name = new URL(route.request().url()).pathname.split('/').at(-1)!
    let body = bundle.get(name)!
    if (name.endsWith('.js')) body = body
      .replace("import application from 'oro:application'", 'const application = globalThis.native')
      .replace("import Notification, { showNotification } from 'oro:notification'", 'const { Notification, showNotification } = globalThis.capabilities')
      .replace("import { writeText, canWriteText } from 'oro:clipboard'", 'const { writeText, canWriteText } = globalThis.capabilities')
    await route.fulfill({ body, contentType: name.endsWith('.js') ? 'text/javascript' : 'text/html' })
  })
  await page.goto('/__learn-demo__/index.html')
  await expect(page).toHaveTitle('Field Notes — your draft')
  await page.getByRole('textbox', { name: 'Your draft' }).fill('Check the west gate\nBring a torch')
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Draft saved on this device.')
  await page.reload()
  await expect(page.getByRole('textbox')).toHaveValue('Check the west gate\nBring a torch')
  await page.getByRole('button', { name: 'Preview draft', exact: true }).click()
  expect(await page.evaluate(() => (window as any).demo.posted)).toEqual([])
  await page.evaluate(() => dispatchEvent(new CustomEvent('message', { detail: { type: 'preview:ready' } })))
  await expect.poll(() => page.evaluate(() => (window as any).demo.posted.length)).toBe(1)
  await page.getByRole('button', { name: 'Preview draft', exact: true }).click()
  expect(await page.evaluate(() => (window as any).demo.windows)).toBe(1)
  await page.getByRole('button', { name: 'Copy draft', exact: true }).click()
  expect(await page.evaluate(() => (window as any).demo.clipboard)).toBe('Check the west gate\nBring a torch')
  await page.getByRole('button', { name: 'Enable save notifications' }).click()
  await expect(page.getByRole('status')).toContainText('You can still save')
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  expect(await page.evaluate(() => (window as any).demo.notification)).toBe(false)
  await page.evaluate(() => { (window as any).demo.permission = 'granted' })
  await page.getByRole('button', { name: 'Enable save notifications' }).click()
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Draft saved; notification unavailable: OS unavailable')
  await page.evaluate(() => { (window as any).demo.clipboardFailure = true })
  await page.getByRole('button', { name: 'Copy draft', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Could not copy draft: Clipboard unavailable')
  await page.evaluate(() => { (window as any).demo.storageFailure = true })
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Could not save your draft: Storage full')
  await page.goto('/__learn-demo__/preview.html')
  await expect.poll(() => page.evaluate(() => (window as any).demo.posted.length)).toBe(1)
  await page.evaluate(() => dispatchEvent(new MessageEvent('message', { data: { type: 'draft:changed', body: '<strong>Keep this literal</strong>' } })))
  await expect(page.locator('#draft')).toHaveText('<strong>Keep this literal</strong>')
  await expect(page.locator('#draft strong')).toHaveCount(0)
})
