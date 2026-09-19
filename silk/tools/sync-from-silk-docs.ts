#!/usr/bin/env node
import { access, copyFile, mkdir, mkdtemp, rm, unlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import { files, readText, preserveFences, stageCollection, importCollection } from '../../tools/source-pages.ts'
import { EXCLUDE_BASENAMES, KEEP_DOCS_FILES, KEEP_DOCS_PREFIXES, KEEP_WIKI_FILES } from '../../tools/silk-ingestion-data.ts'
import { sanitizeDocsMarkdown, sanitizeWikiMarkdown, normalizeEditorialFraming, normalizeUserFacingLinks, normalizeHeadingsForContext, normalizeTrailingNewlines } from '../../tools/silk-editorial.ts'
export { EXCLUDE_BASENAMES, KEEP_DOCS_FILES, KEEP_DOCS_PREFIXES, KEEP_WIKI_FILES }
export * from '../../tools/silk-editorial.ts'
export interface Ownership { keepFiles?: readonly string[]; keepPrefixes?: readonly string[] }
export interface SyncStats { copied: number; skipped: number; deleted: number }
export function shouldSkip(rel: string, { keepFiles = [], keepPrefixes = [] }: Ownership): boolean {
  return EXCLUDE_BASENAMES.includes(basename(rel)) || keepFiles.includes(rel) || keepPrefixes.some(prefix => rel.startsWith(prefix))
}
export async function syncTree(src: string, dst: string, options: Ownership & { sanitize?: (rel: string, text: string) => string }): Promise<SyncStats> {
  const copied = new Set<string>()
  let skipped = 0, deleted = 0
  for (const path of await files(src)) {
    if (!['.md', '.txt'].includes(extname(path))) continue
    const rel = relative(src, path)
    if (shouldSkip(rel, options)) { skipped++; continue }
    const dest = join(dst, rel)
    await mkdir(dirname(dest), { recursive: true })
    if (options.sanitize && extname(path) === '.md') await writeFile(dest, options.sanitize(rel, await readText(path)))
    else await copyFile(path, dest)
    copied.add(rel)
  }
  for (const path of await files(dst)) {
    if (!['.md', '.txt'].includes(extname(path))) continue
    const rel = relative(dst, path)
    if (!EXCLUDE_BASENAMES.includes(basename(path)) && (shouldSkip(rel, options) || copied.has(rel))) continue
    await unlink(path); deleted++
  }
  return { copied: copied.size, skipped, deleted }
}
export async function postprocessTree(root: string, options: Ownership = {}): Promise<void> {
  for (const path of await files(root)) {
    if (extname(path) !== '.md' || shouldSkip(relative(root, path), options)) continue
    const text = await readText(path)
    const next = preserveFences(text, body => normalizeTrailingNewlines(normalizeHeadingsForContext(path, normalizeUserFacingLinks(normalizeEditorialFraming(body)))))
    if (next !== text) await writeFile(path, next)
  }
}
export async function syncFromSilkDocs(site: string, silkRepo: string): Promise<void> {
  const srcDocs = resolve(silkRepo, 'docs'), srcWiki = join(srcDocs, 'wiki')
  try { await access(srcDocs) } catch { throw new Error(`Missing source docs at ${srcDocs}`) }
  const staged = await mkdtemp(join(tmpdir(), 'oro-silk-import-'))
  try {
    const dstDocs = join(staged, 'docs'), dstWiki = join(staged, 'wiki')
    // Empty collections still need a staging directory for the importer.
    await mkdir(dstDocs); await mkdir(dstWiki)
    await stageCollection('silk', dstDocs, site)
    await stageCollection('silkWiki', dstWiki, site)
    const docsStats = await syncTree(srcDocs, dstDocs, {
      keepFiles: KEEP_DOCS_FILES, keepPrefixes: [...KEEP_DOCS_PREFIXES, 'wiki/'],
      sanitize: (rel, text) => preserveFences(text, body => sanitizeDocsMarkdown(rel, body)),
    })
    let hasWiki = true
    try { await access(srcWiki) } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      hasWiki = false
    }
    const wikiStats = hasWiki ? await syncTree(srcWiki, dstWiki, {
      keepFiles: KEEP_WIKI_FILES, sanitize: (rel, text) => preserveFences(text, body => sanitizeWikiMarkdown(rel, body)),
    }) : { copied: 0, skipped: 0, deleted: 0 }
    await postprocessTree(dstDocs, { keepFiles: KEEP_DOCS_FILES, keepPrefixes: KEEP_DOCS_PREFIXES })
    await postprocessTree(dstWiki, { keepFiles: KEEP_WIKI_FILES })
    await importCollection('silk', dstDocs, site)
    if (hasWiki) await importCollection('silkWiki', dstWiki, site)
    console.log('Synced Silk docs to website:')
    console.log(`- Docs copied:   ${docsStats.copied} (skipped: ${docsStats.skipped}, deleted: ${docsStats.deleted})`)
    console.log(`- Wiki copied:   ${wikiStats.copied} (skipped: ${wikiStats.skipped}, deleted: ${wikiStats.deleted})`)
  } finally { await rm(staged, { recursive: true, force: true }) }
}
export async function main(args = process.argv.slice(2)): Promise<void> {
  const { values } = parseArgs({ args, options: { 'repo-root': { type: 'string' }, 'silk-repo': { type: 'string' }, help: { type: 'boolean', short: 'h' } } })
  if (values.help) { console.log('Sync Silk docs/wiki from the repo (silk/docs) into the website copies (website/silk).\n\nUsage: node silk/tools/sync-from-silk-docs.ts [--repo-root PATH] [--silk-repo PATH]'); return }
  const site = fileURLToPath(new URL('../../', import.meta.url))
  await syncFromSilkDocs(site, values['silk-repo'] ?? resolve(values['repo-root'] ?? resolve(site, '..'), 'silk'))
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error(error.message)
    process.exitCode = error.code?.startsWith('ERR_PARSE_ARGS_') ? 2 : 1
  })
}
