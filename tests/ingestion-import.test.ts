import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { generateReference, REF_START, REF_END } from '../runtime/tools/generate-js-api-reference.ts'
import { syncFromSilkDocs } from '../silk/tools/sync-from-silk-docs.ts'
import { pageText, splitPage } from '../tools/import-public.ts'

async function temporary(run: (site: string, upstream: string) => Promise<void>): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), 'oro-ingestion-import-test-'))
  try {
    const site = join(root, 'site'), upstream = join(root, 'upstream')
    await mkdir(join(site, 'src'), { recursive: true })
    await mkdir(upstream)
    await run(site, upstream)
  } finally { await rm(root, { recursive: true, force: true }) }
}
async function put(path: string, body: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, body)
}
async function page(site: string, route: string, collection: string, sourcePath: string, body: string): Promise<string> {
  const path = join(site, 'src', route, 'page.md')
  await put(path, pageText({ layout: `${collection}-docs`, title: 'Authored title', description: 'Authored description', docsCollection: collection, sourcePath, order: 7, section: 'authored', githubRepo: 'preserved/repository', githubRef: 'authored-ref' }, body))
  return path
}
test('Runtime generator uses the public importer, prunes excluded families, and retains curated metadata', async () => temporary(async (site, upstream) => {
  const curated = await page(site, 'runtime/docs/javascript/application', 'runtime', 'javascript/application.md', '# Application\n\nAuthored introduction.\n\n' + REF_START + '\nOld API\n' + REF_END + '\n\nAuthored footer.\n')
  const excluded = await page(site, 'runtime/docs/javascript/internal', 'runtime', 'javascript/internal.md', '# Internal\n')
  const unrelated = await page(site, 'runtime/docs/guides/custom', 'runtime', 'guides/custom.md', '# Guide\n\nWorks today: authored {{ literal }}.\n')
  const untouched = await readFile(unrelated, 'utf8')
  await put(join(upstream, 'api/index.d.ts'), "declare module 'oro:application' {\n  export function ping(): void;\n}\ndeclare module 'oro:assert' {\n  export function ok(value: unknown): void;\n}\ndeclare module 'oro:internal' {\n  export const privateAPI: true;\n}\n")
  await generateReference(site, upstream)
  const { metadata, body } = splitPage(await readFile(curated, 'utf8'))
  assert.ok(body.includes('Authored introduction.'))
  assert.ok(body.includes('Authored footer.'))
  assert.ok(body.includes('ping()'))
  assert.ok(!body.includes('Old API'))
  assert.equal(metadata.order, 7)
  assert.equal(metadata.githubRef, 'authored-ref')
  assert.equal(metadata.section, 'authored')
  assert.equal(await readFile(unrelated, 'utf8'), untouched)
  await assert.rejects(stat(excluded), { code: 'ENOENT' })
  const generated = join(site, 'src/runtime/docs/javascript/assert/page.md')
  const first = await readFile(generated, 'utf8')
  assert.equal(splitPage(first).metadata.layout, 'runtime-docs')
  await generateReference(site, upstream)
  assert.equal(await readFile(generated, 'utf8'), first)
}))
test('Silk imports prune upstream-owned pages but retain authored pages and an absent upstream wiki', async () => temporary(async (site, upstream) => {
  const landing = await page(site, 'silk/docs/start', 'silk', 'start.md', '# Silk\n\nWorks today: authored.\n')
  const guide = await page(site, 'silk/docs/guides/custom', 'silk', 'guides/custom.md', '# Guide\n\nAuthored guide.\n')
  const wiki = await page(site, 'silk/wiki/reference', 'silkWiki', 'reference.md', '# Wiki\n\nWorks today: preserve without upstream wiki.\n')
  const removed = await page(site, 'silk/docs/language/removed', 'silk', 'language/removed.md', '# Removed\n')
  const originals = await Promise.all([landing, guide, wiki].map(path => readFile(path, 'utf8')))
  await put(join(upstream, 'docs/start.md'), '# Upstream start\n')
  await put(join(upstream, 'docs/guides/custom.md'), '# Upstream guide\n')
  await put(join(upstream, 'docs/language/new.md'), '# New\n\nWorks today: prose\n\n```silk\n// Works today: {{ literal }}  \n```\n')
  await syncFromSilkDocs(site, upstream)
  assert.deepEqual(await Promise.all([landing, guide, wiki].map(path => readFile(path, 'utf8'))), originals)
  await assert.rejects(stat(removed), { code: 'ENOENT' })
  const added = join(site, 'src/silk/docs/language/new/page.md')
  const first = await readFile(added, 'utf8')
  assert.equal(splitPage(first).metadata.layout, 'silk-docs')
  assert.ok(first.includes('// Works today: {{ literal }}  \n'))
  await syncFromSilkDocs(site, upstream)
  assert.equal(await readFile(added, 'utf8'), first)
  await put(join(upstream, 'docs/wiki/fresh.md'), '# Fresh wiki\n')
  await syncFromSilkDocs(site, upstream)
  await assert.rejects(stat(wiki), { code: 'ENOENT' })
  assert.ok((await readFile(join(site, 'src/silk/wiki/fresh/page.md'), 'utf8')).includes('# Fresh wiki'))
}))
test('Runtime validation failures do not partially import staged changes', async () => temporary(async (site, upstream) => {
  const curated = await page(site, 'runtime/docs/javascript/application', 'runtime', 'javascript/application.md', '# Authored\n')
  const original = await readFile(curated, 'utf8')
  await put(join(upstream, 'api/index.d.ts'), "declare module 'oro:application' {\n  export function ping(): void;\n}\ndeclare module 'oro:unknown' {\n}\n")
  await assert.rejects(generateReference(site, upstream), /Missing generated examples/)
  assert.equal(await readFile(curated, 'utf8'), original)
}))
