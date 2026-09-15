import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, writeFile, mkdir, mkdtemp, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'
import { files, preserveFences, splitLines } from '../tools/source-pages.ts'
import { KEEP_DOCS_FILES, KEEP_DOCS_PREFIXES, syncTree, postprocessTree, sanitizeDocsMarkdown, sanitizeWikiMarkdown, normalizeEditorialFraming, normalizeUserFacingLinks, normalizeHeadingsForContext, normalizeTrailingNewlines, main as silkMain } from '../silk/tools/sync-from-silk-docs.ts'
import { parseIndexDTS, renderGeneratedPage, updateCuratedPage } from '../runtime/tools/generate-js-api-reference.ts'
import { DESCRIPTION_BY_FAMILY, EXAMPLES_BY_FAMILY, GUIDE_REFS_BY_FAMILY, DEFAULT_SEE_ALSO } from '../runtime/tools/js-api-reference-content.ts'

// Captured from the original Python implementations before removal.
const fixture = JSON.parse(await readFile(new URL('./ingestion-fixtures.json', import.meta.url), 'utf8')) as {
  cases: { rel: string; path: string; kind: string; input: string; expected: string }[]
  runtimeFamilies: string[]; runtimeSHA256: string; contentSHA256: string
  tree: { source: Record<string, string>; staged: Record<string, string>; stats: { copied: number; skipped: number; deleted: number }; expected: Record<string, string> }
  curated: { input: string; declarations: string; expected: string; secondExpected: string }[]
}
const sha256 = (text: string) => createHash('sha256').update(text).digest('hex')
async function temporary(run: (root: string) => Promise<void>): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), 'oro-ingestion-test-'))
  try { await run(root) } finally { await rm(root, { recursive: true, force: true }) }
}
test('evaluated runtime content and all family renderers match the Python oracle exactly', () => {
  assert.equal(sha256(JSON.stringify([DESCRIPTION_BY_FAMILY, EXAMPLES_BY_FAMILY, GUIDE_REFS_BY_FAMILY, DEFAULT_SEE_ALSO])), fixture.contentSHA256)
  const rendered = fixture.runtimeFamilies.map(family => {
    const declarations = [family + '/z', family, family + '/index'].map(spec => `declare module '${spec}' {\n  export function ping(): void;\n}\n`).join('\n')
    const blocks = parseIndexDTS(declarations)
    return renderGeneratedPage('unused', family, Object.keys(blocks), blocks)
  })
  assert.equal(sha256(rendered.join('')), fixture.runtimeSHA256)
})
test('Silk editorial transformations and fence protection match the Python oracle', () => {
  for (const [index, entry] of fixture.cases.entries()) {
    const sanitize = entry.kind === 'wiki' ? sanitizeWikiMarkdown : sanitizeDocsMarkdown
    let actual = preserveFences(entry.input, body => sanitize(entry.rel, body))
    actual = preserveFences(actual, body => normalizeTrailingNewlines(normalizeHeadingsForContext(entry.path, normalizeUserFacingLinks(normalizeEditorialFraming(body)))))
    assert.equal(actual, entry.expected, `fixture ${index}: ${entry.rel}`)
  }
})
test('curated reference markers preserve surrounding prose and are idempotent', async () => temporary(async root => {
  const path = join(root, 'application.md')
  for (const entry of fixture.curated) {
    await writeFile(path, entry.input)
    const blocks = parseIndexDTS(entry.declarations)
    assert.equal(await updateCuratedPage(path, 'oro:application', Object.keys(blocks), blocks), true)
    assert.equal(await readFile(path, 'utf8'), entry.expected)
    // The original normalizes the gap before a newly appended See also on its second pass.
    await updateCuratedPage(path, 'oro:application', Object.keys(blocks), blocks)
    assert.equal(await readFile(path, 'utf8'), entry.secondExpected)
    const before = (await stat(path)).mtimeMs
    assert.equal(await updateCuratedPage(path, 'oro:application', Object.keys(blocks), blocks), false)
    assert.equal((await stat(path)).mtimeMs, before)
  }
}))
test('Silk ownership, exclusions, pruning, raw txt copying, and postprocessing', async () => temporary(async root => {
  const src = join(root, 'upstream'), dst = join(root, 'staged')
  for (const base of [src, dst]) for (const name of ['guides', 'language', 'wiki']) await mkdir(join(base, name), { recursive: true })
  const authored = '# Custom guide\n\nWorks today: a deliberately authored phrase.\n'
  for (const name of ['guides/custom.md', 'start.md']) {
    await writeFile(join(src, name), 'upstream')
    await writeFile(join(dst, name), authored)
  }
  await writeFile(join(src, 'language/new.md'), '# New\n\nWorks today: prose\n\n```silk\n// Works today: {{ literal }}  \n```\n')
  await writeFile(join(src, 'language/raw.txt'), Buffer.from('raw\r\nbytes\u0000'))
  await writeFile(join(src, 'wiki/reference.md'), 'wiki')
  await writeFile(join(src, 'STATUS.md'), 'private tracker')
  await writeFile(join(src, 'ignored.bin'), 'ignored')
  await writeFile(join(dst, 'language/removed.md'), 'removed')
  await writeFile(join(dst, 'STATUS.md'), 'stale tracker')
  await writeFile(join(dst, 'guides/PLAN.md'), 'excluded even under an owned prefix')
  const ownership = { keepFiles: KEEP_DOCS_FILES, keepPrefixes: [...KEEP_DOCS_PREFIXES, 'wiki/'] }
  assert.deepEqual(await syncTree(src, dst, { ...ownership, sanitize: (rel, text) => preserveFences(text, body => sanitizeDocsMarkdown(rel, body)) }), { copied: 2, skipped: 4, deleted: 3 })
  await postprocessTree(dst, ownership)
  for (const name of ['guides/custom.md', 'start.md']) assert.equal(await readFile(join(dst, name), 'utf8'), authored)
  for (const name of ['language/removed.md', 'STATUS.md', 'guides/PLAN.md', 'wiki/reference.md', 'ignored.bin']) await assert.rejects(stat(join(dst, name)), { code: 'ENOENT' })
  assert.deepEqual(await readFile(join(dst, 'language/raw.txt')), await readFile(join(src, 'language/raw.txt')))
  assert.match(await readFile(join(dst, 'language/new.md'), 'utf8'), /\/\/ Works today: \{\{ literal \}\}  \n/)
}))
test('complete staged Silk tree and counters match the Python oracle', async () => temporary(async root => {
  const src = join(root, 'upstream'), dst = join(root, 'staged')
  for (const [base, entries] of [[src, fixture.tree.source], [dst, fixture.tree.staged]] as const) {
    for (const [rel, body] of Object.entries(entries)) {
      const path = join(base, rel)
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, body)
    }
  }
  assert.deepEqual(await syncTree(src, dst, {
    keepFiles: KEEP_DOCS_FILES, keepPrefixes: [...KEEP_DOCS_PREFIXES, 'wiki/'],
    sanitize: (rel, text) => preserveFences(text, body => sanitizeDocsMarkdown(rel, body)),
  }), fixture.tree.stats)
  await postprocessTree(dst, { keepFiles: KEEP_DOCS_FILES, keepPrefixes: KEEP_DOCS_PREFIXES })
  const actual: Record<string, string> = {}
  for (const path of await files(dst)) actual[relative(dst, path)] = await readFile(path, 'utf8')
  assert.deepEqual(actual, fixture.tree.expected)
}))
test('fence placeholders cannot collide with authored text; mismatched and unclosed fences stay exact', () => {
  const fence = '````silk\nWorks today: {{ value }}  \n```\n~~~~\n`````\n'
  const text = 'OROFENCE0END\n\nWorks today: prose\n\n' + fence
  assert.equal(preserveFences(text, body => body.replaceAll('Works today', 'Supported')), text.replace('Works today: prose', 'Supported: prose'))
  const unclosed = '  ~~~~silk\nWorks today: literal  '
  assert.equal(preserveFences(unclosed, body => body.trimEnd() + '\n'), unclosed)
})
test('declaration parsing retains duplicate-last behavior, nesting, whitespace, and errors', () => {
  assert.throws(() => parseIndexDTS('not a declaration'), /No `declare module/)
  assert.throws(() => renderGeneratedPage('', 'oro:unknown', [], {}), /Missing generated examples/)
  const text = "declare module 'oro:x' {\r\n  export interface X {\r\n    nested: string;  \r\n  }\r\n}\r\ndeclare module \"oro:x\" {\r\n  export const last: true;  \r\n}\r\n"
  assert.equal(parseIndexDTS(text)['oro:x'].block, 'declare module "oro:x" {\n  export const last: true;\n}\n')
  assert.deepEqual(splitLines('a\n\n'), ['a', ''])
  assert.deepEqual(splitLines('a\r\n'), ['a'])
  assert.deepEqual(splitLines('a\u0085b\u2028c\v'), ['a', 'b', 'c'])
})
test('Silk CLI resolves repo-root and gives silk-repo precedence', async () => temporary(async root => {
  await assert.rejects(silkMain(['--repo-root', root]), { message: `Missing source docs at ${join(root, 'silk/docs')}` })
  await assert.rejects(silkMain(['--repo-root', root, '--silk-repo', join(root, 'explicit')]), { message: `Missing source docs at ${join(root, 'explicit/docs')}` })
}))
test('manual CLI entry points expose preserved flags without running imports', () => {
  for (const [path, flag] of [['runtime/tools/generate-js-api-reference.ts', '--runtime-repo'], ['silk/tools/sync-from-silk-docs.ts', '--silk-repo']]) {
    const help = execFileSync(process.execPath, [path, '--help'], { encoding: 'utf8' })
    assert.ok(help.includes(flag))
    assert.equal(spawnSync(process.execPath, [path, '--unknown']).status, 2)
    assert.equal(spawnSync(process.execPath, [path, flag]).status, 2)
  }
})
