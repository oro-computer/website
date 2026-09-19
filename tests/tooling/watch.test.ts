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
  rename,
} from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { buildSourceInventory } from '../../tools/audits/common.ts'
import { setTimeout as delay } from 'node:timers/promises'

test('a standalone checkout rebuilds articles, sidebar data and exports in watch mode', { timeout: 240000 }, async (t) => {
  const site = await mkdtemp(join(tmpdir(), 'oro-standalone-'))
  let child: ReturnType<typeof spawn> | undefined
  let logs = ''
  try {
    await cp('src', join(site, 'src'), { recursive: true })
    await cp('package.json', join(site, 'package.json'))
    await cp('CNAME', join(site, 'CNAME'))
    await symlink(resolve('node_modules'), join(site, 'node_modules'), 'dir')
    // Instrument the real producer, not a simplified copy. Relative imports and
    // the local default export are understood by beta.7's dependency tracker.
    const globalPath = join(site, 'src/globals/global.data.ts')
    await rename(globalPath, join(site, 'src/globals/watch-global-helper.ts'))
    await writeFile(join(site, 'watch-revision.json'), JSON.stringify('initial'))
    await writeFile(globalPath, `
      import actual from './watch-global-helper.ts'
      import { readFile, writeFile, rename } from 'node:fs/promises'
      import { resolve } from 'node:path'
      const globalData = async (context) => {
        const revision = JSON.parse(await readFile(resolve('watch-revision.json'), 'utf8'))
        const snapshot = {
          revision, kind: context.changes.kind, events: context.changes.events,
          upserted: context.changes.upserted?.map(page => page.sourceId) ?? [],
          removed: context.changes.removed ?? [], reads: [], renders: [],
        }
        const restore = []
        for (const page of new Set([...context.pages, ...(context.changes.upserted ?? [])])) {
          for (const [method, counter] of [['readMarkdownContent', 'reads'], ['renderInnerPage', 'renders']]) {
            const descriptor = Object.getOwnPropertyDescriptor(page, method)
            const original = page[method]
            page[method] = function (...args) {
              snapshot[counter].push(page.sourceId)
              return original.apply(this, args)
            }
            restore.push(() => {
              if (descriptor) Object.defineProperty(page, method, descriptor)
              else delete page[method]
            })
          }
        }
        try {
          return await actual(context)
        } finally {
          for (const undo of restore) undo()
          // Atomic current snapshots, outside the watched tree; no module-level
          // counters that can survive reloads or accumulate across revisions.
          const target = resolve('watch-telemetry-' + revision + '.json')
          await writeFile(target + '.tmp', JSON.stringify(snapshot))
          await rename(target + '.tmp', target)
        }
      }
      export default globalData
    `)
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
    const sourceId = route + 'page.md'
    const completedBuilds = () => logs.match(/Build Success!/g)?.length ?? 0
    let beforeBuild = completedBuilds()
    async function beginRevision(revision: string) {
      beforeBuild = completedBuilds()
      await writeFile(join(site, 'watch-revision.json'), JSON.stringify(revision))
    }
    async function checkTelemetry(revision: string, count: number, removed = false) {
      await waitFor(async () => revision === 'initial' || completedBuilds() > beforeBuild)
      const snapshot = JSON.parse(await readFile(join(site, `watch-telemetry-${revision}.json`), 'utf8'))
      t.diagnostic(JSON.stringify({ revision, kind: snapshot.kind,
        reads: snapshot.reads.length, renders: snapshot.renders.length,
        upserted: snapshot.upserted.length, removed: snapshot.removed.length,
        events: snapshot.events }))
      await t.test(`${revision}: actual global-data work`, () => {
        assert.equal(snapshot.revision, revision)
        assert.equal(snapshot.kind, revision === 'initial' ? 'reset' : 'delta')
        assert.equal(snapshot.reads.length, count, `${revision}: Markdown reads`)
        assert.equal(snapshot.renders.length, count, `${revision}: inner renders`)
        if (revision === 'initial') {
          assert.equal(new Set(snapshot.reads).size, count)
          assert.deepEqual(snapshot.renders, snapshot.reads)
          assert.deepEqual(snapshot.events, [])
        } else {
          assert.deepEqual(snapshot.upserted, removed ? [] : [sourceId])
          assert.deepEqual(snapshot.removed, removed ? [sourceId] : [])
          assert.deepEqual(snapshot.reads, removed ? [] : [sourceId])
          assert.deepEqual(snapshot.renders, removed ? [] : [sourceId])
          assert.ok(snapshot.events.length > 0)
          assert.ok(snapshot.events.every((event: { filepath: string }) => event.filepath === source))
        }
      })
    }
    const docCount = Object.values(buildSourceInventory(site)).reduce((count, docs) => count + docs.length, 0)
    assert.ok(docCount > 0)
    await checkTelemetry('initial', docCount)
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
    await beginRevision('body')
    await writeFile(source, updated)
    await waitFor(async () => {
      const output = await Promise.all([
        route + 'index.html', 'runtime/docs/search.json', 'runtime/llms.txt', rawPath,
      ].map(path => readFile(join(outputRoot, path), 'utf8')))
      return output.every(text => text.includes(sentence))
    })
    await checkTelemetry('body', 1)
    const bodyRaw = await rawMtimes()
    assert.deepEqual(Object.keys(bodyRaw), Object.keys(initialRaw))
    assert.deepEqual(Object.keys(bodyRaw).filter(path => bodyRaw[path] !== initialRaw[path]), [rawPath])
    assert.equal(await readFile(siblingPath, 'utf8'), sibling)
    assert.equal((await stat(siblingPath, { bigint: true })).mtimeNs, siblingMtime)

    // Only frontmatter changes: the Markdown heading and raw body stay identical.
    const retitled = updated.replace(/^---\r?\n/, '---\ntitle: "Watch refresh"\n')
    assert.notEqual(retitled, updated)
    await beginRevision('title')
    await writeFile(source, retitled)
    await waitFor(async () => {
      const output = await Promise.all([
        route + 'index.html', 'runtime/docs/index.html', 'runtime/docs/search.json', 'runtime/llms.txt',
      ].map(path => readFile(join(outputRoot, path), 'utf8')))
      return output.every(text => text.includes('Watch refresh'))
    })
    await checkTelemetry('title', 1)
    assert.deepEqual(await rawMtimes(), bodyRaw)

    const renamedRawPath = 'runtime/docs/source/guides/watch-renamed.txt'
    const renamed = retitled.replace('sourcePath: "guides/hello-world.md"', 'sourcePath: "guides/watch-renamed.txt"')
    assert.notEqual(renamed, retitled)
    const raw = await readFile(join(outputRoot, rawPath))
    await beginRevision('rename')
    await writeFile(source, renamed)
    await waitFor(async () => {
      assert.deepEqual(await readFile(join(outputRoot, renamedRawPath)), raw)
      await assert.rejects(access(join(outputRoot, rawPath)), { code: 'ENOENT' })
      return true
    })
    await checkTelemetry('rename', 1)
    const renamedRaw = await rawMtimes()
    assert.deepEqual(Object.keys(renamedRaw).sort(),
      Object.keys(bodyRaw).filter(path => path !== rawPath).concat(renamedRawPath).sort())
    for (const path of Object.keys(bodyRaw).filter(path => path !== rawPath)) {
      assert.equal(renamedRaw[path], bodyRaw[path], `rename must not rewrite ${path}`)
    }
    await beginRevision('delete')
    await rm(source)
    await waitFor(async () => {
      await assert.rejects(access(join(outputRoot, renamedRawPath)), { code: 'ENOENT' })
      await assert.rejects(access(join(outputRoot, route, 'index.html')), { code: 'ENOENT' })
      const search = await readFile(join(outputRoot, 'runtime/docs/search.json'), 'utf8')
      const pack = await readFile(join(outputRoot, 'runtime/llms.txt'), 'utf8')
      return !search.includes(sentence) && !pack.includes(sentence)
        && !search.includes('Watch refresh') && !pack.includes('Watch refresh')
        && !search.includes('guides/watch-renamed.txt') && !pack.includes('guides/watch-renamed.txt')
    })
    await checkTelemetry('delete', 0, true)
    const deletedRaw = await rawMtimes()
    const { [renamedRawPath]: removedMtime, ...remainingRaw } = renamedRaw
    assert.ok(removedMtime)
    assert.deepEqual(deletedRaw, remainingRaw)
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
