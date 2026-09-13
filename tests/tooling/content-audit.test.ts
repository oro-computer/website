import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { test } from 'node:test'
import { auditContext, runContentAudit } from '../../tools/audit-content.ts'
import { runSiteAudit } from '../../tools/audits/common.ts'
import type { AuditContext, Reporter } from '../../tools/audits/common.ts'
import { runRuntimeAudit } from '../../tools/audits/runtime.ts'
import { runSilkAudit, runStdlibAudit } from '../../tools/audits/silk.ts'

const siteRoot = resolve(import.meta.dirname, '../..')
const cases = ['missing', 'clean', 'common', 'silk', 'stdlib', 'runtime', 'cap'] as const
const baselines = JSON.parse(readFileSync(new URL('./content-audit-baseline.json', import.meta.url), 'utf8'))
for (const name of cases) test(`Python content audit parity: ${name}`, () => {
  const root = mkdtempSync(join(siteRoot, '.audit-fixture-'))
  const context: AuditContext = { siteRoot, outputRoot: root, runtimeRepo: join(root, 'upstream') }
  const put = (path: string, text: string): void => {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), text)
  }
  try {
    if (name !== 'missing') {
      for (const product of ['runtime', 'silk', 'sage', 'slg', 'virtnosis']) {
        put(`${product}/docs/index.json`, JSON.stringify({ sections: [{ items: [{ id: 'start', file: 'start.md' }] }] }))
        put(`${product}/docs/source/start.md`, '# Start\n')
      }
      put('silk/wiki/index.json', '{"sections":[]}')
      for (const path of ['index.html', 'runtime/index.html', 'runtime/docs/index.html']) put(path, '')
    }
    if (name === 'common') {
      put('sage/docs/index.json', '{"sections":[{"items":[{"id":"start","file":"start.md"},{"id":"lost","file":"lost.md"}]}]}')
      put('sage/docs/source/start.md', '# Heading ?p=heading\n```\n?p=fenced\n## Status\n~~~\nRaw ?p=missing and `open` (3)\n[ok](?p=start) [bad](wiki/?p=nope)\n[missing](docs/absent.md) [escape](../ignored.md)\n[absolute](/absent.txt) [remote](https://example.org/no.md)\n## Status (details)\n## API (initial surface)\n## Thing (Planned soon)\nStatus: **yes**\nInitial implementation\n## Current API\n## Future Work\n## Current APİ\n\u001c## Status\n\ufeff## Status\néinitial implementationé\n');
    }
    if (name === 'silk') {
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
    const normalize = (text: string): string => text.replaceAll(root.slice(siteRoot.length + 1), '<fixture>')
    const result = { status, stdout: normalize(stdout.join('\n') + (stdout.length ? '\n' : '')), stderr: normalize(stderr.join('\n') + (stderr.length ? '\n' : '')) }
    // Captured from the original Python audits before deletion. Directory traversal
    // order is filesystem-dependent, so compare findings within each output stream.
    assert.equal(result.status, baselines[name].status)
    assert.deepEqual(result.stdout.split('\n').sort(), baselines[name].stdout.split('\n').sort())
    assert.deepEqual(result.stderr.split('\n').sort(), baselines[name].stderr.split('\n').sort())
  } finally { rmSync(root, { recursive: true, force: true }) }
})
test('audit environment paths', () => {
  assert.equal(auditContext({}).outputRoot, join(siteRoot, 'public'))
  assert.equal(auditContext({}).runtimeRepo, undefined)
  assert.equal(auditContext({ ORO_SITE_OUTPUT: 'other', ORO_RUNTIME_REPO: 'runtime-repo' }).outputRoot, resolve('other'))
  assert.equal(auditContext({ ORO_RUNTIME_REPO: 'runtime-repo' }).runtimeRepo, resolve('runtime-repo'))
})
