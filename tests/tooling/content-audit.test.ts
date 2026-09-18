import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { test } from 'node:test'
import { auditContext, runContentAudit } from '../../tools/audit-content.ts'
import { buildSourceInventory, runSiteAudit } from '../../tools/audits/common.ts'
import type { AuditContext, Reporter } from '../../tools/audits/common.ts'
import { runRuntimeAudit } from '../../tools/audits/runtime.ts'
import { runSilkAudit, runStdlibAudit } from '../../tools/audits/silk.ts'

const siteRoot = resolve(import.meta.dirname, '../..')
const cases = ['missing', 'clean', 'common', 'silk', 'stdlib', 'runtime', 'cap'] as const
for (const name of cases) test(`Content audit regression: ${name}`, () => {
  const root = mkdtempSync(join(siteRoot, '.audit-fixture-'))
  const context: AuditContext = { siteRoot: root, outputRoot: join(root, 'output'), runtimeRepo: join(root, 'output/upstream') }
  const put = (path: string, text: string): void => {
    mkdirSync(dirname(join(context.outputRoot, path)), { recursive: true })
    writeFileSync(join(context.outputRoot, path), text)
  }
  const page = (collection: string, sourcePath: string, route = `${collection}/${sourcePath}`): void => {
    const path = join(root, 'src', route, 'page.md')
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, `---\ndocsCollection: ${collection}\nsourcePath: ${sourcePath}\n---\n# Source\n`)
  }
  try {
    for (const product of ['runtime', 'silk', 'sage', 'slg', 'virtnosis']) page(product, 'start.md')
    if (name !== 'missing') {
      for (const product of ['runtime', 'silk', 'sage', 'slg', 'virtnosis']) {
        put(`${product}/docs/source/start.md`, '# Start\n')
      }
      for (const path of ['index.html', 'runtime/index.html', 'runtime/docs/index.html']) put(path, '')
    }
    if (name === 'common') {
      page('sage', 'lost.md')
      put('sage/docs/source/start.md', '# Heading ?p=heading\n```\n?p=fenced\n## Status\n~~~\nRaw ?p=missing and `open` (3)\n[ok](?p=start) [bad](wiki/?p=nope)\n[missing](docs/absent.md) [escape](../ignored.md)\n[absolute](/absent.txt) [remote](https://example.org/no.md)\n## Status (details)\n## API (initial surface)\n## Thing (Planned soon)\nStatus: **yes**\nInitial implementation\n## Current API\n## Future Work\n## Current APİ\n\u001c## Status\n\ufeff## Status\néinitial implementationé\n');
    }
    if (name === 'silk') {
      page('silkWiki', 'wiki.md')
      page('silk', 'spec/2026.md', 'silk/spec/2026')
      put('silk/docs/source/start.md', '[wiki](wiki/?p=lost) [spec](spec/missing.md)\n```\nconst region arena\nWorks today\n```\nRaw ?p=oops `foo` (1)\n## Status\n')
      put('silk/wiki/source/wiki.md', 'from arena\nSyntax (Selected)\n## Current API\n[docs](docs/missing.txt)\n')
      put('silk/docs/source/spec/2026.md', 'checker.foo src/example c-tests/ tests/silk/')
    }
    if (name === 'stdlib') put('silk/docs/source/std/a.md', 'active expansion; current snapshot; Partially implemented; initial std wrapper; expansion path; MVP\n## Examples\n## Description\n## API\n## Design Goals\n## Scope (Current)\n## Initial Design MVP\n```\n## Current Scope\n```\n## Examples\n')
    if (name === 'runtime') {
      put('runtime/docs/source/javascript/module-index.md', 'console.log(Object.keys(api))')
      put('runtime/docs/source/javascript/foo.md', '## Example\n')
      put('runtime/docs/source/javascript/node.md', '## Examples\n')
      put('runtime/docs/source/javascript/all-modules.md', 'oro:node alone; oro:internal/*; oro:fs')
      put('upstream/api/index.d.ts', 'declare module "oro:fs" {}\ndeclare module "oro:fs/promises" {}\ndeclare module "oro:new" {}\ndeclare module "oro:node" {}\n')
      put('upstream/api/CLI.md', '## oroc\n## oroc update-init\n## oroc unknown\n')
      put('index.html', 'oro-computer/oro-runtime oro-computer/legacy-runtime')
    }
    if (name === 'cap') put('sage/docs/source/start.md', Array.from({ length: 205 }, (_, i) => `[x](?p=missing${i})`).join('\n'))
    const runners: Record<string, (ctx: AuditContext, reporter: Reporter) => number> = {
      missing: runContentAudit, clean: runContentAudit, common: (ctx, reporter) => runSiteAudit(ctx, 'sage', reporter),
      silk: runSilkAudit, stdlib: runStdlibAudit, runtime: runRuntimeAudit, cap: (ctx, reporter) => runSiteAudit(ctx, 'sage', reporter),
    }
    const stdout: string[] = [], stderr: string[] = []
    const status = runners[name]!(context, { log: message => stdout.push(message), error: message => stderr.push(message) })
    assert.equal(status, name === 'clean' ? 0 : 1)
    if (name === 'clean') {
      assert.deepEqual(stdout, [
        'OK: runtime site audit passed', 'OK: runtime docs audit passed', 'OK: silk site audit passed',
        'Stdlib doc audit passed.', ...['sage', 'slg', 'virtnosis'].map(product => `OK: ${product} site audit passed`),
      ])
      assert.deepEqual(stderr, [])
    } else if (name === 'cap') {
      assert.deepEqual(stdout, [])
      assert.equal(stderr.length, 202)
      assert.deepEqual(stderr.slice(0, 200).map(message => /Broken \?p= link: missing(\d+)$/.exec(message)?.[1]),
        Array.from({ length: 200 }, (_, i) => String(i)))
      assert.deepEqual(stderr.slice(200), ['... and 5 more', 'FAIL: 205 issues'])
    } else {
      // Count every detection category without snapshotting wording or traversal order.
      const expected: Record<string, [RegExp, number][]> = {
        missing: [[/runtime\/docs\/source\/start.md: Missing raw output/, 1]],
        common: [
          [/lost.md: Missing raw output/, 1], [/Broken \?p= link: (heading|fenced|missing|nope)$/, 4],
          [/Missing link target: (docs\/absent.md|\/absent.txt) ->/, 2],
          [/Line 6: raw \?p= reference/, 1], [/Line 6: raw manpage reference/, 1],
          [/Line (10|11|12|13|14|15|16|17|19): avoid status-style/, 9],
        ],
        silk: [
          [/Broken \?p= link: (wiki\/lost|docs\/oops)$/, 2],
          [/Missing link target: (spec\/missing.md|docs\/missing.txt) -> silk\/docs\/source\//, 2],
          [/Found arena identifier/, 2], [/Found deprecated/, 2],
          [/Line 6: raw \?p= reference/, 1], [/Line 6: raw manpage reference/, 1],
          [/Line (3|7): avoid status-style/, 2], [/spec\/2026.md: Spec contains repo-internal/, 1],
        ],
        stdlib: [
          [/Status\/body uses banned transitional wording:/, 6],
          [/Banned heading: (API|Design Goals)$/, 2],
          [/Banned heading pattern: Initial Design MVP$/, 2], [/Banned heading pattern: Current Scope$/, 1],
        ],
        runtime: [
          [/module-index.md: remove this page/, 1], [/module-index.md: remove generic Object.keys/, 1],
          [/module-index.md: missing an Examples section/, 1],
          [/missing docs page for published module family oro:(fs|new)\.$/, 2],
          [/excluded private module family oro:node should not have a public docs page/, 1],
          [/excluded private module family oro:internal should not appear in the public module listing/, 1],
          [/missing published module specifier oro:(fs\/promises|new)\.$/, 2],
          [/cli\/(oroc|update\/init).md: missing website docs page for upstream CLI section/, 2],
          [/index.html: stale runtime repository reference/, 3],
        ],
      }
      const findings = name === 'stdlib' ? stdout : stderr.slice(0, -1)
      for (const [pattern, count] of expected[name]!) {
        assert.equal(findings.filter(message => pattern.test(message)).length, count, String(pattern))
      }
      assert.equal(findings.length, expected[name]!.reduce((sum, [, count]) => sum + count, 0))
      if (name === 'stdlib') assert.deepEqual(stderr, [])
      else {
        assert.deepEqual(stdout, name === 'runtime' ? ['OK: runtime site audit passed'] : [])
        assert.equal(stderr.at(-1), `FAIL: ${findings.length} ${name === 'runtime' ? 'runtime docs issues' : 'issues'}`)
      }
    }
  } finally { rmSync(root, { recursive: true, force: true }) }
})
test('source inventory includes dedicated spec routes and txt outputs without public indexes', () => {
  const root = mkdtempSync(join(siteRoot, '.audit-fixture-'))
  const context: AuditContext = { siteRoot: root, outputRoot: join(root, 'custom-output') }
  const put = (path: string, text: string): void => {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), text)
  }
  const messages: string[] = []
  const reporter: Reporter = { log: () => {}, error: message => messages.push(message) }
  try {
    put('src/silk/spec/2026/page.md', '---\ndocsCollection: silk\nsourcePath: spec/2026.md\n---\n')
    put('src/silk/docs/reference/page.md', '---\ndocsCollection: silk\nsourcePath: reference.txt\n---\n')
    put('src/silk/wiki/start/page.md', '---\ndocsCollection: silkWiki\nsourcePath: start.md\n---\n')
    put('src/unrelated/page.md', '---\ntitle: Not documentation\n---\n')
    assert.deepEqual(buildSourceInventory(root).silk.map(item => item.file).sort(), ['reference.txt', 'spec/2026.md'])
    put('custom-output/silk/docs/source/spec/2026.md', '[text](?p=reference) [spec](?p=spec/2026) [wiki](wiki/?p=start)\n')
    put('custom-output/silk/wiki/source/start.md', '[spec](docs/?p=spec/2026)\n')
    assert.equal(runSilkAudit(context, reporter), 1)
    assert.deepEqual(messages, ['silk/docs/source/reference.txt: Missing raw output for source page; run build scripts first.', 'FAIL: 1 issues'])
    messages.length = 0
    put('custom-output/silk/docs/source/reference.txt', 'Reference\n')
    assert.equal(runSilkAudit(context, reporter), 0)
    // A later run on the same context must observe changed source metadata.
    put('src/silk/docs/new/page.md', '---\ndocsCollection: silk\nsourcePath: new.txt\n---\n')
    assert.equal(runSilkAudit(context, reporter), 1)
    assert.deepEqual(messages, ['silk/docs/source/new.txt: Missing raw output for source page; run build scripts first.', 'FAIL: 1 issues'])
    messages.length = 0
    put('custom-output/silk/docs/source/new.txt', 'New\n')
    rmSync(join(root, 'custom-output/silk/docs/source/spec/2026.md'))
    assert.equal(runSilkAudit(context, reporter), 1)
    assert.deepEqual(messages, ['silk/docs/source/spec/2026.md: Missing raw output for source page; run build scripts first.', 'FAIL: 1 issues'])
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('audit environment paths', () => {
  assert.equal(auditContext({}).outputRoot, join(siteRoot, 'public'))
  assert.equal(auditContext({}).runtimeRepo, undefined)
  assert.equal(auditContext({ ORO_SITE_OUTPUT: 'other', ORO_RUNTIME_REPO: 'runtime-repo' }).outputRoot, resolve('other'))
  assert.equal(auditContext({ ORO_RUNTIME_REPO: 'runtime-repo' }).runtimeRepo, resolve('runtime-repo'))
})
