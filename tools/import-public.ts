import { linkReferences, type Reference } from './ingestion/references.ts'
/** Import a complete staged collection. Invoked by the manual Silk/Runtime tools. */
import { readFile, readdir, writeFile, mkdir, unlink } from 'node:fs/promises'
import { load as parseYaml } from 'js-yaml'
import { resolve, join, dirname } from 'node:path'
import { collections, docUrl, type Collection } from '#lib/collections.ts'
import { publicContent, description } from './ingestion/content.ts'
import { plainTitle, titleFromMarkdown } from '#lib/titles.ts'

function explicitTitle(metadata: Record<string, any>, file: string): string | undefined {
  if (!Object.hasOwn(metadata, 'title')) return undefined
  if (typeof metadata.title !== 'string' || !plainTitle(metadata.title))
    throw new Error(`Invalid explicit title in ${file}: expected nonempty visible text`)
  return metadata.title
}

export function splitPage(text: string): {
  metadata: Record<string, any>
  body: string
} {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/)
  if (!match) return { metadata: {}, body: text }
  const metadata = parseYaml(match[1]) as Record<string, any>
  return { metadata, body: text.slice(match[0].length).replace(/^\n+/, '') }
}
export function pageText(
  metadata: Record<string, unknown>,
  body: string,
): string {
  return (
    '---\n' +
    Object.entries(metadata)
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join('\n') +
    '\n---\n\n' +
    body
  )
}
export async function importCollection(
  collection: Collection,
  source: string,
  site: string,
): Promise<void> {
  if (!(collection in collections))
    throw new Error(`Unknown collection ${collection}`)
  const src = join(site, 'src')
  const c = collections[collection]
  const catalog: Reference[] = []
  const existing = new Map<
    string,
    { path: string; metadata: Record<string, any>; body: string; text: string }
  >()
  for (const file of (await readdir(src, { recursive: true })).filter((f) =>
    f.endsWith('page.md'),
  )) {
    const path = join(src, file)
    const text = await readFile(path, 'utf8')
    const { metadata, body } = splitPage(text)
    if (metadata.docsCollection && metadata.docsCollection !== collection)
      catalog.push({
        collection: metadata.docsCollection,
        id: metadata.sourcePath.replace(/\.(md|txt)$/, ''),
        title: plainTitle(explicitTitle(metadata, path) ?? '') || titleFromMarkdown(body) || metadata.sourcePath.replace(/\.(md|txt)$/, ''),
      })
    if (metadata.docsCollection === collection)
      existing.set(metadata.sourcePath, { path, metadata, body, text })
  }
  // Prepare the entire batch before writing. New pages can reference one another,
  // while removed pages must not remain in the inline-reference catalog.
  const staged = await Promise.all(
    (await readdir(source, { recursive: true }))
      .filter((file) => /\.(md|txt)$/.test(file))
      .sort()
      .map(async (file) => {
        const input = await readFile(join(source, file), 'utf8')
        const previous = existing.get(file)
        const unchanged = previous?.body === input
        const body = unchanged ? input : publicContent(input, collection, file)
        const heading = titleFromMarkdown(body)
        const override = explicitTitle(previous?.metadata || {}, file)
        const title = override === undefined ? heading || file.replace(/\.(md|txt)$/, '') : plainTitle(override)
        return { file, previous, unchanged, body, title, heading, override }
      }),
  )
  for (const entry of staged)
    catalog.push({
      collection,
      id: entry.file.replace(/\.(md|txt)$/, ''),
      title: entry.title,
    })
  const imported = new Set(staged.map((entry) => entry.file))
  let nextOrder =
    Math.max(0, ...[...existing.values()].map((e) => e.metadata.order)) + 1
  const pending: { path: string; text: string; previous?: string }[] = []
  const routes = new Set<string>()
  for (const { file, previous, unchanged, body, title, heading, override } of staged) {
    const path =
      previous?.path || join(src, docUrl(collection, file), 'page.md')
    if (routes.has(path))
      throw new Error(`Import route collision: ${file} maps to ${path}`)
    routes.add(path)
    // Website-owned and otherwise unchanged pages retain their exact public copy
    // and editorial metadata. They have already passed through ingestion.
    if (unchanged) continue
    const text = linkReferences(body, collection, file, catalog)
    const metadata = {
      ...(previous?.metadata || {
        layout: collection === 'silk' && file === 'spec/2026.md' ? 'spec' : 'docs',
        description: '',
        docsCollection: collection,
        section: file.includes('/') ? file.split('/')[0] : 'overview',
        order: nextOrder++,
        sourcePath: file,
        githubRepo: c.repo,
        githubRef: 'master',
      }),
      ...(override === undefined && !heading ? { title } : {}),
      description: description(text),
    }
    pending.push({
      path,
      text: pageText(metadata, text),
      previous: previous?.text,
    })
  }
  for (const update of pending) {
    if (update.text === update.previous) continue
    await mkdir(dirname(update.path), { recursive: true })
    await writeFile(update.path, update.text)
  }
  for (const [file, previous] of existing)
    if (!imported.has(file)) await unlink(previous.path)
  console.log(`Imported ${imported.size} ${collection} pages.`)
}
export async function exportCollection(
  collection: Collection,
  dest: string,
  site: string,
): Promise<void> {
  const src = join(site, 'src')
  for (const file of (await readdir(src, { recursive: true })).filter((f) =>
    f.endsWith('page.md'),
  )) {
    const { metadata, body } = splitPage(
      await readFile(join(src, file), 'utf8'),
    )
    if (metadata.docsCollection !== collection) continue
    const path = join(dest, metadata.sourcePath)
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, body)
  }
}
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  const args = process.argv.slice(2)
  const exporting = args[0] === '--export'
  if (exporting) args.shift()
  const [collection, source, site = '.'] = args
  if (!collection || !source)
    throw new Error(
      'Usage: node tools/import-public.ts [--export] COLLECTION STAGED_SOURCE [SITE_ROOT]',
    )
  await (exporting ? exportCollection : importCollection)(
    collection as Collection,
    resolve(source),
    resolve(site),
  )
}
