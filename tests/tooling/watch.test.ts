import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  cp,
  mkdtemp,
  readdir,
  stat,
  access,
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
    const outputRoot = join(site, 'public')
    const rawPath = 'runtime/docs/source/guides/hello-world.md'
    const siblingPath = join(outputRoot, 'runtime/docs/index.html')
    const rawMtimes = async () => {
      const paths = (await readdir(outputRoot, { recursive: true }))
        .filter(path => /\/(docs|wiki)\/source\/.*\.(md|txt)$/.test(path)).sort()
      return Object.fromEntries(await Promise.all(paths.map(async path =>
        [path, (await stat(join(outputRoot, path), { bigint: true })).mtimeNs] as const)))
    }
    const initialRaw = await rawMtimes()
    assert.ok(Object.keys(initialRaw).length > 1)
    assert.ok(rawPath in initialRaw)
    const sibling = await readFile(siblingPath, 'utf8')
    const siblingMtime = (await stat(siblingPath, { bigint: true })).mtimeNs
    const sentence = 'A unique watch-mode verification sentence.'
    const updated = original + '\n' + sentence + '\n'
    await delay(100)
    await writeFile(source, updated)
    await waitFor(async () => {
      const output = await Promise.all([
        route + 'index.html', 'runtime/docs/search.json', 'runtime/llms.txt', rawPath,
      ].map(path => readFile(join(outputRoot, path), 'utf8')))
      return output.every(text => text.includes(sentence))
    })
    // Allow the debounced build to finish before checking files it must not touch.
    await delay(500)
    const bodyRaw = await rawMtimes()
    assert.deepEqual(Object.keys(bodyRaw), Object.keys(initialRaw))
    assert.deepEqual(Object.keys(bodyRaw).filter(path => bodyRaw[path] !== initialRaw[path]), [rawPath])
    assert.equal(await readFile(siblingPath, 'utf8'), sibling)
    assert.equal((await stat(siblingPath, { bigint: true })).mtimeNs, siblingMtime)

    // Only frontmatter changes: the Markdown heading and raw body stay identical.
    const retitled = updated.replace(/^---\r?\n/, '---\ntitle: "Watch refresh"\n')
    assert.notEqual(retitled, updated)
    await writeFile(source, retitled)
    await waitFor(async () => {
      const output = await Promise.all([
        route + 'index.html', 'runtime/docs/index.html', 'runtime/docs/search.json', 'runtime/llms.txt',
      ].map(path => readFile(join(outputRoot, path), 'utf8')))
      return output.every(text => text.includes('Watch refresh'))
    })
    await delay(500)
    assert.deepEqual(await rawMtimes(), bodyRaw)

    const renamedRawPath = 'runtime/docs/source/guides/watch-renamed.txt'
    const renamed = retitled.replace('sourcePath: "guides/hello-world.md"', 'sourcePath: "guides/watch-renamed.txt"')
    assert.notEqual(renamed, retitled)
    const raw = await readFile(join(outputRoot, rawPath))
    await writeFile(source, renamed)
    await waitFor(async () => {
      assert.deepEqual(await readFile(join(outputRoot, renamedRawPath)), raw)
      await assert.rejects(access(join(outputRoot, rawPath)), { code: 'ENOENT' })
      return true
    })
    await rm(source)
    await waitFor(async () => {
      await assert.rejects(access(join(outputRoot, renamedRawPath)), { code: 'ENOENT' })
      await assert.rejects(access(join(outputRoot, route, 'index.html')), { code: 'ENOENT' })
      const search = await readFile(join(outputRoot, 'runtime/docs/search.json'), 'utf8')
      const pack = await readFile(join(outputRoot, 'runtime/llms.txt'), 'utf8')
      return !search.includes(sentence) && !pack.includes(sentence)
    })
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
