import { existsSync } from 'node:fs'
import { relative } from 'node:path'
import { checkDocLinks, checkRawOutputs, checkLines, checkPLinks, collectionConfig, lines, collectionIds, withSourceInventory, markdownFiles, pathJoin, pattern, read, reportIssues, trim } from './common.ts'
import type { AuditContext, Issue, Reporter } from './common.ts'

function checkText(source: string, expression: RegExp, message: string): Issue[] {
  return markdownFiles(source).filter(path => expression.test(read(path))).map(path => ({ path, message }))
}
export function runSilkAudit(context: AuditContext, reporter: Reporter = console): number {
  context = withSourceInventory(context)
  const configs = [collectionConfig(context, 'silk'), collectionConfig(context, 'silkWiki')]
  const docs = configs[0]!
  const wiki = configs[1]!
  const ids = { docs: collectionIds(docs), wiki: collectionIds(wiki) }
  const sources = { docs: docs.source, wiki: wiki.source, spec: pathJoin(docs.source, 'spec') }
  const issues = [
    ...configs.flatMap(checkRawOutputs),
    ...configs.flatMap(config => checkPLinks(config, ids, true)),
    ...configs.flatMap(config => checkDocLinks(config.source, context.outputRoot, sources)),
    ...configs.flatMap(config => checkText(config.source, pattern('\\bconst\\s+region\\s+arena\\b|\\bexport\\s+const\\s+region\\s+arena\\b|\\bwith\\s+arena\\b\\s*\\{|\\bfrom\\s+arena\\b|\\bglobal_arena\\b', 'i'), 'Found arena identifier in examples (use regions + neutral names).')),
    ...configs.flatMap(config => checkText(config.source, pattern('\\bWorks today\\b|\\bWhat works today\\b|\\(Works today\\)|Syntax\\s*\\(Selected\\)', 'i'), "Found deprecated 'Works today' / 'Syntax (Selected)' labeling.")),
    ...configs.flatMap(config => checkLines(config.source, 'viewer')),
    ...configs.flatMap(config => checkLines(config.source, 'manpage')),
    ...configs.flatMap(config => checkLines(config.source, 'editorial')),
  ]
  const spec = pathJoin(docs.source, 'spec/2026.md')
  if (existsSync(spec) && pattern('\\bchecker\\.[A-Za-z0-9_]+\\b|\\bsrc/[A-Za-z0-9_./-]+|\\bc-tests/|\\btests/silk/', 'i').test(read(spec))) {
    issues.push({ path: spec, message: 'Spec contains repo-internal paths/names (remove or generalize).' })
  }
  return reportIssues(issues, context.outputRoot, 'OK: silk site audit passed', reporter)
}
const order = ['Description', 'Exported API', 'Examples', 'Considerations', 'Design goals', 'See also']
const bannedHeadings = ['API', 'Current API', 'Implemented API', 'Public API', 'High-Level API', 'Intended Surface', 'Current Surface', 'Current Grammar Coverage', 'Goals', 'Design Goals', 'Future Work', 'Future work', 'Follow-ups', 'Remaining Follow-Ups', 'Important Limitations', 'Current Limitations', 'Notes and Limitations']
const headingPatterns = ['\\bInitial Design\\b', '\\bCurrent Scope\\b', '\\bScope \\(Current\\)\\b', '\\bMVP\\b'].map(source => pattern(source, 'i'))
const statusPatterns = ['active expansion', 'current snapshot', 'Partially implemented', 'initial std wrapper', 'expansion path', '\\bMVP\\b']
export function stdlibIssues(context: AuditContext): Issue[] {
  const issues: Issue[] = []
  for (const path of markdownFiles(pathJoin(collectionConfig(context, 'silk').source, 'std'), false).sort()) {
    const text = read(path)
    for (const source of statusPatterns) if (pattern(source, 'i').test(text)) issues.push({ path, message: `Status/body uses banned transitional wording: ${source}` })
    const headings = lines(text).filter(line => line.startsWith('## ')).map(line => trim(line.slice(3)))
    for (const heading of headings) {
      for (const banned of bannedHeadings) if (heading === banned) issues.push({ path, message: `Banned heading: ${heading}` })
      for (const expression of headingPatterns) if (expression.test(heading)) issues.push({ path, message: `Banned heading pattern: ${heading}` })
    }
    const positions = new Map(headings.map((heading, index) => [heading, index]))
    let last = -1
    const seen: string[] = []
    for (const heading of order) {
      const pos = positions.get(heading)
      if (pos === undefined) continue
      if (pos < last) { issues.push({ path, message: `Section order violation: ${[...seen, heading].join(' -> ')}` }); break }
      last = pos
      seen.push(heading)
    }
  }
  return issues
}
export function runStdlibAudit(context: AuditContext, reporter: Reporter = console): number {
  const issues = stdlibIssues(context)
  if (issues.length) {
    // The original stdlib audit reports workspace-relative paths on stdout, without a summary or cap.
    for (const issue of issues) {
      const rel = relative(context.siteRoot, issue.path)
      if (rel === '..' || rel.startsWith('../')) throw new Error(`${issue.path} is not in the subpath of ${context.siteRoot}`)
      reporter.log(`${rel}: ${issue.message}`)
    }
    return 1
  }
  reporter.log('Stdlib doc audit passed.')
  return 0
}
