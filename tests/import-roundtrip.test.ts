import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { collections, type Collection } from '#lib/collections.ts'
import { exportCollection, importCollection, splitPage } from '../tools/import-public.ts'
test('redirectFrom survives importing changed upstream bodies', async () => {
  const site = await mkdtemp(join(tmpdir(), 'oro-import-redirects-'))
  const pages = [
    ['silk/docs/guides/practical-logger-module/page.md', '/silk/docs/guides/toy-logger-module/'],
    ['silk/spec/2026/page.md', '/silk/docs/spec/2026/'],
  ]
  try {
    const stage = join(site, 'staged')
    for (const [file, alias] of pages) {
      const text = await readFile(join('src', file), 'utf8')
      const { metadata, body } = splitPage(text)
      assert.deepEqual(metadata.redirectFrom, [alias])
      await mkdir(dirname(join(site, 'src', file)), { recursive: true })
      await writeFile(join(site, 'src', file), text)
      await mkdir(dirname(join(stage, metadata.sourcePath)), { recursive: true })
      await writeFile(join(stage, metadata.sourcePath), body + '\nUpstream redirect preservation regression.\n')
    }
    await importCollection('silk', stage, site)
    for (const [file, alias] of pages) {
      const { metadata, body } = splitPage(await readFile(join(site, 'src', file), 'utf8'))
      assert.deepEqual(metadata.redirectFrom, [alias], file)
      assert.match(body, /Upstream redirect preservation regression\./, file)
    }
  } finally {
    await rm(site, { recursive: true, force: true })
  }
})

test('all 585 public documents survive an unchanged refresh byte for byte', async () => {
  const site = await mkdtemp(join(tmpdir(), 'oro-import-roundtrip-'))
  try {
    await cp('src', join(site, 'src'), { recursive: true })
    for (const key of Object.keys(collections) as Collection[]) {
      const stage = join(site, 'staged', key)
      await exportCollection(key, stage, site)
      await importCollection(key, stage, site)
    }
    const files = (await readdir('src', { recursive: true })).filter((f) =>
      f.endsWith('page.md'),
    )
    assert.equal(files.length, 585)
    for (const file of files)
      assert.equal(
        await readFile(join(site, 'src', file), 'utf8'),
        await readFile(join('src', file), 'utf8'),
        file,
      )
  } finally {
    await rm(site, { recursive: true, force: true })
  }
})
