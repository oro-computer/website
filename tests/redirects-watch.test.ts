import { test } from 'node:test'
import assert from 'node:assert/strict'
import { access, mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { DomStack } from '@domstack/static'
import { load } from 'cheerio'

test('redirectFrom aliases follow source edits, moves and deletion in watch mode', { timeout: 30000 }, async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'oro-redirects-watch-'))
  const src = join(fixture, 'src')
  const dest = join(fixture, 'public')
  const site = new DomStack(src, dest)
  async function bounded<T>(label: string, work: Promise<T>): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      return await Promise.race([
        work,
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error(`Timed out: ${label}`)), 8000)
        }),
      ])
    } finally {
      clearTimeout(timer)
    }
  }
  async function waitFor(label: string, check: () => Promise<void>) {
    const deadline = Date.now() + 8000
    let failure: unknown
    do {
      try {
        await check()
        await bounded('watcher settled', site.settled())
        await check()
        return
      } catch (error) {
        failure = error
      }
      await delay(25)
    } while (Date.now() < deadline)
    throw new Error(`Timed out: ${label}`, { cause: failure })
  }
  const aliases = ['/legacy/', '/legacy.html', '/obsolete/']
  const output = (alias: string) => join(dest, alias.slice(1), ...(alias.endsWith('/') ? ['index.html'] : []))
  const source = (aliases: string[], body: string) => `---\nlayout: "root"\ntitle: "Watch target"\nredirectFrom: ${JSON.stringify(aliases)}\n---\n<p>${body}</p>\n`
  async function assertRedirect(alias: string, target: string) {
    const $ = load(await readFile(output(alias), 'utf8'), { scriptingEnabled: false })
    assert.equal($('html').attr('lang'), 'en')
    assert.equal($('body > header.site-top').length, 1)
    assert.equal($('header nav[aria-label="Primary navigation"]').length, 1)
    assert.equal($('body > main#main a[data-redirect]').length, 1)
    assert.equal($('body > footer.site-footer').length, 1)
    assert.equal($('body > a.skip-link').attr('href'), '#main')
    assert.equal($('link[rel="canonical"]').attr('href'), `https://oro.computer${target}`)
    assert.equal($('meta[property="og:url"]').attr('content'), `https://oro.computer${target}`)
    assert.equal($('noscript meta[http-equiv="refresh"]').attr('content'), `0;url=${target}`)
    assert.equal($('meta[http-equiv="refresh"]').length, 1)
    assert.equal($('a[data-redirect]').attr('href'), target)
    assert.equal($('a[data-redirect]').text(), 'Continue to the page')
  }
  try {
    // Re-export production consumers, not test implementations of their data subscriptions.
    for (const [target, real] of [
      ['globals/global.data.ts', 'globals/global.data.ts'],
      ['globals/global.vars.ts', 'globals/global.vars.ts'],
      ['markdown-it.settings.ts', 'markdown-it.settings.ts'],
      ['root.layout.ts', 'layouts/root.layout.ts'],
      ['redirect.layout.ts', 'layouts/redirect.layout.ts'],
      ['redirects.pages.ts', 'redirects.pages.ts'],
    ]) {
      const url = new URL('../src/' + real, import.meta.url).href
      await mkdir(dirname(join(src, target)), { recursive: true })
      await writeFile(join(src, target), `export { default } from ${JSON.stringify(url)}\nexport * from ${JSON.stringify(url)}\n`)
    }
    await mkdir(join(src, 'target'))
    const original = join(src, 'target/page.md')
    await writeFile(original, source(aliases, 'Original body'))
    // watch() resolves only after the initial build and filesystem watcher readiness.
    const initial = await bounded('watcher readiness', site.watch({ serve: false }))
    assert.deepEqual(initial.pageBuildResults?.errors, [])
    for (const alias of aliases) await assertRedirect(alias, '/target/')
    const snapshots = await Promise.all(aliases.map(async alias => ({
      html: await readFile(output(alias), 'utf8'),
      mtime: (await stat(output(alias), { bigint: true })).mtimeNs,
    })))

    await writeFile(original, source(aliases, 'Changed body'))
    await waitFor('body edit rendered', async () => {
      assert.match(await readFile(join(dest, 'target/index.html'), 'utf8'), /Changed body/)
    })
    for (const [index, alias] of aliases.entries()) {
      assert.equal(await readFile(output(alias), 'utf8'), snapshots[index].html)
      assert.equal((await stat(output(alias), { bigint: true })).mtimeNs, snapshots[index].mtime)
    }

    const retained = aliases.slice(0, 2)
    await writeFile(original, source(retained, 'Changed body'))
    await waitFor('removed alias cleaned', async () => {
      await assert.rejects(access(output('/obsolete/')), { code: 'ENOENT' })
      for (const alias of retained) await assertRedirect(alias, '/target/')
    })

    await rename(join(src, 'target'), join(src, 'renamed'))
    await waitFor('same aliases point to renamed target', async () => {
      assert.match(await readFile(join(dest, 'renamed/index.html'), 'utf8'), /Changed body/)
      for (const alias of retained) await assertRedirect(alias, '/renamed/')
      await assert.rejects(access(join(dest, 'target/index.html')), { code: 'ENOENT' })
      await assert.rejects(access(output('/obsolete/')), { code: 'ENOENT' })
    })

    await rm(join(src, 'renamed/page.md'))
    await waitFor('deleted source and aliases cleaned', async () => {
      for (const alias of aliases) await assert.rejects(access(output(alias)), { code: 'ENOENT' })
      await assert.rejects(access(join(dest, 'renamed/index.html')), { code: 'ENOENT' })
    })
  } finally {
    await bounded('watcher shutdown', site.stopWatching())
    await rm(fixture, { recursive: true, force: true })
  }
})
