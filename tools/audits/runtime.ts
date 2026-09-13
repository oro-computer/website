import { existsSync } from 'node:fs'
import { collectionConfig, markdownFiles, pathJoin, pattern, read, reportIssues, runSiteAudit } from './common.ts'
import type { AuditContext, Issue, Reporter } from './common.ts'

const curated = new Map(['ai', 'application', 'extension', 'fs', 'hooks', 'mcp', 'notification', 'secure-storage', 'window'].map(name => [`oro:${name}`, `${name}.md`]))
const excluded = new Set(['oro:bootstrap', 'oro:external', 'oro:internal', 'oro:node', 'oro:node-esm-loader'])
const cliDocs: Record<string, string> = Object.fromEntries([
  ['oroc', 'oroc'], ...['help', 'update', 'build', 'run', 'list-devices', 'env', 'mcp', 'init', 'install-app', 'print-build-dir', 'setup', 'config', 'versions', 'version'].map(name => [`oroc ${name}`, name]),
  ...['init', 'server', 'info', 'keygen', 'sign', 'verify', 'validate', 'bundle', 'extract'].map(name => [`oroc update-${name}`, `update/${name}`]),
].map(([section, path]) => [section, `cli/${path}.md`]))

export function runtimeIssues(context: AuditContext): Issue[] {
  const issues: Issue[] = []
  const docs = collectionConfig(context, 'runtime').source
  const javascript = pathJoin(docs, 'javascript')
  const add = (path: string, message: string): void => { issues.push({ path, message }) }
  const moduleIndex = pathJoin(javascript, 'module-index.md')
  if (existsSync(moduleIndex)) add(moduleIndex, 'remove this page; link JavaScript API entry points to javascript/overview.')
  for (const path of markdownFiles(javascript, false).sort()) {
    const text = read(path)
    const name = path.slice(path.lastIndexOf('/') + 1)
    if (text.includes('console.log(Object.keys(api))')) add(path, 'remove generic Object.keys(api) examples; document a real usage flow instead.')
    if (!['overview.md', 'all-modules.md', ...curated.values()].includes(name) && !pattern('^\\s*##\\s+.*examples?\\b', 'im').test(text)) add(path, 'missing an Examples section.')
  }
  const index = context.runtimeRepo === undefined ? undefined : pathJoin(context.runtimeRepo, 'api/index.d.ts')
  const specifiers = new Set(index && existsSync(index) ? [...read(index).matchAll(/^declare module ['"](oro:[^'"]+)['"]/gm)].map(match => match[1]!) : [])
  const families = new Set([...specifiers].map(spec => spec.split('/')[0]!))
  if (families.size && specifiers.size) {
    for (const family of [...families].filter(family => !excluded.has(family)).sort()) {
      const expected = pathJoin(javascript, curated.get(family) ?? `${family.replace(/^oro:/, '')}.md`)
      if (!existsSync(expected)) add(expected, `missing docs page for published module family ${family}.`)
    }
    for (const family of [...excluded].sort()) {
      const path = pathJoin(javascript, `${family.replace(/^oro:/, '')}.md`)
      if (existsSync(path)) add(path, `excluded private module family ${family} should not have a public docs page.`)
    }
    const allModulesPath = pathJoin(javascript, 'all-modules.md')
    const allModules = read(allModulesPath)
    for (const family of [...excluded].sort()) {
      const escaped = family.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      if (new RegExp('`?' + escaped + '(?:/\\*|/[A-Za-z0-9._-]+(?:/[A-Za-z0-9._-]+)*)`?').test(allModules)) add(allModulesPath, `excluded private module family ${family} should not appear in the public module listing.`)
    }
    for (const spec of [...specifiers].filter(spec => !excluded.has(spec.split('/')[0]!)).sort()) {
      if (!allModules.includes(spec)) add(allModulesPath, `missing published module specifier ${spec}.`)
    }
  }
  const cli = context.runtimeRepo === undefined ? undefined : pathJoin(context.runtimeRepo, 'api/CLI.md')
  const sections = new Set(cli && existsSync(cli) ? [...read(cli).matchAll(pattern('^##\\s+([^\\n]+)$', 'gm'))].map(match => match[1]!) : [])
  if (sections.size) for (const section of Object.keys(cliDocs).sort()) {
    const path = pathJoin(docs, cliDocs[section]!)
    if (sections.has(section) && !existsSync(path)) add(path, `missing website docs page for upstream CLI section \`${section}\`.`)
  }
  const stalePatterns = [/oro-computer\/oro-runtime/, /oro-computer\/legacy-runtime/, pattern('\\blegacy-runtime\\b')]
  for (const rel of ['index.html', 'runtime/index.html', 'runtime/docs/index.html']) {
    const path = pathJoin(context.outputRoot, rel)
    const text = read(path)
    for (const expression of stalePatterns) if (expression.test(text)) add(path, 'stale runtime repository reference (deprecated runtime repository alias).')
  }
  return issues
}
export function runRuntimeAudit(context: AuditContext, reporter: Reporter = console): number {
  const rc = runSiteAudit(context, 'runtime', reporter)
  if (rc !== 0) return rc
  return reportIssues(runtimeIssues(context), context.outputRoot, 'OK: runtime docs audit passed', reporter, 'runtime docs issues')
}
