import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { load } from 'js-yaml'
import { collections, type Collection } from '#lib/collections.ts'

export interface Issue { path: string; message: string }
export interface AuditContext { siteRoot: string; outputRoot: string; runtimeRepo?: string; inventory?: SourceInventory }
interface SourceItem { id: string; file: string }
export type SourceInventory = Record<Collection, SourceItem[]>
export interface CollectionConfig { source: string; items: SourceItem[]; kind: string }

export function buildSourceInventory(siteRoot: string): SourceInventory {
  const inventory = Object.fromEntries(Object.keys(collections).map(key => [key, []])) as unknown as SourceInventory
  for (const path of markdownFiles(pathJoin(siteRoot, 'src')).sort()) {
    if (!path.endsWith('/page.md')) continue
    const frontmatter = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(read(path))
    if (!frontmatter) continue
    const data = load(frontmatter[1]!) as Record<string, unknown> | undefined
    if (!data || typeof data.docsCollection !== 'string' || !Object.hasOwn(collections, data.docsCollection)) continue
    if (typeof data.sourcePath !== 'string' || !/\.(md|txt)$/.test(data.sourcePath) || normalizeRelPath(data.sourcePath) !== data.sourcePath) {
      throw new Error(`${path}: invalid or missing sourcePath`)
    }
    inventory[data.docsCollection as Collection].push({ id: data.sourcePath.replace(/\.(md|txt)$/, ''), file: data.sourcePath })
  }
  return inventory
}

// Scope reuse to this invocation, never a process-global cache of source metadata.
export function withSourceInventory(context: AuditContext): AuditContext {
  return context.inventory ? context : { ...context, inventory: buildSourceInventory(context.siteRoot) }
}
export type Reporter = Pick<Console, 'log' | 'error'>

