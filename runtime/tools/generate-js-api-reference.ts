#!/usr/bin/env node
import { access, mkdir, mkdtemp, rm, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve, join, basename } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import { stageCollection, importCollection, readText, writeTextIfChanged, splitLines } from '../../tools/source-pages.ts'
import { DEFAULT_SEE_ALSO, DESCRIPTION_BY_FAMILY, EXAMPLES_BY_FAMILY, GUIDE_REFS_BY_FAMILY } from './js-api-reference-content.ts'

export const CURATED_FILES_BY_FAMILY: Record<string, string> = Object.fromEntries(
  ['ai', 'application', 'extension', 'fs', 'hooks', 'mcp', 'notification', 'secure-storage', 'window'].map(name => [`oro:${name}`, `${name}.md`]))
export const EXCLUDED_PUBLIC_FAMILIES = new Set(['oro:bootstrap', 'oro:external', 'oro:internal', 'oro:node', 'oro:node-esm-loader'])
export const REF_START = '<!-- GENERATED: ORO_API_REFERENCE_START -->'
export const REF_END = '<!-- GENERATED: ORO_API_REFERENCE_END -->'
export interface ModuleBlock { spec: string; block: string }
export function parseIndexDTS(text: string): Record<string, ModuleBlock> {
  const lines = splitLines(text)
  const blocks: Record<string, ModuleBlock> = {}
  for (let i = 0; i < lines.length; i++) {
    const match = /^declare module ['"](oro:[^'"]+)['"]\s*\{\s*$/.exec(lines[i])
    if (!match) continue
    const spec = match[1].trim()
    const buf = [lines[i].trimEnd()]
    while (++i < lines.length) {
      const line = lines[i].trimEnd()
      buf.push(line)
      if (line === '}' && !/^[ \t]/.test(lines[i])) break
    }
    blocks[spec] = { spec, block: buf.join('\n').trimEnd() + '\n' }
  }
  if (!Object.keys(blocks).length) throw new Error("No `declare module 'oro:*' { ... }` blocks found.")
  return blocks
}
export function familyOf(spec: string): string { return spec.split('/', 1)[0] }
export function sortSpecsInFamily(family: string, specs: string[]): string[] {
  return [...specs].sort().sort((a, b) => Number(a !== family) - Number(b !== family))
}
export function preferredImportSpec(family: string, specs: string[], blocks: Record<string, ModuleBlock>): string {
  return family in blocks ? family : specs.find(s => s.endsWith('/index')) ?? specs[0]
}
export function familyTitle(family: string, blocks: Record<string, ModuleBlock>): string {
  return '`' + family + (family in blocks ? '' : '/*') + '`'
}
export function familyIntro(family: string): string {
  return DESCRIPTION_BY_FAMILY[family] ?? `This page documents the exported JavaScript surface for \`${family}\` as declared by the runtime’s published TypeScript definitions.\n`
}
export function renderExamplesSection(family: string): string {
  const body = EXAMPLES_BY_FAMILY[family]
  if (!body) throw new Error(`Missing generated examples for ${family}`)
  return `## Examples\n\n${body.trimEnd()}\n`
}
export function renderSeeAlsoSection(): string {
  return ['## See also', '', ...DEFAULT_SEE_ALSO.map(([label, id]) => `- [${label}](?p=${id})`), ''].join('\n')
}
export function renderRelatedGuidesSection(family: string): string {
  const refs = GUIDE_REFS_BY_FAMILY[family] ?? []
  return refs.length ? ['## Related guides', '', ...refs.map(([label, id]) => `- [${label}](?p=${id})`), ''].join('\n') : ''
}
export function renderReferenceSection(family: string, specs: string[], blocks: Record<string, ModuleBlock>): string {
  const sorted = sortSpecsInFamily(family, specs)
  const lines = ['## API reference', '', REF_START, '', '### Module specifiers', '', '```text', ...sorted, '```', '',
    '### TypeScript declarations', '', "These declarations are generated from the runtime's published TypeScript surface.", '']
  for (const spec of sorted) lines.push(`#### \`${spec}\``, '', '```ts', ...splitLines(blocks[spec].block.trimEnd()), '```', '')
  return [...lines, REF_END, ''].join('\n')
}
export async function updateCuratedPage(path: string, family: string, specs: string[], blocks: Record<string, ModuleBlock>): Promise<boolean> {
  const text = await readText(path)
  let next: string
  if (text.includes(REF_START) && text.includes(REF_END)) {
    const start = text.indexOf(REF_START)
    const end = text.indexOf(REF_END, start + REF_START.length)
    if (end < 0) throw new Error(`Reversed generated reference markers in ${path}`)
    const before = text.slice(0, start).trimEnd().replace(/(?:\n## API reference\s*)+$/, '\n')
    next = before.trimEnd() + '\n\n' + renderReferenceSection(family, specs, blocks) + text.slice(end + REF_END.length).trimStart()
  } else next = text.trimEnd() + '\n\n' + renderReferenceSection(family, specs, blocks)
  if (!next.includes('\n## See also\n') && !next.startsWith('## See also\n')) next = next.trimEnd() + '\n\n' + renderSeeAlsoSection()
  return writeTextIfChanged(path, next.trimEnd() + '\n')
}
export function renderGeneratedPage(_path: string, family: string, specs: string[], blocks: Record<string, ModuleBlock>): string {
  const lines = [`# ${familyTitle(family, blocks)}`, '', familyIntro(family).trimEnd(), '']
  const related = renderRelatedGuidesSection(family)
  if (related) lines.push(related.trimEnd(), '')
  lines.push(renderExamplesSection(family).trimEnd(), '', renderReferenceSection(family, specs, blocks).trimEnd(), '', renderSeeAlsoSection().trimEnd(), '')
  return lines.join('\n').trimEnd() + '\n'
}
export async function generateReference(site: string, runtimeRepo: string): Promise<void> {
  const index = resolve(runtimeRepo, 'api/index.d.ts')
  try { await access(index) } catch { throw new Error(`Missing ${index}`) }
  const blocks = parseIndexDTS(await readText(index))
  const families: Record<string, string[]> = {}
  for (const spec of Object.keys(blocks)) (families[familyOf(spec)] ??= []).push(spec)
  const staged = await mkdtemp(join(tmpdir(), 'oro-runtime-import-'))
  const written: string[] = [], removed: string[] = []
  try {
    await stageCollection('runtime', staged, site)
    const out = join(staged, 'javascript')
    await mkdir(out, { recursive: true })
    for (const family of Object.keys(families).sort()) {
      if (EXCLUDED_PUBLIC_FAMILIES.has(family)) continue
      const curated = CURATED_FILES_BY_FAMILY[family]
      const path = join(out, curated ?? `${family.slice(4)}.md`)
      if (curated) {
        try { await access(path) } catch { throw new Error(`Expected curated file to exist: ${path}`) }
        if (await updateCuratedPage(path, family, families[family], blocks)) written.push(path)
      } else if (await writeTextIfChanged(path, renderGeneratedPage(path, family, families[family], blocks))) written.push(path)
    }
    for (const family of [...EXCLUDED_PUBLIC_FAMILIES].sort()) {
      const path = join(out, `${family.slice(4)}.md`)
      try { await unlink(path); removed.push(path) } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      }
    }
    await importCollection('runtime', staged, site)
  } finally { await rm(staged, { recursive: true, force: true }) }
  if (written.length || removed.length) {
    console.log('Wrote:')
    for (const path of written) console.log(`- ${join(site, 'src/runtime/docs/javascript', basename(path, '.md'), 'page.md')}`)
    for (const path of removed) console.log(`- removed ${join(site, 'src/runtime/docs/javascript', basename(path, '.md'), 'page.md')}`)
  } else console.log('Unchanged: generated JavaScript API reference pages')
}
export async function main(args = process.argv.slice(2)): Promise<void> {
  const { values } = parseArgs({ args, options: { 'runtime-repo': { type: 'string' }, help: { type: 'boolean', short: 'h' } } })
  if (values.help) { console.log('Refresh Runtime API Markdown while preserving curated prose.\n\nUsage: node runtime/tools/generate-js-api-reference.ts [--runtime-repo PATH]'); return }
  const site = fileURLToPath(new URL('../../', import.meta.url))
  await generateReference(site, values['runtime-repo'] ?? resolve(site, '../runtime'))
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error(error.message)
    process.exitCode = error.code?.startsWith('ERR_PARSE_ARGS_') ? 2 : 1
  })
}
