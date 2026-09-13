import MarkdownIt from 'markdown-it'
import { canonicalLink } from '../../src/lib/urls.ts'
import {
  collections,
  docUrl,
  type Collection,
} from '../../src/lib/collections.ts'
export interface Reference {
  collection: Collection
  id: string
  title: string
}
const parser = new MarkdownIt({ html: true })
/** Materialize the legacy viewer's inline reference links in public Markdown. */
export function linkReferences(
  text: string,
  collection: Collection,
  sourcePath: string,
  catalog: Reference[],
): string {
  const config = collections[collection]
  const local = catalog.filter(
    (r) => collections[r.collection].product === config.product,
  )
  const urls = new Set(local.map((r) => docUrl(r.collection, r.id)))
  const codeLines = new Set<number>()
  for (const token of parser.parse(text, {}))
    if ((token.type === 'fence' || token.type === 'code_block') && token.map) {
      for (let i = token.map[0]; i < token.map[1]; i++) codeLines.add(i)
    }
  return text
    .split('\n')
    .map((line, i) => {
      if (codeLines.has(i)) return line
      return line.replace(
        /\[[^\n]*?\]\([^)]*\)|<a\b[^>]*>[\s\S]*?<\/a>|(?<!`)`([^`\n]+)`(?!`)/g,
        (match, code: string | undefined) => {
          if (!code) return match
          let target: string | undefined
          if (/^std::/.test(code) && config.product === 'silk') {
            const parts = code.split('::')
            while (parts.length >= 2) {
              const ref = local.find(
                (r) =>
                  r.collection === 'silk' &&
                  r.title.replace(/`/g, '') === parts.join('::'),
              )
              if (ref) {
                target = docUrl(ref.collection, ref.id)
                break
              }
              parts.pop()
            }
          }
          const repoPath =
            config.product === 'runtime'
              ? /^(api|schemas|src\/cli|src\/runtime|include)(\/|$)/.test(code)
              : /^(src|tests|examples|include|vendor|c-tests|std)(\/|$)/.test(
                  code,
                ) || /^build\.zig(?:\.zon)?$/.test(code)
          if (!target && repoPath && !/\s|\.\./.test(code))
            target = `https://github.com/${config.repo}/${/\.[a-z0-9]+$/i.test(code) ? 'blob' : 'tree'}/master/${code}`
          if (
            !target &&
            (/\.(md|txt)$/.test(code) || /^(?:(?:docs|wiki)\/)?\?p=/.test(code))
          ) {
            const candidate = canonicalLink(code, config.base, sourcePath)
            if (urls.has(candidate.split('#')[0])) target = candidate
          }
          if (!target) {
            const matches = local.filter(
              (r) => r.title.replace(/`/g, '') === code,
            )
            if (matches.length === 1)
              target = docUrl(matches[0].collection, matches[0].id)
          }
          return target ? `[${match}](${target})` : match
        },
      )
    })
    .join('\n')
}
