import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cp, mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { collections, type Collection } from '#lib/collections.ts'
import { exportCollection, importCollection } from '../tools/import-public.ts'
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