// Translate the Python regex constructs used by these audits, without changing policy.
// In particular: Unicode word/space classes, dotted/dotless I under IGNORECASE,
// and Python's newline-only dot and multiline anchors.
export function pattern(source: string, flags = ''): RegExp {
  const word = '[\\p{L}\\p{N}_]'
  let translated = ''
  let inClass = false
  for (let index = 0; index < source.length; index++) {
    const char = source[index]!
    if (char === '\\') {
      const next = source[++index]!
      translated += next === 's' ? '[\\p{White_Space}\\x1c-\\x1f]'
        : next === 'b' ? `(?:(?<!${word})(?=${word})|(?<=${word})(?!${word}))` : `\\${next}`
    } else if (char === '[') {
      inClass = true
      translated += char
      if (flags.includes('i') && /[iI]|a-z|A-Z/.test(source.slice(index + 1, source.indexOf(']', index)))) translated += 'İı'
    } else if (char === ']') { inClass = false; translated += char }
    else if (!inClass && char === '.') translated += '[^\\n]'
    else if (!inClass && char === '^') translated += flags.includes('m') ? '(?:^|(?<=\\n))' : '^'
    else if (!inClass && char === '$') translated += flags.includes('m') ? '(?=\\n|$)' : '(?=\\n?$)'
    else if (!inClass && flags.includes('i') && /[iI]/.test(char)) translated += '[iIİı]'
    else translated += char
  }
  return new RegExp(translated, flags.replace('m', '') + 'u')
}
export const trim = (text: string): string => text.replace(pattern('^\\s+|\\s+$', 'g'), '')
export const lines = (text: string): string[] => {
  const result = text.split(/\r\n|[\n\r\v\f\x1c-\x1e\x85\u2028\u2029]/u)
  if (result.at(-1) === '') result.pop()
  return result
}
export const read = (path: string): string => readFileSync(path, 'utf8').replace(/\r\n?/g, '\n')
// pathlib joins normalize dots and repeated separators, but not parent segments.
export function pathJoin(...parts: string[]): string {
  let value = ''
  for (const part of parts) value = isAbsolute(part) || !value ? part : `${value}/${part}`
  const absolute = value.startsWith('/')
  return (absolute ? '/' : '') + value.split('/').filter(p => p && p !== '.').join('/')
}
export function collectionConfig(context: AuditContext, collection: Collection): CollectionConfig {
  const root = pathJoin(context.outputRoot, collections[collection].base.slice(1))
  return { source: pathJoin(root, 'source'), items: (context.inventory ?? buildSourceInventory(context.siteRoot))[collection], kind: collection === 'silkWiki' ? 'wiki' : 'docs' }
}
export function markdownFiles(root: string, recursive = true): string[] {
  if (!existsSync(root)) return []
  const entries = readdirSync(root, { withFileTypes: true })
  const files = entries.filter(e => e.name.endsWith('.md')).map(e => pathJoin(root, e.name))
  if (recursive) for (const entry of entries) {
    if (entry.isDirectory()) files.push(...markdownFiles(pathJoin(root, entry.name)))
  }
  return files
}
export const collectionIds = (config: CollectionConfig): Set<string> => new Set(config.items.map(item => item.id))
export function checkRawOutputs(config: CollectionConfig): Issue[] {
  return config.items.filter(item => !existsSync(pathJoin(config.source, item.file)))
    .map(item => ({ path: pathJoin(config.source, item.file), message: 'Missing raw output for source page; run build scripts first.' }))
}
export function normalizeRelPath(input: string): string | undefined {
  if (!input) return undefined
  const raw = trim(input).replaceAll('\\', '/').replace(/^\.\//, '').replace(/^\/+/, '')
  const parts: string[] = []
  for (const rawPart of raw.split('/')) {
    const part = trim(rawPart)
    if (!part || part === '.') continue
    if (part === '..') { if (!parts.length) return undefined; parts.pop() }
    else parts.push(part)
  }
  const result = parts.join('/')
  return result && !result.includes('\0') ? result : undefined
}
function canonical(path: string): string {
  try { return realpathSync(path) } catch {
    const parent = dirname(path)
    return parent === path ? path : resolve(canonical(parent), path.slice(parent.length + 1))
  }
}
export function resolveDoclikeTarget(href: string, file: string, root: string, sources: Record<string, string>): string | undefined {
  let raw = trim(href)
  if (raw.startsWith('<') && raw.endsWith('>')) raw = trim(raw.slice(1, -1))
  if (!raw || ['http://', 'https://', 'mailto:', 'tel:', 'data:', 'javascript:', '#'].some(p => raw.startsWith(p))) return
  if (raw.startsWith('?p=') || raw.startsWith('/?p=') || raw.includes('&p=')) return
  raw = trim(raw.split('#', 1)[0]!.split('?', 1)[0]!)
  if (!raw || !(raw.endsWith('.md') || raw.endsWith('.txt') || Object.keys(sources).some(p => raw.startsWith(`${p}/`)))) return
  if (raw.startsWith('/')) return pathJoin(root, raw.replace(/^\/+/, ''))
  for (const [prefix, source] of Object.entries(sources)) {
    if (raw.startsWith(`${prefix}/`)) {
      const rel = normalizeRelPath(raw.slice(prefix.length + 1))
      return rel ? pathJoin(source, rel) : undefined
    }
  }
  const rel = normalizeRelPath(raw)
  if (!rel) return
  const target = canonical(resolve(dirname(file), rel))
  const fromRoot = relative(root, target)
  if (fromRoot === '..' || fromRoot.startsWith('../') || isAbsolute(fromRoot)) return
  return target
}
export function checkPLinks(config: CollectionConfig, ids: Record<string, Set<string>>, includeKind = false): Issue[] {
  const issues: Issue[] = []
  for (const path of markdownFiles(config.source)) for (const match of read(path).matchAll(/(?:([a-zA-Z0-9_-]+)\/)?\?p=([a-zA-Z0-9_./-]+)/g)) {
    const kind = match[1] || config.kind
    const id = match[2]!
    if (!ids[kind]?.has(id)) issues.push({ path, message: `Broken ?p= link: ${includeKind ? `${kind}/` : ''}${id}` })
  }
  return issues
}
export function checkDocLinks(source: string, root: string, sources: Record<string, string>): Issue[] {
  const issues: Issue[] = []
  for (const path of markdownFiles(source)) for (const match of read(path).matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const href = match[1]!
    const target = resolveDoclikeTarget(href, path, root, sources)
    if (target && !existsSync(target)) {
      const display = target.startsWith(root + '/') ? target.slice(root.length + 1) : target
      issues.push({ path, message: `Missing link target: ${href} -> ${display}` })
    }
  }
  return issues
}
const editorial = [
  '^\\s*#{1,6}\\s+(?:Status(?:\\s*\\([^)]*\\))?|Status and Future Work|Future Work|Follow-ups)\\s*$',
  '^\\s*#{1,6}\\s+.+\\s+\\(Planned(?:[^)]*)\\)\\s*$',
  '^\\s*Status:\\s*\\*\\*.+\\*\\*',
  '^\\s*#{1,6}\\s+Current API(?:\\s*\\([^)]*\\))?\\s*$',
  '^\\s*#{1,6}\\s+API\\s*\\((?:selected|implemented[^)]*|initial[^)]*|current[^)]*)\\)\\s*$',
  '\\b(?:Implemented subset|Current supported|Implemented-subset|active expansion|current compiler subset|initial implementation)\\b',
].map(source => pattern(source, 'i'))
export function checkLines(source: string, kind: 'viewer' | 'manpage' | 'editorial'): Issue[] {
  const issues: Issue[] = []
  const expressions = kind === 'editorial' ? editorial : kind === 'viewer'
    ? [/(?<!\]\()(?<!\()(?<!\/)\?p=[a-zA-Z0-9_./-]+/]
    : [/(?<!\[)`[A-Za-z0-9_:+.-]+` \(([137])\)/]
  const message = kind === 'editorial' ? 'avoid status-style or transitional editorial framing in published docs.'
    : `raw ${kind === 'viewer' ? '?p=' : 'manpage'} reference must be a markdown link.`
  for (const path of markdownFiles(source)) {
    let fence = false
    for (const [index, line] of lines(read(path)).entries()) {
      const stripped = line.replace(pattern('^\\s+'), '')
      if (stripped.startsWith('```') || stripped.startsWith('~~~')) { fence = !fence; continue }
      if (fence || (kind !== 'editorial' && stripped.startsWith('#'))) continue
      if (expressions.some(re => re.test(line))) issues.push({ path, message: `Line ${index + 1}: ${message}` })
    }
  }
  return issues
}
export function reportIssues(issues: Issue[], root: string, success: string, reporter: Reporter = console, label = 'issues'): number {
  if (!issues.length) { reporter.log(success); return 0 }
  for (const issue of issues.slice(0, 200)) reporter.error(`${relative(root, issue.path)}: ${issue.message}`)
  if (issues.length > 200) reporter.error(`... and ${issues.length - 200} more`)
  reporter.error(`FAIL: ${issues.length} ${label}`)
  return 1
}
export function runSiteAudit(context: AuditContext, collection: Exclude<Collection, 'silkWiki'>, reporter: Reporter = console): number {
  const config = collectionConfig(context, collection)

  return reportIssues([
    ...checkRawOutputs(config), ...checkPLinks(config, { docs: collectionIds(config) }),
    ...checkDocLinks(config.source, context.outputRoot, { docs: config.source }),
    ...checkLines(config.source, 'viewer'), ...checkLines(config.source, 'manpage'), ...checkLines(config.source, 'editorial'),
  ], context.outputRoot, `OK: ${collection} site audit passed`, reporter)
}
