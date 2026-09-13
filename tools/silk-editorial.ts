import { basename, dirname } from 'node:path'
import { splitLines } from './source-pages.ts'
import { normalize_region_identifiers, normalize_editorial_framing } from './silk-ingestion-data.ts'

// These ordered substitutions are the existing public-copy policy, not a new editorial pass.
function replacements(text: string, pairs: string[][], flags = 'g'): string {
  for (const [pattern, replacement] of pairs) text = text.replace(new RegExp(pattern, flags), () => replacement)
  return text
}
function mapLines(text: string, transform: (line: string) => string): string {
  let inCode = false
  return splitLines(text).map(raw => {
    if (/^\s*(```|~~~)/.test(raw)) { inCode = !inCode; return raw.trimEnd() }
    return inCode ? raw.trimEnd() : transform(raw)
  }).join('\n') + (text.endsWith('\n') ? '\n' : '')
}
export function normalizeRegionIdentifiers(text: string): string { return replacements(text, normalize_region_identifiers) }
export function normalizeSharedMarkdown(text: string): string {
  for (const [from, to] of [
    ['https://oro.computer/silk/docs/?p=', '?p='], ['https://oro.computer/silk/wiki/?p=', 'wiki/?p='],
    ['?p=docs/', '?p='], ['docs/?p=', '?p='], ['?p=wiki/', 'wiki/?p='],
  ]) text = text.replaceAll(from, to)
  text = text.replace(/^(\s*\/\/\s*)Works today\b/gm, '$1Supported')
    .replace(/^(\s*#{2,6}\s+)Syntax\s+\(Selected\)\s*$/gm, '$1Syntax')
    .replace(/^(\s*#{2,6}\s+)(Example|Examples)\s+\(Works today\)(?::\s*(.+))?\s*$/gm, (_, p, label, detail) => p + label + (detail ? ': ' + detail : ''))
    .replace(/^(\s*#{2,6}\s+)Works today(?::\s*(.+))?\s*$/gm, (_, p, detail) => p + 'Example' + (detail ? ': ' + detail : ''))
    .replace(/^(\s*#{2,6}\s+)What works today(?:\s*\([^)]*\))?\s*$/gm, '$1Current subset')
    .replace(/^Works today\b/gm, 'Current subset')
    .replaceAll('examples labeled “Works today”', 'examples labeled “Example”')
  return normalizeRegionIdentifiers(text)
}
function linkLabel(target: string): string { return target.split('/').at(-1)!.replaceAll('-', ' ').replaceAll('_', ' ') }
function docLinkTarget(target: string): string | undefined {
  target = target.replace(/\.md$/, '')
  for (const prefix of ['docs/', 'wiki/']) if (target.startsWith(prefix)) target = target.slice(prefix.length)
  target = ({ 'language/README': 'start', 'usage/README': 'start', 'usage/tutorials/README': 'start', 'std/runtime-event-loop': 'std/runtime' } as Record<string, string>)[target] ?? target
  return ['std/foo', 'std/foo-bar', 'man/my-app.7'].includes(target) ? undefined : target
}
export function normalizeUserFacingLinks(text: string): string {
  return mapLines(text, raw => {
    let line = raw.trimEnd().replace(/`?\?p=\.\.\.`?/g, 'docs links')
      .replace(/`\?p=([a-zA-Z0-9_./-]+)`/g, (_, target) => `[${linkLabel(target)}](?p=${target})`)
    line = line.replace(/(^|[\s:;,(])(?<!\]\()(?<!\/)\?p=([a-zA-Z0-9_./-]+)/g, (match, prefix, target) => {
      const dest = docLinkTarget(target)
      return dest === undefined ? match : `${prefix}[${linkLabel(dest)}](?p=${dest})`
    })
    line = line.replace(/(^|[\s:;,(])(?<!\[)`([A-Za-z0-9_:+.-]+)`\s+\(([137])\)/g, (_, prefix, name: string, section) =>
      `${prefix}[\`${name}(${section})\`](?p=${name.startsWith('std::') ? name.replaceAll('::', '/') : `man/${name}.${section}`})`)
    line = line.replace(/\[`?docs\/([a-zA-Z0-9_./-]+\.md)`?\]\([^)]+\)/g, (match, target) => {
      const dest = docLinkTarget(target)
      return dest === undefined ? match : `[${linkLabel(dest)}](?p=${dest})`
    })
    return line.replace(/(^|[\s:;,(])`?docs\/([a-zA-Z0-9_./-]+\.md)`?/g, (match, prefix, target) => {
      const dest = docLinkTarget(target)
      return dest === undefined ? match : `${prefix}[${linkLabel(dest)}](?p=${dest})`
    })
  })
}
export function normalizeEditorialFraming(text: string): string {
  return mapLines(text, raw => {
    let line = raw
    const heading = /^(\s*#{1,6}\s+)(.+?)\s*$/.exec(line)
    if (heading) {
      let title = heading[2].trim()
        .replace(/\s+\((?:Initial\s+)?(?:Current\s+)?(?:Implemented|supported|compiler|initial|selected|planned|current|implementation status)[^)]*\)/gi, '')
        .replace(/\s+\(Planned[^)]*\)/gi, '')
      if (/^(?:Status(?:\s*\([^)]*\))?|Implementation Status(?:\s*\([^)]*\))?|Status and Future Work|Future Work|Follow-ups)$/i.test(title)) title = 'Notes'
      else if (/^Notes and Limitations$/i.test(title)) title = 'Considerations'
      else if (/^(?:Current API(?:\s*\([^)]*\))?|Implemented API|Public API|API\s*\([^)]*\)|API\s*\(current\))$/i.test(title)) title = 'Exported API'
      else if (/^(?:Current Implemented Subset|Implemented Subset|Implemented subset)$/i.test(title)) title = 'Notes'
      line = heading[1] + title.replace(/\s{2,}/g, ' ').trim()
    }
    return replacements(line, normalize_editorial_framing, 'gi').replace(/\s{2,}/g, ' ').trimEnd()
  })
}
export function normalizeTrailingNewlines(text: string): string { return text.trimEnd() + '\n' }
export function moveSectionToEnd(text: string, heading: string): string {
  const section: string[] = [], out: string[] = []
  let inCode = false, capture = false, captureLevel = 0
  for (const raw of splitLines(text)) {
    if (/^\s*(```|~~~)/.test(raw)) inCode = !inCode
    if (!inCode) {
      const m = /^(#{1,6})\s+(.+?)\s*$/.exec(raw)
      if (m) {
        if (capture && m[1].length <= captureLevel) capture = false
        if (!capture && m[2].trim().toLowerCase() === heading.toLowerCase()) { capture = true; captureLevel = m[1].length }
      }
    }
    ;(capture ? section : out).push(raw.trimEnd())
  }
  if (!section.length) return text
  while (out.length && !out.at(-1)!.trim()) out.pop()
  while (section.length && !section.at(-1)!.trim()) section.pop()
  return [...out, '', ...section].join('\n') + '\n'
}
export function normalizeHeadingsForContext(path: string, text: string): string {
  text = text.replaceAll('`docs/language/mutability.md`', 'the mutability docs')
    .replaceAll('`docs/language/literals-duration.md`', 'the duration literal docs')
    .replaceAll('?p=std/runtime-event-loop', '?p=std/runtime')
  if (path.includes('/wiki/source/')) text = text.replace(/\]\(\?p=(compiler|man|usage|guides)\//g, '](../docs/?p=$1/')
  if (basename(dirname(path)) === 'std') {
    for (const [from, to] of [
      ['API', 'Exported API'], ['High-Level API', 'Exported API'], ['Intended Surface', 'Exported API'], ['Current Surface', 'Exported API'],
      ['Current Grammar Coverage', 'Grammar coverage'], ['Goals', 'Design goals'], ['Design Goals', 'Design goals'],
      ['Important Limitations', 'Considerations'], ['Remaining Follow-Ups', 'Considerations'],
    ]) text = text.replace(new RegExp('^## ' + from + '$', 'gm'), '## ' + to)
    text = text.replace(/^## Implemented (`std::interfaces` surface)$/gm, '## $1')
      .replaceAll('current API surface', 'exported API surface').replaceAll('API surface (current):', 'API surface:')
    text = moveSectionToEnd(text, 'Design goals')
  }
  if (basename(dirname(path)) === 'language') {
    text = text.replace(/^## Goals$/gm, '## Semantics').replace(/^## Design Goals$/gm, '## Model')
      .replace(/^### Important Limitations$/gm, '### Considerations')
    if (basename(path) === 'flow-for.md') text = text.replaceAll('element.\n\n: integer range iteration', 'element.\n\nSupported forms include integer range iteration')
      .replace(/\n## Semantics\n\n- Provide a readable, structured loop construct for iteration\.\n- Avoid .+? hidden allocation\.\n\n## Surface Syntax/gs, '\n## Surface Syntax')
  }
  return text
}
export function sanitizeWikiMarkdown(_rel: string, text: string): string {
  text = normalizeSharedMarkdown(text)
  const out: string[] = []
  let inCode = false
  for (const raw of splitLines(text)) {
    if (raw.trimStart().startsWith('```')) { inCode = !inCode; out.push(raw.trimEnd()); continue }
    if (inCode) { out.push(raw.trimEnd()); continue }
    if (/^\s*[-*+]\s*(End-to-end support snapshot|Implemented-subset notes)\s*:\s*`?(STATUS|PLAN)\.md`?\s*$/i.test(raw)) continue
    let line = raw.replace(/^(\s*[-*+]\s+)Relevant fixtures:\s*/gi, '$1Fixtures: ')
      .replace(/^\s*Status:\s*implemented for the current front-end \+\s*native backend subset\.\s*$/gi, 'Implemented in the reference compiler (front-end + native backend subset).')
    for (const name of ['STATUS', 'PLAN']) line = line.replace(new RegExp('\\s+(?:and|&)\\s+`?' + name + '\\.md`?\\s*$', 'gi'), '')
      .replace(new RegExp('`?' + name + '\\.md`?', 'gi'), '')
    line = line.replace(/\s+(?:and|&)\s*$/gi, '')
    const leading = /^\s*/.exec(line)![0]
    line = (leading + line.slice(leading.length).replace(/[ \t]{2,}/g, ' ')).trimEnd()
    if (/^\s*[-*+]\s*[^A-Za-z0-9`]*\s*$/.test(line)) continue
    out.push(line)
  }
  return normalizeTrailingNewlines(normalizeUserFacingLinks(normalizeEditorialFraming(out.join('\n') + (text.endsWith('\n') ? '\n' : ''))))
}
function dropNamedSection(text: string, heading: string): string {
  const out: string[] = []
  let inCode = false, skipLevel: number | undefined
  for (const raw of splitLines(text)) {
    if (raw.trimStart().startsWith('```')) {
      inCode = !inCode
      if (skipLevel === undefined) out.push(raw.trimEnd())
      continue
    }
    if (!inCode && skipLevel !== undefined) {
      const m = /^(#{1,6})\s+(.+?)\s*$/.exec(raw)
      if (!m || m[1].length > skipLevel) continue
      skipLevel = undefined
    }
    if (!inCode) {
      const m = /^(#{1,6})\s+(.+?)\s*$/.exec(raw)
      if (m && m[2].trim().toLowerCase() === heading.trim().toLowerCase()) { skipLevel = m[1].length; continue }
    }
    if (skipLevel === undefined) out.push(raw.trimEnd())
  }
  return out.join('\n') + (text.endsWith('\n') ? '\n' : '')
}
export function sanitizeDocsMarkdown(rel: string, text: string): string {
  text = normalizeSharedMarkdown(text).replaceAll('`STATUS.md`', '[implementation status](?p=compiler/implementation-status)')
    .replaceAll('[implementation status](?p=compiler/implementation-status) (implementation status)', '[implementation status](?p=compiler/implementation-status)')
    .replace(/\s*\(tracked[^)]*`PLAN\.md`\)/gi, '')
  text = dropNamedSection(dropNamedSection(text, 'Arenas'), 'Tests')
  if (rel.startsWith('std/')) text = text.replace(/^Status:\s*\*\*[^*]+\*\*\.\s*/gm, '').replace(/^Status:\s*\*\*[^*]+\*\*\.\s*$/gm, '')
    .replace(/^##\s+Current API\s*$/gm, '## Exported API').replace(/^##\s+Implemented API\s*$/gm, '## Exported API').replace(/^##\s+Public API\s*$/gm, '## Exported API')
    .replace(/^##\s+(Future Work|Future work|Follow-ups|Current Limitations|Notes and Limitations)\s*$/gm, '## Considerations')
    .replace(/^##\s+Current Scope\s*$/gm, '## Considerations')
    .replace(/^##\s+(.+?)\s+\((?:Initial Design|MVP|Current)\)\s*$/gm, '## $1')
    .replace(/active expansion/gi, 'current module surface').replace(/current snapshot/gi, 'current implementation')
    .replace(/Partially implemented/gi, 'Implemented').replace(/initial std wrapper/gi, 'stdlib wrapper').replace(/\bMVP\b/g, 'baseline')
  if (rel === 'spec/2026.md') text = dropNamedSection(text, 'Silk Proposal Process (TC39-Inspired)')
    .replaceAll('// Works today', '// Supported').replaceAll('checker.checkModuleSetWithImports', 'the module-set import helper')
    .replace(/CLI output:\s*`+silk` CLI`?\s+and\s+`+silk`\s+\(1\)\s+—\s+Silk Language Compiler`?\s+\(`silk --version`\)/g,
      'CLI output: the `silk` CLI and [`silk(1)`](?p=man/silk.1) (`silk --version`)')
  if (rel === 'compiler/vendored-deps.md') text = text.replace('# Built-In Dependencies\n', '# Built-In Dependencies (Legacy Link)\n')
  const out: string[] = []
  let inCode = false
  for (const raw of splitLines(text)) {
    if (raw.trimStart().startsWith('```')) { inCode = !inCode; out.push(raw.trimEnd()); continue }
    if (inCode) { out.push(raw.trimEnd()); continue }
    const parts = raw.split('`')
    for (let i = 0; i < parts.length; i += 2) parts[i] = parts[i]
      .replace(/\bThe repository\b/g, 'The Silk compiler repository').replace(/\bthe repository\b/g, 'the Silk compiler repository')
      .replace(/\bThis repository\b/g, 'The Silk compiler repository').replace(/\bthis repository\b/g, 'the Silk compiler repository')
      .replace(/\brepo dependency workflow\b/gi, 'Silk compiler repository’s vendored dependency workflow')
      .replace(/\bwhat works today\b/gi, 'current implementation notes')
    out.push(parts.join('`').trimEnd())
  }
  return normalizeTrailingNewlines(normalizeUserFacingLinks(normalizeEditorialFraming(out.join('\n') + (text.endsWith('\n') ? '\n' : ''))))
}
