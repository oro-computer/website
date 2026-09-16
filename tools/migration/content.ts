import MarkdownIt from 'markdown-it'
import { sanitizeMarkdown, sanitizeSpecMarkdown } from './public-copy.ts'
import { canonicalLink } from '../../src/lib/urls.ts'
import { collections, type Collection } from '../../src/lib/collections.ts'
const parser = new MarkdownIt({ html: true })
export function publicContent(
  text: string,
  collection: Collection,
  sourcePath: string,
): string {
  // Shield whole fences (including longer and tilde fences) from prose normalization.
  const fences: string[] = []
  const lines = text.split('\n')
  const offsets = [0]
  for (const line of lines)
    offsets.push(offsets[offsets.length - 1] + line.length + 1)
  let protectedText = text
  const blocks = parser
    .parse(text, {})
    .filter((t) => (t.type === 'fence' || t.type === 'code_block') && t.map)
    .reverse()
  for (const token of blocks) {
    const [start, end] = token.map!
    fences.push(text.slice(offsets[start], offsets[end]))
    protectedText =
      protectedText.slice(0, offsets[start]) +
      `OROFENCE${fences.length - 1}END\n` +
      protectedText.slice(offsets[end])
  }

  protectedText =
    sourcePath === 'spec/2026.md'
      ? sanitizeSpecMarkdown(protectedText)
      : sanitizeMarkdown(protectedText, {
          currentFile: sourcePath,
          kind: collection === 'silkWiki' ? 'wiki' : 'docs',
        })
  // Only rewrite link destinations outside code; inline API examples remain literal.
  protectedText = protectedText.replace(
    /(\]\()([^\s)]+)(?=[\s)])/g,
    (_m, lead, href) =>
      lead + canonicalLink(href, collections[collection].base, sourcePath),
  )
  protectedText = protectedText.replace(
    /(\b(?:href|src)=["'])([^"']+)(["'])/g,
    (_m, lead, href, end) =>
      lead +
      canonicalLink(href, collections[collection].base, sourcePath) +
      end,
  )
  return (
    protectedText
      .replace(/OROFENCE(\d+)END/g, (_m, n) =>
        fences[Number(n)].replace(/\n$/, ''),
      )
      .trimEnd() + '\n'
  )
}
export function description(text: string): string {
  const tokens = parser.parse(text, {})
  for (let i = 0; i < tokens.length; i++) {
    if (
      tokens[i].type === 'paragraph_open' &&
      tokens[i + 1]?.type === 'inline'
    ) {
      return (
        tokens[i + 1].children
          ?.map((t) => (t.type === 'softbreak' ? ' ' : t.content))
          .join('')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 200) || ''
      )
    }
  }
  return ''
}

/** Read visible heading text, including linked/code-formatted API names. */
export function title(text: string): string {
  const tokens = parser.parse(text, {})
  const index = tokens.findIndex(
    (t) => t.type === 'heading_open' && t.tag === 'h1',
  )
  if (index < 0) return ''
  return (tokens[index + 1].children || [])
    .map((t) =>
      t.type === 'softbreak' ? ' ' : t.type === 'html_inline' ? '' : t.content,
    )
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}
