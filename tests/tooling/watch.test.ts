import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  cp,
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rm,
  symlink,
} from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

test('a standalone checkout rebuilds articles, sidebar data and exports in watch mode', async () => {
  const site = await mkdtemp(join(tmpdir(), 'oro-standalone-'))
  let child: ReturnType<typeof spawn> | undefined
  let logs = ''
  try {
    await cp('src', join(site, 'src'), { recursive: true })
    await cp('package.json', join(site, 'package.json'))
    await cp('CNAME', join(site, 'CNAME'))
    await symlink(resolve('node_modules'), join(site, 'node_modules'), 'dir')
    await writeFile(
      join(site, 'watch.mjs'),
      `
    import { DomStack } from '@domstack/static'
    import { resolve } from 'node:path'
    const site = new DomStack(resolve('src'), resolve('public'))
    process.on('SIGTERM', async () => { await site.stopWatching(); process.exit(0) })
    await site.watch({ serve: false })
    console.log('ORO_WATCH_READY')
  `,
    )
    child = spawn(process.execPath, ['watch.mjs'], {
      cwd: site,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    child.stdout?.on('data', (chunk) => (logs += chunk))
    child.stderr?.on('data', (chunk) => (logs += chunk))
    async function waitFor(check: () => Promise<boolean>) {
      const deadline = Date.now() + 60000
      while (Date.now() < deadline) {
        if (child?.exitCode !== null)
          throw new Error(`Watcher stopped: ${logs}`)
        if (await check().catch(() => false)) return
        await delay(100)
      }
      throw new Error(`Watch update timed out: ${logs}`)
    }
    const route = 'runtime/docs/guides/hello-world/'
    await waitFor(async () =>
      (
        await readFile(join(site, 'public', route, 'index.html'), 'utf8')
      ).includes('Hello world'),
    )
    // Wait until the initial all-pages build has finished, then edit only a source.
    await waitFor(async () => logs.includes('ORO_WATCH_READY'))
    const source = join(site, 'src', route, 'page.md')
    const original = await readFile(source, 'utf8')
    const updated =
      original
        .replace('title: "Hello world"', 'title: "Watch refresh"')
        .replace('# Hello world', '# Watch refresh') +
      '\nA unique watch-mode verification sentence.\n'
    await writeFile(source, updated)
    await waitFor(async () => {
      const paths = [
        route + 'index.html',
        'runtime/docs/index.html',
        'runtime/docs/search.json',
        'runtime/docs/index.json',
        'runtime/llms.txt',
        'runtime/docs/source/guides/hello-world.md',
      ]
      const output = await Promise.all(
        paths.map((path) => readFile(join(site, 'public', path), 'utf8')),
      )
      return output.every((text) => text.includes('Watch refresh'))
    })
    assert.equal(await readFile(source, 'utf8'), updated)
  } finally {
    if (child && child.exitCode === null) {
      const exited = new Promise<void>((resolve) =>
        child!.once('exit', () => resolve()),
      )
      const force = setTimeout(() => child!.kill('SIGKILL'), 5000)
      child.kill('SIGTERM')
      await exited
      clearTimeout(force)
    }
    await rm(site, { recursive: true, force: true })
  }
})
